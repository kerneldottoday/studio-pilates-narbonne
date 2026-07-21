/**
 * Applique les redirects SEO P0 + hôte www dans vercel.json
 * sans écraser crons / functions.
 * Usage: node _vendor/tools/patch-seo-p0-vercel.js
 */
const fs = require("fs");
const path = require("path");
const {
  SEO_REDIRECTS,
  HOST_WWW_REDIRECT,
  listPublicHtmlPages,
} = require("./clean-urls");

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");
const SITE_ROOT = path.join(__dirname, "..", "..");
const vercelPath = path.join(REPO_ROOT, "vercel.json");

const REDIRECT_SOURCES = new Set(
  SEO_REDIRECTS.map((r) => r.source).concat([HOST_WWW_REDIRECT.source + "@apex"])
);

function main() {
  const cfg = JSON.parse(fs.readFileSync(vercelPath, "utf8"));

  // Remove rewrites that conflict with SEO redirects (redirect must win cleanly)
  const seoPaths = new Set(
    SEO_REDIRECTS.map((r) => r.source).filter((s) => !s.endsWith(".html"))
  );
  cfg.rewrites = (cfg.rewrites || []).filter((r) => !seoPaths.has(r.source));

  // Ensure /voyage rewrite exists
  if (!cfg.rewrites.find((r) => r.source === "/voyage")) {
    cfg.rewrites.push({ source: "/voyage", destination: "/voyage.html" });
  }
  if (!cfg.rewrites.find((r) => r.source === "/en/voyage")) {
    cfg.rewrites.push({ source: "/en/voyage", destination: "/en/voyage.html" });
  }

  // Drop old /expertises rewrite if still present
  cfg.rewrites = cfg.rewrites.filter(
    (r) => r.source !== "/expertises" && r.source !== "/en/expertises"
  );

  // Prepend host + SEO redirects (dedupe by source)
  const seoRules = [
    { ...HOST_WWW_REDIRECT },
    ...SEO_REDIRECTS.map((r) => ({
      source: r.source,
      destination: r.destination,
      permanent: true,
    })),
  ];

  const existing = cfg.redirects || [];
  const bySource = new Map();
  for (const rule of existing) {
    const key =
      rule.has && rule.has[0] && rule.has[0].value
        ? rule.source + "@" + rule.has[0].value
        : rule.source;
    bySource.set(key, rule);
  }
  for (const rule of seoRules) {
    const key =
      rule.has && rule.has[0] && rule.has[0].value
        ? rule.source + "@" + rule.has[0].value
        : rule.source;
    bySource.set(key, rule);
  }

  // Prefer SEO destinations for blog article redirects
  for (const [key, rule] of bySource) {
    if (rule.destination === "/blog") {
      bySource.set(key, { ...rule, destination: "/" });
    }
    if (rule.destination === "/en/blog") {
      bySource.set(key, { ...rule, destination: "/en" });
    }
  }

  // Host redirect first, then SEO, then the rest
  const hostKey = HOST_WWW_REDIRECT.source + "@studiopilatesnarbonne.com";
  const ordered = [];
  if (bySource.has(hostKey)) {
    ordered.push(bySource.get(hostKey));
    bySource.delete(hostKey);
  }
  for (const r of SEO_REDIRECTS) {
    if (bySource.has(r.source)) {
      ordered.push(bySource.get(r.source));
      bySource.delete(r.source);
    }
  }
  for (const rule of bySource.values()) {
    ordered.push(rule);
  }
  cfg.redirects = ordered;

  // Clean-url redirects for voyage.html
  if (!cfg.redirects.find((r) => r.source === "/voyage.html")) {
    cfg.redirects.push({
      source: "/voyage.html",
      destination: "/voyage",
      permanent: true,
    });
  }
  if (!cfg.redirects.find((r) => r.source === "/en/voyage.html")) {
    cfg.redirects.push({
      source: "/en/voyage.html",
      destination: "/en/voyage",
      permanent: true,
    });
  }

  fs.writeFileSync(vercelPath, JSON.stringify(cfg, null, 2) + "\n", "utf8");

  const pages = [];
  listPublicHtmlPages(SITE_ROOT, SITE_ROOT, pages);
  console.log(
    "vercel.json SEO P0: host www + " +
      SEO_REDIRECTS.length +
      " redirects, voyage rewrite, " +
      pages.length +
      " public FR pages known"
  );
  console.log("Redirect sources protected:", [...seoPaths].join(", "));
}

if (require.main === module) {
  main();
}

module.exports = { main };
