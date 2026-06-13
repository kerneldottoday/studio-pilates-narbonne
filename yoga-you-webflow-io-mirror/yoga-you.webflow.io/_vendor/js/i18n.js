(function () {
  var I18N = {
    fr: {
      "nav.home": "Accueil",
      "nav.about": "Le studio",
      "nav.classes": "Cours",
      "nav.contact": "Contact",
      "nav.planning": "Planning",
      "nav.more": "Plus",
      "nav.expertises": "Voyage",
      "nav.classPage": "Détail cours",
      "nav.blog": "Compléments alimentaires",
      "nav.pricing": "Tarifs",
      "nav.legal": "Mentions légales",
      "nav.allPages": "Toutes les pages",
      "nav.cart": "Panier",
      "footer.navigation": "Navigation",
      "footer.information": "Informations",
      "hero.location": "Studio Pilates, Narbonne",
      "hero.title":
        "Un espace calme pour renforcer son corps et libérer son esprit.",
      "hero.subtitle":
        "Une pratique fidèle aux principes de Joseph Pilates : centrage, concentration, précision, contrôle, respiration, fluidité et alignement, en petits groupes à Narbonne.",
      "hero.cta1": "Réserver un cours",
      "hero.cta2": "Voir le planning",
      "footer.copyright":
        "© 2026 Studio Pilates Narbonne, Souhila Chekara, instructrice Pilates",
      "footer.tagline": "Un corps plus libre, chaque jour",
      "cart.title": "Votre panier",
      "cart.empty": "Aucun article.",
      "cart.subtotal": "Sous-total",
      "cart.checkout": "Passer au paiement",
      "cart.remove": "Retirer",
      "legal.pageTitle": "Mentions légales",
      "legal.pageLead":
        "Informations légales, politique de confidentialité et conditions générales du site Studio Pilates Narbonne. Le contenu s'affiche en français ou en anglais selon le sélecteur de langue du site.",
      "legal.navInfo": "Informations légales",
      "legal.navPrivacy": "Politique de confidentialité",
      "legal.navTerms": "Conditions générales",
    },
    en: {
      "nav.home": "Home",
      "nav.about": "The studio",
      "nav.classes": "Classes",
      "nav.contact": "Contact",
      "nav.planning": "Schedule",
      "nav.more": "More",
      "nav.expertises": "Retreat",
      "nav.classPage": "Class detail",
      "nav.blog": "Supplements",
      "nav.pricing": "Pricing",
      "nav.legal": "Legal notice",
      "nav.allPages": "All pages",
      "nav.cart": "Cart",
      "footer.navigation": "Navigation",
      "footer.information": "Information",
      "hero.location": "Studio Pilates, Narbonne",
      "hero.title": "A calm space to strengthen your body and free your mind.",
      "hero.subtitle":
        "A practice true to Joseph Pilates principles: centering, concentration, precision, control, breath, flow and alignment, in small groups in Narbonne.",
      "hero.cta1": "Book a class",
      "hero.cta2": "View schedule",
      "footer.copyright":
        "© 2026 Studio Pilates Narbonne, Souhila Chekara, Pilates instructor",
      "footer.tagline": "A freer body, every day",
      "cart.title": "Your cart",
      "cart.empty": "No items found.",
      "cart.subtotal": "Subtotal",
      "cart.checkout": "Continue to checkout",
      "cart.remove": "Remove",
      "legal.pageTitle": "Legal notice",
      "legal.pageLead":
        "Legal information, privacy policy and terms and conditions for the Studio Pilates Narbonne website. Content is shown in French or English according to the site language selector.",
      "legal.navInfo": "Legal information",
      "legal.navPrivacy": "Privacy policy",
      "legal.navTerms": "Terms and conditions",
    },
  };

  var PAGE_META = {
    "homepage.html": {
      title: {
        fr: "Studio Pilates Narbonne | Accueil",
        en: "Studio Pilates Narbonne | Home",
      },
      description: {
        fr: "Studio Pilates Narbonne, Pilates Reformer, Mat et Yoga Ashtanga en petits groupes à Narbonne. Cours avec Souhila Chekara, instructrice certifiée.",
        en: "Studio Pilates Narbonne: Reformer, Mat and Ashtanga Yoga in small groups in Narbonne. Classes with certified instructor Souhila Chekara.",
      },
    },
    "classes.html": {
      title: {
        fr: "Nos cours | Studio Pilates Narbonne",
        en: "Our classes | Studio Pilates Narbonne",
      },
      description: {
        fr: "Pilates Reformer, Mat, Yoga Ashtanga, RESET et cours privés au Studio Pilates Narbonne. Réservez sur bsport.",
        en: "Pilates Reformer, Mat, Ashtanga Yoga, RESET and private sessions at Studio Pilates Narbonne. Book on bsport.",
      },
    },
    "contact.html": {
      title: {
        fr: "Contact | Studio Pilates Narbonne",
        en: "Contact | Studio Pilates Narbonne",
      },
      description: {
        fr: "Contactez le Studio Pilates Narbonne : questions, réservation et orientation vers le cours adapté.",
        en: "Contact Studio Pilates Narbonne: questions, booking and guidance to the right class.",
      },
    },
    "planning.html": {
      title: {
        fr: "Planning | Studio Pilates Narbonne",
        en: "Schedule | Studio Pilates Narbonne",
      },
      description: {
        fr: "Planning hebdomadaire du Studio Pilates Narbonne. Horaires Reformer, Mat, Yoga Ashtanga et RESET.",
        en: "Weekly schedule at Studio Pilates Narbonne. Reformer, Mat, Ashtanga Yoga and RESET times.",
      },
    },
    "pricing.html": {
      title: {
        fr: "Tarifs | Studio Pilates Narbonne",
        en: "Pricing | Studio Pilates Narbonne",
      },
      description: {
        fr: "Tarifs Reformer, Mat et Yoga Ashtanga au Studio Pilates Narbonne. Achat en ligne sur bsport.",
        en: "Reformer, Mat and Ashtanga Yoga pricing at Studio Pilates Narbonne. Buy online on bsport.",
      },
    },
    "legal.html": {
      title: {
        fr: "Mentions légales | Studio Pilates Narbonne",
        en: "Legal notice | Studio Pilates Narbonne",
      },
    },
  };

  var STORAGE_KEY = "studio-pilates-lang";
  var TEXT_MAP = window.STUDIO_TEXT_MAP || {};
  var LANG_TRANSITION_MS = 280;
  var langTransitionActive = false;

  function getLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "fr";
  }

  function hasOnlyInlineChildren(el) {
    for (var i = 0; i < el.children.length; i++) {
      var tag = el.children[i].tagName;
      if (tag !== "STRONG" && tag !== "B" && tag !== "EM" && tag !== "I" && tag !== "SPAN" && tag !== "BR") {
        return false;
      }
    }
    return true;
  }

  function isTextLeaf(el) {
    if (!el || el.hasAttribute("data-i18n") || el.hasAttribute("data-i18n-skip")) {
      return false;
    }
    if (el.children.length === 0) {
      return Boolean(el.textContent && el.textContent.trim());
    }
    if (el.querySelector("a")) {
      return false;
    }
    return hasOnlyInlineChildren(el) && Boolean(el.textContent && el.textContent.trim());
  }

  function applyKeyedTranslations(lang) {
    var dict = I18N[lang] || I18N.fr;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });
  }

  function applyInlineTranslations(lang) {
    document.querySelectorAll("[data-i18n-en]").forEach(function (el) {
      if (!el.dataset.i18nFr) {
        el.dataset.i18nFr = el.textContent;
      }
      var en = el.getAttribute("data-i18n-en");
      el.textContent = lang === "en" && en ? en : el.dataset.i18nFr;
    });

    document.querySelectorAll("[data-i18n-html-en]").forEach(function (el) {
      if (!el.dataset.i18nHtmlFr) {
        el.dataset.i18nHtmlFr = el.innerHTML;
      }
      var en = el.getAttribute("data-i18n-html-en");
      el.innerHTML = lang === "en" && en ? en : el.dataset.i18nHtmlFr;
    });

    document.querySelectorAll("body *").forEach(function (el) {
      if (!isTextLeaf(el)) {
        return;
      }
      var original = el.dataset.i18nOriginal || el.textContent.trim();
      if (!el.dataset.i18nOriginal) {
        el.dataset.i18nOriginal = original;
      }
      if (lang === "en" && TEXT_MAP[original]) {
        el.textContent = TEXT_MAP[original];
      } else {
        el.textContent = el.dataset.i18nOriginal;
      }
    });
  }

  function applyPageMeta(lang) {
    var page = window.location.pathname.split("/").pop() || "homepage.html";
    if (page === "" || page === "/") {
      page = "homepage.html";
    }
    var meta = PAGE_META[page];
    var html = document.documentElement;
    if (!html.dataset.titleFr) {
      html.dataset.titleFr = document.title;
      var desc = document.querySelector('meta[name="description"]');
      if (desc) {
        html.dataset.descFr = desc.getAttribute("content") || "";
      }
    }
    if (meta && meta.title && meta.title[lang]) {
      document.title = meta.title[lang];
    } else if (lang === "fr" && html.dataset.titleFr) {
      document.title = html.dataset.titleFr;
    }
    var descEl = document.querySelector('meta[name="description"]');
    if (descEl && meta && meta.description && meta.description[lang]) {
      descEl.setAttribute("content", meta.description[lang]);
    } else if (descEl && lang === "fr" && html.dataset.descFr) {
      descEl.setAttribute("content", html.dataset.descFr);
    }
  }

  function applyLang(lang) {
    document.documentElement.lang = lang === "en" ? "en" : "fr";
    applyKeyedTranslations(lang);
    applyInlineTranslations(lang);
    applyPageMeta(lang);
  }

  function updateSwitcher(lang) {
    document.querySelectorAll("[data-lang-switch] [data-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("w--current", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
      btn.disabled = false;
    });
  }

  function prefersReducedMotion() {
    return (
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  function commitLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
    applyLang(lang);
    updateSwitcher(lang);
  }

  function runLangTransition(lang, done) {
    if (prefersReducedMotion()) {
      done();
      return;
    }

    var body = document.body;
    body.classList.add("is-lang-fading");
    window.setTimeout(function () {
      done();
      window.requestAnimationFrame(function () {
        body.classList.remove("is-lang-fading");
      });
    }, LANG_TRANSITION_MS);
  }

  function bindSwitcher() {
    document.querySelectorAll("[data-lang-switch] [data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
      });
    });
  }

  function setLang(lang, options) {
    lang = lang === "en" ? "en" : "fr";
    options = options || {};
    if (lang === getLang()) {
      updateSwitcher(lang);
      return;
    }
    if (langTransitionActive) {
      return;
    }

    var animate = options.animate !== false;
    if (!animate) {
      commitLang(lang);
      return;
    }

    langTransitionActive = true;
    document.querySelectorAll("[data-lang-switch] [data-lang]").forEach(function (btn) {
      btn.disabled = true;
    });

    runLangTransition(lang, function () {
      commitLang(lang);
      langTransitionActive = false;
      document.querySelectorAll("[data-lang-switch] [data-lang]").forEach(function (btn) {
        btn.disabled = false;
      });
    });
  }

  function removeWebflowBadge() {
    document.querySelectorAll(".w-webflow-badge").forEach(function (el) {
      el.remove();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var lang = getLang();
    setLang(lang, { animate: false });
    bindSwitcher();
    removeWebflowBadge();
  });

  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(removeWebflowBadge).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  window.studioSetLang = setLang;
})();
