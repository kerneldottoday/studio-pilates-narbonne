const crypto = require("crypto");

const COOKIE = "spn_studio_admin";

function adminPassword() {
  const fromEnv = String(process.env.STUDIO_ADMIN_PASSWORD || "").trim();
  if (fromEnv) return fromEnv;
  if (process.env.VERCEL === "1") return "";
  return "souhila-local";
}

function tokenFor(password) {
  return crypto.createHmac("sha256", password).update("spn-studio-admin-v1").digest("hex");
}

function parseCookies(req) {
  const header = String(req.headers.cookie || "");
  const out = {};
  header.split(";").forEach(function (part) {
    const bits = part.split("=");
    if (bits.length >= 2) {
      out[bits[0].trim()] = decodeURIComponent(bits.slice(1).join("=").trim());
    }
  });
  return out;
}

function isAdmin(req) {
  const password = adminPassword();
  if (!password) return false;
  const cookies = parseCookies(req);
  return cookies[COOKIE] === tokenFor(password);
}

function cookieSecure(req) {
  const proto = String((req && req.headers && req.headers["x-forwarded-proto"]) || "");
  return proto === "https" ? "; Secure" : "";
}

function loginSetCookie(res, passwordAttempt, req) {
  const password = adminPassword();
  if (!password || passwordAttempt !== password) return false;
  const token = tokenFor(password);
  res.setHeader(
    "Set-Cookie",
    COOKIE +
      "=" +
      token +
      "; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800" +
      cookieSecure(req)
  );
  return true;
}

function logoutSetCookie(res, req) {
  res.setHeader(
    "Set-Cookie",
    COOKIE + "=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0" + cookieSecure(req)
  );
}

function requireAdmin(req, res) {
  if (isAdmin(req)) return true;
  const { json } = require("../shop/http");
  json(res, 401, { error: "Connexion admin requise", code: "ADMIN_AUTH" });
  return false;
}

module.exports = {
  adminPassword,
  isAdmin,
  loginSetCookie,
  logoutSetCookie,
  requireAdmin,
};
