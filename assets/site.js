// Site partagé : reveal au scroll, slider avant/après, menu mobile, formulaire de contact.

document.addEventListener('DOMContentLoaded', () => {
  // === Reveal au scroll ===
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });
  document.querySelectorAll('.reveal-on-scroll').forEach((el) => observer.observe(el));

  // === Menu mobile ===
  const menu = document.querySelector('[data-mobile-menu]');
  const openBtn = document.querySelector('[data-mobile-menu-open]');
  const closeEls = document.querySelectorAll('[data-mobile-menu-close]');
  if (menu && openBtn) {
    const open = () => {
      menu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      openBtn.setAttribute('aria-expanded', 'true');
    };
    const close = () => {
      menu.classList.add('hidden');
      document.body.style.overflow = '';
      openBtn.setAttribute('aria-expanded', 'false');
    };
    openBtn.addEventListener('click', open);
    closeEls.forEach((el) => el.addEventListener('click', close));
    menu.querySelectorAll('nav a').forEach((a) => a.addEventListener('click', close));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.classList.contains('hidden')) close();
    });
  }

  // === Formulaire de contact (AJAX) ===
  const form = document.querySelector('[data-contact-form]');
  if (form) {
    const btn = form.querySelector('[data-submit-btn]');
    const label = form.querySelector('[data-submit-label]');
    const feedback = form.querySelector('[data-form-feedback]');
    const initialLabel = label ? label.textContent : '';

    const showFeedback = (msg, ok) => {
      if (!feedback) return;
      feedback.textContent = msg;
      feedback.className = 'rounded-lg p-4 text-sm ' + (ok
        ? 'bg-green-50 text-green-800 border border-green-200'
        : 'bg-red-50 text-red-800 border border-red-200');
    };

    form.addEventListener('submit', async (e) => {
      if (form.action.includes('YOUR_FORM_ID')) {
        e.preventDefault();
        showFeedback("⚠️ Le formulaire n'est pas encore connecté à un service d'envoi. Configurez Formspree (ou équivalent) en remplaçant YOUR_FORM_ID dans le code.", false);
        return;
      }
      e.preventDefault();
      btn.disabled = true;
      if (label) label.textContent = 'Envoi en cours…';
      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        });
        if (res.ok) {
          form.reset();
          showFeedback("✓ Merci ! Votre demande a bien été envoyée. Nous vous recontactons sous 48h ouvrées.", true);
        } else {
          const json = await res.json().catch(() => ({}));
          showFeedback(json.error || "Une erreur est survenue. Merci de réessayer ou de nous appeler directement au 07 61 46 34 99.", false);
        }
      } catch (_err) {
        showFeedback("Réseau indisponible. Merci de réessayer ou de nous appeler au 07 61 46 34 99.", false);
      } finally {
        btn.disabled = false;
        if (label) label.textContent = initialLabel;
      }
    });
  }
});
