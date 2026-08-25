const {
  loadCatalog,
  loadOrders,
  loadBookings,
  addBooking,
  saveBookings,
  loadClosures,
} = require("./store");
const { activeClosure } = require("./closures");
const { recordNotice } = require("./notices");
const { isEmail } = require("./validate");
const { walletForEmail, pickLot } = require("./credits");
const { findOccurrence, listOccurrences } = require("./sessions");
const { kindLabel } = require("./dates");
const {
  clockNow,
  occurrenceMs,
  occurrenceEndMs,
  cancelHoursFrom,
  cancelUntilMs,
  studentCanCancel,
  isPastOccurrence,
  isEndedOccurrence,
  occupiesSeat,
  statusLabel,
} = require("./policy");

function activeOn(bookings, occurrenceId) {
  return (bookings || []).filter(function (booking) {
    return occupiesSeat(booking) && booking.occurrenceId === occurrenceId;
  });
}

function waitlistOn(bookings, occurrenceId) {
  return (bookings || [])
    .filter(function (booking) {
      return booking.status === "waitlist" && booking.occurrenceId === occurrenceId;
    })
    .sort(function (a, b) {
      return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
    });
}

function alreadyOn(bookings, occurrenceId, email) {
  const normalized = String(email || "").toLowerCase();
  return (bookings || []).some(function (booking) {
    if (String(booking.email || "").toLowerCase() !== normalized) return false;
    if (booking.occurrenceId !== occurrenceId) return false;
    return occupiesSeat(booking) || booking.status === "waitlist";
  });
}

function slotLabelFor(occ) {
  return occ.weekday + " " + occ.date + " · " + occ.start + " " + occ.title;
}

function decorateOccurrence(occ, bookings, catalog, now, closures) {
  const booked = activeOn(bookings, occ.id).length;
  const hours = cancelHoursFrom(catalog);
  const start = occurrenceMs(occ);
  const end = occurrenceEndMs(occ);
  const past = isPastOccurrence(occ, now);
  const waiting = waitlistOn(bookings, occ.id);
  const closure = activeClosure(closures || [], occ);
  return Object.assign({}, occ, {
    booked: booked,
    remaining: Math.max(0, occ.capacity - booked),
    waitlisted: waiting.length,
    startsAt: Number.isFinite(start) ? new Date(start).toISOString() : null,
    endsAt: Number.isFinite(end) ? new Date(end).toISOString() : null,
    past: past,
    ended: isEndedOccurrence(occ, now),
    closed: Boolean(closure),
    closedReason: (closure && closure.reason) || "",
    closureId: (closure && closure.id) || null,
    open: !past && !closure,
    cancelUntil: Number.isFinite(start)
      ? new Date(cancelUntilMs(occ, hours)).toISOString()
      : null,
  });
}

function decorateBooking(booking, catalog, now) {
  const occ = findOccurrence(catalog.schedule, booking.occurrenceId);
  const hours = cancelHoursFrom(catalog);
  const canCancel =
    booking.status === "booked" && occ && studentCanCancel(occ, hours, now);
  const until = occ ? cancelUntilMs(occ, hours) : null;
  const start = occ ? occurrenceMs(occ) : NaN;
  let waitlistPosition = null;
  if (booking.status === "waitlist" && occ) {
    const queue = waitlistOn(loadBookings(), occ.id);
    const idx = queue.findIndex(function (item) {
      return item.id === booking.id;
    });
    waitlistPosition = idx >= 0 ? idx + 1 : null;
  }
  return Object.assign({}, booking, {
    canCancel: Boolean(canCancel),
    canLeaveWaitlist: booking.status === "waitlist",
    waitlistPosition: waitlistPosition,
    cancelUntil: Number.isFinite(until) ? new Date(until).toISOString() : null,
    startsAt: Number.isFinite(start) ? new Date(start).toISOString() : null,
    statusLabel: statusLabel(booking.status),
  });
}

function occurrenceIndex() {
  const catalog = loadCatalog();
  const map = {};
  listOccurrences(catalog.schedule).forEach(function (occ) {
    map[occ.id] = occ;
  });
  return { catalog: catalog, map: map };
}

