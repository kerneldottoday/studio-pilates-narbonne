/**
 * Bilan mensuel pour Souhila : chiffre d'affaires, séances données,
 * remplissage, présences/absences, élèves actives et crédits encore
 * valides. Lecture seule (le pointage auto est appliqué comme partout).
 */
const {
  loadCatalog,
  loadOrders,
  loadBookings,
  loadClosures,
} = require("./store");
const { listOccurrences } = require("./sessions");
const { activeClosure } = require("./closures");
const { walletForEmail } = require("./credits");
const { settleAttendance } = require("./booking");
const { clockNow, occurrenceEndMs } = require("./policy");

const MONTH_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

function slotSortKey(schedule, slotId) {
  const idx = (schedule || []).findIndex(function (slot) {
    return slot.id === slotId;
  });
  return idx < 0 ? 999 : idx;
}

function monthlyReport(month, now) {
  const when = now ? new Date(now) : clockNow();
  const wanted = String(month || "").slice(0, 7);
  if (!MONTH_RE.test(wanted)) {
    return { ok: false, status: 400, error: "Mois invalide (format AAAA-MM)" };
  }
  settleAttendance(when);

  const catalog = loadCatalog();
  const orders = loadOrders();
  const bookings = loadBookings();
  const closures = loadClosures();

  const byOcc = {};
  bookings.forEach(function (booking) {
    if (!booking) return;
    (byOcc[booking.occurrenceId] = byOcc[booking.occurrenceId] || []).push(booking);
  });

  let held = 0;
  let upcoming = 0;
  let cancelledSessions = 0;
  let seats = 0;
  let capacity = 0;
  let attended = 0;
  let noshow = 0;
  let bookedFuture = 0;
  const bySlot = {};
  const activeEmails = {};

  listOccurrences(catalog.schedule).forEach(function (occ) {
    if (occ.date.slice(0, 7) !== wanted) return;
    const agg = (bySlot[occ.slotId] = bySlot[occ.slotId] || {
      slotId: occ.slotId,
      day: occ.weekday,
      start: occ.start,
      title: occ.title,
      sessions: 0,
      cancelled: 0,
      booked: 0,
      capacity: 0,
      attended: 0,
      noshow: 0,
    });
    if (activeClosure(closures, occ)) {
      cancelledSessions += 1;
      agg.cancelled += 1;
      return;
    }
    const list = byOcc[occ.id] || [];
    let att = 0;
    let ns = 0;
    let bk = 0;
    list.forEach(function (booking) {
      if (booking.status === "attended") att += 1;
      else if (booking.status === "noshow") ns += 1;
      else if (booking.status === "booked") bk += 1;
      else return;
      activeEmails[String(booking.email || "").toLowerCase()] = true;
    });
    const past = occurrenceEndMs(occ) <= when.getTime();
    if (past) held += 1;
    else upcoming += 1;
    const occSeats = att + ns + bk;
    agg.sessions += 1;
    agg.booked += occSeats;
    agg.capacity += occ.capacity;
    agg.attended += att;
    agg.noshow += ns;
    seats += occSeats;
    capacity += occ.capacity;
    attended += att;
    noshow += ns;
    if (!past) bookedFuture += bk;
  });

  let realCents = 0;
  let realCount = 0;
  let mockCents = 0;
  let mockCount = 0;
  let adjustments = 0;
  orders.forEach(function (order) {
    if (!order || String(order.createdAt || "").slice(0, 7) !== wanted) return;
    if (order.type === "credit-adjust") {
      adjustments += 1;
      return;
    }
    if (order.mock) {
      mockCents += Number(order.totalCents) || 0;
      mockCount += 1;
    } else {
      realCents += Number(order.totalCents) || 0;
      realCount += 1;
    }
  });

  const firstOrderByEmail = {};
  orders.forEach(function (order) {
    if (!order || order.type === "credit-adjust") return;
    const email = String(order.customerEmail || "").toLowerCase();
    if (!email) return;
    const created = String(order.createdAt || "");
    if (!firstOrderByEmail[email] || created < firstOrderByEmail[email]) {
      firstOrderByEmail[email] = created;
    }
  });
  const newBuyers = Object.keys(firstOrderByEmail).filter(function (email) {
    return firstOrderByEmail[email].slice(0, 7) === wanted;
  }).length;

  const buyerEmails = {};
  orders.forEach(function (order) {
    const email = String((order && order.customerEmail) || "").toLowerCase();
    if (email) buyerEmails[email] = true;
  });
  let creditsReformer = 0;
  let creditsMat = 0;
  Object.keys(buyerEmails).forEach(function (email) {
    const wallet = walletForEmail(email, orders, bookings, catalog.products);
    creditsReformer += wallet.reformer;
    creditsMat += wallet.mat;
  });

  const slots = Object.keys(bySlot)
    .map(function (key) {
      return bySlot[key];
    })
    .sort(function (a, b) {
      return slotSortKey(catalog.schedule, a.slotId) - slotSortKey(catalog.schedule, b.slotId);
    });

  return {
    ok: true,
    month: wanted,
    generatedAt: when.toISOString(),
    revenue: {
      realCents: realCents,
      realCount: realCount,
      mockCents: mockCents,
      mockCount: mockCount,
      adjustments: adjustments,
    },
    sessions: {
      held: held,
      upcoming: upcoming,
      cancelled: cancelledSessions,
      seats: seats,
      capacity: capacity,
      fillRate: capacity ? seats / capacity : 0,
      attended: attended,
      noshow: noshow,
      bookedFuture: bookedFuture,
    },
    students: {
      active: Object.keys(activeEmails).length,
      newBuyers: newBuyers,
    },
    credits: {
      reformer: creditsReformer,
      mat: creditsMat,
    },
    slots: slots,
  };
}

module.exports = { monthlyReport };
