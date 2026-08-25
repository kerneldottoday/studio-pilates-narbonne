/** Règles d’annulation et d’occupation, fuseau Europe/Paris. */

const DEFAULT_CANCEL_HOURS = 8;
const PARIS = "Europe/Paris";

const CONSUMING = {
  booked: true,
  attended: true,
  noshow: true,
};

const OCCUPYING = {
  booked: true,
  attended: true,
};

function clockNow() {
  const raw = process.env.STUDIO_NOW;
  if (raw) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) return date;
  }
  return new Date();
}

function tzParts(ms) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: PARIS,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = {};
  fmt.formatToParts(new Date(ms)).forEach(function (part) {
    if (part.type !== "literal") parts[part.type] = part.value;
  });
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

function parisMs(dateISO, hhmm) {
  const bits = String(dateISO || "").slice(0, 10).split("-").map(Number);
  const time = String(hhmm || "00:00").split(":");
  const year = bits[0];
  const month = bits[1];
  const day = bits[2];
  const hour = Number(time[0]) || 0;
  const minute = Number(time[1]) || 0;
  if (!year || !month || !day) return NaN;
  const wanted = Date.UTC(year, month - 1, day, hour, minute, 0);
  let utc = wanted;
  for (let i = 0; i < 4; i += 1) {
    const paris = tzParts(utc);
    const asIf = Date.UTC(
      paris.year,
      paris.month - 1,
      paris.day,
      paris.hour,
      paris.minute,
      paris.second
    );
    utc -= asIf - wanted;
  }
  return utc;
}

function occurrenceMs(occ) {
  if (!occ) return NaN;
  return parisMs(occ.date, occ.start);
}

function occurrenceEndMs(occ) {
  if (!occ) return NaN;
  const end = parisMs(occ.date, occ.end || occ.start);
  if (!Number.isFinite(end)) return NaN;
  const start = occurrenceMs(occ);
  if (Number.isFinite(start) && end <= start) {
    return end + 24 * 3600 * 1000;
  }
  return end;
}

function isEndedOccurrence(occ, now) {
  const end = occurrenceEndMs(occ);
  if (!Number.isFinite(end)) return true;
  return (now || clockNow()).getTime() >= end;
}

function normalizeCancelHours(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 168) return DEFAULT_CANCEL_HOURS;
  return n;
}

function cancelHoursFrom(catalog) {
  return normalizeCancelHours(catalog && catalog.cancelHours);
}

function cancelUntilMs(occ, cancelHours) {
  return occurrenceMs(occ) - normalizeCancelHours(cancelHours) * 3600 * 1000;
}

function studentCanCancel(occ, cancelHours, now) {
  const start = occurrenceMs(occ);
  if (!Number.isFinite(start)) return false;
  const t = (now || clockNow()).getTime();
  return t < cancelUntilMs(occ, cancelHours);
}

function isPastOccurrence(occ, now) {
  const start = occurrenceMs(occ);
  if (!Number.isFinite(start)) return true;
  return (now || clockNow()).getTime() >= start;
}

function consumesCredit(booking) {
  return Boolean(booking && CONSUMING[booking.status] && booking.creditOrderId);
}

function occupiesSeat(booking) {
  return Boolean(booking && OCCUPYING[booking.status]);
}

function statusLabel(status) {
  if (status === "attended") return "Présente";
  if (status === "noshow") return "Absente";
  if (status === "cancelled") return "Annulée";
  if (status === "waitlist") return "File d’attente";
  return "Inscrite";
}

module.exports = {
  DEFAULT_CANCEL_HOURS,
  clockNow,
  parisMs,
  occurrenceMs,
  occurrenceEndMs,
  isEndedOccurrence,
  normalizeCancelHours,
  cancelHoursFrom,
  cancelUntilMs,
  studentCanCancel,
  isPastOccurrence,
  consumesCredit,
  occupiesSeat,
  statusLabel,
};
