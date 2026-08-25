function pad(n) {
  return String(n).padStart(2, "0");
}

function parseISODate(iso) {
  const parts = String(iso || "").slice(0, 10).split("-").map(Number);
  if (parts.length < 3 || !parts[0]) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

function formatDate(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function addMonths(iso, months) {
  const date = parseISODate(iso);
  if (!date) return iso;
  date.setMonth(date.getMonth() + Number(months || 0));
  return formatDate(date);
}

function todayISO() {
  return formatDate(new Date());
}

function inferKind(productId, title) {
  const s = String(productId || "") + " " + String(title || "");
  return /reformer/i.test(s) ? "reformer" : "mat";
}

function kindLabel(kind) {
  return kind === "reformer" ? "Reformer" : "Mat / Yoga";
}

module.exports = {
  parseISODate,
  formatDate,
  addMonths,
  todayISO,
  inferKind,
  kindLabel,
};
