/**
 * Redirige checkout/search/product/articles blog vers pricing ou blog listing.
 * Usage: node _vendor/tools/patch-vercel-dead-routes.js
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");
const vercelPath = path.join(REPO_ROOT, "vercel.json");

const BLOG_SLUGS = [
  "cultivating-mind-body-awareness",
  "finding-balance-for-optimal-health",
  "harnessing-the-power-of-awareness-at-the-table",
  "nutrition-tips-for-yogis",
  "poses-and-practices-to-support-your-gut",
  "release-toxins-and-rejuvenate-your-body",
];

const DEAD_REWRITE_SOURCES = new Set([
  "/checkout",
  "/search",
  "/product/10-classes",
  "/product/5-classes",
  "/product/single-class",
  "/en/checkout",
  "/en/search",
  "/en/product/10-classes",
  "/en/product/5-classes",
  "/en/product/single-class",
]);

for (const slug of BLOG_SLUGS) {
  DEAD_REWRITE_SOURCES.add("/blog/" + slug);
  DEAD_REWRITE_SOURCES.add("/en/blog/" + slug);
}

function buildDeadRedirects() {
  const out = [
    { source: "/checkout", destination: "/pricing", permanent: true },
    { source: "/search", destination: "/", permanent: true },
    { source: "/product/single-class", destination: "/pricing", permanent: true },
    { source: "/product/5-classes", destination: "/pricing", permanent: true },
    { source: "/product/10-classes", destination: "/pricing", permanent: true },
    { source: "/en/checkout", destination: "/en/pricing", permanent: true },
    { source: "/en/search", destination: "/en", permanent: true },
    { source: "/en/product/single-class", destination: "/en/pricing", permanent: true },
    { source: "/en/product/5-classes", destination: "/en/pricing", permanent: true },
    { source: "/en/product/10-classes", destination: "/en/pricing", permanent: true },
  ];
  for (const slug of BLOG_SLUGS) {
    out.push({ source: "/blog/" + slug, destination: "/blog", permanent: true });
    out.push({ source: "/en/blog/" + slug, destination: "/en/blog", permanent: true });
  }
  return out;
}

function main() {
  const cfg = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  cfg.rewrites = (cfg.rewrites || []).filter((r) => !DEAD_REWRITE_SOURCES.has(r.source));

  const deadRedirects = buildDeadRedirects();
  const existing = new Set((cfg.redirects || []).map((r) => r.source + "->" + r.destination));
  const merged = [...cfg.redirects];
  for (const rule of deadRedirects) {
    const key = rule.source + "->" + rule.destination;
    if (!existing.has(key)) {
      merged.unshift(rule);
      existing.add(key);
    }
  }
  cfg.redirects = merged;

  if (!cfg.rewrites.find((r) => r.source === "/sitemap.xml")) {
    cfg.rewrites.push({ source: "/sitemap.xml", destination: "/sitemap.xml" });
  }
  if (!cfg.rewrites.find((r) => r.source === "/robots.txt")) {
    cfg.rewrites.push({ source: "/robots.txt", destination: "/robots.txt" });
  }

  fs.writeFileSync(vercelPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");
  console.log(
    "Updated vercel.json: removed " +
      DEAD_REWRITE_SOURCES.size +
      " dead rewrites, added commerce/blog redirects"
  );
}

main();
