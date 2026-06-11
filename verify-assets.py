from pathlib import Path
import re

SITE = Path(r"c:\users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")
missing = []
external_assets = []

for html in SITE.rglob("*.html"):
    text = html.read_text(encoding="utf-8", errors="replace")
    for attr in ("href", "src"):
        for m in re.finditer(rf'{attr}="([^"]+)"', text):
            ref = m.group(1).strip()
            if ref.startswith(("http://", "https://", "mailto:", "data:", "#")):
                if ref.startswith(("http://", "https://")) and any(
                    x in ref
                    for x in (
                        "cdn.prod.website-files.com",
                        "assets.website-files.com",
                        "cloudfront.net",
                    )
                ):
                    external_assets.append((str(html.relative_to(SITE)), ref))
                continue
            if ref.endswith(".html") or ".html#" in ref:
                continue
            target = (html.parent / ref.split("?")[0]).resolve()
            if not target.exists():
                missing.append((str(html.relative_to(SITE)), ref))

    for m in re.finditer(r'srcset="([^"]+)"', text):
        for part in m.group(1).split(","):
            ref = part.strip().split(" ")[0]
            if ref.startswith("http"):
                continue
            target = (html.parent / ref.split("?")[0]).resolve()
            if not target.exists():
                missing.append((str(html.relative_to(SITE)), ref))

print("Missing local refs:", len(missing))
for item in missing[:40]:
    print(" ", item)
print("\nRemaining CDN refs:", len(external_assets))
for item in external_assets[:20]:
    print(" ", item)
