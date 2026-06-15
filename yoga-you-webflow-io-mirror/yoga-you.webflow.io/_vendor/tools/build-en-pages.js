/**
 * Génère les pages anglaises statiques sous /en/ à partir des HTML français.
 * Usage: node _vendor/tools/build-en-pages.js
 */
const fs = require("fs");
const path = require("path");
const { resolveHrefToFile, hrefForFile, hreflangUrl } = require("./clean-urls");
const { stripClassPlayButton } = require("./strip-class-play-button");
const { injectClassBookingCta } = require("./inject-class-booking-cta");

const ROOT = path.join(__dirname, "..", "..");
const EN_DIR = path.join(ROOT, "en");
const SITE_ORIGIN = "https://studiopilatesnarbonne.com";

const SKIP_DIRS = new Set(["65939d1f139e1daa37da455f", "en", "_vendor"]);
const ASSET_ROOTS = ["_vendor/", "65939d1f139e1daa37da455f/"];

const I18N_EN = {
  "nav.home": "Home",
  "nav.about": "The studio",
  "nav.classes": "Classes",
  "nav.contact": "Contact",
  "nav.planning": "Schedule",
  "nav.more": "More",
  "nav.expertises": "Retreat",
  "nav.classPage": "Class detail",
  "nav.blog": "Supplements",
  "nav.pricing": "Pricing",
  "nav.legal": "Legal notice",
  "nav.allPages": "All pages",
  "nav.cart": "Cart",
  "footer.navigation": "Navigation",
  "footer.information": "Information",
  "hero.location": "Studio Pilates Narbonne",
  "hero.title": "A calm space to strengthen your body and free your mind.",
  "hero.subtitle":
    "A practice true to Joseph Pilates principles: centering, concentration, precision, control, breath, flow and alignment, in small groups in Narbonne.",
  "hero.cta1": "Book a class",
  "hero.cta2": "View schedule",
  "footer.copyright":
    "© 2026 Studio Pilates Narbonne, Souhila Chekara, Pilates instructor",
  "footer.tagline": "A freer body, every day",
  "cart.title": "Your cart",
  "cart.empty": "No items found.",
  "cart.subtotal": "Subtotal",
  "cart.checkout": "Continue to checkout",
  "cart.remove": "Remove",
  "legal.pageTitle": "Legal notice",
  "legal.pageLead":
    "Legal information, privacy policy and terms and conditions for the Studio Pilates Narbonne website. Content is shown in French or English according to the site language selector.",
  "legal.navInfo": "Legal information",
  "legal.navPrivacy": "Privacy policy",
  "legal.navTerms": "Terms and conditions",
};

const PAGE_META = {
  "homepage.html": {
    title: "Studio Pilates Narbonne | Home",
    description:
      "Studio Pilates Narbonne: Reformer, Mat and Ashtanga Yoga in small groups in Narbonne. Classes with certified instructor Souhila Chekara.",
  },
  "classes.html": {
    title: "Our classes | Studio Pilates Narbonne",
    description:
      "Pilates Reformer, Mat, Ashtanga Yoga, RESET and private sessions at Studio Pilates Narbonne. Book on bsport.",
  },
  "contact.html": {
    title: "Contact | Studio Pilates Narbonne",
    description:
      "Contact Studio Pilates Narbonne: questions, booking and guidance to the right class.",
  },
  "planning.html": {
    title: "Schedule | Studio Pilates Narbonne",
    description:
      "Weekly schedule at Studio Pilates Narbonne. Reformer, Mat, Ashtanga Yoga and RESET times.",
  },
  "pricing.html": {
    title: "Pricing | Studio Pilates Narbonne",
    description:
      "Reformer, Mat and Ashtanga Yoga pricing at Studio Pilates Narbonne. Buy online on bsport.",
  },
  "legal.html": {
    title: "Legal notice | Studio Pilates Narbonne",
    description:
      "Legal information, privacy policy and terms and conditions for Studio Pilates Narbonne, Narbonne.",
  },
  "expertises.html": {
    title: "Retreat | Studio Pilates Narbonne",
    description:
      "Pilates and yoga retreat with Souhila Chekara. A unique wellbeing experience.",
  },
  "blog.html": {
    title: "Supplements | Studio Pilates Narbonne",
    description: "Nutrition and supplement guidance for your Pilates and yoga practice.",
  },
  "401.html": {
    title: "Protected | Studio Pilates Narbonne",
    description: "This page is protected.",
  },
  "404.html": {
    title: "Page not found | Studio Pilates Narbonne",
    description: "The page you are looking for does not exist or has been moved.",
  },
};

