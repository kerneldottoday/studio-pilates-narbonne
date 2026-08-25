/**
 * Édition du catalogue boutique (compléments) par Souhila : prix, textes,
 * stock, visibilité, frais d'envoi. Les champs structurels (id, slug, image,
 * textes anglais) ne sont pas éditables ici. La version éditée est stockée
 * dans le store studio ; le site public la sert via /api/shop/catalog.
 */
const { json, readJsonBody } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const { loadCatalog } = require("../../../../lib/shop/catalog");
const { loadShopDoc, saveShopDoc } = require("../../../../lib/studio/store");
const { withStudioStore } = require("../../../../lib/studio/with-store");

function cleanText(value, max) {
  return String(value == null ? "" : value).trim().slice(0, max);
}

function applyProductPatch(product, patch) {
  if (patch.name !== undefined) {
    const name = cleanText(patch.name, 120);
    if (name.length < 2) return "Nom trop court pour " + product.id;
    product.name = name;
  }
  if (patch.priceCents !== undefined) {
    const price = Number(patch.priceCents);
    if (!Number.isInteger(price) || price < 0 || price > 100000) {
      return "Prix invalide pour " + product.id;
    }
    product.priceCents = price;
  }
  if (patch.short !== undefined) product.short = cleanText(patch.short, 300);
  if (patch.description !== undefined) {
    product.description = cleanText(patch.description, 2000);
  }
  if (patch.format !== undefined) product.format = cleanText(patch.format, 80);
  if (patch.sku !== undefined) product.sku = cleanText(patch.sku, 60);
  if (patch.inStock !== undefined) product.inStock = patch.inStock !== false;
  if (patch.hidden !== undefined) product.hidden = patch.hidden === true;
  return null;
}

function applyShippingPatch(option, patch) {
  if (patch.label !== undefined) {
    const label = cleanText(patch.label, 80);
    if (label.length < 2) return "Libellé de livraison trop court";
    option.label = label;
  }
  if (patch.amountCents !== undefined) {
    const amount = Number(patch.amountCents);
    if (!Number.isInteger(amount) || amount < 0 || amount > 20000) {
      return "Frais d'envoi invalides";
    }
    option.amountCents = amount;
    option.confirmed = true;
  }
  if (patch.detail !== undefined) option.detail = cleanText(patch.detail, 300);
  return null;
}

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return json(res, 200, {
      ok: true,
      source: loadShopDoc() ? "custom" : "file",
      catalog: loadCatalog(),
    });
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  const next = JSON.parse(JSON.stringify(loadCatalog()));
  const productPatches = Array.isArray(body && body.products) ? body.products : [];
  const shippingPatches = Array.isArray(body && body.shipping) ? body.shipping : [];

  for (const patch of productPatches) {
    const product = (next.products || []).find(function (p) {
      return p.id === String(patch && patch.id);
    });
    if (!product) continue;
    const err = applyProductPatch(product, patch);
    if (err) return json(res, 400, { error: err });
  }

  for (const patch of shippingPatches) {
    const option = (next.shipping || []).find(function (s) {
      return s.id === String(patch && patch.id);
    });
    if (!option) continue;
    const err = applyShippingPatch(option, patch);
    if (err) return json(res, 400, { error: err });
  }

  saveShopDoc(next);
  return json(res, 200, { ok: true, source: "custom", catalog: next });
}

module.exports = withStudioStore(handler);
