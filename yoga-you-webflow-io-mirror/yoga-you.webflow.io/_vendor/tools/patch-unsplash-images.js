const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const manifest = JSON.parse(
  fs.readFileSync(path.join(root, "_vendor/content/unsplash-manifest.json"), "utf8")
);

function buildSrcset(basePath, ext) {
  const dir = path.dirname(basePath);
  const name = path.basename(basePath, ext);
  const prefix = dir === "." ? "" : dir + "/";
  const full = `_vendor/media/${prefix}${name}`;
  const variants = [500, 800, 1080, 1600, 2000, 2600];
  const parts = [];
  for (const w of variants) {
    const p = `_vendor/media/${prefix}${name}-${w}.jpg`;
    if (fs.existsSync(path.join(root, p))) {
      parts.push(`${p} ${w}w`);
    }
  }
  const master = `_vendor/media/${prefix}${name}.jpg`;
  if (fs.existsSync(path.join(root, master))) {
    parts.push(`${master} ${parts.length ? "870" : "1036"}w`);
  }
  return parts.join(", ");
}

function replaceById(html, id, base) {
  const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `(?:\\.\\./)?(?:65939d1f139e1daa37da455f/|6593a20f89ac2c9812942be2/)?${escaped}_[^"'\\s]+\\.(?:jpg|jpeg|webp)(?:-p-\\d+)?`,
    "gi"
  );
  return html.replace(re, function (match) {
    const isVariant = /-p-(\d+)\./i.exec(match) || /-(\d+)\.(jpg|jpeg)$/i.exec(match);
    const width = isVariant ? isVariant[1] : null;
    const master = `_vendor/media/${base}.jpg`;
    if (width) {
      const variant = `_vendor/media/${base}-${width}.jpg`;
      if (fs.existsSync(path.join(root, variant))) return variant;
    }
    return master;
  });
}

function fixBrokenComboPaths(html) {
  html = html.replace(
    /(?:\.\.\/)?65939d1f139e1daa37da455f\/\.\.\/_vendor\/media\/souhila-combo\.png/g,
    "_vendor/media/stock/combo-side.jpg"
  );
  html = html.replace(
    /srcset="[^"]*combo-side[^"]*"/g,
    function (m) {
      const srcset = buildSrcset("stock/combo-side", ".jpg");
      return srcset ? `srcset="${srcset}"` : m;
    }
  );
  return html;
}

function patchFile(filePath) {
  let html = fs.readFileSync(filePath, "utf8");
  const original = html;
  const rel = path.relative(root, filePath).replace(/\\/g, "/");
  const prefix =
    rel.includes("/") && !rel.startsWith("65939")
      ? "../".repeat(rel.split("/").length - 1)
      : "";

  for (const item of manifest.idReplacements) {
    html = replaceById(html, item.id, item.base);
  }

  html = html.replace(
    /65939d1f139e1daa37da455f\/65963fd37e2ade52da51e723_OG-min\.jpg/g,
    `${prefix}_vendor/media/stock/og-studio.jpg`
  );

  html = fixBrokenComboPaths(html);

  if (rel === "homepage.html") {
    // Conserver souhila-combo sur l'accueil uniquement
  } else {
    html = html.replace(
      /(?:\.\.\/)?_vendor\/media\/souhila-combo\.png/g,
      `${prefix}_vendor/media/stock/combo-side.jpg`
    );
  }

  if (rel.startsWith("classes/")) {
    html = fixClassRelativePaths(html);
  }

  if (html !== original) {
    fs.writeFileSync(filePath, html, "utf8");
    return rel;
  }
  return null;
}

function patchClassesData() {
  const dataPath = path.join(root, "_vendor/content/classes-data.json");
  const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));
  const map = {
    "1-hour-pilates.html": "stock/class-reformer",
    "intense-1-hour-pilates.html": "stock/class-reformer-homme",
    "30-minutes-morning-yoga.html": "stock/class-mat",
    "yoga-for-focus.html": "stock/class-ashtanga",
    "disconnect-breathwork.html": "stock/class-reset",
    "30-minutes-chair-yoga.html": "stock/class-prive",
  };

  Object.keys(map).forEach(function (slug) {
    const base = map[slug];
    const srcsetParts = [];
    [500, 800, 1080].forEach(function (w) {
      const rel = `_vendor/media/${base}-${w}.jpg`;
      if (fs.existsSync(path.join(root, rel))) srcsetParts.push(`${rel} ${w}w`);
    });
    srcsetParts.push(`_vendor/media/${base}.jpg 1036w`);
    data.classes[slug].image = `_vendor/media/${base}.jpg`;
    data.classes[slug].imageSrcset = srcsetParts.join(", ");
  });

  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + "\n", "utf8");
  return "classes-data.json";
}

function fixClassRelativePaths(html) {
  html = html.replace(/src="_vendor\/media\//g, 'src="../_vendor/media/');
  html = html.replace(/srcset="_vendor\/media\//g, 'srcset="../_vendor/media/');
  html = html.replace(/, _vendor\/media\//g, ", ../_vendor/media/");
  html = html.replace(/content="_vendor\/media\//g, 'content="../_vendor/media/');
  return html;
}

const updated = [];
for (const file of fs.readdirSync(root, { withFileTypes: true })) {
  if (file.isFile() && file.name.endsWith(".html")) {
    const r = patchFile(path.join(root, file.name));
    if (r) updated.push(r);
  }
}

const classesDir = path.join(root, "classes");
if (fs.existsSync(classesDir)) {
  for (const f of fs.readdirSync(classesDir)) {
    if (f.endsWith(".html")) {
      const r = patchFile(path.join(classesDir, f));
      if (r) updated.push(r);
    }
  }
}

for (const sub of ["_vendor/content"]) {
  const dir = path.join(root, sub);
  if (!fs.existsSync(dir)) continue;
  for (const f of fs.readdirSync(dir)) {
    if (f.endsWith(".html")) {
      const r = patchFile(path.join(dir, f));
      if (r) updated.push(r);
    }
  }
}

updated.push(patchClassesData());

console.log("Images Unsplash appliquées sur " + updated.length + " fichier(s):");
updated.forEach(function (f) {
  console.log("  - " + f);
});
