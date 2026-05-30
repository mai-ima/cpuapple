/* =========================================================
   AXIOM Consumer — js/consumer.js
   Depends on js/main.js (provides animateCounter, revealObserver,
   benchObserver, counterObserver, cardTilt, themeToggle, mobileMenu)
   ========================================================= */

(function () {
  'use strict';

  /* ── 1. will-change dynamic management ───────────────────
     Set on IntersectionObserver entry; removed on transition/animationend.
     Never set statically in CSS.                            */
  function manageWillChange(selector, props) {
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.style.willChange = props;
        }
      });
    }, { rootMargin: '200px 0px' });

    document.querySelectorAll(selector).forEach(function (el) {
      obs.observe(el);
      el.addEventListener('transitionend', function () { el.style.willChange = 'auto'; }, { passive: true });
      el.addEventListener('animationend',  function () { el.style.willChange = 'auto'; }, { passive: true });
    });
  }

  manageWillChange('.story-scene', 'transform, opacity');
  manageWillChange('.product-card', 'transform');

  /* ── 2. Scroll story: JS passive fallback ─────────────────
     Only activates when CSS Scroll-driven Animations are unsupported. */
  if (!CSS.supports('animation-timeline', 'scroll()')) {
    var track = document.querySelector('.story-track');
    if (track) {
      var ENTER_FRAC = 0.15;
      var EXIT_FRAC  = 0.85;

      function onStoryScroll() {
        var rect    = track.getBoundingClientRect();
        var totalH  = track.offsetHeight - window.innerHeight;
        var scrolled = Math.max(0, -rect.top);
        var scenes  = track.querySelectorAll('.story-scene');
        var segH    = totalH / scenes.length;

        scenes.forEach(function (scene, i) {
          var segStart = i * segH;
          var progress = totalH > 0 ? (scrolled - segStart) / segH : 0;
          var clamped  = Math.max(0, Math.min(1, progress));
          var active   = clamped >= ENTER_FRAC && clamped <= EXIT_FRAC;
          scene.classList.toggle('scene-active', active);
        });
      }

      window.addEventListener('scroll', onStoryScroll, { passive: true });
      onStoryScroll();
    }
  }

  /* ── 3. prefers-reduced-motion guard for counters ────────
     main.js handles animateCounter; this guards page-specific counters
     that might be added outside .counter selector scope.    */
  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 4. Price selector ────────────────────────────────────
     aria-live="polite" on .price-display triggers screen reader announcements. */
  var priceTiers = {
    'x1-pro': {
      configs: ['Base', 'Pro Config', 'Max Config'],
      prices:  [1299,    1699,          1999],
      suffix:  '/ laptop'
    },
    'x1-max': {
      configs: ['Base', '32-core GPU', '40-core GPU'],
      prices:  [1999,    2399,          2799],
      suffix:  '/ workstation'
    }
  };

  var activeTier   = 'x1-pro';
  var activeConfig = 0;

  function updatePrice() {
    var tier    = priceTiers[activeTier];
    var display = document.querySelector('.price-display');
    var sub     = document.querySelector('.price-config-label');
    if (!tier || !display) return;
    display.textContent = '$' + tier.prices[activeConfig].toLocaleString('en-US');
    if (sub) sub.textContent = tier.configs[activeConfig] + ' — ' + tier.suffix;
  }

  document.querySelectorAll('[data-tier]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeTier   = btn.dataset.tier;
      activeConfig = 0;
      document.querySelectorAll('[data-tier]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      /* Reset config chips to first option */
      document.querySelectorAll('[data-config-index]').forEach(function (c, i) {
        c.classList.toggle('active', i === 0);
      });
      updatePrice();
    });
  });

  document.querySelectorAll('[data-config-index]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      activeConfig = parseInt(btn.dataset.configIndex, 10);
      document.querySelectorAll('[data-config-index]').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
      updatePrice();
    });
  });

  updatePrice();

})();
