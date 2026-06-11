(function () {
  function initDisciplinesTabs() {
    var root = document.querySelector("[data-disciplines-tabs]");
    if (!root || root.dataset.tabsReady === "true") return;

    var buttons = Array.from(root.querySelectorAll(".disciplines-tab-btn"));
    var panes = Array.from(root.querySelectorAll(".disciplines-tab-pane"));
    if (!buttons.length || !panes.length) return;

    root.dataset.tabsReady = "true";

    var activeId =
      (buttons.find(function (b) {
        return b.classList.contains("w--current");
      }) || buttons[0]).getAttribute("data-discipline");

    function activate(id) {
      if (!id) return;

      buttons.forEach(function (btn) {
        var on = btn.getAttribute("data-discipline") === id;
        btn.classList.toggle("w--current", on);
        btn.setAttribute("aria-selected", on ? "true" : "false");
      });

      panes.forEach(function (pane) {
        pane.classList.toggle("w--tab-active", pane.getAttribute("data-discipline") === id);
      });

      activeId = id;
    }

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        activate(btn.getAttribute("data-discipline"));
      });
    });

    activate(activeId);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initDisciplinesTabs);
  } else {
    initDisciplinesTabs();
  }
})();
