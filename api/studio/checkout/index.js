const { getStripe } = require("../../../lib/shop/stripe-client");
const { readJsonBody, json, siteOrigin, isAllowedOrigin } = require("../../../lib/shop/http");
const { validateCheckout } = require("../../../lib/studio/validate");
const { allowMockCheckout, upsertOrder, findOrder } = require("../../../lib/studio/store");
const { orderFromCart, maybeEmail, recordPaidSession } = require("../../../lib/studio/paid");
const { withStudioStore } = require("../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }
  if (!isAllowedOrigin(req)) {
    return json(res, 403, { error: "Origine non autorisée" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  const origin = siteOrigin(req);

  if (body && body.sessionId) {
    const existing = findOrder(body.sessionId);
    if (existing) {
      return json(res, 200, { order: existing, confirmed: true });
    }
    const stripe = getStripe();
    if (!stripe) {
      return json(res, 404, { error: "Commande introuvable" });
    }
    try {
      const result = await recordPaidSession(stripe, String(body.sessionId));
      if (!result.ok) {
        return json(res, result.status, { error: result.error });
      }
      return json(res, 200, { order: result.order, confirmed: true });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error("[studio/checkout] confirm", message);
      return json(res, 500, { error: "Confirmation impossible" });
    }
  }

  const cart = validateCheckout(body);
  if (!cart.ok) {
    return json(res, cart.status, { error: cart.error, code: cart.code });
  }

  const stripe = getStripe();
  if (!stripe) {
    if (allowMockCheckout()) {
      const sessionId = "mock_" + Date.now();
      const order = await maybeEmail(
        orderFromCart(cart, {
          sessionId: sessionId,
          mock: true,
        })
      );
      upsertOrder(order);
      return json(res, 200, {
        url: origin + "/studio/ok?mock=1&session_id=" + encodeURIComponent(sessionId),
        mock: true,
      });
    }
    return json(res, 503, {
      error: "Stripe non configuré",
      code: "STRIPE_MISSING",
    });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: cart.locale === "en" ? "en" : "fr",
      currency: "eur",
      customer_email: cart.email,
      phone_number_collection: { enabled: true },
      billing_address_collection: "auto",
      line_items: [
        {
          quantity: cart.qty,
          price_data: {
            currency: "eur",
            unit_amount: cart.unitCents,
            product_data: {
              name: cart.product.name,
              description:
                cart.product.credits +
                " crédit" +
                (cart.product.credits > 1 ? "s" : "") +
                (cart.product.validityMonths
                  ? " · valable " + cart.product.validityMonths + " mois"
                  : ""),
              metadata: { sku: cart.product.id },
            },
          },
        },
      ],
      success_url: origin + "/studio/ok?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + "/studio/acheter",
      custom_text: {
        submit: {
          message:
            "En payant, vous acceptez les conditions de vente des formules de cours. Ce paiement n’est pas une réservation de créneau.",
        },
      },
      metadata: {
        type: "class-pass",
        productId: cart.product.id,
        productName: cart.product.name,
        label: cart.label,
        qty: String(cart.qty),
        credits: String(cart.product.credits),
        validityMonths: String(cart.product.validityMonths || 0),
        unitCents: String(cart.unitCents),
        customerName: cart.name,
        customerEmail: cart.email,
        customerPhone: cart.phone,
        locale: cart.locale,
        test: String(process.env.STRIPE_SECRET_KEY || "").startsWith("sk_test_")
          ? "1"
          : "0",
      },
    });
    return json(res, 200, { url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[studio/checkout]", message);
    return json(res, 500, { error: "Impossible d’ouvrir le paiement" });
  }
}

module.exports = withStudioStore(handler);
