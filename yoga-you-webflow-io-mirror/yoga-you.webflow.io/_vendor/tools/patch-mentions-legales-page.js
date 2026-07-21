/**
 * Génère mentions-legales.html (KERNEL) à partir du shell legal.html.
 * Usage: node _vendor/tools/patch-mentions-legales-page.js
 */
const fs = require("fs");
const path = require("path");
const { SITE_ORIGIN } = require("./site-config");

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
  // Page conservée pour historique, mais redirigée 301 → /legal (voir SEO_REDIRECTS).
  html = html.replace(
    /<meta content="https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/legal" property="og:url"\/>/,
    '<meta content="' + SITE_ORIGIN + '/legal" property="og:url"/>'
  );
  html = html.replace(
    /<link rel="alternate" hreflang="fr" href="https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/(?:mentions-legales|legal)" \/>/,
    '<link rel="alternate" hreflang="fr" href="' + SITE_ORIGIN + '/legal" />'
  );
  html = html.replace(
    /<link rel="alternate" hreflang="en" href="https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/(?:en\/legal|mentions-legales)" \/>/,
    '<link rel="alternate" hreflang="en" href="' + SITE_ORIGIN + '/en/legal" />'
  );
  html = html.replace(
    /<link rel="alternate" hreflang="x-default" href="https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/(?:mentions-legales|legal)" \/>/,
    '<link rel="alternate" hreflang="x-default" href="' + SITE_ORIGIN + '/legal" />'
  );
  html = html.replace(
    /<link rel="canonical" href="https:\/\/(?:www\.)?studiopilatesnarbonne\.com\/(?:mentions-legales|legal)" \/>/,
    '<link rel="canonical" href="' + SITE_ORIGIN + '/legal" />'
  );

  fs.writeFileSync(outPath, html, "utf8");
  console.log("Generated mentions-legales.html");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main };
}
