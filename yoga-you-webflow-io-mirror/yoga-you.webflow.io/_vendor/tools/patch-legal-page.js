const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const legalPath = path.join(root, "legal.html");
const sectionPath = path.join(root, "_vendor", "content", "legal-section.html");

let html = fs.readFileSync(legalPath, "utf8");
const section = fs.readFileSync(sectionPath, "utf8").trim();

const sectionRegex =
  /<section class="section(?: legal-section)?">[\s\S]*?<\/section>/;

if (!sectionRegex.test(html)) {
  console.error("Legal section placeholder not found");
  process.exit(1);
}

html = html.replace(sectionRegex, section);

html = html.replace(
  /<link <link href="_vendor\/css\/site-updates\.css"/,
  '<link href="_vendor/css/site-updates.css"'
);

if (!html.includes('href="_vendor/css/legal.css"')) {
  html = html.replace(
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>',
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/><link href="_vendor/css/legal.css" rel="stylesheet" type="text/css"/>'
  );
}

if (!html.includes('href="_vendor/css/scroll-reveal.css"')) {
  html = html.replace(
    '<link href="_vendor/css/legal.css" rel="stylesheet" type="text/css"/>',
    '<link href="_vendor/css/legal.css" rel="stylesheet" type="text/css"/><link href="_vendor/css/scroll-reveal.css" rel="stylesheet" type="text/css"/>'
  );
}

if (!html.includes("_vendor/js/scroll-reveal.js")) {
  html = html.replace("</body>", '<script src="_vendor/js/scroll-reveal.js" defer></script></body>');
}

html = html.replace(
  /<title>Legal\s+\|\s+Studio Pilates Narbonne<\/title>/,
  "<title>Mentions légales | Studio Pilates Narbonne</title>"
);

html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." name="description"\/>/,
  '<meta content="Mentions légales, politique de confidentialité et conditions générales, Studio Pilates Narbonne, Narbonne." name="description"/>'
);

html = html.replace(
  /<meta content="Legal\s+\|\s+Studio Pilates Narbonne" property="og:title"\/>/,
  '<meta content="Mentions légales | Studio Pilates Narbonne" property="og:title"/>'
);

html = html.replace(
  /<meta content="Legal\s+\|\s+Studio Pilates Narbonne" name="twitter:title"\/>/,
  '<meta content="Mentions légales | Studio Pilates Narbonne" name="twitter:title"/>'
);

fs.writeFileSync(legalPath, html, "utf8");
console.log("legal.html updated");
