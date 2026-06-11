const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const cssTag = '<link href="{prefix}_vendor/css/page-transitions.css" rel="stylesheet" type="text/css"/>';
const jsTag = '<script src="{prefix}_vendor/js/page-transitions.js" defer></script>';

function patchHtml(rel, html) {
  const isNested = rel.includes(path.sep);
  const prefix = isNested ? "../" : "";
  const css = cssTag.replace("{prefix}", prefix);
  const js = jsTag.replace("{prefix}", prefix);

  if (html.includes("_vendor/css/page-transitions.css")) {
    return html;
  }

  const siteUpdatesNeedle = `${prefix}_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>`;
  const siteUpdatesIndex = html.indexOf(siteUpdatesNeedle);
  if (siteUpdatesIndex === -1) return html;

  const insertCssAt = siteUpdatesIndex + siteUpdatesNeedle.length;
  let updated = html.slice(0, insertCssAt) + css + html.slice(insertCssAt);

  updated = updated.replace("</body>", js + "</body>");
  return updated;
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, changed);
    else if (entry.name.endsWith(".html")) {
      const rel = path.relative(root, full);
      const original = fs.readFileSync(full, "utf8");
      const updated = patchHtml(rel, original);
      if (updated !== original) {
        fs.writeFileSync(full, updated, "utf8");
        changed.push(rel);
      }
    }
  }
}

const changed = [];
walk(root, changed);
console.log(`Added page transitions to ${changed.length} HTML file(s)`);
