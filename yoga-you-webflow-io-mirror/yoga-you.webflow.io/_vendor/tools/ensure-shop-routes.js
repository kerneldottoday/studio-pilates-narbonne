/**
 * Ajoute les routes boutique dans vercel.json sans toucher aux crons existants.
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");
const vercelPath = path.join(REPO_ROOT, "vercel.json");

const SHOP_REWRITES = [
  { source: "/boutique", destination: "/boutique.html" },
  { source: "/boutique/panier", destination: "/boutique/panier.html" },
  { source: "/boutique/commande-ok", destination: "/boutique/commande-ok.html" },
  { source: "/boutique/commande-annulee", destination: "/boutique/commande-annulee.html" },
  { source: "/boutique/:slug", destination: "/boutique/produit.html" },
  { source: "/en/boutique", destination: "/en/boutique.html" },
  { source: "/en/boutique/panier", destination: "/en/boutique/panier.html" },
  { source: "/en/boutique/commande-ok", destination: "/en/boutique/commande-ok.html" },
  { source: "/en/boutique/commande-annulee", destination: "/en/boutique/commande-annulee.html" },
  { source: "/en/boutique/:slug", destination: "/en/boutique/produit.html" },
];

const SHOP_REDIRECTS = [
  { source: "/boutique.html", destination: "/boutique", permanent: true },
  { source: "/boutique/panier.html", destination: "/boutique/panier", permanent: true },
  { source: "/boutique/produit.html", destination: "/boutique", permanent: true },
  { source: "/boutique/commande-ok.html", destination: "/boutique/commande-ok", permanent: true },
  { source: "/boutique/commande-annulee.html", destination: "/boutique/commande-annulee", permanent: true },
  { source: "/en/boutique.html", destination: "/en/boutique", permanent: true },
  { source: "/en/boutique/panier.html", destination: "/en/boutique/panier", permanent: true },
  { source: "/en/boutique/produit.html", destination: "/en/boutique", permanent: true },
  { source: "/en/boutique/commande-ok.html", destination: "/en/boutique/commande-ok", permanent: true },
  { source: "/en/boutique/commande-annulee.html", destination: "/en/boutique/commande-annulee", permanent: true },
];

const SHOP_FUNCTIONS = {
  "api/checkout/index.js": {
    includeFiles: "lib/shop/**",
    maxDuration: 30,
  },
  "api/webhooks/stripe/index.js": {
    includeFiles: "lib/shop/**",
    maxDuration: 30,
  },
  "api/shop/catalog/index.js": {
    includeFiles: "lib/shop/**",
  },
};

function upsertBySource(list, rules) {
  const bySource = new Map();
  for (const rule of list || []) {
    bySource.set(rule.source, rule);
  }
  for (const rule of rules) {
    bySource.set(rule.source, rule);
  }
  const sources = new Set(rules.map((r) => r.source));
  const rest = [];
  const shop = [];
  for (const rule of bySource.values()) {
    if (sources.has(rule.source)) shop.push(rule);
    else rest.push(rule);
  }
  return rest.concat(shop);
}

function main() {
  const cfg = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  cfg.functions = Object.assign({}, cfg.functions || {}, SHOP_FUNCTIONS);
  cfg.rewrites = upsertBySource(cfg.rewrites, SHOP_REWRITES);
  cfg.redirects = upsertBySource(cfg.redirects, SHOP_REDIRECTS);
  fs.writeFileSync(vercelPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");
  console.log("Shop routes merged into vercel.json");
}

if (require.main === module) {
  main();
}

module.exports = { main, SHOP_REWRITES, SHOP_REDIRECTS };
