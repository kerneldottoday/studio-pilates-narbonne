const { loadCatalog, loadOrders, loadBookings, addOrder } = require("./store");
const { recordNotice } = require("./notices");
const { walletForEmail } = require("./credits");
const { isEmail } = require("./validate");
const { statusLabel } = require("./policy");
const { settleAttendance } = require("./booking");

function newest(items, emailKey) {
  return (items || [])
    .filter(function (item) {
      return String(item[emailKey] || "").toLowerCase();
    })
    .sort(function (a, b) {
      return String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
    })[0] || null;
}

function emailsFrom(orders, bookings) {
  const set = {};
  (orders || []).forEach(function (order) {
    const email = String(order.customerEmail || "").trim().toLowerCase();
    if (email) set[email] = true;
  });
  (bookings || []).forEach(function (booking) {
    if (!booking || booking.status === "cancelled") return;
    const email = String(booking.email || "").trim().toLowerCase();
    if (email) set[email] = true;
  });
  return Object.keys(set).sort();
}

function listStudents(now) {
  settleAttendance(now);
  const catalog = loadCatalog();
  const orders = loadOrders();
  const bookings = loadBookings();
  return emailsFrom(orders, bookings).map(function (email) {
    const mineOrders = orders.filter(function (order) {
      return String(order.customerEmail || "").toLowerCase() === email;
    });
    const mineBookings = bookings.filter(function (booking) {
      return String(booking.email || "").toLowerCase() === email;
    });
    const lastOrder = newest(mineOrders, "customerEmail");
    const lastBooking = newest(mineBookings, "email");
    const wallet = walletForEmail(email, orders, bookings, catalog.products);
    const upcoming = mineBookings.filter(function (booking) {
      return booking.status === "booked" || booking.status === "waitlist";
    }).length;
    const history = mineBookings
      .slice()
      .sort(function (a, b) {
        return String(b.date || "").localeCompare(String(a.date || "")) ||
          String(b.createdAt || "").localeCompare(String(a.createdAt || ""));
      })
      .slice(0, 8)
      .map(function (booking) {
        return {
          id: booking.id,
          slotLabel: booking.slotLabel,
          status: booking.status,
          statusLabel: statusLabel(booking.status),
          date: booking.date,
        };
      });
    return {
      email: email,
      name:
        (lastOrder && lastOrder.customerName) ||
        (lastBooking && lastBooking.name) ||
        "",
      phone:
        (lastOrder && lastOrder.customerPhone) ||
        (lastBooking && lastBooking.phone) ||
        "",
      credits: { reformer: wallet.reformer, mat: wallet.mat },
      lots: wallet.lots.filter(function (lot) {
        return lot.remaining > 0 && !lot.expired;
      }),
      orders: mineOrders.length,
      upcoming: upcoming,
      history: history,
    };
  });
}

function grantCredits(input) {
  const email = String((input && input.email) || "").trim().toLowerCase();
  const name = String((input && input.name) || "").trim();
  const kind = (input && input.kind) === "mat" ? "mat" : "reformer";
  const amount = Number(input && input.amount);
  const note = String((input && input.note) || "").trim().slice(0, 300);
  if (!isEmail(email) || name.length < 2) {
    return { ok: false, status: 400, error: "Nom et e-mail requis" };
  }
  if (!Number.isInteger(amount) || amount < 1 || amount > 40) {
    return { ok: false, status: 400, error: "Nombre de crédits invalide (1–40)" };
  }
  const productId = kind === "mat" ? "mat-yoga-1" : "reformer-1";
  const label =
    "Ajustement admin (+" +
    amount +
    " " +
    (kind === "mat" ? "Mat / Yoga" : "Reformer") +
    ")";
  const order = addOrder({
    sessionId: "adj_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    type: "credit-adjust",
    status: "paid",
    mock: true,
    productId: productId,
    productName: label,
    label: label,
    qty: 1,
    credits: amount,
    validityMonths: 12,
    unitCents: 0,
    totalCents: 0,
    customerName: name,
    customerEmail: email,
    customerPhone: "",
    locale: "fr",
    note: note,
    createdAt: new Date().toISOString(),
  });
  recordNotice("credits", {
    email: email,
    name: name,
    source: "admin",
    detail: amount + " crédit" + (amount > 1 ? "s" : "") + " " + (kind === "mat" ? "Mat / Yoga" : "Reformer"),
  });
  return { ok: true, order: order };
}

module.exports = {
  listStudents,
  grantCredits,
};
