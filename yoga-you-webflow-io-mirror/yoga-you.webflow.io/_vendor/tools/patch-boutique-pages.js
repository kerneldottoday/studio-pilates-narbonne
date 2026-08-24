/**
 * Génère les pages boutique FR/EN à partir du shell blog.html.
 * Usage: node _vendor/tools/patch-boutique-pages.js
 */
const fs = require("fs");
const path = require("path");
const { writePublicCatalog } = require("../../../../lib/shop/catalog");
const { SITE_ORIGIN } = require("./site-config");
const { main: ensureShopRoutes } = require("./ensure-shop-routes");

const root = path.join(__dirname, "..", "..");
const CART_ICON =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M6 7h15l-1.4 8.2a2 2 0 0 1-2 1.8H9.2a2 2 0 0 1-2-1.7L6 7Z"/><path d="M6 7 5 4H2"/><circle cx="10" cy="20" r="1.2"/><circle cx="18" cy="20" r="1.2"/></svg>';

const PAGES = [
  {
    rel: "boutique.html",
    content: "boutique-listing.html",
    titleFr: "Boutique | Studio Pilates Narbonne",
    titleEn: "Shop | Studio Pilates Narbonne",
    descFr:
      "Compléments alimentaires du Studio Pilates Narbonne : commande en ligne, envoi par Souhila ou retrait au studio.",
    descEn:
      "Food supplements from Studio Pilates Narbonne: order online, shipped by Souhila or picked up at the studio.",
    path: "/boutique",
  },
  {
    rel: "boutique/produit.html",
    content: "boutique-product.html",
    titleFr: "Produit | Studio Pilates Narbonne",
    titleEn: "Product | Studio Pilates Narbonne",
    descFr: "Fiche produit de la boutique compléments du Studio Pilates Narbonne.",
    descEn: "Product page for the Studio Pilates Narbonne supplements shop.",
    path: "/boutique/produit",
  },
  {
    rel: "boutique/panier.html",
    content: "boutique-cart.html",
    titleFr: "Panier | Studio Pilates Narbonne",
    titleEn: "Cart | Studio Pilates Narbonne",
    descFr: "Votre panier de compléments alimentaires, Studio Pilates Narbonne.",
    descEn: "Your supplements cart, Studio Pilates Narbonne.",
    path: "/boutique/panier",
  },
  {
    rel: "boutique/commande-ok.html",
    content: "boutique-success.html",
    titleFr: "Commande confirmée | Studio Pilates Narbonne",
    titleEn: "Order confirmed | Studio Pilates Narbonne",
    descFr: "Votre commande de compléments a bien été enregistrée.",
    descEn: "Your supplements order has been received.",
    path: "/boutique/commande-ok",
  },
  {
    rel: "boutique/commande-annulee.html",
    content: "boutique-cancel.html",
    titleFr: "Paiement annulé | Studio Pilates Narbonne",
    titleEn: "Payment cancelled | Studio Pilates Narbonne",
    descFr: "Le paiement a été annulé. Aucun montant n’a été débité.",
    descEn: "Payment was cancelled. Nothing was charged.",
    path: "/boutique/commande-annulee",
  },
];

function depthPrefix(rel, locale) {
  const segs = rel.split("/").length - 1;
  const extra = locale === "en" ? 1 : 0;
  const n = segs + extra;
  return n ? "../".repeat(n) : "";
}

function applyPrefix(html, prefix) {
  if (!prefix) return html;
  return html
    .replace(/\b(href|src)="(_vendor\/)/g, "$1=\"" + prefix + "$2")
    .replace(/\b(href|src)="(65939)/g, "$1=\"" + prefix + "$2");
}

function toEnHrefs(html) {
  return html.replace(/\bhref="(\/[^"]*)"/g, function (_m, href) {
    if (href.startsWith("/en") || href.startsWith("//") || href.startsWith("/_vendor")) {
      return 'href="' + href + '"';
    }
    if (href === "/") return 'href="/en"';
    return 'href="/en' + href + '"';
  });
}

