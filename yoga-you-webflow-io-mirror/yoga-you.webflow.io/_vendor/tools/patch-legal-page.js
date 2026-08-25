const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const sectionPath = path.join(root, "_vendor", "content", "legal-section.html");
const section = fs.readFileSync(sectionPath, "utf8").trim();
const sectionRegex =
  /<section class="section(?: legal-section)?">[\s\S]*?<\/section>/;

function patchLegal(legalPath, isFr) {
  let html = fs.readFileSync(legalPath, "utf8");
  if (!sectionRegex.test(html)) {
    console.error("Legal section placeholder not found in " + legalPath);
    process.exit(1);
  }
  html = html.replace(sectionRegex, section);
  if (isFr) {
    html = html.replace(
      /<link <link href="_vendor\/css\/site-updates\.css"/,
      '<link href="_vendor/css/site-updates.css"'
    );
  }
  fs.writeFileSync(legalPath, html, "utf8");
  console.log(path.relative(root, legalPath) + " updated");
}

patchLegal(path.join(root, "legal.html"), true);
patchLegal(path.join(root, "en", "legal.html"), false);
