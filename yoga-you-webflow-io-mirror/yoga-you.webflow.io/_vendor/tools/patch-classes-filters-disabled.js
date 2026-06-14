const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "..", "..", "classes.html");
let html = fs.readFileSync(file, "utf8");

html = html.replace("<body>", '<body class="page-classes">');

html = html.replace(
  'class="dropdown-filter w-dropdown"><div class="dropdown-toggle-filter w-dropdown-toggle"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg"',
  'class="dropdown-filter filter-disabled w-dropdown"><div class="dropdown-toggle-filter w-dropdown-toggle" aria-disabled="true" tabindex="-1"><img src="65939d1f139e1daa37da455f/6593f702730ac2c261fb3539_clock.svg"'
);

html = html.replace(
  'class="dropdown-filter w-dropdown"><div class="dropdown-toggle-filter w-dropdown-toggle"><img src="65939d1f139e1daa37da455f/6594d58ef9cce0861fbeccbd_Filter%20Type.svg"',
  'class="dropdown-filter filter-disabled w-dropdown"><div class="dropdown-toggle-filter w-dropdown-toggle" aria-disabled="true" tabindex="-1"><img src="65939d1f139e1daa37da455f/6594d58ef9cce0861fbeccbd_Filter%20Type.svg"'
);

fs.writeFileSync(file, html, "utf8");
console.log(
  "Patched classes.html:",
  (html.match(/filter-disabled/g) || []).length,
  "disabled filters"
);
