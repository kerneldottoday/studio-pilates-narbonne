/**
 * Retire kernel-footer.css et kernel-footer.js de toutes les pages HTML.
 * Usage: node _vendor/tools/strip-kernel-footer.js
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

function stripKernelFooter(html) {
  return html
    .replace(
      /<link href="(?:\.\.\/)*_vendor\/css\/kernel-footer\.css" rel="stylesheet" type="text\/css"\/>/g,
      ""
    )
    .replace(
      /<script src="(?:\.\.\/)*_vendor\/js\/kernel-footer\.js" defer><\/script>/g,
      ""
    );
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    const html = fs.readFileSync(full, "utf8");
    const next = stripKernelFooter(html);
    if (next !== html) {
      fs.writeFileSync(full, next, "utf8");
      changed.push(path.relative(root, full));
    }
  }
}

function main() {
  const changed = [];
  walk(root, changed);
  console.log("Removed kernel footer assets from " + changed.length + " page(s)");
}

if (require.main === module) {
  main();
} else {
  module.exports = { main, stripKernelFooter };
}
