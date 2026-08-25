const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const contactHtml = fs.readFileSync(path.join(root, "contact.html"), "utf8");

const NAVBAR_START = '<div data-animation="default" class="navbar w-nav"';

const contactBodyStart = contactHtml.indexOf("<body>") + "<body>".length;
const contactFirstSection = contactHtml.indexOf(
  "<section",
  contactHtml.indexOf("navbar")
);
const contactFooterStart = contactHtml.indexOf('<section class="footer">');
const contactFooterEnd =
  contactHtml.indexOf("</section>", contactFooterStart) + "</section>".length;

function ensurePricingInPrimaryNav(navbar) {
  if (!/class="nav-link w-nav-link"[^>]*data-i18n="nav.pricing"/.test(navbar) &&
      !/data-i18n="nav.pricing"[^>]*class="nav-link/.test(navbar) &&
      !/<a href="\/pricing" class="nav-link/.test(navbar)) {
    navbar = navbar.replace(
      /(<a href="\/planning"[^>]*>[^<]*<\/a>)/,
      '$1<a href="/pricing" class="nav-link w-nav-link" data-i18n="nav.pricing">Tarifs</a>'
    );
  }
  navbar = navbar.replace(
    /<a href="(?:\/en)?\/pricing" class="dropdown-link w-dropdown-link"[^>]*>[^<]*<\/a>/,
    ""
  );
  return navbar;
}

function getBaseNavbar() {
  return contactHtml.slice(contactBodyStart, contactFirstSection);
}

function pathPrefix(filePath) {
  const rel = path.relative(root, filePath);
  const depth = rel.split(path.sep).length - 1;
  return depth ? "../".repeat(depth) : "";
}

function prefixRootPaths(html, prefix) {
  if (!prefix) {
    return html;
  }
  return html
    .replace(/href="(?!https?:|\/\/|#|\.\.\/)([^"]+)"/g, 'href="' + prefix + '$1"')
    .replace(/src="(?!https?:|\/\/|\.\.\/)(65939)/g, 'src="' + prefix + "65939");
}

function buildNavbar(options) {
  const prefix = options.prefix || "";
  const classSlug = options.classSlug;
  let navbar = getBaseNavbar();
  navbar = ensurePricingInPrimaryNav(navbar);
  navbar = navbar.replace(/ aria-current="page"/g, "");
  navbar = navbar.replace(/nav-link w-nav-link w--current/g, "nav-link w-nav-link");
  navbar = navbar.replace(
    /dropdown-link w-dropdown-link w--current/g,
    "dropdown-link w-dropdown-link"
  );

  if (options.active === "classes") {
    navbar = navbar.replace(
      'href="/classes" class="nav-link w-nav-link" data-i18n="nav.classes"',
      'href="/classes" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.classes"'
    );
  } else if (options.active === "contact") {
    navbar = navbar.replace(
      'href="/contact" class="nav-link w-nav-link"',
      'href="/contact" aria-current="page" class="nav-link w-nav-link w--current"'
    );
  } else if (options.active === "pricing") {
    navbar = navbar.replace(
      'href="/pricing" class="nav-link w-nav-link" data-i18n="nav.pricing"',
      'href="/pricing" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.pricing"'
    );
  } else if (options.active === "planning") {
    navbar = navbar.replace(
      'href="/planning" class="nav-link w-nav-link" data-i18n="nav.planning"',
      'href="/planning" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.planning"'
    );
    navbar = navbar.replace(
      'href="/planning" class="nav-link w-nav-link"',
      'href="/planning" aria-current="page" class="nav-link w-nav-link w--current"'
    );
  } else if (options.active === "home") {
    navbar = navbar.replace(
      'href="/" class="nav-link w-nav-link" data-i18n="nav.home"',
      'href="/" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.home"'
    );
  } else if (options.active === "voyage") {
    navbar = navbar.replace(
      'href="/voyage" class="dropdown-link w-dropdown-link" data-i18n="nav.voyage"',
      'href="/voyage" aria-current="page" class="dropdown-link w-dropdown-link w--current" data-i18n="nav.voyage"'
    );
  }

  if (classSlug) {
    navbar = navbar.replace(
      /href="[^"]*classes\/[^"]+"/g,
      'href="' + classSlug + '"'
    );
  }

  navbar = prefixRootPaths(navbar, prefix);
  return navbar;
}

function buildFooter(options) {
  const prefix = options.prefix || "";
  let footer = contactHtml.slice(contactFooterStart, contactFooterEnd);
  footer = prefixRootPaths(footer, prefix);

  footer = footer.replace(/ aria-current="page"/g, "");
  footer = footer.replace(/ class="footer-link w--current"/g, ' class="footer-link"');

  const activeMap = {
    home: "/",
    classes: "/classes",
    contact: "/contact",
    planning: "/planning",
    pricing: "/pricing",
    voyage: "/voyage",
    shop: "/boutique",
    legal: "/legal",
  };

  const activeHref = activeMap[options.active];
  if (activeHref) {
    footer = footer.replace(
      'href="' + activeHref + '" class="footer-link"',
      'href="' + activeHref + '" aria-current="page" class="footer-link w--current"'
    );
    footer = footer.replace(
      'href="' + activeHref + '" class="footer-link" data-i18n="',
      'href="' + activeHref + '" aria-current="page" class="footer-link w--current" data-i18n="'
    );
  }

  return footer;
}

function replaceNavbar(html, navbar) {
  const start = html.indexOf(NAVBAR_START);
  if (start === -1) {
    return html;
  }
  const sectionStart = html.indexOf("<section", start);
  if (sectionStart === -1) {
    return html;
  }
  return html.slice(0, start) + navbar + html.slice(sectionStart);
}

function replaceFooter(html, footer) {
  const start = html.indexOf('<section class="footer">');
  if (start === -1) {
    return html;
  }
  const end = html.indexOf("</section>", start) + "</section>".length;
  return html.slice(0, start) + footer + html.slice(end);
}

function detectActive(relPath) {
  const base = path.basename(relPath);
  if (base === "homepage.html" || base === "index.html") return "home";
  if (base === "classes.html") return "classes";
  if (base === "contact.html") return "contact";
  if (base === "planning.html") return "planning";
  if (base === "pricing.html") return "pricing";
  if (base === "voyage.html") return "voyage";
  if (base === "boutique.html" || relPath.replace(/\\/g, "/").startsWith("boutique/")) {
    return "shop";
  }
  if (base === "legal.html") return "legal";
  if (relPath.startsWith("classes" + path.sep)) return "classes";
  return null;
}

module.exports = {
  root,
  NAVBAR_START,
  getBaseNavbar,
  pathPrefix,
  buildNavbar,
  buildFooter,
  replaceNavbar,
  replaceFooter,
  detectActive,
};
