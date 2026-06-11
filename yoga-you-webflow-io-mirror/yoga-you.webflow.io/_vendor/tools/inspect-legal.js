const fs = require("fs");
const c = fs.readFileSync(require("path").join(__dirname, "..", "..", "legal.html"), "utf8");
const start = c.indexOf('<section class="section"');
const end = c.indexOf("</section>", start) + 10;
const s = c.slice(start, end);
console.log("h2", [...s.matchAll(/<h2[^>]*>([^<]+)/g)].map((m) => m[1]));
console.log("h3 count", [...s.matchAll(/<h3/g)].length);
console.log("tail", s.slice(-600));
