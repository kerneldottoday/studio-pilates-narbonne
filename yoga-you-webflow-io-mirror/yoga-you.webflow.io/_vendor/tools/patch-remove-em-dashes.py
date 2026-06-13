from pathlib import Path

EM = "\u2014"

REPLACEMENTS = [
    (
        "du Pilates — respiration, contrôle, fluidité et alignement — pour",
        "du Pilates : respiration, contrôle, fluidité et alignement, pour",
    ),
    (
        "porté par la musique et la respiration — 10 étapes",
        "porté par la musique et la respiration : 10 étapes",
    ),
    (
        "pour harmoniser corps et esprit — 10 étapes",
        "pour harmoniser corps et esprit : 10 étapes",
    ),
    (
        "respiration Ujjayi — tous niveaux",
        "respiration Ujjayi, tous niveaux",
    ),
    (
        "approfondir votre pratique — en petit groupe",
        "approfondir votre pratique, en petit groupe",
    ),
    (
        "éthique pour le yogi — celui qui",
        "éthique pour le yogi, celui qui",
    ),
    (
        "le questionnement — non le suivi",
        "le questionnement, pas le suivi",
    ),
    (
        "séances privées — réservez",
        "séances privées. Réservez",
    ),
    (
        "Studio Pilates Narbonne — Souhila",
        "Studio Pilates Narbonne, Souhila",
    ),
]

COMMENT_REPLACEMENTS = [
    ("Menu mobile — Studio", "Menu mobile : Studio"),
    ("Hero accueil — vidéo", "Hero accueil : vidéo"),
    ("Section vidéo studio — titre", "Section vidéo studio : titre"),
    ("Footer — baseline", "Footer : baseline"),
    ("Autoplay bloqué — le poster", "Autoplay bloqué : le poster"),
]

root = Path(__file__).resolve().parents[2]
exts = {".html", ".json", ".js", ".css", ".md", ".txt"}
updated = 0

for path in sorted(root.rglob("*")):
    if not path.is_file() or path.suffix not in exts:
        continue
    if "65939d1f139e1daa37da455f" in path.parts:
        continue

    text = path.read_text(encoding="utf-8")
    if EM not in text:
        continue

    new_text = text
    for old, new in REPLACEMENTS + COMMENT_REPLACEMENTS:
        new_text = new_text.replace(old, new)

    if new_text != text:
        path.write_text(new_text, encoding="utf-8")
        remaining = new_text.count(EM)
        updated += 1
        print(f"{path.relative_to(root)} ({remaining} em dash left)")

remaining_files = []
for path in sorted(root.rglob("*")):
    if not path.is_file() or path.suffix not in exts:
        continue
    if "65939d1f139e1daa37da455f" in path.parts:
        continue
    text = path.read_text(encoding="utf-8")
    if EM in text:
        remaining_files.append((path, text.count(EM)))

print("updated", updated, "files")
if remaining_files:
    print("REMAINING:")
    for path, count in remaining_files:
        print(count, path.relative_to(root))