const CLASSES_PAGE_META = {
  "classes/pilates-reformer.html": {
    title: "Pilates Reformer | Studio Pilates Narbonne",
    description:
      "Pilates Reformer small-group class in Narbonne with Souhila Chekara. Precise machine work, 1 hr, €32. Book on bsport.",
  },
  "classes/reformer-homme.html": {
    title: "Reformer for Men | Studio Pilates Narbonne",
    description:
      "Men-only Pilates Reformer class in Narbonne. Small group, 1 hr with Souhila Chekara. Book on bsport.",
  },
  "classes/pilates-mat.html": {
    title: "Pilates Mat | Studio Pilates Narbonne",
    description:
      "Pilates Mat floor class in Narbonne: strengthening, posture and alignment. 1 hr, €12.50. Book on bsport.",
  },
  "classes/yoga-ashtanga.html": {
    title: "Ashtanga Yoga | Studio Pilates Narbonne",
    description:
      "Ashtanga Yoga in Narbonne: dynamic flowing practice, 1 hr 30 with Souhila Chekara. €12.50. Book on bsport.",
  },
  "classes/reset.html": {
    title: "RESET | Studio Pilates Narbonne",
    description:
      "RESET at Studio Pilates Narbonne: a journey in 10 tracks to harmonise body and mind. 1 hr of release with Souhila Chekara.",
  },
  "classes/cours-prive.html": {
    title: "Private class | Studio Pilates Narbonne",
    description:
      "Private Pilates or Yoga session in Narbonne with Souhila Chekara. Tailored 1 hr session. Book on bsport.",
  },
  "duration/1-hour.html": {
    title: "1-hour classes | Studio Pilates Narbonne",
    description: "One-hour Pilates Reformer, Mat and Yoga classes at Studio Pilates Narbonne.",
  },
  "duration/30-minutes.html": {
    title: "30-minute classes | Studio Pilates Narbonne",
    description: "30-minute classes at Studio Pilates Narbonne.",
  },
  "duration/10-minutes.html": {
    title: "10-minute classes | Studio Pilates Narbonne",
    description: "10-minute classes at Studio Pilates Narbonne.",
  },
  "type/pilates.html": {
    title: "Pilates classes | Studio Pilates Narbonne",
    description: "Pilates Reformer and Mat classes at Studio Pilates Narbonne, Narbonne.",
  },
  "type/yoga.html": {
    title: "Yoga classes | Studio Pilates Narbonne",
    description: "Ashtanga Yoga classes at Studio Pilates Narbonne, Narbonne.",
  },
  "type/breathwork.html": {
    title: "RESET classes | Studio Pilates Narbonne",
    description: "RESET wellbeing sessions at Studio Pilates Narbonne.",
  },
};

const COMMERCE_PAGES = new Set([
  "checkout.html",
  "search.html",
  "product/single-class.html",
  "product/5-classes.html",
  "product/10-classes.html",
]);

const OG_IMAGE_DEFAULT = SITE_ORIGIN + "/_vendor/media/stock/og-studio.jpg";

function getPageMeta(relPath) {
  return PAGE_META[relPath] || CLASSES_PAGE_META[relPath] || null;
}

function translateStringWithMap(text, textMap) {
  const keys = Object.keys(textMap).sort((a, b) => b.length - a.length);
  let out = text;
  for (const fr of keys) {
    const en = textMap[fr];
    if (!fr || fr === en || !out.includes(fr)) continue;
    out = out.split(fr).join(en);
  }
  return out;
}

