const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const skipDirs = new Set(["65939d1f139e1daa37da455f", "node_modules", ".git"]);
const extensions = new Set([".html", ".js", ".css", ".json", ".md"]);

function replaceEmDash(text) {
  return (
    text
      // Titres de page
      .replace(/Studio Pilates Narbonne | Accueil/g, "Studio Pilates Narbonne | Accueil")
      .replace(/content="Studio Pilates Narbonne | Accueil"/g, 'content="Studio Pilates Narbonne | Accueil"')
      // Phrases : tiret incise → point + majuscule
      .replace(/bienvenus. N'hésitez/g, "bienvenus. N'hésitez")
      .replace(/samedi. Consultez/g, "samedi. Consultez")
      .replace(/téléphone. Nous/g, "téléphone. Nous")
      .replace(/fermés. On/g, "fermés. On")
      .replace(/ici. Un studio/g, "ici. Un studio")
      .replace(/commence ici. Un/g, "commence ici. Un")
      // Reste : virgule (ponctuation web plus sobre)
      .replace(/\s, \s/g, ", ")
      .replace(/, /g, ", ")
  );
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    const ext = path.extname(entry.name);
    if (!extensions.has(ext)) continue;
    const original = fs.readFileSync(full, "utf8");
    if (!original.includes(", ")) continue;
    const updated = replaceEmDash(original);
    if (updated !== original) {
      fs.writeFileSync(full, updated, "utf8");
      changed.push(path.relative(root, full));
    }
  }
}

const changed = [];
walk(root, changed);
console.log(`Updated ${changed.length} file(s):`);
changed.forEach((f) => console.log("  " + f));

const remaining = [];
function scan(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (skipDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) scan(full);
    else if (extensions.has(path.extname(entry.name))) {
      const t = fs.readFileSync(full, "utf8");
      if (t.includes(", ")) remaining.push(path.relative(root, full));
    }
  }
}
scan(root);
if (remaining.length) {
  console.error("Still contains em dash:", remaining);
  process.exit(1);
}
