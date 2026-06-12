const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const imgs = new Set();

function walk(dir) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    if (name.name.startsWith(".") || name.name === "node_modules") continue;
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walk(p);
    else if (/\.(html|css)$/.test(name.name)) {
      const t = fs.readFileSync(p, "utf8");
      const patterns = [
        /(?:src|srcset|content)=["']([^"']+\.(?:jpg|webp|png|jpeg))/gi,
        /url\(["']?([^"')]+\.(?:jpg|webp|png|jpeg))/gi,
        /65939d1f139e1daa37da455f\/[^"'\s)]+\.(?:jpg|webp|png)/gi,
        /6593a20f89ac2c9812942be2\/[^"'\s)]+\.(?:jpg|webp|png)/gi,
        /_vendor\/media\/[^"'\s)]+\.(?:jpg|webp|png)/gi,
      ];
      for (const re of patterns) {
        let m;
        while ((m = re.exec(t))) {
          const val = (m[1] || m[0]).split(/\s/)[0];
          if (!val.includes("svg") && !val.includes("youtube")) imgs.add(val);
        }
      }
    }
  }
}

walk(root);
[...imgs].sort().forEach((i) => console.log(i));
