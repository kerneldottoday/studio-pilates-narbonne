const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "_vendor/content/classes-data.json"), "utf8")
);

function buildListingTile(slug, prefix) {
  const cls = data.classes[slug];
  if (!cls) return "";
  const href = prefix + "classes/" + slug;
  return (
    '<div role="listitem" class="w-dyn-item"><a href="' +
    href +
    '" class="tile-class w-inline-block"><div class="wrap-image-class"><img alt="" loading="lazy" src="' +
    prefix +
    cls.image +
    '" sizes="(max-width: 479px) 93vw, (max-width: 767px) 90vw, (max-width: 991px) 46vw, 31vw" srcset="' +
    prefix +
    cls.imageSrcset +
    '" class="image-class"/><div class="flex-tags-class"><div class="tag-class-tile"><img src="' +
    prefix +
    '65939d1f139e1daa37da455f/6593fffc48204b86a5f22f20_reports.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
    cls.level +
    '</div></div><div class="tag-class-tile"><img src="' +
    prefix +
    '65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
    cls.priceTag +
    '</div></div></div></div><div class="bottom-class-tile"><div class="text-heading-3">' +
    cls.title +
    "</div><div>" +
    cls.subtitle.slice(0, 100) +
    (cls.subtitle.length > 100 ? "…" : "") +
    '</div><div class="text-read-more">Réserver</div></div></a></div>'
  );
}

function extractNavbar(pricingHtml, prefix) {
  const start = pricingHtml.indexOf('<div data-animation="default" class="navbar');
  const end = pricingHtml.indexOf("</div></div></div>", start);
  let navbar = pricingHtml.slice(start, end + "</div></div></div>".length);
  navbar = navbar.replace(/href="(?!https?:|#|mailto:)([^"]+)"/g, function (_m, href) {
    if (href.startsWith("../") || href.startsWith("http")) return 'href="' + href + '"';
    return 'href="' + prefix + href + '"';
  });
  navbar = navbar.replace(/src="(?!https?:|\.\.\/)([^"]+)"/g, 'src="' + prefix + '$1"');
  return navbar;
}

function extractSharedTail(sourceHtml, prefix) {
  const marker =
    '<section class="section"><div class="w-layout-blockcontainer main-container w-container"><div class="w-layout-grid grid-combo-halves">';
  const idx = sourceHtml.lastIndexOf(marker);
  if (idx === -1) throw new Error("Shared tail marker not found");
  let tail = sourceHtml.slice(idx);
  if (prefix) {
    tail = tail.replace(/href="(?!https?:|#|mailto:|\.\.\/)([^"]+)"/g, 'href="../$1"');
    tail = tail.replace(/src="(?!https?:|\.\.\/)([^"]+)"/g, 'src="../$1"');
  }
  return tail;
}

function buildListingSection(heroTitle, heroSubtitle, slugs, prefix) {
  const tiles = slugs.map(function (slug) {
    return buildListingTile(slug, prefix);
  }).join("");

  return (
    '<section class="section dark-light"><div class="w-layout-blockcontainer main-container w-container">' +
    '<div class="flex-heading-cta mg-bottom-64"><h1 class="no-margins">' +
    heroTitle +
    "</h1><div>" +
    heroSubtitle +
    '</div></div><div class="w-dyn-list"><div role="list" class="grid-classes-thirds w-dyn-items">' +
    tiles +
    "</div></div></div></section>"
  );
}

