from pathlib import Path
import re

SITE = Path(r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io")

EXTRA_FR = [
    (">Contact me</a>", ">Nous contacter</a>"),
    (">Some cool facts about me and my journey.</h2>", ">Quelques repères sur le studio et notre approche.</h2>"),
    (
        "Praesent ac massa at ligula laoreet iaculis. Vivamus aliquet elit ac nisl. Sed aliquam ultrices.",
        "Un studio fondé sur l'écoute, la précision du geste et la progression dans la durée.",
    ),
    (
        "Simple and proven process for your better well being.",
        "Réserver votre cours en trois étapes.",
    ),
    (">Get in touch</h3>", ">Nous contacter</h3>"),
    (">Understand goals</h3>", ">Choisir votre cours</h3>"),
    (">Practice and improve</h3>", ">Progresser en confiance</h3>"),
    ('aria-label="Open cart"', 'aria-label="Ouvrir le panier"'),
    ('aria-label="Close cart"', 'aria-label="Fermer le panier"'),
]

FOOTER_TEMPLATE_LINKS = re.compile(
    r'<a href="(?:index\.html|template/[^"]+)" class="footer-link">(?:Vitrine template|Guide de style|Licences|Journal des modifications|Commencer ici)[^<]*</a>',
    re.I,
)

for html in SITE.rglob("*.html"):
    if html.parent.name == "template":
        continue
    text = html.read_text(encoding="utf-8", errors="replace")
    orig = text
    for old, new in EXTRA_FR:
        text = text.replace(old, new)
    text = FOOTER_TEMPLATE_LINKS.sub("", text)
    text = text.replace("About  | Studio Pilates Narbonne", "Le studio | Studio Pilates Narbonne")
    text = text.replace("Classes  | Studio Pilates Narbonne", "Cours | Studio Pilates Narbonne")
    if text != orig:
        html.write_text(text, encoding="utf-8")
        print("patched", html.relative_to(SITE))
