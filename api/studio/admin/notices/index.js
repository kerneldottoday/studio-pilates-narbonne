const { json } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const { listNotices } = require("../../../../lib/studio/notices");
const { withStudioStore } = require("../../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }
  return json(res, 200, { notices: listNotices() });
}

module.exports = withStudioStore(handler);
