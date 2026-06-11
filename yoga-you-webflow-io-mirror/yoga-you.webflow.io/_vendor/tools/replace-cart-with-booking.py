from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]
BSPORT = (
    "https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0"
)
BOOKING_BTN = (
    f'<a href="{BSPORT}" class="cta navbar-cta w-button w-inline-block" '
    f'target="_blank" rel="noopener noreferrer" data-i18n="hero.cta1">Réserver un cours</a>'
)
START = '<div data-node-type="commerce-cart-wrapper"'


def replace_cart_block(text: str) -> str:
    start = text.find(START)
    if start == -1:
        return text

    depth = 0
    i = start
    while i < len(text):
        if text.startswith("<div", i):
            depth += 1
            i = text.find(">", i) + 1
            continue
        if text.startswith("</div>", i):
            depth -= 1
            if depth == 0:
                end = i + 6
                return text[:start] + BOOKING_BTN + text[end:]
            i += 6
            continue
        i += 1
    return text


updated = []
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    new_text = replace_cart_block(text)
    if new_text != text:
        html.write_text(new_text, encoding="utf-8")
        updated.append(str(html.relative_to(ROOT)))

print(f"Updated {len(updated)} files")
for path in updated:
    print(path)