function setMeta(html, title, desc, canonical, locale) {
  const robots = '<meta name="robots" content="noindex, nofollow"/>';
  if (!html.includes('name="robots"')) {
    html = html.replace("<meta charset=\"utf-8\"/>", "<meta charset=\"utf-8\"/>" + robots);
  }
  html = html.replace(/<title>[^<]*<\/title>/, "<title>" + title + "</title>");
  html = html.replace(
    /<meta content="[^"]*" name="description"\/>/,
    '<meta content="' + desc + '" name="description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:title"\/>/,
    '<meta content="' + title + '" property="og:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:description"\/>/,
    '<meta content="' + desc + '" property="og:description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" (?:name|property)="twitter:title"\/>/,
    '<meta content="' + title + '" property="twitter:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" (?:name|property)="twitter:description"\/>/,
    '<meta content="' + desc + '" property="twitter:description"/>'
  );
  const abs = SITE_ORIGIN + canonical;
  const enAbs = SITE_ORIGIN + (canonical.startsWith("/en/") ? canonical : "/en" + canonical);
  const frAbs = SITE_ORIGIN + canonical.replace(/^\/en/, "") ;
  html = html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>\n?/g, "");
  html = html.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>\n?/g, "");
  html = html.replace(
    /<meta content="[^"]*" property="og:url"\/>/,
    '<meta content="' + abs + '" property="og:url"/>'
  );
  const links =
    '<link rel="alternate" hreflang="fr" href="' +
    frAbs +
    '" />\n' +
    '<link rel="alternate" hreflang="en" href="' +
    enAbs +
    '" />\n' +
    '<link rel="alternate" hreflang="x-default" href="' +
    frAbs +
    '" />\n' +
    '<link rel="canonical" href="' +
    abs +
    '" />\n';
  html = html.replace("</head>", links + "</head>");
  html = html.replace(/<html([^>]*?)\s+lang="[^"]*"/, '<html$1 lang="' + locale + '"');
  return html;
}

function injectShopAssets(html) {
  if (!html.includes("boutique.css")) {
    html = html.replace(
      /(<link href="(?:\.\.\/)*_vendor\/css\/i18n\.css" rel="stylesheet" type="text\/css"\/>)/,
      '$1<link href="_vendor/css/boutique.css" rel="stylesheet" type="text/css"/>'
    );
  }
  if (!html.includes("shop-cart.js")) {
    html = html.replace(
      "</body>",
      '<script src="_vendor/js/shop-cart.js" defer></script>' +
        '<script src="_vendor/js/shop-ui.js" defer></script></body>'
    );
  }
  html = html.replace(/<body(?![^>]*page-shop)/, '<body class="page-shop"');
  html = html.replace('<body class="page-shop" class="', '<body class="page-shop ');
  return html;
}

function injectCartLink(html, locale) {
  if (html.includes("data-shop-cart-link")) return html;
  const href = locale === "en" ? "/en/boutique/panier" : "/boutique/panier";
  const link =
    '<a href="' +
    href +
    '" class="shop-cart-link" data-shop-cart-link aria-label="Panier">' +
    CART_ICON +
    '<span class="shop-cart-count" data-shop-cart-count hidden>0</span></a>';
  return html.replace(
    '<a href="https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0" class="cta navbar-cta',
    link +
      '<a href="https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0" class="cta navbar-cta'
  );
}

function replaceMain(html, section) {
  const start = html.search(/<section class="section /);
  const footer = html.indexOf('<section class="footer">');
  if (start < 0 || footer < 0) {
    throw new Error("shell markers not found");
  }
  return html.slice(0, start) + section + html.slice(footer);
}

function writePage(page, locale) {
  const shell = fs.readFileSync(path.join(root, "blog.html"), "utf8");
  const section = fs.readFileSync(
    path.join(root, "_vendor", "content", page.content),
    "utf8"
  ).trim();
  let html = replaceMain(shell, section);
  html = injectShopAssets(html);
  html = injectCartLink(html, locale);
  const title = locale === "en" ? page.titleEn : page.titleFr;
  const desc = locale === "en" ? page.descEn : page.descFr;
  const canonical = locale === "en" ? "/en" + page.path : page.path;
  html = setMeta(html, title, desc, canonical, locale);
  if (locale === "en") {
    html = toEnHrefs(html);
    html = html.replace(
      '<button type="button" class="lang-link w--current" data-lang="fr"',
      '<button type="button" class="lang-link" data-lang="fr"'
    );
    html = html.replace(
      '<button type="button" class="lang-link" data-lang="en"',
      '<button type="button" class="lang-link w--current" data-lang="en"'
    );
  }
  html = applyPrefix(html, depthPrefix(page.rel, locale));
  const destRel = locale === "en" ? "en/" + page.rel : page.rel;
  const dest = path.join(root, destRel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.writeFileSync(dest, html, "utf8");
  return destRel;
}

function main() {
  writePublicCatalog();
  const written = [];
  for (const page of PAGES) {
    written.push(writePage(page, "fr"));
    written.push(writePage(page, "en"));
  }
  ensureShopRoutes();
  require("./patch-nav-shop").main();
  console.log("Boutique pages: " + written.join(", "));
}

if (require.main === module) {
  main();
}

module.exports = { main };
