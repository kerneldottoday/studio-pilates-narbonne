const { json, readJsonBody } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const {
  listClosures,
  addClosure,
  removeClosure,
} = require("../../../../lib/studio/closures");
const { withStudioStore } = require("../../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return json(res, 200, { closures: listClosures() });
  }

  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  if (req.method === "DELETE") {
    const result = removeClosure(body && body.id);
    if (!result.ok) {
      return json(res, result.status, { error: result.error });
    }
    return json(res, 200, { closure: result.closure, closures: listClosures() });
  }

  const result = addClosure(body);
  if (!result.ok) {
    return json(res, result.status, { error: result.error });
  }
  return json(res, 200, {
    closure: result.closure,
    cancelled: result.cancelled,
    waitRemoved: result.waitRemoved,
    closures: listClosures(),
  });
}

module.exports = withStudioStore(handler);
