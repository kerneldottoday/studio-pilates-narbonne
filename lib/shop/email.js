const { Resend } = require("resend");
const { formatEUR, loadCatalog } = require("./catalog");

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function formatAddress(addr) {
  if (!addr) return "";
  return [
    addr.name,
    addr.line1,
    addr.line2,
    [addr.postal_code, addr.city].filter(Boolean).join(" "),
    addr.country,
  ]
    .filter(Boolean)
    .join("\n");
}

function buildOrderCopy(order) {
  const catalog = loadCatalog();
  const studio = catalog.studio || {};
  const isPickup = order.fulfillment === "pickup";
  const linesText = order.lines
    .map((line) => `${line.qty} × ${line.name} — ${formatEUR(line.lineCents)}`)
    .join("\n");

  const actionStudio = isPickup
    ? "ACTION : RETRAIT AU STUDIO\nPréparer la commande. La cliente vient au " +
      (studio.address || "8 Rue du Luxembourg, 11100 Narbonne") +
      "."
    : "ACTION : ENVOI COLIS\nPréparer le colis et l’expédier à :\n" +
      (order.shippingAddress || "Adresse à confirmer");

  const shipCustomer = isPickup
    ? "Retrait au studio — " + (studio.address || "")
    : "Envoi à :\n" + (order.shippingAddress || "Adresse à confirmer");

  const customerLead = isPickup
    ? "Souhila prépare votre commande pour un retrait au studio."
    : "Souhila prépare votre colis et l’envoie à l’adresse indiquée.";

  const totalsBlock = [
    "Sous-total : " + formatEUR(order.subtotalCents),
    "Livraison : " + formatEUR(order.shippingCents),
    "Total : " + formatEUR(order.totalCents),
  ].join("\n");

  const studioText = [
    "Nouvelle commande compléments",
    "",
    actionStudio,
    "",
    "Référence : " + order.sessionId,
    "Cliente : " + (order.customerName || "—"),
    "E-mail : " + (order.customerEmail || "—"),
    "Téléphone : " + (order.customerPhone || "—"),
    "",
    linesText,
    "",
    totalsBlock,
  ].join("\n");

  const customerText = [
    "Merci pour votre commande.",
    "",
    customerLead,
    "",
    "Référence : " + order.sessionId,
    "",
    linesText,
    "",
    totalsBlock,
    "",
    shipCustomer,
  ].join("\n");

  const rows = order.lines
    .map(
      (line) =>
        `<tr><td style="padding:6px 0;">${escapeHtml(line.qty)} × ${escapeHtml(
          line.name
        )}</td><td style="padding:6px 0;text-align:right;">${escapeHtml(
          formatEUR(line.lineCents)
        )}</td></tr>`
    )
    .join("");

  const totalsHtml = `
<table style="width:100%;max-width:480px;font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;color:#111;">
  ${rows}
  <tr><td style="padding-top:12px;">Sous-total</td><td style="padding-top:12px;text-align:right;">${escapeHtml(
    formatEUR(order.subtotalCents)
  )}</td></tr>
  <tr><td>Livraison</td><td style="text-align:right;">${escapeHtml(
    formatEUR(order.shippingCents)
  )}</td></tr>
  <tr><td><strong>Total</strong></td><td style="text-align:right;"><strong>${escapeHtml(
    formatEUR(order.totalCents)
  )}</strong></td></tr>
</table>`;

  const studioHtml = `
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.45;color:#3b241c;background:#f4e8e0;padding:12px 14px;white-space:pre-line;">
  ${escapeHtml(actionStudio)}
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;">
  Référence : <strong>${escapeHtml(order.sessionId)}</strong><br/>
  Cliente : ${escapeHtml(order.customerName || "—")}<br/>
  E-mail : ${escapeHtml(order.customerEmail || "—")}<br/>
  Téléphone : ${escapeHtml(order.customerPhone || "—")}
</p>
${totalsHtml}
`;

  const customerHtml = `
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;">
  Merci pour votre commande.
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;">
  ${escapeHtml(customerLead)}
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;">
  Référence : <strong>${escapeHtml(order.sessionId)}</strong>
</p>
${totalsHtml}
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;white-space:pre-line;">
  ${escapeHtml(shipCustomer)}
</p>
`;

  return {
    text: studioText,
    html: studioHtml,
    customerLead,
    customerText,
    customerHtml,
  };
}

async function sendOrderEmails(order) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    console.warn("[shop] RESEND_API_KEY manquant — e-mails non envoyés");
    return { skipped: true };
  }

  const fromEmail =
    process.env.SHOP_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "onboarding@resend.dev";
  const toStudio = order.toStudio;
  const resend = new Resend(apiKey);
  const { text, html, customerText, customerHtml } = buildOrderCopy(order);
  const subject = "Commande compléments — " + formatEUR(order.totalCents);

  const studioSend = await resend.emails.send({
    from: `Studio Pilates Narbonne <${fromEmail}>`,
    to: [toStudio],
    subject,
    text,
    html,
  });
  if (studioSend.error) throw new Error(studioSend.error.message);

  let customerId = null;
  if (order.customerEmail) {
    const customerSend = await resend.emails.send({
      from: `Studio Pilates Narbonne <${fromEmail}>`,
      to: [order.customerEmail],
      subject: "Votre commande — Studio Pilates Narbonne",
      text: customerText,
      html: customerHtml,
    });
    if (customerSend.error) {
      console.error("[shop] e-mail cliente", customerSend.error.message);
    } else {
      customerId = customerSend.data && customerSend.data.id;
    }
  }

  return {
    studioId: studioSend.data && studioSend.data.id,
    customerId,
  };
}

module.exports = {
  formatAddress,
  buildOrderCopy,
  sendOrderEmails,
};
