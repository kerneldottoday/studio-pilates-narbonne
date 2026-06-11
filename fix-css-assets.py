#!/usr/bin/env python3
import re
import urllib.request
from pathlib import Path

SITE = Path(r"c:\users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")
CSS = SITE / "65939d1f139e1daa37da455f/css/yoga-you.webflow.7d97343ae.css"


def download(url: str) -> Path | None:
    if "assets.website-files.com/" in url:
        rel = url.split("assets.website-files.com/", 1)[1]
    elif "cdn.prod.website-files.com/" in url:
        rel = url.split("cdn.prod.website-files.com/", 1)[1]
    else:
        print(f"skip {url}")
        return None

    dest = SITE / rel
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists() and dest.stat().st_size > 0:
        return dest
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        dest.write_bytes(urllib.request.urlopen(req, timeout=60).read())
        print(f"OK  {rel}")
        return dest
    except Exception as e:
        print(f"FAIL {url} -> {e}")
        return None


def css_relative(asset_rel: str) -> str:
    # asset_rel like 65939d1f139e1daa37da455f/file.ext
    parts = asset_rel.split("/", 1)
    if len(parts) == 2:
        return f"../{parts[1]}"
    return asset_rel


def main():
    text = CSS.read_text(encoding="utf-8")
    urls = set(re.findall(r"https?://[^)\"']+", text))
    print(f"CSS URLs: {len(urls)}")

    for url in sorted(urls):
        dest = download(url)
        if dest:
            rel = str(dest.relative_to(SITE)).replace("\\", "/")
            text = text.replace(url, css_relative(rel))

    CSS.write_text(text, encoding="utf-8")
    print("CSS updated")

    extras = [
        "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg",
        "https://cdn.prod.website-files.com/65939d1f139e1daa37da455f/6593c892f7751e2ca74fd2aa_pexels-mart-production-8027221",
    ]
    for url in extras:
        base = url.split("website-files.com/", 1)[1]
        dest = SITE / base
        if dest.exists() and dest.stat().st_size > 0:
            continue
        for attempt in [url, url + ".jpg", url + ".webp", url + ".jpeg"]:
            try:
                req = urllib.request.Request(attempt, headers={"User-Agent": "Mozilla/5.0"})
                data = urllib.request.urlopen(req, timeout=30).read()
                dest.parent.mkdir(parents=True, exist_ok=True)
                if attempt != url:
                    dest = dest.with_suffix(attempt.rsplit(".", 1)[-1])
                dest.write_bytes(data)
                print(f"extra OK {attempt}")
                break
            except Exception as e:
                print(f"extra fail {attempt} -> {e}")

    # Fix placeholder references in HTML
    placeholder_local = "../../plugins/Basic/assets/placeholder.60f9b1840c.svg"
    for html in SITE.rglob("*.html"):
        content = html.read_text(encoding="utf-8", errors="replace")
        new = content.replace(
            "https://cdn.prod.website-files.com/plugins/Basic/assets/placeholder.60f9b1840c.svg",
            os_rel_placeholder(html),
        )
        if new != content:
            html.write_text(new, encoding="utf-8")


def os_rel_placeholder(html: Path) -> str:
    dest = SITE / "plugins/Basic/assets/placeholder.60f9b1840c.svg"
    rel = dest.relative_to(html.parent)
    return str(rel).replace("\\", "/")


if __name__ == "__main__":
    main()
