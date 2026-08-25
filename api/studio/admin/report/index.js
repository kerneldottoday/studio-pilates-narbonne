const { json } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const { monthlyReport } = require("../../../../lib/studio/report");
const { withStudioStore } = require("../../../../lib/studio/with-store");

function currentParisMonth() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
}

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
  if (!requireAdmin(req, res)) return;

  const url = new URL(req.url, "http://localhost");
  const month = url.searchParams.get("month") || currentParisMonth();
  const result = monthlyReport(month);
  if (!result.ok) {
    return json(res, result.status, { error: result.error });
  }
  return json(res, 200, result);
}

module.exports = withStudioStore(handler);
