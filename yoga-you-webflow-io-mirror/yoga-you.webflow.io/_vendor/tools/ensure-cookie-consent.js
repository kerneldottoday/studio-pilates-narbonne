/**
 * Injecte la bannière cookies + retire l'analytics non consenti.
 * Usage: node _vendor/tools/ensure-cookie-consent.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const CSS_MARKER = "cookie-consent.css";
const JS_MARKER = "cookie-consent.js";

const ANALYTICS_RE =
  /<script>window\.va=window\.va\|\|function\(\)\{\(window\.vaq=window\.vaq\|\|\[\]\)\.push\(arguments\);\};<\/script><script defer src="\/_vercel\/insights\/script\.js"><\/script>/g;

function cssLink(prefix) {
  return (
    '<link href="' +
    prefix +
    '_vendor/css/' +
    CSS_MARKER +
    '" rel="stylesheet" type="text/css"/>'
  );
}

function jsTag(prefix) {
  return (
    '<script src="' +
    prefix +
    '_vendor/js/' +
    JS_MARKER +
    '" type="text/javascript" defer></script>'
  );
}

function assetPrefix(relPath) {
  const depth = relPath.split("/").length - 1;
  return depth ? "../".repeat(depth) : "";
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

    const rel = path.relative(root, full).replace(/\\/g, "/");
    let html = fs.readFileSync(full, "utf8");
    if (!html.includes("<body")) continue;

    const prefix = assetPrefix(rel);
    let updated = false;

    if (html.match(ANALYTICS_RE)) {
      html = html.replace(ANALYTICS_RE, "");
      updated = true;
    }

    if (!html.includes(CSS_MARKER)) {
      if (html.includes(prefix + "_vendor/css/site-updates.css")) {
        html = html.replace(
          '<link href="' + prefix + '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>',
          '<link href="' + prefix + '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>' +
            cssLink(prefix)
        );
        updated = true;
      } else if (html.includes(prefix + "_vendor/css/i18n.css")) {
        html = html.replace(
          '<link href="' + prefix + '_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>',
          '<link href="' + prefix + '_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>' +
            cssLink(prefix)
        );
        updated = true;
      } else if (html.includes("</head>")) {
        html = html.replace("</head>", cssLink(prefix) + "</head>");
        updated = true;
      }
    }

    if (!html.includes(JS_MARKER) && html.includes("</body>")) {
      html = html.replace("</body>", jsTag(prefix) + "</body>");
      updated = true;
    }

    if (updated) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(rel);
    }
  }
}

function main() {
  const changed = [];
  walk(root, changed);
  console.log("Ensured cookie consent on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, stripAnalytics: (html) => html.replace(ANALYTICS_RE, "") };
}
