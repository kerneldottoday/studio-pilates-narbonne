/**
 * Remplace les liens filtres Webflow (/duration/*, /type/*) par les fiches cours.
 * Usage: node _vendor/tools/patch-filter-links.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

const REPLACEMENTS = [
  [/href="\/duration\/10-minutes"/g, 'href="/classes/cours-prive"'],
  [/href="\/en\/duration\/10-minutes"/g, 'href="/en/classes/cours-prive"'],
  [/href="\/duration\/1-hour"/g, 'href="/classes"'],
  [/href="\/en\/duration\/1-hour"/g, 'href="/en/classes"'],
  [/href="\/duration\/30-minutes"/g, 'href="/classes"'],
  [/href="\/en\/duration\/30-minutes"/g, 'href="/en/classes"'],
  [/href="\/type\/breathwork"/g, 'href="/classes/reset"'],
  [/href="\/en\/type\/breathwork"/g, 'href="/en/classes/reset"'],
  [/href="\/type\/pilates"/g, 'href="/classes"'],
  [/href="\/en\/type\/pilates"/g, 'href="/en/classes"'],
  [/href="\/type\/yoga"/g, 'href="/classes/yoga-ashtanga"'],
  [/href="\/en\/type\/yoga"/g, 'href="/en/classes/yoga-ashtanga"'],
  [/href="\/blog"/g, 'href="/"'],
  [/href="\/en\/blog"/g, 'href="/en"'],
  [/href="\/mentions-legales"/g, 'href="/legal"'],
];

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    let html = fs.readFileSync(full, "utf8");
    const original = html;
    for (const [re, to] of REPLACEMENTS) {
      html = html.replace(re, to);
    }
    if (html !== original) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(path.relative(ROOT, full));
    }
  }
}

function main() {
  const changed = [];
  walk(ROOT, changed);
  console.log("Patched filter/blog/legal links on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
}

module.exports = { main };
