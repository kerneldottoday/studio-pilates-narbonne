const fs = require("fs");
const path = require("path");
const { root, buildNavbar, replaceNavbar, pathPrefix } = require("./nav-shell");

const ERROR_PAGES = ["401.html", "404.html"];

function patchErrorPage(relPath) {
  const full = path.join(root, relPath);
  if (!fs.existsSync(full)) return false;

  let html = fs.readFileSync(full, "utf8");
  if (html.includes('class="navbar w-nav"')) return false;

  const prefix = pathPrefix(full);
  const navbar = buildNavbar({ prefix, active: null });
  const bodyStart = html.indexOf("<body>");
  if (bodyStart === -1) return false;

  const afterBody = bodyStart + "<body>".length;
  const sectionStart = html.indexOf("<section", afterBody);
  if (sectionStart === -1) return false;

  html = html.slice(0, afterBody) + navbar + html.slice(sectionStart);

  if (!html.includes("mobile-nav.css")) {
    html = html.replace(
      '<link href="' + prefix + '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>',
      '<link href="' + prefix + '_vendor/css/site-updates.css" rel="stylesheet" type="text/css"/>' +
        '<link href="' + prefix + '_vendor/css/mobile-nav.css" rel="stylesheet" type="text/css"/>'
    );
  }

  if (!html.includes("mobile-nav.js")) {
    html = html.replace(
      /(<script src="[^"]*\/js\/webflow\.[^"]+" type="text\/javascript"><\/script>)/,
      '$1<script src="' + prefix + '_vendor/js/mobile-nav.js" type="text/javascript"></script>'
    );
  }

  fs.writeFileSync(full, html, "utf8");
  return true;
}

const changed = [];
for (const rel of ERROR_PAGES) {
  if (patchErrorPage(rel)) changed.push(rel);
  // Pages en/401 et en/404 sont régénérées par build-en-pages.js — ne pas patcher ici
}

console.log("Added navbar + mobile nav on " + changed.length + " error page(s)");
changed.forEach((rel) => console.log("  ", rel));
