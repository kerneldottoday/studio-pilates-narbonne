/**
 * URLs lisibles alignées sur la navigation (FR / EN) + vercel.json.
 * Usage: node _vendor/tools/apply-friendly-routes.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const REPO_ROOT = path.join(ROOT, "..", "..");
const ROUTES = JSON.parse(
  fs.readFileSync(path.join(ROOT, "_vendor", "config", "routes.json"), "utf8")
);
const SKIP_DIRS = new Set(["65939d1f139e1daa37da455f", "en", "_vendor"]);

function listHtmlFiles(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listHtmlFiles(full, base, out);
      continue;
    }
    if (entry.name.endsWith(".html")) {
      out.push(path.join(dir, entry.name));
    }
  }
}

function frUrl(file) {
  const route = ROUTES[file];
  return route ? "/" + route.fr : null;
}

function replaceMainPageHrefs(html) {
  let out = html;
  for (const [file, route] of Object.entries(ROUTES)) {
    const target = "/" + route.fr;
    const escaped = file.replace(/\./g, "\\.");
    out = out.replace(
      new RegExp('href="(?:\\.\\.\\/)*(?:\\.\\/)*' + escaped + '"', "g"),
      'href="' + target + '"'
    );
  }
  return out;
}

function patchFrenchPages() {
  const files = [];
  listHtmlFiles(ROOT, ROOT, files);
  let count = 0;

  for (const file of files) {
    const rel = path.relative(ROOT, file).replace(/\\/g, "/");
    const html = fs.readFileSync(file, "utf8");
    const next = replaceMainPageHrefs(html);
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      count++;
    }
  }

  return count;
}

function patchIndexHtml() {
  const indexPath = path.join(ROOT, "index.html");
  if (!fs.existsSync(indexPath)) return;

  let html = fs.readFileSync(indexPath, "utf8");
  html = html
    .replace(/url=homepage\.html/g, "url=/Accueil")
    .replace(/href="homepage\.html"/g, 'href="/Accueil"')
    .replace(/location\.replace\("homepage\.html"\)/g, 'location.replace("/Accueil")')
    .replace(
      /https:\/\/studio-pilates-narbonne\.vercel\.app\/index\.html/g,
      "https://studio-pilates-narbonne.vercel.app/Accueil"
    )
    .replace(
      /https:\/\/studio-pilates-narbonne\.vercel\.app\/en\/index\.html/g,
      "https://studio-pilates-narbonne.vercel.app/en/Home"
    )
    .replace(
      /https:\/\/studio-pilates-narbonne\.vercel\.app\/homepage\.html/g,
      "https://studio-pilates-narbonne.vercel.app/Accueil"
    )
    .replace(
      /<link rel="alternate" hreflang="fr" href="[^"]*" \/>/,
      '<link rel="alternate" hreflang="fr" href="https://studio-pilates-narbonne.vercel.app/Accueil" />'
    )
    .replace(
      /<link rel="alternate" hreflang="en" href="[^"]*" \/>/,
      '<link rel="alternate" hreflang="en" href="https://studio-pilates-narbonne.vercel.app/en/Home" />'
    )
    .replace(
      /<link rel="alternate" hreflang="x-default" href="[^"]*" \/>/,
      '<link rel="alternate" hreflang="x-default" href="https://studio-pilates-narbonne.vercel.app/Accueil" />'
    );
  fs.writeFileSync(indexPath, html, "utf8");
}

function buildVercelConfig() {
  const redirects = [
    { source: "/", destination: "/Accueil", permanent: true },
    { source: "/index.html", destination: "/Accueil", permanent: true },
    { source: "/en", destination: "/en/Home", permanent: true },
    { source: "/en/index.html", destination: "/en/Home", permanent: true },
  ];

  const rewrites = [];
  const seen = new Set();

  for (const [file, route] of Object.entries(ROUTES)) {
    const frFrom = "/" + file;
    const frTo = "/" + route.fr;
    const enFrom = "/en/" + file;
    const enTo = "/en/" + route.en;

    for (const entry of [
      { source: frFrom, destination: frTo },
      { source: enFrom, destination: enTo },
    ]) {
      const key = entry.source + "->" + entry.destination;
      if (!seen.has(key)) {
        seen.add(key);
        redirects.push({ ...entry, permanent: true });
      }
    }

    rewrites.push({ source: "/" + route.fr, destination: "/" + file });
    rewrites.push({ source: "/en/" + route.en, destination: "/en/" + file });
  }

  return {
    $schema: "https://openapi.vercel.sh/vercel.json",
    installCommand: "",
    buildCommand:
      "node yoga-you-webflow-io-mirror/yoga-you.webflow.io/_vendor/tools/build-en-pages.js",
    outputDirectory: "yoga-you-webflow-io-mirror/yoga-you.webflow.io",
    redirects,
    rewrites,
  };
}

function main() {
  const patched = patchFrenchPages();
  patchIndexHtml();

  const vercelPath = path.join(REPO_ROOT, "vercel.json");
  fs.writeFileSync(vercelPath, JSON.stringify(buildVercelConfig(), null, 2) + "\n", "utf8");

  console.log("Patched " + patched + " French HTML file(s) with friendly routes.");
  console.log("Updated vercel.json (" + Object.keys(ROUTES).length + " main routes).");
}

if (require.main === module) {
  main();
}

module.exports = { main, buildVercelConfig, ROUTES };
