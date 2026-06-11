(function () {
  var MQ = window.matchMedia("(max-width: 991px)");

  function isMobileNav() {
    return MQ.matches;
  }

  function ensureBackdrop() {
    var backdrop = document.querySelector(".mobile-nav-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "mobile-nav-backdrop";
      backdrop.setAttribute("aria-hidden", "true");
      document.body.appendChild(backdrop);
    }
    return backdrop;
  }

  function ensureMobileCta(nav, menu) {
    if (menu.querySelector(".mobile-nav-cta-wrap")) {
      return;
    }
    var source = nav.querySelector(".wrap-nav-buttons .navbar-cta");
    if (!source) {
      return;
    }
    var wrap = document.createElement("div");
    wrap.className = "mobile-nav-cta-wrap";
    var cta = source.cloneNode(true);
    cta.classList.add("mobile-nav-cta");
    wrap.appendChild(cta);
    menu.appendChild(wrap);
  }

  function initNavbar(nav) {
    var button = nav.querySelector(".w-nav-button");
    var menu = nav.querySelector(".w-nav-menu");
    if (!button || !menu || nav.getAttribute("data-mobile-nav-ready") === "true") {
      return;
    }
    nav.setAttribute("data-mobile-nav-ready", "true");

    ensureMobileCta(nav, menu);
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", "mobile-nav-menu");
    menu.setAttribute("id", "mobile-nav-menu");

    var menuParent = menu.parentNode;
    var menuNext = menu.nextSibling;
    var overlay = null;
    var backdrop = ensureBackdrop();

    function ensureOverlay() {
      if (overlay) {
        return overlay;
      }
      overlay = nav.querySelector(".w-nav-overlay[data-mobile-nav]");
      if (!overlay) {
        overlay = document.createElement("div");
        overlay.className = "w-nav-overlay";
        overlay.setAttribute("data-mobile-nav", "true");
        nav.appendChild(overlay);
      }
      return overlay;
    }

    function closeMenu() {
      button.classList.remove("w--open");
      button.setAttribute("aria-expanded", "false");
      nav.classList.remove("w--nav-menu-open");
      document.body.classList.remove("mobile-nav-open");
      menu.removeAttribute("data-nav-menu-open");
      backdrop.setAttribute("aria-hidden", "true");
      if (overlay && menu.parentNode === overlay) {
        menuParent.insertBefore(menu, menuNext);
      }
      if (overlay) {
        overlay.style.display = "none";
      }
      document.body.style.overflow = "";
    }

    function openMenu() {
      var layer = ensureOverlay();
      layer.appendChild(menu);
      menu.setAttribute("data-nav-menu-open", "");
      layer.style.display = "block";
      button.classList.add("w--open");
      button.setAttribute("aria-expanded", "true");
      nav.classList.add("w--nav-menu-open");
      document.body.classList.add("mobile-nav-open");
      backdrop.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    }

    button.addEventListener(
      "click",
      function (e) {
        if (!isMobileNav()) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        if (button.classList.contains("w--open")) {
          closeMenu();
        } else {
          openMenu();
        }
      },
      true
    );

    backdrop.addEventListener("click", closeMenu);

    menu.addEventListener("click", function (e) {
      var link = e.target.closest(".nav-link, .dropdown-link, .mobile-nav-cta");
      if (link && !e.target.closest(".dropdown-toggle")) {
        closeMenu();
      }
    });

    nav.querySelectorAll(".dropdown.w-dropdown .w-dropdown-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        if (!isMobileNav() || !button.classList.contains("w--open")) {
          return;
        }
        e.preventDefault();
        e.stopPropagation();
        var dropdown = toggle.closest(".w-dropdown");
        if (!dropdown) {
          return;
        }
        var list = dropdown.querySelector(".dropdown-list");
        var isOpen = dropdown.classList.contains("w--open");
        nav.querySelectorAll(".dropdown.w-dropdown.w--open").forEach(function (item) {
          if (item !== dropdown) {
            item.classList.remove("w--open");
            var otherList = item.querySelector(".dropdown-list");
            if (otherList) {
              otherList.classList.remove("w--open");
            }
          }
        });
        dropdown.classList.toggle("w--open", !isOpen);
        if (list) {
          list.classList.toggle("w--open", !isOpen);
        }
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeMenu();
      }
    });

    MQ.addEventListener("change", function () {
      if (!isMobileNav()) {
        closeMenu();
      }
    });
  }

  function boot() {
    document.querySelectorAll(".navbar.w-nav").forEach(initNavbar);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
