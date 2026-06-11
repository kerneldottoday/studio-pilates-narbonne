const fs = require("fs");
const path = require("path");
const ref = "c:/users/recca/Desktop/Website pilates/reference/studiopilatesnarbonne.com/_assets/media";
const files = fs.readdirSync(ref).filter((f) => /\.(jpg|jpeg|png|webp)$/i.test(f));
console.log("count", files.length);
for (const f of files) console.log(fs.statSync(path.join(ref, f)).size, f);
