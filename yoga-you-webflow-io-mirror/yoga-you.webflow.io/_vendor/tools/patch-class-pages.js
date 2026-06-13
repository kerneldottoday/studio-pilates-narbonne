const fs = require("fs");
const path = require("path");
const {
  buildNavbar,
  buildFooter,
  replaceNavbar,
  replaceFooter,
} = require("./nav-shell");

const root = path.join(__dirname, "..", "..");
const data = JSON.parse(
  fs.readFileSync(path.join(root, "_vendor/content/classes-data.json"), "utf8")
);
const bodiesDir = path.join(root, "_vendor/content/class-bodies");
const classesDir = path.join(root, "classes");

function patchClassShell(html, slug) {
  html = replaceNavbar(
    html,
    buildNavbar({ prefix: "../", active: "classes", classSlug: slug })
  );
  html = replaceFooter(
    html,
    buildFooter({ prefix: "../", active: "classes", classSlug: slug })
  );
  return html;
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function prefixSrcset(prefix, srcset) {
  return srcset
    .split(",")
    .map(function (part) {
      const bits = part.trim().split(/\s+/);
      if (!bits[0].startsWith("http") && !bits[0].startsWith("../")) {
        bits[0] = prefix + bits[0];
      }
      return bits.join(" ");
    })
    .join(", ");
}

function buildRelatedTiles(relatedSlugs, assetPrefix) {
  return relatedSlugs
    .map(function (slug) {
      const cls = data.classes[slug];
      if (!cls) return "";
      const href = slug;
      return (
        '<div role="listitem" class="w-dyn-item"><a href="' +
        href +
        '" class="tile-class w-inline-block"><div class="wrap-image-class"><img alt="" loading="lazy" src="' +
        assetPrefix +
        cls.image +
        '" sizes="(max-width: 479px) 93vw, (max-width: 767px) 90vw, (max-width: 991px) 46vw, 31vw" srcset="' +
        prefixSrcset(assetPrefix, cls.imageSrcset) +
        '" class="image-class"/><div class="flex-tags-class"><div class="tag-class-tile"><img src="' +
        assetPrefix +
        "65939d1f139e1daa37da455f/6593fffc48204b86a5f22f20_reports.svg" +
        '" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
        cls.level +
        '</div></div><div class="tag-class-tile"><img src="' +
        assetPrefix +
        "65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" +
        '" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
        cls.duration +
        '</div></div></div></div><div class="bottom-class-tile"><h3 class="no-margins">' +
        cls.title +
        "</h3><div>" +
        cls.subtitle.slice(0, 90) +
        (cls.subtitle.length > 90 ? "…" : "") +
        '</div><div class="text-read-more">Réserver</div></div></a></div>'
      );
    })
    .join("");
}

function buildListingTile(slug, prefix) {
  const cls = data.classes[slug];
  const href = prefix + "classes/" + slug;
  const headingTag = prefix === "" ? "div" : "h3";
  const headingClass =
    headingTag === "div"
      ? ' class="text-heading-3"'
      : ' class="no-margins"';
  return (
    '<div role="listitem" class="w-dyn-item"><a href="' +
    href +
    '" class="tile-class w-inline-block"><div class="wrap-image-class"><img alt="" loading="lazy" src="' +
    (prefix === "" ? "" : "../") +
    cls.image +
    '" sizes="(max-width: 479px) 93vw, (max-width: 767px) 90vw, (max-width: 991px) 46vw, 31vw" srcset="' +
    prefixSrcset(prefix === "" ? "" : "../", cls.imageSrcset) +
    '" class="image-class"/><div class="flex-tags-class"><div class="tag-class-tile"><img src="' +
    (prefix === "" ? "" : "../") +
    '65939d1f139e1daa37da455f/6593fffc48204b86a5f22f20_reports.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
    cls.level +
    '</div></div><div class="tag-class-tile"><img src="' +
    (prefix === "" ? "" : "../") +
    '65939d1f139e1daa37da455f/6593fffd372b8e57c549dd4e_clock.svg" loading="lazy" alt="" class="icon-class-tag-tile"/><div>' +
    cls.priceTag +
    '</div></div></div></div><div class="bottom-class-tile"><' +
    headingTag +
    headingClass +
    ">" +
    cls.title +
    "</" +
    headingTag +
    "><div>" +
    cls.subtitle.slice(0, 100) +
    (cls.subtitle.length > 100 ? "…" : "") +
    '</div><div class="text-read-more">Réserver</div></div></a></div>'
  );
}

function patchSharedSections(html, prefix) {
  html = html.replace(
    /Hey! I’m Jessica Kent and I’m a certified yoga and breathwork coach\./g,
    "Souhila Chekara, instructrice Pilates certifiée à Narbonne."
  );
  html = html.replace(/Trusted by hundreds/g, "Méthode authentique");
  html = html.replace(
    /<div>Certification<\/div>/g,
    "<div>Petits groupes</div>"
  );
  html = html.replace(/Offline classes/g, "Suivi personnalisé");
  html = html.replace(/Proven success/g, "Résultats posture & mobilité");

  html = html.replace(
    /6593c9481778903621823550_Combo%20Image%20Yoga%20You%20Webflow%20Template\.webp/g,
    prefix + "_vendor/media/souhila-combo.png"
  );
  html = html.replace(
    /srcset="[^"]*6593c9481778903621823550_Combo[^"]*"/g,
    ""
  );

  html = html.replace(
    /You’ve got questions, I’ve got answers\./g,
    "Des questions ? Nous sommes là."
  );
  html = html.replace(
    /Vivamus aliquet elit ac nisl\. Aenean posuere, tortor sed cursus feugiat, nunc augue blandit\./g,
    "Réservez vos cours sur bsport ou contactez-nous pour choisir la formule adaptée à votre rythme."
  );

  const faqReplacements = [
    [
      "How much can I customise Webflow template?",
      "Comment réserver un cours ?",
      "Choisissez votre créneau sur bsport, créez un compte si besoin et validez votre réservation en ligne. Les places en Reformer partent vite : pensez à réserver à l'avance.",
    ],
    [
      "Do you offer discounts?",
      "Quels sont les tarifs ?",
      "Reformer : 32 € la séance, cartes 5 et 10 cours disponibles. Pilates Mat et Yoga Ashtanga : 12,50 € la séance. Consultez la page Tarifs ou bsport pour les formules à jour.",
    ],
    [
      "Why Yoga You is a great template?",
      "Faut-il une expérience préalable ?",
      "Non pour le Mat débutant et les créneaux tous niveaux. Les séances intermédiaires demandent une base en Pilates ou Yoga. Souhila adapte les exercices à chaque participant.",
    ],
    [
      "What value Yoga You Template brings?",
      "Que faut-il apporter ?",
      "Tenue confortable, chaussettes antidérapantes pour le Reformer, bouteille d'eau. Pour le Yoga Ashtanga en extérieur, prévoyez un tapis et une tenue adaptée à la météo.",
    ],
    [
      "Who is Wavesdesign?",
      "Où se trouve le studio ?",
      "Studio Pilates Narbonne, 8 Rue du Luxembourg, 11100 Narbonne. Accès facile en centre-ville.",
    ],
    [
      "Why Wavesdesign templates are the best?",
      "Puis-je annuler une réservation ?",
      "Les conditions d'annulation sont celles indiquées sur bsport au moment de la réservation. En cas de question, contactez-nous par téléphone ou email.",
    ],
  ];

  faqReplacements.forEach(function (item) {
    html = html.replace(
      '<div class="heading-expandable">' + item[0] + "</div>",
      '<div class="heading-expandable">' + item[1] + "</div>"
    );
  });

  let faqIndex = 0;
  html = html.replace(
    /<p class="faq-paragraph">Lorem ipsum dolor sit amet, consectetur adipiscing elit\. Etiam vitae posuere nisl\. In dictum luctus arcu, eget feugiat quam varius at\. Fusce magna ante, Lorem ipsum dolor sit amet, consectetur adipiscing elit\. Etiam vitae posuere nisl\. In dictum luctus arcu, eget feugiat quam varius at\. Fusce magna ante,<\/p>/g,
    function () {
      const item = faqReplacements[faqIndex];
      faqIndex += 1;
      return item ? '<p class="faq-paragraph">' + item[2] + "</p>" : arguments[0];
    }
  );

  return html;
}

function patchClassPage(filename, cls) {
  const filePath = path.join(classesDir, filename);
  let html = fs.readFileSync(filePath, "utf8");
  const body = fs.readFileSync(
    path.join(bodiesDir, cls.bodyFile),
    "utf8"
  ).trim();
  const pageTitle = cls.title + " | Studio Pilates Narbonne";

  html = html.replace(/<title>[^<]*<\/title>/, "<title>" + pageTitle + "</title>");
  html = html.replace(
    /<meta content="[^"]*" name="description"\/>/,
    '<meta content="' + cls.metaDescription + '" name="description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:title"\/>/,
    '<meta content="' + cls.title + '" property="og:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:description"\/>/,
    '<meta content="' + cls.metaDescription + '" property="og:description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:title"\/>/,
    '<meta content="' + cls.title + '" name="twitter:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:description"\/>/,
    '<meta content="' + cls.metaDescription + '" name="twitter:description"/>'
  );

  html = html.replace(
    /(<div data-w-id="3f4b5e42-be7e-84ce-4d01-95c3061b5668"[^>]*class="title-wrap-class"><h1>)[^<]*(<\/h1>)/,
    "$1" + cls.title + "$2"
  );

  const detailsPattern =
    /(<div class="master-details-hero-class">)([\s\S]*?)(<\/div><div class="limit-subtitle-class">)/;
  html = html.replace(detailsPattern, function (_match, start, _middle, end) {
    return (
      start +
      '<div class="single-detail-hero-class"><img src="../65939d1f139e1daa37da455f/6593f7028f3f7a644368407d_reports.svg" loading="lazy" alt="" class="icon-detail-class-hero"/><div>' +
      cls.level +
      '</div></div><div class="circle-hero-detail-class"></div><div class="single-detail-hero-class"><img src="../65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg" loading="lazy" alt="" class="icon-detail-class-hero"/><div>' +
      cls.duration +
      '</div></div><div class="circle-hero-detail-class"></div><div class="single-detail-hero-class"><img src="../65939d1f139e1daa37da455f/6594d58ef9cce0861fbeccbd_Filter%20Type.svg" loading="lazy" alt="" class="icon-detail-class-hero"/><div>' +
      cls.discipline +
      "</div></div>" +
      end
    );
  });

  html = html.replace(
    /(<div class="limit-subtitle-class"><div class="subtitle">)[^<]*(<\/div>)/,
    "$1" + cls.subtitle + "$2"
  );

  html = html.replace(
    /<div class="w-richtext">[\s\S]*?<\/div>\s*<\/div>\s*<\/section><section class="section dark-light">/,
    '<div class="w-richtext">' +
      body +
      '</div></div></section><section class="section dark-light">'
  );

  html = html.replace(
    /More classes for you/g,
    "D'autres cours pour vous"
  );

  html = html.replace(
    /<div role="list" class="grid-classes-thirds w-dyn-items">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section><section class="section">/,
    '<div role="list" class="grid-classes-thirds w-dyn-items">' +
      buildRelatedTiles(cls.related, "../") +
      "</div></div></div></section><section class=\"section\">"
  );

  html = patchSharedSections(html, "../");
  html = patchClassShell(html, filename);

  fs.writeFileSync(filePath, html, "utf8");
  return filename;
}

