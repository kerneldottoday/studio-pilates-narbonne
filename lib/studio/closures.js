/**
 * Fermetures du studio : une séance annulée (from = to + slotId) ou une
 * période de vacances (plage de dates, slotId vide = tous les cours).
 * À la création, les élèves inscrites sur les séances à venir concernées
 * sont retirées (statut cancelled → crédit re-crédité par construction)
 * et un message est préparé pour chacune.
 */
const {
  loadClosures,
  saveClosures,
  loadCatalog,
  loadBookings,
  saveBookings,
} = require("./store");
const { recordNotice } = require("./notices");
const { listOccurrences } = require("./sessions");
const { clockNow, occurrenceMs, occupiesSeat } = require("./policy");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MAX_RANGE_DAYS = 370;

function matchesClosure(closure, date, slotId) {
  if (!closure) return false;
  if (closure.slotId && closure.slotId !== slotId) return false;
  return closure.from <= date && date <= closure.to;
}

function activeClosure(closures, occ) {
  if (!occ) return null;
  return (
    (closures || []).find(function (closure) {
      return matchesClosure(closure, occ.date, occ.slotId);
    }) || null
  );
}

function listClosures() {
  return loadClosures()
    .slice()
    .sort(function (a, b) {
      return String(a.from).localeCompare(String(b.from)) ||
        String(a.slotId || "").localeCompare(String(b.slotId || ""));
    });
}

function addClosure(input, now) {
  const when = now ? new Date(now) : clockNow();
  const from = String((input && input.from) || "").slice(0, 10);
  const to = String((input && input.to) || from).slice(0, 10) || from;
  const slotId = String((input && input.slotId) || "").trim() || null;
  const reason = String((input && input.reason) || "").trim().slice(0, 120);

  if (!DATE_RE.test(from) || !DATE_RE.test(to)) {
    return { ok: false, status: 400, error: "Dates invalides (AAAA-MM-JJ)" };
  }
  if (to < from) {
    return { ok: false, status: 400, error: "La date de fin est avant le début" };
  }
  if ((Date.parse(to) - Date.parse(from)) / 86400000 > MAX_RANGE_DAYS) {
    return { ok: false, status: 400, error: "Période trop longue (1 an max)" };
  }

  const catalog = loadCatalog();
  if (
    slotId &&
    !(catalog.schedule || []).some(function (slot) {
      return slot.id === slotId;
    })
  ) {
    return { ok: false, status: 404, error: "Créneau inconnu : " + slotId };
  }

  const closures = loadClosures();
  const duplicate = closures.some(function (closure) {
    return (
      closure.from === from &&
      closure.to === to &&
      (closure.slotId || null) === slotId
    );
  });
  if (duplicate) {
    return { ok: false, status: 409, error: "Cette fermeture existe déjà" };
  }

  const closure = {
    id: "cl_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    from: from,
    to: to,
    slotId: slotId,
    reason: reason,
    createdAt: when.toISOString(),
  };
  closures.push(closure);
  saveClosures(closures);

  // Cascade : retirer les inscrites et la file des séances à venir concernées.
  const occById = {};
  listOccurrences(catalog.schedule).forEach(function (occ) {
    occById[occ.id] = occ;
  });
  const list = loadBookings();
  let cancelled = 0;
  let waitRemoved = 0;
  for (let i = 0; i < list.length; i += 1) {
    const booking = list[i];
    if (!booking) continue;
    const wasWait = booking.status === "waitlist";
    if (!occupiesSeat(booking) && !wasWait) continue;
    if (!matchesClosure(closure, booking.date, booking.slotId)) continue;
    const occ = occById[booking.occurrenceId];
    const start = occ ? occurrenceMs(occ) : NaN;
    // Une séance déjà commencée ou passée n'est pas touchée : Souhila gère
    // les présences à la main dans ce cas.
    if (!Number.isFinite(start) || start <= when.getTime()) continue;
    list[i] = Object.assign({}, booking, {
      status: "cancelled",
      cancelledAt: when.toISOString(),
      cancelledBy: "studio",
      cancelReason: reason || "studio-ferme",
    });
    recordNotice(
      "class-cancelled",
      Object.assign({}, list[i], { wasWaitlist: wasWait, detail: reason })
    );
    if (wasWait) waitRemoved += 1;
    else cancelled += 1;
  }
  if (cancelled || waitRemoved) saveBookings(list);

  return { ok: true, closure: closure, cancelled: cancelled, waitRemoved: waitRemoved };
}

function removeClosure(id) {
  const closures = loadClosures();
  const idx = closures.findIndex(function (closure) {
    return closure && closure.id === String(id || "");
  });
  if (idx < 0) {
    return { ok: false, status: 404, error: "Fermeture introuvable" };
  }
  const removed = closures.splice(idx, 1)[0];
  saveClosures(closures);
  return { ok: true, closure: removed };
}

module.exports = {
  matchesClosure,
  activeClosure,
  listClosures,
  addClosure,
  removeClosure,
};
