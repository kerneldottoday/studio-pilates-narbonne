const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

function patchHtml(html) {
  return html
    .replace(
      /<link href="(\.\.\/)?_vendor\/css\/page-transitions\.css" rel="stylesheet" type="text\/css"\/>/g,
      ""
    )
    .replace(
      /<script src="(\.\.\/)?_vendor\/js\/page-transitions\.js" defer><\/script>/g,
      ""
    );
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, changed);
    else if (entry.name.endsWith(".html")) {
      const original = fs.readFileSync(full, "utf8");
      const updated = patchHtml(original);
      if (updated !== original) {
        fs.writeFileSync(full, updated, "utf8");
        changed.push(path.relative(root, full));
      }
    }
  }
}

const changed = [];
walk(root, changed);
console.log(`Removed page transitions from ${changed.length} file(s)`);