function patchClassesListing() {
  return "classes.html (use repair-listing-pages.js)";
}

function patchHomepageSlider() {
  const filePath = path.join(root, "homepage.html");
  let html = fs.readFileSync(filePath, "utf8");
  const mapping = [
    ["1-hour-pilates.html", "1-hour-pilates.html"],
    ["30-minutes-morning-yoga.html", "30-minutes-morning-yoga.html"],
    ["yoga-for-focus.html", "yoga-for-focus.html"],
    ["disconnect-breathwork.html", "disconnect-breathwork.html"],
    ["intense-1-hour-pilates.html", "intense-1-hour-pilates.html"],
    ["30-minutes-chair-yoga.html", "30-minutes-chair-yoga.html"],
  ];

  mapping.forEach(function (pair) {
    const slug = pair[0];
    const cls = data.classes[slug];
    if (!cls) return;

    html = html.replace(
      new RegExp(
        "(<a href=\"classes/" +
          escapeRegex(slug) +
          "\"[\\s\\S]*?<h3 class=\"no-margins\">)[^<]*(<\\/h3>)",
        "g"
      ),
      "$1" + cls.title + "$2"
    );

    html = html.replace(
      new RegExp(
        "(<a href=\"classes/" +
          escapeRegex(slug) +
          "\"[\\s\\S]*?<div class=\"tag-class-tile\"><img[\\s\\S]*?class=\"icon-class-tag-tile\"\\/><div>)[^<]*(<\\/div><\\/div><div class=\"tag-class-tile\"><img[\\s\\S]*?class=\"icon-class-tag-tile\"\\/><div>)[^<]*(<\\/div>)",
        "g"
      ),
      "$1" + cls.level + "$2" + cls.priceTag + "$3"
    );

    const descPattern = new RegExp(
      '(<a href="classes/' +
        escapeRegex(slug) +
        '"[\\s\\S]*?<h3 class="no-margins">' +
        escapeRegex(cls.title) +
        '<\\/h3><div>)[^<]*(<\\/div><div class="text-read-more">)',
      "g"
    );
    html = html.replace(
      descPattern,
      "$1" + cls.subtitle.slice(0, 100) + (cls.subtitle.length > 100 ? "…" : "") + "$2"
    );
  });

  html = html.replace(/Disconnect Breathwork/g, "RESET");
  html = html.replace(/30 Minutes chair yoga/gi, "Cours privé");
  html = html.replace(/1 Hour Pilates/g, "Pilates Reformer");
  html = html.replace(/30 Minutes Morning Yoga/gi, "Pilates Mat");
  html = html.replace(/Yoga for focus/gi, "Yoga Ashtanga");
  html = html.replace(/Intense 1 Hour Pilates/gi, "Reformer Homme");

  fs.writeFileSync(filePath, html, "utf8");
  return "homepage.html";
}

const updated = [];
Object.keys(data.classes).forEach(function (filename) {
  updated.push(patchClassPage(filename, data.classes[filename]));
});
updated.push(patchClassesListing());
updated.push(patchHomepageSlider());

console.log("Updated class content on " + updated.length + " file(s):");
updated.forEach(function (f) {
  console.log("  - " + f);
});
