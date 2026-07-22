const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { COUNTRY_NAMES } = require("./config");

const WHITE = "#FFFFFF";
const BLACK = "#000000";
const MUTED = "#6B6B6B";
const FAINT = "#B8B8B8";
const RULE_HEX = "#3A3A3A";
const ACCENT = "#ED2024";

function fmt(n) {
  return Number(n || 0).toLocaleString("fr-FR");
}

/** Racines assets — préfère les fichiers colocalisés à la route (bundle Vercel). */
function resolveAssetRoots() {
  return [
    path.join(process.cwd(), "api", "cron", "monthly-report"),
    path.join(process.cwd(), "lib", "monthly-report"),
    typeof __dirname !== "undefined" ? path.join(__dirname) : "",
    // Handler colocalisé : api/cron/monthly-report/index.js → __dirname = ce dossier
    typeof __dirname !== "undefined"
      ? path.join(__dirname, "..", "..", "api", "cron", "monthly-report")
      : "",
  ].filter(Boolean);
}

function resolveFontsAndLogo() {
  for (const root of resolveAssetRoots()) {
    const fontsDir = fs.existsSync(path.join(root, "fonts"))
      ? path.join(root, "fonts")
      : root;
    const regular = path.join(fontsDir, "InterTight-Regular.ttf");
    const medium = path.join(fontsDir, "InterTight-Medium.ttf");
    const semi = path.join(fontsDir, "InterTight-SemiBold.ttf");
    const logo = path.join(root, "spn-logo-thumb.png");
    if (
      fs.existsSync(regular) &&
      fs.existsSync(medium) &&
      fs.existsSync(semi)
    ) {
      return { regular, medium, semi, logo, root };
    }
  }
  throw new Error(
    `Polices Inter Tight manquantes (cwd=${process.cwd()}, tried=${resolveAssetRoots().join(" | ")})`
  );
}

