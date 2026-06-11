const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "..", "contact.html");
let html = fs.readFileSync(file, "utf8");

const bsportUrl =
  "https://backoffice.bsport.io/m/Studio%20Pilates%20Narbonne/1625/calendar/?tabSelected=0";

const faqIntroOldRegex =
  /<h2 class="no-margins">You[\u2019']ve got questions, I[\u2019']ve got answers\.<\/h2><div>[\s\S]*?<\/div><div class="flex-cta-left mg-top-8"><a href="contact\.html"[^>]*>Nous contacter<\/a><\/div>/;

const faqIntroNew = `<h2 class="no-margins">Questions fréquentes</h2><div>Tout ce qu'il faut savoir avant de réserver votre place au studio, cours, niveau, matériel et accès.</div><div class="flex-cta-left mg-top-8"><a href="${bsportUrl}" target="_blank" rel="noopener noreferrer" class="cta w-button">Réserver un cours</a></div>`;

if (!html.match(faqIntroOldRegex)) {
  console.error("FAQ intro not found");
  process.exit(1);
}

html = html.replace(faqIntroOldRegex, faqIntroNew);

if (!html.includes("How much can I customise Webflow template?")) {
  console.log("FAQ items already patched, intro only");
  fs.writeFileSync(file, html, "utf8");
  console.log("contact.html FAQ intro updated");
  process.exit(0);
}

const faqs = [
  {
    q: "Comment réserver un cours ?",
    a: "Toutes les réservations se font en ligne via bsport. Consultez le planning, choisissez votre créneau (Reformer, Mat, Yoga Ashtanga…) et validez votre place. Vous pouvez aussi nous écrire à lahissou@hotmail.fr si vous avez besoin d'aide pour votre première réservation.",
  },
  {
    q: "Faut-il une expérience préalable en Pilates ou en yoga ?",
    a: "Non. Des cours tous niveaux sont proposés et Souhila adapte les exercices à chaque participant. Les débutants sont les bienvenus. N'hésitez pas à nous indiquer que c'est votre première séance lors de la réservation.",
  },
  {
    q: "Quelle est la différence entre Reformer, Mat et Yoga Ashtanga ?",
    a: "Le Reformer utilise l'appareil à ressorts pour un travail profond, précis et guidé. Le Mat est le Pilates au sol, centré sur le gainage, la posture et la mobilité. Le Yoga Ashtanga propose une séquence dynamique en petit groupe ; certains cours ont lieu en extérieur selon la saison.",
  },
  {
    q: "Que faut-il apporter ?",
    a: "Une tenue confortable et une bouteille d'eau. Les chaussettes antidérapantes sont obligatoires au Reformer (vous pouvez en acheter sur place si besoin). Tapis, accessoires et matériel sont fournis au studio.",
  },
  {
    q: "Comment annuler ou reporter un cours ?",
    a: "Les annulations et modifications se font depuis votre espace bsport, selon les conditions de votre formule ou de votre abonnement. Merci d'annuler le plus tôt possible afin de libérer la place pour un autre élève.",
  },
  {
    q: "Où se trouve le studio et quels sont les horaires ?",
    a: "Le studio est situé au 8 Rue du Luxembourg, 11100 Narbonne. Les cours ont lieu du mardi au samedi. Consultez le planning en ligne pour les horaires à jour. Un plan d'accès est disponible via Google Maps depuis le lien adresse ci-dessus.",
  },
];

function faqItem(q, a) {
  return `<div class="expandable-single-faq"><div class="expandable-top"><div class="heading-expandable">${q}</div><div class="plus-expand-master"><div class="plus-line"></div><div class="plus-line vertical"></div></div></div><div class="expandable-bottom"><p class="faq-paragraph">${a}</p></div></div>`;
}

const faqBlockRegex =
  /<div class="expandable-single-faq"><div class="expandable-top"><div class="heading-expandable">How much can I customise Webflow template\?<\/div>[\s\S]*?<\/div><\/div><\/div><\/div><\/section>/;

const faqBlockNew =
  faqs.map((item) => faqItem(item.q, item.a)).join("") +
  "</div></div></div></section>";

if (!html.includes("How much can I customise Webflow template?")) {
  console.error("FAQ block not found");
  process.exit(1);
}

html = html.replace(faqIntroOldRegex, faqIntroNew);
html = html.replace(faqBlockRegex, faqBlockNew);

fs.writeFileSync(file, html, "utf8");
console.log("contact.html FAQ updated");
