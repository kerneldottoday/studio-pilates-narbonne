const { json, readJsonBody } = require("../../../../lib/shop/http");
const { requireAdmin } = require("../../../../lib/studio/auth");
const { loadCatalog, saveCatalog, loadBookings } = require("../../../../lib/studio/store");
const { normalizeSlot } = require("../../../../lib/studio/validate");
const {
  bookSeat,
  cancelSeat,
  setAttendance,
  promoteBooking,
  publicSessions,
} = require("../../../../lib/studio/booking");
const { withStudioStore } = require("../../../../lib/studio/with-store");

async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", "GET, PUT, POST, PATCH, OPTIONS");
    res.statusCode = 204;
    return res.end();
  }
  if (!requireAdmin(req, res)) return;

  if (req.method === "GET") {
    const catalog = loadCatalog();
    const sessions = publicSessions();
    return json(res, 200, {
      schedule: catalog.schedule || [],
      bookings: loadBookings(),
      occurrences: sessions.occurrences,
      rentree: sessions.rentree,
    });
  }

  let body;
  try {
    body = await readJsonBody(req);
  } catch (_err) {
    return json(res, 400, { error: "JSON invalide" });
  }

  if (req.method === "PUT") {
    const raw = Array.isArray(body && body.schedule) ? body.schedule : [];
    const schedule = [];
    const ids = new Set();
    for (let i = 0; i < raw.length; i += 1) {
      const slot = normalizeSlot(raw[i]);
      if (!slot) {
        return json(res, 400, { error: "Créneau invalide (ligne " + (i + 1) + ")" });
      }
      if (ids.has(slot.id)) {
        return json(res, 400, { error: "Créneau dupliqué : " + slot.id });
      }
      ids.add(slot.id);
      schedule.push(slot);
    }
    const catalog = loadCatalog();
    catalog.schedule = schedule;
    saveCatalog(catalog);
    return json(res, 200, { schedule: schedule });
  }

  if (req.method === "PATCH") {
    const action = String((body && body.action) || "cancel");
    if (action === "promote") {
      const result = promoteBooking(body.bookingId);
      if (!result.ok) {
        return json(res, result.status, { error: result.error, code: result.code });
      }
      return json(res, 200, { booking: result.booking });
    }
    if (action === "attend" || action === "noshow" || action === "booked") {
      const status = action === "attend" ? "attended" : action === "noshow" ? "noshow" : "booked";
      const result = setAttendance(body.bookingId, status);
      if (!result.ok) {
        return json(res, result.status, { error: result.error, code: result.code });
      }
      return json(res, 200, { booking: result.booking, promoted: result.promoted || null });
    }
    const result = cancelSeat(body.bookingId, null, true);
    if (!result.ok) {
      return json(res, result.status, { error: result.error });
    }
    return json(res, 200, { booking: result.booking, promoted: result.promoted || null });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, PUT, POST, PATCH, OPTIONS");
    return json(res, 405, { error: "Method Not Allowed" });
  }

  const result = bookSeat({
    email: body.email,
    name: body.name,
    phone: body.phone,
    occurrenceId: body.occurrenceId,
    skipCredit: body.skipCredit !== false,
    source: "admin",
    note: body.note,
  });
  if (!result.ok) {
    return json(res, result.status, { error: result.error, code: result.code });
  }
  return json(res, 200, {
    booking: result.booking,
    waitlist: Boolean(result.waitlist) || (result.booking && result.booking.status === "waitlist"),
  });
}

module.exports = withStudioStore(handler);
