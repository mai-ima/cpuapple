/* =========================================================
   AXIOM Enterprise — js/enterprise.js
   Depends on js/main.js loaded first.
   ========================================================= */

(function () {
  'use strict';

  /* ── 1. will-change dynamic management ─────────────────── */
  function manageWillChange(selector, props) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) e.target.style.willChange = props;
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll(selector).forEach(function (el) {
      obs.observe(el);
      el.addEventListener('transitionend', function () { el.style.willChange = 'auto'; }, { passive: true });
      el.addEventListener('animationend',  function () { el.style.willChange = 'auto'; }, { passive: true });
    });
  }

  manageWillChange('.product-card, .arch-block', 'transform');
  manageWillChange('.case-card', 'transform');

  /* ── 2. ROI Calculator ────────────────────────────────────
     Constants (PLACEHOLDER — confirm with product team):
       COMPETITOR_TDP: 350W (typical high-end server GPU baseline)
       AXIOM_TDP:       60W (PLACEHOLDER — X1 Ultra workstation)
       KWH_RATE_YEN:   ¥31/kWh (Japanese commercial rate, 2026 avg) */
  var COMPETITOR_TDP = 350;  /* PLACEHOLDER */
  var AXIOM_TDP      = 60;   /* PLACEHOLDER */
  var KWH_RATE_YEN   = 31;   /* ¥/kWh */

  var resultEl = document.getElementById('roi-result');

  function calcROI() {
    var units = Math.max(1, parseInt(document.getElementById('roi-units')?.value, 10) || 1);
    var hours = Math.max(0.5, parseFloat(document.getElementById('roi-hours')?.value) || 8);
    var days  = Math.max(1, Math.min(365, parseInt(document.getElementById('roi-days')?.value, 10) || 250));

    var savedKWh = (COMPETITOR_TDP - AXIOM_TDP) / 1000 * hours * days * units;
    var savedYen = Math.round(savedKWh * KWH_RATE_YEN);

    if (resultEl) {
      /* Updating textContent triggers aria-live="polite" aria-atomic="true" announcement */
      resultEl.textContent = '¥' + savedYen.toLocaleString('ja-JP');
    }
  }

  /* Debounce input events (300ms) to avoid aria-live announcement flood on each keystroke.
     Fire immediately on 'change' (blur or Enter key). */
  var roiDebounce;
  document.querySelectorAll('.roi-field input').forEach(function (el) {
    el.addEventListener('input', function () {
      clearTimeout(roiDebounce);
      roiDebounce = setTimeout(calcROI, 300);
    });
    el.addEventListener('change', calcROI);
  });

  calcROI(); /* Initialize with default values */

  /* ── 3. prefers-reduced-motion guard ────────────────────── */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* main.js handles animateCounter; this flag is available for any page-specific
     counter additions that need to skip animation. */

})();
