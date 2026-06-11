const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, changed);
    else if (entry.name.endsWith(".html")) {
      let html = fs.readFileSync(full, "utf8");
      const original = html;

      html = html.replace(
        /<a href="(\.\.\/)?expertises\.html"([^>]*)>Atouts<\/a>/g,
        '<a href="$1expertises.html"$2>Voyage</a>'
      );

      if (html !== original) {
        fs.writeFileSync(full, html, "utf8");
        changed.push(path.relative(root, full));
      }
    }
  }
}

const changed = [];
walk(root, changed);
console.log(`Updated Atouts → Voyage on ${changed.length} file(s)`);