function settleAttendance(now) {
  const when = now ? new Date(now) : clockNow();
  const t = when.getTime();
  const index = occurrenceIndex();
  const list = loadBookings();
  let noshows = 0;
  let expiredWait = 0;
  let changed = false;
  for (let i = 0; i < list.length; i += 1) {
    const booking = list[i];
    if (!booking) continue;
    const occ = index.map[booking.occurrenceId];
    if (!occ) continue;
    const start = occurrenceMs(occ);
    const end = occurrenceEndMs(occ);
    if (booking.status === "waitlist" && Number.isFinite(start) && t >= start) {
      list[i] = Object.assign({}, booking, {
        status: "cancelled",
        cancelledAt: when.toISOString(),
        cancelledBy: "system",
        cancelReason: "class-started",
      });
      recordNotice("wait-expired", list[i]);
      expiredWait += 1;
      changed = true;
      continue;
    }
    if (booking.status === "booked" && Number.isFinite(end) && t >= end) {
      list[i] = Object.assign({}, booking, {
        status: "noshow",
        checkedAt: when.toISOString(),
        autoNoshow: true,
      });
      recordNotice("noshow", list[i]);
      noshows += 1;
      changed = true;
    }
  }
  if (changed) saveBookings(list);
  return { ok: true, noshows: noshows, expiredWait: expiredWait };
}

function publicSessions(now) {
  settleAttendance(now);
  const catalog = loadCatalog();
  const bookings = loadBookings();
  const closures = loadClosures();
  const hours = cancelHoursFrom(catalog);
  return {
    rentree: require("./defaults").RENTREE,
    cancelHours: hours,
    occurrences: listOccurrences(catalog.schedule).map(function (occ) {
      return decorateOccurrence(occ, bookings, catalog, now, closures);
    }),
  };
}

function accountFor(email, now) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!isEmail(normalized)) {
    return { ok: false, status: 400, error: "E-mail invalide" };
  }
  settleAttendance(now);
  const catalog = loadCatalog();
  const orders = loadOrders();
  const bookings = loadBookings();
  const wallet = walletForEmail(normalized, orders, bookings, catalog.products);
  const mine = bookings.filter(function (booking) {
    return String(booking.email || "").toLowerCase() === normalized;
  });
  const order = orders.find(function (item) {
    return String(item.customerEmail || "").toLowerCase() === normalized;
  });
  return {
    ok: true,
    email: normalized,
    name: (order && order.customerName) || "",
    cancelHours: cancelHoursFrom(catalog),
    credits: { reformer: wallet.reformer, mat: wallet.mat },
    lots: wallet.lots,
    bookings: mine.map(function (booking) {
      return decorateBooking(booking, catalog, now);
    }),
  };
}

