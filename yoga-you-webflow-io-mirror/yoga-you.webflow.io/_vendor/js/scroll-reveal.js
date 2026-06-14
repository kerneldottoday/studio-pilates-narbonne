(function () {
  var path = window.location.pathname.toLowerCase();
  var isTargetPage =
    /(^|\/)(pricing|legal|classes)(?:\.html)?(?:$|[?#])/i.test(path) ||
    /\/en\/(pricing|legal|classes)(?:\.html)?(?:$|[?#])/i.test(path);

  if (!isTargetPage) {
    return;
  }

  var isClassesPage = document.body.classList.contains("page-classes");

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isHomepageWithHeroUnroll() {
    var normalized = path.replace(/\/+$/, "") || "/";
    return (
      normalized === "/" ||
      normalized === "/en" ||
      normalized.endsWith("/homepage") ||
      normalized.endsWith("/homepage.html")
    );
  }

  function isInView(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.94 && rect.bottom > 0;
  }

  function revealAll(items) {
    items.forEach(function (item, index) {
      applyRevealDelay(item, index);
      item.classList.add("is-visible");
    });
  }

  function applyRevealDelay(el, fallbackIndex) {
    var section = el.closest("section");
    if (!section) {
      el.style.setProperty("--reveal-delay", String((fallbackIndex || 0) * 70));
      return;
    }

    var siblings = section.querySelectorAll(".reveal-on-scroll");
    var index = Array.prototype.indexOf.call(siblings, el);
    if (index < 0) {
      index = fallbackIndex || 0;
    }

    var delay = index * (isClassesPage ? 75 : 65);
    if (section.classList.contains("hero-classes") && el.classList.contains("tile-class")) {
      delay = 0;
    }

    el.style.setProperty("--reveal-delay", String(delay));
  }

  function revealElement(el, observer) {
    applyRevealDelay(el);
    el.classList.add("is-visible");
    if (observer) {
      observer.unobserve(el);
    }
  }

  function startReveal() {
    document.body.classList.add("scroll-reveal-ready");

    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal-on-scroll"));
    if (!items.length) {
      return;
    }

    if (prefersReducedMotion() || !("IntersectionObserver" in window)) {
      revealAll(items);
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            revealElement(entry.target, observer);
          }
        });
      },
      {
        root: null,
        rootMargin: isClassesPage ? "120px 0px -5% 0px" : "80px 0px -6% 0px",
        threshold: 0.06,
      }
    );

    var inViewQueue = [];
    items.forEach(function (item, index) {
      if (isInView(item)) {
        inViewQueue.push({ item: item, index: index });
      } else {
        observer.observe(item);
      }
    });

    var baseDelay = isClassesPage ? 120 : 60;
    var stepDelay = isClassesPage ? 75 : 65;

    inViewQueue.forEach(function (entry) {
      window.setTimeout(function () {
        revealElement(entry.item);
      }, baseDelay + entry.index * stepDelay);
    });
  }

  function init() {
    if (isHomepageWithHeroUnroll() && document.querySelector('script[src*="hero-unroll.js"]')) {
      window.setTimeout(startReveal, 320);
      return;
    }
    startReveal();
  }

    if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.setTimeout(function () {
    if (!document.body.classList.contains("scroll-reveal-ready")) {
      startReveal();
    }
  }, 2500);
})();
