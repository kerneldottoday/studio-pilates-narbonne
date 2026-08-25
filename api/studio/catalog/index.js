const { publicCatalog } = require("../../../lib/studio/store");
const { withStudioStore } = require("../../../lib/studio/with-store");
const { json } = require("../../../lib/shop/http");

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
  try {
    return json(res, 200, publicCatalog());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[studio/catalog]", message);
    return json(res, 500, { error: "Catalogue indisponible" });
  }
}

module.exports = withStudioStore(handler);
