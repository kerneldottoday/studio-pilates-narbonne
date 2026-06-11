const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const webflowCss = "65939d1f139e1daa37da455f/css/yoga-you.webflow.7d97343ae.css";
const siteUpdatesTag =
  '<link href="_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>';
const siteUpdatesTagNested =
  '<link href="../_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>';

function fixHtml(file, html) {
  let updated = html;

  updated = updated.replace(/<link\s+<link href="/g, '<link href="');
  updated = updated.replace(/<link\s+<link href="\.\.\//g, '<link href="../');

  const isNested = file.includes(path.sep) && !file.startsWith(".");
  const prefix = isNested ? "../" : "";
  const tag = isNested ? siteUpdatesTagNested : siteUpdatesTag;
  const wf = prefix + webflowCss;

  const wfIndex = updated.indexOf(wf);
  if (wfIndex === -1) return updated;

  const beforeWebflow = updated.slice(0, wfIndex);
  const afterWebflow = updated.slice(wfIndex);

  const suPattern = new RegExp(
    `<link href="${prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}_vendor/css/site-updates\\.css" rel="stylesheet" type="text/css"/>`,
    "g"
  );
  const cleanedBefore = beforeWebflow.replace(suPattern, "");

  updated = cleanedBefore + afterWebflow;

  if (!updated.includes("_vendor/css/site-updates.css")) {
    const i18nNeedle = `${prefix}_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>`;
    const i18nIndex = updated.indexOf(i18nNeedle);
    if (i18nIndex !== -1) {
      const insertAt = i18nIndex + i18nNeedle.length;
      updated = updated.slice(0, insertAt) + tag + updated.slice(insertAt);
    }
  }

  return updated;
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, changed);
    else if (entry.name.endsWith(".html")) {
      const original = fs.readFileSync(full, "utf8");
      const rel = path.relative(root, full);
      const updated = fixHtml(rel, original);
      if (updated !== original) {
        fs.writeFileSync(full, updated, "utf8");
        changed.push(rel);
      }
    }
  }
}

const changed = [];
walk(root, changed);
console.log(`Fixed ${changed.length} HTML file(s)`);
