"""Replace homepage testimonial slider with real Google reviews."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HOMEPAGE = ROOT / "homepage.html"

STARS = "65939d1f139e1daa37da455f/6593e4da667b4612e6eabb74_Stars.svg"

TESTIMONIALS = [
    {
        "image": "_vendor/media/testimonials/testimonial-brigitte.jpg",
        "alt": "Brigitte P., avis Google",
        "quote": (
            "Une professeur de yoga et de pilates : la meilleure, elle a tout ; "
            "le professionnalisme, l'intelligence, très humaine, beaucoup de "
            "bienveillance et de l'humour…"
        ),
        "name": "Brigitte P., avis Google",
    },
    {
        "image": "_vendor/media/testimonials/testimonial-amel.jpg",
        "alt": "Amel D., avis Google",
        "quote": (
            "Les cours sont de haute qualité tout comme le professeur. Souhila "
            "est à l'écoute, patiente, pédagogue et très professionnelle. On "
            "voit qu'elle maîtrise parfaitement son domaine. Je recommande à "
            "100 %, la meilleure expérience pilates de l'Aude, et sûrement "
            "même de France."
        ),
        "name": "Amel D., avis Google",
    },
    {
        "image": "_vendor/media/testimonials/testimonial-olivier.jpg",
        "alt": "Olivier J., avis Google",
        "quote": (
            "Petite salle avec professionnel à l'écoute : le sport autrement ! "
            "Pour ceux qui sont à la recherche d'un sport complet sans le "
            "brouhaha des salles de sport. Ça fait du bien au corps d'abord et "
            "à l'esprit, car ici on travaille en concentration."
        ),
        "name": "Olivier J., avis Google",
    },
]

SUBTITLE_OLD = (
    "Des retours authentiques sur l'accompagnement et la progression au studio."
)
SUBTITLE_NEW = (
    "Note 5/5 sur Google — des retours authentiques de nos élèves au studio."
)


def slide_html(item: dict) -> str:
    return (
        f'<div class="slide-testimonials"><div class="tile-testimonial-slider">'
        f'<img src="{item["image"]}" loading="lazy" sizes="(max-width: 479px) 38vw, 140px" '
        f'alt="{item["alt"]}" class="image-testimonial"/>'
        f'<div class="wrap-testimonial-content">'
        f'<img src="{STARS}" loading="lazy" alt="" class="abstract-stars-vertical"/>'
        f'<div class="text-testimonial">&quot;{item["quote"]}&quot;</div>'
        f'<div class="paragraph-big">{item["name"]}</div>'
        f"</div></div></div>"
    )


def main() -> None:
    html = HOMEPAGE.read_text(encoding="utf-8")
    slides = "".join(slide_html(t) for t in TESTIMONIALS)

    html, n_mask = re.subn(
        r'(<div class="mask">)(.*?)(</div><div class="slide-nav-hidden)',
        lambda m: m.group(1) + slides + m.group(3),
        html,
        count=1,
        flags=re.DOTALL,
    )
    if n_mask != 1:
        raise SystemExit(f"Expected 1 mask replacement, got {n_mask}")

    if SUBTITLE_OLD not in html:
        raise SystemExit("Subtitle not found in homepage")
    html = html.replace(SUBTITLE_OLD, SUBTITLE_NEW, 1)

    HOMEPAGE.write_text(html, encoding="utf-8")
    print("Updated homepage testimonials (3 Google reviews).")


if __name__ == "__main__":
    main()
