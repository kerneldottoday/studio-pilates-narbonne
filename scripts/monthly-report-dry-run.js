/**
 * DRY RUN rapport mensuel — tire Vercel Web Analytics, écrit un PDF local.
 * N’envoie JAMAIS d’e-mail au client. Pas de Resend.
 *
 * Auth : token CLI Vercel (%APPDATA%/com.vercel.cli/Data/auth.json)
 *   ou env VERCEL_TOKEN
 *
 * Usage : node scripts/monthly-report-dry-run.js
 *         node scripts/monthly-report-dry-run.js --days 30
 */
const fs = require("fs");
const path = require("path");

const {
  MONTHLY_REPORT_PROJECT_ID,
  MONTHLY_REPORT_TEAM_ID,
  MONTHLY_REPORT_PROJECT_NAME,
  COUNTRY_NAMES,
} = require("../lib/monthly-report/config");
const { buildMonthlyReportPdf } = require("../lib/monthly-report/pdf");

function getToken() {
  if (process.env.VERCEL_TOKEN) return process.env.VERCEL_TOKEN;
  const authPath = path.join(
    process.env.APPDATA || "",
    "com.vercel.cli",
    "Data",
    "auth.json"
  );
  if (!fs.existsSync(authPath)) {
    throw new Error("Pas de VERCEL_TOKEN ni de auth.json CLI Vercel");
  }
  const auth = JSON.parse(fs.readFileSync(authPath, "utf8"));
  const token = auth.token || auth.accessToken;
  if (!token) throw new Error("auth.json Vercel sans token");
  return token;
}

