"""Patch HTML pages: nav i18n keys, text-map.js script, lang-switch on 404."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
TEXT_MAP_SCRIPT = '<script src="_vendor/i18n/text-map.js" defer></script>'
TEXT_MAP_SCRIPT_NESTED = '<script src="../_vendor/i18n/text-map.js" defer></script>'
I18N_SCRIPT = '_vendor/js/i18n.js" defer></script>'

REPLACEMENTS = [
    ('<a href="planning.html" class="nav-link w-nav-link">Planning</a>',
     '<a href="planning.html" class="nav-link w-nav-link" data-i18n="nav.planning">Planning</a>'),
    ('<a href="../planning.html" class="nav-link w-nav-link">Planning</a>',
     '<a href="../planning.html" class="nav-link w-nav-link" data-i18n="nav.planning">Planning</a>'),
    ('<a href="contact.html" class="nav-link w-nav-link">Contact</a>',
     '<a href="contact.html" class="nav-link w-nav-link" data-i18n="nav.contact">Contact</a>'),
    ('<a href="../contact.html" class="nav-link w-nav-link">Contact</a>',
     '<a href="../contact.html" class="nav-link w-nav-link" data-i18n="nav.contact">Contact</a>'),
    ('<div>Plus</div>', '<div data-i18n="nav.more">Plus</div>'),
    ('<a href="planning.html" class="dropdown-link w-dropdown-link">Planning</a>',
     '<a href="planning.html" class="dropdown-link w-dropdown-link" data-i18n="nav.planning">Planning</a>'),
    ('<a href="../planning.html" class="dropdown-link w-dropdown-link">Planning</a>',
     '<a href="../planning.html" class="dropdown-link w-dropdown-link" data-i18n="nav.planning">Planning</a>'),
    ('<a href="pricing.html" class="dropdown-link w-dropdown-link">Tarifs</a>',
     '<a href="pricing.html" class="dropdown-link w-dropdown-link" data-i18n="nav.pricing">Tarifs</a>'),
    ('<a href="../pricing.html" class="dropdown-link w-dropdown-link">Tarifs</a>',
     '<a href="../pricing.html" class="dropdown-link w-dropdown-link" data-i18n="nav.pricing">Tarifs</a>'),
    ('<a href="legal.html" class="dropdown-link w-dropdown-link">Mentions</a>',
     '<a href="legal.html" class="dropdown-link w-dropdown-link" data-i18n="nav.legal">Mentions</a>'),
    ('<a href="../legal.html" class="dropdown-link w-dropdown-link">Mentions</a>',
     '<a href="../legal.html" class="dropdown-link w-dropdown-link" data-i18n="nav.legal">Mentions</a>'),
    ('<div class="heading-footer-links">Navigation</div>',
     '<div class="heading-footer-links" data-i18n="footer.navigation">Navigation</div>'),
    ('<div class="heading-footer-links">Informations</div>',
     '<div class="heading-footer-links" data-i18n="footer.information">Informations</div>'),
]

LANG_SWITCH = (
    '<div class="lang-switch" data-lang-switch>'
    '<button type="button" class="lang-link w--current" data-lang="fr" aria-pressed="true">FR</button>'
    '<span class="lang-sep">/</span>'
    '<button type="button" class="lang-link" data-lang="en" aria-pressed="false">EN</button>'
    '</div>'
)


def depth_prefix(path: Path) -> str:
    rel = path.relative_to(ROOT)
    d = len(rel.parts) - 1
    return "../" * d if d else ""


def patch_file(path: Path) -> bool:
    text = path.read_text(encoding="utf-8")
    original = text
    prefix = depth_prefix(path)

    for old, new in REPLACEMENTS:
        if prefix:
            new = new.replace('href="', f'href="{prefix}').replace(
                'href="../', f'href="{prefix}'
            )
        text = text.replace(old.replace('href="../', f'href="{prefix}') if prefix else old, new)

    # Insert text-map.js before i18n.js
    i18n_tag = f'<script src="{prefix}_vendor/js/i18n.js" defer></script>'
    map_script = (
        f'<script src="{prefix}_vendor/i18n/text-map.js" defer></script>'
        if prefix
        else '<script src="_vendor/i18n/text-map.js" defer></script>'
    )
    if i18n_tag in text and map_script not in text:
        text = text.replace(i18n_tag, map_script + i18n_tag)

    # Ensure lang-switch exists in navbar wrap-nav-buttons
    if 'data-lang-switch' not in text and 'wrap-nav-buttons' in text and I18N_SCRIPT.replace('_vendor/', f'{prefix}_vendor/') in text:
        divider = '<div class="divider-nav"></div>'
        if divider in text and LANG_SWITCH not in text:
            text = text.replace(divider, divider + LANG_SWITCH, 1)

    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    updated = []
    for p in ROOT.rglob("*.html"):
        if "65939d1f139e1daa37da455f" in p.parts:
            continue
        if patch_file(p):
            updated.append(str(p.relative_to(ROOT)))
    print(f"Patched {len(updated)} file(s)")
    for f in updated:
        print(f"  {f}")


if __name__ == "__main__":
    main()
