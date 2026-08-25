const { RENTREE, SCHEDULE_WEEKS } = require("./defaults");
const { parseISODate, formatDate, inferKind } = require("./dates");

const DAY_INDEX = {
  Dimanche: 0,
  Lundi: 1,
  Mardi: 2,
  Mercredi: 3,
  Jeudi: 4,
  Vendredi: 5,
  Samedi: 6,
};

function firstOnOrAfter(fromDate, weekday) {
  const date = new Date(fromDate.getTime());
  while (date.getDay() !== weekday) {
    date.setDate(date.getDate() + 1);
  }
  return date;
}

function slotKind(slot) {
  if (slot && (slot.kind === "reformer" || slot.kind === "mat")) return slot.kind;
  return inferKind(slot && slot.id, slot && slot.title);
}

function listOccurrences(schedule, options) {
  const opts = options || {};
  const startIso = opts.from || RENTREE;
  const weeks = Number(opts.weeks || SCHEDULE_WEEKS);
  const start = parseISODate(startIso);
  if (!start) return [];
  const out = [];
  (schedule || []).forEach(function (slot) {
    const weekday = DAY_INDEX[slot.day];
    if (weekday == null) return;
    const cursor = firstOnOrAfter(start, weekday);
    for (let week = 0; week < weeks; week += 1) {
      const date = formatDate(cursor);
      const kind = slotKind(slot);
      out.push({
        id: slot.id + "_" + date,
        date: date,
        weekday: slot.day,
        slotId: slot.id,
        start: slot.start,
        end: slot.end,
        title: slot.title,
        level: slot.level,
        capacity: Number(slot.capacity) || 6,
        kind: kind,
      });
      cursor.setDate(cursor.getDate() + 7);
    }
  });
  out.sort(function (a, b) {
    return a.date === b.date
      ? String(a.start).localeCompare(String(b.start))
      : a.date.localeCompare(b.date);
  });
  return out;
}

function findOccurrence(schedule, occurrenceId) {
  return listOccurrences(schedule).find(function (item) {
    return item.id === occurrenceId;
  });
}

module.exports = {
  RENTREE,
  SCHEDULE_WEEKS,
  listOccurrences,
  findOccurrence,
  slotKind,
};
