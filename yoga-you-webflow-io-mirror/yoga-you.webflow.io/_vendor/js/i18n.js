(function () {
  var I18N = {
    fr: {
      "nav.home": "Accueil",
      "nav.about": "Le studio",
      "nav.classes": "Cours",
      "nav.contact": "Contact",
      "nav.more": "Plus",
      "nav.expertises": "Voyage",
      "nav.classPage": "Détail cours",
      "nav.blog": "Compléments alimentaires",
      "nav.pricing": "Tarifs",
      "nav.legal": "Mentions",
      "nav.allPages": "Toutes les pages",
      "nav.cart": "Panier",
      "hero.location": "Studio Pilates, Narbonne",
      "hero.title": "Un espace calme pour renforcer son corps et libérer son esprit.",
      "hero.subtitle":
        "Une pratique fidèle aux principes de Joseph Pilates : précision, contrôle, respiration et alignement, en petits groupes à Narbonne.",
      "hero.cta1": "Réserver un cours",
      "hero.cta2": "Voir le planning",
      "footer.copyright":
        "© 2026 Studio Pilates Narbonne, Souhila Chekara, instructrice Pilates",
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
      "nav.more": "More",
      "nav.expertises": "Retreat",
      "nav.classPage": "Class detail",
      "nav.blog": "Supplements",
      "nav.pricing": "Pricing",
      "nav.legal": "Legal",
      "nav.allPages": "All pages",
      "nav.cart": "Cart",
      "hero.location": "Studio Pilates, Narbonne",
      "hero.title": "A calm space to strengthen your body and free your mind.",
      "hero.subtitle":
        "A practice true to Joseph Pilates principles: precision, control, breath and alignment, in small groups in Narbonne.",
      "hero.cta1": "Book a class",
      "hero.cta2": "View schedule",
      "footer.copyright":
        "© 2026 Studio Pilates Narbonne, Souhila Chekara, Pilates instructor",
      "hero.subtitle":
        "A practice true to Joseph Pilates principles: precision, control, breath and alignment, in small groups in Narbonne.",
      "hero.cta1": "Book a class",
      "hero.cta2": "View schedule",
      "footer.copyright":
      "legal.pageTitle": "Legal notice",
      "legal.pageLead":
        "Legal information, privacy policy and terms and conditions for the Studio Pilates Narbonne website. Content is shown in French or English according to the site language selector.",
      "legal.navInfo": "Legal information",
      "legal.navPrivacy": "Privacy policy",
      "legal.navTerms": "Terms and conditions",
        "© 2026 Studio Pilates Narbonne — Souhila Chekara, Pilates instructor",
      "cart.title": "Your cart",
      "cart.empty": "No items found.",
      "cart.subtotal": "Subtotal",
      "cart.checkout": "Continue to checkout",
      "cart.remove": "Remove",
    },
  };

  var STORAGE_KEY = "studio-pilates-lang";

  function getLang() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved === "en" ? "en" : "fr";
  }

  function setLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang === "en" ? "en" : "fr");
    document.documentElement.lang = lang === "en" ? "en" : "fr";
    applyLang(lang);
    updateSwitcher(lang);
  }

  function applyLang(lang) {
    var dict = I18N[lang] || I18N.fr;
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      if (dict[key]) el.textContent = dict[key];
    });
  }

  function updateSwitcher(lang) {
    document.querySelectorAll("[data-lang-switch] [data-lang]").forEach(function (btn) {
      var active = btn.getAttribute("data-lang") === lang;
      btn.classList.toggle("w--current", active);
      btn.setAttribute("aria-pressed", active ? "true" : "false");
    });
  }

  function bindSwitcher() {
    document.querySelectorAll("[data-lang-switch] [data-lang]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        setLang(btn.getAttribute("data-lang"));
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
    document.documentElement.lang = lang === "en" ? "en" : "fr";
    applyLang(lang);
    updateSwitcher(lang);
    bindSwitcher();
    removeWebflowBadge();
  });

  if (typeof MutationObserver !== "undefined") {
    new MutationObserver(removeWebflowBadge).observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }
})();
