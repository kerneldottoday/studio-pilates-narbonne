(function () {
  var catalog = null;
  var selected = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function euro(cents) {
    return (Number(cents) / 100).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });
  }

  function renderProducts(list) {
    var root = $("[data-studio-grid]");
    if (!root) return;
    var units = list.filter(function (p) {
      return p.group !== "pack";
    });
    var packs = list.filter(function (p) {
      return p.group === "pack";
    });
    root.innerHTML = "";
    [
      { title: "À l’unité", items: units },
      { title: "Cartes", items: packs },
    ].forEach(function (block) {
      if (!block.items.length) return;
      var section = document.createElement("div");
      section.className = "studio-group";
      section.innerHTML = "<h2>" + block.title + "</h2>";
      var grid = document.createElement("div");
      grid.className = "studio-grid";
      block.items.forEach(function (product) {
        var card = document.createElement("article");
        card.className = "studio-card" + (product.featured ? " studio-card--featured" : "");
        card.innerHTML =
          (product.featured ? '<span class="studio-badge">Le plus choisi</span>' : "") +
          "<h3>" +
          escapeHtml(product.name) +
          "</h3>" +
          "<p>" +
          escapeHtml(product.description || "") +
          "</p>" +
          '<p class="studio-meta">' +
          product.credits +
          " crédit" +
          (product.credits > 1 ? "s" : "") +
          (product.validityMonths ? " · valable " + product.validityMonths + " mois" : "") +
          (product.duration ? " · " + escapeHtml(product.duration) : "") +
          "</p>" +
          '<div class="studio-card-row"><span class="studio-price">' +
          euro(product.priceCents) +
          '</span><button type="button" class="cta w-button" data-buy="' +
          escapeHtml(product.id) +
          '">Acheter</button></div>';
        grid.appendChild(card);
      });
      section.appendChild(grid);
      root.appendChild(section);
    });
  }

  function renderSchedule(slots) {
    var root = $("[data-studio-schedule]");
    if (!root) return;
    if (!slots || !slots.length) {
      root.hidden = true;
      return;
    }
    var days = [];
    slots.forEach(function (slot) {
      if (days.indexOf(slot.day) < 0) days.push(slot.day);
    });
    root.innerHTML =
      "<h2>Planning type</h2>" +
      '<p class="studio-note"><a href="/studio/reserver">Réserver un créneau</a> avec vos crédits — Reformer d’un côté, Mat / Yoga / RESET / Stretching de l’autre.</p>' +
      '<div class="studio-days">' +
      days
        .map(function (day) {
          var items = slots.filter(function (s) {
            return s.day === day;
          });
          return (
            '<div class="studio-day"><h3>' +
            escapeHtml(day) +
            "</h3>" +
            items
              .map(function (s) {
                return (
                  '<p class="studio-slot"><strong>' +
                  escapeHtml(s.start) +
                  "–" +
                  escapeHtml(s.end) +
                  "</strong>" +
                  escapeHtml(s.title) +
                  " · " +
                  escapeHtml(s.level) +
                  "</p>"
                );
              })
              .join("") +
            "</div>"
          );
        })
        .join("") +
      "</div>";
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function openBuy(product) {
    selected = product;
    var dialog = $("[data-studio-dialog]");
    var form = $("[data-buy-form]");
    $("[data-buy-title]").textContent = product.name;
    $("[data-buy-price]").textContent = euro(product.priceCents);
    $("[data-buy-error]").textContent = "";
    if (form) {
      form.reset();
      form.qty.value = "1";
    }
    if (dialog && typeof dialog.showModal === "function") dialog.showModal();
  }

  function startCheckout(form) {
    if (!selected) return;
    var button = form.querySelector("[type=submit]");
    var errorEl = $("[data-buy-error]");
    if (form && !form.terms.checked) {
      errorEl.textContent = "Merci d’accepter les conditions de vente des formules.";
      return;
    }
    var payload = {
      productId: selected.id,
      qty: Number(form.qty.value || 1),
      name: String(form.name.value || "").trim(),
      email: String(form.email.value || "").trim(),
      phone: String(form.phone.value || "").trim(),
      locale: "fr",
      acceptTerms: Boolean(form.terms && form.terms.checked),
    };
    button.disabled = true;
    errorEl.textContent = "";
    fetch("/api/studio/checkout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { res: res, data: data };
        });
      })
      .then(function (result) {
        if (result.data && result.data.url) {
          window.location.href = result.data.url;
          return;
        }
        errorEl.textContent =
          (result.data && result.data.error) || "Paiement impossible pour le moment.";
        button.disabled = false;
      })
      .catch(function () {
        errorEl.textContent = "Réseau indisponible.";
        button.disabled = false;
      });
  }

  function confirmSuccess() {
    var root = $("[data-studio-ok]");
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var sessionId = params.get("session_id");
    var mock = params.get("mock") === "1";
    if (!sessionId) {
      root.innerHTML =
        "<h1>Paiement enregistré</h1><p>Votre formule est bien notée. Souhila vous contacte pour le planning.</p>";
      return;
    }
    fetch("/api/studio/checkout", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId }),
    })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var order = data.order || {};
        root.innerHTML =
          "<h1>Merci</h1><p>" +
          (mock ? "Paiement d’essai enregistré localement. " : "Paiement confirmé. ") +
          "Formule : <strong>" +
          escapeHtml(order.label || order.productName || "cours") +
          "</strong></p><p>Référence : " +
          escapeHtml(order.sessionId || sessionId) +
          "</p><p>Vous pouvez maintenant <a href='/studio/reserver?email=" +
          encodeURIComponent(order.customerEmail || "") +
          "'>réserver un créneau</a> avec vos crédits.</p><p><a href='/studio/acheter'>Retour aux formules</a></p>";
      })
      .catch(function () {
        root.innerHTML =
          "<h1>Merci</h1><p>Si le paiement a abouti, Souhila a bien reçu la commande. En cas de doute, écrivez à lahissou@hotmail.fr.</p>";
      });
  }

  function bootBuy() {
    var banner = $("[data-studio-banner]");
    fetch("/api/studio/catalog", { credentials: "same-origin" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        catalog = data;
        if (banner) {
          if (!data.canBuy) {
            banner.hidden = false;
            banner.className = "studio-banner studio-banner--warn";
            banner.textContent =
              "La vente de formules n’est pas encore ouverte. Les réservations passent toujours par bsport.";
          } else if (data.mock) {
            banner.hidden = false;
            banner.textContent = data.live
              ? "Mode local : le paiement est simulé (pas de débit). Les boutons du site public pointent vers ces pages."
              : "Mode local : le paiement est simulé. Coche « Ouvrir la vente » dans l’admin pour rediriger les boutons publics.";
          } else if (!data.live) {
            banner.hidden = false;
            banner.textContent =
              "Essai Stripe. La vente n’est pas encore ouverte au public : les CTA du site restent sur bsport.";
          }
        }
        renderProducts(data.products || []);
        renderSchedule(data.schedule || []);
      })
      .catch(function () {
        if (banner) {
          banner.hidden = false;
          banner.className = "studio-banner studio-banner--warn";
          banner.textContent = "Catalogue indisponible. Relancez le serveur local.";
        }
      });

    document.addEventListener("click", function (event) {
      var buy = event.target.closest("[data-buy]");
      if (buy && catalog) {
        var product = (catalog.products || []).find(function (p) {
          return p.id === buy.getAttribute("data-buy");
        });
        if (product) openBuy(product);
      }
    });

    var form = $("[data-buy-form]");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        startCheckout(form);
      });
    }
    var close = $("[data-buy-close]");
    if (close) {
      close.addEventListener("click", function () {
        var dialog = $("[data-studio-dialog]");
        if (dialog) dialog.close();
      });
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    if ($("[data-studio-ok]")) confirmSuccess();
    if ($("[data-studio-grid]")) bootBuy();
  });
})();
