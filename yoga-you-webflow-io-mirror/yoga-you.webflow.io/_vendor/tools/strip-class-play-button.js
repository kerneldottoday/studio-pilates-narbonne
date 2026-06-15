/**
 * Retire le bouton play template et la lightbox YouTube des fiches cours.
 * Usage: node _vendor/tools/strip-class-play-button.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

function stripClassPlayButton(html) {
  if (!html.includes("play-class") && !html.includes("w-lightbox")) {
    return html;
  }

  let out = html.replace(/<img[^>]*\bclass="play-class"[^>]*\/?>/gi, "");
  out = out.replace(/<script type="application\/json" class="w-json">[\s\S]*?<\/script>/gi, "");
  out = out.replace(
    /<a href="[^"]*"([^>]*\bclass="lightbox-class w-inline-block)\s+w-lightbox\b([^>]*>)/gi,
    "<div$1$2"
  );
  out = out.replace(/(<img[^>]*\bclass="image-lightbox-class"[^>]*\/?>)\s*<\/a>/gi, "$1</div>");
  return out;
}

function patchClassFiles(dir) {
  if (!fs.existsSync(dir)) return 0;
  let count = 0;
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith(".html")) continue;
    const file = path.join(dir, name);
    const html = fs.readFileSync(file, "utf8");
    const next = stripClassPlayButton(html);
    if (next !== html) {
      fs.writeFileSync(file, next, "utf8");
      count++;
    }
  }
  return count;
}

function main() {
  const fr = patchClassFiles(path.join(ROOT, "classes"));
  const en = patchClassFiles(path.join(ROOT, "en", "classes"));
  console.log("Stripped play button on " + fr + " FR + " + en + " EN class page(s)");
}

module.exports = { stripClassPlayButton, main };

if (require.main === module) {
  main();
}
