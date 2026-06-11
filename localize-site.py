#!/usr/bin/env python3
"""Remove template menu, swap logo, French UI, inject EN language switcher."""
from __future__ import annotations

import re
from pathlib import Path

SITE = Path(
    r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io"
)

LOGO_DARK_OLD = "65939d1f139e1daa37da455f/6593af3bb67afefeec66d57b_Logo%20Dark%20Yoga%20You%20Webflow%20Template.svg"
LOGO_LIGHT_OLD = "65939d1f139e1daa37da455f/659400c032571becf27ca187_Logo%20Light%20Yoga%20You%20Webflow%20Template.svg"
LOGO_NEW = "65939d1f139e1daa37da455f/studio-pilates-logo-dark.png"

LANG_SWITCH = """<div class="lang-switch" data-lang-switch><button type="button" class="lang-link w--current" data-lang="fr" aria-pressed="true">FR</button><span class="lang-sep">/</span><button type="button" class="lang-link" data-lang="en" aria-pressed="false">EN</button></div>"""

TEMPLATE_DROPDOWN = re.compile(
    r'<div data-hover="false" data-delay="0" class="dropdown w-dropdown">\s*'
    r'<div class="dropdown-toggle w-dropdown-toggle">\s*'
    r'<div>(?:template|Template|Vitrine template)</div>.*?'
    r'</nav>\s*</div>\s*</div>',
    re.I | re.S,
)

FOOTER_TEMPLATE_LINKS = re.compile(
    r'<div id="w-node-_3705d00e-723f-d556-8bd6-79e07f18d714-7f18d6cb" class="column-footer-links">'
    r'<div class="heading-footer-links">(?:Template|template)</div>.*?'
    r'</div>\s*</div>\s*</div>\s*<div class="divider-footer">',
    re.I | re.S,
)

# Global English -> French replacements (order matters for longer strings first)
FR_REPLACEMENTS: list[tuple[str, str]] = [
    ('lang="en"', 'lang="fr"'),
    ('"currencyCode":"USD","symbol":"$"', '"currencyCode":"EUR","symbol":"€"'),
    (">home</a>", '>Accueil</a>'),
    (">about</a>", '>Le studio</a>'),
    (">classes</a>", '>Cours</a>'),
    (">contact</a>", '>Contact</a>'),
    (">more pages</div>", ">Plus</div>"),
    (">expertises</a>", ">Atouts</a>"),
    (">class page</a>", ">Détail cours</a>"),
    (">blog</a>", ">Voyage</a>"),
    (">pricing</a>", ">Tarifs</a>"),
    (">legal</a>", ">Mentions</a>"),
    (">see all pages</a>", ">Toutes les pages</a>"),
    (">cart</div>", ">Panier</div>"),
    (">Your Cart</h4>", ">Votre panier</h4>"),
    (">No items found.</div>", ">Aucun article.</div>"),
    (">Subtotal</div>", ">Sous-total</div>"),
    (">Continue to Checkout</a>", ">Passer au paiement</a>"),
    (">Remove</div>", ">Retirer</div>"),
    (">Update quantity</", ">Quantité</"),
    (">Home</a>", ">Accueil</a>"),
    (">About</a>", ">Le studio</a>"),
    (">Contact</a>", ">Contact</a>"),
    (">Classes</a>", ">Cours</a>"),
    (">Expertises</a>", ">Atouts</a>"),
    (">Main pages</div>", ">Navigation</div>"),
    (">Other pages</div>", ">Pages</div>"),
    (">CMS pages</div>", ">Filtres</div>"),
    (">CMS&nbsp;pages</div>", ">Filtres</div>"),
    (">Template home</a>", ">Vitrine template</a>"),
    (">Blog</a>", ">Voyage</a>"),
    (">Pricing</a>", ">Tarifs</a>"),
    (">Legal</a>", ">Mentions</a>"),
    (">Class page</a>", ">Détail cours</a>"),
    (">Level filter</a>", ">Par niveau</a>"),
    (">Duration filter</a>", ">Par durée</a>"),
    (">Type filter</a>", ">Par type</a>"),
    (">Blog post</a>", ">Article</a>"),
    (">All pages</a>", ">Toutes les pages</a>"),
    (">Style guide</a>", ">Guide de style</a>"),
    (">Licenses</a>", ">Licences</a>"),
    (">Changelog</a>", ">Journal des modifications</a>"),
    (">Start here</a>", ">Commencer ici</a>"),
    (">Start class</div>", ">Réserver</div>"),
    (">see all</a>", ">Voir tout</a>"),
    (">Get started</a>", ">Réserver</a>"),
    (">About me</a>", ">Le studio</a>"),
    (">Start now</a>", ">Réserver</a>"),
    (">Free classes</a>", ">Réserver un cours</a>"),
    (">Watch showreel</div>", ">Découvrir le studio</div>"),
    (">Open cart</", ">Ouvrir le panier</"),
    (">Close cart</", ">Fermer le panier</"),
    (">Hang Tight...</", ">Patientez...</"),
    (
        "Template designed with love by <a href=\"https://www.wavesdesign.io\" target=\"_blank\" class=\"white-link\">Wavesdesign</a>",
        "© 2026 Studio Pilates Narbonne — Souhila Chekara, instructrice Pilates",
    ),
    (
        "Yoga You is a beautiful and minimalistic Webflow Template designed for yoga teachers and wellness coaches. It features modern design, a fully working CMS, and E-commerce.",
        "Studio Pilates Narbonne — Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne.",
    ),
    (
        "Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.",
        "Cours adapté à votre niveau, dans un cadre calme et bienveillant à Narbonne.",
    ),
    (
        "In dui magna, posuere eget, vestibulum et, tempor auctor, justo.",
        "Une approche personnalisée pour progresser en force, posture et sérénité.",
    ),
    (
        "In dui magna, posuere eget, vestibulum et, tempor auctor, justo. Praesent congue erat at massa. Vivamus aliquet elit.",
        "Un studio calme dédié au Pilates et au bien-être, avec un accompagnement personnalisé à Narbonne.",
    ),
    (
        "Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.",
        "En petits groupes, progressez avec des corrections ciblées dans un cadre calme et bienveillant.",
    ),
    (">Beginner</div>", ">Débutant</div>"),
    (">Intermediate</div>", ">Intermédiaire</div>"),
    (">Advanced</div>", ">Avancé</div>"),
    (">1 hour</div>", ">1 heure</div>"),
    (">30 minutes</div>", ">30 minutes</div>"),
    (">10 minutes</div>", ">10 minutes</div>"),
    (">All levels</div>", ">Tous niveaux</div>"),
    (">60 minutes</div>", ">60 minutes</div>"),
    (">60 minutes each</div>", ">60 minutes chacun</div>"),
    (">hi@yoga.com</div>", ">lahissou@hotmail.fr</div>"),
    (">+1 800 000 000</div>", ">+33 6 50 08 02 22</div>"),
    (">California, Santa Monica</div>", ">8 Rue du Luxembourg, 11100 Narbonne</div>"),
]

