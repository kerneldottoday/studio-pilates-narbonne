/**
 * Génère mentions-legales.html (KERNEL) à partir du shell legal.html.
 * Usage: node _vendor/tools/patch-mentions-legales-page.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const legalPath = path.join(root, "legal.html");
const outPath = path.join(root, "mentions-legales.html");
const sectionPath = path.join(root, "_vendor", "content", "mentions-legales-section.html");

function main() {
  const legalHtml = fs.readFileSync(legalPath, "utf8");
  const section = fs.readFileSync(sectionPath, "utf8").trim();

  const sectionRegex =
    /<section class="section legal-section">[\s\S]*?<\/section>/;

  if (!sectionRegex.test(legalHtml)) {
    console.error("Legal section shell not found in legal.html");
    process.exit(1);
  }

  let html = legalHtml.replace(sectionRegex, section);

  html = html.replace(
    /<title>Mentions légales \| Studio Pilates Narbonne<\/title>/,
    "<title>Mentions légales du site | Studio Pilates Narbonne</title>"
  );
  html = html.replace(
    /<meta content="Mentions légales, politique de confidentialité et conditions générales, Studio Pilates Narbonne, Narbonne\." name="description"\/>/,
    '<meta content="Mentions légales du site Studio Pilates Narbonne : éditeur, hébergement, propriété intellectuelle, données personnelles et cookies." name="description"/>'
  );
  html = html.replace(
    /<meta content="Mentions légales \| Studio Pilates Narbonne" property="og:title"\/>/g,
    '<meta content="Mentions légales du site | Studio Pilates Narbonne" property="og:title"/>'
  );
  html = html.replace(
    /<meta content="Mentions légales \| Studio Pilates Narbonne" name="twitter:title"\/>/g,
    '<meta content="Mentions légales du site | Studio Pilates Narbonne" name="twitter:title"/>'
  );
  html = html.replace(
    /<meta content="https:\/\/studiopilatesnarbonne\.com\/legal" property="og:url"\/>/,
    '<meta content="https://studiopilatesnarbonne.com/mentions-legales" property="og:url"/>'
  );
  html = html.replace(
    /<link rel="alternate" hreflang="fr" href="https:\/\/studiopilatesnarbonne\.com\/legal" \/>/,
    '<link rel="alternate" hreflang="fr" href="https://studiopilatesnarbonne.com/mentions-legales" />'
  );
  html = html.replace(
    /<link rel="alternate" hreflang="en" href="https:\/\/studiopilatesnarbonne\.com\/en\/legal" \/>/,
    '<link rel="alternate" hreflang="en" href="https://studiopilatesnarbonne.com/mentions-legales" />'
  );
  html = html.replace(
    /<link rel="alternate" hreflang="x-default" href="https:\/\/studiopilatesnarbonne\.com\/legal" \/>/,
    '<link rel="alternate" hreflang="x-default" href="https://studiopilatesnarbonne.com/mentions-legales" />'
  );
  html = html.replace(
    /<link rel="canonical" href="https:\/\/studiopilatesnarbonne\.com\/legal" \/>/,
    '<link rel="canonical" href="https://studiopilatesnarbonne.com/mentions-legales" />'
  );

  fs.writeFileSync(outPath, html, "utf8");
  console.log("Generated mentions-legales.html");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main };
}
