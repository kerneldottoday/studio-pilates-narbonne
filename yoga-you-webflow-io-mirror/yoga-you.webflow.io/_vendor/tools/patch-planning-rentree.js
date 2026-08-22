/**
 * Remplace le contenu planning FR/EN par la grille rentrée 2026 + flyer.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

function patchPlanning(relFile, gridRel, isEn) {
  const file = path.join(root, relFile);
  const gridFile = path.join(root, gridRel);
  let html = fs.readFileSync(file, "utf8");
  const grid = fs.readFileSync(gridFile, "utf8").trim();

  const start = html.indexOf('<div class="planning-intro">');
  const sectionEnd = html.indexOf("</section>", start);
  if (start < 0 || sectionEnd < 0) {
    throw new Error("markers not found in " + relFile);
  }
  const endContainer = html.lastIndexOf("</div>", sectionEnd);
  html = html.slice(0, start) + grid + "\n" + html.slice(endContainer);

  html = html.replace(
    /<title>[^<]*<\/title>/,
    isEn
      ? "<title>Schedule | Studio Pilates Narbonne</title>"
      : "<title>Planning | Studio Pilates Narbonne</title>"
  );

  html = html.replace(
    /name="description" content="[^"]*"/,
    isEn
      ? 'name="description" content="New weekly schedule at Studio Pilates Narbonne from 15 September 2026 — Reformer, RESET, Yoga and Stretching."'
      : 'name="description" content="Nouveau planning hebdomadaire du Studio Pilates Narbonne à partir du 15 septembre 2026 — Reformer, RESET, Yoga et Stretching."'
  );

  fs.writeFileSync(file, html, "utf8");
  console.log("patched", relFile);
}

function softHtml(isEn) {
  return isEn
    ? `<section class="spn-rentree-soft"><div class="spn-rentree-soft__inner">New studio trip — Tassili n’Ajjer, 12 days → <a href="/en/voyage">See the trip</a></div></section>`
    : `<section class="spn-rentree-soft"><div class="spn-rentree-soft__inner">Nouveau voyage studio — Tassili n’Ajjer, 12 jours → <a href="/voyage">Découvrir le voyage</a></div></section>`;
}

function patchHomepageSoft(relFile, isEn) {
  const file = path.join(root, relFile);
  let html = fs.readFileSync(file, "utf8");
  const soft = softHtml(isEn);
  const softRe =
    /<section class="spn-rentree-soft">[\s\S]*?<\/section>/;

  if (softRe.test(html)) {
    html = html.replace(softRe, soft);
    fs.writeFileSync(file, html, "utf8");
    console.log("soft refreshed on", relFile);
    return;
  }

  const heroIdx = html.indexOf('class="section hero-home"');
  if (heroIdx < 0) {
    throw new Error("hero not found in " + relFile);
  }
  const insertAt = html.indexOf("</section>", heroIdx);
  if (insertAt < 0) throw new Error("hero close not found");
  html =
    html.slice(0, insertAt + "</section>".length) +
    soft +
    html.slice(insertAt + "</section>".length);
  fs.writeFileSync(file, html, "utf8");
  console.log("soft line on", relFile);
}

patchPlanning(
  "planning.html",
  "_vendor/content/planning-rentree-grid-fr.html",
  false
);
patchPlanning(
  "en/planning.html",
  "_vendor/content/planning-rentree-grid-en.html",
  true
);
patchHomepageSoft("homepage.html", false);
patchHomepageSoft("en/homepage.html", true);

// Keep index mirrors in sync with homepage
for (const [src, dest] of [
  ["homepage.html", "index.html"],
  ["en/homepage.html", "en/index.html"],
]) {
  const from = path.join(root, src);
  const to = path.join(root, dest);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}
console.log("index mirrors synced");
