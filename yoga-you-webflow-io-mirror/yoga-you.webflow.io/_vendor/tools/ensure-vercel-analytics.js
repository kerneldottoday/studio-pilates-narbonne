/**
 * Retire l'injection directe de Vercel Analytics (consentement requis via cookie-consent.js).
 * Usage: node _vendor/tools/ensure-vercel-analytics.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const ANALYTICS_RE =
  /<script>window\.va=window\.va\|\|function\(\)\{\(window\.vaq=window\.vaq\|\|\[\]\)\.push\(arguments\);\};<\/script><script defer src="\/_vercel\/insights\/script\.js"><\/script>/g;

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    let html = fs.readFileSync(full, "utf8");
    if (!ANALYTICS_RE.test(html)) continue;

    html = html.replace(ANALYTICS_RE, "");
    fs.writeFileSync(full, html, "utf8");
    changed.push(path.relative(root, full));
  }
}

function main() {
  const changed = [];
  walk(root, changed);
  if (changed.length) {
    console.log("Removed direct Vercel Analytics from " + changed.length + " page(s)");
  } else {
    console.log("No direct Vercel Analytics snippets found");
  }
}

if (require.main === module) {
  main();
} else {
  module.exports = { main };
}