function bookSeat(input) {
  const email = String((input && input.email) || "").trim().toLowerCase();
  const name = String((input && input.name) || "").trim();
  const phone = String((input && input.phone) || "").trim().slice(0, 30);
  const occurrenceId = String((input && input.occurrenceId) || "").trim();
  const skipCredit = Boolean(input && input.skipCredit);
  const source = (input && input.source) === "admin" ? "admin" : "student";
  const note = String((input && input.note) || "").trim().slice(0, 300);
  const now = input && input.now ? new Date(input.now) : clockNow();
  settleAttendance(now);

  if (!isEmail(email)) {
    return { ok: false, status: 400, error: "E-mail invalide" };
  }
  if (name.length < 2) {
    return { ok: false, status: 400, error: "Indiquez le nom" };
  }
  if (!occurrenceId) {
    return { ok: false, status: 400, error: "Créneau manquant" };
  }

  const catalog = loadCatalog();
  const occ = findOccurrence(catalog.schedule, occurrenceId);
  if (!occ) {
    return { ok: false, status: 404, error: "Créneau introuvable" };
  }
  if (source !== "admin" && isPastOccurrence(occ, now)) {
    return { ok: false, status: 409, error: "Ce cours est déjà passé", code: "PAST" };
  }
  const closure = activeClosure(loadClosures(), occ);
  if (closure) {
    return {
      ok: false,
      status: 409,
      error:
        "Ce cours est annulé" +
        (closure.reason ? " — " + closure.reason : "") +
        ". Rouvrez la fermeture pour inscrire quelqu’un.",
      code: "CLOSED",
    };
  }

  const bookings = loadBookings();
  if (alreadyOn(bookings, occurrenceId, email)) {
    return { ok: false, status: 409, error: "Déjà inscrit·e sur ce cours" };
  }

  const taken = activeOn(bookings, occurrenceId);
  if (taken.length >= occ.capacity) {
    if (input && input.waitlist) {
      return joinWaitlist(input);
    }
    if (source === "admin") {
      return joinWaitlist(Object.assign({}, input, { waitlist: true }));
    }
    return {
      ok: false,
      status: 409,
      error: "Ce cours est complet. Vous pouvez vous inscrire en liste d’attente.",
      code: "FULL",
    };
  }

  let creditOrderId = null;
  if (!skipCredit) {
    const wallet = walletForEmail(email, loadOrders(), bookings, catalog.products);
    const lot = pickLot(wallet, occ.kind);
    if (!lot) {
      return {
        ok: false,
        status: 403,
        error:
          "Pas de crédit " +
          kindLabel(occ.kind) +
          " disponible. Achetez une formule d’abord.",
        code: "NO_CREDIT",
      };
    }
    creditOrderId = lot.orderId;
  }

  const booking = addBooking({
    id: "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    status: "booked",
    createdAt: now.toISOString(),
    occurrenceId: occ.id,
    date: occ.date,
    slotId: occ.slotId,
    slotLabel: slotLabelFor(occ),
    kind: occ.kind,
    name: name,
    email: email,
    phone: phone,
    creditOrderId: creditOrderId,
    source: source,
    note: note,
    skipCredit: skipCredit,
  });
  recordNotice("booked", booking);
  return { ok: true, booking: booking };
}

function cancelSeat(bookingId, email, asAdmin, now) {
  const id = String(bookingId || "");
  const when = now ? new Date(now) : clockNow();
  settleAttendance(when);
  const list = loadBookings();
  const idx = list.findIndex(function (item) {
    return item && item.id === id;
  });
  if (idx < 0) {
    return { ok: false, status: 404, error: "Réservation introuvable" };
  }
  const booking = list[idx];
  if (!asAdmin) {
    const normalized = String(email || "").trim().toLowerCase();
    if (String(booking.email || "").toLowerCase() !== normalized) {
      return { ok: false, status: 403, error: "Cette réservation ne vous appartient pas" };
    }
    if (booking.status === "waitlist") {
      /* on peut toujours quitter la file */
    } else if (booking.status !== "booked") {
      return { ok: false, status: 409, error: "Cette réservation ne peut plus être annulée" };
    } else {
      const catalog = loadCatalog();
      const occ = findOccurrence(catalog.schedule, booking.occurrenceId);
      if (!occ || !studentCanCancel(occ, cancelHoursFrom(catalog), when)) {
        const hours = cancelHoursFrom(catalog);
        return {
          ok: false,
          status: 403,
          error:
            "Trop tard pour annuler (délai de " +
            hours +
            " h avant le cours). Le crédit reste utilisé. Souhila peut vous retirer depuis l’admin.",
          code: "LATE_CANCEL",
        };
      }
    }
  } else if (booking.status === "cancelled") {
    return { ok: false, status: 409, error: "Déjà annulée" };
  }
  const wasWait = booking.status === "waitlist";
  const wasOccupying = occupiesSeat(booking);
  const occurrenceId = booking.occurrenceId;
  list[idx] = Object.assign({}, booking, {
    status: "cancelled",
    cancelledAt: when.toISOString(),
    cancelledBy: asAdmin ? "admin" : "student",
  });
  saveBookings(list);
  recordNotice(wasWait ? "leave-waitlist" : "cancelled", list[idx]);
  const promoted = wasOccupying ? promoteNext(occurrenceId, when) : null;
  return { ok: true, booking: list[idx], promoted: promoted && promoted.booking };
}