function buildPage(options) {
  const pricing = fs.readFileSync(path.join(root, "pricing.html"), "utf8");
  const classPage = fs.readFileSync(
    path.join(root, "classes/1-hour-pilates.html"),
    "utf8"
  );
  const prefix = options.prefix || "";
  let navbar = extractNavbar(pricing, prefix);
  if (options.rel === "classes.html") {
    navbar = navbar.replace(
      '<a href="classes.html" class="nav-link w-nav-link"',
      '<a href="classes.html" aria-current="page" class="nav-link w-nav-link w--current"'
    );
  }
  const listing = buildListingSection(
    options.heroTitle,
    options.heroSubtitle,
    options.slugs,
    prefix
  );

  let tail = extractSharedTail(classPage, prefix);
  tail = tail.replace(
    /\.\.\/65939d1f139e1daa37da455f\/\.\.\/_vendor\/media\/souhila-combo\.png/g,
    prefix + "_vendor/media/souhila-combo.png"
  );
  tail = tail.replace(
    /6593c9481778903621823550_Combo%20Image%20Yoga%20You%20Webflow%20Template\.webp/g,
    prefix + "_vendor/media/souhila-combo.png"
  );
  tail = tail.replace(
    /Hey! I[\u2019']m Jessica Kent and I[\u2019']m a certified yoga and breathwork coach\./g,
    "Souhila Chekara, instructrice Pilates certifiée à Narbonne."
  );
  tail = tail.replace(/Trusted by hundreds/g, "Méthode authentique");
  tail = tail.replace(/<div>Certification<\/div>/g, "<div>Petits groupes</div>");
  tail = tail.replace(/Offline classes/g, "Suivi personnalisé");
  tail = tail.replace(/Proven success/g, "Résultats posture & mobilité");
  tail = tail.replace(/You[\u2019']ve got questions, I[\u2019']ve got answers\./g, "Des questions ? Nous sommes là.");
  tail = tail.replace(
    /Vivamus aliquet elit ac nisl\. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit\./g,
    "Réservez vos cours sur bsport ou contactez-nous pour choisir la formule adaptée à votre rythme."
  );

  const head =
    "<!DOCTYPE html><html data-wf-domain=\"yoga-you.webflow.io\" data-wf-site=\"65939d1f139e1daa37da455f\" lang=\"fr\"" +
    (options.htmlAttrs ? " " + options.htmlAttrs : "") +
    "><head><meta charset=\"utf-8\"/><title>" +
    options.pageTitle +
    "</title>" +
    (options.metaDescription
      ? '<meta content="' + options.metaDescription + '" name="description"/>'
      : "") +
    '<meta content="' +
    options.ogTitle +
    '" property="og:title"/><meta content="' +
    options.ogTitle +
    '" name="twitter:title"/><meta content="width=device-width, initial-scale=1" name="viewport"/>' +
    '<link href="' +
    prefix +
    '65939d1f139e1daa37da455f/css/yoga-you.webflow.7d97343ae.css" rel="stylesheet" type="text/css"/>' +
    '<link href="' +
    prefix +
    '_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>' +
    '<link href="' +
    prefix +
    '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>' +
    '<script src="' +
    prefix +
    '_vendor/js/i18n.js" defer></script></head><body>';

  const scripts =
    '<script src="' +
    prefix +
    '_vendor/js/jquery-3.5.1.min.js" type="text/javascript"></script>' +
    '<script src="' +
    prefix +
    '65939d1f139e1daa37da455f/js/webflow.9431d05bd.js" type="text/javascript"></script>' +
    '<script src="' +
    prefix +
    '_vendor/js/bsport-config.js" type="text/javascript"></script>' +
    '<script src="' +
    prefix +
    '_vendor/js/bsport-links.js" type="text/javascript"></script></body></html>';

  return head + navbar + listing + tail.replace(/<script[\s\S]*<\/body><\/html>$/, scripts);
}

const allSlugs = Object.keys(data.classes);

