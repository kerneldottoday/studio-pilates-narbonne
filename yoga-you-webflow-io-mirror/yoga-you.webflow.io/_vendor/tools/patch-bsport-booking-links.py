from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BSPORT = (
    "https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0"
)
EXTERNAL = f' target="_blank" rel="noopener noreferrer"'

REPLACEMENTS = [
    (
        'href="contact.html" class="cta w-button" data-i18n="hero.cta1">Réserver un cours</a>',
        f'href="{BSPORT}" class="cta w-button"{EXTERNAL} data-i18n="hero.cta1">Réserver un cours</a>',
    ),
    (
        'href="contact.html" class="cta pricing-cta w-button">Réserver</a>',
        f'href="{BSPORT}" class="cta pricing-cta w-button"{EXTERNAL}>Réserver</a>',
    ),
    (
        'href="contact.html" class="cta w-button">Réserver</a>',
        f'href="{BSPORT}" class="cta w-button"{EXTERNAL}>Réserver</a>',
    ),
]

updated = []
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    original = text
    for old, new in REPLACEMENTS:
        text = text.replace(old, new)
    if text != original:
        html.write_text(text, encoding="utf-8")
        updated.append(str(html.relative_to(ROOT)))

print(f"Updated {len(updated)} files")
for path in updated:
    print(path)
