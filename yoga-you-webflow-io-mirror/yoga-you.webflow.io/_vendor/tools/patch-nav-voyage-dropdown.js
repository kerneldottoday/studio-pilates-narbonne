/**
 * Ajoute « Voyages » sous « Tarifs » dans le menu Plus, FR et EN.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const FR_LINK =
  '<a href="/voyage" class="dropdown-link w-dropdown-link" data-i18n="nav.voyage">Voyages</a>';
const EN_LINK =
  '<a href="/en/voyage" class="dropdown-link w-dropdown-link" data-i18n="nav.voyage">Retreat</a>';
const FR_CURRENT =
  '<a href="/voyage" aria-current="page" class="dropdown-link w-dropdown-link w--current" data-i18n="nav.voyage">Voyages</a>';
const EN_CURRENT =
  '<a href="/en/voyage" aria-current="page" class="dropdown-link w-dropdown-link w--current" data-i18n="nav.voyage">Retreat</a>';

function insertVoyage(html, isEn) {
  if (/data-i18n="nav\.voyage"/.test(html) && /dropdown-link/.test(html)) {
    return html;
  }

  const link = isEn ? EN_LINK : FR_LINK;
  const next = html.replace(
    /(<a href="(?:\/en)?\/pricing"[^>]*class="dropdown-link[^"]*"[^>]*>[^<]*<\/a>)/,
    "$1" + link
  );
  return next;
}

function markCurrent(html, isEn) {
  const from = isEn ? EN_LINK : FR_LINK;
  const to = isEn ? EN_CURRENT : FR_CURRENT;
  return html.split(from).join(to);
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
    if (!html.includes('class="dropdown-link w-dropdown-link"')) continue;

    const rel = path.relative(root, full).replace(/\\/g, "/");
    const isEn = rel.startsWith("en/");
    const original = html;

    html = insertVoyage(html, isEn);

    const isVoyagePage = rel === "voyage.html" || rel === "en/voyage.html";
    if (isVoyagePage) {
      html = markCurrent(html, isEn);
    }

    if (html !== original) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(rel);
    }
  }
}

const changed = [];
walk(root, changed);
console.log("Voyages dropdown added on " + changed.length + " page(s)");
changed.forEach((f) => console.log("  " + f));
