const { json } = require("../../../lib/shop/http");
const { accountFor } = require("../../../lib/studio/booking");
const { withStudioStore } = require("../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }
  const url = new URL(req.url, "http://localhost");
  const result = accountFor(url.searchParams.get("email"));
  if (!result.ok) {
    return json(res, result.status, { error: result.error });
  }
  return json(res, 200, result);
}

module.exports = withStudioStore(handler);
