const fs = require("fs");
const path = require("path");
const {
  root,
  buildFooter,
  replaceFooter,
  pathPrefix,
  detectActive,
} = require("./nav-shell");

const FOOTER_MARKER = '<section class="footer">';

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
    if (!html.includes(FOOTER_MARKER)) continue;

    const rel = path.relative(root, full);
    const prefix = pathPrefix(full);
    const active = detectActive(rel);

    const original = html;
    html = replaceFooter(html, buildFooter({ prefix, active }));
    if (html !== original) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(rel);
    }
  }
}

const changed = [];
walk(root, changed);
console.log("Updated footer on " + changed.length + " page(s)");
