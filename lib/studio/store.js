const fs = require("fs");
const path = require("path");
const { PRODUCTS, SCHEDULE } = require("./defaults");
const { DEFAULT_CANCEL_HOURS, normalizeCancelHours } = require("./policy");
const remote = require("./remote");

const ROOT = path.join(__dirname, "..", "..");
const DATA_DIR = process.env.VERCEL
  ? path.join("/tmp", "studio-data")
  : path.join(ROOT, ".studio-data");

// Deux modes de stockage :
// - "file"     : JSON dans .studio-data/ (dev local ; /tmp éphémère sur Vercel)
// - "supabase" : table studio_docs, hydratée en début de requête via
//                withStudioStore, persistée en fin de requête.
const DOC_KEYS = ["catalog", "orders", "bookings", "notices", "closures", "shop"];
const DOC_FILES = {
  catalog: path.join(DATA_DIR, "catalog.json"),
  orders: path.join(DATA_DIR, "orders.json"),
  bookings: path.join(DATA_DIR, "bookings.json"),
  notices: path.join(DATA_DIR, "notices.json"),
  closures: path.join(DATA_DIR, "closures.json"),
  shop: path.join(DATA_DIR, "shop.json"),
};

const ORDER_STATUSES = ["paid", "contacted", "done"];

function storeMode() {
  return remote.remoteWanted() ? "supabase" : "file";
}

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function clone(value) {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

function readJson(file, fallback) {
  try {
    ensureDir();
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, JSON.stringify(fallback, null, 2), "utf8");
      return clone(fallback);
    }
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch (_err) {
    return clone(fallback);
  }
}

function writeJson(file, data) {
  ensureDir();
  fs.writeFileSync(file, JSON.stringify(data, null, 2), "utf8");
}

// --- Cache d'hydratation (mode supabase uniquement) ---
let cache = null; // { docs, versions, dirty:Set }

function getDoc(key, fallback) {
  if (storeMode() === "file") {
    return readJson(DOC_FILES[key], fallback);
  }
  if (!cache) {
    throw new Error(
      "Studio store non hydraté (mode supabase) — envelopper le handler avec withStudioStore"
    );
  }
  const value = cache.docs[key];
  return value == null ? clone(fallback) : clone(value);
}

function setDoc(key, value) {
  if (storeMode() === "file") {
    writeJson(DOC_FILES[key], value);
    return value;
  }
  if (!cache) {
    throw new Error(
      "Studio store non hydraté (mode supabase) — envelopper le handler avec withStudioStore"
    );
  }
  cache.docs[key] = clone(value);
  cache.dirty.add(key);
  return value;
}

async function hydrateStudioStore() {
  if (storeMode() === "file") return { mode: "file" };
  const rows = await remote.fetchDocs(DOC_KEYS);
  cache = { docs: {}, versions: {}, dirty: new Set() };
  for (const key of DOC_KEYS) {
    cache.docs[key] = rows[key] ? rows[key].data : null;
    cache.versions[key] = rows[key] ? rows[key].version : null;
  }
  return { mode: "supabase" };
}

async function persistStudioStore() {
  if (storeMode() === "file" || !cache) {
    return { mode: storeMode(), saved: [] };
  }
  const saved = [];
  for (const key of Array.from(cache.dirty)) {
    const version = await remote.pushDoc(key, cache.docs[key], cache.versions[key]);
    cache.versions[key] = version;
    cache.dirty.delete(key);
    saved.push(key);
  }
  return { mode: "supabase", saved };
}

function resetStudioStoreCache() {
  cache = null;
}

function defaultCatalog() {
  return {
    live: false,
    currency: "eur",
    cancelHours: DEFAULT_CANCEL_HOURS,
    updatedAt: null,
    products: PRODUCTS.map(function (p) {
      return Object.assign({}, p);
    }),
    schedule: SCHEDULE.map(function (s) {
      return Object.assign({}, s);
    }),
  };
}

function loadCatalog() {
  const data = getDoc("catalog", defaultCatalog());
  if (!Array.isArray(data.products) || !data.products.length) {
    data.products = defaultCatalog().products;
  }
  if (!Array.isArray(data.schedule)) {
    data.schedule = defaultCatalog().schedule;
  }
  data.cancelHours = normalizeCancelHours(data.cancelHours);
  return data;
}

function saveCatalog(next) {
  next.updatedAt = new Date().toISOString();
  setDoc("catalog", next);
  return next;
}

function isTestStripe() {
  return String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_");
}