function parseDays() {
  const i = process.argv.indexOf("--days");
  if (i >= 0 && process.argv[i + 1]) return Math.max(1, Number(process.argv[i + 1]));
  return 30;
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

async function query(token, endpoint, params) {
  const q = new URLSearchParams({
    teamId: MONTHLY_REPORT_TEAM_ID,
    projectId: MONTHLY_REPORT_PROJECT_ID,
    ...params,
  });
  const url = `https://api.vercel.com/v1/query/web-analytics/${endpoint}?${q}`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const body = await r.json();
  if (!r.ok) {
    throw new Error(`${endpoint} ${r.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR");
}

function topLabel(rows, key) {
  if (!rows?.length) return "—";
  const first =
    rows.find((r) => r[key] !== undefined && r[key] !== "Others") || rows[0];
  let label = first[key];
  if (label === "" || label == null) label = key === "route" ? "/" : "(direct)";
  return `${label} (${fmt(first.pageviews)} vues)`;
}

(async () => {
  const days = parseDays();
  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  const sinceStr = isoDate(since);
  const untilStr = isoDate(until);

  console.log(
    `DRY RUN — ${MONTHLY_REPORT_PROJECT_NAME} — ${days}j (${sinceStr} → ${untilStr})`
  );
  console.log("Aucun e-mail ne sera envoyé.\n");

  const token = getToken();
  process.env.VERCEL_TOKEN = token;

  const [count, byRoute, byCountry, byDevice, byReferrer, byBrowser, byOs] =
    await Promise.all([
      query(token, "visits/count", { since: sinceStr, until: untilStr }),
      query(token, "visits/aggregate", {
        since: sinceStr,
        until: untilStr,
        by: "route",
      }),
      query(token, "visits/aggregate", {
        since: sinceStr,
        until: untilStr,
        by: "country",
      }),
      query(token, "visits/aggregate", {
        since: sinceStr,
        until: untilStr,
        by: "deviceType",
      }),
      query(token, "visits/aggregate", {
        since: sinceStr,
        until: untilStr,
        by: "referrerHostname",
      }),
      query(token, "visits/aggregate", {
        since: sinceStr,
        until: untilStr,
        by: "browserName",
      }),
      query(token, "visits/aggregate", {
        since: sinceStr,
        until: untilStr,
        by: "osName",
      }),
    ]);

  const visitors = count.data?.visitors ?? 0;
  const pageviews = count.data?.pageviews ?? 0;
  const routes = (byRoute.data || []).filter((r) => r.route !== "Others");
  const countries = byCountry.data || [];
  const devices = byDevice.data || [];
  const referrers = byReferrer.data || [];
  const browsers = byBrowser.data || [];
  const osList = byOs.data || [];
  const pagesPerVisitor =
    visitors > 0 ? (pageviews / visitors).toFixed(1) : "—";

  let insight =
    "Le trafic est encore en phase de montée. La plupart des sessions ont un référent vide (accès direct ou privacy). Les chiffres seront plus parlants après un mois complet sur le domaine public.";
  const fr = countries.find((c) => c.country === "FR");
  if (fr && fr.visitors >= visitors * 0.5 && visitors > 0) {
    insight =
      "La majorité des visiteurs vient de France — cohérent pour un studio à Narbonne. Renforcer les signaux locaux (Narbonne / Aude) en SEO et sur les réseaux.";
  }

  const data = {
    since: sinceStr,
    until: untilStr,
    days,
    visitors,
    pageviews,
    pagesPerVisitor,
    routes,
    countries,
    devices,
    referrers,
    browsers,
    osList,
    insight,
  };

  const report = {
    meta: {
      dryRun: true,
      emailed: false,
      project: MONTHLY_REPORT_PROJECT_NAME,
      range: { since: sinceStr, until: untilStr, days },
      generatedAt: new Date().toISOString(),
      note: "DRY RUN — non envoyé au client",
    },
    trafficInsight: {
      totalPageviews: pageviews,
      uniqueVisitors: visitors,
      topPage: routes[0]
        ? {
            route: routes[0].route,
            pageviews: routes[0].pageviews,
            visitors: routes[0].visitors,
          }
        : null,
      pagesPerVisitor,
    },
    trafficSources: { referrers, insight },
    topPages: routes.slice(0, 8),
    countries: countries.map((c) => ({
      ...c,
      name: COUNTRY_NAMES[c.country] || c.country,
    })),
  };

  const outDir = path.join(__dirname, "..", ".tmp-media", "monthly-report");
  fs.mkdirSync(outDir, { recursive: true });
  const stamp = untilStr.replace(/-/g, "");
  const jsonPath = path.join(outDir, `spn-monthly-${stamp}-dry-run.json`);
  const mdPath = path.join(outDir, `spn-monthly-${stamp}-dry-run.md`);
  const pdfPath = path.join(outDir, `spn-monthly-${stamp}-dry-run.pdf`);

  fs.writeFileSync(jsonPath, JSON.stringify(report, null, 2));

  const md = `# RAPPORT MENSUEL — Studio Pilates Narbonne (DRY RUN)

**Période :** ${sinceStr} → ${untilStr} (${days} jours)  
**Projet :** ${MONTHLY_REPORT_PROJECT_NAME}  
**Généré :** ${report.meta.generatedAt}  
**Statut :** DRY RUN — **non envoyé** au client

---

## TRAFIC

| Métrique | Valeur |
|----------|------:|
| Visiteurs uniques | **${fmt(visitors)}** |
| Pages vues | **${fmt(pageviews)}** |
| Pages / visiteur | **${pagesPerVisitor}** |
| Page top | **${routes[0]?.route || "—"}** (${fmt(routes[0]?.pageviews)} vues) |

## PAYS

| Pays | Visiteurs | Pages vues |
|------|--------:|----------:|
${countries
  .map(
    (c) =>
      `| ${c.country} ${COUNTRY_NAMES[c.country] || ""} | ${fmt(c.visitors)} | ${fmt(c.pageviews)} |`
  )
  .join("\n")}

**Analyse :** ${insight}

---

*KERNEL.today — dry run interne uniquement*
`;

  fs.writeFileSync(mdPath, md);

  const pdf = await buildMonthlyReportPdf(data);
  fs.writeFileSync(pdfPath, pdf);

  console.log("TRAFIC");
  console.log(`  Visiteurs uniques : ${fmt(visitors)}`);
  console.log(`  Pages vues        : ${fmt(pageviews)}`);
  console.log(`  Page top          : ${topLabel(routes, "route")}`);
  console.log(`  Pays top          : ${topLabel(countries, "country")}`);
  console.log("\nÉcrit :");
  console.log(" ", path.relative(process.cwd(), mdPath));
  console.log(" ", path.relative(process.cwd(), jsonPath));
  console.log(" ", path.relative(process.cwd(), pdfPath));
  console.log("\nAucun e-mail envoyé.");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
