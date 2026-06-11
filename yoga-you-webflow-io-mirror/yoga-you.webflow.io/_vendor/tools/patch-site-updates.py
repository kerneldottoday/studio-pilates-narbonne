from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[2]

INSTAGRAM = (
    "https://www.instagram.com/studiopilatesnarbonne"
    "?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw=="
)
YOUTUBE = "https://www.youtube.com/@lahissou"
MAPS = (
    "https://www.google.com/maps/search/?api=1&query="
    "8+Rue+du+Luxembourg,+11100+Narbonne"
)

MOBILE_BANNER = (
    '<div class="inside-moving-text moving-banner-mobile">'
    '<div class="single-moving-text">'
    '<div class="text-moving-text">Narbonne</div><div class="circle-moving-text"></div>'
    '<div class="text-moving-text">Ashtanga</div><div class="circle-moving-text dark-circle"></div>'
    '<div class="text-moving-text">Breathwork</div><div class="circle-moving-text dark-circle"></div>'
    "</div>"
    '<div class="single-moving-text">'
    '<div class="text-moving-text">Narbonne</div><div class="circle-moving-text"></div>'
    '<div class="text-moving-text">Ashtanga</div><div class="circle-moving-text dark-circle"></div>'
    '<div class="text-moving-text">Breathwork</div><div class="circle-moving-text dark-circle"></div>'
    "</div></div>"
)

TEMPLATE_DROPDOWN = re.compile(
    r'<div data-hover="false" data-delay="0" class="dropdown w-dropdown">'
    r'<div class="dropdown-toggle w-dropdown-toggle"><div>Template</div>.*?</nav></div>',
    re.DOTALL,
)

TOUTES_PAGES = re.compile(
    r'<a href="(?:\.\./)*index\.html#pages" class="dropdown-link w-dropdown-link">'
    r"Toutes les pages</a>"
)

ADDRESS = re.compile(
    r'<a href="[^"]*" class="single-contact-list-footer w-inline-block">'
    r'(<img src="(?:\.\./)*65939d1f139e1daa37da455f/6594010c8583e718138f71f2_pin-alt\.svg"[^>]*>)'
    r"<div>8 Rue du Luxembourg, 11100 Narbonne</div></a>"
)

MOVING_END = (
    "Alignement</div><div class=\"circle-moving-text dark-circle\"></div>"
    "</div></div></div></div></section><section class=\"section disciplines-section\">"
)

MOVING_END_REPLACEMENT = (
    "Alignement</div><div class=\"circle-moving-text dark-circle\"></div>"
    "</div></div>"
    + MOBILE_BANNER
    + "</div></div></section><section class=\"section disciplines-section\">"
)


def css_prefix(html_path: Path) -> str:
    depth = len(html_path.relative_to(ROOT).parts) - 1
    return "../" * depth


def patch_html(text: str, html_path: Path) -> str:
    prefix = css_prefix(html_path)

    text = text.replace('href="https://www.instagram.com"', f'href="{INSTAGRAM}"')
    text = text.replace('href="https://www.instagram.com/"', f'href="{INSTAGRAM}"')
    text = text.replace('href="https://www.youtube.com"', f'href="{YOUTUBE}"')
    text = text.replace('href="https://www.youtube.com/"', f'href="{YOUTUBE}"')

    text = ADDRESS.sub(
        f'<a href="{MAPS}" target="_blank" rel="noopener noreferrer" '
        f'class="single-contact-list-footer w-inline-block">\\1'
        f"<div>8 Rue du Luxembourg, 11100 Narbonne</div></a>",
        text,
    )

    text = TEMPLATE_DROPDOWN.sub("", text)
    text = TOUTES_PAGES.sub("", text)

    if "moving-banner-desktop" not in text and 'class="inside-moving-text">' in text:
        text = text.replace(
            'class="inside-moving-text">',
            'class="inside-moving-text moving-banner-desktop">',
            1,
        )

    if "moving-banner-mobile" not in text and MOVING_END in text:
        text = text.replace(MOVING_END, MOVING_END_REPLACEMENT, 1)

    css_href = (
        f'<link href="{prefix}_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>'
    )
    if "site-updates.css" not in text and "yoga-you.webflow" in text:
        text = text.replace(
            f'href="{prefix}65939d1f139e1daa37da455f/css/yoga-you.webflow',
            css_href
            + f'\n<link href="{prefix}65939d1f139e1daa37da455f/css/yoga-you.webflow',
            1,
        )

    if html_path.name == "homepage.html" and "moving-banner.css" not in text:
        text = text.replace(
            css_href,
            css_href
            + '\n<link href="_vendor/css/moving-banner.css" rel="stylesheet" type="text/css"/>',
            1,
        )

    text = text.replace(
        f'href="{INSTAGRAM}" class="link-social-footer',
        f'href="{INSTAGRAM}" target="_blank" rel="noopener noreferrer" class="link-social-footer',
    )
    text = text.replace(
        f'href="{INSTAGRAM}" target="_blank" class="link-social-footer',
        f'href="{INSTAGRAM}" target="_blank" rel="noopener noreferrer" class="link-social-footer',
    )
    text = text.replace(
        f'href="{YOUTUBE}" class="link-social-footer',
        f'href="{YOUTUBE}" target="_blank" rel="noopener noreferrer" class="link-social-footer',
    )
    text = text.replace(
        f'href="{YOUTUBE}" target="_blank" class="link-social-footer',
        f'href="{YOUTUBE}" target="_blank" rel="noopener noreferrer" class="link-social-footer',
    )

    return text


updated = []
for html in ROOT.rglob("*.html"):
    if "template" in html.parts:
        continue
    original = html.read_text(encoding="utf-8")
    patched = patch_html(original, html)
    if patched != original:
        html.write_text(patched, encoding="utf-8")
        updated.append(str(html.relative_to(ROOT)))

print(f"Patched {len(updated)} HTML files")
