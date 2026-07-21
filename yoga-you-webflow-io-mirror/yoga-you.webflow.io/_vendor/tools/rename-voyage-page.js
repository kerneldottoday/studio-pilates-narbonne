/**
 * Renomme expertises.html → voyage.html et met à jour les liens internes.
 * Usage: node _vendor/tools/rename-voyage-page.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SRC = path.join(ROOT, "expertises.html");
const DEST = path.join(ROOT, "voyage.html");

function walkHtml(dir, fn) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    // Ne pas réécrire les outils de build (évite de corrompre SEO_REDIRECTS).
    if (
      entry.name === "65939d1f139e1daa37da455f" ||
      entry.name === "en" ||
      entry.name === "_vendor" ||
      entry.name === "tools"
    ) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, fn);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    fn(full);
  }
}

function rewriteContent(text) {
  return text
    .replace(/\/expertises\.html/g, "/voyage")
    .replace(/href="(?:\.\.\/)*expertises\.html"/g, 'href="/voyage"')
    .replace(/href="\/expertises"/g, 'href="/voyage"')
    .replace(/href="\/en\/expertises"/g, 'href="/en/voyage"')
    .replace(/https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/expertises/g, "https://www.studiopilatesnarbonne.com/voyage")
    .replace(/https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/en\/expertises/g, "https://www.studiopilatesnarbonne.com/en/voyage");
}

function main() {
  if (!fs.existsSync(SRC) && fs.existsSync(DEST)) {
    console.log("voyage.html already present, expertises.html gone — link pass only");
  } else if (fs.existsSync(SRC)) {
    let html = fs.readFileSync(SRC, "utf8");
    html = rewriteContent(html);
    html = html.replace(
      /canonical" href="[^"]*expertises"/,
      'canonical" href="https://www.studiopilatesnarbonne.com/voyage"'
    );
    fs.writeFileSync(DEST, html, "utf8");
    fs.unlinkSync(SRC);
    console.log("Renamed expertises.html → voyage.html");
  } else {
    throw new Error("Neither expertises.html nor voyage.html found");
  }

  let changed = 0;
  walkHtml(ROOT, (full) => {
    if (path.basename(full) === "voyage.html") return;
    const raw = fs.readFileSync(full, "utf8");
    if (!/expertises/.test(raw)) return;
    const next = rewriteContent(raw);
    if (next !== raw) {
      fs.writeFileSync(full, next, "utf8");
      changed++;
    }
  });

  // Vendor tools that still point at the page path (not CSS class names)
  const toolFiles = [
    "patch-voyage-page.js",
    "patch-nav-voyage.js",
    "test-analytics-visits.js",
  ];
  for (const name of toolFiles) {
    const file = path.join(__dirname, name);
    if (!fs.existsSync(file)) continue;
    let src = fs.readFileSync(file, "utf8");
    const next = src
      .replace(/expertises\.html/g, "voyage.html")
      .replace(/"\/expertises"/g, '"/voyage"')
      .replace(/'\/expertises'/g, "'/voyage'");
    if (next !== src) {
      fs.writeFileSync(file, next, "utf8");
      console.log("Updated tool " + name);
    }
  }

  console.log("Updated expertises→voyage links in " + changed + " file(s)");
}

if (require.main === module) {
  main();
}

module.exports = { main };
