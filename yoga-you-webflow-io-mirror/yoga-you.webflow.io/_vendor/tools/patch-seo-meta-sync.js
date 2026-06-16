/**
 * Aligne og:title/description et twitter:* sur title + meta description de chaque page.
 * Usage: node _vendor/tools/patch-seo-meta-sync.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

function escapeAttr(value) {
  return value.replace(/"/g, "&quot;");
}

function syncSocialMeta(html) {
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  const descMatch = html.match(/<meta content="([^"]*)" name="description"\/>/);
  if (!titleMatch && !descMatch) {
    return html;
  }

  let out = html;

  if (titleMatch) {
    const title = escapeAttr(titleMatch[1]);
    out = out.replace(
      /<meta content="[^"]*" property="og:title"\/>/,
      '<meta content="' + title + '" property="og:title"/>'
    );
    out = out.replace(
      /<meta content="[^"]*" (?:name|property)="twitter:title"\/>/g,
      '<meta content="' + title + '" property="twitter:title"/>'
    );
  }

  if (descMatch) {
    const desc = escapeAttr(descMatch[1]);
    out = out.replace(
      /<meta content="[^"]*" property="og:description"\/>/,
      '<meta content="' + desc + '" property="og:description"/>'
    );
    out = out.replace(
      /<meta content="[^"]*" (?:name|property)="twitter:description"\/>/g,
      '<meta content="' + desc + '" property="twitter:description"/>'
    );
  }

  return out;
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    const html = fs.readFileSync(full, "utf8");
    const next = syncSocialMeta(html);
    if (next !== html) {
      fs.writeFileSync(full, next, "utf8");
      changed.push(path.relative(ROOT, full));
    }
  }
}

function main() {
  const changed = [];
  walk(ROOT, changed);
  console.log("Synced social meta on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, syncSocialMeta };
}
