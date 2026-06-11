#!/usr/bin/env python3
from pathlib import Path

HOMEPAGE = Path(
    r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io\homepage.html"
)
text = HOMEPAGE.read_text(encoding="utf-8")

fixes = [
    ("Praesent egestas tristique nibh", "Travail précis & complet"),
    ("Jessica Kent helped me so much on every level. She really took time to understand my work and sports routine and organized series of online classes that helped me to release back pain and improve my scores in football.", "Un accompagnement attentif et des corrections précises à chaque séance. J'ai gagné en posture et en confiance, avec une vraie progression semaine après semaine."),
    ("Kelly Kapor", "Élève du studio"),
    ("<h3 class=\"no-margins\">Yoga</h3><div class=\"paragraph-big\">Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div>", "<h3 class=\"no-margins\">Pilates Reformer</h3><div class=\"paragraph-big\">Cours en petit groupe sur reformer — travail précis, complet et fidèle à la méthode originale. 32 € la séance.</div>"),
    ("<h3 class=\"no-margins\">Breathwork</h3><div class=\"paragraph-big\">Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div>", "<h3 class=\"no-margins\">Pilates Mat</h3><div class=\"paragraph-big\">Renforcement en profondeur au sol — centre, posture et alignement optimisés. 12,50 € la séance.</div>"),
    ("<h3 class=\"no-margins\">Pilates</h3><div class=\"paragraph-big\">Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.</div>", "<h3 class=\"no-margins\">Yoga Ashtanga</h3><div class=\"paragraph-big\">Pratique dynamique et fluide pour améliorer force et souplesse — adaptée à tous les niveaux. 12,50 € la séance.</div>"),
]

# First process step lorem
text = text.replace(
    "<div class=\"paragraph-big\">Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.</div></div><div class=\"tile-process-sticky\"><div class=\"top-process-tile\"><img src=\"65939d1f139e1daa37da455f/6593e705f34c0f8678ea2382_Process%202.svg\"",
    "<div class=\"paragraph-big\">Par email ou téléphone — nous répondons à vos questions et vous orientons vers la formule adaptée.</div></div><div class=\"tile-process-sticky\"><div class=\"top-process-tile\"><img src=\"65939d1f139e1daa37da455f/6593e705f34c0f8678ea2382_Process%202.svg\"",
    1,
)

# Remaining class slider items lorem
text = text.replace(
    "Suspendisse eu ligula. Nullam tincidunt adipiscing enim. Nunc nonummy metus. Vestibulum ullamcorper mauris at ligula.",
    "Cours adapté à votre niveau, dans un cadre calme et bienveillant à Narbonne.",
)

# Testimonials intro
text = text.replace(
    "<div class=\"paragraph-big\">In dui magna, posuere eget, vestibulum et, tempor auctor, justo.</div></div><div data-w-id=\"0379b3ae-efbc-1b02-3a17-d3fc88ecc612\"",
    "<div class=\"paragraph-big\">Des retours authentiques sur l'accompagnement et la progression au studio.</div></div><div data-w-id=\"0379b3ae-efbc-1b02-3a17-d3fc88ecc612\"",
    1,
)

# Pricing section intro
text = text.replace(
    "<div class=\"paragraph-big\">In dui magna, posuere eget, vestibulum et, tempor auctor, justo.</div></div><div data-w-id=\"7a7eb938-6aab-ffb3-a1c8-5c5f269664f1\"",
    "<div class=\"paragraph-big\">Tarifs à la séance — Reformer, Mat et Yoga Ashtanga.</div></div><div data-w-id=\"7a7eb938-6aab-ffb3-a1c8-5c5f269664f1\"",
    1,
)

for old, new in fixes:
    c = text.count(old)
    if c:
        text = text.replace(old, new)
        print(f"fixed {c}x: {old[:50]}...")
    else:
        print(f"skip: {old[:50]}...")

HOMEPAGE.write_text(text, encoding="utf-8")
print("done")
