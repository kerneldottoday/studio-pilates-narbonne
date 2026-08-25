/**
 * Rappels de la veille : pour chaque réservation confirmée sur un cours qui a
 * lieu demain (au sens Europe/Paris), prépare un message « rappel » dans le
 * journal (envoyé par e-mail seulement si l'envoi est activé). Idempotent :
 * un booking rappelé porte remindedAt et n'est plus repris.
 */
const { loadCatalog, loadBookings, saveBookings } = require("./store");
const { recordNotice } = require("./notices");
const { listOccurrences } = require("./sessions");
const { clockNow, occurrenceMs } = require("./policy");

function parisDateISO(date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Paris",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function runReminders(now) {
  const when = now ? new Date(now) : clockNow();
  const tomorrow = parisDateISO(new Date(when.getTime() + 24 * 3600 * 1000));

  const catalog = loadCatalog();
  const occById = {};
  listOccurrences(catalog.schedule).forEach(function (occ) {
    occById[occ.id] = occ;
  });

  const list = loadBookings();
  let reminded = 0;
  let changed = false;
  for (let i = 0; i < list.length; i += 1) {
    const booking = list[i];
    if (!booking || booking.status !== "booked") continue;
    if (booking.date !== tomorrow) continue;
    if (booking.remindedAt) continue;
    const occ = occById[booking.occurrenceId];
    if (!occ) continue;
    const start = occurrenceMs(occ);
    if (!Number.isFinite(start) || start <= when.getTime()) continue;
    list[i] = Object.assign({}, booking, { remindedAt: when.toISOString() });
    recordNotice("reminder", list[i]);
    reminded += 1;
    changed = true;
  }
  if (changed) saveBookings(list);
  return { ok: true, date: tomorrow, reminded: reminded };
}

module.exports = { runReminders };
