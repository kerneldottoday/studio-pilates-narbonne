/**
 * Génère les pages anglaises statiques sous /en/ à partir des HTML français.
 * Usage: node _vendor/tools/build-en-pages.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const EN_DIR = path.join(ROOT, "en");
const SITE_ORIGIN = "https://studio-pilates-narbonne.vercel.app";

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
};

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
};

function loadTextMap() {
  const raw = fs.readFileSync(path.join(ROOT, "_vendor", "i18n", "text-map.js"), "utf8");
  const jsonish = raw.replace(/^window\.STUDIO_TEXT_MAP\s*=\s*/, "").replace(/;\s*$/, "");
  const map = Function("return (" + jsonish + ")")();
  return Object.assign({}, map, EXTRA_MAP);
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

function applyTextMap(html, map) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length);
  let out = html;
  for (const fr of keys) {
    const en = map[fr];
    if (!fr || fr === en) continue;
    out = out.split(">" + fr + "<").join(">" + en + "<");
    out = out.split(">" + encodeHtmlQuotes(fr) + "<").join(">" + encodeHtmlQuotes(en) + "<");
    out = out.split('"' + fr + '"').join('"' + en + '"');
    out = out.split("'" + fr + "'").join("'" + en + "'");
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
  if (!href || href.charAt(0) === "#") return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return null;

  const hashIdx = href.indexOf("#");
  const queryIdx = href.indexOf("?");
  let end = href.length;
  if (hashIdx >= 0) end = Math.min(end, hashIdx);
  if (queryIdx >= 0) end = Math.min(end, queryIdx);
  const pathPart = href.slice(0, end);
  const suffix = href.slice(end);

  if (!pathPart || !/\.html$/i.test(pathPart)) return null;

  const fromDir = path.dirname(fromRelPath);
  let resolved = path.normalize(path.join(fromDir, pathPart)).replace(/\\/g, "/");
  if (resolved === "index.html") resolved = "homepage.html";
  return { resolved, suffix };
}

function toEnRelativeHref(resolvedPage, outputRelPath) {
  const fromDir = path.posix.dirname(outputRelPath);
  const target = path.posix.join("en", resolvedPage);
  let rel = path.posix.relative(fromDir, target);
  if (!rel.startsWith(".")) {
    rel = "./" + rel;
  }
  return rel;
}

function rewriteInternalLinks(html, fromRelPath, outputRelPath) {
  return html.replace(/\bhref="([^"]*)"/g, function (_m, href) {
    const info = resolveInternalHtmlPath(href, fromRelPath);
    if (!info) return 'href="' + href + '"';
    return 'href="' + toEnRelativeHref(info.resolved, outputRelPath) + info.suffix + '"';
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
  const meta = PAGE_META[relPath];
  if (!meta) return html;
  if (meta.title) {
    html = html.replace(/<title>[^<]*<\/title>/, "<title>" + meta.title + "</title>");
    html = html.replace(
      /<meta content="[^"]*" property="og:title"\/>/,
      '<meta content="' + meta.title + '" property="og:title"/>'
    );
    html = html.replace(
      /<meta content="[^"]*" name="twitter:title"\/>/,
      '<meta content="' + meta.title + '" name="twitter:title"/>'
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
      /<meta content="[^"]*" name="twitter:description"\/>/,
      '<meta content="' + meta.description + '" name="twitter:description"/>'
    );
  }
  return html;
}

function injectHreflang(html, relPath, locale) {
  const frUrl = SITE_ORIGIN + "/" + relPath;
  const enUrl = SITE_ORIGIN + "/en/" + relPath;
  const block =
    '<link rel="alternate" hreflang="fr" href="' +
    frUrl +
    '" />\n' +
    '<link rel="alternate" hreflang="en" href="' +
    enUrl +
    '" />\n' +
    '<link rel="alternate" hreflang="x-default" href="' +
    frUrl +
    '" />\n';
  if (html.includes('hreflang="fr"')) return html;
  return html.replace("</head>", block + "</head>");
}

function patchFrenchHreflang() {
  const pages = [];
  listHtmlPages(ROOT, ROOT, pages);
  let patched = 0;
  for (const relPath of pages) {
    const file = path.join(ROOT, relPath);
    const html = fs.readFileSync(file, "utf8");
    if (html.includes('hreflang="fr"')) continue;
    const next = injectHreflang(html, relPath, "fr");
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      patched++;
    }
  }
  if (patched) {
    console.log("Added hreflang to " + patched + " French page(s)");
  }
}

function applyPostReplacements(html) {
  return html
    .replace(
      /<p>Consultez le <a href="\/en\/planning\.html">weekly schedule<\/a> pour voir les créneaux Reformer du mardi au samedi\.<\/p>/g,
      '<p>See the <a href="/en/planning.html">weekly schedule</a> to see Reformer slots from Tuesday to Saturday.</p>'
    )
    .replace(
      /<p>See the <a href="[^"]*planning\.html">weekly schedule<\/a> pour voir les créneaux Reformer du mardi au samedi\.<\/p>/g,
      '<p>See the <a href="../planning.html">weekly schedule</a> to see Reformer slots from Tuesday to Saturday.</p>'
    );
}

function transformPage(html, relPath, textMap) {
  const prefix = assetPrefixForEn(relPath);

  let out = html;
  out = setHtmlLangEn(out);
  out = applyDataI18n(out);
  out = applyTextMap(out, textMap);
  out = applyPostReplacements(out);
  out = applyPageMeta(out, relPath);
  out = rewriteInternalLinks(out, relPath, path.posix.join("en", relPath));
  out = rewriteAssetAttributes(out, prefix);
  out = fixLangSwitcher(out);
  out = injectHreflang(out, relPath, "en");

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
  patchFrenchHreflang();
}

main();
