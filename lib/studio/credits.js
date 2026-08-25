const { inferKind, addMonths, todayISO } = require("./dates");
const { consumesCredit } = require("./policy");

function lotsForEmail(email, orders, bookings, products) {
  const normalized = String(email || "").trim().toLowerCase();
  const usedByOrder = {};
  (bookings || []).forEach(function (booking) {
    if (!consumesCredit(booking)) return;
    if (String(booking.email || "").toLowerCase() !== normalized) return;
    const key = booking.creditOrderId;
    usedByOrder[key] = (usedByOrder[key] || 0) + 1;
  });

  return (orders || [])
    .filter(function (order) {
      return String(order.customerEmail || "").toLowerCase() === normalized;
    })
    .map(function (order) {
      const product = (products || []).find(function (item) {
        return item.id === order.productId;
      });
      const kind = inferKind(order.productId, order.productName);
      const total =
        Number(order.credits || (product && product.credits) || 0) *
        Number(order.qty || 1);
      const used = usedByOrder[order.sessionId] || 0;
      const created = order.createdAt || new Date().toISOString();
      const months = Number(
        order.validityMonths || (product && product.validityMonths) || 1
      );
      const expiresAt = addMonths(created, months);
      return {
        orderId: order.sessionId,
        kind: kind,
        remaining: Math.max(0, total - used),
        total: total,
        expiresAt: expiresAt,
        expired: expiresAt < todayISO(),
        productName: order.productName || (product && product.name) || "",
      };
    });
}

function walletForEmail(email, orders, bookings, products) {
  const lots = lotsForEmail(email, orders, bookings, products);
  function sum(kind) {
    return lots
      .filter(function (lot) {
        return lot.kind === kind && !lot.expired;
      })
      .reduce(function (acc, lot) {
        return acc + lot.remaining;
      }, 0);
  }
  return {
    email: String(email || "").trim().toLowerCase(),
    reformer: sum("reformer"),
    mat: sum("mat"),
    lots: lots,
  };
}

function pickLot(wallet, kind) {
  return (wallet.lots || [])
    .filter(function (lot) {
      return lot.kind === kind && !lot.expired && lot.remaining > 0;
    })
    .sort(function (a, b) {
      return a.expiresAt.localeCompare(b.expiresAt);
    })[0] || null;
}

module.exports = {
  lotsForEmail,
  walletForEmail,
  pickLot,
};
