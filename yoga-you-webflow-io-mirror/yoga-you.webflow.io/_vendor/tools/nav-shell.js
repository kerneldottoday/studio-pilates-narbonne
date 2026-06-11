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
  navbar = prefixRootPaths(navbar, prefix);

  navbar = navbar.replace(
    /href="[^"]*contact\.html" aria-current="page" class="nav-link w-nav-link w--current"/g,
    'href="' + prefix + 'contact.html" class="nav-link w-nav-link"'
  );
  navbar = navbar.replace(
    /href="[^"]*classes\.html" aria-current="page" class="nav-link w-nav-link w--current"/g,
    'href="' + prefix + 'classes.html" class="nav-link w-nav-link" data-i18n="nav.classes"'
  );
  navbar = navbar.replace(
    /href="[^"]*homepage\.html" aria-current="page" class="nav-link w-nav-link w--current"/g,
    'href="' + prefix + 'homepage.html" class="nav-link w-nav-link" data-i18n="nav.home"'
  );
  navbar = navbar.replace(
    /href="[^"]*planning\.html" aria-current="page" class="nav-link w-nav-link w--current"/g,
    'href="' + prefix + 'planning.html" class="nav-link w-nav-link"'
  );

  if (options.active === "classes") {
    navbar = navbar.replace(
      'href="' + prefix + 'classes.html" class="nav-link w-nav-link" data-i18n="nav.classes"',
      'href="' + prefix + 'classes.html" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.classes"'
    );
  } else if (options.active === "contact") {
    navbar = navbar.replace(
      'href="' + prefix + 'contact.html" class="nav-link w-nav-link"',
      'href="' + prefix + 'contact.html" aria-current="page" class="nav-link w-nav-link w--current"'
    );
  } else if (options.active === "planning") {
    navbar = navbar.replace(
      'href="' + prefix + 'planning.html" class="nav-link w-nav-link"',
      'href="' + prefix + 'planning.html" aria-current="page" class="nav-link w-nav-link w--current"'
    );
  } else if (options.active === "home") {
    navbar = navbar.replace(
      'href="' + prefix + 'homepage.html" class="nav-link w-nav-link" data-i18n="nav.home"',
      'href="' + prefix + 'homepage.html" aria-current="page" class="nav-link w-nav-link w--current" data-i18n="nav.home"'
    );
  }

  if (classSlug) {
    navbar = navbar.replace(
      /href="[^"]*classes\/[^"]+"/g,
      'href="' + classSlug + '"'
    );
  }

  return navbar;
}

function buildFooter(options) {
  const prefix = options.prefix || "";
  let footer = contactHtml.slice(contactFooterStart, contactFooterEnd);
  footer = prefixRootPaths(footer, prefix);

  footer = footer.replace(/ aria-current="page"/g, "");
  footer = footer.replace(/ class="footer-link w--current"/g, ' class="footer-link"');

  const activeMap = {
    home: prefix + "homepage.html",
    about: prefix + "about.html",
    classes: prefix + "classes.html",
    contact: prefix + "contact.html",
    planning: prefix + "planning.html",
    pricing: prefix + "pricing.html",
    legal: prefix + "legal.html",
    expertises: prefix + "expertises.html",
    blog: prefix + "blog.html",
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
  if (base === "about.html") return "about";
  if (base === "classes.html") return "classes";
  if (base === "contact.html") return "contact";
  if (base === "planning.html") return "planning";
  if (base === "pricing.html") return "pricing";
  if (base === "legal.html") return "legal";
  if (base === "expertises.html") return "expertises";
  if (base === "blog.html") return "blog";
  if (relPath.startsWith("classes" + path.sep)) return "classes";
  if (relPath.startsWith("blog" + path.sep)) return "blog";
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
