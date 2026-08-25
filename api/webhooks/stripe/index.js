const { getStripe } = require("../../../lib/shop/stripe-client");
const { orderEmailTo, formatEUR } = require("../../../lib/shop/catalog");
const { sendOrderEmails, formatAddress } = require("../../../lib/shop/email");
const { readRawBody, json } = require("../../../lib/shop/http");
const { withStudioStore } = require("../../../lib/studio/with-store");

function parseItems(session) {
  const fromMeta = String((session.metadata && session.metadata.items) || "");
  if (fromMeta) {
    return fromMeta.split(",").map(function (part) {
      const bits = part.split(":");
      return { id: bits[0], qty: Number(bits[1] || 1), name: bits[0], lineCents: 0 };
    });
  }
  const data = (session.line_items && session.line_items.data) || [];
  return data.map(function (item) {
    return {
      id: (item.price && item.price.product) || "",
      name: item.description || "",
      qty: item.quantity || 1,
      lineCents: item.amount_total || 0,
    };
  });
}

async function handleCheckoutCompleted(stripe, session) {
  const full = await stripe.checkout.sessions.retrieve(session.id, {
    expand: ["line_items", "customer_details"],
  });

  const lineItems = (full.line_items && full.line_items.data) || [];
  const lines = lineItems.map(function (item) {
    return {
      id: item.description,
      name: item.description,
      qty: item.quantity || 1,
      lineCents: item.amount_subtotal || item.amount_total || 0,
    };
  });

  const shippingCents = full.total_details
    ? full.total_details.amount_shipping || 0
    : 0;
  const totalCents = full.amount_total || 0;
  const subtotalCents = Math.max(0, totalCents - shippingCents);
  const details = full.customer_details || {};
  const shipping = full.shipping_details || {};

  await sendOrderEmails({
    sessionId: full.id,
    toStudio: orderEmailTo(),
    customerName: details.name || shipping.name || "",
    customerEmail: full.customer_email || details.email || "",
    customerPhone: details.phone || "",
    fulfillment: (full.metadata && full.metadata.fulfillment) || "fr-metro",
    lines: lines.length ? lines : parseItems(full),
    subtotalCents,
    shippingCents,
    totalCents,
    shippingAddress: formatAddress(shipping.address || details.address),
    totalLabel: formatEUR(totalCents),
  });
}

async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!stripe || !secret) {
    return json(res, 503, { error: "Webhook Stripe non configuré" });
  }

  let raw;
  try {
    raw = await readRawBody(req);
  } catch (_err) {
    return json(res, 400, { error: "Corps illisible" });
  }

  const signature = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shop/webhook] signature", message);
    return json(res, 400, { error: "Signature invalide" });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const kind = session && session.metadata && session.metadata.type;
      if (kind === "class-pass") {
        const { recordPaidSession } = require("../../../lib/studio/paid");
        await recordPaidSession(stripe, session.id);
      } else {
        await handleCheckoutCompleted(stripe, session);
      }
    }
    return json(res, 200, { received: true, type: event.type });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shop/webhook]", message);
    return json(res, 500, { error: "Traitement impossible" });
  }
}

// Le store studio n'est utilisé que pour les sessions "class-pass", mais
// l'enveloppe est sans effet en mode fichiers et ne coûte qu'une lecture en
// mode supabase — on garde un seul chemin.
module.exports = withStudioStore(handler);
