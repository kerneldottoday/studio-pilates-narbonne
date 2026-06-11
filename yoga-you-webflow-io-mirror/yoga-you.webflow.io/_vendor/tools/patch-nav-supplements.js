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
        /<a href="(\.\.\/)?blog\.html"([^>]*)>Voyage<\/a>/g,
        '<a href="$1blog.html"$2>Compléments alimentaires</a>'
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
console.log(`Updated nav/footer label on ${changed.length} file(s)`);
