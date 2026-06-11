#!/usr/bin/env python3
"""Download CDN assets and rewrite HTML to use relative local paths."""
import os
import re
import urllib.parse
import urllib.request
from pathlib import Path

SITE_ROOT = Path(r"c:\users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")

CDN_PREFIXES = [
    "https://cdn.prod.website-files.com/",
    "http://cdn.prod.website-files.com/",
]

# Known external asset URLs to mirror locally
EXTRA_ASSETS = {
    "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js?site=65939d1f139e1daa37da455f": "_vendor/js/jquery-3.5.1.min.js",
    "https://d3e54v103j8qbb.cloudfront.net/js/jquery-3.5.1.min.dc5e7f18c8.js": "_vendor/js/jquery-3.5.1.min.js",
}

URL_PATTERN = re.compile(
    r'https?://(?:cdn\.prod\.website-files\.com/[^\s"\'<>)]+|d3e54v103j8qbb\.cloudfront\.net/[^\s"\'<>?)]+(?:\?[^\s"\'<>)]*)?)',
    re.IGNORECASE,
)


def normalize_url(url: str) -> str:
    """Strip query string for cloudfront jquery mapping."""
    return url.split('"')[0].split("'")[0]


def url_to_local_path(url: str) -> str:
    url_clean = url.split("?")[0]
    if url in EXTRA_ASSETS:
        return EXTRA_ASSETS[url]
    base = url_clean.split("?")[0]
    for prefix in CDN_PREFIXES:
        if base.startswith(prefix):
            return base[len(prefix) :]
    if "cloudfront.net/" in base:
        path = base.split("cloudfront.net/", 1)[1]
        return f"_vendor/{path}"
    raise ValueError(f"Unhandled URL: {url}")


def download_file(url: str, dest: Path) -> bool:
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return True
    try:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "Mozilla/5.0 (local-mirror-fix)"},
        )
        with urllib.request.urlopen(req, timeout=60) as resp:
            data = resp.read()
        dest.write_bytes(data)
        print(f"  OK  {dest.relative_to(SITE_ROOT)}")
        return True
    except Exception as e:
        print(f"  FAIL {url} -> {e}")
        return False


def relative_path(from_file: Path, to_file: Path) -> str:
    rel = os.path.relpath(to_file, from_file.parent)
    return rel.replace("\\", "/")


def collect_urls_from_text(text: str) -> set[str]:
    urls = set()
    for match in URL_PATTERN.finditer(text):
        urls.add(match.group(0))
    # Also decode URL-encoded CDN links inside templates
    for encoded in re.findall(r"https%3A%2F%2Fcdn\.prod\.website-files\.com%2F[^%\"'&]+", text, re.I):
        urls.add(urllib.parse.unquote(encoded))
    return urls


def main():
    html_files = list(SITE_ROOT.rglob("*.html"))
    all_urls: set[str] = set()

    print(f"Scanning {len(html_files)} HTML files...")
    for html in html_files:
        text = html.read_text(encoding="utf-8", errors="replace")
        all_urls.update(collect_urls_from_text(text))

    # Map each URL to local path
    url_map: dict[str, str] = {}
    for url in sorted(all_urls):
        try:
            local = url_to_local_path(url)
            url_map[url] = local
        except ValueError as e:
            print(e)

    print(f"\nDownloading {len(url_map)} unique assets...")
    failed = []
    for url, local in sorted(url_map.items(), key=lambda x: x[1]):
        dest = SITE_ROOT / local.replace("/", os.sep)
        if not download_file(url.split("?")[0] if "cloudfront" in url else url, dest):
            # retry without query for cloudfront
            base_url = url.split("?")[0]
            if not download_file(base_url, dest):
                failed.append(url)

    print(f"\nRewriting HTML files...")
    for html in html_files:
        text = html.read_text(encoding="utf-8", errors="replace")
        original = text

        # Sort URLs longest first to avoid partial replacements
        for url in sorted(url_map.keys(), key=len, reverse=True):
            local = url_map[url]
            dest = SITE_ROOT / local.replace("/", os.sep)
            rel = relative_path(html, dest)
            text = text.replace(url, rel)
            # encoded form
            enc = urllib.parse.quote(url, safe="")
            text = text.replace(enc, rel)

        # Remove preconnect to CDN (optional, keeps page clean)
        text = re.sub(
            r'<link href="(?:\.\./)*65939d1f139e1daa37da455f" rel="preconnect" crossorigin="anonymous"/>',
            "",
            text,
        )
        text = re.sub(
            r'<link href="https://cdn\.prod\.website-files\.com" rel="preconnect" crossorigin="anonymous"/>',
            "",
            text,
        )

        if text != original:
            html.write_text(text, encoding="utf-8")
            print(f"  updated {html.relative_to(SITE_ROOT)}")

    print(f"\nDone. Failed downloads: {len(failed)}")
    for u in failed[:20]:
        print(f"  - {u}")


if __name__ == "__main__":
    main()
