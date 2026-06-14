(function () {
  var path = window.location.pathname.toLowerCase();
  var isPlanningPage =
    /(^|\/)planning\.html(?:$|[?#])/i.test(path) ||
    /(^|\/)planning(?:$|[?#])/i.test(path) ||
    /\/en\/(schedule|planning)(?:\.html)?(?:$|[?#])/i.test(path);

  if (!isPlanningPage) {
    return;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    document.body.classList.add("planning-animations-ready");

    if (prefersReducedMotion()) {
      document.querySelectorAll(".planning-day-column").forEach(function (column) {
        column.classList.add("is-visible");
      });
      return;
    }

    var columns = document.querySelectorAll(".planning-day-column");
    if (!columns.length || !("IntersectionObserver" in window)) {
      columns.forEach(function (column) {
        column.classList.add("is-visible");
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -8% 0px", threshold: 0.12 }
    );

    columns.forEach(function (column) {
      observer.observe(column);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
