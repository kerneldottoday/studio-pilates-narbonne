/**
 * Remplace les liens .html par des URLs sans extension (/classes, /planning…)
 * et régénère vercel.json.
 * Usage: node _vendor/tools/apply-clean-urls.js
 */
const fs = require("fs");
const path = require("path");
const {
  listPublicHtmlPages,
  resolveHrefToFile,
  hrefForFile,
  buildVercelRoutes,
  hreflangUrl,
  fileToCleanUrl,
} = require("./clean-urls");

const ROOT = path.join(__dirname, "..", "..");
const REPO_ROOT = path.join(ROOT, "..", "..");
const ORIGINS = [
  "https://studiopilatesnarbonne.fr",
  "https://studio-pilates-narbonne.vercel.app",
];

function rewriteHtmlLinks(html, fromRelPath) {
  let out = html.replace(/\bhref="([^"]*)"/g, function (_m, href) {
    const info = resolveHrefToFile(href, fromRelPath);
    if (!info) return 'href="' + href + '"';
    return 'href="' + hrefForFile(info.resolved, "fr") + info.suffix + '"';
  });

  for (const origin of ORIGINS) {
    out = out.replace(
      new RegExp(origin.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "/([^\"]+)\\.html", "g"),
      function (_m, pagePath) {
        if (pagePath === "homepage" || pagePath === "index") return origin + "/";
        if (pagePath.startsWith("en/homepage") || pagePath === "en/index") return origin + "/en";
        if (pagePath.startsWith("en/")) return origin + "/en/" + pagePath.slice(3);
        return origin + "/" + pagePath;
      }
    );
  }

  return out;
}

function patchIndexHtml() {
  const homepagePath = path.join(ROOT, "homepage.html");
  const indexPath = path.join(ROOT, "index.html");
  if (!fs.existsSync(homepagePath)) {
    return;
  }
  // index.html est servi à / par Vercel avant le rewrite : il doit contenir la page d'accueil, pas une redirection vers /.
  fs.copyFileSync(homepagePath, indexPath);
}

function writeVercelJson(pages) {
  const { rewrites, redirects } = buildVercelRoutes(pages);
  const vercel = {
    $schema: "https://openapi.vercel.sh/vercel.json",
    installCommand: "",
    buildCommand: "node yoga-you-webflow-io-mirror/yoga-you.webflow.io/_vendor/tools/build-en-pages.js",
    outputDirectory: "yoga-you-webflow-io-mirror/yoga-you.webflow.io",
    redirects,
    rewrites,
  };
  fs.writeFileSync(path.join(REPO_ROOT, "vercel.json"), JSON.stringify(vercel, null, 2) + "\n", "utf8");
}

function patchVendorPartials() {
  const partialDirs = [
    { dir: path.join(ROOT, "_vendor", "content"), fromRel: "homepage.html" },
    { dir: path.join(ROOT, "_vendor", "content", "class-bodies"), fromRel: "classes/pilates-reformer.html" },
  ];
  for (const { dir, fromRel } of partialDirs) {
    if (!fs.existsSync(dir)) continue;
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".html")) continue;
      const file = path.join(dir, name);
      let html = fs.readFileSync(file, "utf8");
      const next = rewriteHtmlLinks(html, fromRel);
      if (next !== html) fs.writeFileSync(file, next, "utf8");
    }
  }
}

function main() {
  const pages = [];
  listPublicHtmlPages(ROOT, ROOT, pages);

  let changed = 0;
  for (const relPath of pages.sort()) {
    const file = path.join(ROOT, relPath);
    const html = fs.readFileSync(file, "utf8");
    const next = rewriteHtmlLinks(html, relPath);
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      changed++;
    }
  }

  patchIndexHtml();
  patchVendorPartials();
  writeVercelJson(pages);

  console.log("Clean URLs applied to " + changed + " page(s).");
  console.log("vercel.json updated (" + pages.length + " routes).");
}

main();
