(function () {
  function isEnglishPage() {
    return (
      document.documentElement.lang === "en" ||
      /\/en(?:\/|$)/.test(window.location.pathname)
    );
  }

  function initTestimonialsSlider() {
    var section = document.querySelector(".testimonials-slider-section");
    if (!section || section.dataset.carouselReady === "true") return;

    var master = section.querySelector(".master-testimonial-slider");
    var slider = section.querySelector(".slider");
    var mask = section.querySelector(".mask");
    if (!master || !slider || !mask) return;

    var slides = Array.from(mask.querySelectorAll(".slide-testimonials"));
    if (slides.length < 2) return;

    var en = isEnglishPage();
    var labels = en
      ? {
          prev: "Previous review",
          next: "Next review",
          dots: "Customer reviews",
          dot: "Review ",
          swipe: "Swipe to browse reviews",
        }
      : {
          prev: "Avis précédent",
          next: "Avis suivant",
          dots: "Avis clients",
          dot: "Avis ",
          swipe: "Glissez pour parcourir les avis",
        };

    section.dataset.carouselReady = "true";
    slider.classList.remove("w-slider");

    section.querySelectorAll(".arrow-testimonial-slider").forEach(function (el) {
      el.remove();
    });

    var headingActions = section.querySelector(".testimonials-heading-actions");
    if (headingActions) headingActions.remove();

    var track = document.createElement("div");
    track.className = "testimonials-slider-track";
    while (mask.firstChild) {
      track.appendChild(mask.firstChild);
    }
    mask.appendChild(track);

    var layout = document.createElement("div");
    layout.className = "testimonials-slider-layout";

    var controls = document.createElement("div");
    controls.className = "testimonials-slider-controls";

    var prevBtn = document.createElement("button");
    prevBtn.type = "button";
    prevBtn.className = "testimonials-slider-btn testimonials-prev";
    prevBtn.setAttribute("aria-label", labels.prev);
    prevBtn.innerHTML =
      '<span class="testimonials-slider-btn-icon" aria-hidden="true">&#8592;</span>';

    var nextBtn = document.createElement("button");
    nextBtn.type = "button";
    nextBtn.className = "testimonials-slider-btn testimonials-next";
    nextBtn.setAttribute("aria-label", labels.next);
    nextBtn.innerHTML =
      '<span class="testimonials-slider-btn-icon" aria-hidden="true">&#8594;</span>';

    var dots = document.createElement("div");
    dots.className = "testimonials-slider-dots";
    dots.setAttribute("role", "tablist");
    dots.setAttribute("aria-label", labels.dots);

    var dotButtons = slides.map(function (_slide, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.className = "testimonials-slider-dot";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", labels.dot + (i + 1));
      dot.setAttribute("aria-selected", i === 0 ? "true" : "false");
      dot.setAttribute("tabindex", i === 0 ? "0" : "-1");
      dots.appendChild(dot);
      return dot;
    });

    var swipeHint = document.createElement("p");
    swipeHint.className = "testimonials-swipe-hint";
    swipeHint.setAttribute("aria-hidden", "true");
    swipeHint.textContent = labels.swipe;

    controls.appendChild(prevBtn);
    controls.appendChild(dots);
    controls.appendChild(nextBtn);

    master.insertBefore(layout, slider);
    layout.appendChild(slider);
    layout.appendChild(controls);
    layout.appendChild(swipeHint);

    var index = 0;
    var autoplayMs = 7000;
    var timer = null;
    var dragThreshold = 6;
    var hasInteracted = false;
    var drag = {
      active: false,
      pointerId: null,
      startX: 0,
      delta: 0,
      base: 0,
    };

    function hideSwipeHint() {
      if (hasInteracted) return;
      hasInteracted = true;
      swipeHint.classList.add("is-hidden");
    }

    function stepSize() {
      return mask.getBoundingClientRect().width;
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

    function updateDots() {
      dotButtons.forEach(function (dot, i) {
        var active = i === index;
        dot.classList.toggle("is-active", active);
        dot.setAttribute("aria-selected", active ? "true" : "false");
        dot.setAttribute("tabindex", active ? "0" : "-1");
      });
    }

    function applyTransform(px, animate, slow) {
      track.classList.toggle("is-dragging", !animate);
      track.classList.toggle("is-slow-transition", animate && slow === true);
      track.style.transform = "translate3d(" + -px + "px, 0, 0)";
    }

    function goTo(i, animate, slow) {
      index = Math.max(0, Math.min(maxIndex(), i));
      applyTransform(offsetFor(index), animate !== false, slow === true);
      updateDots();
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

    function bindNav(el, dir) {
      if (!el) return;
      el.addEventListener("click", function (e) {
        e.preventDefault();
        hideSwipeHint();
        if (dir === "prev") prev(true);
        else next(true);
        resetAutoplay();
      });
    }

    bindNav(prevBtn, "prev");
    bindNav(nextBtn, "next");

    dotButtons.forEach(function (dot, i) {
      dot.addEventListener("click", function (e) {
        e.preventDefault();
        hideSwipeHint();
        goTo(i, true, true);
        resetAutoplay();
      });
    });

    layout.addEventListener("mouseenter", pauseAutoplay);
    layout.addEventListener("mouseleave", resetAutoplay);

    track.addEventListener("dragstart", function (e) {
      e.preventDefault();
    });

    function onPointerMove(e) {
      if (e.pointerId !== drag.pointerId) return;
      drag.delta = e.clientX - drag.startX;
      if (!drag.active && Math.abs(drag.delta) > dragThreshold) {
        drag.active = true;
        track.classList.add("is-dragging");
        pauseAutoplay();
        hideSwipeHint();
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
      drag.active = false;
      drag.pointerId = null;
      track.classList.remove("is-dragging");
      if (!wasActive) return;
      if (Math.abs(drag.delta) > stepSize() * 0.12) {
        if (drag.delta > 0) prev(true);
        else next(true);
      } else {
        goTo(index, true, true);
      }
      resetAutoplay();
    }

    track.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "mouse" && e.button !== 0) return;
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
    document.addEventListener("DOMContentLoaded", initTestimonialsSlider);
  } else {
    initTestimonialsSlider();
  }
})();
