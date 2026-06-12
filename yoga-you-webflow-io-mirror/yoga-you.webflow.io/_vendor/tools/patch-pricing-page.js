const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const pricingPath = path.join(root, "pricing.html");
const contentPath = path.join(root, "_vendor", "content", "pricing-main.html");

let html = fs.readFileSync(pricingPath, "utf8");
const section = fs.readFileSync(contentPath, "utf8").trim();

const sectionRegex =
  /<section class="section dark hero-pricing">[\s\S]*?<\/section>(?:<section class="section dark-light">[\s\S]*?<\/section>)?/;

if (!sectionRegex.test(html)) {
  console.error("Pricing sections not found");
  process.exit(1);
}

html = html.replace(sectionRegex, section);

html = html.replace(
  /<title>Pricing\s+\|\s+Studio Pilates Narbonne<\/title>/,
  "<title>Tarifs | Studio Pilates Narbonne</title>"
);

html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." name="description"\/>/,
  '<meta content="Tarifs Studio Pilates Narbonne : Reformer, Mat et Yoga. Cartes et cours à l\'unité. Achat en ligne sur bsport." name="description"/>'
);

html = html.replace(
  /<meta content="Pricing\s+\|\s+Studio Pilates Narbonne" property="og:title"\/>/,
  '<meta content="Tarifs | Studio Pilates Narbonne" property="og:title"/>'
);

html = html.replace(
  /<meta content="Pricing\s+\|\s+Studio Pilates Narbonne" name="twitter:title"\/>/,
  '<meta content="Tarifs | Studio Pilates Narbonne" name="twitter:title"/>'
);

if (!html.includes('href="_vendor/css/pricing.css"')) {
  html = html.replace(
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>',
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/><link href="_vendor/css/pricing.css" rel="stylesheet" type="text/css"/>'
  );
}

if (!html.includes('href="_vendor/css/scroll-reveal.css"')) {
  html = html.replace(
    '<link href="_vendor/css/pricing.css" rel="stylesheet" type="text/css"/>',
    '<link href="_vendor/css/pricing.css" rel="stylesheet" type="text/css"/><link href="_vendor/css/scroll-reveal.css" rel="stylesheet" type="text/css"/>'
  );
}

if (!html.includes("_vendor/js/scroll-reveal.js")) {
  html = html.replace("</body>", '<script src="_vendor/js/scroll-reveal.js" defer></script></body>');
}

fs.writeFileSync(pricingPath, html, "utf8");
console.log("pricing.html updated");
