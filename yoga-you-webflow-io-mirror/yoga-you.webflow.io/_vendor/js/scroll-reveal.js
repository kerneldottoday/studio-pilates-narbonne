(function () {
  var path = window.location.pathname.toLowerCase();
  var isTargetPage =
    /(^|\/)(pricing|legal|classes)\.html(?:$|[?#])/i.test(path) ||
    /\/en\/(pricing|legal|classes)(?:\.html)?(?:$|[?#])/i.test(path);

  if (!isTargetPage) {
    return;
  }

  function prefersReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function isInView(el) {
    var rect = el.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < vh * 0.94 && rect.bottom > 0;
  }

  function revealAll(items) {
    items.forEach(function (item) {
      item.classList.add("is-visible");
    });
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
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { root: null, rootMargin: "0px 0px -4% 0px", threshold: 0.05 }
    );

    var inViewQueue = [];
    items.forEach(function (item, index) {
      if (isInView(item)) {
        inViewQueue.push({ item: item, index: index });
      } else {
        observer.observe(item);
      }
    });

    var isClassesPage = document.body.classList.contains("page-classes");
    var baseDelay = isClassesPage ? 180 : 60;
    var stepDelay = isClassesPage ? 90 : 65;

    inViewQueue.forEach(function (entry) {
      window.setTimeout(function () {
        entry.item.classList.add("is-visible");
      }, baseDelay + entry.index * stepDelay);
    });
  }

  function init() {
    if (document.querySelector('script[src*="hero-unroll.js"]')) {
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
})();
