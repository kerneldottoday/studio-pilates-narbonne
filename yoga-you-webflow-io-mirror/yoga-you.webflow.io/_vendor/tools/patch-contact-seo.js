/**
 * JSON-LD ContactPage + LocalBusiness sur contact.html (FR et EN).
 * Usage: node _vendor/tools/patch-contact-seo.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const SITE_ORIGIN = "https://studiopilatesnarbonne.com";
const JSONLD_MARKER = 'id="contact-jsonld"';
const ORG_ID = SITE_ORIGIN + "/#organization";

const COPY = {
  fr: {
    pageName: "Contact — Studio Pilates Narbonne",
    pageDescription:
      "Contactez Studio Pilates Narbonne : adresse, téléphone, email et réservation de cours à Narbonne.",
    orgDescription:
      "Studio de Pilates à Narbonne : cours Reformer, Mat et Yoga Ashtanga en petits groupes avec Souhila Chekara.",
    inLanguage: "fr-FR",
    jobTitle: "Instructrice Pilates certifiée",
  },
  en: {
    pageName: "Contact — Studio Pilates Narbonne",
    pageDescription:
      "Contact Studio Pilates Narbonne: address, phone, email and class booking in Narbonne, France.",
    orgDescription:
      "Pilates studio in Narbonne offering Reformer, Mat and Ashtanga Yoga in small groups with Souhila Chekara.",
    inLanguage: "en-GB",
    jobTitle: "Certified Pilates instructor",
  },
};

function organizationNode(locale) {
  const copy = COPY[locale];
  return {
    "@type": ["LocalBusiness", "HealthClub"],
    "@id": ORG_ID,
    name: "Studio Pilates Narbonne",
    description: copy.orgDescription,
    url: SITE_ORIGIN + "/",
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
    founder: {
      "@type": "Person",
      name: "Souhila Chekara",
      jobTitle: copy.jobTitle,
    },
  };
}

function buildJsonLd(locale, pageUrl) {
  const copy = COPY[locale];
  const payload = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        "@id": pageUrl + "#webpage",
        url: pageUrl,
        name: copy.pageName,
        description: copy.pageDescription,
        inLanguage: copy.inLanguage,
        isPartOf: { "@id": SITE_ORIGIN + "/#website" },
        about: { "@id": ORG_ID },
        mainEntity: { "@id": ORG_ID },
      },
      organizationNode(locale),
      {
        "@type": "WebSite",
        "@id": SITE_ORIGIN + "/#website",
        url: SITE_ORIGIN + "/",
        name: "Studio Pilates Narbonne",
        inLanguage: copy.inLanguage,
        publisher: { "@id": ORG_ID },
      },
    ],
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
    /<script type="application\/ld\+json" id="contact-jsonld">[\s\S]*?<\/script>\n?/g,
    ""
  );
}

function injectJsonLd(html, locale, pageUrl) {
  const tag = buildJsonLd(locale, pageUrl);
  if (html.includes(JSONLD_MARKER)) {
    return html.replace(
      /<script type="application\/ld\+json" id="contact-jsonld">[\s\S]*?<\/script>/,
      tag
    );
  }
  return html.replace("</head>", tag + "\n</head>");
}

function patchFile(relPath, locale, pageUrl) {
  const filePath = path.join(ROOT, relPath);
  if (!fs.existsSync(filePath)) {
    return false;
  }

  let html = fs.readFileSync(filePath, "utf8");
  html = html.replace(
    /<title>Contact\s+\|\s+Studio Pilates Narbonne<\/title>/,
    "<title>Contact | Studio Pilates Narbonne</title>"
  );
  const next = injectJsonLd(html, locale, pageUrl);
  if (next === html) {
    return false;
  }
  fs.writeFileSync(filePath, next, "utf8");
  return true;
}

function main() {
  const changed = [];
  if (patchFile("contact.html", "fr", SITE_ORIGIN + "/contact")) changed.push("contact.html");
  if (patchFile("en/contact.html", "en", SITE_ORIGIN + "/en/contact")) {
    changed.push("en/contact.html");
  }
  console.log("Patched contact SEO on " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, buildJsonLd };
}