function translateMetaTags(html, textMap) {
  return html.replace(/<meta content="([^"]*)" ([^>]+)\/>/g, function (_m, content, attrs) {
    if (!/(description|og:|twitter:)/.test(attrs)) return _m;
    const translated = translateStringWithMap(content, textMap);
    if (translated === content) return _m;
    return '<meta content="' + translated.replace(/"/g, "&quot;") + '" ' + attrs + "/>";
  });
}

function injectOgUrl(html, relPath, locale) {
  const url = hreflangUrl(SITE_ORIGIN, relPath, locale);
  const tag = '<meta content="' + url + '" property="og:url"/>\n';
  if (html.includes('property="og:url"')) {
    return html.replace(/<meta content="[^"]*" property="og:url"\/>/, tag.trim());
  }
  return html.replace("</head>", tag + "</head>");
}

function absolutizeOgImages(html) {
  return html
    .replace(
      /<meta content="(?:\.\.\/)*(_vendor\/[^"]+)" property="og:image"\/>/g,
      '<meta content="' + SITE_ORIGIN + '/$1" property="og:image"/>'
    )
    .replace(
      /<meta content="(?:\.\.\/)*(_vendor\/[^"]+)" name="twitter:image"\/>/g,
      '<meta content="' + SITE_ORIGIN + '/$1" name="twitter:image"/>'
    );
}

function polishEnHtml(html, relPath) {
  let out = html.replace(/data-wf-domain="[^"]*"/g, 'data-wf-domain="studiopilatesnarbonne.com"');
  if (!COMMERCE_PAGES.has(relPath)) {
    out = out.replace(/<script type="text\/javascript">window\.__WEBFLOW_CURRENCY_SETTINGS[\s\S]*?<\/script>/g, "");
  }
  if (!out.includes('property="og:image"')) {
    out = out.replace(
      "</head>",
      '<meta content="' + OG_IMAGE_DEFAULT + '" property="og:image"/>\n</head>'
    );
  }
  return out;
}

const EXTRA_MAP = {
  "Accueil": "Home",
  "Cours": "Classes",
  "Tarifs": "Pricing",
  "Mentions": "Legal",
  "Mentions légales": "Legal notice",
  "Débutant": "Beginner",
  "Des questions ? Nous sommes là.": "Questions? We're here.",
  "Méthode authentique": "Authentic method",
  "Petits groupes": "Small groups",
  "Suivi personnalisé": "Personalised guidance",
  "Résultats posture & mobilité": "Posture & mobility results",
  "Puis-je annuler une réservation ?": "Can I cancel a booking?",
  "planning hebdomadaire": "weekly schedule",
  "Renforcement en profondeur": "Deep strengthening",
  "Progression sécurisée": "Safe progression",
  "obligatoire sur": "required on",
  "Consultez le ": "See the ",
  "pour voir les créneaux Reformer du mardi au samedi.":
    "to see Reformer slots from Tuesday to Saturday.",
  "Cours Pilates Reformer en petit groupe à Narbonne avec Souhila Chekara. Travail précis sur machine, 1 h, 32 €. Réservez sur bsport.":
    "Pilates Reformer small-group class in Narbonne with Souhila Chekara. Precise machine work, 1 hr, €32. Book on bsport.",
  "instructrice Pilates certifiée à Narbonne":
    "certified Pilates instructor in Narbonne",
  "Pratique dynamique et fluide pour améliorer force et souplesse, adaptée à tous les niveaux…":
    "Dynamic, flowing practice to build strength and flexibility, for all levels…",
  "Renforcement en profondeur au sol : centre, posture et alignement optimisés, en petit grou…":
    "Deep floor work: core, posture and alignment in a small grou…",
  "Séance Reformer dédiée aux hommes, dans un cadre bienveillant, pour gagner en force, postu…":
    "Reformer session for men in a supportive setting to build strength, postu…",
  "Cours | Studio Pilates Narbonne": "Our classes | Studio Pilates Narbonne",
  "Mentions légales | Studio Pilates Narbonne": "Legal notice | Studio Pilates Narbonne",
  "Tarifs | Studio Pilates Narbonne": "Pricing | Studio Pilates Narbonne",
  "Contact | Studio Pilates Narbonne": "Contact | Studio Pilates Narbonne",
  "Planning | Studio Pilates Narbonne": "Schedule | Studio Pilates Narbonne",
  "Voyage | Studio Pilates Narbonne": "Retreat | Studio Pilates Narbonne",
  "Expertises | Studio Pilates Narbonne": "Retreat | Studio Pilates Narbonne",
  "Compléments alimentaires | Studio Pilates Narbonne":
    "Supplements | Studio Pilates Narbonne",
  "Page introuvable | Studio Pilates Narbonne": "Page not found | Studio Pilates Narbonne",
  "Rechercher | Studio Pilates Narbonne": "Search | Studio Pilates Narbonne",
  "Panier": "Cart",
  "Voyage": "Retreat",
  "Compléments alimentaires": "Supplements",
  "Sommaire juridique": "Legal contents",
  "aria-label=\"Sommaire juridique\"": 'aria-label="Legal contents"',
  "Retour à l'accueil": "Back to home",
  "Not Found": "Page not found",
};

