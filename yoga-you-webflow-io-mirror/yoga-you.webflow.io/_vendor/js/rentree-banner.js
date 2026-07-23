/**
 * Barre annonce rentrée 2026 — dismissible, auto-off après le 20/09/2026.
 */
(function () {
  var STORAGE_KEY = "spn-rentree-banner-dismissed-2026";
  var EXPIRES = new Date("2026-09-20T23:59:59+02:00");

  function isEn() {
    var html = document.documentElement;
    var lang = (html.getAttribute("lang") || "").toLowerCase();
    if (lang.indexOf("en") === 0) return true;
    if (html.getAttribute("data-site-locale") === "en") return true;
    return /\/en(\/|$)/.test(location.pathname);
  }

  function planningHref() {
    return isEn() ? "/en/planning" : "/planning";
  }

  function isLocalhost() {
    var h = location.hostname;
    return h === "localhost" || h === "127.0.0.1";
  }

  function shouldShow() {
    if (Date.now() > EXPIRES.getTime()) return false;
    // Always show on local so QA isn't blocked by a prior dismiss
    if (isLocalhost()) {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        /* ignore */
      }
      return true;
    }
    try {
      if (localStorage.getItem(STORAGE_KEY) === "1") return false;
    } catch (e) {
      /* ignore */
    }
    return true;
  }

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function dismiss(banner) {
    if (!banner || banner.classList.contains("is-closing")) return;

    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch (e) {
      /* ignore */
    }

    function hide() {
      banner.hidden = true;
      banner.classList.remove("is-closing");
      banner.style.maxHeight = "";
    }

    if (prefersReducedMotion()) {
      hide();
      return;
    }

    var height = banner.scrollHeight;
    banner.style.maxHeight = height + "px";
    // Force reflow so the browser registers the starting height
    void banner.offsetHeight;
    banner.classList.add("is-closing");

    var done = false;
    function finish() {
      if (done) return;
      done = true;
      banner.removeEventListener("transitionend", onEnd);
      hide();
    }

    function onEnd(e) {
      if (e.target !== banner) return;
      if (e.propertyName !== "max-height" && e.propertyName !== "opacity") {
        return;
      }
      finish();
    }

    banner.addEventListener("transitionend", onEnd);
    window.setTimeout(finish, 450);
  }

  function buildBanner() {
    var en = isEn();
    var banner = document.createElement("div");
    banner.className = "spn-rentree-banner";
    banner.setAttribute("role", "region");
    banner.setAttribute(
      "aria-label",
      en ? "Back-to-school schedule announcement" : "Annonce planning rentrée"
    );

    var inner = document.createElement("div");
    inner.className = "spn-rentree-banner__inner";

    var text = document.createElement("p");
    text.className = "spn-rentree-banner__text";
    text.textContent = en
      ? "Back to school 2026 — new schedule from 15 September"
      : "Rentrée 2026 — nouveau planning dès le 15 septembre";

    var link = document.createElement("a");
    link.className = "spn-rentree-banner__link";
    link.href = planningHref();
    link.textContent = en ? "View schedule" : "Voir le planning";

    var close = document.createElement("button");
    close.type = "button";
    close.className = "spn-rentree-banner__close";
    close.setAttribute("aria-label", en ? "Dismiss" : "Fermer");
    close.innerHTML = "&times;";
    close.addEventListener("click", function () {
      dismiss(banner);
    });

    inner.appendChild(text);
    inner.appendChild(link);
    banner.appendChild(inner);
    banner.appendChild(close);
    return banner;
  }

  function initLightbox() {
    var openBtn = document.querySelector("[data-planning-flyer-open]");
    var lightbox = document.querySelector("[data-planning-flyer-lightbox]");
    if (!openBtn || !lightbox) return;

    var closeBtn = lightbox.querySelector("[data-planning-flyer-close]");

    function open() {
      lightbox.hidden = false;
      document.body.style.overflow = "hidden";
      if (closeBtn) closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.style.overflow = "";
      openBtn.focus();
    }

    openBtn.addEventListener("click", function (e) {
      e.preventDefault();
      open();
    });
    if (closeBtn) {
      closeBtn.addEventListener("click", close);
    }
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) close();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !lightbox.hidden) close();
    });
  }

  function init() {
    if (shouldShow()) {
      var banner = buildBanner();
      var nav = document.querySelector(".navbar.w-nav");
      if (nav && nav.parentNode) {
        nav.parentNode.insertBefore(banner, nav.nextSibling);
      } else {
        document.body.insertBefore(banner, document.body.firstChild);
      }
    } else {
      var soft = document.querySelector(".spn-rentree-soft");
      if (soft && Date.now() > EXPIRES.getTime()) soft.hidden = true;
    }

    initLightbox();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
