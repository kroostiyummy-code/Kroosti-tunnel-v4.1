/* Protection Habitat Sud-Ouest - main.js
 * - Validation côté client du formulaire de lead
 * - Hooks de tracking (dataLayer / gtag) si GTM ou GA4 sont présents
 * - Submission via FORM_ENDPOINT (à configurer) ou fallback mailto
 * - Tracking des clics téléphone
 */

(function () {
  "use strict";

  // === À CONFIGURER À LA MISE EN LIGNE ===
  // 1) Endpoint de soumission : Formspree, Make/Zapier webhook, ou backend custom.
  //    Exemple Formspree : "https://formspree.io/f/XXXXXXXX"
  //    Si vide, on bascule sur un mailto: en dernier recours.
  var FORM_ENDPOINT = ""; // ex: "https://formspree.io/f/XXXXXXXX"
  var FALLBACK_EMAIL = "contact@protection-habitat-sudouest.fr";
  // =========================================

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function track(event, data) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: event }, data || {}));
    } catch (e) {}
    try {
      if (typeof window.gtag === "function") {
        window.gtag("event", event, data || {});
      }
    } catch (e) {}
  }

  // ---- Tracking clic téléphone ----
  function setupPhoneTracking() {
    $all('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () {
        track("phone_click", { phone: a.getAttribute("href").replace("tel:", "") });
      });
    });
  }

  // ---- Validation + soumission du formulaire ----
  function setupForm() {
    var form = $("#lead-form");
    if (!form) return;

    var errorBox = $(".form-error", form);
    var submitBtn = form.querySelector('button[type="submit"]');

    function showError(msg) {
      if (!errorBox) return;
      errorBox.textContent = msg;
      errorBox.classList.add("show");
      errorBox.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    function clearError() {
      if (!errorBox) return;
      errorBox.classList.remove("show");
      errorBox.textContent = "";
    }

    function validatePhone(raw) {
      if (!raw) return false;
      var cleaned = raw.replace(/[^\d+]/g, "");
      // FR : 10 chiffres commençant par 0, ou +33 suivi de 9 chiffres
      if (/^0[1-9]\d{8}$/.test(cleaned)) return true;
      if (/^\+33[1-9]\d{8}$/.test(cleaned)) return true;
      return false;
    }
    function validatePostal(raw) {
      return /^\d{5}$/.test((raw || "").trim());
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      clearError();

      var data = new FormData(form);
      var prenom = (data.get("prenom") || "").toString().trim();
      var phone = (data.get("telephone") || "").toString().trim();
      var cp = (data.get("code_postal") || "").toString().trim();
      var ville = (data.get("ville") || "").toString().trim();
      var statut = (data.get("statut") || "").toString();
      var type = (data.get("type_demande") || "").toString();
      var probleme = (data.get("probleme") || "").toString();
      var delai = (data.get("delai") || "").toString();
      var consent = form.querySelector('input[name="consent"]');

      if (prenom.length < 2) return showError("Merci d’indiquer votre prénom.");
      if (!validatePhone(phone)) return showError("Le numéro de téléphone semble invalide. Indiquez un numéro français à 10 chiffres.");
      if (!validatePostal(cp)) return showError("Le code postal doit comporter 5 chiffres.");
      if (ville.length < 2) return showError("Merci d’indiquer votre ville.");
      if (!statut) return showError("Merci d’indiquer si vous êtes propriétaire, locataire, syndic ou autre.");
      if (!type) return showError("Merci de préciser le type de demande.");
      if (!probleme) return showError("Merci de préciser le problème observé.");
      if (!delai) return showError("Merci d’indiquer le délai souhaité.");
      if (!consent || !consent.checked) return showError("Vous devez accepter la transmission de votre demande à un professionnel partenaire.");

      // Honeypot anti-bot
      var honey = form.querySelector('input[name="website"]');
      if (honey && honey.value) {
        // Silently drop
        track("lead_blocked_bot");
        return;
      }

      // Ajoute la source (page) et la date
      data.append("source_page", location.pathname);
      data.append("submitted_at", new Date().toISOString());

      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = "Envoi en cours…";

      function onSuccess() {
        track("lead_submit", {
          ville: ville,
          code_postal: cp,
          type_demande: type,
          delai: delai,
          source_page: location.pathname
        });
        // Redirection vers page merci
        var thanksUrl = form.getAttribute("data-thanks") || "/merci/";
        window.location.href = thanksUrl;
      }

      function onFail(reason) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalLabel;
        showError("Impossible d’envoyer la demande pour le moment. Merci de réessayer dans un instant ou de nous appeler directement.");
        track("lead_submit_error", { reason: reason || "unknown" });
      }

      if (FORM_ENDPOINT) {
        fetch(FORM_ENDPOINT, {
          method: "POST",
          headers: { "Accept": "application/json" },
          body: data
        })
          .then(function (res) {
            if (res.ok) onSuccess();
            else onFail("http_" + res.status);
          })
          .catch(function (err) { onFail("network"); });
      } else {
        // Fallback : ouvre le client mail avec un résumé pré-rempli.
        // À remplacer par un endpoint réel dès que possible.
        var lines = [
          "Nouveau lead — " + (ville || "ville non précisée"),
          "Prénom : " + prenom,
          "Téléphone : " + phone,
          "Code postal : " + cp,
          "Ville : " + ville,
          "Statut : " + statut,
          "Type de demande : " + type,
          "Problème : " + probleme,
          "Délai : " + delai,
          "Message : " + (data.get("message") || ""),
          "Source : " + location.href
        ];
        var subject = encodeURIComponent("Demande de diagnostic — " + ville);
        var body = encodeURIComponent(lines.join("\n"));
        // Marque comme submit local
        track("lead_submit_fallback_mailto");
        window.location.href = "mailto:" + FALLBACK_EMAIL + "?subject=" + subject + "&body=" + body;
        setTimeout(function () {
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        }, 1500);
      }
    });
  }

  // ---- Smooth scroll pour ancres internes ----
  function setupAnchors() {
    $all('a[href^="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        var id = a.getAttribute("href");
        if (!id || id === "#") return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupPhoneTracking();
    setupForm();
    setupAnchors();
  });
})();
