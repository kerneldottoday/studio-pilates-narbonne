/**
 * Serveur local avec les mêmes redirects/rewrites que vercel.json.
 * Usage: node _vendor/tools/local-dev-server.js [port]
 */
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const ROOT = path.join(__dirname, "..", "..");
const REPO_ROOT = path.join(ROOT, "..", "..");
const PORT = Number(process.argv[2]) || 8000;
const vercelPath = path.join(REPO_ROOT, "vercel.json");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".mp4": "video/mp4",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
};

function loadVercelConfig() {
  return fs.existsSync(vercelPath)
    ? JSON.parse(fs.readFileSync(vercelPath, "utf8"))
    : { redirects: [], rewrites: [] };
}

function normalizePathname(pathname) {
  let p = decodeURIComponent(pathname || "/");
  if (p.length > 1 && p.endsWith("/")) {
    p = p.slice(0, -1);
  }
  return p || "/";
}

function matchRedirect(pathname, vercel) {
  for (const rule of vercel.redirects || []) {
    if (normalizePathname(rule.source) === pathname) {
      return rule.destination;
    }
  }
  return null;
}

function applyRewrite(pathname, vercel) {
  for (const rule of vercel.rewrites || []) {
    if (normalizePathname(rule.source) === pathname) {
      return rule.destination;
    }
  }
  return pathname;
}

function safeFilePath(urlPath) {
  const relative = urlPath.replace(/^\/+/, "").split("/").join(path.sep);
  const full = path.normalize(path.join(ROOT, relative));
  if (!full.startsWith(ROOT)) {
    return null;
  }
  return full;
}

function resolveSiblingHtmlForDirectory(dirPath) {
  const dirName = path.basename(dirPath);
  const siblingHtml = path.join(path.dirname(dirPath), dirName + ".html");
  if (fs.existsSync(siblingHtml) && fs.statSync(siblingHtml).isFile()) {
    return siblingHtml;
  }
  return null;
}

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function get404Fallback(urlPath) {
  const normalized = (urlPath || "/").replace(/\/+$/, "") || "/";
  if (normalized.startsWith("/en") && normalized !== "/en/404") {
    return safeFilePath("/en/404.html");
  }
  return safeFilePath("/404.html");
}

function servePath(res, urlPath) {
  let filePath = safeFilePath(urlPath);
  if (!filePath) {
    res.writeHead(403).end("Forbidden");
    return;
  }

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const index = path.join(filePath, "index.html");
    if (fs.existsSync(index)) {
      filePath = index;
    } else {
      const siblingHtml = resolveSiblingHtmlForDirectory(filePath);
      if (siblingHtml) {
        filePath = siblingHtml;
      } else {
        res.writeHead(404).end("Not found");
        return;
      }
    }
  } else if (!fs.existsSync(filePath) && !path.extname(filePath)) {
    const withHtml = filePath + ".html";
    if (fs.existsSync(withHtml)) {
      filePath = withHtml;
    }
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const fallback = get404Fallback(urlPath.startsWith("/") ? urlPath : "/" + urlPath);
    if (fallback && fs.existsSync(fallback)) {
      res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
      fs.createReadStream(fallback).pipe(res);
      return;
    }
    res.writeHead(404).end("Not found");
    return;
  }

  sendFile(res, filePath);
}

const server = http.createServer(function (req, res) {
  const vercel = loadVercelConfig();
  const url = new URL(req.url, "http://localhost");
  let pathname = normalizePathname(url.pathname);

  const redirect = matchRedirect(pathname, vercel);
  if (redirect) {
    const location = redirect + (url.search || "");
    res.writeHead(302, { Location: location });
    res.end();
    return;
  }

  pathname = normalizePathname(applyRewrite(pathname, vercel));
  servePath(res, pathname);
});

server.listen(PORT, function () {
  console.log("Studio Pilates — serveur local (rewrites Vercel)");
  console.log("http://localhost:" + PORT + "/");
  console.log("http://localhost:" + PORT + "/classes");
  console.log("http://localhost:" + PORT + "/planning");
  console.log("http://localhost:" + PORT + "/en/classes");
  console.log("Racine: " + ROOT);
});
