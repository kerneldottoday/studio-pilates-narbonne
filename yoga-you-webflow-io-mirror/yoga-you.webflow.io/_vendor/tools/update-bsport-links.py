from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BSPORT = (
    "https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0"
)
BSPORT_ATTRS = f' href="{BSPORT}" target="_blank" rel="noopener noreferrer"'

REPLACEMENTS = [
    ('href="https://www.bsport.io/"', f'href="{BSPORT}"'),
    ('href="pricing.html" class="cta w-button">Réserver</a>', f'href="{BSPORT}" class="cta w-button" target="_blank" rel="noopener noreferrer">Réserver</a>'),
    ('href="pricing.html" class="cta w-button" data-i18n="hero.cta1">Réserver un cours</a>', f'href="{BSPORT}" class="cta w-button" target="_blank" rel="noopener noreferrer" data-i18n="hero.cta1">Réserver un cours</a>'),
    ('href="../pricing.html" class="cta w-button">Réserver</a>', f'href="{BSPORT}" class="cta w-button" target="_blank" rel="noopener noreferrer">Réserver</a>'),
]

SCRIPT_SNIPPET = (
    '<script src="_vendor/js/bsport-config.js" type="text/javascript"></script>'
    '<script src="_vendor/js/bsport-links.js" type="text/javascript"></script>'
)
SCRIPT_SNIPPET_NESTED = (
    '<script src="../_vendor/js/bsport-config.js" type="text/javascript"></script>'
    '<script src="../_vendor/js/bsport-links.js" type="text/javascript"></script>'
)

updated = []
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    original = text

    rel = html.relative_to(ROOT)
    depth = len(rel.parts) - 1
    prefix = "../" * depth if depth else ""

    for old, new in REPLACEMENTS:
        if depth:
            new_adj = new.replace(f'href="{BSPORT}"', f'href="{BSPORT}"')
        text = text.replace(old, new)

    if depth == 0:
        if "bsport-config.js" not in text and "</body>" in text:
            text = text.replace("</body>", SCRIPT_SNIPPET + "</body>")
    else:
        nested_old = 'href="../pricing.html" class="cta w-button">Réserver</a>'
        nested_new = f'href="{BSPORT}" class="cta w-button" target="_blank" rel="noopener noreferrer">Réserver</a>'
        text = text.replace(nested_old, nested_new)
        if "bsport-config.js" not in text and "</body>" in text:
            text = text.replace("</body>", SCRIPT_SNIPPET_NESTED + "</body>")

    if text != original:
        html.write_text(text, encoding="utf-8")
        updated.append(str(rel))

print(f"Updated {len(updated)} files")
for path in updated:
    print(path)
