/**
 * Helpers URLs sans extension (.html) pour le site statique.
 */
const fs = require("fs");
const path = require("path");

const SKIP_DIRS = new Set(["65939d1f139e1daa37da455f", "en", "_vendor"]);

/** Pages légales KERNEL — une seule URL FR pour les deux langues. */
const FR_ONLY_PAGES = new Set(["mentions-legales"]);

const CLASS_SLUG_REDIRECTS = [
  { source: "/classes/intense-1-hour-pilates", destination: "/classes/reformer-homme" },
  { source: "/classes/intense-1-hour-pilates.html", destination: "/classes/reformer-homme" },
  { source: "/en/classes/intense-1-hour-pilates", destination: "/en/classes/reformer-homme" },
  { source: "/en/classes/intense-1-hour-pilates.html", destination: "/en/classes/reformer-homme" },
  { source: "/classes/30-minutes-morning-yoga", destination: "/classes/pilates-mat" },
  { source: "/classes/30-minutes-morning-yoga.html", destination: "/classes/pilates-mat" },
  { source: "/en/classes/30-minutes-morning-yoga", destination: "/en/classes/pilates-mat" },
  { source: "/en/classes/30-minutes-morning-yoga.html", destination: "/en/classes/pilates-mat" },
  { source: "/classes/30-minutes-chair-yoga", destination: "/classes/cours-prive" },
  { source: "/classes/30-minutes-chair-yoga.html", destination: "/classes/cours-prive" },
  { source: "/en/classes/30-minutes-chair-yoga", destination: "/en/classes/cours-prive" },
  { source: "/en/classes/30-minutes-chair-yoga.html", destination: "/en/classes/cours-prive" },
  { source: "/classes/disconnect-breathwork", destination: "/classes/reset" },
  { source: "/classes/disconnect-breathwork.html", destination: "/classes/reset" },
  { source: "/en/classes/disconnect-breathwork", destination: "/en/classes/reset" },
  { source: "/en/classes/disconnect-breathwork.html", destination: "/en/classes/reset" },
  { source: "/classes/yoga-for-focus", destination: "/classes/yoga-ashtanga" },
  { source: "/classes/yoga-for-focus.html", destination: "/classes/yoga-ashtanga" },
  { source: "/en/classes/yoga-for-focus", destination: "/en/classes/yoga-ashtanga" },
  { source: "/en/classes/yoga-for-focus.html", destination: "/en/classes/yoga-ashtanga" },
  { source: "/classes/1-hour-pilates", destination: "/classes/pilates-reformer" },
  { source: "/classes/1-hour-pilates.html", destination: "/classes/pilates-reformer" },
  { source: "/en/classes/1-hour-pilates", destination: "/en/classes/pilates-reformer" },
  { source: "/en/classes/1-hour-pilates.html", destination: "/en/classes/pilates-reformer" },
];

const LEGACY_REDIRECTS = [
  { source: "/Accueil", destination: "/" },
  { source: "/Cours", destination: "/classes" },
  { source: "/Planning", destination: "/planning" },
  { source: "/Contact", destination: "/contact" },
  { source: "/Tarifs", destination: "/pricing" },
  { source: "/Mentions-legales", destination: "/legal" },
  { source: "/en/Mentions-legales", destination: "/en/legal" },
  { source: "/en/Home", destination: "/en" },
  { source: "/en/Classes", destination: "/en/classes" },
  { source: "/en/Schedule", destination: "/en/planning" },
  { source: "/en/Contact", destination: "/en/contact" },
  { source: "/en/Pricing", destination: "/en/pricing" },
  { source: "/en/Legal-notice", destination: "/en/legal" },
  { source: "/en/mentions-legales", destination: "/en/legal" },
  { source: "/en/mentions-legales.html", destination: "/en/legal" },
];

/** Redirects SEO P0 — pages filtres / template / slugs trompeurs. */
const SEO_REDIRECTS = [
  { source: "/expertises", destination: "/voyage" },
  { source: "/expertises.html", destination: "/voyage" },
  { source: "/en/expertises", destination: "/en/voyage" },
  { source: "/en/expertises.html", destination: "/en/voyage" },
  { source: "/mentions-legales", destination: "/legal" },
  { source: "/mentions-legales.html", destination: "/legal" },
  { source: "/blog", destination: "/" },
  { source: "/blog.html", destination: "/" },
  { source: "/en/blog", destination: "/en" },
  { source: "/en/blog.html", destination: "/en" },
  { source: "/duration/1-hour", destination: "/classes" },
  { source: "/duration/1-hour.html", destination: "/classes" },
  { source: "/duration/30-minutes", destination: "/classes" },
  { source: "/duration/30-minutes.html", destination: "/classes" },
  { source: "/duration/10-minutes", destination: "/classes/cours-prive" },
  { source: "/duration/10-minutes.html", destination: "/classes/cours-prive" },
  { source: "/en/duration/1-hour", destination: "/en/classes" },
  { source: "/en/duration/1-hour.html", destination: "/en/classes" },
  { source: "/en/duration/30-minutes", destination: "/en/classes" },
  { source: "/en/duration/30-minutes.html", destination: "/en/classes" },
  { source: "/en/duration/10-minutes", destination: "/en/classes/cours-prive" },
  { source: "/en/duration/10-minutes.html", destination: "/en/classes/cours-prive" },
  { source: "/type/breathwork", destination: "/classes/reset" },
  { source: "/type/breathwork.html", destination: "/classes/reset" },
  { source: "/type/pilates", destination: "/classes" },
  { source: "/type/pilates.html", destination: "/classes" },
  { source: "/type/yoga", destination: "/classes/yoga-ashtanga" },
  { source: "/type/yoga.html", destination: "/classes/yoga-ashtanga" },
  { source: "/en/type/breathwork", destination: "/en/classes/reset" },
  { source: "/en/type/breathwork.html", destination: "/en/classes/reset" },
  { source: "/en/type/pilates", destination: "/en/classes" },
  { source: "/en/type/pilates.html", destination: "/en/classes" },
  { source: "/en/type/yoga", destination: "/en/classes/yoga-ashtanga" },
  { source: "/en/type/yoga.html", destination: "/en/classes/yoga-ashtanga" },
];

