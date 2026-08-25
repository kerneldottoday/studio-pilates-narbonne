const { addNotice, loadNotices, loadCatalog } = require("./store");
const { DEFAULT_CANCEL_HOURS, normalizeCancelHours } = require("./policy");
const { sendNoticeEmail, emailsWanted, isTestInbox } = require("./email");

function shouldNotify(person) {
  if (!person || !person.email) return false;
  if (person.skipCredit && person.source === "admin") return false;
  return true;
}

function cancelHoursLabel() {
  try {
    return String(normalizeCancelHours(loadCatalog().cancelHours) || DEFAULT_CANCEL_HOURS);
  } catch (_err) {
    return String(DEFAULT_CANCEL_HOURS);
  }
}

function copyFor(kind, person) {
  const slot = person.slotLabel || "";
  const name = person.name || "Bonjour";
  if (kind === "booked") {
    return {
      subject: "Cours réservé",
      body:
        name +
        ", votre place est confirmée : " +
        slot +
        ". Annulation possible jusqu’à " +
        cancelHoursLabel() +
        " h avant le cours.",
    };
  }
  if (kind === "waitlist") {
    return {
      subject: "Liste d’attente",
      body:
        name +
        ", vous êtes en liste d’attente pour " +
        slot +
        ". Le crédit n’est débité que si une place se libère.",
    };
  }
  if (kind === "promoted") {
    return {
      subject: "Une place s’est libérée",
      body: name + ", vous êtes inscrite sur " + slot + ". Un crédit a été utilisé.",
    };
  }
  if (kind === "cancelled") {
    return {
      subject: "Cours annulé",
      body: name + ", votre réservation a été annulée : " + slot + ". Le crédit a été rendu.",
    };
  }
  if (kind === "class-cancelled") {
    return {
      subject: "Cours annulé par le studio",
      body:
        name +
        ", le cours " +
        slot +
        " est annulé par le studio" +
        (person.detail ? " (" + person.detail + ")" : "") +
        (person.wasWaitlist
          ? ". Vous étiez en liste d’attente : rien n’est décompté."
          : ". Votre crédit n’est pas décompté — vous pouvez réserver un autre créneau."),
    };
  }
  if (kind === "leave-waitlist") {
    return {
      subject: "Sortie de la file",
      body: name + ", vous n’êtes plus en liste d’attente pour " + slot + ".",
    };
  }
  if (kind === "noshow") {
    return {
      subject: "Absence au cours",
      body:
        name +
        ", vous n’avez pas été pointée sur " +
        slot +
        ". Le crédit reste utilisé.",
    };
  }
  if (kind === "wait-expired") {
    return {
      subject: "File close",
      body: name + ", le cours " + slot + " a commencé. La liste d’attente est close.",
    };
  }
  if (kind === "reminder") {
    return {
      subject: "Rappel : cours demain",
      body:
        name +
        ", petit rappel : votre cours " +
        slot +
        " a lieu demain. Annulation possible jusqu’à " +
        cancelHoursLabel() +
        " h avant le cours — passé ce délai, le crédit est utilisé.",
    };
  }
  if (kind === "credits") {
    return {
      subject: "Crédits ajoutés",
      body: name + ", " + (person.detail || "des crédits") + " ont été ajoutés à votre compte.",
    };
  }
  if (kind === "purchase") {
    return {
      subject: "Formule achetée",
      body:
        name +
        ", votre achat est confirmé : " +
        (person.detail || "formule") +
        (slot ? " · " + slot : "") +
        ". Vous pouvez réserver un créneau avec vos crédits.",
    };
  }
  return { subject: "Studio Pilates Narbonne", body: slot };
}

function recordNotice(kind, person) {
  if (!shouldNotify(person)) return null;
  const copy = copyFor(kind, person);
  const notice = addNotice({
    id: "nt_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
    kind: kind,
    createdAt: new Date().toISOString(),
    email: String(person.email || "").toLowerCase(),
    name: person.name || "",
    subject: copy.subject,
    body: copy.body,
    slotLabel: person.slotLabel || "",
    sent: false,
  });
  if (kind !== "purchase") {
    void maybeSendNotice(notice);
  }
  return notice;
}

async function maybeSendNotice(notice) {
  if (!notice || notice.sent) return notice;
  if (!emailsWanted()) return notice;
  if (isTestInbox(notice.email)) return notice;
  const { markNoticeSent } = require("./store");
  try {
    const result = await sendNoticeEmail(notice);
    if (result && !result.skipped) {
      return markNoticeSent(notice.id, { resendId: result.id || "" });
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[studio] notice email", message);
  }
  return notice;
}

function listNotices() {
  return loadNotices();
}

module.exports = {
  shouldNotify,
  recordNotice,
  maybeSendNotice,
  listNotices,
};
