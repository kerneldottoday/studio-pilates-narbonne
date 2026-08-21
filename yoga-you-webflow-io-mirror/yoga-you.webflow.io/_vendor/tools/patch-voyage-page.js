/**
 * Injecte le contenu voyage FR/EN + meta + scroll-reveal.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const META_FR =
  "Circuit 12 jours au Tassili n’Ajjer avec le Studio Pilates Narbonne : méharée touarègue à Essendilène, randonnée 4×4 dans la Tadrat Rouge. 1 590 €, départ Marseille.";
const META_EN =
  "12-day Tassili n’Ajjer circuit with Studio Pilates Narbonne: Tuareg camel trek to Essendilène and 4×4 in the Tadrat Rouge. €1,590, departs Marseille.";

function injectAssets(html, prefix, isEn) {
  if (!html.includes("scroll-reveal.css")) {
    const after = '<link href="' + prefix + '_vendor/css/voyage.css" rel="stylesheet" type="text/css"/>';
    if (html.includes(after)) {
      html = html.replace(
        after,
        after +
          '<link href="' +
          prefix +
          '_vendor/css/scroll-reveal.css" rel="stylesheet" type="text/css"/>'
      );
    }
  }
  if (!html.includes("scroll-reveal.js")) {
    const marker =
      '<script src="' + prefix + '_vendor/js/rentree-banner.js" type="text/javascript" defer></script>';
    const tag =
      '<script src="' + prefix + '_vendor/js/scroll-reveal.js" defer></script>';
    if (html.includes(marker)) {
      html = html.replace(marker, tag + marker);
    } else {
      html = html.replace("</body>", tag + "</body>");
    }
  }
  html = html.replace(/<body(?![^>]*page-voyage)/, '<body class="page-voyage"');
  if (html.includes('<body class="page-voyage" class=')) {
    html = html.replace('<body class="page-voyage" class="', '<body class="page-voyage ');
  }

  const title = isEn
    ? "Tassili n’Ajjer | Studio Pilates Narbonne"
    : "Voyage Tassili n’Ajjer | Studio Pilates Narbonne";
  const desc = isEn ? META_EN : META_FR;

  html = html.replace(/<title>[^<]*<\/title>/, "<title>" + title + "</title>");
  html = html.replace(
    /<meta content="[^"]*" name="description"\/>/,
    '<meta content="' + desc + '" name="description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:title"\/>/,
    '<meta content="' + title + '" property="og:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="og:description"\/>/,
    '<meta content="' + desc + '" property="og:description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:title"\/>/,
    '<meta content="' + title + '" name="twitter:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="twitter:title"\/>/,
    '<meta content="' + title + '" property="twitter:title"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" name="twitter:description"\/>/,
    '<meta content="' + desc + '" name="twitter:description"/>'
  );
  html = html.replace(
    /<meta content="[^"]*" property="twitter:description"\/>/,
    '<meta content="' + desc + '" property="twitter:description"/>'
  );
  return html;
}

function patchPage(relFile, gridRel, prefix, isEn) {
  const file = path.join(root, relFile);
  let html = fs.readFileSync(file, "utf8");
  const section = fs.readFileSync(path.join(root, gridRel), "utf8").trim();

  const start = html.search(/<section class="section hero-expertises/);
  const footer = html.indexOf('<section class="footer">');
  if (start < 0 || footer < 0) {
    throw new Error("markers not found in " + relFile);
  }
  html = html.slice(0, start) + section + html.slice(footer);
  html = injectAssets(html, prefix, isEn);
  fs.writeFileSync(file, html, "utf8");
  console.log("patched", relFile);
}

patchPage("voyage.html", "_vendor/content/voyage-main.html", "", false);
patchPage("en/voyage.html", "_vendor/content/voyage-main-en.html", "../", true);
