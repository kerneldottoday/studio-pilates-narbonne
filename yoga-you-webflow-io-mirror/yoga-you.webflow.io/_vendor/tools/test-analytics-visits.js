/**
 * Smoke test : visite 10 pages avec un navigateur headless pour déclencher Vercel Analytics.
 * Usage: node _vendor/tools/test-analytics-visits.js
 */
const { chromium } = require("playwright");

const BASE = "https://studiopilatesnarbonne.com";
const PAGES = [
  "/",
  "/classes",
  "/contact",
  "/planning",
  "/pricing",
  "/voyage",
  "/classes/pilates-reformer",
  "/mentions-legales",
  "/en",
  "/en/contact",
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const results = [];

  for (const path of PAGES) {
    const url = BASE + path;
    let analyticsHit = false;
    page.on("request", (req) => {
      if (req.url().includes("_vercel/insights")) analyticsHit = true;
    });
    try {
      await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
      await page.waitForTimeout(1500);
      results.push({ url, ok: true, analyticsHit });
      console.log(analyticsHit ? "OK" : "WARN", url, analyticsHit ? "(analytics)" : "(no analytics request)");
    } catch (err) {
      results.push({ url, ok: false, error: err.message });
      console.log("FAIL", url, err.message);
    }
    page.removeAllListeners("request");
  }

  await browser.close();
  const hits = results.filter((r) => r.analyticsHit).length;
  console.log("\nDone:", results.filter((r) => r.ok).length + "/" + PAGES.length, "pages,", hits, "with analytics requests");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
