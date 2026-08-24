function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) return null;
  const Stripe = require("stripe");
  return new Stripe(key);
}

module.exports = { getStripe };
