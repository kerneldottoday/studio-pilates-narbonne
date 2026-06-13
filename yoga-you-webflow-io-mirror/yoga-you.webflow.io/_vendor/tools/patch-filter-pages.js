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

function patchSharedSections(html, prefix) {
  html = html.replace(
    /Hey! I’m Jessica Kent and I’m a certified yoga and breathwork coach\./g,
    "Souhila Chekara, instructrice Pilates certifiée à Narbonne."
  );
  html = html.replace(/Trusted by hundreds/g, "Méthode authentique");
  html = html.replace(/<div>Certification<\/div>/g, "<div>Petits groupes</div>");
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

  html = html.replace(/Disconnect Breathwork/g, "RESET");
  html = html.replace(/1 Hour Pilates/g, "Pilates Reformer");
  html = html.replace(/30 Minutes Morning Yoga/gi, "Pilates Mat");
  html = html.replace(/Yoga for focus/gi, "Yoga Ashtanga");
  html = html.replace(/Intense 1 Hour Pilates/gi, "Reformer Homme");
  html = html.replace(/30 Minutes chair yoga/gi, "Cours privé");

  return html;
}

const filterPages = {
  "type/pilates.html": {
    title: "Pilates | Studio Pilates Narbonne",
    slugs: [
      "1-hour-pilates.html",
      "intense-1-hour-pilates.html",
      "30-minutes-morning-yoga.html",
      "30-minutes-chair-yoga.html",
    ],
  },
  "type/yoga.html": {
    title: "Yoga | Studio Pilates Narbonne",
    slugs: ["yoga-for-focus.html", "30-minutes-chair-yoga.html"],
  },
  "type/breathwork.html": {
    title: "RESET | Studio Pilates Narbonne",
    slugs: ["disconnect-breathwork.html"],
  },
  "duration/1-hour.html": {
    title: "1 heure | Studio Pilates Narbonne",
    slugs: [
      "1-hour-pilates.html",
      "intense-1-hour-pilates.html",
      "30-minutes-morning-yoga.html",
      "disconnect-breathwork.html",
      "30-minutes-chair-yoga.html",
    ],
  },
  "duration/30-minutes.html": {
    title: "1 h 30 | Studio Pilates Narbonne",
    slugs: ["yoga-for-focus.html"],
  },
  "duration/10-minutes.html": {
    title: "Cours | Studio Pilates Narbonne",
    slugs: ["30-minutes-chair-yoga.html"],
  },
};

const updated = [];

Object.keys(filterPages).forEach(function (relPath) {
  const cfg = filterPages[relPath];
  const filePath = path.join(root, relPath);
  if (!fs.existsSync(filePath)) return;

  let html = fs.readFileSync(filePath, "utf8");
  const prefix = "../";
  const tiles = cfg.slugs.map(function (slug) {
    return buildListingTile(slug, prefix);
  }).join("");

  html = html.replace(/<title>[^<]*<\/title>/, "<title>" + cfg.title + "</title>");
  html = html.replace(
    /<meta content="Breathwork" property="og:title"\/>/,
    '<meta content="RESET" property="og:title"/>'
  );
  html = html.replace(
    /<meta content="Breathwork" name="twitter:title"\/>/,
    '<meta content="RESET" name="twitter:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:title"\/>/,
    '<meta content="' + cfg.title.replace(" | Studio Pilates Narbonne", "") + '" property="og:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:title"\/>/,
    '<meta content="' + cfg.title.replace(" | Studio Pilates Narbonne", "") + '" name="twitter:title"/>'
  );

  html = html.replace(
    /<div role="list" class="grid-classes-thirds w-dyn-items">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\/section><section class="section">/,
    '<div role="list" class="grid-classes-thirds w-dyn-items">' +
      tiles +
      "</div></div></div></section><section class=\"section\">"
  );

  html = patchSharedSections(html, prefix);
  fs.writeFileSync(filePath, html, "utf8");
  updated.push(relPath);
});

console.log("Updated filter pages (" + updated.length + "):");
updated.forEach(function (f) {
  console.log("  - " + f);
});
