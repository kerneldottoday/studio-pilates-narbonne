(function () {
  function isHomepage() {
    var path = window.location.pathname.toLowerCase().replace(/\/+$/, "") || "/";
    return (
      path === "/" ||
      path === "/en" ||
      path === "/accueil" ||
      path === "/en/home" ||
      path.endsWith("/homepage.html") ||
      path.endsWith("/homepage")
    );
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function init() {
    if (!isHomepage()) return;

    var hero = document.querySelector(".section.hero-home .master-hero-home");
    if (!hero) return;

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
      }, 1300);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
