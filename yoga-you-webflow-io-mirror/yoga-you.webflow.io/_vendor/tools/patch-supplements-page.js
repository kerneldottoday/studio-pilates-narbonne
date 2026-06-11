const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const blogPath = path.join(root, "blog.html");
const contentPath = path.join(root, "_vendor", "content", "supplements-main.html");

let html = fs.readFileSync(blogPath, "utf8");
const section = fs.readFileSync(contentPath, "utf8").trim();

const sectionRegex = /<section class="section hero-blog">[\s\S]*?<\/section>/;
if (!sectionRegex.test(html)) {
  console.error("Blog hero section not found");
  process.exit(1);
}

html = html.replace(sectionRegex, section);

const metaDesc =
  "Compléments alimentaires au Studio Pilates Narbonne : énergie, récupération, articulations et bien-être. Conseils personnalisés par Souhila Chekara.";

html = html.replace(
  /<title>Blog\s+\|\s+Studio Pilates Narbonne<\/title>/,
  "<title>Compléments alimentaires | Studio Pilates Narbonne</title>"
);
html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." name="description"\/>/,
  `<meta content="${metaDesc}" name="description"/>`
);
html = html.replace(
  /<meta content="Blog\s+\|\s+Studio Pilates Narbonne" property="og:title"\/>/,
  '<meta content="Compléments alimentaires | Studio Pilates Narbonne" property="og:title"/>'
);
html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." property="og:description"\/>/,
  `<meta content="${metaDesc}" property="og:description"/>`
);
html = html.replace(
  /<meta content="Blog\s+\|\s+Studio Pilates Narbonne" name="twitter:title"\/>/,
  '<meta content="Compléments alimentaires | Studio Pilates Narbonne" name="twitter:title"/>'
);
html = html.replace(
  /<meta content="Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne\." name="twitter:description"\/>/,
  `<meta content="${metaDesc}" name="twitter:description"/>`
);

html = html.replace(
  /<a href="blog\.html" aria-current="page" class="dropdown-link w-dropdown-link w--current">Voyage<\/a>/,
  '<a href="blog.html" aria-current="page" class="dropdown-link w-dropdown-link w--current">Compléments alimentaires</a>'
);
html = html.replace(
  /<a href="blog\.html" aria-current="page" class="footer-link w--current">Voyage<\/a>/,
  '<a href="blog.html" aria-current="page" class="footer-link w--current">Compléments alimentaires</a>'
);

if (!html.includes('href="_vendor/css/supplements.css"')) {
  html = html.replace(
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/>',
    '<link href="_vendor/css/i18n.css" rel="stylesheet" type="text/css"/><link href="_vendor/css/supplements.css" rel="stylesheet" type="text/css"/>'
  );
}

fs.writeFileSync(blogPath, html, "utf8");
console.log("blog.html updated to supplements page");
