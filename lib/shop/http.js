function readRawBody(req) {
  if (Buffer.isBuffer(req.rawBody)) return Promise.resolve(req.rawBody);
  if (typeof req.rawBody === "string") return Promise.resolve(Buffer.from(req.rawBody));
  if (Buffer.isBuffer(req.body)) return Promise.resolve(req.body);
  if (typeof req.body === "string") return Promise.resolve(Buffer.from(req.body));
  if (req.body && typeof req.body === "object" && !isReadableStream(req)) {
    return Promise.resolve(Buffer.from(JSON.stringify(req.body)));
  }

  return new Promise(function (resolve, reject) {
    const chunks = [];
    req.on("data", function (chunk) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on("end", function () {
      resolve(Buffer.concat(chunks));
    });
    req.on("error", reject);
  });
}

function isReadableStream(req) {
  return typeof req.on === "function";
}

async function readJsonBody(req) {
  if (req.body && typeof req.body === "object" && !Buffer.isBuffer(req.body)) {
    return req.body;
  }
  const raw = await readRawBody(req);
  if (!raw.length) return {};
  return JSON.parse(raw.toString("utf8"));
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(JSON.stringify(payload));
}

function isAllowedOrigin(req) {
  const origin = req.headers.origin || "";
  if (!origin) return true;
  try {
    const host = new URL(origin).hostname;
    return (
      host === "www.studiopilatesnarbonne.com" ||
      host === "studiopilatesnarbonne.com" ||
      host === "localhost" ||
      host === "127.0.0.1" ||
      host.endsWith(".vercel.app")
    );
  } catch (_err) {
    return false;
  }
}

function siteOrigin(req) {
  if (process.env.SHOP_SITE_ORIGIN) {
    return process.env.SHOP_SITE_ORIGIN.replace(/\/+$/, "");
  }
  const host = String(req.headers["x-forwarded-host"] || req.headers.host || "");
  if (/^localhost(:\d+)?$/i.test(host) || /^127\.0\.0\.1(:\d+)?$/.test(host)) {
    return "http://" + host;
  }
  return "https://www.studiopilatesnarbonne.com";
}

module.exports = {
  readRawBody,
  readJsonBody,
  json,
  siteOrigin,
  isAllowedOrigin,
};
