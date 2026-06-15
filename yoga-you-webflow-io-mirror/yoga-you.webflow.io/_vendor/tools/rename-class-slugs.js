/**
 * Renomme les URLs des fiches cours selon le titre affiché (slug lisible).
 * Usage: node _vendor/tools/rename-class-slugs.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");
const BODIES = path.join(ROOT, "_vendor/content/class-bodies");
const CLASSES_DIR = path.join(ROOT, "classes");
const DATA_PATH = path.join(ROOT, "_vendor/content/classes-data.json");

/** ancien slug (sans .html) → nouveau slug */
const SLUG_RENAMES = {
  "reformer-homme": "reformer-homme",
  "pilates-mat": "pilates-mat",
  "cours-prive": "cours-prive",
  "reset": "reset",
  "yoga-ashtanga": "yoga-ashtanga",
  "pilates-reformer": "pilates-reformer",
};

const RENAME_ORDER = Object.keys(SLUG_RENAMES).sort((a, b) => b.length - a.length);

function renameFile(from, to) {
  if (!fs.existsSync(from)) return false;
  if (fs.existsSync(to)) fs.unlinkSync(to);
  fs.renameSync(from, to);
  return true;
}

function rebuildClassesData() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
  const nextClasses = {};

  for (const [oldFile, cls] of Object.entries(data.classes)) {
    const oldSlug = oldFile.replace(/\.html$/i, "");
    const newSlug = SLUG_RENAMES[oldSlug];
    if (!newSlug) {
      nextClasses[oldFile] = cls;
      continue;
    }
    const newFile = newSlug + ".html";
    nextClasses[newFile] = {
      ...cls,
      bodyFile: cls.bodyFile.replace(oldSlug, newSlug),
      related: (cls.related || []).map(function (rel) {
        const base = rel.replace(/\.html$/i, "");
        const mapped = SLUG_RENAMES[base] || base;
        return mapped + ".html";
      }),
    };
  }

  data.classes = nextClasses;
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function renameClassAssets() {
  let count = 0;
  for (const [oldSlug, newSlug] of Object.entries(SLUG_RENAMES)) {
    if (
      renameFile(
        path.join(BODIES, oldSlug + "-body.html"),
        path.join(BODIES, newSlug + "-body.html")
      )
    ) {
      count++;
    }
    if (
      renameFile(
        path.join(CLASSES_DIR, oldSlug + ".html"),
        path.join(CLASSES_DIR, newSlug + ".html")
      )
    ) {
      count++;
    }
  }
  return count;
}

function shouldScanFile(file) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (rel.startsWith("65939d1f139e1daa37da455f/")) return false;
  if (rel.includes("node_modules/")) return false;
  return /\.(html|js|json|xml|md)$/i.test(rel);
}

function walkFiles(dir, out) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === "65939d1f139e1daa37da455f" || name === "node_modules") continue;
      walkFiles(full, out);
      continue;
    }
    if (shouldScanFile(full)) out.push(full);
  }
}

function replaceSlugsInText(text) {
  let out = text;
  for (const oldSlug of RENAME_ORDER) {
    const newSlug = SLUG_RENAMES[oldSlug];
    out = out.split(oldSlug).join(newSlug);
  }
  return out;
}

function replaceSlugsInProject() {
  const files = [];
  walkFiles(ROOT, files);
  let changed = 0;
  for (const file of files) {
    const before = fs.readFileSync(file, "utf8");
    const after = replaceSlugsInText(before);
    if (after !== before) {
      fs.writeFileSync(file, after, "utf8");
      changed++;
    }
  }
  return changed;
}

function patchCleanUrlsRedirects() {
  const cleanUrlsPath = path.join(ROOT, "_vendor/tools/clean-urls.js");
  let src = fs.readFileSync(cleanUrlsPath, "utf8");
  const marker = "const CLASS_SLUG_REDIRECTS = [";

  const rules = [];
  for (const [oldSlug, newSlug] of Object.entries(SLUG_RENAMES)) {
    for (const prefix of ["/classes/", "/en/classes/"]) {
      rules.push(
        '  { source: "' + prefix + oldSlug + '", destination: "' + prefix + newSlug + '" },',
        '  { source: "' + prefix + oldSlug + '.html", destination: "' + prefix + newSlug + '" },'
      );
    }
  }

  const block =
    marker +
    "\n" +
    rules.join("\n") +
    "\n];\n\n";

  if (src.includes(marker)) {
    src = src.replace(/const CLASS_SLUG_REDIRECTS = \[[\s\S]*?\];\n\n/, block);
  } else {
    src = src.replace(
      "const LEGACY_REDIRECTS = [",
      block + "const LEGACY_REDIRECTS = ["
    );
    src = src.replace(
      "for (const rule of LEGACY_REDIRECTS) {",
      "for (const rule of CLASS_SLUG_REDIRECTS.concat(LEGACY_REDIRECTS)) {"
    );
  }

  fs.writeFileSync(cleanUrlsPath, src, "utf8");
}

function deleteOrphanOldClassPages() {
  let removed = 0;
  for (const oldSlug of Object.keys(SLUG_RENAMES)) {
    for (const dir of [CLASSES_DIR, path.join(ROOT, "en", "classes")]) {
      const orphan = path.join(dir, oldSlug + ".html");
      if (fs.existsSync(orphan)) {
        fs.unlinkSync(orphan);
        removed++;
      }
    }
  }
  return removed;
}

function main() {
  rebuildClassesData();
  const renamed = renameClassAssets();
  const patched = replaceSlugsInProject();
  patchCleanUrlsRedirects();
  const removed = deleteOrphanOldClassPages();
  console.log("Renamed " + renamed + " class asset file(s)");
  console.log("Updated slug references in " + patched + " file(s)");
  if (removed) console.log("Removed " + removed + " orphan old page(s)");
  console.log("Slug map:");
  for (const [oldSlug, newSlug] of Object.entries(SLUG_RENAMES)) {
    console.log("  /classes/" + oldSlug + " → /classes/" + newSlug);
  }
}

module.exports = { SLUG_RENAMES, main };

if (require.main === module) {
  main();
}
