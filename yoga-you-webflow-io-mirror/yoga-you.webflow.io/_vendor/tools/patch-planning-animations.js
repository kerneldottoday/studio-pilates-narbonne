const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const planningPath = path.join(root, "planning.html");

const cssTag =
  '<link href="_vendor/css/planning-animations.css" rel="stylesheet" type="text/css"/>';
const jsTag =
  '<script src="_vendor/js/planning-animations.js" defer></script>';

let html = fs.readFileSync(planningPath, "utf8");

if (!html.includes("_vendor/css/planning-animations.css")) {
  const needle = '_vendor/css/planning.css" rel="stylesheet" type="text/css"/>';
  const index = html.indexOf(needle);
  if (index !== -1) {
    const insertAt = index + needle.length;
    html = html.slice(0, insertAt) + cssTag + html.slice(insertAt);
  }
}

if (!html.includes("_vendor/js/planning-animations.js")) {
  html = html.replace("</body>", jsTag + "</body>");
}

fs.writeFileSync(planningPath, html, "utf8");
console.log("Added planning scroll animations to planning.html");
