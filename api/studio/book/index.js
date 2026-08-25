const { json, readJsonBody, isAllowedOrigin } = require("../../../lib/shop/http");
const { bookSeat, cancelSeat } = require("../../../lib/studio/booking");
const { withStudioStore } = require("../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "POST, PATCH, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!isAllowedOrigin(req)) {
    return json(res, 403, { error: "Origine non autorisée" });
  }
  if (req.method !== "POST" && req.method !== "PATCH") {
    res.setHeader("Allow", "POST, PATCH, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  if (req.method === "PATCH" || (body && body.action === "cancel")) {
    const result = cancelSeat(body.bookingId, body.email, false);
    if (!result.ok) {
      return json(res, result.status, { error: result.error, code: result.code });
    }
    return json(res, 200, { booking: result.booking });
  }

  const result = bookSeat({
    email: body.email,
    name: body.name,
    phone: body.phone,
    occurrenceId: body.occurrenceId,
    skipCredit: false,
    source: "student",
    waitlist: Boolean(body.waitlist),
  });
  if (!result.ok) {
    return json(res, result.status, { error: result.error, code: result.code });
  }
  return json(res, 200, {
    booking: result.booking,
    waitlist: Boolean(result.waitlist),
  });
}

module.exports = withStudioStore(handler);
