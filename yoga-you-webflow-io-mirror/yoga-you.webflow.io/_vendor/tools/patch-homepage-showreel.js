/**
 * Accueil V2 : lightbox YouTube template → ancre vidéo studio ;
 * lien avis Google à côté des témoignages déjà présents.
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

const SHOWREEL_RE =
  /<a href="[^"]*" data-w-id="[^"]*" class="lightbox-showreel w-inline-block w-lightbox">[\s\S]*?<\/script><\/a>/;

const SHOWREEL_FR =
  '<a href="#studio-film" class="lightbox-showreel w-inline-block"><img src="65939d1f139e1daa37da455f/6593c7a40452f1b9e268d4b3_Play.svg" loading="lazy" alt="" class="play-showreel"/><div>Découvrir le studio</div></a>';

const SHOWREEL_EN =
  '<a href="#studio-film" class="lightbox-showreel w-inline-block"><img src="../65939d1f139e1daa37da455f/6593c7a40452f1b9e268d4b3_Play.svg" loading="lazy" alt="" class="play-showreel"/><div>Discover the studio</div></a>';

const REVIEWS_LINK_FR =
  '<p class="reviews-google"><a class="reviews-google-link" href="https://www.google.com/maps/search/?api=1&amp;query=8+Rue+du+Luxembourg,+11100+Narbonne" target="_blank" rel="noopener noreferrer">Voir les avis sur Google</a></p>';

const REVIEWS_LINK_EN =
  '<p class="reviews-google"><a class="reviews-google-link" href="https://www.google.com/maps/search/?api=1&amp;query=8+Rue+du+Luxembourg,+11100+Narbonne" target="_blank" rel="noopener noreferrer">See Google reviews</a></p>';

function patchFile(rel, isEn) {
  const file = path.join(ROOT, rel);
  if (!fs.existsSync(file)) return false;
  let html = fs.readFileSync(file, "utf8");
  const original = html;

  html = html.replace(
    '<section class="section video-section">',
    '<section class="section video-section" id="studio-film">'
  );

  if (SHOWREEL_RE.test(html)) {
    html = html.replace(SHOWREEL_RE, isEn ? SHOWREEL_EN : SHOWREEL_FR);
  }

  if (!html.includes("reviews-google-link")) {
    const markerFr =
      '<div class="paragraph-big">Note 5/5 sur Google — des retours authentiques de nos élèves au studio.</div>';
    const markerEn =
      '<div class="paragraph-big">5/5 on Google — genuine feedback from our students at the studio.</div>';
    if (html.includes(markerFr)) {
      html = html.replace(markerFr, markerFr + REVIEWS_LINK_FR);
    } else if (html.includes(markerEn)) {
      html = html.replace(markerEn, markerEn + REVIEWS_LINK_EN);
    }
  }

  if (html === original) return false;
  fs.writeFileSync(file, html, "utf8");
  return true;
}

function main() {
  const changed = [];
  if (patchFile("homepage.html", false)) changed.push("homepage.html");
  if (patchFile("en/homepage.html", true)) changed.push("en/homepage.html");
  console.log("Patched homepage showreel/reviews on " + changed.length + " file(s)");
}

if (require.main === module) {
  main();
}

module.exports = { main };
