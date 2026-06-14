/**
 * Restaure les liens .html (homepage.html, classes.html, etc.)
 * à la place des slugs lisibles (/Accueil, /en/Home, …).
 * Usage: node _vendor/tools/revert-friendly-routes.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SKIP_DIRS = new Set(["65939d1f139e1daa37da455f", "en", "_vendor"]);

const FR_SLUG_TO_FILE = {
  Accueil: "homepage.html",
  Cours: "classes.html",
  Planning: "planning.html",
  Contact: "contact.html",
  Tarifs: "pricing.html",
  "Mentions-legales": "legal.html",
};

const EN_SLUG_TO_FILE = {
  Home: "homepage.html",
  Classes: "classes.html",
  Schedule: "planning.html",
  Contact: "contact.html",
  Pricing: "pricing.html",
  "Legal-notice": "legal.html",
};

function listHtmlPages(dir, base, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      listHtmlPages(full, base, out);
      continue;
    }
    if (!name.endsWith(".html")) continue;
    out.push(path.relative(base, full).replace(/\\/g, "/"));
  }
}

function prefixFor(relPath) {
  const depth = relPath.split("/").length - 1;
  return depth ? "../".repeat(depth) : "";
}

function revertFrenchHtml(html, relPath) {
  const prefix = prefixFor(relPath);
  let out = html;

  for (const [slug, file] of Object.entries(FR_SLUG_TO_FILE)) {
    const target = prefix + file;
    out = out.split('href="/' + slug + '"').join('href="' + target + '"');
    out = out.split("href='/" + slug + "'").join("href='" + target + "'");
    out = out.split('url=/' + slug).join("url=" + target);
    out = out.split('url="/' + slug + '"').join('url="' + target + '"');

    const origins = [
      "https://studiopilatesnarbonne.fr/",
      "https://studio-pilates-narbonne.vercel.app/",
    ];
    for (const origin of origins) {
      out = out.split(origin + slug + '"').join(origin + file + '"');
    }
  }

  for (const [slug, file] of Object.entries(EN_SLUG_TO_FILE)) {
    const enFile = "en/" + file;
    const origins = [
      "https://studiopilatesnarbonne.fr/",
      "https://studio-pilates-narbonne.vercel.app/",
    ];
    for (const origin of origins) {
      out = out.split(origin + "en/" + slug + '"').join(origin + enFile + '"');
    }
  }

  return out;
}

function patchIndexHtml() {
  const indexPath = path.join(ROOT, "index.html");
  let html = fs.readFileSync(indexPath, "utf8");
  html = html
    .replace(/url=\/Accueil/g, "url=homepage.html")
    .replace(/href="\/Accueil"/g, 'href="homepage.html"')
    .replace(/location\.replace\("\/Accueil"\)/g, 'location.replace("homepage.html")');
  fs.writeFileSync(indexPath, html, "utf8");
}

function main() {
  const pages = [];
  listHtmlPages(ROOT, ROOT, pages);

  let changed = 0;
  for (const relPath of pages.sort()) {
    const file = path.join(ROOT, relPath);
    const html = fs.readFileSync(file, "utf8");
    const next = revertFrenchHtml(html, relPath);
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      changed++;
    }
  }

  patchIndexHtml();
  console.log("Reverted friendly URLs in " + changed + " French page(s).");
}

main();
