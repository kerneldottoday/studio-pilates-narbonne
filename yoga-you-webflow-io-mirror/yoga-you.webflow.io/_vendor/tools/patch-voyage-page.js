const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const pagePath = path.join(root, "expertises.html");
const contentPath = path.join(root, "_vendor", "content", "voyage-main.html");

let html = fs.readFileSync(pagePath, "utf8");
const section = fs.readFileSync(contentPath, "utf8").trim();

const sectionRegex =
  /<section class="section hero-expertises">[\s\S]*?<\/section><section class="footer">/;

if (!sectionRegex.test(html)) {
  console.error("Expertises main sections not found");
  process.exit(1);
}

html = html.replace(sectionRegex, section + '<section class="footer">');

const metaDesc =
  "Voyage trek Chegaga Sahara marocain du 10 au 17 avril 2026 avec Souhila Chekara. Trekking, yoga et immersion nomade. 899 € par personne.";

html = html.replace(
  /<title>Expertises\s+\|\s+Studio Pilates Narbonne<\/title>/,
  "<title>Voyage | Studio Pilates Narbonne</title>"
);
html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." name="description"\/>/,
  `<meta content="${metaDesc}" name="description"/>`
);
html = html.replace(
  /<meta content="Expertises\s+\|\s+Studio Pilates Narbonne" property="og:title"\/>/,
  '<meta content="Voyage | Studio Pilates Narbonne" property="og:title"/>'
);
html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." property="og:description"\/>/,
  `<meta content="${metaDesc}" property="og:description"/>`
);
html = html.replace(
  /<meta content="Expertises\s+\|\s+Studio Pilates Narbonne" name="twitter:title"\/>/,
  '<meta content="Voyage | Studio Pilates Narbonne" name="twitter:title"/>'
);
html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." name="twitter:description"\/>/,
  `<meta content="${metaDesc}" name="twitter:description"/>`
);

html = html.replace(
  /<a href="expertises\.html" aria-current="page" class="dropdown-link w-dropdown-link w--current">Atouts<\/a>/,
  '<a href="expertises.html" aria-current="page" class="dropdown-link w-dropdown-link w--current">Voyage</a>'
);
html = html.replace(
  /<a href="expertises\.html" aria-current="page" class="footer-link w--current">Atouts<\/a>/,
  '<a href="expertises.html" aria-current="page" class="footer-link w--current">Voyage</a>'
);

if (!html.includes('href="_vendor/css/voyage.css"')) {
  html = html.replace(
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>',
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/><link href="_vendor/css/voyage.css" rel="stylesheet" type="text/css"/>'
  );
}

fs.writeFileSync(pagePath, html, "utf8");
console.log("expertises.html updated to voyage page");
