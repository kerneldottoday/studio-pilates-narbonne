(function () {
  var hero = document.querySelector(".master-hero-home");
  var wrap = document.querySelector(".hero-home-video");
  var video = wrap && wrap.querySelector("video");
  if (!hero || !video) return;

  hero.classList.add("hero-home-has-video");
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  function playHeroVideo() {
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {
        /* Autoplay bloqué : le poster reste visible */
      });
    }
  }

  if (video.readyState >= 2) {
    playHeroVideo();
  } else {
    video.addEventListener("canplay", playHeroVideo, { once: true });
  }

  document.addEventListener(
    "visibilitychange",
    function () {
      if (!document.hidden && video.paused) playHeroVideo();
    },
    false
  );
})();
