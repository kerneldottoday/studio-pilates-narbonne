/**
 * Remplace les pages e-commerce / recherche / articles blog template par des redirections.
 * Usage: node _vendor/tools/patch-dead-pages.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const EN = path.join(ROOT, "en");

const BLOG_SLUGS = [
  "cultivating-mind-body-awareness",
  "finding-balance-for-optimal-health",
  "harnessing-the-power-of-awareness-at-the-table",
  "nutrition-tips-for-yogis",
  "poses-and-practices-to-support-your-gut",
  "release-toxins-and-rejuvenate-your-body",
];

function redirectHtml(target, title) {
  const safe = target.replace(/"/g, "&quot;");
  return (
    '<!DOCTYPE html><html lang="fr"><head><meta charset="utf-8"/>' +
    '<meta http-equiv="refresh" content="0;url=' +
    safe +
    '"/>' +
    "<title>" +
    title +
    "</title>" +
    '<script>location.replace("' +
    target +
    '")</script>' +
    "</head><body></body></html>"
  );
}

function writeRedirect(relPath, target, title) {
  const full = path.join(ROOT, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, redirectHtml(target, title), "utf8");
}

const jobs = [
  ["checkout.html", "/pricing", "Redirect to pricing"],
  ["search.html", "/", "Redirect to home"],
  ["product/single-class.html", "/pricing", "Redirect to pricing"],
  ["product/5-classes.html", "/pricing", "Redirect to pricing"],
  ["product/10-classes.html", "/pricing", "Redirect to pricing"],
  ["en/checkout.html", "/en/pricing", "Redirect to pricing"],
  ["en/search.html", "/en", "Redirect to home"],
  ["en/product/single-class.html", "/en/pricing", "Redirect to pricing"],
  ["en/product/5-classes.html", "/en/pricing", "Redirect to pricing"],
  ["en/product/10-classes.html", "/en/pricing", "Redirect to pricing"],
];

for (const slug of BLOG_SLUGS) {
  jobs.push(["blog/" + slug + ".html", "/blog", "Redirect to supplements"]);
  jobs.push(["en/blog/" + slug + ".html", "/en/blog", "Redirect to supplements"]);
}

let count = 0;
for (const [rel, target, title] of jobs) {
  writeRedirect(rel, target, title);
  count++;
}

console.log("Wrote " + count + " redirect stub page(s)");
