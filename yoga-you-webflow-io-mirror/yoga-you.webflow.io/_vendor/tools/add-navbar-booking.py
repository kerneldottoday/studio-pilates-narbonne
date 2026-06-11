from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
BSPORT = (
    "https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0"
)
BOOKING_BTN = (
    f'<a href="{BSPORT}" class="cta navbar-cta w-button w-inline-block" '
    f'target="_blank" rel="noopener noreferrer" data-i18n="hero.cta1">Réserver un cours</a>'
)

INSERT_AFTER_FORM = f"</form>{BOOKING_BTN}</div>"
TARGET = "</form></div>"

updated = []
for html in ROOT.rglob("*.html"):
    text = html.read_text(encoding="utf-8")
    if "navbar-cta" in text or TARGET not in text:
        continue
    new_text = text.replace(TARGET, INSERT_AFTER_FORM, 1)
    if new_text != text:
        html.write_text(new_text, encoding="utf-8")
        updated.append(str(html.relative_to(ROOT)))

print(f"Updated {len(updated)} files")
for path in updated:
    print(path)
