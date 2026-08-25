const { json, readJsonBody } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const { listStudents, grantCredits } = require("../../../../lib/studio/students");
const { withStudioStore } = require("../../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    return json(res, 200, { students: listStudents() });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  const result = grantCredits(body);
  if (!result.ok) {
    return json(res, result.status, { error: result.error });
  }
  return json(res, 200, {
    order: result.order,
    students: listStudents(),
  });
}

module.exports = withStudioStore(handler);
