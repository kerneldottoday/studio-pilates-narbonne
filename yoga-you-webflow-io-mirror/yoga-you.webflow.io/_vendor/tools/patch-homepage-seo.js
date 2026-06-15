/**
 * Optimise le SEO de la homepage (title, description, JSON-LD LocalBusiness).
 * Usage: node _vendor/tools/patch-homepage-seo.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SITE_ORIGIN = "https://studiopilatesnarbonne.com";
const JSONLD_MARKER = 'id="homepage-jsonld"';

const SEO = {
  fr: {
    title: "Studio Pilates Narbonne | Reformer, Mat & Yoga",
    description:
      "Studio Pilates Narbonne : Reformer, Mat et Yoga Ashtanga en petits groupes. Souhila Chekara, instructrice certifiée à Narbonne.",
    jsonLdDescription:
      "Studio de Pilates à Narbonne : cours Reformer, Mat et Yoga Ashtanga en petits groupes avec Souhila Chekara, instructrice certifiée.",
    inLanguage: "fr-FR",
  },
  en: {
    title: "Studio Pilates Narbonne | Reformer, Mat & Yoga",
    description:
      "Studio Pilates Narbonne: Reformer, Mat and Ashtanga Yoga in small groups. Certified instructor Souhila Chekara in Narbonne, France.",
    jsonLdDescription:
      "Pilates studio in Narbonne offering Reformer, Mat and Ashtanga Yoga in small groups with certified instructor Souhila Chekara.",
    inLanguage: "en-GB",
  },
};

function buildJsonLd(locale) {
  const copy = SEO[locale];
  const payload = {
    "@context": "https://schema.org",
    "@type": ["LocalBusiness", "HealthClub"],
    "@id": SITE_ORIGIN + "/#organization",
    name: "Studio Pilates Narbonne",
    description: copy.jsonLdDescription,
    url: SITE_ORIGIN + "/",
    inLanguage: copy.inLanguage,
    telephone: "+33650080222",
    email: "lahissou@hotmail.fr",
    image: SITE_ORIGIN + "/_vendor/media/stock/og-studio.jpg",
    address: {
      "@type": "PostalAddress",
      streetAddress: "8 Rue du Luxembourg",
      addressLocality: "Narbonne",
      postalCode: "11100",
      addressCountry: "FR",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 43.1843,
      longitude: 3.0036,
    },
    sameAs: [
      "https://www.instagram.com/studiopilatesnarbonne",
      "https://www.youtube.com/@lahissou",
    ],
    priceRange: "€€",
    founder: {
      "@type": "Person",
      name: "Souhila Chekara",
      jobTitle: locale === "fr" ? "Instructrice Pilates certifiée" : "Certified Pilates instructor",
    },
  };

  return (
    '<script type="application/ld+json" ' +
    JSONLD_MARKER +
    ">" +
    JSON.stringify(payload) +
    "</script>"
  );
}

function stripJsonLd(html) {
  return html.replace(
    /<script type="application\/ld\+json" id="homepage-jsonld">[\s\S]*?<\/script>\n?/g,
    ""
  );
}

function applyMeta(html, locale) {
  const copy = SEO[locale];
  let out = html;

  out = out.replace(/<title>[^<]*<\/title>/, "<title>" + copy.title + "</title>");
  out = out.replace(
    /<meta content="[^"]*" name="description"\/>/,
    '<meta content="' + copy.description + '" name="description"/>'
  );
  out = out.replace(
    /<meta content="[^"]*" property="og:title"\/>/,
    '<meta content="' + copy.title + '" property="og:title"/>'
  );
  out = out.replace(
    /<meta content="[^"]*" property="og:description"\/>/,
    '<meta content="' + copy.description + '" property="og:description"/>'
  );
  out = out.replace(
    /<meta content="[^"]*" (?:name|property)="twitter:title"\/>/g,
    '<meta content="' + copy.title + '" property="twitter:title"/>'
  );
  out = out.replace(
    /<meta content="[^"]*" (?:name|property)="twitter:description"\/>/g,
    '<meta content="' + copy.description + '" property="twitter:description"/>'
  );

  return out;
}

function patchFile(relPath, locale) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let html = fs.readFileSync(filePath, "utf8");
  const next = injectJsonLd(applyMeta(stripJsonLd(html), locale), locale);
  if (next === html) {
    return false;
  }
  fs.writeFileSync(filePath, next, "utf8");
  return true;
}

function injectJsonLd(html, locale) {
  const tag = buildJsonLd(locale);
  if (html.includes(JSONLD_MARKER)) {
    return html.replace(
      /<script type="application\/ld\+json" id="homepage-jsonld">[\s\S]*?<\/script>/,
      tag
    );
  }
  return html.replace("</head>", tag + "\n</head>");
}

function syncIndex(fromRel, toRel) {
  const from = path.join(ROOT, fromRel);
  const to = path.join(ROOT, toRel);
  if (fs.existsSync(from)) {
    fs.copyFileSync(from, to);
  }
}

function main() {
  const changed = [];
  if (patchFile("homepage.html", "fr")) changed.push("homepage.html");
  if (patchFile("en/homepage.html", "en")) changed.push("en/homepage.html");

  syncIndex("homepage.html", "index.html");
  syncIndex("en/homepage.html", "en/index.html");

  console.log("Patched homepage SEO on " + changed.length + " file(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, SEO, buildJsonLd, patchFile };
}
