const fs = require("fs");
const path = require("path");

const CATALOG_PATH = path.join(__dirname, "catalog.json");
const PUBLIC_CATALOG_PATH = path.join(
  __dirname,
  "..",
  "..",
  "yoga-you-webflow-io-mirror",
  "yoga-you.webflow.io",
  "_vendor",
  "shop",
  "catalog.json"
);

const RESERVED_SLUGS = new Set([
  "panier",
  "produit",
  "commande-ok",
  "commande-annulee",
]);

const MAX_QTY = 10;
const MAX_LINES = 20;

let cached = null;
let cachedAt = 0;

function loadCatalog() {
  const mtime = fs.statSync(CATALOG_PATH).mtimeMs;
  if (!cached || mtime !== cachedAt) {
    cached = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
    cachedAt = mtime;
    assertCatalog(cached);
  }
  return cached;
}

function assertCatalog(catalog) {
  const ids = new Set();
  const slugs = new Set();
  for (const product of catalog.products || []) {
    if (!product.id || !product.slug) {
      throw new Error("Produit sans id ou slug");
    }
    if (RESERVED_SLUGS.has(product.slug)) {
      throw new Error("Slug réservé : " + product.slug);
    }
    if (ids.has(product.id) || slugs.has(product.slug)) {
      throw new Error("id ou slug dupliqué : " + product.id);
    }
    ids.add(product.id);
    slugs.add(product.slug);
    if (!Number.isInteger(product.priceCents) || product.priceCents < 0) {
      throw new Error("Prix invalide pour " + product.id);
    }
  }
}

function publicCatalog() {
  const catalog = loadCatalog();
  return {
    live: isShopLive(),
    currency: catalog.currency || "eur",
    studio: catalog.studio,
    shipping: catalog.shipping,
    products: (catalog.products || []).map(publicProduct),
  };
}

function publicProduct(product) {
  return {
    id: product.id,
    slug: product.slug,
    status: product.status,
    name: product.name,
    nameEn: product.nameEn,
    priceCents: product.priceCents,
    image: product.image,
    short: product.short,
    shortEn: product.shortEn,
    description: product.description,
    descriptionEn: product.descriptionEn,
    sku: product.sku || "",
    format: product.format || "",
    inStock: product.inStock !== false,
    vatIncluded: product.vatIncluded !== false,
  };
}

function writePublicCatalog() {
  const json = JSON.stringify(publicCatalog(), null, 2) + "\n";
  fs.mkdirSync(path.dirname(PUBLIC_CATALOG_PATH), { recursive: true });
  fs.writeFileSync(PUBLIC_CATALOG_PATH, json, "utf8");
  return PUBLIC_CATALOG_PATH;
}

function getProduct(id) {
  return (loadCatalog().products || []).find((p) => p.id === id) || null;
}

function getProductBySlug(slug) {
  return (loadCatalog().products || []).find((p) => p.slug === slug) || null;
}

function getShipping(id) {
  return (loadCatalog().shipping || []).find((s) => s.id === id) || null;
}

function isTestStripe() {
  return String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_");
}

function isShopLive() {
  const flag = String(process.env.SHOP_LIVE || "").toLowerCase();
  if (flag === "true") return true;
  if (flag === "false") return false;
  return loadCatalog().live === true;
}

function allowMockCheckout() {
  return (
    process.env.SHOP_MOCK_CHECKOUT === "true" &&
    process.env.VERCEL_ENV !== "production"
  );
}

function canSellProduct(product) {
  if (!product) return false;
  if (product.inStock === false) return false;
  if (product.status === "draft") return false;
  if (product.status === "placeholder") {
    return isTestStripe() || allowMockCheckout();
  }
  return isShopLive() || isTestStripe() || allowMockCheckout();
}

function orderEmailTo() {
  return (
    process.env.SHOP_ORDER_TO_EMAIL?.trim() ||
    loadCatalog().orderEmailTo ||
    "lahissou@hotmail.fr"
  );
}

function formatEUR(cents) {
  return (Number(cents) / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

module.exports = {
  CATALOG_PATH,
  PUBLIC_CATALOG_PATH,
  RESERVED_SLUGS,
  MAX_QTY,
  MAX_LINES,
  loadCatalog,
  publicCatalog,
  publicProduct,
  writePublicCatalog,
  getProduct,
  getProductBySlug,
  getShipping,
  isTestStripe,
  isShopLive,
  allowMockCheckout,
  canSellProduct,
  orderEmailTo,
  formatEUR,
};