function setAttendance(bookingId, status, now) {
  const allowed = { attended: true, noshow: true, booked: true };
  if (!allowed[status]) {
    return { ok: false, status: 400, error: "Statut de présence invalide" };
  }
  const when = now ? new Date(now) : clockNow();
  settleAttendance(when);
  const list = loadBookings();
  const idx = list.findIndex(function (item) {
    return item && item.id === bookingId;
  });
  if (idx < 0) {
    return { ok: false, status: 404, error: "Réservation introuvable" };
  }
  const booking = list[idx];
  if (booking.status === "cancelled") {
    return { ok: false, status: 409, error: "Réservation annulée" };
  }
  if (booking.status === "waitlist") {
    return {
      ok: false,
      status: 409,
      error: "Cette personne est en file d’attente. Inscrivez-la d’abord.",
    };
  }
  if (status === "booked" && booking.status === "noshow") {
    const taken = activeOn(list, booking.occurrenceId).length;
    const catalog = loadCatalog();
    const occ = findOccurrence(catalog.schedule, booking.occurrenceId);
    const capacity = occ ? occ.capacity : 6;
    if (taken >= capacity) {
      return { ok: false, status: 409, error: "Ce cours est complet" };
    }
  }
  const wasOccupying = occupiesSeat(booking);
  list[idx] = Object.assign({}, booking, {
    status: status,
    checkedAt: when.toISOString(),
  });
  saveBookings(list);
  if (status === "noshow") recordNotice("noshow", list[idx]);
  const freed = wasOccupying && !occupiesSeat(list[idx]);
  const promoted = freed ? promoteNext(booking.occurrenceId, when) : null;
  return { ok: true, booking: list[idx], promoted: promoted && promoted.booking };
}

function joinWaitlist(input) {
  const email = String((input && input.email) || "").trim().toLowerCase();
  const name = String((input && input.name) || "").trim();
  const phone = String((input && input.phone) || "").trim().slice(0, 30);
  const occurrenceId = String((input && input.occurrenceId) || "").trim();
  const skipCredit = Boolean(input && input.skipCredit);
  const source = (input && input.source) === "admin" ? "admin" : "student";
  const note = String((input && input.note) || "").trim().slice(0, 300);
  const now = input && input.now ? new Date(input.now) : clockNow();
  settleAttendance(now);

  if (!isEmail(email) || name.length < 2 || !occurrenceId) {
    return { ok: false, status: 400, error: "Inscription incomplète" };
  }

  const catalog = loadCatalog();
  const occ = findOccurrence(catalog.schedule, occurrenceId);
  if (!occ) {
    return { ok: false, status: 404, error: "Créneau introuvable" };
  }
  if (source !== "admin" && isPastOccurrence(occ, now)) {
    return { ok: false, status: 409, error: "Ce cours est déjà passé", code: "PAST" };
  }
  const closure = activeClosure(loadClosures(), occ);
  if (closure) {
    return {
      ok: false,
      status: 409,
      error:
        "Ce cours est annulé" +
        (closure.reason ? " — " + closure.reason : "") +
        ".",
      code: "CLOSED",
    };
  }

  const bookings = loadBookings();
  if (alreadyOn(bookings, occurrenceId, email)) {
    return { ok: false, status: 409, error: "Déjà inscrit·e sur ce cours" };
  }
  if (activeOn(bookings, occurrenceId).length < occ.capacity) {
    return bookSeat(Object.assign({}, input, { waitlist: false }));
  }
  if (!skipCredit) {
    const wallet = walletForEmail(email, loadOrders(), bookings, catalog.products);
    if (!pickLot(wallet, occ.kind)) {
      return {
        ok: false,
        status: 403,
        error:
          "Pas de crédit " +
          kindLabel(occ.kind) +
          " disponible. Achetez une formule avant de rejoindre la file.",
        code: "NO_CREDIT",
      };
    }
  }

  const booking = addBooking({
    id: "bk_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    status: "waitlist",
    createdAt: now.toISOString(),
    occurrenceId: occ.id,
    date: occ.date,
    slotId: occ.slotId,
    slotLabel: slotLabelFor(occ),
    kind: occ.kind,
    name: name,
    email: email,
    phone: phone,
    creditOrderId: null,
    source: source,
    note: note,
    skipCredit: skipCredit,
  });
  recordNotice("waitlist", booking);
  return { ok: true, booking: booking, waitlist: true };
}

