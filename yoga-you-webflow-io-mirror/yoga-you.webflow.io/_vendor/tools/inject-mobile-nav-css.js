const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const MARKER = "_vendor/css/mobile-nav.css";

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
    if (!html.includes('class="navbar w-nav"') || html.includes(MARKER)) {
      continue;
    }

    const rel = path.relative(root, full);
    const depth = rel.split(path.sep).length - 1;
    const prefix = depth ? "../".repeat(depth) : "";
    const link =
      '<link href="' + prefix + MARKER + '" rel="stylesheet" type="text/css"/>';

    if (html.includes(prefix + "_vendor/css/site-updates.css")) {
      html = html.replace(
        '<link href="' + prefix + '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>',
        '<link href="' + prefix + '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>' +
          link
      );
    } else if (html.includes(prefix + "_vendor/css/i18n.css")) {
      html = html.replace(
        '<link href="' + prefix + '_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>',
        '<link href="' + prefix + '_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>' +
          link
      );
    } else {
      continue;
    }

    fs.writeFileSync(full, html, "utf8");
    changed.push(rel);
  }
}

const changed = [];
walk(root, changed);
console.log("Injected mobile-nav.css on " + changed.length + " page(s)");
