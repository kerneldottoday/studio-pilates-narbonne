const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const BRAND = "Studio Pilates Narbonne";

const replacements = [
  [
    '<span class="brand-text brand-navbar">Studio Pilates Narbonne</span>',
    '<span class="brand-text brand-navbar" data-i18n-skip><strong>Studio Pilates Narbonne</strong></span>',
  ],
  [
    '<span class="brand-text brand-footer">Studio Pilates Narbonne</span>',
    '<span class="brand-text brand-footer" data-i18n-skip><strong>Studio Pilates Narbonne</strong></span>',
  ],
];

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html") && !entry.name.endsWith(".txt")) continue;

    let html = fs.readFileSync(full, "utf8");
    if (!html.includes(BRAND)) continue;

    const original = html;
    for (const [from, to] of replacements) {
      html = html.split(from).join(to);
    }
    if (html !== original) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(path.relative(root, full));
    }
  }
}

const changed = [];
walk(root, changed);
console.log("Updated brand markup on " + changed.length + " file(s)");
changed.forEach((f) => console.log("  " + f));
