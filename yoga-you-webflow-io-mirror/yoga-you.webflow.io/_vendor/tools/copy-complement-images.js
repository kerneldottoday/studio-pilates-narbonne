const fs = require("fs");
const path = require("path");

const refMedia =
  "c:/users/recca/Desktop/Website pilates/reference/studiopilatesnarbonne.com/_assets/media";
const refVideo =
  "c:/users/recca/Desktop/Website pilates/reference/studiopilatesnarbonne.com/_assets/video";
const outDir = path.join(__dirname, "..", "media", "complements");

const copies = [
  [path.join(refMedia, "31a87809c02f9456fba02872ce311c58.jpg"), "hero-nature.jpg"],
  [path.join(refMedia, "8bd7a1d1042b0514dc661fcad1fd847a.jpg"), "tile-nature.jpg"],
  [path.join(refVideo, "ff13dbdee98153a8cce6b83a79fba6a0.jpg"), "souhila.jpg"],
];

fs.mkdirSync(outDir, { recursive: true });
for (const [src, destName] of copies) {
  const dest = path.join(outDir, destName);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log("copied", destName);
  } else {
    console.warn("missing", src);
  }
}
