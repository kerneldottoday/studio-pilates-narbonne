const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const contact = fs.readFileSync(path.join(root, "contact.html"), "utf8");
const homepage = fs.readFileSync(path.join(root, "homepage.html"), "utf8");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "_vendor/content/classes-data.json"), "utf8")
);

function buildTile(slug) {
  const cls = data.classes[slug];
  return (
    '<div role="listitem" class="w-dyn-item"><a href="classes/' +
    slug +
    '" class="tile-class w-inline-block"><div class="wrap-image-class"><img alt="" loading="lazy" src="' +
    cls.image +
    '" sizes="(max-width: 479px) 93vw, (max-width: 767px) 90vw, (max-width: 991px) 46vw, 31vw" srcset="' +
    cls.imageSrcset +
    '" class="image-class"/><div class="flex-tags-class"><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffc48204b86a5f22f20_reports.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
    cls.level +
    '</div></div><div class="tag-class-tile"><img src="65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
    cls.priceTag +
    '</div></div></div></div><div class="bottom-class-tile"><div class="text-heading-3">' +
    cls.title +
    "</div><div>" +
    cls.subtitle.slice(0, 100) +
    (cls.subtitle.length > 100 ? "…" : "") +
    '</div><div class="text-read-more">Réserver</div></div></a></div>'
  );
}

const filtersHtml =
  '<div class="master-filters"><div class="left-filters">' +
  '<div data-hover="false" data-delay="0" class="dropdown-filter w-dropdown">' +
  '<div class="dropdown-toggle-filter w-dropdown-toggle"><img src="65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-filter"/><div>Niveau</div></div>' +
  '<nav class="dropdown-list w-dropdown-list"><div class="w-dyn-list"><div role="list" class="list-filters w-dyn-items">' +
  '<div role="listitem" class="w-dyn-item"><a href="level/advanced.html" class="dropdown-link w-dropdown-link">Avancé</a></div>' +
  '<div role="listitem" class="w-dyn-item"><a href="level/intermediate.html" class="dropdown-link w-dropdown-link">Intermédiaire</a></div>' +
  '<div role="listitem" class="w-dyn-item"><a href="level/beginner.html" class="dropdown-link w-dropdown-link">Débutant</a></div>' +
  "</div></div></nav></div>" +
  '<div data-hover="false" data-delay="0" class="dropdown-filter w-dropdown">' +
  '<div class="dropdown-toggle-filter w-dropdown-toggle"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-filter"/><div>Durée</div></div>' +
  '<nav class="dropdown-list w-dropdown-list"><div class="w-dyn-list"><div role="list" class="list-filters w-dyn-items">' +
  '<div role="listitem" class="w-dyn-item"><a href="duration/1-hour.html" class="dropdown-link w-dropdown-link">1 heure</a></div>' +
  '<div role="listitem" class="w-dyn-item"><a href="duration/30-minutes.html" class="dropdown-link w-dropdown-link">1 h 30</a></div>' +
  '<div role="listitem" class="w-dyn-item"><a href="duration/10-minutes.html" class="dropdown-link w-dropdown-link">Sur rendez-vous</a></div>' +
  "</div></div></nav></div>" +
  '<div data-hover="false" data-delay="0" class="dropdown-filter w-dropdown">' +
  '<div class="dropdown-toggle-filter w-dropdown-toggle"><img src="65939d1f139e1daa37da455f/6594d58ef9cce0861fbeccbd_Filter%20Type.svg" loading="lazy" alt="" class="icon-filter"/><div>Type</div></div>' +
  '<nav class="dropdown-list w-dropdown-list"><div class="w-dyn-list"><div role="list" class="list-filters w-dyn-items">' +
  '<div role="listitem" class="w-dyn-item"><a href="type/pilates.html" class="dropdown-link w-dropdown-link">Pilates</a></div>' +
  '<div role="listitem" class="w-dyn-item"><a href="type/yoga.html" class="dropdown-link w-dropdown-link">Yoga</a></div>' +
  '<div role="listitem" class="w-dyn-item"><a href="type/breathwork.html" class="dropdown-link w-dropdown-link">RESET</a></div>' +
  "</div></div></nav></div></div>" +
  '<a href="https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0" target="_blank" rel="noopener noreferrer" class="cta w-button">Réserver sur bsport</a></div>';

const tiles = Object.keys(data.classes).map(buildTile).join("");

const classesSection =
  '<section class="section dark-light hero-classes"><div class="w-layout-blockcontainer main-container w-container">' +
  '<div class="title-wrap-classes"><h1>Nos cours</h1><div class="subtitle">Pilates Reformer, Mat, Yoga Ashtanga, RESET et séances privées avec Souhila Chekara à Narbonne.</div></div>' +
  filtersHtml +
  '<div class="w-dyn-list"><div role="list" class="grid-classes-thirds w-dyn-items">' +
  tiles +
  "</div></div></div></section>";

const headEnd = contact.indexOf("</head>") + "</head>".length;
const bodyStart = contact.indexOf("<body>") + "<body>".length;
const firstSection = contact.indexOf("<section", contact.indexOf("navbar"));
const footerStart = contact.indexOf('<section class="footer">');

let head = contact.slice(0, headEnd);
head = head.replace(
  /<title>[^<]*<\/title>/,
  "<title>Cours | Studio Pilates Narbonne</title>"
);
head = head.replace(
  /<meta content="Contact[^"]*" name="description"\/>/,
  '<meta content="Studio Pilates Narbonne : Reformer, Mat, Yoga Ashtanga, RESET et cours privés avec Souhila Chekara. Réservez sur bsport." name="description"/>'
);
head = head.replace(
  /data-wf-page="[^"]*"/,
  'data-wf-page="6593a1b451d79a173861f5b8"'
);
head = head.replace(/Contact  \| Studio Pilates Narbonne/g, "Cours | Studio Pilates Narbonne");

let navbar = contact.slice(bodyStart, firstSection);
navbar = navbar.replace(
  'href="contact.html" aria-current="page" class="nav-link w-nav-link w--current"',
  'href="contact.html" class="nav-link w-nav-link"'
);
navbar = navbar.replace(
  'href="classes.html" class="nav-link w-nav-link" data-i18n="nav.classes"',
  'href="classes.html" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.classes"'
);

const comboMarker =
  '<section class="section"><div class="w-layout-blockcontainer main-container w-container"><div class="w-layout-grid grid-combo-halves">';
const comboStart = homepage.indexOf(comboMarker);
const comboEnd =
  homepage.indexOf("</section>", comboStart) + "</section>".length;
const comboSection = homepage.slice(comboStart, comboEnd);

const faqMarker =
  '<section class="section dark-light"><div class="w-layout-blockcontainer main-container w-container"><div class="w-layout-grid grid-faq-halves">';
const faqStart = contact.indexOf(faqMarker);
const faqEnd = contact.indexOf("</section>", faqStart) + "</section>".length;
const faqSection = contact.slice(faqStart, faqEnd);

let footer = contact.slice(footerStart);
footer = footer.replace(
  'href="contact.html" aria-current="page" class="footer-link w--current"',
  'href="contact.html" class="footer-link"'
);
footer = footer.replace(
  'href="classes.html" class="footer-link"',
  'href="classes.html" aria-current="page" class="footer-link w--current"'
);

const html =
  head + "<body>" + navbar + classesSection + comboSection + faqSection + footer;
fs.writeFileSync(path.join(root, "classes.html"), html, "utf8");
console.log("Rebuilt classes.html (" + html.length + " chars)");
