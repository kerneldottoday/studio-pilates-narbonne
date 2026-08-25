(function () {
  var catalog = null;
  var occurrences = [];
  var bookings = [];
  var students = [];
  var notices = [];
  var closures = [];
  var scheduleSlots = [];
  var weekIndex = 0;
  var selectedStudent = "";
  var reportMonth = new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
  }).format(new Date());
  var reportLoaded = false;
  var shopCatalog = null;

  function weekKey(iso) {
    var date = new Date(iso + "T12:00:00");
    var day = date.getDay();
    var delta = day === 0 ? -5 : 2 - day;
    date.setDate(date.getDate() + delta);
    return date.toISOString().slice(0, 10);
  }

  function formatDay(iso) {
    return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function weeksFrom(list) {
    var keys = [];
    (list || []).forEach(function (occ) {
      var key = weekKey(occ.date);
      if (keys.indexOf(key) < 0) keys.push(key);
    });
    keys.sort();
    return keys;
  }

  function peopleFor(occurrenceId) {
    return (bookings || []).filter(function (booking) {
      return (
        booking.occurrenceId === occurrenceId &&
        booking.status !== "cancelled" &&
        booking.status !== "waitlist"
      );
    });
  }

  function waitingFor(occurrenceId) {
    return (bookings || [])
      .filter(function (booking) {
        return booking.occurrenceId === occurrenceId && booking.status === "waitlist";
      })
      .sort(function (a, b) {
        return String(a.createdAt || "").localeCompare(String(b.createdAt || ""));
      });
  }

  function occupying(occurrenceId) {
    return peopleFor(occurrenceId).filter(function (booking) {
      return booking.status === "booked" || booking.status === "attended";
    });
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function euro(cents) {
    return (Number(cents) / 100).toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    });
  }

  function jsonFetch(url, options) {
    var opts = options || {};
    opts.credentials = "same-origin";
    opts.headers = Object.assign(
      { "Content-Type": "application/json" },
      opts.headers || {}
    );
    return fetch(url, opts).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var err = new Error((data && data.error) || "Erreur");
          err.status = res.status;
          err.code = data && data.code;
          throw err;
        }
        return data;
      });
    });
  }

  function setHint(text, ok) {
    var el = $("[data-admin-hint]");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#2f5d32" : "#7a3b2e";
  }

  function showApp(loggedIn) {
    $("[data-login]").hidden = loggedIn;
    $("[data-app]").hidden = !loggedIn;
    var logout = $("[data-logout]");
    if (logout) logout.hidden = !loggedIn;
  }

  function renderProducts() {
    var body = $("[data-products]");
    if (!body || !catalog) return;
    body.innerHTML = (catalog.products || [])
      .map(function (p) {
        return (
          "<tr data-id=\"" +
          escapeHtml(p.id) +
          "\">" +
          '<td data-label="Formule"><input name="name" value="' +
          escapeHtml(p.name) +
          '"/></td>' +
          '<td data-label="Prix €"><input name="price" type="number" min="0" step="0.01" value="' +
          (Number(p.priceCents) / 100).toFixed(2) +
          '"/></td>' +
          '<td data-label="Crédits"><input name="credits" type="number" min="0" step="1" value="' +
          escapeHtml(p.credits) +
          '"/></td>' +
          '<td data-label="Mois"><input name="validityMonths" type="number" min="0" step="1" value="' +
          escapeHtml(p.validityMonths) +
          '"/></td>' +
          '<td data-label="Groupe"><select name="group"><option value="unit"' +
          (p.group !== "pack" ? " selected" : "") +
          '>Unité</option><option value="pack"' +
          (p.group === "pack" ? " selected" : "") +
          ">Carte</option></select></td>" +
          '<td data-label="Visible"><input name="active" type="checkbox"' +
          (p.active !== false ? " checked" : "") +
          "/></td>" +
          '<td data-label="Populaire"><input name="featured" type="checkbox"' +
          (p.featured ? " checked" : "") +
          "/></td>" +
          '<td data-label="Texte"><textarea name="description" rows="2">' +
          escapeHtml(p.description || "") +
          "</textarea></td>" +
          "</tr>"
        );
      })
      .join("");
    $("[data-live]").checked = Boolean(catalog.live);
    var hoursInput = $("[data-cancel-hours]");
    if (hoursInput) hoursInput.value = catalog.cancelHours != null ? catalog.cancelHours : 8;
  }

  function collectProducts() {
    return $$("[data-products] tr").map(function (row) {
      return {
        id: row.getAttribute("data-id"),
        name: row.querySelector('[name="name"]').value,
        priceCents: Math.round(Number(String(row.querySelector('[name="price"]').value).replace(",", ".")) * 100),
        credits: Number(row.querySelector('[name="credits"]').value),
        validityMonths: Number(row.querySelector('[name="validityMonths"]').value),
        group: row.querySelector('[name="group"]').value,
        active: row.querySelector('[name="active"]').checked,
        featured: row.querySelector('[name="featured"]').checked,
        duration: "1 h",
        description: row.querySelector('[name="description"]').value,
      };
    });
  }

  function renderSchedule(slots) {
    var body = $("[data-schedule]");
    if (!body) return;
    body.innerHTML = (slots || [])
      .map(function (s) {
        return (
          "<tr data-id=\"" +
          escapeHtml(s.id) +
          "\">" +
          '<td data-label="Jour"><input name="day" value="' +
          escapeHtml(s.day) +
          '"/></td>' +
          '<td data-label="Début"><input name="start" value="' +
          escapeHtml(s.start) +
          '"/></td>' +
          '<td data-label="Fin"><input name="end" value="' +
          escapeHtml(s.end) +
          '"/></td>' +
          '<td data-label="Cours"><input name="title" value="' +
          escapeHtml(s.title) +
          '"/></td>' +
          '<td data-label="Niveau"><input name="level" value="' +
          escapeHtml(s.level) +
          '"/></td>' +
          '<td data-label="Places"><input name="capacity" type="number" min="1" value="' +
          escapeHtml(s.capacity) +
          '"/></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  function collectSchedule() {
    return $$("[data-schedule] tr").map(function (row) {
      return {
        id: row.getAttribute("data-id"),
        day: row.querySelector('[name="day"]').value,
        start: row.querySelector('[name="start"]').value,
        end: row.querySelector('[name="end"]').value,
        title: row.querySelector('[name="title"]').value,
        level: row.querySelector('[name="level"]').value,
        capacity: Number(row.querySelector('[name="capacity"]').value),
      };
    });
  }

  function statusLabel(status) {
    if (status === "contacted") return "Contactée";
    if (status === "done") return "Créditée";
    return "Payée";
  }

  function renderOrders(orders) {
    var body = $("[data-orders]");
    if (!body) return;
    if (!orders || !orders.length) {
      body.innerHTML =
        '<tr><td colspan="6" class="studio-empty">Aucune commande pour le moment.</td></tr>';
      return;
    }
    body.innerHTML = orders
      .map(function (o) {
        var date = o.createdAt ? new Date(o.createdAt).toLocaleString("fr-FR") : "—";
        return (
          "<tr>" +
          "<td data-label=\"Date\">" +
          escapeHtml(date) +
          "</td>" +
          "<td data-label=\"Cliente\">" +
          escapeHtml(o.customerName || "—") +
          "<br/><small>" +
          escapeHtml(o.customerEmail || "") +
          "</small></td>" +
          "<td data-label=\"Formule\">" +
          escapeHtml(o.label || o.productName || "") +
          (o.mock ? " <small>(essai)</small>" : "") +
          "</td>" +
          "<td data-label=\"Total\">" +
          euro(o.totalCents) +
          "</td>" +
          '<td data-label="Statut"><span class="studio-status studio-status--' +
          escapeHtml(o.status || "paid") +
          '">' +
          statusLabel(o.status) +
          "</span></td>" +
          '<td data-label="Suivi"><select data-order-status="' +
          escapeHtml(o.sessionId) +
          '">' +
          '<option value="paid"' +
          (o.status === "paid" ? " selected" : "") +
          ">Payée</option>" +
          '<option value="contacted"' +
          (o.status === "contacted" ? " selected" : "") +
          ">Contactée</option>" +
          '<option value="done"' +
          (o.status === "done" ? " selected" : "") +
          ">Créditée</option>" +
          "</select></td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function filteredStudents() {
    var q = ($("[data-student-search]") && $("[data-student-search]").value || "")
      .trim()
      .toLowerCase();
    return (students || []).filter(function (student) {
      if (!q) return true;
      return (
        String(student.name || "").toLowerCase().indexOf(q) >= 0 ||
        String(student.email || "").toLowerCase().indexOf(q) >= 0
      );
    });
  }

  function renderStudentDetail() {
    var root = $("[data-student-detail]");
    if (!root) return;
    var student = (students || []).find(function (item) {
      return item.email === selectedStudent;
    });
    if (!student) {
      root.innerHTML = "";
      return;
    }
    var history = (student.history || [])
      .map(function (booking) {
        return (
          "<li>" +
          escapeHtml(booking.slotLabel || booking.date) +
          " · " +
          escapeHtml(booking.statusLabel || booking.status) +
          "</li>"
        );
      })
      .join("");
    root.innerHTML =
      "<p><strong>" +
      escapeHtml(student.name || student.email) +
      "</strong> · " +
      escapeHtml(student.email) +
      (student.phone ? " · " + escapeHtml(student.phone) : "") +
      "</p>" +
      (history ? "<ul class=\"studio-people\">" + history + "</ul>" : "<p class=\"studio-note\">Pas encore de cours.</p>");
  }

  function renderStudents() {
    var body = $("[data-students]");
    if (!body) return;
    var list = filteredStudents();
    if (!list.length) {
      body.innerHTML =
        '<tr><td colspan="5" class="studio-empty">Aucune élève pour le moment.</td></tr>';
      renderStudentDetail();
      return;
    }
    body.innerHTML = list
      .map(function (student) {
        return (
          '<tr data-student="' +
          escapeHtml(student.email) +
          '"' +
          (student.email === selectedStudent ? ' class="is-open"' : "") +
          ">" +
          '<td data-label="Élève">' +
          escapeHtml(student.name || "—") +
          "<br/><small>" +
          escapeHtml(student.email) +
          "</small></td>" +
          '<td data-label="Reformer">' +
          student.credits.reformer +
          "</td>" +
          '<td data-label="Mat / Yoga">' +
          student.credits.mat +
          "</td>" +
          '<td data-label="À venir">' +
          student.upcoming +
          "</td>" +
          '<td data-label="Achats">' +
          student.orders +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
    renderStudentDetail();
  }

  function renderNotices() {
    var body = $("[data-notices]");
    if (!body) return;
    if (!notices || !notices.length) {
      body.innerHTML =
        '<tr><td colspan="5" class="studio-empty">Aucun message pour le moment.</td></tr>';
      return;
    }
    body.innerHTML = notices
      .map(function (item) {
        var date = item.createdAt
          ? new Date(item.createdAt).toLocaleString("fr-FR")
          : "—";
        return (
          "<tr>" +
          '<td data-label="Date">' +
          escapeHtml(date) +
          "</td>" +
          '<td data-label="À">' +
          escapeHtml(item.name || "—") +
          "<br/><small>" +
          escapeHtml(item.email || "") +
          "</small></td>" +
          '<td data-label="Sujet">' +
          escapeHtml(item.subject || "") +
          "</td>" +
          '<td data-label="Texte">' +
          escapeHtml(item.body || "") +
          "</td>" +
          '<td data-label="Envoi">' +
          (item.sent ? "Envoyé" : "Brouillon") +
          "</td>" +
          "</tr>"
        );
      })
      .join("");
  }

  function fillCreditForm(student) {
    var form = $("[data-credit-form]");
    if (!form || !student) return;
    form.name.value = student.name || "";
    form.email.value = student.email || "";
  }

  function slotLabelById(slotId) {
    var slot = (scheduleSlots || []).find(function (item) {
      return item.id === slotId;
    });
    if (!slot) return slotId || "Tous les cours";
    return slot.day + " " + slot.start + " · " + slot.title;
  }

  function fillClosureSlots() {
    var select = $("[data-closure-slot]");
    if (!select) return;
    var current = select.value;
    select.innerHTML =
      '<option value="">Tous les cours</option>' +
      (scheduleSlots || [])
        .map(function (slot) {
          return (
            '<option value="' +
            escapeHtml(slot.id) +
            '">' +
            escapeHtml(slot.day + " " + slot.start + " · " + slot.title) +
            "</option>"
          );
        })
        .join("");
    select.value = current || "";
  }

  function closurePeriodLabel(closure) {
    var from = formatDay(closure.from);
    if (closure.to && closure.to !== closure.from) {
      return "du " + from + " au " + formatDay(closure.to);
    }
    return from;
  }

  function renderClosures() {
    var body = $("[data-closures]");
    if (!body) return;
    if (!closures || !closures.length) {
      body.innerHTML =
        '<tr><td colspan="4" class="studio-empty">Aucune fermeture. Le planning tourne normalement.</td></tr>';
      return;
    }
    body.innerHTML = closures
      .map(function (closure) {
        return (
          "<tr>" +
          '<td data-label="Période">' +
          escapeHtml(closurePeriodLabel(closure)) +
          "</td>" +
          '<td data-label="Cours">' +
          escapeHtml(closure.slotId ? slotLabelById(closure.slotId) : "Tous les cours") +
          "</td>" +
          '<td data-label="Motif">' +
          escapeHtml(closure.reason || "—") +
          "</td>" +
          '<td data-label="Réouvrir"><button type="button" class="studio-ghost" data-reopen="' +
          escapeHtml(closure.id) +
          '">Réouvrir</button></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  function shiftMonth(month, delta) {
    var bits = month.split("-").map(Number);
    var date = new Date(bits[0], bits[1] - 1 + delta, 1);
    return (
      date.getFullYear() +
      "-" +
      String(date.getMonth() + 1).padStart(2, "0")
    );
  }

  function monthLabel(month) {
    var bits = month.split("-").map(Number);
    return new Date(bits[0], bits[1] - 1, 1).toLocaleDateString("fr-FR", {
      month: "long",
      year: "numeric",
    });
  }

  function statCard(title, value, detail) {
    return (
      '<div class="studio-stat"><span>' +
      escapeHtml(title) +
      "</span><strong>" +
      value +
      "</strong>" +
      (detail ? "<small>" + detail + "</small>" : "") +
      "</div>"
    );
  }

  function renderReport(data) {
    var label = $("[data-report-label]");
    if (label) label.textContent = "Bilan — " + monthLabel(data.month);
    var cards = $("[data-report-cards]");
    if (cards) {
      var pct = Math.round((data.sessions.fillRate || 0) * 100);
      cards.innerHTML =
        statCard(
          "Encaissé",
          euro(data.revenue.realCents),
          data.revenue.realCount +
            " commande" +
            (data.revenue.realCount > 1 ? "s" : "") +
            (data.revenue.mockCount
              ? " · essais : " +
                euro(data.revenue.mockCents) +
                " (" +
                data.revenue.mockCount +
                ")"
              : "")
        ) +
        statCard(
          "Séances",
          data.sessions.held + " données",
          data.sessions.upcoming +
            " à venir" +
            (data.sessions.cancelled ? " · " + data.sessions.cancelled + " annulée(s)" : "")
        ) +
        statCard(
          "Remplissage",
          pct + " %",
          data.sessions.seats + "/" + data.sessions.capacity + " places réservées"
        ) +
        statCard(
          "Présences",
          data.sessions.attended + "",
          data.sessions.noshow + " absence(s) · " + data.sessions.bookedFuture + " résa(s) à venir"
        ) +
        statCard(
          "Élèves actives",
          data.students.active + "",
          data.students.newBuyers + " nouvelle(s) acheteuse(s)"
        ) +
        statCard(
          "Crédits valides",
          data.credits.reformer + data.credits.mat + "",
          data.credits.reformer + " Reformer · " + data.credits.mat + " Mat / Yoga"
        );
    }
    var body = $("[data-report-slots]");
    if (body) {
      if (!data.slots || !data.slots.length) {
        body.innerHTML =
          '<tr><td colspan="6" class="studio-empty">Aucune séance ce mois-ci.</td></tr>';
      } else {
        body.innerHTML = data.slots
          .map(function (slot) {
            var fill = slot.capacity
              ? Math.round((slot.booked / slot.capacity) * 100) + " %"
              : "—";
            return (
              "<tr>" +
              '<td data-label="Créneau">' +
              escapeHtml(slot.day + " " + slot.start + " · " + slot.title) +
              "</td>" +
              '<td data-label="Séances">' +
              slot.sessions +
              "</td>" +
              '<td data-label="Remplissage">' +
              fill +
              " <small>(" +
              slot.booked +
              "/" +
              slot.capacity +
              ")</small></td>" +
              '<td data-label="Présences">' +
              slot.attended +
              "</td>" +
              '<td data-label="Absences">' +
              slot.noshow +
              "</td>" +
              '<td data-label="Annulées">' +
              slot.cancelled +
              "</td>" +
              "</tr>"
            );
          })
          .join("");
      }
    }
  }

  function loadReport() {
    return jsonFetch("/api/studio/admin/report?month=" + reportMonth)
      .then(function (data) {
        reportLoaded = true;
        renderReport(data);
      })
      .catch(function (err) {
        setHint(err.message || "Bilan indisponible");
      });
  }

  function shopHint(text, ok) {
    var el = $("[data-shop-hint]");
    if (!el) return;
    el.textContent = text || "";
    el.style.color = ok ? "#2f5d32" : "#7a3b2e";
  }

  function renderShop() {
    if (!shopCatalog) return;
    var products = $("[data-shop-products]");
    if (products) {
      products.innerHTML = (shopCatalog.products || [])
        .map(function (p) {
          return (
            '<div class="studio-shop-item" data-shop-id="' +
            escapeHtml(p.id) +
            '">' +
            '<div class="studio-shop-head">' +
            (p.image ? '<img src="' + escapeHtml(p.image) + '" alt=""/>' : "") +
            "<label>Nom<input data-field=\"name\" value=\"" +
            escapeHtml(p.name) +
            '" required minlength="2"/></label>' +
            '<label class="studio-shop-price">Prix €<input data-field="price" type="number" step="0.01" min="0" value="' +
            (Number(p.priceCents) / 100).toFixed(2) +
            '" required/></label>' +
            "</div>" +
            '<div class="studio-shop-flags">' +
            '<label class="studio-live"><input type="checkbox" data-field="inStock"' +
            (p.inStock !== false ? " checked" : "") +
            "/> En stock</label>" +
            '<label class="studio-live"><input type="checkbox" data-field="visible"' +
            (p.hidden === true ? "" : " checked") +
            "/> Visible sur le site</label>" +
            "</div>" +
            '<div class="studio-shop-grid">' +
            '<label>Format<input data-field="format" value="' +
            escapeHtml(p.format || "") +
            '" placeholder="Ex. 60 gélules"/></label>' +
            '<label>Réf. (SKU)<input data-field="sku" value="' +
            escapeHtml(p.sku || "") +
            '"/></label>' +
            "</div>" +
            '<label>Phrase courte (vignette)<input data-field="short" value="' +
            escapeHtml(p.short || "") +
            '"/></label>' +
            '<label>Description (fiche produit)<textarea data-field="description" rows="3">' +
            escapeHtml(p.description || "") +
            "</textarea></label>" +
            "</div>"
          );
        })
        .join("");
    }
    var shipping = $("[data-shop-shipping]");
    if (shipping) {
      shipping.innerHTML = (shopCatalog.shipping || [])
        .map(function (s) {
          return (
            '<div class="studio-shop-ship" data-ship-id="' +
            escapeHtml(s.id) +
            '">' +
            "<label>Libellé<input data-field=\"label\" value=\"" +
            escapeHtml(s.label) +
            '" required minlength="2"/></label>' +
            '<label>Montant €<input data-field="amount" type="number" step="0.01" min="0" value="' +
            (Number(s.amountCents) / 100).toFixed(2) +
            '" required/></label>' +
            '<label>Détail (affiché au panier)<input data-field="detail" value="' +
            escapeHtml(s.detail || "") +
            '"/></label>' +
            "</div>"
          );
        })
        .join("");
    }
  }

  function loadShop() {
    return jsonFetch("/api/studio/admin/shop")
      .then(function (data) {
        shopCatalog = data.catalog;
        renderShop();
      })
      .catch(function (err) {
        shopHint(err.message || "Boutique indisponible");
      });
  }

  function eurosToCents(value) {
    var num = Number(String(value).replace(",", "."));
    if (!isFinite(num) || num < 0) return null;
    return Math.round(num * 100);
  }

  function collectShop() {
    var products = [];
    var bad = null;
    $$("[data-shop-id]").forEach(function (item) {
      var cents = eurosToCents($('[data-field="price"]', item).value);
      if (cents == null) bad = "Prix invalide";
      products.push({
        id: item.getAttribute("data-shop-id"),
        name: $('[data-field="name"]', item).value,
        priceCents: cents,
        format: $('[data-field="format"]', item).value,
        sku: $('[data-field="sku"]', item).value,
        short: $('[data-field="short"]', item).value,
        description: $('[data-field="description"]', item).value,
        inStock: $('[data-field="inStock"]', item).checked,
        hidden: !$('[data-field="visible"]', item).checked,
      });
    });
    var shipping = [];
    $$("[data-ship-id]").forEach(function (item) {
      var cents = eurosToCents($('[data-field="amount"]', item).value);
      if (cents == null) bad = "Frais d'envoi invalides";
      shipping.push({
        id: item.getAttribute("data-ship-id"),
        label: $('[data-field="label"]', item).value,
        amountCents: cents,
        detail: $('[data-field="detail"]', item).value,
      });
    });
    return bad ? { error: bad } : { products: products, shipping: shipping };
  }

  function refreshAfterClosure() {
    return Promise.all([
      jsonFetch("/api/studio/admin/schedule"),
      jsonFetch("/api/studio/admin/closures"),
      jsonFetch("/api/studio/admin/notices"),
    ]).then(function (results) {
      occurrences = results[0].occurrences || [];
      bookings = results[0].bookings || [];
      closures = results[1].closures || [];
      notices = results[2].notices || [];
      renderWeekBoard();
      renderClosures();
      renderNotices();
    });
  }

  function renderWeekBoard() {
    var root = $("[data-week-board]");
    var label = $("[data-week-label]");
    var select = $("[data-occ-select]");
    if (!root) return;
    var keys = weeksFrom(occurrences);
    if (!keys.length) {
      root.innerHTML = "<p class=\"studio-empty\">Aucun cours généré.</p>";
      return;
    }
    if (weekIndex < 0) weekIndex = 0;
    if (weekIndex > keys.length - 1) weekIndex = keys.length - 1;
    var key = keys[weekIndex];
    var weekOcc = occurrences.filter(function (occ) {
      return weekKey(occ.date) === key;
    });
    var days = [];
    weekOcc.forEach(function (occ) {
      if (days.indexOf(occ.date) < 0) days.push(occ.date);
    });
    if (label) {
      label.textContent =
        "Semaine du " + formatDay(days[0] || key);
    }
    if (select) {
      select.innerHTML = weekOcc
        .filter(function (occ) {
          return !occ.closed;
        })
        .map(function (occ) {
          return (
            '<option value="' +
            escapeHtml(occ.id) +
            '">' +
            escapeHtml(occ.date + " " + occ.start + " · " + occ.title + " (" + occ.remaining + " places)") +
            "</option>"
          );
        })
        .join("");
    }
    root.innerHTML =
      '<div class="studio-occ-grid">' +
      days
        .map(function (date) {
          var slots = weekOcc.filter(function (occ) {
            return occ.date === date;
          });
          return (
            '<div class="studio-occ-day"><h3>' +
            escapeHtml(formatDay(date)) +
            "</h3>" +
            slots
              .map(function (occ) {
                if (occ.closed) {
                  return (
                    '<div class="studio-occ studio-occ--closed"><strong>' +
                    escapeHtml(occ.start) +
                    " " +
                    escapeHtml(occ.title) +
                    '</strong><p class="studio-spots">Séance annulée' +
                    (occ.closedReason ? " — " + escapeHtml(occ.closedReason) : "") +
                    "</p><p class=\"studio-note\">Les inscrites ont été re-créditées. Réouvre depuis la liste des fermetures.</p></div>"
                  );
                }
                var people = peopleFor(occ.id);
                var seated = occupying(occ.id);
                var waiting = waitingFor(occ.id);
                var waitBlock = waiting.length
                  ? '<div class="studio-waitlist"><p>File d’attente</p><ul class="studio-people">' +
                    waiting
                      .map(function (person, index) {
                        return (
                          "<li>" +
                          "<span>" +
                          escapeHtml(person.name) +
                          ' <small class="studio-chip studio-chip--waitlist">n°' +
                          (index + 1) +
                          "</small></span>" +
                          '<span class="studio-people-actions">' +
                          "<button type=\"button\" data-admin-promote=\"" +
                          escapeHtml(person.id) +
                          "\">inscrire</button>" +
                          "<button type=\"button\" data-admin-cancel=\"" +
                          escapeHtml(person.id) +
                          "\">retirer</button></span></li>"
                        );
                      })
                      .join("") +
                    "</ul></div>"
                  : "";
                return (
                  '<div class="studio-occ' +
                  (waiting.length ? " studio-occ--wait" : "") +
                  '"><strong>' +
                  escapeHtml(occ.start) +
                  " " +
                  escapeHtml(occ.title) +
                  '</strong><p class="studio-spots">' +
                  seated.length +
                  "/" +
                  occ.capacity +
                  " inscrits" +
                  (waiting.length ? " · " + waiting.length + " en file" : "") +
                  "</p>" +
                  (!occ.past
                    ? '<p class="studio-occ-tools"><button type="button" class="studio-ghost" data-close-occ="' +
                      escapeHtml(occ.id) +
                      '">annuler la séance</button></p>'
                    : "") +
                  "<ul class=\"studio-people\">" +
                  (people.length
                    ? people
                        .map(function (person) {
                          var mark =
                            person.status === "attended"
                              ? "Présente"
                              : person.status === "noshow"
                                ? person.autoNoshow
                                  ? "Absente · auto"
                                  : "Absente"
                                : "Inscrite";
                          return (
                            "<li>" +
                            "<span>" +
                            escapeHtml(person.name) +
                            ' <small class="studio-chip studio-chip--' +
                            escapeHtml(person.status || "booked") +
                            '">' +
                            mark +
                            "</small></span>" +
                            '<span class="studio-people-actions">' +
                            (person.status !== "attended"
                              ? "<button type=\"button\" data-admin-attend=\"" +
                                escapeHtml(person.id) +
                                "\">présent</button>"
                              : "") +
                            (person.status !== "noshow"
                              ? "<button type=\"button\" data-admin-noshow=\"" +
                                escapeHtml(person.id) +
                                "\">absente</button>"
                              : "") +
                            "<button type=\"button\" data-admin-cancel=\"" +
                            escapeHtml(person.id) +
                            "\">retirer</button></span></li>"
                          );
                        })
                        .join("")
                    : "<li>—</li>") +
                  "</ul>" +
                  waitBlock +
                  "</div>"
                );
              })
              .join("") +
            "</div>"
          );
        })
        .join("") +
      "</div>";
  }

  function renderBookings() {
    renderWeekBoard();
  }

  function loadAll() {
    return Promise.all([
      jsonFetch("/api/studio/admin/catalog"),
      jsonFetch("/api/studio/admin/orders"),
      jsonFetch("/api/studio/admin/schedule"),
      jsonFetch("/api/studio/admin/students"),
      jsonFetch("/api/studio/admin/notices"),
      jsonFetch("/api/studio/admin/closures"),
    ]).then(function (results) {
      catalog = results[0];
      renderProducts();
      renderOrders(results[1].orders || []);
      scheduleSlots = results[2].schedule || catalog.schedule || [];
      renderSchedule(scheduleSlots);
      occurrences = results[2].occurrences || [];
      bookings = results[2].bookings || [];
      students = results[3].students || [];
      notices = results[4].notices || [];
      closures = results[5].closures || [];
      renderWeekBoard();
      renderStudents();
      renderNotices();
      fillClosureSlots();
      renderClosures();
    });
  }

  function saveCatalog() {
    setHint("Enregistrement…");
    var payload = {
      live: $("[data-live]").checked,
      cancelHours: Number($("[data-cancel-hours]").value),
      products: collectProducts(),
    };
    var schedule = collectSchedule();
    if (schedule.length) payload.schedule = schedule;
    jsonFetch("/api/studio/admin/catalog", {
      method: "PUT",
      body: JSON.stringify(payload),
    })
      .then(function (data) {
        catalog = data;
        renderProducts();
        setHint("Enregistré. Si la vente est ouverte, les boutons du site public pointent vers le studio.", true);
      })
      .catch(function (err) {
        setHint(err.message || "Enregistrement impossible");
      });
  }

  function boot() {
    jsonFetch("/api/studio/admin/session")
      .then(function (data) {
        showApp(Boolean(data.admin));
        if (data.admin) return loadAll();
      })
      .catch(function () {
        showApp(false);
      });

    $("[data-login-form]").addEventListener("submit", function (event) {
      event.preventDefault();
      var password = $("[data-password]").value;
      jsonFetch("/api/studio/admin/session", {
        method: "POST",
        body: JSON.stringify({ password: password }),
      })
        .then(function () {
          showApp(true);
          return loadAll();
        })
        .catch(function (err) {
          var loginError = $("[data-login-error]");
          if (loginError) loginError.textContent = err.message || "Mot de passe incorrect";
        });
    });

    $("[data-logout]").addEventListener("click", function () {
      jsonFetch("/api/studio/admin/session", { method: "DELETE" }).then(function () {
        showApp(false);
      });
    });

    $$("[data-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var tab = btn.getAttribute("data-tab");
        $$("[data-tab]").forEach(function (b) {
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        $$("[data-panel]").forEach(function (panel) {
          panel.hidden = panel.getAttribute("data-panel") !== tab;
        });
        if (tab === "bilan" && !reportLoaded) loadReport();
        if (tab === "boutique" && !shopCatalog) loadShop();
      });
    });

    var shopForm = $("[data-shop-form]");
    if (shopForm) {
      shopForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var payload = collectShop();
        if (payload.error) return shopHint(payload.error);
        jsonFetch("/api/studio/admin/shop", {
          method: "PUT",
          body: JSON.stringify(payload),
        })
          .then(function (data) {
            shopCatalog = data.catalog;
            renderShop();
            shopHint("Boutique enregistrée — le site public est à jour.", true);
          })
          .catch(function (err) {
            shopHint(err.message || "Enregistrement impossible");
          });
      });
    }

    var prevMonth = $("[data-prev-month]");
    var nextMonth = $("[data-next-month]");
    if (prevMonth) {
      prevMonth.addEventListener("click", function () {
        reportMonth = shiftMonth(reportMonth, -1);
        loadReport();
      });
    }
    if (nextMonth) {
      nextMonth.addEventListener("click", function () {
        reportMonth = shiftMonth(reportMonth, 1);
        loadReport();
      });
    }

    $("[data-save]").addEventListener("click", saveCatalog);

    $("[data-reset]").addEventListener("click", function () {
      if (!window.confirm("Remettre les tarifs du site actuel (bsport) ?")) return;
      jsonFetch("/api/studio/admin/catalog", {
        method: "PUT",
        body: JSON.stringify({ reset: true }),
      })
        .then(function (data) {
          catalog = data;
          renderProducts();
          scheduleSlots = data.schedule || [];
          renderSchedule(scheduleSlots);
          fillClosureSlots();
          setHint("Tarifs d’origine rétablis.", true);
        })
        .catch(function (err) {
          setHint(err.message);
        });
    });

    $("[data-orders]").addEventListener("change", function (event) {
      var select = event.target.closest("[data-order-status]");
      if (!select) return;
      jsonFetch("/api/studio/admin/orders", {
        method: "PATCH",
        body: JSON.stringify({
          sessionId: select.getAttribute("data-order-status"),
          status: select.value,
        }),
      }).catch(function (err) {
        setHint(err.message);
      });
    });

    var search = $("[data-student-search]");
    if (search) {
      search.addEventListener("input", function () {
        renderStudents();
      });
    }

    var studentsBody = $("[data-students]");
    if (studentsBody) {
      studentsBody.addEventListener("click", function (event) {
        var row = event.target.closest("[data-student]");
        if (!row) return;
        selectedStudent = row.getAttribute("data-student");
        var student = (students || []).find(function (item) {
          return item.email === selectedStudent;
        });
        fillCreditForm(student);
        renderStudents();
      });
    }

    var creditForm = $("[data-credit-form]");
    if (creditForm) {
      creditForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        jsonFetch("/api/studio/admin/students", {
          method: "POST",
          body: JSON.stringify({
            name: form.name.value,
            email: form.email.value,
            kind: form.kind.value,
            amount: Number(form.amount.value),
            note: form.note.value,
          }),
        })
          .then(function (data) {
            students = data.students || [];
            selectedStudent = String(form.email.value || "").trim().toLowerCase();
            form.note.value = "";
            renderStudents();
            return Promise.all([
              jsonFetch("/api/studio/admin/orders"),
              jsonFetch("/api/studio/admin/notices"),
            ]);
          })
          .then(function (results) {
            renderOrders(results[0].orders || []);
            notices = results[1].notices || [];
            renderNotices();
            setHint("Crédits ajoutés.", true);
          })
          .catch(function (err) {
            setHint(err.message);
          });
      });
    }

    $("[data-booking-form]").addEventListener("submit", function (event) {
      event.preventDefault();
      var form = event.currentTarget;
      jsonFetch("/api/studio/admin/schedule", {
        method: "POST",
        body: JSON.stringify({
          name: form.name.value,
          email: form.email.value,
          phone: form.phone.value,
          occurrenceId: form.occurrenceId.value,
          skipCredit: form.skipCredit.checked,
          note: form.note.value,
        }),
      })
        .then(function (data) {
          var waitlisted =
            data.waitlist ||
            (data.booking && data.booking.status === "waitlist");
          form.reset();
          form.skipCredit.checked = true;
          return jsonFetch("/api/studio/admin/schedule").then(function (schedule) {
            return { waitlisted: waitlisted, schedule: schedule };
          });
        })
        .then(function (result) {
          occurrences = result.schedule.occurrences || [];
          bookings = result.schedule.bookings || [];
          renderWeekBoard();
          setHint(
            result.waitlisted
              ? "Cours complet : ajoutée à la file."
              : "Élève inscrite.",
            true
          );
        })
        .catch(function (err) {
          setHint(err.message);
        });
    });

    var remindersBtn = $("[data-run-reminders]");
    if (remindersBtn) {
      remindersBtn.addEventListener("click", function () {
        remindersBtn.disabled = true;
        jsonFetch("/api/studio/cron/reminders", { method: "POST" })
          .then(function (data) {
            return jsonFetch("/api/studio/admin/notices").then(function (result) {
              notices = result.notices || [];
              renderNotices();
              var day = data.date
                ? new Date(data.date + "T12:00:00").toLocaleDateString("fr-FR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })
                : "demain";
              setHint(
                data.reminded
                  ? data.reminded + " rappel(s) préparé(s) pour " + day + "."
                  : "Aucun rappel à préparer : personne d’inscrit " + day + " (ou déjà rappelé).",
                true
              );
            });
          })
          .catch(function (err) {
            setHint(err.message);
          })
          .finally(function () {
            remindersBtn.disabled = false;
          });
      });
    }

    var closureForm = $("[data-closure-form]");
    if (closureForm) {
      closureForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var form = event.currentTarget;
        var from = form.from.value;
        var to = form.to.value || from;
        var slotId = form.slotId.value;
        var summary =
          (slotId ? slotLabelById(slotId) : "Tous les cours") +
          (to !== from ? " du " + from + " au " + to : " le " + from);
        if (
          !window.confirm(
            "Fermer " +
              summary +
              " ?\nLes élèves inscrites seront retirées et re-créditées."
          )
        ) {
          return;
        }
        jsonFetch("/api/studio/admin/closures", {
          method: "POST",
          body: JSON.stringify({
            from: from,
            to: to,
            slotId: slotId,
            reason: form.reason.value,
          }),
        })
          .then(function (data) {
            form.reset();
            return refreshAfterClosure().then(function () {
              var hint = "Fermeture enregistrée.";
              if (data.cancelled) {
                hint += " " + data.cancelled + " élève(s) retirée(s) et re-créditée(s).";
              }
              if (data.waitRemoved) {
                hint += " " + data.waitRemoved + " retirée(s) de la file.";
              }
              if (!data.cancelled && !data.waitRemoved) {
                hint += " Personne n’était inscrite sur ces séances.";
              }
              setHint(hint, true);
            });
          })
          .catch(function (err) {
            setHint(err.message);
          });
      });
    }

    var prev = $("[data-prev-week]");
    var next = $("[data-next-week]");
    if (prev) {
      prev.addEventListener("click", function () {
        weekIndex -= 1;
        renderWeekBoard();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        weekIndex += 1;
        renderWeekBoard();
      });
    }

    document.addEventListener("click", function (event) {
      var closeOccBtn = event.target.closest("[data-close-occ]");
      if (closeOccBtn) {
        var occId = closeOccBtn.getAttribute("data-close-occ");
        var occ = (occurrences || []).find(function (item) {
          return item.id === occId;
        });
        if (!occ) return;
        var reason = window.prompt(
          "Annuler " +
            occ.date +
            " " +
            occ.start +
            " · " +
            occ.title +
            " ?\nMotif (visible par les élèves, facultatif) :",
          ""
        );
        if (reason === null) return;
        jsonFetch("/api/studio/admin/closures", {
          method: "POST",
          body: JSON.stringify({
            from: occ.date,
            to: occ.date,
            slotId: occ.slotId,
            reason: reason,
          }),
        })
          .then(function (data) {
            return refreshAfterClosure().then(function () {
              var hint = "Séance annulée.";
              if (data.cancelled) {
                hint += " " + data.cancelled + " élève(s) retirée(s) et re-créditée(s).";
              }
              if (data.waitRemoved) {
                hint += " " + data.waitRemoved + " retirée(s) de la file.";
              }
              setHint(hint, true);
            });
          })
          .catch(function (err) {
            setHint(err.message);
          });
        return;
      }

      var reopenBtn = event.target.closest("[data-reopen]");
      if (reopenBtn) {
        if (
          !window.confirm(
            "Réouvrir ces séances ? Les élèves retirées ne seront pas réinscrites — elles doivent réserver à nouveau."
          )
        ) {
          return;
        }
        jsonFetch("/api/studio/admin/closures", {
          method: "DELETE",
          body: JSON.stringify({ id: reopenBtn.getAttribute("data-reopen") }),
        })
          .then(function () {
            return refreshAfterClosure().then(function () {
              setHint("Fermeture retirée : les séances sont à nouveau réservables.", true);
            });
          })
          .catch(function (err) {
            setHint(err.message);
          });
        return;
      }

      var attendBtn = event.target.closest("[data-admin-attend]");
      var noshowBtn = event.target.closest("[data-admin-noshow]");
      var cancelBtn = event.target.closest("[data-admin-cancel]");
      var promoteBtn = event.target.closest("[data-admin-promote]");
      var action = null;
      var bookingId = null;
      var okHint = "";
      if (attendBtn) {
        action = "attend";
        bookingId = attendBtn.getAttribute("data-admin-attend");
        okHint = "Présence enregistrée. Le crédit reste utilisé.";
      } else if (noshowBtn) {
        action = "noshow";
        bookingId = noshowBtn.getAttribute("data-admin-noshow");
        okHint = "Absente. Crédit conservé, place libérée.";
      } else if (promoteBtn) {
        action = "promote";
        bookingId = promoteBtn.getAttribute("data-admin-promote");
        okHint = "Élève inscrite depuis la file.";
      } else if (cancelBtn) {
        action = "cancel";
        bookingId = cancelBtn.getAttribute("data-admin-cancel");
        okHint = "Place libérée, crédit rendu s’il avait été débité.";
      }
      if (!action) return;
      jsonFetch("/api/studio/admin/schedule", {
        method: "PATCH",
        body: JSON.stringify({ bookingId: bookingId, action: action }),
      })
        .then(function (data) {
          var promoted = data && data.promoted;
          return jsonFetch("/api/studio/admin/schedule").then(function (schedule) {
            return { promoted: promoted, schedule: schedule };
          });
        })
        .then(function (result) {
          occurrences = result.schedule.occurrences || [];
          bookings = result.schedule.bookings || [];
          renderWeekBoard();
          var hint = okHint;
          if (result.promoted && result.promoted.name) {
            hint += " " + result.promoted.name + " inscrite depuis la file.";
          }
          setHint(hint, true);
        })
        .catch(function (err) {
          setHint(err.message);
        });
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
