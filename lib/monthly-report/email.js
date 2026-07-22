const { Resend } = require("resend");

const ASCII = `
 ██╗  ██╗███████╗██████╗ ███╗   ██╗███████╗██╗
 ██║ ██╔╝██╔════╝██╔══██╗████╗  ██║██╔════╝██║
 █████╔╝ █████╗  ██████╔╝██╔██╗ ██║█████╗  ██║
 ██╔═██╗ ██╔══╝  ██╔══██╗██║╚██╗██║██╔══╝  ██║
 ██║  ██╗███████╗██║  ██║██║ ╚████║███████╗███████╗
 ╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚══════╝╚══════╝
`.trim();

function buildMonthlyReportEmail(data) {
  const subject = `Studio Pilates Narbonne — Analytics mensuel (${data.since} → ${data.until})`;

  const text = `${ASCII}

KERNEL.today — Analytics mensuel

Bonjour,

Veuillez trouver ci-joint le rapport mensuel d’analytics web pour
le site Studio Pilates Narbonne.

Période : ${data.since} → ${data.until}
Visiteurs uniques : ${data.visitors}
Pages vues : ${data.pageviews}

Ce panorama couvre le trafic pour suivre les performances du site.
Pour toute question, répondez simplement à cet e-mail — nous sommes
là pour vous accompagner.

Merci pour votre confiance.

Yankel Recca
KERNEL.today
contact@kernel.today
www.kernel.today
`;

  const html = `
<pre style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:11px;line-height:1.15;color:#111;margin:0 0 24px;">${ASCII.replace(/</g, "&lt;")}</pre>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;margin:0 0 16px;">Bonjour,</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;margin:0 0 16px;">
  Veuillez trouver ci-joint le <strong>rapport mensuel d’analytics web</strong> pour
  le site Studio Pilates Narbonne.
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.55;color:#333;margin:0 0 16px;">
  Période : <strong>${data.since} → ${data.until}</strong><br/>
  Visiteurs uniques : <strong>${data.visitors}</strong><br/>
  Pages vues : <strong>${data.pageviews}</strong>
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;margin:0 0 16px;">
  Pour toute question sur les chiffres, répondez simplement à cet e-mail —
  nous sommes là pour vous accompagner.
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#111;margin:0 0 8px;">
  Merci pour votre confiance.
</p>
<p style="font-family:Inter,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5;color:#333;margin:24px 0 0;">
  Yankel Recca<br/>
  <strong>KERNEL.today</strong><br/>
  <a href="mailto:contact@kernel.today" style="color:#111;">contact@kernel.today</a><br/>
  <a href="https://www.kernel.today" style="color:#111;">www.kernel.today</a>
</p>
`;

  return { subject, text, html };
}

async function sendMonthlyReportEmail(opts) {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const fromEmail =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";
  if (!apiKey) throw new Error("RESEND_API_KEY manquant");

  const { subject, text, html } = buildMonthlyReportEmail(opts.data);
  const resend = new Resend(apiKey);
  const { data, error } = await resend.emails.send({
    from: `KERNEL.today <${fromEmail}>`,
    to: [opts.to],
    replyTo: "contact@kernel.today",
    subject,
    text,
    html,
    attachments: [
      {
        filename: opts.filename,
        content: opts.pdf,
      },
    ],
  });

  if (error) throw new Error(error.message || JSON.stringify(error));
  return { id: data?.id };
}

module.exports = { buildMonthlyReportEmail, sendMonthlyReportEmail };
