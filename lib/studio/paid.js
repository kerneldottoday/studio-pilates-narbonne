const { getStripe } = require("../shop/stripe-client");
const { orderEmailTo } = require("../shop/catalog");
const { upsertOrder, findOrder, formatEUR, markNoticeSent } = require("./store");
const { sendClassPassEmails, emailsWanted } = require("./email");
const { recordNotice } = require("./notices");

function orderFromCart(cart, extras) {
  return Object.assign(
    {
      type: "class-pass",
      status: "paid",
      productId: cart.product.id,
      productName: cart.product.name,
      label: cart.label,
      qty: cart.qty,
      credits: cart.product.credits,
      validityMonths: cart.product.validityMonths,
      unitCents: cart.unitCents,
      totalCents: cart.totalCents,
      customerName: cart.name,
      customerEmail: cart.email,
      customerPhone: cart.phone,
      locale: cart.locale,
      toStudio: orderEmailTo(),
      createdAt: new Date().toISOString(),
    },
    extras
  );
}

async function maybeEmail(order) {
  if (!order.noticeAt) {
    const notice = recordNotice("purchase", {
      email: order.customerEmail,
      name: order.customerName,
      detail: order.label || order.productName || "formule",
      slotLabel: formatEUR(order.totalCents),
    });
    order.noticeAt = new Date().toISOString();
    order.noticeId = notice && notice.id;
  }
  if (order.emailedAt) return order;
  if (order.mock && !emailsWanted()) {
    console.log("[studio] e-mail ignoré (paiement d’essai local)");
    return order;
  }
  try {
    await sendClassPassEmails(order);
    order.emailedAt = new Date().toISOString();
    if (order.noticeId) markNoticeSent(order.noticeId);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[studio] email", message);
  }
  return order;
}

async function recordPaidSession(stripeClient, sessionId) {
  const stripe = stripeClient || getStripe();
  if (!stripe) {
    return { ok: false, status: 503, error: "Stripe non configuré" };
  }
  const full = await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["customer_details"],
  });
  if (full.payment_status !== "paid" && full.status !== "complete") {
    return { ok: false, status: 402, error: "Paiement non confirmé" };
  }
  const meta = full.metadata || {};
  if (meta.type && meta.type !== "class-pass") {
    return { ok: false, status: 400, error: "Session boutique, pas une formule" };
  }
  const existing = findOrder(full.id);
  if (existing) {
    return { ok: true, order: existing };
  }
  const details = full.customer_details || {};
  const qty = Number(meta.qty || 1);
  const order = await maybeEmail(
    upsertOrder({
      type: "class-pass",
      status: "paid",
      sessionId: full.id,
      mock: false,
      productId: meta.productId || "",
      productName: meta.productName || "",
      label: meta.label || meta.productName || "",
      qty: qty,
      credits: Number(meta.credits || 0),
      validityMonths: Number(meta.validityMonths || 0),
      unitCents: Number(meta.unitCents || 0),
      totalCents: full.amount_total || 0,
      customerName: meta.customerName || details.name || "",
      customerEmail: full.customer_email || details.email || meta.customerEmail || "",
      customerPhone: details.phone || meta.customerPhone || "",
      locale: meta.locale || "fr",
      toStudio: orderEmailTo(),
      createdAt: new Date().toISOString(),
    })
  );
  return { ok: true, order: upsertOrder(order) };
}

module.exports = {
  orderFromCart,
  maybeEmail,
  recordPaidSession,
};
