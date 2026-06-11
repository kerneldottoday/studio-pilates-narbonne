from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

TEMPLATE_DROPDOWN = re.compile(
    r'<div data-hover="false" data-delay="0" class="dropdown w-dropdown">'
    r'<div class="dropdown-toggle w-dropdown-toggle"><div>template</div>.*?</nav></div>',
    re.DOTALL | re.IGNORECASE,
)

FOOTER_VITRINE = re.compile(
    r'<a href="(?:\.\./)*index\.html" class="footer-link">Vitrine template</a>'
)

FOOTER_TEMPLATE_LINKS = re.compile(
    r'<a href="(?:\.\./)*template/[^"]+\.html" class="[^"]*">[^<]+</a>'
)

updated = []
for html in ROOT.rglob("*.html"):
    if "template" in html.parts:
        continue
    text = html.read_text(encoding="utf-8")
    original = text
    text = TEMPLATE_DROPDOWN.sub("", text)
    text = FOOTER_VITRINE.sub("", text)
    text = FOOTER_TEMPLATE_LINKS.sub("", text)
    if text != original:
        html.write_text(text, encoding="utf-8")
        updated.append(str(html.relative_to(ROOT)))

print(f"Cleaned {len(updated)} files")
