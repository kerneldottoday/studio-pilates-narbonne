from pathlib import Path

HOMEPAGE = Path(
    r"C:\Users\recca\Desktop\Website pilates\yoga-you-webflow-io-mirror\yoga-you.webflow.io\homepage.html"
)
text = HOMEPAGE.read_text(encoding="utf-8")

text = text.replace('>Start class</div>', '>Réserver</div>')
text = text.replace(
    "Phasellus accumsan cursus velit. Maecenas vestibulum mollis diam. Fusce risus nisl, viverra et, tempor et, pretium in, sapien. Etiam ut purus mattis mauris sodales aliquam. Proin magna.",
    "En petits groupes, progressez avec des corrections ciblées dans un cadre calme et bienveillant.",
)

# Tab pane titles (still English discipline names)
text = text.replace(
    '<div data-w-tab="Tab 2" class="tab-pane w-tab-pane"><div class="wrap-tab-content"><div class="w-layout-grid grid-tab-content"><div id="w-node-_5e70e026-1281-9721-175d-7cbb165cd3c9-165cd3b3" class="wrap-tab-image">',
    "MARKER_TAB2",
)
text = text.replace(
    '<div data-w-tab="Tab 1" class="tab-pane w-tab-pane w--tab-active"><div class="wrap-tab-content"><div class="w-layout-grid grid-tab-content"><div id="w-node-_5e70e026-1281-9721-175d-7cbb165cd3d4-165cd3b3" class="wrap-tab-image">',
    "MARKER_TAB1",
)
text = text.replace(
    '<div data-w-tab="Tab 3" class="tab-pane w-tab-pane"><div class="wrap-tab-content"><div class="w-layout-grid grid-tab-content"><div id="w-node-_5e70e026-1281-9721-175d-7cbb165cd3df-165cd3b3" class="wrap-tab-image">',
    "MARKER_TAB3",
)

text = text.replace('<h3 class="no-margins">Yoga</h3>', '<h3 class="no-margins">Pilates Reformer</h3>', 1)
text = text.replace('<h3 class="no-margins">Breathwork</h3>', '<h3 class="no-margins">Pilates Mat</h3>', 1)
text = text.replace('<h3 class="no-margins">Pilates</h3>', '<h3 class="no-margins">Yoga Ashtanga</h3>', 1)

text = text.replace("MARKER_TAB2", '<div data-w-tab="Tab 2" class="tab-pane w-tab-pane"><div class="wrap-tab-content"><div class="w-layout-grid grid-tab-content"><div id="w-node-_5e70e026-1281-9721-175d-7cbb165cd3c9-165cd3b3" class="wrap-tab-image">')
text = text.replace("MARKER_TAB1", '<div data-w-tab="Tab 1" class="tab-pane w-tab-pane w--tab-active"><div class="wrap-tab-content"><div class="w-layout-grid grid-tab-content"><div id="w-node-_5e70e026-1281-9721-175d-7cbb165cd3d4-165cd3b3" class="wrap-tab-image">')
text = text.replace("MARKER_TAB3", '<div data-w-tab="Tab 3" class="tab-pane w-tab-pane"><div class="wrap-tab-content"><div class="w-layout-grid grid-tab-content"><div id="w-node-_5e70e026-1281-9721-175d-7cbb165cd3df-165cd3b3" class="wrap-tab-image">')

# Tab descriptions - generic French text already from earlier replace of Suspendisse
tab_desc = "Cours adapté à votre niveau, dans un cadre calme et bienveillant à Narbonne."
for title, desc in [
    ("Pilates Reformer", "Cours en petit groupe sur reformer — travail précis, complet et fidèle à la méthode originale. 32 € la séance."),
    ("Pilates Mat", "Renforcement en profondeur au sol — centre, posture et alignement optimisés. 12,50 € la séance."),
    ("Yoga Ashtanga", "Pratique dynamique et fluide pour améliorer force et souplesse — adaptée à tous les niveaux. 12,50 € la séance."),
]:
    old = f'<h3 class="no-margins">{title}</h3><div class="paragraph-big">{tab_desc}</div>'
    new = f'<h3 class="no-margins">{title}</h3><div class="paragraph-big">{desc}</div>'
    if old in text:
        text = text.replace(old, new, 1)
        print("updated tab desc:", title)

HOMEPAGE.write_text(text, encoding="utf-8")
print("done")
