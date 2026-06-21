/**
 * Injecte Vercel Web Analytics sur toutes les pages HTML.
 * Nécessite Web Analytics activé dans le dashboard Vercel + un redeploy.
 * Usage: node _vendor/tools/ensure-vercel-analytics.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const MARKER = "_vercel/insights/script.js";
const SNIPPET =
  '<script>window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};</script>' +
  '<script defer src="/_vercel/insights/script.js"></script>';

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
    if (!html.includes("<body") || html.includes(MARKER)) continue;

    html = html.replace("</body>", SNIPPET + "</body>");
    fs.writeFileSync(full, html, "utf8");
    changed.push(path.relative(root, full));
  }
}

function main() {
  const changed = [];
  walk(root, changed);
  console.log("Added Vercel Analytics on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main };
}