/** PDF analytics une page — même langage visuel que KFS (fond noir, Inter Tight). */
function buildMonthlyReportPdf(data) {
  const { regular, medium, semi, logo } = resolveFontsAndLogo();

  return new Promise((resolve, reject) => {
    const PAGE_W = 595.28;
    const PAGE_H = 841.89;
    const M = 36;
    const CW = PAGE_W - M * 2;

    // pdfkit charge options.font au constructeur — jamais Helvetica
    // (Helvetica.afm absent du bundle serverless Vercel).
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      autoFirstPage: true,
      font: regular,
    });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.registerFont("Text", regular);
    doc.registerFont("TextMedium", medium);
    doc.registerFont("TextSemiBold", semi);
    const F = { reg: "Text", med: "TextMedium", semi: "TextSemiBold" };

    doc.rect(0, 0, PAGE_W, PAGE_H).fill(BLACK);

    const pct = (n, total) =>
      total > 0 ? `${Math.round((n / total) * 100)} %` : "—";

    const drawRule = (y) => {
      doc
        .moveTo(M, y)
        .lineTo(PAGE_W - M, y)
        .lineWidth(0.75)
        .strokeColor(RULE_HEX)
        .stroke();
    };

    if (fs.existsSync(logo)) {
      doc.image(logo, M, 28, { width: 18, height: 18 });
    }
    doc
      .font(F.semi)
      .fontSize(10)
      .fillColor(WHITE)
      .text("STUDIO PILATES NARBONNE", M + 26, 30, { characterSpacing: 0.4 });
    doc
      .font(F.med)
      .fontSize(8)
      .fillColor(MUTED)
      .text("ANALYTICS MENSUEL", M, 32, {
        width: CW,
        align: "right",
        characterSpacing: 1.2,
      });
    drawRule(56);

    let y = 68;
    doc
      .font(F.med)
      .fontSize(8)
      .fillColor(MUTED)
      .text("ANALYTICS WEB", M, y, { characterSpacing: 1.2 });
    y += 16;
    doc
      .font(F.semi)
      .fontSize(22)
      .fillColor(WHITE)
      .text("Vue d’ensemble du trafic", M, y, { characterSpacing: -0.2 });
    y += 28;
    doc
      .font(F.reg)
      .fontSize(9)
      .fillColor(FAINT)
      .text(
        `${data.since}  →  ${data.until}   ·   ${data.days} jours   ·   Vercel Web Analytics`,
        M,
        y,
        { width: CW }
      );
    y += 22;
    drawRule(y);
    y += 16;

    const kpis = [
      { label: "VISITEURS UNIQUES", value: fmt(data.visitors) },
      { label: "PAGES VUES", value: fmt(data.pageviews) },
      { label: "PAGES / VISITEUR", value: String(data.pagesPerVisitor) },
    ];
    const kpiW = CW / 3;
    kpis.forEach((k, i) => {
      const x = M + i * kpiW;
      doc
        .font(F.med)
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(k.label, x, y, { characterSpacing: 1 });
      doc
        .font(F.semi)
        .fontSize(26)
        .fillColor(WHITE)
        .text(k.value, x, y + 14, { width: kpiW - 12, characterSpacing: -0.4 });
    });
    y += 56;
    drawRule(y);
    y += 14;

    const colGap = 28;
    const colW = (CW - colGap) / 2;
    const leftX = M;
    const rightX = M + colW + colGap;
    const colTop = y;

    doc
      .font(F.med)
      .fontSize(8)
      .fillColor(MUTED)
      .text("PAGES LES PLUS VISITÉES", leftX, colTop, { characterSpacing: 1.2 });
    doc
      .font(F.med)
      .fontSize(8)
      .fillColor(MUTED)
      .text("PAYS", rightX, colTop, { characterSpacing: 1.2 });

    let ly = colTop + 16;
    let ry = colTop + 16;
    const pageRows = data.routes.slice(0, 8);
    const countryRows = data.countries.slice(0, 8);

    pageRows.forEach((r) => {
      const routeLabel = r.route === "" || r.route == null ? "/" : r.route;
      doc
        .font(F.reg)
        .fontSize(9)
        .fillColor(FAINT)
        .text(routeLabel, leftX, ly, {
          width: colW * 0.45,
          lineBreak: false,
        });
      doc
        .font(F.med)
        .fontSize(9)
        .fillColor(WHITE)
        .text(fmt(r.pageviews), leftX + colW * 0.48, ly, {
          width: colW * 0.28,
          align: "right",
          lineBreak: false,
        });
      doc
        .font(F.reg)
        .fontSize(8)
        .fillColor(MUTED)
        .text(pct(r.pageviews, data.pageviews), leftX + colW * 0.78, ly, {
          width: colW * 0.22,
          align: "right",
        });
      ly += 15;
    });

    countryRows.forEach((c) => {
      const code = c.country || "—";
      const name = COUNTRY_NAMES[code] || code;
      doc
        .font(F.reg)
        .fontSize(9)
        .fillColor(FAINT)
        .text(`${code}  ${name}`, rightX, ry, {
          width: colW * 0.55,
          lineBreak: false,
        });
      doc
        .font(F.med)
        .fontSize(9)
        .fillColor(WHITE)
        .text(fmt(c.visitors), rightX + colW * 0.55, ry, {
          width: colW * 0.22,
          align: "right",
          lineBreak: false,
        });
      doc
        .font(F.reg)
        .fontSize(8)
        .fillColor(MUTED)
        .text(pct(c.visitors, data.visitors), rightX + colW * 0.78, ry, {
          width: colW * 0.22,
          align: "right",
        });
      const barW = Math.max(
        2,
        ((c.visitors || 0) / Math.max(data.visitors, 1)) * (colW * 0.55)
      );
      doc.rect(rightX, ry + 11, barW, 1.5).fill(ACCENT);
      ry += 17;
    });

    y = Math.max(ly, ry) + 10;
    drawRule(y);
    y += 14;

    const tW = CW / 3;
    const blocks = [
      {
        title: "APPAREILS",
        rows: data.devices.map((d) => ({
          label: d.deviceType || "—",
          a: d.visitors,
        })),
      },
      {
        title: "NAVIGATEURS",
        rows: data.browsers.slice(0, 5).map((b) => ({
          label: b.browserName || "—",
          a: b.visitors,
        })),
      },
      {
        title: "SYSTÈMES D’EXPLOITATION",
        rows: data.osList.slice(0, 5).map((o) => ({
          label: o.osName || "—",
          a: o.visitors,
        })),
      },
    ];

    blocks.forEach((block, i) => {
      const x = M + i * tW;
      doc
        .font(F.med)
        .fontSize(7.5)
        .fillColor(MUTED)
        .text(block.title, x, y, { characterSpacing: 1.1 });
      let by = y + 14;
      block.rows.forEach((row) => {
        doc
          .font(F.reg)
          .fontSize(8)
          .fillColor(FAINT)
          .text(row.label, x, by, { width: tW * 0.55, lineBreak: false });
        doc
          .font(F.med)
          .fontSize(8)
          .fillColor(WHITE)
          .text(`${fmt(row.a)} v`, x + tW * 0.52, by, {
            width: tW * 0.4,
            align: "right",
          });
        by += 13;
      });
    });
    y += 14 + 5 * 13 + 8;
    drawRule(y);
    y += 12;

    doc
      .font(F.med)
      .fontSize(7.5)
      .fillColor(MUTED)
      .text("ANALYSE", M, y, { characterSpacing: 1.2 });
    y += 12;
    doc
      .font(F.reg)
      .fontSize(8.5)
      .fillColor(FAINT)
      .text(data.insight, M, y, { width: CW, lineGap: 1.5 });

    drawRule(PAGE_H - 40);
    doc
      .font(F.med)
      .fontSize(7.5)
      .fillColor(MUTED)
      .text(
        "KERNEL.today  ·  studiopilatesnarbonne.com  ·  rapport mensuel automatique",
        M,
        PAGE_H - 28,
        { width: CW * 0.75, characterSpacing: 0.3 }
      );
    doc
      .font(F.med)
      .fontSize(7.5)
      .fillColor(MUTED)
      .text("01 / 01", M, PAGE_H - 28, {
        width: CW,
        align: "right",
        characterSpacing: 0.5,
      });

    doc.end();
  });
}

module.exports = { buildMonthlyReportPdf };
