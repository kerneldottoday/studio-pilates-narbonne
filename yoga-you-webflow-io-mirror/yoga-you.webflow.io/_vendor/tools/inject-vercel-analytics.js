/**
 * Injects Vercel Web Analytics script into all HTML files.
 * Usage: node _vendor/tools/inject-vercel-analytics.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "..");

// Analytics script to inject before </body>
const ANALYTICS_SCRIPT = `<script>
  window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };
</script>
<script defer src="/_vercel/insights/script.js"></script>`;

/**
 * Process a single HTML file
 */
function injectAnalyticsToFile(filePath) {
  try {
    let html = fs.readFileSync(filePath, "utf8");
    
    // Check if analytics is already injected
    if (html.includes("/_vercel/insights/script.js")) {
      console.log(`✓ Analytics already present in ${path.relative(ROOT, filePath)}`);
      return;
    }
    
    // Inject analytics script before closing body tag
    if (!html.includes("</body>")) {
      console.log(`⚠ No </body> tag found in ${path.relative(ROOT, filePath)}`);
      return;
    }
    
    html = html.replace("</body>", `${ANALYTICS_SCRIPT}\n</body>`);
    fs.writeFileSync(filePath, html, "utf8");
    console.log(`✓ Injected analytics into ${path.relative(ROOT, filePath)}`);
  } catch (err) {
    console.error(`✗ Error processing ${filePath}:`, err.message);
  }
}

/**
 * Recursively find and process all HTML files in a directory
 */
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      // Skip node_modules, .git, etc.
      if (!entry.name.startsWith(".") && entry.name !== "node_modules") {
        processDirectory(fullPath);
      }
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      injectAnalyticsToFile(fullPath);
    }
  }
}

// Main execution
console.log("Injecting Vercel Web Analytics into HTML files...\n");
processDirectory(ROOT);
console.log("\nDone!");
