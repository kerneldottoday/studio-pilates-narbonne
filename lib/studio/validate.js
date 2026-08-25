const { getProduct, canSell, formatEUR } = require("./store");
const { inferKind } = require("./dates");
const { normalizeCancelHours } = require("./policy");

const MAX_QTY = 3;
const ID_RE = /^[a-z0-9-]{2,40}$/;

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || "").trim());
}

function validateCheckout(input) {
  const productId = String((input && input.productId) || "").trim();
  const qty = Number(input && input.qty);
  const locale = input && input.locale === "en" ? "en" : "fr";
  const name = String((input && input.name) || "").trim();
  const email = String((input && input.email) || "").trim().toLowerCase();
  const phone = String((input && input.phone) || "").trim();

  if (!canSell()) {
    return {
      ok: false,
      status: 403,
      error: "La vente de formules n’est pas encore ouverte",
      code: "STUDIO_CLOSED",
    };
  }
  if (!productId) {
    return { ok: false, status: 400, error: "Formule manquante" };
  }
  if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
    return { ok: false, status: 400, error: "Quantité invalide" };
  }
  if (name.length < 2 || name.length > 80) {
    return { ok: false, status: 400, error: "Indiquez votre nom" };
  }
  if (!isEmail(email)) {
    return { ok: false, status: 400, error: "E-mail invalide" };
  }
  if (phone && phone.length > 30) {
    return { ok: false, status: 400, error: "Téléphone invalide" };
  }
  if (input.acceptTerms !== true) {
    return {
      ok: false,
      status: 400,
      error: "Merci d’accepter les conditions de vente des formules",
      code: "TERMS",
    };
  }

  const product = getProduct(productId);
  if (!product || product.active === false) {
    return { ok: false, status: 400, error: "Formule inconnue" };
  }

  const unitCents = Number(product.priceCents);
  if (!Number.isInteger(unitCents) || unitCents < 0) {
    return { ok: false, status: 500, error: "Prix invalide" };
  }

  const lineCents = unitCents * qty;
  return {
    ok: true,
    locale,
    name,
    email,
    phone,
    product,
    qty,
    unitCents,
    lineCents,
    totalCents: lineCents,
    label: qty > 1 ? qty + " × " + product.name : product.name,
    totalLabel: formatEUR(lineCents),
  };
}

function intInRange(value, min, max) {
  const n = Number(value);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

function normalizeProduct(raw) {
  const id = String((raw && raw.id) || "").trim();
  if (!ID_RE.test(id)) return null;
  const priceCents = intInRange(raw.priceCents, 0, 5000000);
  const credits = intInRange(raw.credits, 0, 100);
  const validityMonths = intInRange(raw.validityMonths, 0, 36);
  if (priceCents == null || credits == null || validityMonths == null) return null;
  const name = String((raw && raw.name) || "").trim();
  if (name.length < 2 || name.length > 80) return null;
  return {
    id: id,
    group: raw.group === "pack" ? "pack" : "unit",
    featured: Boolean(raw.featured),
    active: raw.active !== false,
    name: name,
    priceCents: priceCents,
    credits: credits,
    validityMonths: validityMonths,
    duration: String((raw && raw.duration) || "1 h").trim().slice(0, 20) || "1 h",
    description: String((raw && raw.description) || "").trim().slice(0, 400),
  };
}

function normalizeSlot(raw) {
  const id = String((raw && raw.id) || "").trim();
  if (!ID_RE.test(id)) return null;
  const title = String((raw && raw.title) || "").trim();
  const day = String((raw && raw.day) || "").trim();
  const start = String((raw && raw.start) || "").trim();
  const end = String((raw && raw.end) || "").trim();
  if (!title || !day || !start || !end) return null;
  const capacity = intInRange(raw.capacity, 1, 30);
  if (capacity == null) return null;
  return {
    id: id,
    day: day.slice(0, 20),
    start: start.slice(0, 8),
    end: end.slice(0, 8),
    title: title.slice(0, 40),
    level: String((raw && raw.level) || "Tous niveaux").trim().slice(0, 40),
    kind: raw.kind === "reformer" || raw.kind === "mat" ? raw.kind : inferKind(id, title),
    capacity: capacity,
  };
}

function validateCatalogUpdate(input) {
  const productsRaw = (input && input.products) || [];
  if (!Array.isArray(productsRaw) || !productsRaw.length) {
    return { ok: false, status: 400, error: "Catalogue vide" };
  }
  const products = [];
  const ids = new Set();
  for (let i = 0; i < productsRaw.length; i += 1) {
    const product = normalizeProduct(productsRaw[i]);
    if (!product) {
      return { ok: false, status: 400, error: "Formule invalide (ligne " + (i + 1) + ")" };
    }
    if (ids.has(product.id)) {
      return { ok: false, status: 400, error: "Identifiant dupliqué : " + product.id };
    }
    ids.add(product.id);
    products.push(product);
  }

  let schedule;
  if (Object.prototype.hasOwnProperty.call(input, "schedule")) {
    if (!Array.isArray(input.schedule)) {
      return { ok: false, status: 400, error: "Planning invalide" };
    }
    schedule = [];
    const slotIds = new Set();
    for (let i = 0; i < input.schedule.length; i += 1) {
      const slot = normalizeSlot(input.schedule[i]);
      if (!slot) {
        return { ok: false, status: 400, error: "Créneau invalide (ligne " + (i + 1) + ")" };
      }
      if (slotIds.has(slot.id)) {
        return { ok: false, status: 400, error: "Créneau dupliqué : " + slot.id };
      }
      slotIds.add(slot.id);
      schedule.push(slot);
    }
  }

  return {
    ok: true,
    live: Boolean(input && input.live),
    products: products,
    schedule: schedule,
    cancelHours:
      input && Object.prototype.hasOwnProperty.call(input, "cancelHours")
        ? normalizeCancelHours(input.cancelHours)
        : undefined,
  };
}

module.exports = {
  MAX_QTY,
  isEmail,
  validateCheckout,
  validateCatalogUpdate,
  normalizeSlot,
};