TITLE_REPLACEMENTS = [
    (r"\| Yoga You - Webflow Ecommerce website template", " | Studio Pilates Narbonne"),
    (r"Yoga You - Webflow Ecommerce website template", "Studio Pilates Narbonne"),
    (r"Homepage \|", "Accueil |"),
    (r"About \|", "Le studio |"),
    (r"Classes \|", "Cours |"),
    (r"Contact \|", "Contact |"),
    (r"Pricing \|", "Tarifs |"),
    (r"Blog \|", "Voyage |"),
    (r"Expertises \|", "Atouts |"),
    (r"Legal \|", "Mentions |"),
    (r"Search \|", "Recherche |"),
]

I18N_ATTRS = [
    ('href="homepage.html" aria-current="page" class="nav-link w-nav-link w--current">Accueil</a>', 'href="homepage.html" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.home">Accueil</a>'),
    ('href="homepage.html" class="nav-link w-nav-link">Accueil</a>', 'href="homepage.html" class="nav-link w-nav-link" data-i18n="nav.home">Accueil</a>'),
    ('href="about.html" class="nav-link w-nav-link">Le studio</a>', 'href="about.html" class="nav-link w-nav-link" data-i18n="nav.about">Le studio</a>'),
    ('href="classes.html" class="nav-link w-nav-link">Cours</a>', 'href="classes.html" class="nav-link w-nav-link" data-i18n="nav.classes">Cours</a>'),
    ('href="contact.html" class="nav-link w-nav-link">Contact</a>', 'href="contact.html" class="nav-link w-nav-link" data-i18n="nav.contact">Contact</a>'),
    ('class="w-inline-block">Panier</div>', 'class="w-inline-block" data-i18n="nav.cart">Panier</div>'),
    ('class="w-commerce-commercecartheading">Votre panier</h4>', 'class="w-commerce-commercecartheading" data-i18n="cart.title">Votre panier</h4>'),
    ('aria-label="This cart is empty">Aucun article.</div>', 'aria-label="This cart is empty" data-i18n="cart.empty">Aucun article.</div>'),
    ('class="w-commerce-commercecartlineitem"><div>Sous-total</div>', 'class="w-commerce-commercecartlineitem"><div data-i18n="cart.subtotal">Sous-total</div>'),
    ('class="w-commerce-commercecartcheckoutbutton cta" data-loading-text="Patientez...">Passer au paiement</a>', 'class="w-commerce-commercecartcheckoutbutton cta" data-loading-text="Patientez..." data-i18n="cart.checkout">Passer au paiement</a>'),
    ('<div>Retirer</div></a></div><input aria-label="Quantité"', '<div data-i18n="cart.remove">Retirer</div></a></div><input aria-label="Quantité"'),
]

