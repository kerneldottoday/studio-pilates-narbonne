const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..", "..");
const source = path.join(root, "_vendor", "media", "lotus-source.png");
const mediaDir = path.join(root, "_vendor", "media");
const pyScript = path.join(__dirname, "build-favicon.py");

if (!fs.existsSync(source)) {
  console.error("Lotus source image not found:", source);
  process.exit(1);
}

const result = spawnSync("python", [pyScript, source, mediaDir], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

const OLD_ICON =
  /<link href="(?:\.\.\/)*65939d1f139e1daa37da455f\/659664611b3d24207c3d7ee2_32\.svg" rel="shortcut icon" type="image\/x-icon"\/><link href="(?:\.\.\/)*65939d1f139e1daa37da455f\/65966463d2fecaaf2506f54a_256\.svg" rel="apple-touch-icon"\/>/g;

function faviconBlock(prefix) {
  return (
    `<link href="${prefix}favicon.svg" rel="icon" type="image/svg+xml"/>` +
    `<link href="${prefix}favicon-32.png" rel="icon" sizes="32x32" type="image/png"/>` +
    `<link href="${prefix}apple-touch-icon.png" rel="apple-touch-icon"/>`
  );
}

function walkHtml(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f" || entry.name === "_vendor") {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkHtml(full, files);
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(full);
    }
  }
  return files;
}

let patched = 0;
for (const file of walkHtml(root)) {
  let html = fs.readFileSync(file, "utf8");
  if (!OLD_ICON.test(html)) {
    continue;
  }
  OLD_ICON.lastIndex = 0;
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const depth = rel.split("/").length - 1;
  const prefix = depth === 0 ? "_vendor/media/" : "../".repeat(depth) + "_vendor/media/";
  html = html.replace(OLD_ICON, faviconBlock(prefix));
  fs.writeFileSync(file, html, "utf8");
  patched++;
}

console.log("Patched favicon links in " + patched + " HTML file(s)");
