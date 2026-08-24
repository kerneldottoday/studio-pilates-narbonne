(function () {
  var COPY = {
    fr: {
      example: "Exemple",
      add: "Ajouter au panier",
      added: "Ajouté au panier",
      view: "Voir le produit",
      cart: "Panier",
      empty: "Votre panier est vide.",
      continue: "Voir la gamme",
      qty: "Quantité",
      remove: "Retirer",
      subtotal: "Sous-total",
      shipping: "Livraison",
      total: "Total",
      kicker: "Compléments alimentaires",
      title: "La boutique du studio",
      lead: "La gamme sélectionnée par Souhila, à retirer au 8 Rue du Luxembourg ou à recevoir chez vous. Elle prépare et envoie chaque commande.",
      cartTitle: "Votre panier",
      pay: "Payer par carte",
      closed: "La boutique n’est pas encore ouverte. Les fiches sont des exemples, le paiement Stripe se teste en local.",
      missing: "Produit introuvable.",
      back: "Retour à la boutique",
      error: "Le paiement n’a pas pu démarrer.",
      stripe: "Stripe n’est pas encore configuré. Le panier et le catalogue fonctionnent déjà.",
      notice: "Gamme en préparation. Photos, noms et prix définitifs à venir. Les compléments alimentaires ne se substituent pas à une alimentation variée.",
      successTitle: "Commande confirmée",
      successBody: "Merci. Souhila a reçu la commande et s’occupe de l’envoi ou du retrait au studio.",
      cancelTitle: "Paiement annulé",
      cancelBody: "Aucun montant n’a été débité. Vous pouvez reprendre votre panier.",
      mock: "Paiement simulé (mode test local, sans Stripe).",
      terms: "En payant, vous acceptez les conditions de vente en ligne.",
      termsLink: "Lire les conditions",
      shippingSoon: "Frais d’envoi provisoires, à confirmer. Le retrait au studio est gratuit.",
      format: "Format",
      outOfStock: "Produit indisponible pour le moment.",
      legalAnchor: "/legal#boutique-vente",
    },
    en: {
      example: "Sample",
      add: "Add to cart",
      added: "Added to cart",
      view: "View product",
      cart: "Cart",
      empty: "Your cart is empty.",
      continue: "Browse the range",
      qty: "Quantity",
      remove: "Remove",
      subtotal: "Subtotal",
      shipping: "Shipping",
      total: "Total",
      kicker: "Food supplements",
      title: "The studio shop",
      lead: "The range selected by Souhila, for pickup at 8 Rue du Luxembourg or delivery to your door. She packs and sends each order.",
      cartTitle: "Your cart",
      pay: "Pay by card",
      closed: "The shop is not open yet. These cards are placeholders; Stripe checkout can be tested locally.",
      missing: "Product not found.",
      back: "Back to the shop",
      error: "Checkout could not start.",
      stripe: "Stripe is not configured yet. The cart and catalogue already work.",
      notice: "Range in progress. Final photos, names and prices to come. Food supplements are not a substitute for a varied diet.",
      successTitle: "Order confirmed",
      successBody: "Thank you. Souhila has the order and will ship it or prepare studio pickup.",
      cancelTitle: "Payment cancelled",
      cancelBody: "Nothing was charged. You can return to your cart.",
      mock: "Simulated payment (local test mode, no Stripe).",
      terms: "By paying you accept the online sale terms.",
      termsLink: "Read the terms",
      shippingSoon: "Shipping fees are provisional, to be confirmed. Studio pickup is free.",
      format: "Size",
      outOfStock: "This product is currently unavailable.",
      legalAnchor: "/en/legal#boutique-vente",
    },
  };

  function t() {
    return COPY[window.SPNShop.isEn() ? "en" : "fr"];
  }

  function pageKind() {
    var root = document.querySelector("[data-shop-page]");
    return root ? root.getAttribute("data-shop-page") : "";
  }

  function productSlug() {
    var parts = (window.location.pathname || "").split("/").filter(Boolean);
    if (parts[0] === "en") parts.shift();
    if (parts[0] !== "boutique") return "";
    var slug = parts[1] || "";
    if (!slug || slug === "produit") return "";
    return slug;
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function tileHtml(product) {
    var shop = window.SPNShop;
    var href = shop.shopPath("product", product.slug);
    var badge =
      product.status === "placeholder"
        ? '<span class="shop-badge">' + escapeHtml(t().example) + "</span>"
        : "";
    return (
      '<article class="shop-tile">' +
      '<a class="shop-tile-media" href="' +
      href +
      '"><img src="' +
      escapeHtml(product.image) +
      '" alt="" loading="lazy"/>' +
      badge +
      "</a>" +
      '<div class="shop-tile-body">' +
      "<h2>" +
      escapeHtml(shop.productName(product)) +
      "</h2>" +
      "<p>" +
      escapeHtml(shop.productShort(product)) +
      "</p>" +
      '<div class="shop-tile-row">' +
      "<strong>" +
      escapeHtml(shop.formatPrice(product.priceCents)) +
      "</strong>" +
      '<a class="shop-text-link" href="' +
      href +
      '">' +
      escapeHtml(t().view) +
      "</a>" +
      "</div>" +
      (product.inStock === false
        ? '<p class="shop-hint">' + escapeHtml(t().outOfStock) + "</p>"
        : '<button type="button" class="cta w-button shop-add" data-add="' +
          escapeHtml(product.id) +
          '">' +
          escapeHtml(t().add) +
          "</button>") +
      "</div></article>"
    );
  }

  function renderListing(catalog) {
    var grid = document.querySelector("[data-shop-grid]");
    var notice = document.querySelector("[data-shop-notice]");
    if (notice) notice.textContent = t().notice;
    if (!grid) return;
    grid.innerHTML = (catalog.products || []).map(tileHtml).join("");
  }

  function renderProduct(catalog) {
    var root = document.querySelector("[data-shop-product-root]");
    if (!root) return;
    var product = window.SPNShop.findBySlug(catalog, productSlug());
    if (!product) {
      root.innerHTML =
        '<p class="shop-empty">' +
        escapeHtml(t().missing) +
        '</p><a class="cta w-button" href="' +
        window.SPNShop.shopPath("home") +
        '">' +
        escapeHtml(t().back) +
        "</a>";
      return;
    }
    document.title = window.SPNShop.productName(product) + " | Studio Pilates Narbonne";
    var badge =
      product.status === "placeholder"
        ? '<span class="shop-badge">' + escapeHtml(t().example) + "</span>"
        : "";
    var extras = "";
    if (product.format) {
      extras +=
        '<p class="shop-meta">' +
        escapeHtml(t().format) +
        " : " +
        escapeHtml(product.format) +
        "</p>";
    }
    if (product.sku) {
      extras += '<p class="shop-meta">SKU : ' + escapeHtml(product.sku) + "</p>";
    }
    var canBuy = product.inStock !== false;
    var buyRow = canBuy
      ? '<div class="shop-buy-row">' +
        '<label class="shop-qty-label">' +
        escapeHtml(t().qty) +
        ' <input class="shop-qty" type="number" min="1" max="10" value="1" data-qty/></label>' +
        '<button type="button" class="cta w-button" data-add="' +
        escapeHtml(product.id) +
        '">' +
        escapeHtml(t().add) +
        "</button></div>"
      : '<p class="shop-hint">' + escapeHtml(t().outOfStock) + "</p>";
    root.innerHTML =
      '<div class="shop-product-grid">' +
      '<div class="shop-product-media"><img src="' +
      escapeHtml(product.image) +
      '" alt=""/>' +
      badge +
      "</div>" +
      '<div class="shop-product-copy">' +
      '<p class="shop-kicker"><a href="' +
      window.SPNShop.shopPath("home") +
      '">' +
      escapeHtml(t().back) +
      "</a></p>" +
      "<h1>" +
      escapeHtml(window.SPNShop.productName(product)) +
      "</h1>" +
      '<p class="shop-price">' +
      escapeHtml(window.SPNShop.formatPrice(product.priceCents)) +
      "</p>" +
      extras +
      "<p>" +
      escapeHtml(window.SPNShop.productDescription(product)) +
      "</p>" +
      buyRow +
      "</div></div>";
  }

  function lineHtml(catalog, item) {
    var product = window.SPNShop.findProduct(catalog, item.id);
    if (!product) return "";
    var href = window.SPNShop.shopPath("product", product.slug);
    return (
      '<div class="shop-line" data-line="' +
      escapeHtml(product.id) +
      '">' +
      '<a class="shop-line-media" href="' +
      href +
      '"><img src="' +
      escapeHtml(product.image) +
      '" alt=""/></a>' +
      '<div class="shop-line-copy">' +
      "<h2>" +
      escapeHtml(window.SPNShop.productName(product)) +
      "</h2>" +
      "<p>" +
      escapeHtml(window.SPNShop.formatPrice(product.priceCents)) +
      "</p>" +
      '<label class="shop-qty-label">' +
      escapeHtml(t().qty) +
      ' <input class="shop-qty" type="number" min="1" max="10" value="' +
      Number(item.qty) +
      '" data-qty-id="' +
      escapeHtml(product.id) +
      '"/></label>' +
      '<button type="button" class="shop-text-link" data-remove="' +
      escapeHtml(product.id) +
      '">' +
      escapeHtml(t().remove) +
      "</button>" +
      "</div>" +
      "<strong>" +
      escapeHtml(window.SPNShop.formatPrice(product.priceCents * item.qty)) +
      "</strong>" +
      "</div>"
    );
  }

  function renderCart(catalog) {
    var root = document.querySelector("[data-shop-cart-root]");
    if (!root) return;
    var cart = window.SPNShop.getCart();
    if (!cart.items.length) {
      root.innerHTML =
        '<p class="shop-empty">' +
        escapeHtml(t().empty) +
        '</p><a class="cta w-button" href="' +
        window.SPNShop.shopPath("home") +
        '">' +
        escapeHtml(t().continue) +
        "</a>";
      return;
    }

    var subtotal = 0;
    cart.items.forEach(function (item) {
      var product = window.SPNShop.findProduct(catalog, item.id);
      if (product) subtotal += product.priceCents * item.qty;
    });
    var shipping = (catalog.shipping || []).find(function (option) {
      return option.id === cart.fulfillment;
    }) || (catalog.shipping || [])[0];
    var shippingCents = shipping ? shipping.amountCents : 0;

    var shipRadios = (catalog.shipping || [])
      .map(function (option) {
        var checked = option.id === cart.fulfillment ? " checked" : "";
        return (
          '<label class="shop-ship">' +
          '<input type="radio" name="fulfillment" value="' +
          escapeHtml(option.id) +
          '"' +
          checked +
          "/>" +
          "<span><strong>" +
          escapeHtml(window.SPNShop.shippingLabel(option)) +
          "</strong> · " +
          escapeHtml(window.SPNShop.formatPrice(option.amountCents)) +
          "</span></label>"
        );
      })
      .join("");

    var shippingUnconfirmed = shipping && shipping.confirmed === false;
    var shippingHint = shippingUnconfirmed
      ? '<p class="shop-hint">' + escapeHtml(t().shippingSoon) + "</p>"
      : shipping && window.SPNShop.shippingDetail(shipping)
        ? '<p class="shop-meta">' +
          escapeHtml(window.SPNShop.shippingDetail(shipping)) +
          "</p>"
        : "";

    root.innerHTML =
      '<div class="shop-cart-layout">' +
      '<div class="shop-lines">' +
      cart.items.map(function (item) {
        return lineHtml(catalog, item);
      }).join("") +
      "</div>" +
      '<aside class="shop-summary">' +
      "<h2>" +
      escapeHtml(t().cart) +
      "</h2>" +
      '<div class="shop-ships">' +
      shipRadios +
      "</div>" +
      shippingHint +
      '<p class="shop-sum-row"><span>' +
      escapeHtml(t().subtotal) +
      "</span><strong>" +
      escapeHtml(window.SPNShop.formatPrice(subtotal)) +
      "</strong></p>" +
      '<p class="shop-sum-row"><span>' +
      escapeHtml(t().shipping) +
      "</span><strong>" +
      escapeHtml(window.SPNShop.formatPrice(shippingCents)) +
      "</strong></p>" +
      '<p class="shop-sum-row shop-sum-total"><span>' +
      escapeHtml(t().total) +
      "</span><strong>" +
      escapeHtml(window.SPNShop.formatPrice(subtotal + shippingCents)) +
      "</strong></p>" +
      '<button type="button" class="cta w-button" data-checkout>' +
      escapeHtml(t().pay) +
      "</button>" +
      '<p class="shop-terms">' +
      escapeHtml(t().terms) +
      ' <a href="' +
      escapeHtml(t().legalAnchor) +
      '">' +
      escapeHtml(t().termsLink) +
      "</a></p>" +
      '<p class="shop-hint" data-checkout-error></p>' +
      "</aside></div>";
  }

  function renderMessage(kind) {
    var root = document.querySelector("[data-shop-message-root]");
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var isSuccess = kind === "success";
    if (isSuccess && !params.get("mock")) {
      window.SPNShop.clear();
    }
    root.innerHTML =
      "<h1>" +
      escapeHtml(isSuccess ? t().successTitle : t().cancelTitle) +
      "</h1>" +
      "<p>" +
      escapeHtml(isSuccess ? t().successBody : t().cancelBody) +
      "</p>" +
      (params.get("mock") ? "<p class=\"shop-hint\">" + escapeHtml(t().mock) + "</p>" : "") +
      '<a class="cta w-button" href="' +
      window.SPNShop.shopPath(isSuccess ? "home" : "panier") +
      '">' +
      escapeHtml(isSuccess ? t().continue : t().cart) +
      "</a>";
  }

  function bindClicks(catalog) {
    document.addEventListener("click", function (event) {
      var add = event.target.closest("[data-add]");
      if (add) {
        var qtyInput = document.querySelector("[data-qty]");
        var qty = qtyInput ? Number(qtyInput.value || 1) : 1;
        window.SPNShop.addItem(add.getAttribute("data-add"), qty);
        add.textContent = t().added;
        setTimeout(function () {
          add.textContent = t().add;
        }, 1400);
        return;
      }
      var remove = event.target.closest("[data-remove]");
      if (remove) {
        window.SPNShop.removeItem(remove.getAttribute("data-remove"));
        renderCart(catalog);
        return;
      }
      var checkout = event.target.closest("[data-checkout]");
      if (checkout) {
        startCheckout(catalog, checkout);
      }
    });

    document.addEventListener("change", function (event) {
      var qty = event.target.getAttribute("data-qty-id");
      if (qty) {
        window.SPNShop.setQty(qty, Number(event.target.value));
        renderCart(catalog);
        return;
      }
      if (event.target.name === "fulfillment") {
        window.SPNShop.setFulfillment(event.target.value);
        renderCart(catalog);
      }
    });
  }

  function startCheckout(catalog, button) {
    var errorEl = document.querySelector("[data-checkout-error]");
    var cart = window.SPNShop.getCart();
    button.disabled = true;
    fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.items,
        fulfillment: cart.fulfillment,
        locale: window.SPNShop.isEn() ? "en" : "fr",
      }),
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
        var code = result.data && result.data.code;
        var message = t().error;
        if (code === "STRIPE_MISSING") message = t().stripe;
        if (code === "SHOP_CLOSED") message = t().closed;
        if (errorEl) errorEl.textContent = (result.data && result.data.error) || message;
        button.disabled = false;
      })
      .catch(function () {
        if (errorEl) errorEl.textContent = t().error;
        button.disabled = false;
      });
  }

  function applyStaticCopy() {
    document.querySelectorAll("[data-shop-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-shop-i18n");
      if (t()[key]) el.textContent = t()[key];
    });
  }

  function boot() {
    if (!window.SPNShop || !pageKind()) return;
    applyStaticCopy();
    window.SPNShop.loadCatalog().then(function (catalog) {
      var kind = pageKind();
      if (kind === "listing") renderListing(catalog);
      if (kind === "product") renderProduct(catalog);
      if (kind === "cart") renderCart(catalog);
      if (kind === "success") renderMessage("success");
      if (kind === "cancel") renderMessage("cancel");
      bindClicks(catalog);
      var banner = document.querySelector("[data-shop-closed]");
      if (banner && catalog.live === false) {
        banner.hidden = false;
        banner.textContent = t().closed;
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