HOMEPAGE_I18N = [
    ('class="title-text">Studio Pilates — Narbonne</div>', 'class="title-text" data-i18n="hero.location">Studio Pilates — Narbonne</div>'),
    ('>Un espace calme pour renforcer son corps et libérer son esprit.</h1>', ' data-i18n="hero.title">Un espace calme pour renforcer son corps et libérer son esprit.</h1>'),
    ('href="contact.html" class="cta w-button">Réserver un cours</a>', 'href="contact.html" class="cta w-button" data-i18n="hero.cta1">Réserver un cours</a>'),
    ('href="classes.html" class="cta ghost-cta w-button">Voir le planning</a>', 'href="classes.html" class="cta ghost-cta w-button" data-i18n="hero.cta2">Voir le planning</a>'),
    (
        "© 2026 Studio Pilates Narbonne — Souhila Chekara, instructrice Pilates",
        '<span data-i18n="footer.copyright">© 2026 Studio Pilates Narbonne — Souhila Chekara, instructrice Pilates</span>',
    ),
]


def rel_prefix(html: Path) -> str:
    depth = len(html.relative_to(SITE).parts) - 1
    return "../" * depth


def inject_assets(text: str, prefix: str) -> str:
    bundle = (
        f'<link href="{prefix}_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>'
        f'<script src="{prefix}_vendor/js/i18n.js" defer></script>'
    )
    if "_vendor/css/i18n.css" in text:
        return text
    return text.replace("</head>", bundle + "</head>", 1)


def inject_lang_switch(text: str) -> str:
    if "data-lang-switch" in text:
        return text
    marker = '<div class="divider-nav"></div>'
    if marker not in text:
        return text
    return text.replace(marker, marker + LANG_SWITCH, 1)


def fix_logo_alt(text: str) -> str:
    return text.replace('alt="" class="brand-navbar"', 'alt="Studio Pilates Narbonne" class="brand-navbar"').replace(
        'alt="" class="brand-footer"', 'alt="Studio Pilates Narbonne" class="brand-footer"'
    )


def process_html(html: Path) -> bool:
    if html.name == "index.html":
        return False
    text = html.read_text(encoding="utf-8", errors="replace")
    original = text
    prefix = rel_prefix(html)

    text = TEMPLATE_DROPDOWN.sub("", text)
    text = FOOTER_TEMPLATE_LINKS.sub('<div class="divider-footer">', text)

    text = text.replace(LOGO_DARK_OLD, LOGO_NEW)
    text = text.replace(LOGO_LIGHT_OLD, LOGO_NEW)

    for old, new in sorted(FR_REPLACEMENTS, key=lambda x: len(x[0]), reverse=True):
        text = text.replace(old, new)

    for pattern, repl in TITLE_REPLACEMENTS:
        text = re.sub(pattern, repl, text)

    for old, new in I18N_ATTRS:
        text = text.replace(old, new)

    if html.name == "homepage.html":
        for old, new in HOMEPAGE_I18N:
            text = text.replace(old, new)
        # hero subtitle
        text = text.replace(
            'class="subtitle">Une pratique fidèle aux principes de Joseph Pilates : précision, contrôle, respiration et alignement, en petits groupes à Narbonne.</div>',
            'class="subtitle" data-i18n="hero.subtitle">Une pratique fidèle aux principes de Joseph Pilates : précision, contrôle, respiration et alignement, en petits groupes à Narbonne.</div>',
            1,
        )

    text = inject_lang_switch(text)
    text = inject_assets(text, prefix)
    text = fix_logo_alt(text)

    # Brand links -> homepage
    text = text.replace('href="index.html" class="brand-link-navbar', 'href="homepage.html" class="brand-link-navbar')
    text = text.replace('href="index.html" class="brand-link-footer', 'href="homepage.html" class="brand-link-footer')

    if text != original:
        html.write_text(text, encoding="utf-8")
        return True
    return False


def main():
    updated = 0
    for html in SITE.rglob("*.html"):
        if html.parent.name == "template":
            continue
        if process_html(html):
            updated += 1
            print("updated", html.relative_to(SITE))
    print(f"Done. {updated} files updated.")


if __name__ == "__main__":
    main()
