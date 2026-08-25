const { validateCart } = require("../../lib/shop/validate-cart");
const { getStripe } = require("../../lib/shop/stripe-client");
const { isTestStripe, allowMockCheckout } = require("../../lib/shop/catalog");
const { readJsonBody, json, siteOrigin, isAllowedOrigin } = require("../../lib/shop/http");
const { withStudioStore } = require("../../lib/studio/with-store");

function successPath(locale) {
  return locale === "en" ? "/en/boutique/commande-ok" : "/boutique/commande-ok";
}

function cancelPath(locale) {
  return locale === "en"
    ? "/en/boutique/commande-annulee"
    : "/boutique/commande-annulee";
}

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

  const cart = validateCart(body);
  if (!cart.ok) {
    return json(res, cart.status, { error: cart.error, code: cart.code });
  }

  const origin = siteOrigin(req);
  const stripe = getStripe();

  if (!stripe) {
    if (allowMockCheckout()) {
      return json(res, 200, {
        url: origin + successPath(cart.locale) + "?mock=1",
        mock: true,
      });
    }
    return json(res, 503, {
      error: "Stripe non configuré",
      code: "STRIPE_MISSING",
    });
  }

  const shippingName =
    cart.locale === "en"
      ? cart.shipping.labelEn || cart.shipping.label
      : cart.shipping.label;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      locale: cart.locale === "en" ? "en" : "fr",
      currency: "eur",
      phone_number_collection: { enabled: true },
      billing_address_collection: "required",
      shipping_address_collection:
        cart.fulfillment === "pickup"
          ? undefined
          : { allowed_countries: ["FR"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: cart.shippingCents,
              currency: "eur",
            },
            display_name: shippingName,
          },
        },
      ],
      line_items: cart.lines.map(function (line) {
        return {
          quantity: line.qty,
          price_data: {
            currency: "eur",
            unit_amount: line.unitCents,
            product_data: {
              name: line.name,
              metadata: { sku: line.id },
            },
          },
        };
      }),
      success_url:
        origin + successPath(cart.locale) + "?session_id={CHECKOUT_SESSION_ID}",
      cancel_url: origin + cancelPath(cart.locale),
      custom_text: {
        submit: {
          message:
            cart.locale === "en"
              ? "By paying you accept the online sale terms for food supplements."
              : "En payant, vous acceptez les conditions de vente des compléments alimentaires.",
        },
      },
      metadata: {
        fulfillment: cart.fulfillment,
        locale: cart.locale,
        items: cart.lines.map((l) => l.id + ":" + l.qty).join(","),
        test: isTestStripe() ? "1" : "0",
      },
    });

    return json(res, 200, { url: session.url });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[shop/checkout]", message);
    return json(res, 500, { error: "Impossible d’ouvrir le paiement" });
  }
}

module.exports = withStudioStore(handler);
