/**
 * Copie les données locales du studio (.studio-data/*.json) vers la table
 * Supabase studio_docs. À lancer avant un cutover ou pour resynchroniser
 * l'environnement distant avec l'état local.
 *
 * Usage: node _vendor/tools/studio-store-push.js
 * Requiert STUDIO_SUPABASE_URL + STUDIO_SUPABASE_KEY (.env.local).
 */
const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..", "..", "..", "..");
const { loadEnv } = require(path.join(REPO_ROOT, "lib", "shop", "load-env"));
loadEnv(REPO_ROOT);

const remote = require(path.join(REPO_ROOT, "lib", "studio", "remote"));
const DATA_DIR = path.join(REPO_ROOT, ".studio-data");
const KEYS = ["catalog", "orders", "bookings", "notices", "closures", "shop"];

async function main() {
  const current = await remote.fetchDocs(KEYS);
  for (const key of KEYS) {
    const file = path.join(DATA_DIR, key + ".json");
    if (!fs.existsSync(file)) {
      console.log(key + " : pas de fichier local, ignoré");
      continue;
    }
    const data = JSON.parse(fs.readFileSync(file, "utf8"));
    const base = current[key] ? current[key].version : null;
    const version = await remote.pushDoc(key, data, base);
    const count = Array.isArray(data) ? data.length + " éléments" : "document";
    console.log(key + " : poussé (" + count + ", version " + version + ")");
  }
}

main().catch(function (err) {
  console.error("Échec :", err.message);
  process.exit(1);
});