/** Redirect apex → www (pattern Vercel recommandé avec capture). */
const HOST_WWW_REDIRECT = {
  source: "/(.*)",
  has: [{ type: "host", value: "studiopilatesnarbonne.com" }],
  destination: "https://www.studiopilatesnarbonne.com/$1",
  permanent: true,
};

function listPublicHtmlPages(dir, base, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (SKIP_DIRS.has(name)) continue;
      listPublicHtmlPages(full, base, out);
      continue;
    }
    if (!name.endsWith(".html")) continue;
    out.push(path.relative(base, full).replace(/\\/g, "/"));
  }
}

function fileToCleanUrl(relPath, locale) {
  const normalized = relPath.replace(/\\/g, "/");
  const base = normalized.replace(/\.html$/i, "");
  if (FR_ONLY_PAGES.has(base)) {
    return "/" + base;
  }
  if (base === "homepage" || base === "index") {
    return locale === "en" ? "/en" : "/";
  }
  return (locale === "en" ? "/en/" : "/") + base;
}

function cleanUrlToFilePath(cleanPath) {
  let p = cleanPath.replace(/\/+$/, "") || "/";
  if (p === "/") return "homepage.html";
  if (p === "/en") return "en/homepage.html";
  if (p.startsWith("/en/")) {
    return "en/" + p.slice(4) + ".html";
  }
  if (p.startsWith("/")) {
    return p.slice(1) + ".html";
  }
  return p + ".html";
}

function resolveHrefToFile(href, fromRelPath) {
  if (!href || href.charAt(0) === "#") return null;
  if (/^(https?:|mailto:|tel:)/i.test(href)) return null;

  const hashIdx = href.indexOf("#");
  const queryIdx = href.indexOf("?");
  let end = href.length;
  if (hashIdx >= 0) end = Math.min(end, hashIdx);
  if (queryIdx >= 0) end = Math.min(end, queryIdx);
  const pathPart = href.slice(0, end);
  const suffix = href.slice(end);
  if (!pathPart) return null;

  let resolved;
  if (pathPart.charAt(0) === "/") {
    resolved = cleanUrlToFilePath(pathPart);
  } else if (/\.html$/i.test(pathPart)) {
    const fromDir = path.posix.dirname(fromRelPath.replace(/\\/g, "/"));
    resolved = path.posix.normalize(path.posix.join(fromDir, pathPart));
    if (resolved === "index.html") resolved = "homepage.html";
  } else {
    return null;
  }

  return { resolved, suffix };
}

function hrefForFile(resolved, locale) {
  return fileToCleanUrl(resolved, locale) ;
}

function buildVercelRoutes(pages) {
  const rewrites = [
    { source: "/", destination: "/homepage.html" },
    { source: "/en", destination: "/en/homepage.html" },
  ];
  const redirects = [
    { ...HOST_WWW_REDIRECT },
    { source: "/homepage.html", destination: "/", permanent: true },
    { source: "/index.html", destination: "/", permanent: true },
    { source: "/en/homepage.html", destination: "/en", permanent: true },
    { source: "/en/index.html", destination: "/en", permanent: true },
  ];

  for (const rule of SEO_REDIRECTS.concat(CLASS_SLUG_REDIRECTS).concat(LEGACY_REDIRECTS)) {
    redirects.push({ source: rule.source, destination: rule.destination, permanent: true });
  }

  for (const rel of pages) {
    const frClean = fileToCleanUrl(rel, "fr");
    const dest = "/" + rel;
    if (frClean !== "/" && !rewrites.find((r) => r.source === frClean)) {
      rewrites.push({ source: frClean, destination: dest });
    }
    if (rel !== "homepage.html" && rel !== "index.html") {
      redirects.push({ source: dest, destination: frClean, permanent: true });
    }
  }

  const enPages = pages.filter(
    (p) => p !== "index.html" && !FR_ONLY_PAGES.has(p.replace(/\.html$/i, ""))
  );
  for (const rel of enPages) {
    const enClean = fileToCleanUrl(rel, "en");
    const dest = "/en/" + rel;
    if (enClean !== "/en" && !rewrites.find((r) => r.source === enClean)) {
      rewrites.push({ source: enClean, destination: dest });
    }
    if (rel !== "homepage.html") {
      redirects.push({ source: dest, destination: enClean, permanent: true });
    }
  }

  const shopRewrites = [
    { source: "/boutique/:slug", destination: "/boutique/produit.html" },
    { source: "/en/boutique/:slug", destination: "/en/boutique/produit.html" },
  ];
  for (const rule of shopRewrites) {
    if (!rewrites.find((r) => r.source === rule.source)) {
      rewrites.push(rule);
    }
  }

  return { rewrites, redirects };
}

function hreflangUrl(origin, relPath, locale) {
  return origin + fileToCleanUrl(relPath, locale);
}

module.exports = {
  SKIP_DIRS,
  FR_ONLY_PAGES,
  LEGACY_REDIRECTS,
  SEO_REDIRECTS,
  HOST_WWW_REDIRECT,
  listPublicHtmlPages,
  fileToCleanUrl,
  cleanUrlToFilePath,
  resolveHrefToFile,
  hrefForFile,
  buildVercelRoutes,
  hreflangUrl,
};