const pages = [
  {
    rel: "classes.html",
    prefix: "",
    pageTitle: "Cours | Studio Pilates Narbonne",
    metaDescription:
      "Studio Pilates Narbonne : Reformer, Mat, Yoga Ashtanga, RESET et cours privés avec Souhila Chekara.",
    ogTitle: "Cours | Studio Pilates Narbonne",
    heroTitle: "Nos cours",
    heroSubtitle:
      "Pilates Reformer, Mat, Yoga Ashtanga, RESET et séances privées — réservez sur bsport.",
    slugs: allSlugs,
    htmlAttrs: 'data-wf-page="6593a1b451d79a173861f5b8"',
  },
  {
    rel: "type/pilates.html",
    prefix: "../",
    pageTitle: "Pilates | Studio Pilates Narbonne",
    ogTitle: "Pilates",
    heroTitle: "Pilates",
    heroSubtitle: "Reformer, Mat et cours privés au studio.",
    slugs: [
      "1-hour-pilates.html",
      "intense-1-hour-pilates.html",
      "30-minutes-morning-yoga.html",
      "30-minutes-chair-yoga.html",
    ],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="pilates"',
  },
  {
    rel: "type/yoga.html",
    prefix: "../",
    pageTitle: "Yoga | Studio Pilates Narbonne",
    ogTitle: "Yoga",
    heroTitle: "Yoga",
    heroSubtitle: "Yoga Ashtanga et cours privés sur mesure.",
    slugs: ["yoga-for-focus.html", "30-minutes-chair-yoga.html"],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="yoga"',
  },
  {
    rel: "type/breathwork.html",
    prefix: "../",
    pageTitle: "RESET | Studio Pilates Narbonne",
    ogTitle: "RESET",
    heroTitle: "RESET",
    heroSubtitle: "Séance de relâchement et de recentrage, tous niveaux.",
    slugs: ["disconnect-breathwork.html"],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="breathwork"',
  },
  {
    rel: "level/beginner.html",
    prefix: "../",
    pageTitle: "Débutant | Studio Pilates Narbonne",
    ogTitle: "Débutant",
    heroTitle: "Débutant",
    heroSubtitle: "Cours accessibles pour découvrir le studio.",
    slugs: [
      "30-minutes-morning-yoga.html",
      "disconnect-breathwork.html",
      "30-minutes-chair-yoga.html",
    ],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="beginner"',
  },
  {
    rel: "level/intermediate.html",
    prefix: "../",
    pageTitle: "Intermédiaire | Studio Pilates Narbonne",
    ogTitle: "Intermédiaire",
    heroTitle: "Intermédiaire",
    heroSubtitle: "Pour approfondir Pilates et Yoga Ashtanga.",
    slugs: ["yoga-for-focus.html", "1-hour-pilates.html"],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="intermediate"',
  },
  {
    rel: "level/advanced.html",
    prefix: "../",
    pageTitle: "Avancé | Studio Pilates Narbonne",
    ogTitle: "Avancé",
    heroTitle: "Avancé",
    heroSubtitle: "Séances exigeantes pour pratiquants confirmés.",
    slugs: ["yoga-for-focus.html", "intense-1-hour-pilates.html"],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="advanced"',
  },
  {
    rel: "duration/1-hour.html",
    prefix: "../",
    pageTitle: "1 heure | Studio Pilates Narbonne",
    ogTitle: "1 heure",
    heroTitle: "Cours d'1 heure",
    heroSubtitle: "Reformer, Mat, RESET et cours privés.",
    slugs: [
      "1-hour-pilates.html",
      "intense-1-hour-pilates.html",
      "30-minutes-morning-yoga.html",
      "disconnect-breathwork.html",
      "30-minutes-chair-yoga.html",
    ],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="1-hour"',
  },
  {
    rel: "duration/30-minutes.html",
    prefix: "../",
    pageTitle: "1 h 30 | Studio Pilates Narbonne",
    ogTitle: "1 h 30",
    heroTitle: "Cours d'1 h 30",
    heroSubtitle: "Yoga Ashtanga en séance complète.",
    slugs: ["yoga-for-focus.html"],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="30-minutes"',
  },
  {
    rel: "duration/10-minutes.html",
    prefix: "../",
    pageTitle: "Cours privé | Studio Pilates Narbonne",
    ogTitle: "Cours privé",
    heroTitle: "Sur rendez-vous",
    heroSubtitle: "Séance individuelle entièrement personnalisée.",
    slugs: ["30-minutes-chair-yoga.html"],
    htmlAttrs:
      'data-wf-page="6593a25a4eeb71d5dca7e1aa" data-wf-collection="6593a25a4eeb71d5dca7e199" data-wf-item-slug="10-minutes"',
  },
];

pages.forEach(function (cfg) {
  const html = buildPage(cfg);
  fs.writeFileSync(path.join(root, cfg.rel), html, "utf8");
  console.log("Rebuilt " + cfg.rel);
});