function parseJsMapFile(raw, exportName) {
  const match = raw.match(new RegExp(exportName + "\\s*=\\s*(\\{[\\s\\S]*\\})\\s*;?\\s*$"));
  if (!match) return {};
  return Function("return (" + match[1] + ")")();
}

function loadTextMap() {
  const raw = fs.readFileSync(path.join(ROOT, "_vendor", "i18n", "text-map.js"), "utf8");
  const map = parseJsMapFile(raw, "window\\.STUDIO_TEXT_MAP");
  let supplement = {};
  const supplementPath = path.join(ROOT, "_vendor", "i18n", "text-map-supplement.js");
  if (fs.existsSync(supplementPath)) {
    const supRaw = fs.readFileSync(supplementPath, "utf8");
    supplement = parseJsMapFile(supRaw, "window\\.STUDIO_TEXT_MAP_SUPPLEMENT");
  }
  return Object.assign({}, map, supplement, EXTRA_MAP);
}

function listHtmlPages(dir, base, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      listHtmlPages(full, base, out);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;
    out.push(path.relative(base, full).replace(/\\/g, "/"));
  }
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyDataI18n(html) {
  return html.replace(
    /(<[^>]+data-i18n="([^"]+)"[^>]*>)([^<]*)(<)/g,
    function (_m, open, key, text, close) {
      if (I18N_EN[key]) {
        return open + I18N_EN[key] + close;
      }
      return _m;
    }
  );
}

function encodeHtmlQuotes(s) {
  return s.replace(/"/g, "&quot;");
}

function htmlAmpEntity(s) {
  return s.replace(/&/g, "&amp;");
}

function applyTextMap(html, map) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  let out = html;
  for (const fr of keys) {
    const en = map[fr];
    if (!fr || fr === en) continue;
    const variants = [fr, htmlAmpEntity(fr), encodeHtmlQuotes(fr), htmlAmpEntity(encodeHtmlQuotes(fr))];
    const enVariants = [en, htmlAmpEntity(en), encodeHtmlQuotes(en), htmlAmpEntity(encodeHtmlQuotes(en))];
    for (let i = 0; i < variants.length; i++) {
      const frV = variants[i];
      const enV = enVariants[i];
      out = out.split(">" + frV + "<").join(">" + enV + "<");
      out = out.split('"' + frV + '"').join('"' + enV + '"');
      out = out.split("'" + frV + "'").join("'" + enV + "'");
    }
    if (fr.length >= 40) {
      out = out.split(fr).join(en);
      out = out.split(htmlAmpEntity(fr)).join(htmlAmpEntity(en));
    }
  }
  return out;
}

function assetPrefixForEn(relPath) {
  const depth = relPath.split("/").length;
  return "../".repeat(depth);
}

