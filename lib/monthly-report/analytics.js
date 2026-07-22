const {
  MONTHLY_REPORT_PROJECT_ID,
  MONTHLY_REPORT_TEAM_ID,
} = require("./config");

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
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const body = await r.json();
  if (!r.ok) {
    throw new Error(
      `Analytics ${endpoint} ${r.status}: ${JSON.stringify(body)}`
    );
  }
  return body;
}

/**
 * Récupère les analytics Vercel des N derniers jours + insight FR.
 * @param {number} [days=30]
 */
async function fetchMonthlyAnalytics(days = 30) {
  const token = process.env.VERCEL_TOKEN?.trim();
  if (!token) {
    throw new Error(
      "VERCEL_TOKEN manquant — créer un token sur vercel.com/account/tokens et l’ajouter aux env Vercel."
    );
  }

  const until = new Date();
  const since = new Date(until.getTime() - days * 24 * 60 * 60 * 1000);
  const sinceStr = isoDate(since);
  const untilStr = isoDate(until);

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

  let insight =
    "Le trafic est encore en phase de montée. La plupart des sessions ont un référent vide (accès direct ou privacy). Les chiffres seront plus parlants après un mois complet sur le domaine public.";
  const fr = countries.find((row) => row.country === "FR");
  if (fr && fr.visitors >= visitors * 0.5 && visitors > 0) {
    insight =
      "La majorité des visiteurs vient de France — cohérent pour un studio à Narbonne. Renforcer les signaux locaux (Narbonne / Aude) en SEO et sur les réseaux.";
  }

  return {
    since: sinceStr,
    until: untilStr,
    days,
    visitors,
    pageviews,
    pagesPerVisitor: visitors > 0 ? (pageviews / visitors).toFixed(1) : "—",
    routes,
    countries,
    devices,
    referrers,
    browsers,
    osList,
    insight,
  };
}

module.exports = { fetchMonthlyAnalytics };
