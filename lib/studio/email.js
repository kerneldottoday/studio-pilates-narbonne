const { Resend } = require("resend");
const { formatEUR } = require("./store");
const { orderEmailTo } = require("../shop/catalog");

function emailsWanted() {
  return String(process.env.STUDIO_SEND_EMAILS || "").toLowerCase() === "true";
}

function isTestInbox(email) {
  return /@(example\.com|example\.org)$/i.test(String(email || ""));
}

function fromAddress() {
  return (
    (process.env.SHOP_FROM_EMAIL && process.env.SHOP_FROM_EMAIL.trim()) ||
    (process.env.RESEND_FROM_EMAIL && process.env.RESEND_FROM_EMAIL.trim()) ||
    "onboarding@resend.dev"
  );
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

async function sendClassPassEmails(order) {
  const apiKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim();
  if (!apiKey) {
    console.warn("[studio] RESEND_API_KEY manquant — e-mails non envoyés");
    return { skipped: true };
  }

  const fromEmail = fromAddress();
  const toStudio = order.toStudio || orderEmailTo();
  const resend = new Resend(apiKey);
  const total = formatEUR(order.totalCents);
  const credits = order.credits || 0;
  const validity = order.validityMonths
    ? "Validité : " + order.validityMonths + " mois"
    : "";

  const studioText = [
    "Nouvelle formule de cours payée",
    "",
    "Référence : " + order.sessionId,
    "Cliente : " + (order.customerName || "—"),
    "E-mail : " + (order.customerEmail || "—"),
    "Téléphone : " + (order.customerPhone || "—"),
    "",
    order.label || order.productName,
    "Crédits : " + credits,
    validity,
    "Total : " + total,
    "",
    "À faire : créditer la cliente et la placer sur le planning.",
  ].join("\n");

  const customerText = [
    "Merci pour votre achat au Studio Pilates Narbonne.",
    "",
    "Formule : " + (order.label || order.productName),
    "Total : " + total,
    credits ? "Crédits : " + credits : "",
    validity,
    "",
    "Référence : " + order.sessionId,
    "",
    "Souhila vous contacte pour vous placer sur le planning. Ce paiement n’est pas une réservation de créneau.",
  ]
    .filter(Boolean)
    .join("\n");

  const studioHtml =
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#3b241c;background:#f4e8e0;padding:12px 14px;">Nouvelle formule de cours payée — à créditer sur le planning.</p>' +
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;">Référence : <strong>' +
    escapeHtml(order.sessionId) +
    "</strong><br/>Cliente : " +
    escapeHtml(order.customerName || "—") +
    "<br/>E-mail : " +
    escapeHtml(order.customerEmail || "—") +
    "<br/>Téléphone : " +
    escapeHtml(order.customerPhone || "—") +
    "</p>" +
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#111;"><strong>' +
    escapeHtml(order.label || order.productName || "") +
    "</strong><br/>" +
    escapeHtml(total) +
    (credits ? "<br/>Crédits : " + credits : "") +
    "</p>";

  const customerHtml =
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;">Merci pour votre achat au Studio Pilates Narbonne.</p>' +
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;">Formule : <strong>' +
    escapeHtml(order.label || order.productName || "") +
    "</strong><br/>Total : " +
    escapeHtml(total) +
    "<br/>Référence : " +
    escapeHtml(order.sessionId) +
    "</p>" +
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;">Souhila vous contacte pour vous placer sur le planning. Ce paiement n’est pas une réservation de créneau.</p>';

  const studioSend = await resend.emails.send({
    from: "Studio Pilates Narbonne <" + fromEmail + ">",
    to: [toStudio],
    subject: "Formule cours — " + total,
    text: studioText,
    html: studioHtml,
  });
  if (studioSend.error) throw new Error(studioSend.error.message);

  let customerId = null;
  if (order.customerEmail) {
    const customerSend = await resend.emails.send({
      from: "Studio Pilates Narbonne <" + fromEmail + ">",
      to: [order.customerEmail],
      subject: "Votre formule — Studio Pilates Narbonne",
      text: customerText,
      html: customerHtml,
    });
    if (customerSend.error) {
      console.error("[studio] e-mail cliente", customerSend.error.message);
    } else {
      customerId = customerSend.data && customerSend.data.id;
    }
  }

  return {
    studioId: studioSend.data && studioSend.data.id,
    customerId: customerId,
  };
}

async function sendNoticeEmail(notice) {
  const apiKey = process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim();
  if (!apiKey) {
    console.warn("[studio] RESEND_API_KEY manquant — notice non envoyée");
    return { skipped: true };
  }
  if (!notice || !notice.email || isTestInbox(notice.email)) {
    return { skipped: true };
  }
  const resend = new Resend(apiKey);
  const text = notice.body || "";
  const html =
    '<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;">' +
    escapeHtml(text) +
    "</p>";
  const sent = await resend.emails.send({
    from: "Studio Pilates Narbonne <" + fromAddress() + ">",
    to: [notice.email],
    subject: notice.subject || "Studio Pilates Narbonne",
    text: text,
    html: html,
  });
  if (sent.error) throw new Error(sent.error.message);
  return { id: sent.data && sent.data.id };
}

module.exports = {
  emailsWanted,
  isTestInbox,
  sendClassPassEmails,
  sendNoticeEmail,
};