function prefixAssetUrl(url, prefix) {
  if (
    !url ||
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("//") ||
    url.startsWith("data:") ||
    url.startsWith("mailto:") ||
    url.startsWith("tel:") ||
    url.startsWith("#") ||
    url.startsWith(prefix)
  ) {
    return url;
  }
  for (const root of ASSET_ROOTS) {
    if (url.startsWith(root)) return prefix + url;
    if (url.startsWith("../" + root)) {
      return prefix + url.replace(/^\.\.\//, "");
    }
    if (url.startsWith("../../" + root)) {
      return prefix + url.replace(/^(\.\.\/)+/, "");
    }
  }
  return url;
}

function rewriteAssetAttributes(html, prefix) {
  return html.replace(
    /\b(href|src|srcset|content|data-src)="([^"]*)"/g,
    function (_m, attr, value) {
      if (attr === "srcset") {
        const parts = value.split(",").map(function (part) {
          const trimmed = part.trim();
          const bits = trimmed.split(/\s+/);
          bits[0] = prefixAssetUrl(bits[0], prefix);
          return bits.join(" ");
        });
        return attr + '="' + parts.join(", ") + '"';
      }
      if (attr === "content" && /^https?:\/\//i.test(value)) {
        return attr + '="' + value + '"';
      }
      if (attr === "href" && value.startsWith("mailto:")) {
        return attr + '="' + value + '"';
      }
      return attr + '="' + prefixAssetUrl(value, prefix) + '"';
    }
  );
}

function resolveInternalHtmlPath(href, fromRelPath) {
  return resolveHrefToFile(href, fromRelPath);
}

function toEnCleanHref(resolvedPage) {
  return hrefForFile(resolvedPage, "en");
}

function rewriteInternalLinks(html, fromRelPath) {
  return html.replace(/\bhref="([^"]*)"/g, function (_m, href) {
    const info = resolveInternalHtmlPath(href, fromRelPath);
    if (!info) return 'href="' + href + '"';
    return 'href="' + toEnCleanHref(info.resolved) + info.suffix + '"';
  });
}

function fixLangSwitcher(html) {
  return html.replace(
    /<div class="lang-switch" data-lang-switch>[\s\S]*?<\/div>/,
    '<div class="lang-switch" data-lang-switch>' +
      '<button type="button" class="lang-link" data-lang="fr" aria-pressed="false">FR</button>' +
      '<span class="lang-sep">/</span>' +
      '<button type="button" class="lang-link w--current" data-lang="en" aria-pressed="true">EN</button>' +
      "</div>"
  );
}

function setHtmlLangEn(html) {
  return html.replace(/<html([^>]*?)\s+lang="fr"/i, '<html$1 lang="en"');
}

function applyPageMeta(html, relPath) {
  const meta = getPageMeta(relPath);
  if (!meta) return html;
  if (meta.title) {
    html = html.replace(/<title>[^<]*<\/title>/, "<title>" + meta.title + "</title>");
    html = html.replace(
      /<meta content="[^"]*" property="og:title"\/>/,
      '<meta content="' + meta.title + '" property="og:title"/>'
    );
    html = html.replace(
      /<meta content="[^"]*" (?:name|property)="twitter:title"\/>/g,
      '<meta content="' + meta.title + '" property="twitter:title"/>'
    );
  }
  if (meta.description) {
    html = html.replace(
      /<meta content="[^"]*" name="description"\/>/,
      '<meta content="' + meta.description + '" name="description"/>'
    );
    html = html.replace(
      /<meta content="[^"]*" property="og:description"\/>/,
      '<meta content="' + meta.description + '" property="og:description"/>'
    );
    html = html.replace(
      /<meta content="[^"]*" (?:name|property)="twitter:description"\/>/g,
      '<meta content="' + meta.description + '" property="twitter:description"/>'
    );
  }
  return html;
}

function stripHreflang(html) {
  return html.replace(/\s*<link rel="alternate" hreflang="[^"]*" href="[^"]*"\s*\/?>\n?/g, "");
}

function stripCanonical(html) {
  return html.replace(/\s*<link rel="canonical" href="[^"]*"\s*\/?>\n?/g, "");
}

function buildHreflangBlock(relPath) {
  const frUrl = hreflangUrl(SITE_ORIGIN, relPath, "fr");
  const enUrl = hreflangUrl(SITE_ORIGIN, relPath, "en");
  return (
    '<link rel="alternate" hreflang="fr" href="' +
    frUrl +
    '" />\n' +
    '<link rel="alternate" hreflang="en" href="' +
    enUrl +
    '" />\n' +
    '<link rel="alternate" hreflang="x-default" href="' +
    frUrl +
    '" />\n'
  );
}

