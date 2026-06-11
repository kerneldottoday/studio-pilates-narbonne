#!/usr/bin/env python3
import re
import json
import urllib.request
from pathlib import Path

REF = Path(r"C:\Users\recca\Desktop\Website pilates\reference\studiopilatesnarbonne.com")
OUT = Path(
    r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io\65939d1f139e1daa37da455f"
)

# Search bootstrap + asset bundles for image refs
candidates = set()
for path in [REF / "index.html", *REF.glob("_assets/*.js")]:
    if not path.exists():
        continue
    text = path.read_text(encoding="utf-8", errors="replace")
    for m in re.finditer(r"images/[a-f0-9]+\.(?:png|webp|jpg|svg)", text):
        candidates.add(m.group(0))
    for m in re.finditer(r"https?://[^\"'\s>]+\.(?:png|webp|jpg|svg)", text):
        candidates.add(m.group(0))

print("candidates:", len(candidates))
for c in sorted(candidates)[:30]:
    print(" ", c)

# Try Canva export relative paths
for rel in sorted(candidates):
    if rel.startswith("http"):
        url = rel
    else:
        url = f"https://studiopilatesnarbonne.com/_assets/{rel}"
    dest = OUT / "studio-pilates-logo.png"
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        data = urllib.request.urlopen(req, timeout=30).read()
        if len(data) > 500:
            dest.write_bytes(data)
            print("OK", url, "->", dest, len(data))
            break
    except Exception as e:
        print("FAIL", url, e)
