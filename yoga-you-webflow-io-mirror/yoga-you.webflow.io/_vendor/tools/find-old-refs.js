const fs = require("fs");
const path = require("path");
const h = fs.readFileSync(
  path.join(__dirname, "..", "..", "classes/1-hour-pilates.html"),
  "utf8"
);
const i = h.indexOf("image-combo-halves");
console.log(i >= 0 ? h.slice(i - 80, i + 200) : "not found");
