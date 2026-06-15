/**
 * Génère sitemap.xml et robots.txt à la racine du site.
 * Usage: node _vendor/tools/generate-sitemap.js
 */
const fs = require("fs");
const path = require("path");
const { listPublicHtmlPages, hreflangUrl } = require("./clean-urls");

const ROOT = path.join(__dirname, "..", "..");
const SITE_ORIGIN = "https://studiopilatesnarbonne.com";

const SKIP_PAGES = new Set([
  "401.html",
  "404.html",
  "checkout.html",
  "search.html",
  "index.html",
]);

const SKIP_PREFIXES = ["product/", "blog/"];

function shouldSkipSitemap(rel) {
  if (SKIP_PAGES.has(rel)) return true;
  for (const prefix of SKIP_PREFIXES) {
    if (rel.startsWith(prefix) && rel !== "blog.html") return true;
  }
  return false;
}

function generateSitemap() {
  const pages = [];
  listPublicHtmlPages(ROOT, ROOT, pages);
  const publicPages = pages
    .filter((rel) => !rel.startsWith("en/") && !shouldSkipSitemap(rel))
    .sort();

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
  ];

  for (const rel of publicPages) {
    const frUrl = hreflangUrl(SITE_ORIGIN, rel, "fr");
    const enUrl = hreflangUrl(SITE_ORIGIN, rel, "en");
    lines.push("  <url>");
    lines.push("    <loc>" + frUrl + "</loc>");
    lines.push('    <xhtml:link rel="alternate" hreflang="fr" href="' + frUrl + '" />');
    lines.push('    <xhtml:link rel="alternate" hreflang="en" href="' + enUrl + '" />');
    lines.push('    <xhtml:link rel="alternate" hreflang="x-default" href="' + frUrl + '" />');
    lines.push("  </url>");
  }

  lines.push("</urlset>");
  fs.writeFileSync(path.join(ROOT, "sitemap.xml"), lines.join("\n") + "\n", "utf8");
}

function generateRobots() {
  const body = [
    "User-agent: *",
    "Allow: /",
    "Disallow: /checkout",
    "Disallow: /search",
    "Disallow: /product/",
    "",
    "Sitemap: " + SITE_ORIGIN + "/sitemap.xml",
    "",
  ].join("\n");
  fs.writeFileSync(path.join(ROOT, "robots.txt"), body, "utf8");
}

function main() {
  generateSitemap();
  generateRobots();
  console.log("Generated sitemap.xml and robots.txt");
}

if (require.main === module) {
  main();
}

module.exports = { generateSitemap, generateRobots, main };
