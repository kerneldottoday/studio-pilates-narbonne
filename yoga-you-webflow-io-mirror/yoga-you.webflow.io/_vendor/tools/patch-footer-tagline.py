from pathlib import Path

root = Path(__file__).resolve().parents[2]
needle = 'brand-footer">Studio Pilates Narbonne</span></a>'
insert = (
    'brand-footer">Studio Pilates Narbonne</span></a>'
    '<p class="footer-tagline" data-i18n="footer.tagline">'
    "Un corps plus libre, chaque jour</p>"
)
updated = 0
for p in root.rglob("*.html"):
    if "_vendor" in p.parts and "content" not in p.parts:
        continue
    text = p.read_text(encoding="utf-8")
    if "footer-tagline" in text or needle not in text:
        continue
    p.write_text(text.replace(needle, insert, 1), encoding="utf-8")
    updated += 1
    print(p.relative_to(root))
print("updated", updated)
