/**
 * Affiche la boutique sous Plus + footer, sans toucher au CTA cours.
 * Libellé : Compléments / Supplements (pas « Boutique »).
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const FR_NAV =
  '<a href="/boutique" class="dropdown-link w-dropdown-link" data-i18n="nav.shop">Compléments</a>';
const EN_NAV =
  '<a href="/en/boutique" class="dropdown-link w-dropdown-link" data-i18n="nav.shop">Supplements</a>';
const FR_NAV_CURRENT =
  '<a href="/boutique" aria-current="page" class="dropdown-link w-dropdown-link w--current" data-i18n="nav.shop">Compléments</a>';
const EN_NAV_CURRENT =
  '<a href="/en/boutique" aria-current="page" class="dropdown-link w-dropdown-link w--current" data-i18n="nav.shop">Supplements</a>';

const FR_FOOTER =
  '<a href="/boutique" class="footer-link" data-i18n="nav.shop">Compléments</a>';
const EN_FOOTER =
  '<a href="/en/boutique" class="footer-link" data-i18n="nav.shop">Supplements</a>';
const FR_FOOTER_CURRENT =
  '<a href="/boutique" aria-current="page" class="footer-link w--current" data-i18n="nav.shop">Compléments</a>';
const EN_FOOTER_CURRENT =
  '<a href="/en/boutique" aria-current="page" class="footer-link w--current" data-i18n="nav.shop">Supplements</a>';

function isShopPage(rel) {
  return (
    rel === "boutique.html" ||
    rel === "en/boutique.html" ||
    rel.startsWith("boutique/") ||
    rel.startsWith("en/boutique/")
  );
}

function insertNav(html, isEn) {
  if (/dropdown-link[^"]*"[^>]*data-i18n="nav\.shop"/.test(html)) {
    return html;
  }
  const link = isEn ? EN_NAV : FR_NAV;
  return html.replace(
    /(<a href="(?:\/en)?\/voyage"[^>]*class="dropdown-link[^"]*"[^>]*>[^<]*<\/a>)/,
    "$1" + link
  );
}

function insertFooter(html, isEn) {
  if (/footer-link[^"]*"[^>]*data-i18n="nav\.shop"/.test(html)) {
    return html;
  }
  const link = isEn ? EN_FOOTER : FR_FOOTER;
  return html.replace(
    /(<a href="(?:\/en)?\/legal"[^>]*class="footer-link[^"]*"[^>]*>[^<]*<\/a>)/,
    link + "$1"
  );
}

function markCurrent(html, isEn) {
  html = html.split(isEn ? EN_NAV : FR_NAV).join(isEn ? EN_NAV_CURRENT : FR_NAV_CURRENT);
  html = html.split(isEn ? EN_FOOTER : FR_FOOTER).join(isEn ? EN_FOOTER_CURRENT : FR_FOOTER_CURRENT);
  return html;
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f" || entry.name === "_vendor") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    let html = fs.readFileSync(full, "utf8");
    const rel = path.relative(root, full).replace(/\\/g, "/");
    const isEn = rel.startsWith("en/");
    const original = html;

    html = insertNav(html, isEn);
    html = insertFooter(html, isEn);
    if (isShopPage(rel)) {
      html = markCurrent(html, isEn);
    }

    if (html !== original) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(rel);
    }
  }
}

function main() {
  const changed = [];
  walk(root, changed);
  console.log("Shop nav/footer on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
}

module.exports = { main };
