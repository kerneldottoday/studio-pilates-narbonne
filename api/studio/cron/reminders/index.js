/**
 * Cron quotidien (voir vercel.json) : prépare les rappels des cours du
 * lendemain. Accepte le Bearer CRON_SECRET (appel Vercel) ou une session
 * admin (bouton « rappels » de l'espace Souhila).
 */
const { json } = require("../../../../lib/shop/http");
const { isAdmin } = require("../../../../lib/studio/auth");
const { runReminders } = require("../../../../lib/studio/reminders");
const { withStudioStore } = require("../../../../lib/studio/with-store");

function cronAuthorized(req) {
  const secret = String(process.env.CRON_SECRET || "").trim();
  if (!secret) return false;
  return String(req.headers.authorization || "") === "Bearer " + secret;
}

async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return json(res, 405, { error: "Method Not Allowed" });
  }
  if (!cronAuthorized(req) && !isAdmin(req)) {
    return json(res, 401, { error: "Unauthorized" });
  }
  try {
    return json(res, 200, runReminders());
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[studio/cron/reminders]", message);
    return json(res, 500, { ok: false, error: message });
  }
}

module.exports = withStudioStore(handler);
