import re
from pathlib import Path

root = Path(__file__).resolve().parents[2]
detail_link = re.compile(
    r'<a href="[^"]*" class="dropdown-link w-dropdown-link"(?: data-i18n="nav\.classPage")?>'
    r"(?:Détail cours|Class detail)</a>"
)
updated = 0
for path in root.rglob("*.html"):
    if "_vendor" in path.parts:
        continue
    text = path.read_text(encoding="utf-8")
    new_text, n = detail_link.subn("", text)
    if n:
        path.write_text(new_text, encoding="utf-8")
        updated += 1
        print(path.relative_to(root), n)

print("updated", updated, "html files")
