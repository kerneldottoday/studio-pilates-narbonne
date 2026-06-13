"""Extract candidate French UI strings from HTML for translation map."""
import re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
skip_dirs = {"65939d1f139e1daa37da455f", "blog"}
strings = set()

tag_re = re.compile(r">([^<>]{2,200})<")

for p in root.rglob("*.html"):
    if any(part in skip_dirs for part in p.parts):
        continue
    if "_vendor" in p.parts and "content" not in p.parts:
        continue
    text = p.read_text(encoding="utf-8", errors="ignore")
    for m in tag_re.finditer(text):
        s = m.group(1).strip()
        if not s or s.startswith("http") or s.startswith("{{"):
            continue
        if re.fullmatch(r"[\d\s€.,:;+\-/\\()&'\"]+", s):
            continue
        if any(ord(c) > 127 for c in s) or re.search(r"[A-Za-zÀ-ÿ]", s):
            strings.add(s)

for s in sorted(strings, key=len, reverse=True):
    print(s)
