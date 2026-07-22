/**
 * Vercel Cron — 1er de chaque mois (voir vercel.json).
 * Envoie le PDF analytics à MONTHLY_REPORT_TO_EMAIL (défaut : Yankel uniquement).
 *
 * Site SPN = export statique → handler serverless /api (pas Next.js App Router).
 */
const { fetchMonthlyAnalytics } = require("../../../lib/monthly-report/analytics");
const { buildMonthlyReportPdf } = require("../../../lib/monthly-report/pdf");
const { sendMonthlyReportEmail } = require("../../../lib/monthly-report/email");
const {
  MONTHLY_REPORT_TO,
  assertSafeRecipient,
} = require("../../../lib/monthly-report/config");

function authorize(req) {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;
  const auth = req.headers.authorization || "";
  return auth === `Bearer ${secret}`;
}

module.exports = async function handler(req, res) {
  if (req.method !== "GET" && req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!authorize(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const to = MONTHLY_REPORT_TO.trim();
    assertSafeRecipient(to);

    const data = await fetchMonthlyAnalytics(30);
    const pdf = await buildMonthlyReportPdf(data);
    const filename = `SPN-analytics-mensuel-${data.until}.pdf`;
    const { id } = await sendMonthlyReportEmail({ to, pdf, data, filename });

    return res.status(200).json({
      ok: true,
      to,
      emailId: id,
      period: { since: data.since, until: data.until },
      visitors: data.visitors,
      pageviews: data.pageviews,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[cron/monthly-report]", message);
    return res.status(500).json({ ok: false, error: message });
  }
};