function allowMockCheckout() {
  if (process.env.VERCEL_ENV === "production") return false;
  if (String(process.env.STUDIO_MOCK_CHECKOUT || "").toLowerCase() === "true") {
    return true;
  }
  if (String(process.env.SHOP_MOCK_CHECKOUT || "").toLowerCase() === "true") {
    return true;
  }
  return !process.env.STRIPE_SECRET_KEY;
}

function isStudioLive() {
  const flag = String(process.env.STUDIO_LIVE || "").toLowerCase();
  if (flag === "true" || flag === "1") return true;
  if (flag === "false" || flag === "0") return false;
  return Boolean(loadCatalog().live);
}

function canSell() {
  return isStudioLive() || allowMockCheckout() || isTestStripe();
}

function publicCatalog() {
  const data = loadCatalog();
  return {
    live: isStudioLive(),
    canBuy: canSell(),
    mock: allowMockCheckout(),
    currency: "eur",
    products: (data.products || []).filter(function (p) {
      return p && p.active !== false;
    }),
    schedule: data.schedule || [],
  };
}

function getProduct(id) {
  return (loadCatalog().products || []).find(function (p) {
    return p.id === String(id);
  });
}

function formatEUR(cents) {
  return (Number(cents) / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function loadOrders() {
  const data = getDoc("orders", []);
  return Array.isArray(data) ? data : [];
}

function addOrder(order) {
  const list = loadOrders();
  list.unshift(order);
  setDoc("orders", list.slice(0, 200));
  return order;
}

function findOrder(sessionId) {
  const id = String(sessionId || "");
  if (!id) return null;
  return (
    loadOrders().find(function (order) {
      return order && order.sessionId === id;
    }) || null
  );
}

function upsertOrder(order) {
  const list = loadOrders();
  const idx = list.findIndex(function (item) {
    return item && item.sessionId === order.sessionId;
  });
  if (idx >= 0) {
    list[idx] = Object.assign({}, list[idx], order);
    setDoc("orders", list);
    return list[idx];
  }
  return addOrder(order);
}

function updateOrderStatus(sessionId, status) {
  if (ORDER_STATUSES.indexOf(status) < 0) return null;
  const current = findOrder(sessionId);
  if (!current) return null;
  current.status = status;
  current.updatedAt = new Date().toISOString();
  return upsertOrder(current);
}

function loadBookings() {
  const data = getDoc("bookings", []);
  return Array.isArray(data) ? data : [];
}

function addBooking(booking) {
  const list = loadBookings();
  list.unshift(booking);
  saveBookings(list);
  return booking;
}

function saveBookings(list) {
  setDoc("bookings", (Array.isArray(list) ? list : []).slice(0, 500));
  return list;
}

function loadNotices() {
  const data = getDoc("notices", []);
  return Array.isArray(data) ? data : [];
}

function addNotice(notice) {
  const list = loadNotices();
  list.unshift(notice);
  setDoc("notices", list.slice(0, 200));
  return notice;
}

function loadClosures() {
  const data = getDoc("closures", []);
  return Array.isArray(data) ? data : [];
}

function saveClosures(list) {
  setDoc("closures", (Array.isArray(list) ? list : []).slice(0, 200));
  return list;
}

// Catalogue boutique (compléments) édité par Souhila. null tant que jamais
// modifié : lib/shop/catalog.js retombe alors sur son catalog.json du repo.
function loadShopDoc() {
  const data = getDoc("shop", null);
  return data && typeof data === "object" && !Array.isArray(data) ? data : null;
}

function saveShopDoc(doc) {
  doc.updatedAt = new Date().toISOString();
  setDoc("shop", doc);
  return doc;
}

function markNoticeSent(id, extra) {
  const list = loadNotices();
  const idx = list.findIndex(function (item) {
    return item && item.id === id;
  });
  if (idx < 0) return null;
  list[idx] = Object.assign({}, list[idx], extra || {}, {
    sent: true,
    sentAt: new Date().toISOString(),
  });
  setDoc("notices", list.slice(0, 200));
  return list[idx];
}

module.exports = {
  DATA_DIR,
  ORDER_STATUSES,
  storeMode,
  hydrateStudioStore,
  persistStudioStore,
  resetStudioStoreCache,
  defaultCatalog,
  loadCatalog,
  saveCatalog,
  publicCatalog,
  getProduct,
  allowMockCheckout,
  isStudioLive,
  isTestStripe,
  canSell,
  formatEUR,
  loadOrders,
  addOrder,
  findOrder,
  upsertOrder,
  updateOrderStatus,
  loadBookings,
  addBooking,
  saveBookings,
  loadNotices,
  addNotice,
  markNoticeSent,
  loadClosures,
  saveClosures,
  loadShopDoc,
  saveShopDoc,
};
