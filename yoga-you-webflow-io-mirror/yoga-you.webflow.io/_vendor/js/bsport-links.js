(function () {
  var bookingUrl = window.BSPORT_BOOKING_URL;
  var passUrl = window.BSPORT_PASS_URL;
  var studioBook = "/studio/reserver";
  var studioBuy = "/studio/acheter";

  function isPassLink(link) {
    var href = link.getAttribute("href") || "";
    return (
      link.hasAttribute("data-bsport-pass") ||
      link.classList.contains("pricing-pass-cta") ||
      href.indexOf("/pass/") !== -1
    );
  }

  function samePage(link, url) {
    link.href = url;
    link.removeAttribute("target");
    link.removeAttribute("rel");
  }

  function relabel(link, kind) {
    var text = (link.textContent || "").trim();
    if (kind === "pass") {
      if (text === "Acheter sur bsport") link.textContent = "Acheter une formule";
      if (text === "Buy on bsport") link.textContent = "Buy a pass";
      return;
    }
    if (text === "Réserver sur bsport") link.textContent = "Réserver un cours";
    if (text === "Book on bsport") link.textContent = "Book a class";
    if (text === "bsport") link.textContent = "ce site";
  }

  function applyBookingLink(link) {
    if (!bookingUrl) return;
    link.href = bookingUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  function applyPassLink(link) {
    if (!passUrl) return;
    link.href = passUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
  }

  function applyStudioLink(link) {
    if (isPassLink(link)) {
      samePage(link, studioBuy);
      relabel(link, "pass");
      return;
    }
    samePage(link, studioBook);
    relabel(link, "book");
  }

  function applyBsport() {
    if (bookingUrl) {
      document
        .querySelectorAll(
          'a.cta[data-i18n="hero.cta1"], a.cta.navbar-cta, a.planning-cta'
        )
        .forEach(applyBookingLink);

      document.querySelectorAll("a.cta.w-button").forEach(function (link) {
        var text = (link.textContent || "").trim();
        if (
          text !== "Réserver" &&
          text !== "Réserver un cours" &&
          text !== "Book a class"
        ) {
          return;
        }
        var href = link.getAttribute("href") || "";
        if (/^(?:\.\.\/)*(contact|pricing)\.html$/.test(href)) {
          applyBookingLink(link);
        }
      });

      document.querySelectorAll("[data-bsport-book]").forEach(applyBookingLink);
    }

    if (passUrl) {
      document
        .querySelectorAll(".pricing-pass-cta, [data-bsport-pass]")
        .forEach(applyPassLink);
    }
  }

  function applyStudio() {
    document.querySelectorAll('a[href*="backoffice.bsport.io"]').forEach(applyStudioLink);
    document
      .querySelectorAll(
        'a.cta[data-i18n="hero.cta1"], a.cta.navbar-cta, a.planning-cta, [data-bsport-book], .pricing-pass-cta, [data-bsport-pass]'
      )
      .forEach(applyStudioLink);

    document.querySelectorAll(".pricing-note").forEach(function (el) {
      var text = el.textContent || "";
      if (!/bsport/i.test(text)) return;
      if (/Achat/.test(text)) {
        el.textContent =
          "Achat et paiement en ligne sur ce site. Ci-dessous, les formules les plus demandées au studio.";
      } else {
        el.textContent =
          "Buy and pay on this website. The most requested studio plans are listed below.";
      }
    });
  }

  applyBsport();

  fetch("/api/studio/catalog", { credentials: "same-origin" })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data && data.live) applyStudio();
    })
    .catch(function () {});
})();
