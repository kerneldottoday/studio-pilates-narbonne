/**
 * Retire hero-unroll des pages internes (réservé à l'accueil FR/EN).
 * Usage: node _vendor/tools/patch-strip-hero-unroll.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const HOME_PAGES = new Set([
  "homepage.html",
  "index.html",
  path.join("en", "homepage.html"),
  path.join("en", "index.html"),
]);

function stripHeroUnroll(html) {
  return html
    .replace(/<link href="[^"]*hero-unroll\.css" rel="stylesheet" type="text\/css"\/>/g, "")
    .replace(
      /<script>document\.documentElement\.classList\.add\("hero-unroll-boot"\);<\/script>/g,
      ""
    )
    .replace(/<script src="[^"]*hero-unroll\.js" defer><\/script>/g, "");
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    const rel = path.relative(root, full);
    if (HOME_PAGES.has(rel)) continue;

    let html = fs.readFileSync(full, "utf8");
    if (!html.includes("hero-unroll")) continue;

    const next = stripHeroUnroll(html);
    if (next !== html) {
      fs.writeFileSync(full, next, "utf8");
      changed.push(rel);
    }
  }
}

const changed = [];
walk(root, changed);
console.log("Stripped hero-unroll from " + changed.length + " page(s)");
