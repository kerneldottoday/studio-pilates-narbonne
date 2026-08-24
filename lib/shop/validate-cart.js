const {
  getProduct,
  getShipping,
  canSellProduct,
  isShopLive,
  isTestStripe,
  allowMockCheckout,
  MAX_QTY,
  MAX_LINES,
} = require("./catalog");

function validateCart(input) {
  const items = Array.isArray(input && input.items) ? input.items : [];
  const fulfillment = input && input.fulfillment === "fr-metro" ? "fr-metro" : "pickup";
  const locale = input && input.locale === "en" ? "en" : "fr";

  if (!items.length) {
    return { ok: false, status: 400, error: "Panier vide" };
  }
  if (items.length > MAX_LINES) {
    return { ok: false, status: 400, error: "Trop d’articles" };
  }

  if (!isShopLive() && !isTestStripe() && !allowMockCheckout()) {
    return {
      ok: false,
      status: 403,
      error: "Boutique pas encore ouverte",
      code: "SHOP_CLOSED",
    };
  }

  const shipping = getShipping(fulfillment);
  if (!shipping) {
    return { ok: false, status: 400, error: "Mode de livraison inconnu" };
  }

  const lines = [];
  let subtotalCents = 0;

  for (const raw of items) {
    const id = String((raw && raw.id) || "");
    const qty = Number(raw && raw.qty);
    if (!id || !Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) {
      return { ok: false, status: 400, error: "Article invalide" };
    }
    const product = getProduct(id);
    if (!product) {
      return { ok: false, status: 400, error: "Produit inconnu" };
    }
    if (!canSellProduct(product)) {
      return {
        ok: false,
        status: 403,
        error: "Produit indisponible",
        code: "PRODUCT_UNAVAILABLE",
      };
    }
    const lineCents = product.priceCents * qty;
    subtotalCents += lineCents;
    lines.push({
      id: product.id,
      slug: product.slug,
      name: locale === "en" ? product.nameEn || product.name : product.name,
      qty,
      unitCents: product.priceCents,
      lineCents,
      status: product.status,
    });
  }

  const shippingCents = shipping.amountCents;
  return {
    ok: true,
    locale,
    fulfillment,
    shipping,
    lines,
    subtotalCents,
    shippingCents,
    totalCents: subtotalCents + shippingCents,
  };
}

module.exports = { validateCart };
