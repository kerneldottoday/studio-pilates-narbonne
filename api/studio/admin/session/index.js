const { json, readJsonBody, isAllowedOrigin } = require("../../../../lib/shop/http");
const {
  isAdmin,
  loginSetCookie,
  logoutSetCookie,
} = require("../../../../lib/studio/auth");

module.exports = async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }

  if (req.method === "GET") {
    return json(res, 200, { admin: isAdmin(req) });
  }

  if (req.method === "DELETE") {
    logoutSetCookie(res, req);
    return json(res, 200, { admin: false });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, DELETE, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  if (!isAllowedOrigin(req)) {
    return json(res, 403, { error: "Origine non autorisée" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  const password = String((body && body.password) || "");
  if (!loginSetCookie(res, password, req)) {
    return json(res, 401, { error: "Mot de passe incorrect", code: "ADMIN_AUTH" });
  }
  return json(res, 200, { admin: true });
};
