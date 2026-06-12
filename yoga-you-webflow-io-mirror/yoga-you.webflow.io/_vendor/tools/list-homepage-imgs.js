const fs = require("fs");
const h = fs.readFileSync(
  require("path").join(__dirname, "..", "..", "homepage.html"),
  "utf8"
);
const re = /src="([^"]+\.(jpg|webp|png))"/g;
let m;
while ((m = re.exec(h))) {
  if (!m[1].includes("svg") && !m[1].includes("youtube")) console.log(m[1]);
}
