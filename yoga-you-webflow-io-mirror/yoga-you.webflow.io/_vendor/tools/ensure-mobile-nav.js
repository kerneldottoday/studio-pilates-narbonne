/**
 * Garantit mobile-nav.css + mobile-nav.js sur toutes les pages avec navbar.
 * Usage: node _vendor/tools/ensure-mobile-nav.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const CSS_MARKER = "mobile-nav.css";
const JS_MARKER = "mobile-nav.js";

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
    '" type="text/javascript"></script>'
  );
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

    let html = fs.readFileSync(full, "utf8");
    if (!html.includes('class="navbar w-nav"')) continue;

    const rel = path.relative(root, full);
    const depth = rel.split(path.sep).length - 1;
    const prefix = depth ? "../".repeat(depth) : "";
    let updated = false;

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
      }
    }

    if (!html.includes(JS_MARKER)) {
      const webflowNeedle = prefix + "65939d1f139e1daa37da455f/js/webflow.";
      if (html.includes(webflowNeedle)) {
        html = html.replace(
          /(<script src="[^"]*\/js\/webflow\.[^"]+" type="text\/javascript"><\/script>)/,
          "$1" + jsTag(prefix)
        );
        updated = true;
      } else if (html.includes("</body>")) {
        html = html.replace("</body>", jsTag(prefix) + "</body>");
        updated = true;
      }
    }

    if (updated) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(rel);
    }
  }
}

const changed = [];
walk(root, changed);
console.log("Ensured mobile nav on " + changed.length + " page(s)");