function injectHreflang(html, relPath) {
  const block = buildHreflangBlock(relPath);
  return stripHreflang(html).replace("</head>", block + "</head>");
}

function injectCanonical(html, relPath, locale) {
  const url = hreflangUrl(SITE_ORIGIN, relPath, locale);
  const tag = '<link rel="canonical" href="' + url + '" />\n';
  let out = stripCanonical(html);
  return out.replace("</head>", tag + "</head>");
}

function polishFrenchHtml(html, relPath) {
  let out = html.replace(/data-wf-domain="[^"]*"/g, 'data-wf-domain="studiopilatesnarbonne.com"');
  if (!COMMERCE_PAGES.has(relPath)) {
    out = out.replace(/<script type="text\/javascript">window\.__WEBFLOW_CURRENCY_SETTINGS[\s\S]*?<\/script>/g, "");
  }
  out = absolutizeOgImages(out);
  out = injectOgUrl(out, relPath, "fr");
  if (!out.includes('property="og:image"')) {
    out = out.replace(
      "</head>",
      '<meta content="' + OG_IMAGE_DEFAULT + '" property="og:image"/>\n</head>'
    );
  }
  return out;
}

function patchFrenchSeo() {
  const pages = [];
  listHtmlPages(ROOT, ROOT, pages);
  let patched = 0;
  for (const relPath of pages) {
    const file = path.join(ROOT, relPath);
    let html = fs.readFileSync(file, "utf8");
    let next = injectHreflang(html, relPath);
    next = injectCanonical(next, relPath, "fr");
    next = polishFrenchHtml(next, relPath);
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      patched++;
    }
  }
  if (patched) {
    console.log("Refreshed SEO on " + patched + " French page(s)");
  }
}

function stripFrenchLegalBlocks(html) {
  const markerFr = '<div class="legal-lang-fr">';
  const markerEn = '<div class="legal-lang-en">';
  let out = html;
  let idx;
  while ((idx = out.indexOf(markerFr)) !== -1) {
    const enIdx = out.indexOf(markerEn, idx);
    if (enIdx === -1) break;
    out = out.slice(0, idx) + out.slice(enIdx);
  }
  return out;
}

