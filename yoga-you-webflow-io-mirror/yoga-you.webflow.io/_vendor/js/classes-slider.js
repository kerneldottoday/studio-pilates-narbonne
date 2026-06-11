(function () {
  function initClassesSlider() {
    var section = document.querySelector(".classes-slider-section");
    if (!section || section.dataset.carouselReady === "true") return;

    var slider = section.querySelector(".slider-classes");
    var mask = section.querySelector(".mask-classes");
    if (!slider || !mask) return;

    var slides = Array.from(mask.querySelectorAll(".slide-classes"));
    if (slides.length < 2) return;

    section.dataset.carouselReady = "true";
    slider.classList.remove("w-slider");

    var track = document.createElement("div");
    track.className = "classes-slider-track";
    while (mask.firstChild) {
      track.appendChild(mask.firstChild);
    }
    mask.appendChild(track);

    var heading = section.querySelector(".flex-heading-slider-classes");
    var cta = heading ? heading.querySelector(".cta") : null;
    var prevBtn = null;
    var nextBtn = null;

    if (heading) {
      var actions = document.createElement("div");
      actions.className = "classes-slider-heading-actions";

      var controls = document.createElement("div");
      controls.className = "classes-slider-controls";

      prevBtn = document.createElement("button");
      prevBtn.type = "button";
      prevBtn.className = "classes-slider-btn classes-slider-prev";
      prevBtn.setAttribute("aria-label", "Cours précédent");
      prevBtn.innerHTML =
        '<span class="classes-slider-btn-icon" aria-hidden="true">←</span><span class="classes-slider-btn-label">Préc.</span>';

      nextBtn = document.createElement("button");
      nextBtn.type = "button";
      nextBtn.className = "classes-slider-btn classes-slider-next";
      nextBtn.setAttribute("aria-label", "Cours suivant");
      nextBtn.innerHTML =
        '<span class="classes-slider-btn-label">Suiv.</span><span class="classes-slider-btn-icon" aria-hidden="true">→</span>';

      controls.appendChild(prevBtn);
      controls.appendChild(nextBtn);
      actions.appendChild(controls);
      if (cta) actions.appendChild(cta);
      heading.appendChild(actions);
    }

    var index = 0;
    var autoplayMs = 5500;
    var timer = null;
    var dragThreshold = 6;
    var suppressClick = false;
    var drag = {
      pending: false,
      active: false,
      pointerId: null,
      startX: 0,
      delta: 0,
      base: 0,
    };

    function stepSize() {
      var slide = slides[0];
      return slide ? slide.getBoundingClientRect().width : 0;
    }

    function maxIndex() {
      return Math.max(0, slides.length - 1);
    }

    function offsetFor(i) {
      return i * stepSize();
    }

    function clampOffset(px) {
      return Math.max(0, Math.min(offsetFor(maxIndex()), px));
    }

    function applyTransform(px, animate, slow) {
      track.classList.toggle("is-dragging", !animate);
      track.classList.toggle("is-slow-transition", animate && slow === true);
      track.style.transform = "translate3d(" + -px + "px, 0, 0)";
    }

    function goTo(i, animate, slow) {
      index = Math.max(0, Math.min(maxIndex(), i));
      applyTransform(offsetFor(index), animate !== false, slow === true);
    }

    function next(slow) {
      goTo(index >= maxIndex() ? 0 : index + 1, true, slow !== false);
    }

    function prev(slow) {
      goTo(index <= 0 ? maxIndex() : index - 1, true, slow !== false);
    }

    function resetAutoplay() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () {
        next(false);
      }, autoplayMs);
    }

    function pauseAutoplay() {
      if (timer) clearInterval(timer);
      timer = null;
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function (e) {
        e.preventDefault();
        prev(true);
        resetAutoplay();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", function (e) {
        e.preventDefault();
        next(true);
        resetAutoplay();
      });
    }

    slider.addEventListener("mouseenter", pauseAutoplay);
    slider.addEventListener("mouseleave", resetAutoplay);

    track.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    track.addEventListener(
      "click",
      function (e) {
        if (suppressClick) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick = false;
        }
      },
      true
    );

    function onPointerMove(e) {
      if (e.pointerId !== drag.pointerId) return;

      drag.delta = e.clientX - drag.startX;

      if (!drag.active && Math.abs(drag.delta) > dragThreshold) {
        drag.active = true;
        drag.pending = false;
        track.classList.add("is-dragging");
        pauseAutoplay();
      }

      if (!drag.active) return;

      e.preventDefault();
      applyTransform(clampOffset(drag.base - drag.delta), false, false);
    }

    function endDrag(e) {
      if (e.pointerId !== drag.pointerId) return;

      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerup", endDrag);
      document.removeEventListener("pointercancel", endDrag);

      var wasActive = drag.active;
      drag.pending = false;
      drag.active = false;
      drag.pointerId = null;
      track.classList.remove("is-dragging");

      if (!wasActive) return;

      suppressClick = true;
      setTimeout(function () {
        suppressClick = false;
      }, 0);

      if (Math.abs(drag.delta) > stepSize() * 0.15) {
        if (drag.delta > 0) prev(true);
        else next(true);
      } else {
        goTo(index, true, true);
      }

      resetAutoplay();
    }

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      if (e.target.closest("button")) return;

      drag.pending = true;
      drag.active = false;
      drag.pointerId = e.pointerId;
      drag.startX = e.clientX;
      drag.delta = 0;
      drag.base = offsetFor(index);

      document.addEventListener("pointermove", onPointerMove);
      document.addEventListener("pointerup", endDrag);
      document.addEventListener("pointercancel", endDrag);
    });

    window.addEventListener("resize", function () {
      goTo(index, false, false);
    });

    goTo(0, false, false);
    resetAutoplay();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initClassesSlider);
  } else {
    initClassesSlider();
  }
})();
