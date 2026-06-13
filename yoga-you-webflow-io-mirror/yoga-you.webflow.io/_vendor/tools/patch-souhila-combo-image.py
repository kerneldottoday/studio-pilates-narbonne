import re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
ALT = "Souhila Chekara, instructrice Pilates certifiée à Narbonne"
SIZES = "(max-width: 479px) 93vw, (max-width: 767px) 90vw, (max-width: 991px) 520px, 96vw"
IMG_PATTERN = re.compile(r'<img[^>]*class="image-combo-halves"\s*/>', re.IGNORECASE)


def combo_img(prefix: str) -> str:
    return (
        f'<img src="{prefix}_vendor/media/souhila-combo.png" loading="lazy" '
        f'sizes="{SIZES}" alt="{ALT}" class="image-combo-halves"/>'
    )


def should_replace(tag: str) -> bool:
    if "complements/souhila" in tag:
        return False
    if "souhila-combo.png" in tag and "srcset" not in tag and "combo-side" not in tag:
        return False
    return "combo-side" in tag or "souhila-combo" in tag


def replacer(match: re.Match[str]) -> str:
    tag = match.group(0)
    if not should_replace(tag):
        return tag
    prefix = "../" if "../" in tag else ""
    return combo_img(prefix)


updated = 0
for path in sorted(root.rglob("*.html")):
    if "_vendor" in path.parts:
        continue
    text = path.read_text(encoding="utf-8")
    new_text, n = IMG_PATTERN.subn(replacer, text)
    if n and new_text != text:
        path.write_text(new_text, encoding="utf-8")
        updated += 1
        print(path.relative_to(root))

print("updated", updated, "files")