function applyPostReplacements(html) {
  return html
    .replace(
      /Non\. All-levels classes are offered and Souhila adapts exercises to each participant\. Les débutants sont les bienvenus\. N'hésitez pas à nous indiquer que c'est votre première séance lors de la réservation\./g,
      "No. All-levels classes are offered and Souhila adapts exercises to each participant. Beginners are welcome. Please mention it's your first session when booking."
    )
    .replace(
      /Small-group Reformer class, precise full-body work true to the original method\. 32 € la séance\./g,
      "Small-group Reformer class, precise full-body work true to the original method. €32 per class."
    )
    .replace(
      /<p>Consultez le <a href="\/en\/planning\.html">weekly schedule<\/a> pour voir les créneaux Reformer du mardi au samedi\.<\/p>/g,
      '<p>See the <a href="/en/planning">weekly schedule</a> to see Reformer slots from Tuesday to Saturday.</p>'
    )
    .replace(
      /<p>See the <a href="[^"]*planning[^"]*">weekly schedule<\/a> pour voir les créneaux Reformer du mardi au samedi\.<\/p>/g,
      '<p>See the <a href="/en/planning">weekly schedule</a> to see Reformer slots from Tuesday to Saturday.</p>'
    )
    .replace(/ – échauffement/g, " – warm-up")
    .replace(/ – énergie/g, " – energy")
    .replace(/ – jambes/g, " – legs")
    .replace(/ – stabilité/g, " – stability")
    .replace(/ – souplesse/g, " – flexibility")
    .replace(/ – gainage/g, " – core work")
    .replace(/ – posture/g, " – posture")
    .replace(/ – mobilité/g, " – mobility")
    .replace(/ – détente/g, " – relaxation")
    .replace(/ – sérénité/g, " – serenity")
    .replace(/Pilates Reformer, Mat et cours privés au studio\./g, "Pilates Reformer, Mat and private sessions at the studio.")
    .replace(/Booking : sur bsport \(créneau « Homme »\)/g, "Booking: on bsport (Men slot)")
    .replace(/Booking : obligatoire sur bsport/g, "Booking: required on bsport")
    .replace(/Booking : sur bsport/g, "Booking: on bsport")
    .replace(/Level : tous niveaux/g, "Level: all levels")
    .replace(/Level : créneau réservé aux hommes/g, "Level: men-only slot")
    .replace(/Price : 32 € la séance/g, "Price: €32 per class")
    .replace(/Price : 12,50 € la séance/g, "Price: €12.50 per class")
    .replace(/Duration : 1 heure/g, "Duration: 1 hour")
    .replace(/<strong>Durée<\/strong> : 1 heure/g, "<strong>Duration</strong>: 1 hour")
    .replace(/<strong>Tarif<\/strong> : 12,50 € la séance/g, "<strong>Price</strong>: €12.50 per class")
    .replace(/<strong>Niveau<\/strong> : tous niveaux/g, "<strong>Level</strong>: all levels")
    .replace(/<strong>Réservation<\/strong> : sur /g, "<strong>Booking</strong>: on ")
    .replace(
      /<strong>Objectifs personnalisés<\/strong> : posture, rééducation, renforcement, souplesse…/g,
      "<strong>Personalised goals</strong>: posture, rehabilitation, strengthening, flexibility…"
    )
    .replace(
      /<strong>Flexibilité<\/strong> : créneau sur rendez-vous selon vos disponibilités\./g,
      "<strong>Flexibility</strong>: appointment slots according to your availability."
    )
    .replace(
      /<strong>Corrections personnalisées<\/strong> : le nombre de participants est limité pour un vrai suivi\./g,
      "<strong>Personalised corrections</strong>: limited class size for real guidance."
    )
    .replace(
      /<strong>Authentic method<\/strong> : exercices fidèles à l'enseignement de Joseph Pilates\./g,
      "<strong>Authentic method</strong>: exercises true to Joseph Pilates' teaching."
    )
    .replace(
      /<strong>Safe progression<\/strong> : séances intermédiaires, tous niveaux ou hommes selon le créneau\./g,
      "<strong>Safe progression</strong>: intermediate, all-levels or men's sessions depending on the slot."
    )
    .replace(
      /<strong>Centre et stabilité<\/strong> : muscles profonds, gainage et alignement\./g,
      "<strong>Core and stability</strong>: deep muscles, engagement and alignment."
    )
    .replace(
      /<strong>Breath<\/strong> : coordination souffle et mouvement, pilier de la méthode\./g,
      "<strong>Breath</strong>: coordinating breath and movement, a pillar of the method."
    )
    .replace(
      /<strong>Force et souplesse<\/strong> : exercices complets adaptés à tous les niveaux\./g,
      "<strong>Strength and flexibility</strong>: complete exercises adapted to all levels."
    )
    .replace(
      /<strong>Progression douce<\/strong> : corrections personnalisées dans un cadre calme\./g,
      "<strong>Gentle progress</strong>: personalised corrections in a calm setting."
    )
    .replace(
      /<strong>Price<\/strong> : 32 € la séance · cartes 5 et 10 cours disponibles/g,
      "<strong>Price</strong>: €32 per class · 5- and 10-class packs available"
    )
    .replace(
      /<strong>Price<\/strong> : 12,50 € la séance · carte 5 cours Mat à 55 €/g,
      "<strong>Price</strong>: €12.50 per class · 5-class Mat pack at €55"
    )
    .replace(/<strong>Price<\/strong> : 12,50 € la séance/g, "<strong>Price</strong>: €12.50 per class")
    .replace(/<strong>Price<\/strong> : selon formule affichée sur bsport/g, "<strong>Price</strong>: as shown on bsport")
    .replace(/onglet « Sur rendez-vous » ou calendrier sur /g, "By appointment tab or calendar on ")
    .replace(/, ou par téléphone au 06 50 08 02 22/g, ", or by phone on 06 50 08 02 22")
    .replace(/<strong>Booking<\/strong> : sur /g, "<strong>Booking</strong>: on ")
    .replace(/\(créneau « Homme »\)/g, "(Men's slot)")
    .replace(/<strong>Méditation<\/strong>/g, "<strong>Meditation</strong>")
    .replace(/<strong>Level<\/strong> : tous niveaux/g, "<strong>Level</strong>: all levels")
    .replace(/<strong>Duration<\/strong> : 1 heure/g, "<strong>Duration</strong>: 1 hour")
    .replace(/<strong>Équilibres<\/strong>/g, "<strong>Balances</strong>")
    .replace(/<strong>Étirements<\/strong>/g, "<strong>Stretches</strong>")
    .replace(/Reformer, Mat et cours privés au studio\./g, "Reformer, Mat and private sessions at the studio.");
}

