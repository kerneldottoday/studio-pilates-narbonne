const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..", "..");
const SCRIPT_NAME = "mobile-nav.js";
const MARKER = "_vendor/js/" + SCRIPT_NAME;

function scriptTag(prefix) {
  return (
    '<script src="' +
    prefix +
    '_vendor/js/' +
    SCRIPT_NAME +
    '" type="text/javascript"></script>'
  );
}

function walk(dir, changed) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "65939d1f139e1daa37da455f") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, changed);
      continue;
    }
    if (!entry.name.endsWith(".html")) continue;

    let html = fs.readFileSync(full, "utf8");
    if (!html.includes('class="navbar w-nav"') || html.includes(MARKER)) {
      continue;
    }

    const rel = path.relative(root, full);
    const depth = rel.split(path.sep).length - 1;
    const prefix = depth ? "../".repeat(depth) : "";
    const tag = scriptTag(prefix);
    const webflowNeedle = prefix + "65939d1f139e1daa37da455f/js/webflow.";

    if (html.includes(webflowNeedle)) {
      html = html.replace(
        /(<script src="[^"]*\/js\/webflow\.[^"]+" type="text\/javascript"><\/script>)/,
        "$1" + tag
      );
    } else if (html.includes("</body>")) {
      html = html.replace("</body>", tag + "</body>");
    } else {
      continue;
    }

    fs.writeFileSync(full, html, "utf8");
    changed.push(rel);
  }
}

const changed = [];
walk(root, changed);
console.log("Injected mobile-nav.js on " + changed.length + " page(s)");
