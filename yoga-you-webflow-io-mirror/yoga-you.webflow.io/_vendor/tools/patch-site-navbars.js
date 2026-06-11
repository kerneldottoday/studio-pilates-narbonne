const fs = require("fs");
const path = require("path");
const {
  root,
  buildNavbar,
  replaceNavbar,
  pathPrefix,
  detectActive,
} = require("./nav-shell");

const NAVBAR_MARKER = 'class="navbar w-nav"';

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
    if (!html.includes(NAVBAR_MARKER)) continue;

    const rel = path.relative(root, full);
    const prefix = pathPrefix(full);
    const active = detectActive(rel);
    const classSlug =
      rel.startsWith("classes" + path.sep) ? path.basename(rel) : null;

    const original = html;
    html = replaceNavbar(
      html,
      buildNavbar({ prefix, active, classSlug })
    );
    if (html !== original) {
      fs.writeFileSync(full, html, "utf8");
      changed.push(rel);
    }
  }
}

const changed = [];
walk(root, changed);
console.log("Updated navbar on " + changed.length + " page(s)");
