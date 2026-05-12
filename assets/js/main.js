/* Protection Habitat Sud-Ouest - main.js
 *
 * Améliorations conversion :
 *  - Formulaire multi-step (4 écrans, le téléphone est demandé en dernier)
 *  - Variante "rappel express" (3 champs)
 *  - Honeypot anti-bot
 *  - Validation FR (téléphone + code postal)
 *  - Soumission via FORM_ENDPOINT (Formspree / Make / webhook) avec fallback mailto
 *  - Tracking dataLayer + gtag (steps, submit, phone clicks, callback)
 *  - Bannière saisonnière (mars → octobre) injectée automatiquement
 *  - Sticky CTA desktop activé après scroll
 *  - Injection facultative de Microsoft Clarity et Meta Pixel
 *
 * À configurer AVANT mise en production (cf. constantes ci-dessous).
 */

(function () {
  "use strict";

  // === À CONFIGURER ===
  // 1) Endpoint de soumission : Formspree, Make/Zapier webhook, ou backend custom.
  var FORM_ENDPOINT = "";                          // ex: "https://formspree.io/f/XXXXXXXX"
  var FALLBACK_EMAIL = "contact@protection-habitat-sudouest.fr";

  // 2) Outils analytics. Laisser vide pour ne pas charger.
  var CLARITY_ID = "";                             // Microsoft Clarity (gratuit) - ID projet
  var META_PIXEL_ID = "";                          // Facebook / Meta Pixel - ID

  // 3) Bannière saisonnière (les mois en chiffres 1-12)
  var SEASON_BANNER_MONTHS = [3,4,5,6,7,8,9,10];
  // ====================

  function $(s,r){return (r||document).querySelector(s);}
  function $all(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}

  function track(event, data) {
    try {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(Object.assign({ event: event }, data || {}));
    } catch (e) {}
    try {
      if (typeof window.gtag === "function") window.gtag("event", event, data || {});
    } catch (e) {}
  }

  // ---------- Microsoft Clarity (optionnel) ----------
  function injectClarity() {
    if (!CLARITY_ID) return;
    (function (c,l,a,r,i,t,y) {
      c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", CLARITY_ID);
  }

  // ---------- Meta Pixel (optionnel) ----------
  function injectMetaPixel() {
    if (!META_PIXEL_ID) return;
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', META_PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  // ---------- Tracking clic téléphone ----------
  function setupPhoneTracking() {
    $all('a[href^="tel:"]').forEach(function (a) {
      a.addEventListener("click", function () {
        track("phone_click", { phone: a.getAttribute("href").replace("tel:", "") });
        if (window.fbq) try { window.fbq('track', 'Contact'); } catch(e){}
      });
    });
  }

  // ---------- Validations ----------
  function validPhone(raw) {
    if (!raw) return false;
    var c = raw.replace(/[^\d+]/g, "");
    if (/^0[1-9]\d{8}$/.test(c)) return true;
    if (/^\+33[1-9]\d{8}$/.test(c)) return true;
    return false;
  }
  function validPostal(raw) { return /^\d{5}$/.test((raw || "").trim()); }

  // ---------- Multi-step form construction ----------
  function buildMultiStep(submitLabel, thanksUrl) {
    var stepsHtml = [
      // STEP 1 : problème observé
      '<div class="ms-step active" data-step="1">' +
        '<h3 class="ms-q">Quel est le problème observé&nbsp;?</h3>' +
        '<p class="ms-sub">Un clic suffit. Vous pouvez préciser plus tard.</p>' +
        '<div class="ms-options" data-field="probleme">' +
          opt("mousse", "🌿", "Mousse / lichens") +
          opt("traces_noires", "⬛", "Traces noires") +
          opt("tuiles_poreuses", "🧱", "Tuiles poreuses") +
          opt("infiltration", "💧", "Infiltration / fuite") +
          opt("facade_sale", "🏠", "Façade sale") +
          opt("autre", "❓", "Autre / je ne sais pas") +
        '</div>' +
        '<input type="hidden" name="probleme">' +
        '<div class="ms-shortcut"><a href="#" class="ms-cb-toggle">Plutôt un rappel rapide en 30&nbsp;sec →</a></div>' +
      '</div>',

      // STEP 2 : délai
      '<div class="ms-step" data-step="2">' +
        '<button type="button" class="ms-back">← Retour</button>' +
        '<h3 class="ms-q">Quel est votre délai&nbsp;?</h3>' +
        '<div class="ms-options" data-field="delai">' +
          opt("urgent", "⚡", "Urgent (sous 7 jours)") +
          opt("mois", "📅", "Dans le mois") +
          opt("renseignement", "💭", "Simple renseignement") +
        '</div>' +
        '<input type="hidden" name="delai">' +
      '</div>',

      // STEP 3 : localisation
      '<div class="ms-step" data-step="3">' +
        '<button type="button" class="ms-back">← Retour</button>' +
        '<h3 class="ms-q">Où se trouve votre toiture&nbsp;?</h3>' +
        '<div class="form-grid">' +
          '<div class="form-row"><label>Code postal <span class="req">*</span>' +
            '<input type="text" name="code_postal" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="87000" required></label></div>' +
          '<div class="form-row"><label>Ville <span class="req">*</span>' +
            '<input type="text" name="ville" autocomplete="address-level2" placeholder="Limoges" required></label></div>' +
        '</div>' +
        '<div class="form-row"><label>Vous êtes <span class="req">*</span>' +
          '<select name="statut" required>' +
            '<option value="">— Choisir —</option>' +
            '<option value="proprietaire">Propriétaire</option>' +
            '<option value="locataire">Locataire</option>' +
            '<option value="syndic">Syndic / copropriété</option>' +
            '<option value="autre">Autre</option>' +
          '</select></label></div>' +
        '<button type="button" class="btn ms-next">Continuer</button>' +
      '</div>',

      // STEP 4 : coordonnées
      '<div class="ms-step" data-step="4">' +
        '<button type="button" class="ms-back">← Retour</button>' +
        '<h3 class="ms-q">Comment vous joindre&nbsp;?</h3>' +
        '<p class="ms-sub">Le partenaire vous rappelle. Pas de démarchage non sollicité, pas de revente de données.</p>' +
        '<div class="form-row"><label>Prénom <span class="req">*</span>' +
          '<input type="text" name="prenom" autocomplete="given-name" required></label></div>' +
        '<div class="form-row"><label>Téléphone <span class="req">*</span>' +
          '<input type="tel" name="telephone" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" required></label></div>' +
        '<div class="form-row"><label>Photos (optionnel)' +
          '<input type="file" name="photos" accept="image/*" multiple>' +
          '<small class="form-note">Une photo de votre toiture aide à mieux qualifier votre demande.</small>' +
        '</label></div>' +
        '<div class="form-row"><label>Message (optionnel)' +
          '<textarea name="message" rows="2" placeholder="Surface approximative, âge…"></textarea></label></div>' +
        '<input type="hidden" name="type_demande" value="toiture">' +
        '<div class="consent"><label><input type="checkbox" name="consent" required>' +
          '<span>J’accepte que mes informations soient utilisées pour être recontacté et transmises à un professionnel partenaire intervenant dans ma zone. Voir la <a href="/politique-confidentialite/">politique de confidentialité</a>.</span>' +
        '</label></div>' +
        '<button type="submit" class="btn ms-submit" data-cta="form_submit_ms">' + escapeHtml(submitLabel) + '</button>' +
      '</div>'
    ].join("");

    function opt(val, ic, label) {
      return '<button type="button" class="ms-opt" data-value="' + val + '">' +
             '<span class="ms-ic" aria-hidden="true">' + ic + '</span>' +
             '<span class="ms-lbl">' + label + '</span></button>';
    }

    return '' +
      '<form id="lead-form-ms" novalidate data-thanks="' + escapeAttr(thanksUrl) + '">' +
        '<div class="ms-progress-wrap">' +
          '<div class="ms-progress-label"><span class="ms-progress-step">1</span><span class="ms-progress-sep"> sur </span><span class="ms-progress-total">4</span> · <span class="ms-progress-pct">25%</span></div>' +
          '<div class="ms-progress" aria-hidden="true">' +
            '<div class="ms-progress-fill" style="width:25%"></div>' +
          '</div>' +
        '</div>' +
        '<div class="form-error" role="alert"></div>' +
        stepsHtml +
        '<div style="position:absolute;left:-9999px" aria-hidden="true">' +
          '<input type="text" name="website" tabindex="-1" autocomplete="off">' +
        '</div>' +
      '</form>' +
      // Callback express (caché par défaut)
      '<form id="lead-form-cb" class="cb-form" novalidate data-thanks="' + escapeAttr(thanksUrl) + '" style="display:none">' +
        '<button type="button" class="ms-back cb-toggle-back">← Formulaire complet</button>' +
        '<h3 class="ms-q">Rappel express en 30&nbsp;secondes</h3>' +
        '<p class="ms-sub">Pas envie de remplir un formulaire complet ? Laissez juste vos coordonnées, on s’occupe du reste.</p>' +
        '<div class="form-error" role="alert"></div>' +
        '<div class="form-row"><label>Prénom <span class="req">*</span>' +
          '<input type="text" name="prenom" autocomplete="given-name" required></label></div>' +
        '<div class="form-row"><label>Téléphone <span class="req">*</span>' +
          '<input type="tel" name="telephone" inputmode="tel" autocomplete="tel" placeholder="06 12 34 56 78" required></label></div>' +
        '<div class="form-row"><label>Code postal <span class="req">*</span>' +
          '<input type="text" name="code_postal" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="87000" required></label></div>' +
        '<div class="form-row"><label>Quand vous rappeler&nbsp;?' +
          '<select name="creneau">' +
            '<option value="asap">Dès que possible</option>' +
            '<option value="matin">Le matin</option>' +
            '<option value="apresmidi">L’après-midi</option>' +
            '<option value="soir">En soirée</option>' +
          '</select></label></div>' +
        '<input type="hidden" name="type_demande" value="callback_rapide">' +
        '<input type="hidden" name="probleme" value="ne_sait_pas">' +
        '<input type="hidden" name="delai" value="urgent">' +
        '<input type="hidden" name="statut" value="non_precise">' +
        '<input type="hidden" name="ville" value="">' +
        '<div class="consent"><label><input type="checkbox" name="consent" required>' +
          '<span>J’accepte d’être recontacté par un professionnel partenaire local.</span></label></div>' +
        '<div style="position:absolute;left:-9999px" aria-hidden="true">' +
          '<input type="text" name="website" tabindex="-1" autocomplete="off">' +
        '</div>' +
        '<button type="submit" class="btn">Soyez rappelé</button>' +
      '</form>';
  }

  function escapeHtml(s){return String(s).replace(/[&<>"']/g,function(c){return ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
  function escapeAttr(s){return String(s).replace(/"/g,"&quot;");}

  // ---------- Setup form (multi-step ou long form selon data-no-multistep) ----------
  function setupForm() {
    var orig = document.getElementById("lead-form");
    if (!orig) return;

    var thanksUrl = orig.getAttribute("data-thanks") || "/merci/";

    // Si data-no-multistep est présent (page SEO), on garde le long form
    // mais on branche quand même la soumission et le tracking
    if (orig.hasAttribute("data-no-multistep")) {
      wireLongForm(orig, thanksUrl);
      return;
    }

    var submitBtn = orig.querySelector('button[type="submit"]');
    var submitLabel = (submitBtn && submitBtn.textContent.trim()) || "Demander mon diagnostic gratuit";
    var wrap = orig.closest(".form-wrap") || orig.parentNode;

    // Remplace par le multi-step
    orig.remove();
    var html = buildMultiStep(submitLabel, thanksUrl);
    var holder = document.createElement("div");
    holder.innerHTML = html;
    while (holder.firstChild) wrap.appendChild(holder.firstChild);

    var msForm = wrap.querySelector("#lead-form-ms");
    var cbForm = wrap.querySelector("#lead-form-cb");
    wireMultiStep(msForm, cbForm, thanksUrl);
    wireCallback(cbForm, msForm, thanksUrl);
    wireFormStartedTracking(msForm);
    wirePhotosTracking(msForm);
  }

  // Variante : formulaire long (page SEO) — pas de multi-step, juste tracking + submit
  function wireLongForm(form, thanksUrl) {
    var err = form.querySelector(".form-error");
    wireFormStartedTracking(form);
    wirePhotosTracking(form);
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var prenom = (data.get("prenom") || "").toString().trim();
      var phone = (data.get("telephone") || "").toString().trim();
      var cp = (data.get("code_postal") || "").toString().trim();
      var ville = (data.get("ville") || "").toString().trim();
      var consent = form.querySelector('input[name="consent"]');

      if (prenom.length < 2) return showErr(err, "Merci d’indiquer votre prénom.");
      if (!validPhone(phone)) return showErr(err, "Numéro de téléphone invalide (10 chiffres).");
      if (!validPostal(cp)) return showErr(err, "Code postal sur 5 chiffres.");
      if (ville.length < 2) return showErr(err, "Merci d’indiquer votre ville.");
      if (!consent || !consent.checked) return showErr(err, "Vous devez accepter la transmission au professionnel partenaire.");

      submitForm(form, thanksUrl, "longform");
    });
  }

  function showStep(form, n) {
    var total = 4;
    $all(".ms-step", form).forEach(function (s) {
      s.classList.toggle("active", parseInt(s.getAttribute("data-step"), 10) === n);
    });
    var fill = form.querySelector(".ms-progress-fill");
    var pct = Math.round((n / total) * 100);
    if (fill) fill.style.width = pct + "%";
    var lblStep = form.querySelector(".ms-progress-step");
    var lblPct  = form.querySelector(".ms-progress-pct");
    if (lblStep) lblStep.textContent = String(n);
    if (lblPct)  lblPct.textContent  = pct + "%";
    // Focus le premier input du nouveau step
    var current = form.querySelector('.ms-step.active');
    if (current) {
      var firstInput = current.querySelector("input:not([type=hidden]):not([type=checkbox]), select, textarea");
      if (firstInput) setTimeout(function(){ try { firstInput.focus({preventScroll:true}); } catch(e){} }, 50);
    }
    track("ms_step_view", { step: n });
  }

  function wireMultiStep(form, cbForm, thanksUrl) {
    if (!form) return;
    var currentStep = 1;

    // Options à clic auto-advance
    $all(".ms-options", form).forEach(function (g) {
      var fieldName = g.getAttribute("data-field");
      var hiddenInput = form.querySelector('input[name="' + fieldName + '"]');
      $all(".ms-opt", g).forEach(function (btn) {
        btn.addEventListener("click", function () {
          $all(".ms-opt", g).forEach(function(b){b.classList.remove("selected");});
          btn.classList.add("selected");
          if (hiddenInput) hiddenInput.value = btn.getAttribute("data-value");
          track("ms_select", { field: fieldName, value: btn.getAttribute("data-value") });
          // Auto-advance après ~250ms (feedback visuel)
          setTimeout(function () {
            currentStep = Math.min(currentStep + 1, 4);
            showStep(form, currentStep);
          }, 250);
        });
      });
    });

    // Bouton "Continuer" sur step 3
    $all(".ms-next", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        var step = btn.closest(".ms-step");
        if (!validateStep(step)) return;
        currentStep = Math.min(currentStep + 1, 4);
        showStep(form, currentStep);
      });
    });

    // Boutons "Retour"
    $all(".ms-back", form).forEach(function (btn) {
      btn.addEventListener("click", function () {
        currentStep = Math.max(currentStep - 1, 1);
        showStep(form, currentStep);
      });
    });

    // Toggle callback express
    var cbToggle = form.querySelector(".ms-cb-toggle");
    if (cbToggle && cbForm) {
      cbToggle.addEventListener("click", function (e) {
        e.preventDefault();
        form.style.display = "none";
        cbForm.style.display = "";
        track("cb_form_view");
        var first = cbForm.querySelector('input[name="prenom"]');
        if (first) try { first.focus({preventScroll:true}); } catch(e){}
      });
    }

    // Submit
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var lastStep = form.querySelector('.ms-step[data-step="4"]');
      if (!validateStep(lastStep)) return;
      submitForm(form, thanksUrl, "multistep");
    });
  }

  function wireCallback(form, msForm, thanksUrl) {
    if (!form) return;
    var back = form.querySelector(".cb-toggle-back");
    if (back && msForm) {
      back.addEventListener("click", function () {
        form.style.display = "none";
        msForm.style.display = "";
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var err = form.querySelector(".form-error");
      var data = new FormData(form);
      var prenom = (data.get("prenom") || "").toString().trim();
      var phone = (data.get("telephone") || "").toString().trim();
      var cp = (data.get("code_postal") || "").toString().trim();
      var consent = form.querySelector('input[name="consent"]');
      if (prenom.length < 2) return showErr(err, "Merci d’indiquer votre prénom.");
      if (!validPhone(phone)) return showErr(err, "Numéro de téléphone invalide (10 chiffres).");
      if (!validPostal(cp)) return showErr(err, "Code postal sur 5 chiffres.");
      if (!consent || !consent.checked) return showErr(err, "Merci d’accepter d’être recontacté.");
      // Renseigne la ville par défaut si vide
      var villeIn = form.querySelector('input[name="ville"]');
      if (villeIn && !villeIn.value) villeIn.value = "(callback express - à préciser au téléphone)";
      submitForm(form, thanksUrl, "callback");
    });
  }

  function validateStep(step) {
    if (!step) return true;
    var err = step.closest("form").querySelector(".form-error");
    var stepNum = parseInt(step.getAttribute("data-step"), 10);

    // Steps à options
    var optGroup = step.querySelector(".ms-options");
    if (optGroup) {
      var f = optGroup.getAttribute("data-field");
      var hidden = step.querySelector('input[name="' + f + '"]');
      if (!hidden || !hidden.value) {
        showErr(err, "Merci de choisir une option.");
        return false;
      }
      clearErr(err);
      return true;
    }

    // Step 3 : CP + ville + statut
    if (stepNum === 3) {
      var cp = step.querySelector('input[name="code_postal"]');
      var ville = step.querySelector('input[name="ville"]');
      var statut = step.querySelector('select[name="statut"]');
      if (!validPostal(cp && cp.value)) { showErr(err, "Code postal sur 5 chiffres."); cp && cp.focus(); return false; }
      if (!ville || ville.value.trim().length < 2) { showErr(err, "Merci d’indiquer votre ville."); ville && ville.focus(); return false; }
      if (!statut || !statut.value) { showErr(err, "Merci d’indiquer votre statut."); statut && statut.focus(); return false; }
      clearErr(err);
      return true;
    }

    // Step 4 : coordonnées
    if (stepNum === 4) {
      var prenom = step.querySelector('input[name="prenom"]');
      var phone = step.querySelector('input[name="telephone"]');
      var consent = step.querySelector('input[name="consent"]');
      if (!prenom || prenom.value.trim().length < 2) { showErr(err, "Merci d’indiquer votre prénom."); prenom && prenom.focus(); return false; }
      if (!validPhone(phone && phone.value)) { showErr(err, "Numéro de téléphone invalide (10 chiffres)."); phone && phone.focus(); return false; }
      if (!consent || !consent.checked) { showErr(err, "Vous devez accepter la transmission au professionnel partenaire."); return false; }
      clearErr(err);
      return true;
    }

    clearErr(err);
    return true;
  }

  function showErr(box, msg) {
    if (!box) return;
    box.textContent = msg;
    box.classList.add("show");
    try { box.scrollIntoView({behavior:"smooth", block:"center"}); } catch(e){}
  }
  function clearErr(box) {
    if (!box) return;
    box.textContent = "";
    box.classList.remove("show");
  }

  function submitForm(form, thanksUrl, kind) {
    var err = form.querySelector(".form-error");
    var honey = form.querySelector('input[name="website"]');
    if (honey && honey.value) { track("lead_blocked_bot", { kind: kind }); return; }

    var submitBtn = form.querySelector('button[type="submit"]');
    var origLabel = submitBtn ? submitBtn.textContent : "";
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Envoi en cours…"; }

    var data = new FormData(form);
    data.append("source_page", location.pathname);
    data.append("submitted_at", new Date().toISOString());
    data.append("form_variant", kind);

    function onSuccess() {
      track("lead_submit", {
        kind: kind,
        ville: data.get("ville"),
        code_postal: data.get("code_postal"),
        delai: data.get("delai"),
        probleme: data.get("probleme"),
        source_page: location.pathname
      });
      if (window.fbq) try { window.fbq('track', 'Lead'); } catch(e){}
      window.location.href = thanksUrl || "/merci/";
    }
    function onFail(reason) {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
      showErr(err, "Impossible d’envoyer la demande. Réessayez ou appelez directement.");
      track("lead_submit_error", { reason: reason || "unknown", kind: kind });
    }

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, { method: "POST", headers: { "Accept": "application/json" }, body: data })
        .then(function (r) { if (r.ok) onSuccess(); else onFail("http_" + r.status); })
        .catch(function () { onFail("network"); });
    } else {
      // Fallback mailto (TEMPORAIRE — à brancher à un vrai endpoint)
      var lines = [];
      var iter = data.entries();
      var entry = iter.next();
      while (!entry.done) {
        var k = entry.value[0], v = entry.value[1];
        if (k && typeof v === "string" && v.length) lines.push(k + " : " + v);
        entry = iter.next();
      }
      var subject = encodeURIComponent("Nouveau lead — " + (data.get("ville") || "ville à préciser"));
      var body = encodeURIComponent(lines.join("\n"));
      track("lead_submit_fallback_mailto", { kind: kind });
      window.location.href = "mailto:" + FALLBACK_EMAIL + "?subject=" + subject + "&body=" + body;
      setTimeout(function () {
        if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = origLabel; }
      }, 1500);
    }
  }

  // ---------- Bannière saisonnière ----------
  function injectSeasonBanner() {
    var month = new Date().getMonth() + 1;
    if (SEASON_BANNER_MONTHS.indexOf(month) === -1) return;
    if (document.querySelector(".season-banner")) return;
    var banner = document.createElement("div");
    banner.className = "season-banner";
    banner.innerHTML = '<span class="season-dot"></span> Saison hydrofuge en cours&nbsp;: les diagnostics se font de mars à octobre. ' +
                       '<a href="#diagnostic">Réservez votre créneau →</a>';
    document.body.insertBefore(banner, document.body.firstChild);
  }

  // ---------- Sticky CTA desktop (apparaît après scroll) ----------
  function setupDesktopStickyCTA() {
    if (window.matchMedia("(max-width: 860px)").matches) return;
    var existing = document.querySelector(".sticky-cta-desktop");
    if (existing) return;
    var hero = document.querySelector(".hero");
    if (!hero) return;
    var cta = document.createElement("a");
    cta.className = "sticky-cta-desktop";
    cta.href = "#diagnostic";
    cta.innerHTML = "Diagnostic gratuit →";
    document.body.appendChild(cta);
    function onScroll() {
      var rect = hero.getBoundingClientRect();
      cta.classList.toggle("visible", rect.bottom < 80);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // ---------- Tracking CTA clicks (boutons / liens avec [data-cta]) ----------
  function setupCtaTracking() {
    document.addEventListener("click", function (e) {
      var el = e.target.closest && e.target.closest("[data-cta]");
      if (!el) return;
      var cta = el.getAttribute("data-cta");
      track("cta_click", { cta: cta, label: el.textContent.trim().slice(0, 80), source_page: location.pathname });
    });
  }

  // ---------- Tracking form_started (1re interaction utilisateur) ----------
  function wireFormStartedTracking(form) {
    if (!form) return;
    var started = false;
    function once() {
      if (started) return;
      started = true;
      track("form_started", { source_page: location.pathname });
    }
    form.addEventListener("input", once, { once: false });
    form.addEventListener("change", once, { once: false });
  }

  // ---------- Tracking photo_added ----------
  function wirePhotosTracking(form) {
    if (!form) return;
    var input = form.querySelector('input[name="photos"]');
    if (!input) return;
    input.addEventListener("change", function () {
      var n = (input.files || []).length;
      if (n > 0) track("photo_added", { count: n, source_page: location.pathname });
    });
  }

  // ---------- Fade-in on scroll (micro-anim) ----------
  function setupFadeInOnScroll() {
    if (!("IntersectionObserver" in window)) return;
    var prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    var selectors = [
      ".trust-block",
      ".trust-item",
      ".trust-banner",
      ".card",
      ".badge",
      ".faq details",
      ".block.prose > .container > *",
      ".block.center > .container > *"
    ];
    var targets = document.querySelectorAll(selectors.join(","));
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("fade-up-in");
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    targets.forEach(function (t, i) {
      t.classList.add("fade-up");
      t.style.transitionDelay = Math.min(i % 8, 6) * 40 + "ms";
      obs.observe(t);
    });
  }

  // ---------- Smooth scroll ancres ----------
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
    injectClarity();
    injectMetaPixel();
    injectSeasonBanner();
    setupPhoneTracking();
    setupCtaTracking();
    setupForm();
    setupAnchors();
    setupDesktopStickyCTA();
    setupFadeInOnScroll();
  });
})();
