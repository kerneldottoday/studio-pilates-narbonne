/**
 * Envoi test du PDF analytics mensuel.
 * Destinataire : MONTHLY_REPORT_TO_EMAIL (.env.local) — Souhila / Yankel.
 *
 * Usage : node scripts/send-monthly-report-test.js
 * Prérequis : node scripts/monthly-report-dry-run.js
 */
const fs = require("fs");
const path = require("path");
const { Resend } = require("resend");
const { buildMonthlyReportEmail } = require("../lib/monthly-report/email");
const { assertSafeRecipient } = require("../lib/monthly-report/config");

function loadEnvLocal() {
  const p = path.join(__dirname, "..", ".env.local");
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, "utf8").split(/\r?\n/)) {
    if (!line || line.startsWith("#")) continue;
    const i = line.indexOf("=");
    if (i < 0) continue;
    const k = line.slice(0, i).trim();
    let v = line.slice(i + 1).trim();
    if (
      (v.startsWith('"') && v.endsWith('"')) ||
      (v.startsWith("'") && v.endsWith("'"))
    ) {
      v = v.slice(1, -1);
    }
    if (!process.env[k]) process.env[k] = v;
  }
}

loadEnvLocal();

const TO =
  process.env.MONTHLY_REPORT_TO_EMAIL?.trim() || "recca.yankel@gmail.com";

try {
  assertSafeRecipient(TO);
} catch (e) {
  console.error(e.message);
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
if (!apiKey) {
  console.error("RESEND_API_KEY manquant (.env.local ou env)");
  process.exit(1);
}

const outDir = path.join(__dirname, "..", ".tmp-media", "monthly-report");
if (!fs.existsSync(outDir)) {
  console.error("PDF manquant — lancer : node scripts/monthly-report-dry-run.js");
  process.exit(1);
}

const pdfFiles = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith("-dry-run.pdf"))
  .sort()
  .reverse();
if (!pdfFiles.length) {
  console.error("PDF manquant — lancer : node scripts/monthly-report-dry-run.js");
  process.exit(1);
}

const pdfPath = path.join(outDir, pdfFiles[0]);
const jsonSibling = pdfPath.replace(/\.pdf$/, ".json");
let period = { since: "—", until: "—", visitors: "—", pageviews: "—" };
if (fs.existsSync(jsonSibling)) {
  const j = JSON.parse(fs.readFileSync(jsonSibling, "utf8"));
  period = {
    since: j.meta?.range?.since || "—",
    until: j.meta?.range?.until || "—",
    visitors: j.trafficInsight?.uniqueVisitors ?? "—",
    pageviews: j.trafficInsight?.totalPageviews ?? "—",
  };
}

const data = {
  since: period.since,
  until: period.until,
  visitors: period.visitors,
  pageviews: period.pageviews,
};

const { subject, text, html } = buildMonthlyReportEmail(data);
const isClient = /lahissou@hotmail\.fr/i.test(TO);
const finalSubject = isClient
  ? subject
  : subject.replace("Analytics mensuel", "Analytics mensuel (test)");
const testNote = isClient
  ? ""
  : "\n\n—\nEnvoi de test interne. Pas la liste de distribution client.\n";
const testHtmlNote = isClient
  ? ""
  : `
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:11px;color:#888;margin:32px 0 0;">
  Envoi de test interne — pas la liste de distribution client.
</p>`;

(async () => {
  console.log(`Envoi rapport → ${TO}${isClient ? " (client)" : " (test)"}`);
  console.log(`From: KERNEL.today <${fromEmail}>`);
  console.log(`Pièce jointe: ${path.basename(pdfPath)}`);

  const resend = new Resend(apiKey);
  const pdf = fs.readFileSync(pdfPath);

  const { data: sent, error } = await resend.emails.send({
    from: `KERNEL.today <${fromEmail}>`,
    to: [TO],
    replyTo: "contact@kernel.today",
    subject: finalSubject,
    text: text + testNote,
    html: html + testHtmlNote,
    attachments: [
      {
        filename: `SPN-analytics-mensuel-${data.until || "rapport"}.pdf`,
        content: pdf,
      },
    ],
  });

  if (error) {
    console.error("Erreur Resend:", error);
    process.exit(1);
  }
  console.log("Envoyé OK. id:", sent?.id);
})();
