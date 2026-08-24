(function () {
  if (!document.body || !document.body.classList.contains("page-voyage")) {
    return;
  }

  var items = Array.prototype.slice.call(
    document.querySelectorAll(".voyage-gallery__item")
  );
  if (!items.length) {
    return;
  }

  var en =
    document.documentElement.lang === "en" ||
    document.documentElement.getAttribute("data-site-locale") === "en" ||
    /\/en(?:\/|$)/.test(window.location.pathname);

  var labels = en
    ? {
        dialog: "Photo gallery",
        close: "Close",
        prev: "Previous photo",
        next: "Next photo",
        enlarge: "View photo",
      }
    : {
        dialog: "Galerie photos",
        close: "Fermer",
        prev: "Photo précédente",
        next: "Photo suivante",
        enlarge: "Voir la photo",
      };

  var photos = items.map(function (item, index) {
    var img = item.querySelector("img");
    var src = item.getAttribute("href") || (img && img.getAttribute("src")) || "";
    var alt = (img && img.getAttribute("alt")) || "";
    item.setAttribute("aria-label", labels.enlarge + (alt ? " : " + alt : ""));
    item.addEventListener("click", function (event) {
      event.preventDefault();
      openAt(index);
    });
    return { src: src, alt: alt };
  });

  var overlay = document.createElement("div");
  overlay.className = "voyage-lightbox";
  overlay.hidden = true;
  overlay.setAttribute("role", "dialog");
  overlay.setAttribute("aria-modal", "true");
  overlay.setAttribute("aria-label", labels.dialog);

  overlay.innerHTML =
    '<button type="button" class="voyage-lightbox__close" aria-label="' +
    labels.close +
    '">×</button>' +
    '<button type="button" class="voyage-lightbox__prev" aria-label="' +
    labels.prev +
    '">←</button>' +
    '<div class="voyage-lightbox__stage">' +
    '<img class="voyage-lightbox__img" alt=""/>' +
    '<div class="voyage-lightbox__meta">' +
    '<p class="voyage-lightbox__caption"></p>' +
    '<span class="voyage-lightbox__count"></span>' +
    "</div></div>" +
    '<button type="button" class="voyage-lightbox__next" aria-label="' +
    labels.next +
    '">→</button>';

  document.body.appendChild(overlay);

  var closeBtn = overlay.querySelector(".voyage-lightbox__close");
  var prevBtn = overlay.querySelector(".voyage-lightbox__prev");
  var nextBtn = overlay.querySelector(".voyage-lightbox__next");
  var viewer = overlay.querySelector(".voyage-lightbox__img");
  var caption = overlay.querySelector(".voyage-lightbox__caption");
  var count = overlay.querySelector(".voyage-lightbox__count");
  var current = 0;
  var lastFocus = null;
  var touchStartX = 0;

  function show(index) {
    current = (index + photos.length) % photos.length;
    var photo = photos[current];
    viewer.src = photo.src;
    viewer.alt = photo.alt;
    caption.textContent = photo.alt;
    count.textContent = current + 1 + " / " + photos.length;
  }

  function openAt(index) {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.classList.add("voyage-lightbox-open");
    document.body.style.overflow = "hidden";
    show(index);
    closeBtn.focus();
  }

  function close() {
    if (overlay.hidden) {
      return;
    }
    overlay.hidden = true;
    document.body.classList.remove("voyage-lightbox-open");
    document.body.style.overflow = "";
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    }
  }

  closeBtn.addEventListener("click", close);
  prevBtn.addEventListener("click", function () {
    show(current - 1);
  });
  nextBtn.addEventListener("click", function () {
    show(current + 1);
  });

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) {
      close();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (overlay.hidden) {
      return;
    }
    if (event.key === "Escape") {
      close();
    } else if (event.key === "ArrowLeft") {
      show(current - 1);
    } else if (event.key === "ArrowRight") {
      show(current + 1);
    }
  });

  overlay.addEventListener(
    "touchstart",
    function (event) {
      if (event.changedTouches && event.changedTouches[0]) {
        touchStartX = event.changedTouches[0].clientX;
      }
    },
    { passive: true }
  );

  overlay.addEventListener(
    "touchend",
    function (event) {
      if (!event.changedTouches || !event.changedTouches[0]) {
        return;
      }
      var delta = event.changedTouches[0].clientX - touchStartX;
      if (Math.abs(delta) < 50) {
        return;
      }
      show(delta > 0 ? current - 1 : current + 1);
    },
    { passive: true }
  );
})();