function promoteNext(occurrenceId, now) {
  const catalog = loadCatalog();
  const occ = findOccurrence(catalog.schedule, occurrenceId);
  const when = now ? new Date(now) : clockNow();
  if (!occ || isPastOccurrence(occ, when)) {
    return { ok: true, booking: null };
  }
  if (activeClosure(loadClosures(), occ)) {
    return { ok: true, booking: null };
  }
  const list = loadBookings();
  if (activeOn(list, occurrenceId).length >= occ.capacity) {
    return { ok: true, booking: null };
  }
  const queue = waitlistOn(list, occurrenceId);
  const orders = loadOrders();
  let chosen = null;
  for (let i = 0; i < queue.length; i += 1) {
    const waiting = queue[i];
    if (waiting.skipCredit || waiting.source === "admin") {
      chosen = { waiting: waiting, lot: null };
      break;
    }
    const wallet = walletForEmail(waiting.email, orders, list, catalog.products);
    const lot = pickLot(wallet, occ.kind);
    if (lot) {
      chosen = { waiting: waiting, lot: lot };
      break;
    }
  }
  if (!chosen) {
    return { ok: true, booking: null };
  }
  const idx = list.findIndex(function (item) {
    return item && item.id === chosen.waiting.id;
  });
  if (idx < 0) {
    return { ok: true, booking: null };
  }
  list[idx] = Object.assign({}, list[idx], {
    status: "booked",
    creditOrderId: chosen.lot ? chosen.lot.orderId : list[idx].creditOrderId,
    promotedAt: when.toISOString(),
  });
  saveBookings(list);
  recordNotice("promoted", list[idx]);
  return { ok: true, booking: list[idx] };
}

function promoteBooking(bookingId, now) {
  const when = now ? new Date(now) : clockNow();
  const list = loadBookings();
  const idx = list.findIndex(function (item) {
    return item && item.id === bookingId;
  });
  if (idx < 0) {
    return { ok: false, status: 404, error: "Réservation introuvable" };
  }
  const booking = list[idx];
  if (booking.status !== "waitlist") {
    return { ok: false, status: 409, error: "Pas en liste d’attente" };
  }
  const catalog = loadCatalog();
  const occ = findOccurrence(catalog.schedule, booking.occurrenceId);
  if (!occ) {
    return { ok: false, status: 404, error: "Créneau introuvable" };
  }
  if (activeClosure(loadClosures(), occ)) {
    return { ok: false, status: 409, error: "Ce cours est annulé par le studio", code: "CLOSED" };
  }
  if (activeOn(list, booking.occurrenceId).length >= occ.capacity) {
    return { ok: false, status: 409, error: "Ce cours est encore complet" };
  }
  let creditOrderId = booking.creditOrderId;
  if (!booking.skipCredit && booking.source !== "admin") {
    const wallet = walletForEmail(
      booking.email,
      loadOrders(),
      list,
      catalog.products
    );
    const lot = pickLot(wallet, occ.kind);
    if (!lot) {
      return {
        ok: false,
        status: 403,
        error: "Pas de crédit " + kindLabel(occ.kind) + " pour inscrire cette élève",
        code: "NO_CREDIT",
      };
    }
    creditOrderId = lot.orderId;
  }
  list[idx] = Object.assign({}, booking, {
    status: "booked",
    creditOrderId: creditOrderId,
    promotedAt: when.toISOString(),
  });
  saveBookings(list);
  recordNotice("promoted", list[idx]);
  return { ok: true, booking: list[idx] };
}

module.exports = {
  publicSessions,
  accountFor,
  bookSeat,
  cancelSeat,
  setAttendance,
  joinWaitlist,
  promoteNext,
  promoteBooking,
  settleAttendance,
  decorateOccurrence,
};
