(function () {
  var root = document.querySelector("[data-voyage-film]");
  if (!root) return;

  var trigger = root.querySelector("[data-voyage-film-play]");
  if (!trigger) return;

  function play() {
    var src = root.getAttribute("data-embed");
    if (!src) return;
    var frame = document.createElement("iframe");
    frame.src = src;
    frame.title = root.getAttribute("data-title") || "Film";
    frame.allow =
      "accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.setAttribute("allowfullscreen", "");
    frame.setAttribute("referrerpolicy", "origin");
    root.classList.add("is-playing");
    root.replaceChildren(frame);
  }

  trigger.addEventListener("click", play);
})();
