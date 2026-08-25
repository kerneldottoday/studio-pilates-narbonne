(function () {
  var sessions = { occurrences: [] };
  var account = null;
  var weekIndex = 0;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formatDay(iso) {
    var date = new Date(iso + "T12:00:00");
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  }

  function weekKey(iso) {
    var date = new Date(iso + "T12:00:00");
    var day = date.getDay();
    var delta = day === 0 ? -5 : 2 - day;
    date.setDate(date.getDate() + delta);
    return date.toISOString().slice(0, 10);
  }

  function weeksFrom(occurrences) {
    var keys = [];
    (occurrences || []).forEach(function (occ) {
      var key = weekKey(occ.date);
      if (keys.indexOf(key) < 0) keys.push(key);
    });
    keys.sort();
    return keys;
  }

  function formatUntil(iso) {
    if (!iso) return "";
    return new Date(iso).toLocaleString("fr-FR", {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  function setCancelHoursLabel(hours) {
    var el = $("[data-cancel-hours-label]");
    if (el && hours != null) el.textContent = String(hours);
  }

  function mineOn(occurrenceId) {
    if (!account) return null;
    return (account.bookings || []).find(function (booking) {
      return (
        (booking.status === "booked" || booking.status === "attended") &&
        booking.occurrenceId === occurrenceId
      );
    });
  }

  function waitingOn(occurrenceId) {
    if (!account) return null;
    return (account.bookings || []).find(function (booking) {
      return booking.status === "waitlist" && booking.occurrenceId === occurrenceId;
    });
  }

  function formatExpiry(iso) {
    if (!iso) return "";
    return new Date(iso + "T12:00:00").toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  function renderCredits() {
    var root = $("[data-credits]");
    if (!root) return;
    if (!account) {
      root.innerHTML = "";
      return;
    }
    var lots = (account.lots || [])
      .filter(function (lot) {
        return !lot.expired && lot.remaining > 0;
      })
      .sort(function (a, b) {
        return String(a.expiresAt).localeCompare(String(b.expiresAt));
      })
      .map(function (lot) {
        return (
          "<li>" +
          escapeHtml(lot.productName || (lot.kind === "mat" ? "Mat / Yoga" : "Reformer")) +
          " : reste " +
          lot.remaining +
          "/" +
          lot.total +
          " · valable jusqu’au " +
          escapeHtml(formatExpiry(lot.expiresAt)) +
          "</li>"
        );
      })
      .join("");
    root.innerHTML =
      '<div class="studio-credit"><strong>' +
      account.credits.reformer +
      "</strong> crédit" +
      (account.credits.reformer > 1 ? "s" : "") +
      " Reformer</div>" +
      '<div class="studio-credit"><strong>' +
      account.credits.mat +
      "</strong> crédit" +
      (account.credits.mat > 1 ? "s" : "") +
      " Mat / Yoga</div>" +
      (lots ? '<ul class="studio-lots">' + lots + "</ul>" : "");
  }

  function renderMine() {
    var root = $("[data-mine]");
    if (!root || !account) return;
    var upcoming = (account.bookings || []).filter(function (booking) {
      return (
        booking.status === "booked" ||
        booking.status === "attended" ||
        booking.status === "noshow" ||
        booking.status === "waitlist"
      );
    });
    if (!upcoming.length) {
      root.innerHTML = "<p class=\"studio-note\">Pas encore de cours réservé.</p>";
      return;
    }
    root.innerHTML =
      "<h2>Mes cours</h2>" +
      upcoming
        .map(function (booking) {
          var extra = "";
          if (booking.status === "attended") extra = " · présente";
          if (booking.status === "noshow") extra = " · absente";
          if (booking.status === "waitlist") {
            extra =
              " · file n°" +
              (booking.waitlistPosition || "?");
          }
          var cancel = "";
          if (booking.status === "waitlist") {
            cancel =
              ' <button type="button" class="studio-ghost" data-cancel="' +
              escapeHtml(booking.id) +
              '">Quitter</button>';
          } else if (booking.status === "booked" && booking.canCancel) {
            cancel =
              ' <button type="button" class="studio-ghost" data-cancel="' +
              escapeHtml(booking.id) +
              '">Annuler</button>';
          } else if (booking.status === "booked") {
            cancel =
              " <small>Délai dépassé" +
              (booking.cancelUntil ? " (" + formatUntil(booking.cancelUntil) + ")" : "") +
              "</small>";
          }
          return (
            "<p>" +
            escapeHtml(booking.slotLabel) +
            extra +
            cancel +
            "</p>"
          );
        })
        .join("");
  }

  function renderWeek() {
    var root = $("[data-calendar]");
    var label = $("[data-week-label]");
    if (!root) return;
    var keys = weeksFrom(sessions.occurrences || []);
    if (!keys.length) {
      root.innerHTML = "<p>Planning indisponible.</p>";
      return;
    }
    if (weekIndex < 0) weekIndex = 0;
    if (weekIndex > keys.length - 1) weekIndex = keys.length - 1;
    var key = keys[weekIndex];
    var weekOcc = (sessions.occurrences || []).filter(function (occ) {
      return weekKey(occ.date) === key;
    });
    var days = [];
    weekOcc.forEach(function (occ) {
      if (days.indexOf(occ.date) < 0) days.push(occ.date);
    });
    if (label) {
      var last = days[days.length - 1];
      label.textContent =
        "Semaine du " +
        formatDay(days[0] || key) +
        (last && last !== days[0] ? " au " + formatDay(last) : "");
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
                var mine = mineOn(occ.id);
                var waiting = waitingOn(occ.id);
                var closed = Boolean(occ.closed);
                var full = occ.remaining <= 0 && !mine;
                var past = Boolean(occ.past);
                var cls =
                  "studio-occ" +
                  (closed ? " studio-occ--closed" : "") +
                  (full && !waiting && !closed ? " studio-occ--full" : "") +
                  (waiting ? " studio-occ--wait studio-occ--mine" : "") +
                  (mine ? " studio-occ--mine" : "");
                var spots = closed
                  ? "Séance annulée par le studio" +
                    (occ.closedReason ? " — " + escapeHtml(occ.closedReason) : "")
                  : escapeHtml(occ.level) +
                    " · " +
                    occ.remaining +
                    "/" +
                    occ.capacity +
                    " places" +
                    (occ.waitlisted
                      ? " · " + occ.waitlisted + " en file"
                      : "");
                var action;
                if (closed) {
                  action = "<span>Annulé</span>";
                } else if (mine) {
                  if (mine.status === "attended") {
                    action = "<span>Présente</span>";
                  } else if (mine.canCancel) {
                    action =
                      '<button type="button" class="studio-ghost" data-cancel="' +
                      escapeHtml(mine.id) +
                      '">Annuler</button>';
                  } else {
                    action = "<span>Inscrite · délai dépassé</span>";
                  }
                } else if (waiting) {
                  action =
                    "<span>File n°" +
                    escapeHtml(waiting.waitlistPosition || "?") +
                    '</span> <button type="button" class="studio-ghost" data-cancel="' +
                    escapeHtml(waiting.id) +
                    '">quitter</button>';
                } else if (past) {
                  action = "<span>Passé</span>";
                } else if (full) {
                  action =
                    '<button type="button" class="cta w-button" data-waitlist="' +
                    escapeHtml(occ.id) +
                    '">Liste d’attente</button>';
                } else {
                  action =
                    '<button type="button" class="cta w-button" data-book="' +
                    escapeHtml(occ.id) +
                    '">Réserver</button>';
                }
                return (
                  '<div class="' +
                  cls +
                  '"><strong>' +
                  escapeHtml(occ.start) +
                  " " +
                  escapeHtml(occ.title) +
                  "</strong><span class=\"studio-spots\">" +
                  spots +
                  "</span> " +
                  action +
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

  function loadSessions() {
    return fetch("/api/studio/sessions", { credentials: "same-origin" })
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        sessions = data;
        setCancelHoursLabel(data.cancelHours);
        renderWeek();
      });
  }

  function loadAccount(email) {
    return fetch("/api/studio/account?email=" + encodeURIComponent(email), {
      credentials: "same-origin",
    })
      .then(function (res) {
        return res.json().then(function (data) {
          if (!res.ok) throw new Error(data.error || "Compte introuvable");
          return data;
        });
      })
      .then(function (data) {
        account = data;
        var name = $("[data-name]");
        if (name && data.name && !name.value) name.value = data.name;
        setCancelHoursLabel(data.cancelHours);
        renderCredits();
        renderMine();
        renderWeek();
        var hint = $("[data-lookup-hint]");
        if (hint) {
          if (!data.credits.reformer && !data.credits.mat) {
            hint.textContent =
              "Aucun crédit sur cet e-mail. Achetez une formule, puis revenez réserver.";
          } else {
            hint.textContent = "";
          }
        }
      });
  }

  function book(occurrenceId, waitlist) {
    var email = $("[data-email]").value.trim();
    var name = $("[data-name]").value.trim();
    var phone = $("[data-phone]").value.trim();
    var hint = $("[data-book-hint]");
    if (!email || !name) {
      if (hint) hint.textContent = "Indiquez votre nom et votre e-mail.";
      return;
    }
    fetch("/api/studio/book", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email,
        name: name,
        phone: phone,
        occurrenceId: occurrenceId,
        waitlist: Boolean(waitlist),
      }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { res: res, data: data };
        });
      })
      .then(function (result) {
        if (!result.res.ok) {
          if (hint) hint.textContent = result.data.error || "Réservation impossible";
          return;
        }
        if (hint) {
          hint.textContent =
            result.data.waitlist ||
            (result.data.booking && result.data.booking.status === "waitlist")
              ? "Inscrite en liste d’attente."
              : "Cours réservé.";
        }
        return Promise.all([loadSessions(), loadAccount(email)]);
      })
      .catch(function () {
        if (hint) hint.textContent = "Réseau indisponible.";
      });
  }

  function cancel(bookingId) {
    var email = $("[data-email]").value.trim();
    var hint = $("[data-book-hint]");
    var wasWait =
      account &&
      (account.bookings || []).some(function (booking) {
        return booking.id === bookingId && booking.status === "waitlist";
      });
    fetch("/api/studio/book", {
      method: "PATCH",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, bookingId: bookingId }),
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { res: res, data: data };
        });
      })
      .then(function (result) {
        if (!result.res.ok) {
          if (hint) hint.textContent = result.data.error || "Annulation impossible";
          return;
        }
        if (hint) {
          hint.textContent = wasWait
            ? "Sortie de la file."
            : "Cours annulé. Le crédit a été rendu.";
        }
        return Promise.all([loadSessions(), loadAccount(email)]);
      })
      .catch(function () {
        if (hint) hint.textContent = "Réseau indisponible.";
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var params = new URLSearchParams(window.location.search);
    var preset = params.get("email");
    if (preset) $("[data-email]").value = preset;
    loadSessions().then(function () {
      if (preset) return loadAccount(preset);
    });

    $("[data-lookup]").addEventListener("submit", function (event) {
      event.preventDefault();
      loadAccount($("[data-email]").value.trim()).catch(function (err) {
        var hint = $("[data-lookup-hint]");
        if (hint) hint.textContent = err.message;
      });
    });

    $("[data-prev-week]").addEventListener("click", function () {
      weekIndex -= 1;
      renderWeek();
    });
    $("[data-next-week]").addEventListener("click", function () {
      weekIndex += 1;
      renderWeek();
    });

    document.addEventListener("click", function (event) {
      var bookBtn = event.target.closest("[data-book]");
      if (bookBtn) {
        book(bookBtn.getAttribute("data-book"), false);
        return;
      }
      var waitBtn = event.target.closest("[data-waitlist]");
      if (waitBtn) {
        book(waitBtn.getAttribute("data-waitlist"), true);
        return;
      }
      var cancelBtn = event.target.closest("[data-cancel]");
      if (cancelBtn) cancel(cancelBtn.getAttribute("data-cancel"));
    });
  });
})();
