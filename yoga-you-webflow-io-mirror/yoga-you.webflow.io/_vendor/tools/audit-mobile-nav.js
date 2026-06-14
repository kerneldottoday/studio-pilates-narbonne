const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

function walk(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    const html = fs.readFileSync(full, "utf8");
    if (!html.includes('class="navbar w-nav"')) continue;
    const rel = path.relative(root, full);
    out.push({
      rel,
      css: html.includes("mobile-nav.css"),
      js: html.includes("mobile-nav.js"),
      button: html.includes("menu-button w-nav-button"),
      siteUpdates: html.includes("site-updates.css"),
      webflow: /\/js\/webflow\./.test(html),
    });
  }
}

const rows = [];
walk(root, rows);
const missingCss = rows.filter((r) => !r.css);
const missingJs = rows.filter((r) => !r.js);
const missingButton = rows.filter((r) => !r.button);

console.log("Pages with navbar:", rows.length);
console.log("Missing mobile-nav.css:", missingCss.length);
missingCss.forEach((r) => console.log("  ", r.rel));
console.log("Missing mobile-nav.js:", missingJs.length);
missingJs.forEach((r) => console.log("  ", r.rel));
console.log("Missing menu button:", missingButton.length);
missingButton.forEach((r) => console.log("  ", r.rel));

const allHtml = [];
function walkAll(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkAll(full);
    else if (entry.name.endsWith(".html")) allHtml.push(full);
  }
}
walkAll(root);
const withoutNavbar = allHtml.filter(
  (f) => !fs.readFileSync(f, "utf8").includes('class="navbar w-nav"')
);
console.log("Total HTML:", allHtml.length);
console.log("Without navbar:", withoutNavbar.length);
withoutNavbar.slice(0, 20).forEach((f) => console.log("  ", path.relative(root, f)));
