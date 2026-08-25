(function () {
  "use strict";

  var STORAGE_KEY = "spn_cookie_consent_v1";

  var TEXT = {
    fr: {
      fab: "Personnaliser les préférences",
      bannerTitle: "Cookies",
      bannerText:
        "Mesure d’audience uniquement si vous acceptez.",
      customize: "Préférences",
      rejectAll: "Refuser",
      acceptAll: "Accepter",
      save: "Enregistrer mes préférences",
      modalTitle: "Personnaliser les préférences en matière de consentement",
      modalIntro:
        "Nous utilisons des cookies pour vous aider à naviguer efficacement et à exécuter certaines fonctionnalités. Vous trouverez des informations détaillées sur tous les cookies sous chaque catégorie de consentement ci-dessous.",
      alwaysActive: "Toujours actif",
      categories: {
        necessary: {
          title: "Nécessaires",
          desc:
            "Les cookies nécessaires sont cruciaux pour les fonctions de base du site Web et celui-ci ne fonctionnera pas comme prévu sans eux. Ces cookies ne stockent aucune donnée personnellement identifiable.",
        },
        functional: {
          title: "Fonctionnels",
          desc:
            "Les cookies fonctionnels permettent d'exécuter certaines fonctionnalités telles que le partage du contenu du site Web sur des plateformes de médias sociaux, la collecte de commentaires et d'autres fonctionnalités tierces.",
        },
        analytics: {
          title: "Analytiques",
          desc:
            "Les cookies analytiques sont utilisés pour comprendre comment les visiteurs interagissent avec le site Web. Ces cookies aident à fournir des informations sur le nombre de visiteurs, le taux de rebond, la source de trafic, etc.",
        },
        performance: {
          title: "Performance",
          desc:
            "Les cookies de performance sont utilisés pour comprendre et analyser les indices de performance clés du site Web, ce qui permet de fournir une meilleure expérience utilisateur aux visiteurs.",
        },
        advertising: {
          title: "Publicitaires",
          desc:
            "Les cookies de publicité sont utilisés pour fournir aux visiteurs des publicités personnalisées basées sur les pages visitées précédemment et analyser l'efficacité de la campagne publicitaire.",
        },
      },
    },
    en: {
      fab: "Cookie preferences",
      bannerTitle: "Cookies",
      bannerText:
        "Audience measurement only if you accept.",
      customize: "Preferences",
      rejectAll: "Reject",
      acceptAll: "Accept",
      save: "Save my preferences",
      modalTitle: "Customize consent preferences",
      modalIntro:
        "We use cookies to help you navigate efficiently and perform certain features. You will find detailed information about all cookies under each consent category below.",
      alwaysActive: "Always active",
      categories: {
        necessary: {
          title: "Necessary",
          desc:
            "Necessary cookies are essential for basic website functions. The site will not work as expected without them. These cookies do not store personally identifiable data.",
        },
        functional: {
          title: "Functional",
          desc:
            "Functional cookies enable features such as sharing website content on social platforms, collecting feedback, and other third-party features.",
        },
        analytics: {
          title: "Analytics",
          desc:
            "Analytics cookies help us understand how visitors interact with the website, including visitor counts, bounce rate, and traffic sources.",
        },
        performance: {
          title: "Performance",
          desc:
            "Performance cookies help us understand and analyze key performance indicators to deliver a better user experience.",
        },
        advertising: {
          title: "Advertising",
          desc:
            "Advertising cookies deliver personalized ads based on previously visited pages and measure campaign effectiveness.",
        },
      },
    },
  };

  function lang() {
    if (location.pathname.indexOf("/en") === 0) return "en";
    var htmlLang = (document.documentElement.lang || "fr").toLowerCase();
    return htmlLang.indexOf("en") === 0 ? "en" : "fr";
  }

  function t() {
    return TEXT[lang()];
  }

  function defaultConsent() {
    return {
      necessary: true,
      functional: false,
      analytics: false,
      performance: false,
      advertising: false,
    };
  }

  function allConsent() {
    return {
      necessary: true,
      functional: true,
      analytics: true,
      performance: true,
      advertising: true,
    };
  }

  function readConsent() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      return Object.assign(defaultConsent(), parsed, { necessary: true });
    } catch (_e) {
      return null;
    }
  }

  function writeConsent(consent) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  }

  function loadAnalytics() {
    if (document.querySelector('script[src*="/_vercel/insights/script.js"]')) return;
    window.va =
      window.va ||
      function () {
        (window.vaq = window.vaq || []).push(arguments);
      };
    var script = document.createElement("script");
    script.defer = true;
    script.src = "/_vercel/insights/script.js";
    document.body.appendChild(script);
  }

  function applyConsent(consent) {
    if (consent.analytics) loadAnalytics();
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function buildToggle(id, checked, disabled) {
    var label = el("label", "spn-cookie-switch");
    var input = document.createElement("input");
    input.type = "checkbox";
    input.id = "spn-cookie-" + id;
    input.checked = checked;
    input.disabled = disabled;
    var slider = el("span", "spn-cookie-switch__slider");
    label.appendChild(input);
    label.appendChild(slider);
    return { label: label, input: input };
  }

  var state = {
    banner: null,
    modal: null,
    fab: null,
    toggles: {},
  };

  function openModal() {
    state.modal.hidden = false;
    document.documentElement.style.overflow = "hidden";
  }

  function closeModal() {
    state.modal.hidden = true;
    document.documentElement.style.overflow = "";
  }

  function hideBanner() {
    state.banner.hidden = true;
  }

  function syncToggles(consent) {
    Object.keys(state.toggles).forEach(function (key) {
      if (key === "necessary") return;
      state.toggles[key].checked = !!consent[key];
    });
  }

  function readToggles() {
    var consent = defaultConsent();
    Object.keys(state.toggles).forEach(function (key) {
      if (key === "necessary") return;
      consent[key] = state.toggles[key].checked;
    });
    return consent;
  }

  function commit(consent) {
    writeConsent(consent);
    applyConsent(consent);
    hideBanner();
    closeModal();
  }

  function render() {
    var copy = t();
    var root = el("div");
    root.id = "spn-cookie-root";

    state.fab = el("button", "spn-cookie-fab", copy.fab);
    state.fab.type = "button";
    state.fab.setAttribute("aria-label", copy.fab);
    state.fab.addEventListener("click", openModal);

    state.banner = el("div", "spn-cookie-banner");
    state.banner.setAttribute("role", "dialog");
    state.banner.setAttribute("aria-live", "polite");
    state.banner.setAttribute("aria-label", copy.bannerTitle);
    state.banner.appendChild(el("h2", "spn-cookie-banner__title", copy.bannerTitle));
    state.banner.appendChild(el("p", "spn-cookie-banner__text", copy.bannerText));

    var bannerActions = el("div", "spn-cookie-actions");
    var acceptBtn = el("button", "spn-cookie-btn spn-cookie-btn--primary", copy.acceptAll);
    acceptBtn.type = "button";
    acceptBtn.addEventListener("click", function () {
      commit(allConsent());
    });
    var rejectBtn = el("button", "spn-cookie-btn", copy.rejectAll);
    rejectBtn.type = "button";
    rejectBtn.addEventListener("click", function () {
      commit(defaultConsent());
    });
    var customizeBtn = el("button", "spn-cookie-btn spn-cookie-btn--ghost", copy.customize);
    customizeBtn.type = "button";
    customizeBtn.addEventListener("click", openModal);
    bannerActions.appendChild(acceptBtn);
    bannerActions.appendChild(rejectBtn);
    bannerActions.appendChild(customizeBtn);
    state.banner.appendChild(bannerActions);

    state.modal = el("div", "spn-cookie-modal");
    state.modal.hidden = true;
    state.modal.setAttribute("role", "dialog");
    state.modal.setAttribute("aria-modal", "true");

    var panel = el("div", "spn-cookie-modal__panel");
    var header = el("div", "spn-cookie-modal__header");
    header.appendChild(el("h2", "spn-cookie-modal__title", copy.modalTitle));
    var closeBtn = el("button", "spn-cookie-modal__close", "×");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close");
    closeBtn.addEventListener("click", closeModal);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    panel.appendChild(el("p", "spn-cookie-modal__intro", copy.modalIntro));

    var categories = el("div", "spn-cookie-categories");
    ["necessary", "functional", "analytics", "performance", "advertising"].forEach(function (id) {
      var cat = copy.categories[id];
      var block = el("article", "spn-cookie-category");
      var head = el("div", "spn-cookie-category__head");
      head.appendChild(el("h3", "spn-cookie-category__title", cat.title));
      if (id === "necessary") {
        head.appendChild(el("span", "spn-cookie-badge", copy.alwaysActive));
      } else {
        var toggle = buildToggle(id, false, false);
        state.toggles[id] = toggle.input;
        head.appendChild(toggle.label);
      }
      block.appendChild(head);
      block.appendChild(el("p", "spn-cookie-category__desc", cat.desc));
      categories.appendChild(block);
    });
    panel.appendChild(categories);

    var footer = el("div", "spn-cookie-modal__footer");
    var modalReject = el("button", "spn-cookie-btn", copy.rejectAll);
    modalReject.type = "button";
    modalReject.addEventListener("click", function () {
      syncToggles(defaultConsent());
      commit(defaultConsent());
    });
    var modalSave = el("button", "spn-cookie-btn spn-cookie-btn--accent", copy.save);
    modalSave.type = "button";
    modalSave.addEventListener("click", function () {
      commit(readToggles());
    });
    var modalAccept = el("button", "spn-cookie-btn spn-cookie-btn--primary", copy.acceptAll);
    modalAccept.type = "button";
    modalAccept.addEventListener("click", function () {
      syncToggles(allConsent());
      commit(allConsent());
    });
    footer.appendChild(modalReject);
    footer.appendChild(modalSave);
    footer.appendChild(modalAccept);
    panel.appendChild(footer);

    state.modal.appendChild(panel);
    state.modal.addEventListener("click", function (event) {
      if (event.target === state.modal) closeModal();
    });

    root.appendChild(state.fab);
    root.appendChild(state.banner);
    root.appendChild(state.modal);
    document.body.appendChild(root);

    var saved = readConsent();
    if (saved) {
      syncToggles(saved);
      hideBanner();
      applyConsent(saved);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }
})();
