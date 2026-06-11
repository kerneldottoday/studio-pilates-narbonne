const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const contactPath = path.join(root, "contact.html");
const footerTemplate = fs.readFileSync(
  path.join(__dirname, "..", "content", "footer-main.html"),
  "utf8"
).trim();

let contactHtml = fs.readFileSync(contactPath, "utf8");
const start = contactHtml.indexOf('<section class="footer">');
const end = contactHtml.indexOf("</section>", start) + "</section>".length;

if (start === -1) {
  console.error("Footer not found in contact.html");
  process.exit(1);
}

contactHtml = contactHtml.slice(0, start) + footerTemplate + contactHtml.slice(end);
fs.writeFileSync(contactPath, contactHtml, "utf8");
console.log("Updated footer template in contact.html");