function transformPage(html, relPath, textMap) {
  const prefix = assetPrefixForEn(relPath);

  let out = html;
  out = setHtmlLangEn(out);
  out = applyDataI18n(out);
  out = applyTextMap(out, textMap);
  out = applyPostReplacements(out);
  if (relPath.startsWith("classes/")) {
    out = stripClassPlayButton(out);
    out = injectClassBookingCta(out);
  }
  if (relPath === "legal.html") {
    out = stripFrenchLegalBlocks(out);
  }
  out = applyPageMeta(out, relPath);
  out = translateMetaTags(out, textMap);
  out = rewriteInternalLinks(out, relPath);
  out = rewriteAssetAttributes(out, prefix);
  out = absolutizeOgImages(out);
  out = polishEnHtml(out, relPath);
  out = fixLangSwitcher(out);
  out = injectHreflang(out, relPath);
  out = injectCanonical(out, relPath, "en");
  out = injectOgUrl(out, relPath, "en");

  if (!out.includes('data-site-locale="en"')) {
    out = out.replace("<html", '<html data-site-locale="en"');
  }

  return out;
}

function cleanEnDir() {
  if (fs.existsSync(EN_DIR)) {
    fs.rmSync(EN_DIR, { recursive: true, force: true });
  }
  fs.mkdirSync(EN_DIR, { recursive: true });
}

function syncIndexFiles() {
  const homepagePath = path.join(ROOT, "homepage.html");
  const indexPath = path.join(ROOT, "index.html");
  if (fs.existsSync(homepagePath)) {
    fs.copyFileSync(homepagePath, indexPath);
  }

  const enHome = path.join(EN_DIR, "homepage.html");
  const enIndex = path.join(EN_DIR, "index.html");
  if (fs.existsSync(enHome)) {
    fs.copyFileSync(enHome, enIndex);
  }
}

function main() {
  const textMap = loadTextMap();
  const pages = [];
  listHtmlPages(ROOT, ROOT, pages);

  cleanEnDir();

  let count = 0;
  for (const relPath of pages.sort()) {
    const src = path.join(ROOT, relPath);
    const dest = path.join(EN_DIR, relPath);
    fs.mkdirSync(path.dirname(dest), { recursive: true });

    const html = fs.readFileSync(src, "utf8");
    const enHtml = transformPage(html, relPath, textMap);
    fs.writeFileSync(dest, enHtml, "utf8");
    count++;
  }

  console.log("Generated " + count + " English page(s) under /en/");
  patchFrenchSeo();
  syncIndexFiles();
  require("./generate-sitemap").main();
  require("./patch-dead-pages");
  require("./patch-vercel-dead-routes");
  require("./ensure-mobile-nav");
  require("./strip-class-play-button").main();
  require("./inject-class-booking-cta").main();
  runFrResidueReport();
}

function runFrResidueReport() {
  const scanPath = path.join(ROOT, "..", "..", ".audit-tmp", "fr-residue-scan.js");
  if (!fs.existsSync(scanPath)) return;
  try {
    const { execSync } = require("child_process");
    const out = execSync("node \"" + scanPath + "\"", {
      cwd: path.join(ROOT, "..", ".."),
      encoding: "utf8",
    });
    const match = out.match(/Pages with FR residue: (\d+)/);
    if (match) {
      console.log("FR residue scan: " + match[1] + " EN page(s) with markers");
    }
  } catch (_e) {
    /* optional QA */
  }
}

main();
