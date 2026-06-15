/**
 * Ajoute « Site fait par kernel.today » sous le copyright du footer existant.
 * Usage: node _vendor/tools/patch-footer-kernel-credit.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const CREDIT_FR =
  '<div class="text-legal-footer footer-kernel-credit">Site fait par <a href="https://kernel.today" target="_blank" rel="noopener noreferrer" class="footer-kernel-credit__link">kernel.today</a></div>';

const CREDIT_EN =
  '<div class="text-legal-footer footer-kernel-credit">Site made by <a href="https://kernel.today" target="_blank" rel="noopener noreferrer" class="footer-kernel-credit__link">kernel.today</a></div>';

const COPYRIGHT_RE =
  /(<div class="text-legal-footer" data-i18n="footer\.copyright">[^<]*<\/div>)(?![\s\S]*?footer-kernel-credit)/;

function patchHtml(html, isEn) {
  const credit = isEn ? CREDIT_EN : CREDIT_FR;

  if (html.includes("footer-kernel-credit")) {
    return html.replace(
      /<div class="text-legal-footer footer-kernel-credit">[\s\S]*?<\/div>/,
      credit
    );
  }

  if (!html.includes('data-i18n="footer.copyright"')) {
    return html;
  }

  return html.replace(COPYRIGHT_RE, "$1" + credit);
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

    const rel = path.relative(root, full).replace(/\\/g, "/");
    const isEn = rel.startsWith("en/");
    const html = fs.readFileSync(full, "utf8");
    const next = patchHtml(html, isEn);
    if (next !== html) {
      fs.writeFileSync(full, next, "utf8");
      changed.push(rel);
    }
  }
}

function main() {
  const changed = [];
  walk(root, changed);
  console.log("Added kernel.today credit on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, patchHtml, CREDIT_FR, CREDIT_EN };
}
