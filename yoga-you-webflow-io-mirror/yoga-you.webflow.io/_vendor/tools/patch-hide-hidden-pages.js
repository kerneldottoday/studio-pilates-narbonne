const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");

const hiddenLinkPatterns = [
  /<a href="(\.\.\/)?expertises\.html"[^>]*>[^<]*<\/a>\s*/gi,
  /<a href="(\.\.\/)?blog\.html"[^>]*>[^<]*<\/a>\s*/gi,
  /<a href="(\.\.\/)?about\.html" class="nav-link w-nav-link"[^>]*>[^<]*<\/a>\s*/gi,
];

function patchHtml(html) {
  let updated = html;
  hiddenLinkPatterns.forEach(function (pattern) {
    updated = updated.replace(pattern, "");
  });
  return updated;
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
console.log(`Removed hidden page links from ${changed.length} file(s)`);
