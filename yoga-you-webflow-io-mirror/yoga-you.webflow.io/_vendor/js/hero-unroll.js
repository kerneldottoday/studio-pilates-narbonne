(function () {
  function isHomepage() {
    var path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    return (
      path === "/" ||
      path === "/en" ||
      path.endsWith("/homepage") ||
      path.endsWith("/homepage.html")
    );
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    if (!isHomepage()) {
      document.documentElement.classList.remove("hero-unroll-boot");
      return;
    }

    var hero = document.querySelector(".section.hero-home .master-hero-home");
    document.documentElement.classList.add("hero-unroll-boot");

    if (prefersReducedMotion()) {
      document.documentElement.classList.remove("hero-unroll-boot");
      document.body.classList.add("hero-unroll-ready");
      return;
    }

    requestAnimationFrame(function () {
      document.body.classList.add("hero-unroll-ready");
      window.setTimeout(function () {
        document.documentElement.classList.remove("hero-unroll-boot");
      }, hero ? 850 : 400);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
