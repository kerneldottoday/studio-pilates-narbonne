// Stockage distant du studio : table Supabase `studio_docs` (une ligne par
// collection, données en jsonb + version pour détecter les écritures
// concurrentes). Activé uniquement si STUDIO_STORE=supabase.

const TABLE = "studio_docs";
const TIMEOUT_MS = 8000;

function remoteWanted() {
  return String(process.env.STUDIO_STORE || "").toLowerCase() === "supabase";
}

function baseUrl() {
  return String(process.env.STUDIO_SUPABASE_URL || "")
    .trim()
    .replace(/\/+$/, "");
}

function apiKey() {
  return String(process.env.STUDIO_SUPABASE_KEY || "").trim();
}

// Secret applicatif exigé par la policy RLS de studio_docs quand on utilise
// la clé publishable. Inutile (mais inoffensif) avec une clé sb_secret.
function storeSecret() {
  return String(process.env.STUDIO_STORE_SECRET || "").trim();
}

function assertConfig() {
  if (!baseUrl() || !apiKey()) {
    throw new Error(
      "STUDIO_STORE=supabase mais STUDIO_SUPABASE_URL / STUDIO_SUPABASE_KEY manquent"
    );
  }
}

async function rest(method, query, body, prefer) {
  assertConfig();
  const headers = {
    apikey: apiKey(),
    Authorization: "Bearer " + apiKey(),
    "Content-Type": "application/json",
  };
  if (storeSecret()) headers["x-studio-secret"] = storeSecret();
  if (prefer) headers.Prefer = prefer;
  const response = await fetch(baseUrl() + "/rest/v1/" + TABLE + query, {
    method: method,
    headers: headers,
    body: body == null ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await response.text();
  if (!response.ok) {
    const err = new Error(
      "Supabase " + method + " " + response.status + " — " + text.slice(0, 300)
    );
    err.status = response.status;
    throw err;
  }
  return text ? JSON.parse(text) : null;
}

// Retourne { catalog: {data, version} | null, orders: ..., ... }
async function fetchDocs(keys) {
  const rows = await rest(
    "GET",
    "?select=key,data,version&key=in.(" + keys.join(",") + ")"
  );
  const out = {};
  for (const key of keys) out[key] = null;
  for (const row of rows || []) {
    if (row && keys.indexOf(row.key) >= 0) {
      out[row.key] = { data: row.data, version: Number(row.version) || 0 };
    }
  }
  return out;
}

// Écrit un doc. baseVersion = version lue à l'hydratation (null si la ligne
// n'existait pas). Compare-and-swap : si quelqu'un a écrit entre-temps, on
// loggue et on force (dernier écrit gagne — un seul studio, trafic faible).
async function pushDoc(key, data, baseVersion) {
  const now = new Date().toISOString();

  if (baseVersion == null) {
    try {
      await rest("POST", "", [{ key: key, data: data, version: 1, updated_at: now }]);
      return 1;
    } catch (err) {
      if (err.status !== 409) throw err;
      // La ligne est apparue entre-temps : on passe en mise à jour forcée.
      console.warn("[studio] conflit d'écriture (insert) sur " + key + " — écrasement");
      return forceUpdate(key, data, now);
    }
  }

  const rows = await rest(
    "PATCH",
    "?key=eq." + key + "&version=eq." + baseVersion,
    { data: data, version: baseVersion + 1, updated_at: now },
    "return=representation"
  );
  if (Array.isArray(rows) && rows.length) {
    return Number(rows[0].version) || baseVersion + 1;
  }
  console.warn("[studio] conflit d'écriture sur " + key + " — écrasement");
  return forceUpdate(key, data, now);
}

async function forceUpdate(key, data, now) {
  const current = await rest("GET", "?select=version&key=eq." + key);
  const version =
    (Array.isArray(current) && current[0] && Number(current[0].version)) || 0;
  const rows = await rest(
    "PATCH",
    "?key=eq." + key,
    { data: data, version: version + 1, updated_at: now },
    "return=representation"
  );
  if (Array.isArray(rows) && rows.length) {
    return Number(rows[0].version) || version + 1;
  }
  // La ligne a disparu (jamais vu en pratique) : on la recrée.
  await rest("POST", "", [{ key: key, data: data, version: version + 1, updated_at: now }]);
  return version + 1;
}

module.exports = {
  remoteWanted,
  fetchDocs,
  pushDoc,
};
