const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const revealTargets = [
  ['class="title-wrap-classes"', 'class="title-wrap-classes reveal-on-scroll"'],
  ['class="master-filters"', 'class="master-filters reveal-on-scroll"'],
  ['class="tile-class w-inline-block"', 'class="tile-class reveal-on-scroll w-inline-block"'],
  ['class="wrap-image-combo-halves"', 'class="wrap-image-combo-halves reveal-on-scroll"'],
  ['class="top-combo-halves"', 'class="top-combo-halves reveal-on-scroll"'],
  ['class="master-icons-list"', 'class="master-icons-list reveal-on-scroll"'],
  ['class="left-faq-halves"', 'class="left-faq-halves reveal-on-scroll"'],
  ['class="master-expandable-halves"', 'class="master-expandable-halves reveal-on-scroll"'],
];

function patchClassesFile(filePath, assetPrefix) {
  if (!fs.existsSync(filePath)) {
    console.warn("Skip missing:", filePath);
    return;
  }

  let html = fs.readFileSync(filePath, "utf8");

  for (const [from, to] of revealTargets) {
    if (from.includes("tile-class")) {
      html = html.split(from).join(to);
    } else if (!html.includes(to)) {
      html = html.replace(from, to);
    }
  }

  const cssHref = `${assetPrefix}_vendor/css/scroll-reveal.css`;
  if (!html.includes(cssHref)) {
    html = html.replace(
      `<link href="${assetPrefix}_vendor/css/mobile-nav.css" rel="stylesheet" type="text/css"/>`,
      `<link href="${assetPrefix}_vendor/css/mobile-nav.css" rel="stylesheet" type="text/css"/><link href="${cssHref}" rel="stylesheet" type="text/css"/>`
    );
  }

  const jsSrc = `${assetPrefix}_vendor/js/scroll-reveal.js`;
  const bsport = `<script src="${assetPrefix}_vendor/js/bsport-links.js" type="text/javascript"></script>`;
  if (!html.includes(jsSrc)) {
    if (html.includes('hero-unroll.js" defer></script>')) {
      html = html.replace(
        /<script src="[^"]*hero-unroll\.js" defer><\/script>/,
        (match) => `${match}<script src="${jsSrc}" defer></script>`
      );
    } else if (html.includes(bsport)) {
      html = html.replace(bsport, `${bsport}<script src="${jsSrc}" defer></script>`);
    }
  }

  if (!html.includes('class="page-classes"')) {
    html = html.replace("<body>", '<body class="page-classes">');
  }

  fs.writeFileSync(filePath, html, "utf8");
  console.log("Patched", path.relative(root, filePath));
}

patchClassesFile(path.join(root, "classes.html"), "");
patchClassesFile(path.join(root, "en", "classes.html"), "../");
