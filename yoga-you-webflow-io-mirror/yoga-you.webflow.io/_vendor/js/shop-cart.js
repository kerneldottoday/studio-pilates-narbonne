(function () {
  var STORAGE_KEY = "spn-shop-cart-v1";
  var CATALOG_URL = "/_vendor/shop/catalog.json";
  var catalogPromise = null;

  function isEn() {
    var path = window.location.pathname || "";
    return path.indexOf("/en/") !== -1 || path === "/en";
  }

  function shopPath(page, slug) {
    var root = isEn() ? "/en/boutique" : "/boutique";
    if (page === "home" || !page) return root;
    if (page === "product") return root + "/" + slug;
    return root + "/" + page;
  }

  function formatPrice(cents) {
    try {
      return (Number(cents) / 100).toLocaleString(isEn() ? "en-GB" : "fr-FR", {
        style: "currency",
        currency: "EUR",
      });
    } catch (_err) {
      return (Number(cents) / 100).toFixed(2).replace(".", ",") + " €";
    }
  }

  function readState() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: [], fulfillment: "pickup" };
      var parsed = JSON.parse(raw);
      return {
        items: Array.isArray(parsed.items) ? parsed.items : [],
        fulfillment: parsed.fulfillment === "fr-metro" ? "fr-metro" : "pickup",
      };
    } catch (_err) {
      return { items: [], fulfillment: "pickup" };
    }
  }

  function writeState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    document.dispatchEvent(new CustomEvent("spn-cart-change"));
  }

  function getCart() {
    return readState();
  }

  function setFulfillment(id) {
    var state = readState();
    state.fulfillment = id === "pickup" ? "pickup" : "fr-metro";
    writeState(state);
  }

  function addItem(id, qty) {
    var addQty = Number(qty || 1);
    if (!id || addQty < 1) return getCart();
    var state = readState();
    var found = null;
    for (var i = 0; i < state.items.length; i++) {
      if (state.items[i].id === id) {
        found = state.items[i];
        break;
      }
    }
    if (found) {
      found.qty = Math.min(10, found.qty + addQty);
    } else {
      state.items.push({ id: id, qty: Math.min(10, addQty) });
    }
    writeState(state);
    return state;
  }

  function setQty(id, qty) {
    var state = readState();
    var nextQty = Number(qty);
    if (!Number.isInteger(nextQty) || nextQty < 1) {
      state.items = state.items.filter(function (item) {
        return item.id !== id;
      });
    } else {
      for (var i = 0; i < state.items.length; i++) {
        if (state.items[i].id === id) {
          state.items[i].qty = Math.min(10, nextQty);
        }
      }
    }
    writeState(state);
    return state;
  }

  function removeItem(id) {
    var state = readState();
    state.items = state.items.filter(function (item) {
      return item.id !== id;
    });
    writeState(state);
    return state;
  }

  function clear() {
    writeState({ items: [], fulfillment: readState().fulfillment });
  }

  function count() {
    return readState().items.reduce(function (sum, item) {
      return sum + Number(item.qty || 0);
    }, 0);
  }

  function loadCatalog() {
    if (!catalogPromise) {
      catalogPromise = fetch(CATALOG_URL, { cache: "no-store" }).then(function (res) {
        if (!res.ok) throw new Error("catalogue");
        return res.json();
      });
    }
    return catalogPromise;
  }

  function productName(product) {
    if (!product) return "";
    return isEn() ? product.nameEn || product.name : product.name;
  }

  function productShort(product) {
    if (!product) return "";
    return isEn() ? product.shortEn || product.short : product.short;
  }

  function productDescription(product) {
    if (!product) return "";
    return isEn() ? product.descriptionEn || product.description : product.description;
  }

  function shippingLabel(option) {
    if (!option) return "";
    return isEn() ? option.labelEn || option.label : option.label;
  }

  function shippingDetail(option) {
    if (!option) return "";
    return isEn() ? option.detailEn || option.detail : option.detail;
  }

  function findProduct(catalog, id) {
    var products = (catalog && catalog.products) || [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].id === id) return products[i];
    }
    return null;
  }

  function findBySlug(catalog, slug) {
    var products = (catalog && catalog.products) || [];
    for (var i = 0; i < products.length; i++) {
      if (products[i].slug === slug) return products[i];
    }
    return null;
  }

  function updateCartBadges() {
    var total = count();
    document.querySelectorAll("[data-shop-cart-count]").forEach(function (el) {
      el.textContent = String(total);
      el.hidden = total < 1;
    });
    document.querySelectorAll("[data-shop-cart-link]").forEach(function (el) {
      el.setAttribute("href", shopPath("panier"));
    });
  }

  document.addEventListener("spn-cart-change", updateCartBadges);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", updateCartBadges);
  } else {
    updateCartBadges();
  }

  window.SPNShop = {
    isEn: isEn,
    shopPath: shopPath,
    formatPrice: formatPrice,
    getCart: getCart,
    setFulfillment: setFulfillment,
    addItem: addItem,
    setQty: setQty,
    removeItem: removeItem,
    clear: clear,
    count: count,
    loadCatalog: loadCatalog,
    productName: productName,
    productShort: productShort,
    productDescription: productDescription,
    shippingLabel: shippingLabel,
    shippingDetail: shippingDetail,
    findProduct: findProduct,
    findBySlug: findBySlug,
    updateCartBadges: updateCartBadges,
  };
})();
