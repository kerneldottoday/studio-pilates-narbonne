const { json, readJsonBody } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const {
  loadOrders,
  updateOrderStatus,
  ORDER_STATUSES,
} = require("../../../../lib/studio/store");
const { withStudioStore } = require("../../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, PATCH, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return json(res, 200, { orders: loadOrders() });
  }

  if (req.method !== "PATCH") {
    res.setHeader("Allow", "GET, PATCH, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  const sessionId = String((body && body.sessionId) || "");
  const status = String((body && body.status) || "");
  if (!sessionId || ORDER_STATUSES.indexOf(status) < 0) {
    return json(res, 400, { error: "Statut invalide" });
  }
  const order = updateOrderStatus(sessionId, status);
  if (!order) {
    return json(res, 404, { error: "Commande introuvable" });
  }
  return json(res, 200, { order: order });
}

module.exports = withStudioStore(handler);
