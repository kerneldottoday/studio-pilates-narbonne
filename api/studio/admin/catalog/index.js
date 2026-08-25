const { json, readJsonBody } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const { loadCatalog, saveCatalog, defaultCatalog } = require("../../../../lib/studio/store");
const { validateCatalogUpdate } = require("../../../../lib/studio/validate");
const { DEFAULT_CANCEL_HOURS } = require("../../../../lib/studio/policy");
const { withStudioStore } = require("../../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return json(res, 200, loadCatalog());
  }

  if (req.method !== "PUT") {
    res.setHeader("Allow", "GET, PUT, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  if (body && body.reset === true) {
    const restored = defaultCatalog();
    restored.live = Boolean(loadCatalog().live);
    return json(res, 200, saveCatalog(restored));
  }

  const parsed = validateCatalogUpdate(body);
  if (!parsed.ok) {
    return json(res, parsed.status, { error: parsed.error });
  }

  const current = loadCatalog();
  const next = {
    live: parsed.live,
    currency: "eur",
    cancelHours:
      parsed.cancelHours != null ? parsed.cancelHours : current.cancelHours || DEFAULT_CANCEL_HOURS,
    products: parsed.products,
    schedule: parsed.schedule || current.schedule,
  };
  return json(res, 200, saveCatalog(next));
}

module.exports = withStudioStore(handler);
