"""Fix planning.html navbar corruption and ensure footer has Tarifs."""
from pathlib import Path

path = Path(__file__).resolve().parents[2] / "planning.html"
text = path.read_text(encoding="utf-8")

navbar_bad = (
    '<a href="planning.html" aria-current="page" class="nav-link w-nav-link w--current">Planning</a>'
    '<a href="pricing.html" class="footer-link" data-i18n="nav.pricing">Tarifs</a>'
    '<a href="contact.html" class="nav-link w-nav-link">Contact</a>'
)
navbar_good = (
    '<a href="planning.html" aria-current="page" class="nav-link w-nav-link w--current">Planning</a>'
    '<a href="contact.html" class="nav-link w-nav-link">Contact</a>'
)

footer_needle = (
    '<a href="planning.html" aria-current="page" class="footer-link w--current">Planning</a>'
    '<a href="contact.html" class="footer-link" data-i18n="nav.contact">Contact</a>'
)
footer_replacement = (
    '<a href="planning.html" aria-current="page" class="footer-link w--current">Planning</a>'
    '<a href="pricing.html" class="footer-link" data-i18n="nav.pricing">Tarifs</a>'
    '<a href="contact.html" class="footer-link" data-i18n="nav.contact">Contact</a>'
)

updated = text.replace(navbar_bad, navbar_good).replace(footer_needle, footer_replacement)
if updated == text:
    raise SystemExit("No changes applied — check planning.html structure")
path.write_text(updated, encoding="utf-8")
print("planning.html repaired")
