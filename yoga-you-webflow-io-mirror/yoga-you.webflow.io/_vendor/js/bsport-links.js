(function () {
  var bookingUrl = window.BSPORT_BOOKING_URL;
  var passUrl = window.BSPORT_PASS_URL;

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

  if (bookingUrl) {
    document
      .querySelectorAll(
        'a.cta[data-i18n="hero.cta1"], a.cta.navbar-cta, a.planning-cta'
      )
      .forEach(applyBookingLink);

    document.querySelectorAll("a.cta.w-button").forEach(function (link) {
      var text = (link.textContent || "").trim();
      if (text !== "Réserver" && text !== "Réserver un cours") return;

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
})();
