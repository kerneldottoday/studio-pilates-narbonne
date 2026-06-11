const fs = require("fs");
const path = require("path");

const refMedia =
  "c:/users/recca/Desktop/Website pilates/reference/studiopilatesnarbonne.com/_assets/media";
const refVideo =
  "c:/users/recca/Desktop/Website pilates/reference/studiopilatesnarbonne.com/_assets/video";
const outDir = path.join(__dirname, "..", "media", "voyage");

const copies = [
  ["513c6b2423a6f966d96aeb74d356a0f1.jpg", "hero-desert.jpg"],
  ["2939b1b9ed028bc10d7085b15ff6b480.jpg", "hero-desert-alt.jpg"],
  ["d101ae02cd03d97aa40118bf9024f9be.jpg", "trekking.jpg"],
  ["b5e26b11ecfa85b2e1754da692790675.jpg", "yoga-desert.jpg"],
  ["1a14c57ae76e25d4d42f513fa8d4c269.jpg", "immersion.jpg"],
  ["ac0f3840d782749efe70484f80d78c93.jpg", "dunes-golden.jpg"],
  ["2fadd6888dce8a430a0d1fd79e6eb50d.jpg", "dunes-wide.jpg"],
  ["ff13dbdee98153a8cce6b83a79fba6a0.jpg", "souhila.jpg", refVideo],
];

fs.mkdirSync(outDir, { recursive: true });

for (const [srcName, destName, base] of copies) {
  const candidates = [
    path.join(base || refMedia, srcName),
    path.join(__dirname, "..", "media", "complements", srcName),
  ];
  const src = candidates.find((p) => fs.existsSync(p));
  const dest = path.join(outDir, destName);
  if (src) {
    fs.copyFileSync(src, dest);
    console.log("copied", destName);
  } else {
    console.warn("missing", srcName);
  }
}
