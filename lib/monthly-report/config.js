/**
 * Rapport analytics mensuel — config Studio Pilates Narbonne.
 * Destinataire par défaut : Yankel (QA). Changer MONTHLY_REPORT_TO_EMAIL pour le client.
 */

const MONTHLY_REPORT_PROJECT_ID =
  process.env.MONTHLY_REPORT_PROJECT_ID || "prj_ESHr45ELnzaTSMf4Wn6dtbP636pQ";

const MONTHLY_REPORT_TEAM_ID =
  process.env.MONTHLY_REPORT_TEAM_ID || "team_TcwDuH2agfbDDJmAtGBGSAq5";

const MONTHLY_REPORT_PROJECT_NAME = "studio-pilates-narbonne";

/**
 * Destinataire : MONTHLY_REPORT_TO_EMAIL (prod = Souhila).
 * Défaut : Souhila (lahissou@hotmail.fr).
 */
const MONTHLY_REPORT_TO =
  process.env.MONTHLY_REPORT_TO_EMAIL || "lahissou@hotmail.fr";

/** Adresse client autorisée (Souhila) — tout autre pattern studio reste bloqué. */
const ALLOWED_CLIENT = /^lahissou@hotmail\.fr$/i;

const CLIENT_BLOCK =
  /studiopilatesnarbonne|@studio.?pilates|pilatesnarbonne|info@studio/i;

function assertSafeRecipient(email) {
  if (ALLOWED_CLIENT.test(email)) return;
  if (CLIENT_BLOCK.test(email)) {
    throw new Error(
      `Refus d’envoyer le rapport mensuel à une adresse client : ${email}. ` +
        `Utiliser lahissou@hotmail.fr ou une adresse KERNEL.`
    );
  }
}

/** Noms de pays en français (codes ISO). */
const COUNTRY_NAMES = {
  DE: "Allemagne",
  FR: "France",
  US: "États-Unis",
  GB: "Royaume-Uni",
  AT: "Autriche",
  CH: "Suisse",
  NL: "Pays-Bas",
  BE: "Belgique",
  PL: "Pologne",
  ES: "Espagne",
  IT: "Italie",
  PT: "Portugal",
  LU: "Luxembourg",
  CA: "Canada",
  MA: "Maroc",
  DZ: "Algérie",
  TN: "Tunisie",
  AU: "Australie",
  IE: "Irlande",
  SE: "Suède",
  NO: "Norvège",
  DK: "Danemark",
};

module.exports = {
  MONTHLY_REPORT_PROJECT_ID,
  MONTHLY_REPORT_TEAM_ID,
  MONTHLY_REPORT_PROJECT_NAME,
  MONTHLY_REPORT_TO,
  assertSafeRecipient,
  COUNTRY_NAMES,
};
