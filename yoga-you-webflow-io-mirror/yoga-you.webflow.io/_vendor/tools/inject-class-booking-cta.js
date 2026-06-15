/**
 * Ajoute le bouton « Réserver sur bsport » sur les fiches cours.
 * Usage: node _vendor/tools/inject-class-booking-cta.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const data = JSON.parse(
  fs.readFileSync(path.join(ROOT, "_vendor/content/classes-data.json"), "utf8")
);

const BOOKING_CTA =
  '<div class="class-booking-cta"><a href="' +
  data.bsportCalendar +
  '" target="_blank" rel="noopener noreferrer" class="cta w-button" data-bsport-book>Réserver sur bsport</a></div>';

function injectClassBookingCta(html) {
  if (!html.includes("hero-class-template") || html.includes("class-booking-cta")) {
    return html;
  }

  const withCta = html.replace(
    /(<div class="limit-subtitle-class"><div class="subtitle">[\s\S]*?<\/div><\/div>)(<\/div><div[^>]*class="lightbox-class)/,
    "$1" + BOOKING_CTA + "$2"
  );

  return withCta === html ? html : withCta;
}

function patchClassFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".html")) continue;
    const file = path.join(dir, name);
    const html = fs.readFileSync(file, "utf8");
    const next = injectClassBookingCta(html);
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      count++;
    }
  }
  return count;
}

function main() {
  const fr = patchClassFiles(path.join(ROOT, "classes"));
  const en = patchClassFiles(path.join(ROOT, "en", "classes"));
  console.log("Added booking CTA on " + fr + " FR + " + en + " EN class page(s)");
}

module.exports = { injectClassBookingCta, main };

if (require.main === module) {
  main();
}
