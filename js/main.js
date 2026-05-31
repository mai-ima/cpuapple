/* =========================================================
   AXIOM — Main JavaScript
   ========================================================= */

// ── Scroll Progress Bar ──────────────────────────────────
const scrollBar = document.querySelector('.scroll-progress');
function updateScrollProgress() {
  const scrolled = window.scrollY;
  const total = document.documentElement.scrollHeight - window.innerHeight;
  const pct = total > 0 ? (scrolled / total) * 100 : 0;
  if (scrollBar) scrollBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });

// ── Nav Scroll State ─────────────────────────────────────
const nav = document.querySelector('.nav');
function updateNav() {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();

// ── Reveal on Scroll ─────────────────────────────────────
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal, .reveal-scale').forEach(el => {
  revealObserver.observe(el);
});

// ── Performance Bars ─────────────────────────────────────
const perfBarObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.perf-bar-fill').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.perf-bars').forEach(el => perfBarObserver.observe(el));

// ── Benchmark Bars ───────────────────────────────────────
const benchObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.bench-bar-fill-elem').forEach((bar, i) => {
        setTimeout(() => {
          bar.style.width = bar.dataset.width + '%';
        }, i * 80);
      });
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.benchmark-chart').forEach(el => benchObserver.observe(el));

// ── Animated Counter ─────────────────────────────────────
function animateCounter(el, target, suffix = '', decimals = 0) {
  const start = 0;
  const duration = 2000;
  const startTime = performance.now();
  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = start + (target - start) * eased;
    el.textContent = current.toFixed(decimals) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseFloat(el.dataset.target);
      const suffix = el.dataset.suffix || '';
      const decimals = parseInt(el.dataset.decimals || '0');
      animateCounter(el, target, suffix, decimals);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// ── Theme Toggle ──────────────────────────────────────────
const html = document.documentElement;
const themeBtn = document.getElementById('themeToggle');

// システム設定を優先、次にlocalStorage
function getInitialTheme() {
  const saved = localStorage.getItem('axiom-theme');
  if (saved) return saved;
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

let theme = getInitialTheme();
html.setAttribute('data-theme', theme);
updateThemeIcon();

function updateThemeIcon() {
  /* アイコンは CSS ::before で描画。aria-label がアクセシブルな名前を提供。 */
  if (themeBtn) {
    themeBtn.textContent = '';
    themeBtn.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切替' : 'ダークモードに切替');
  }
}
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    theme = theme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    localStorage.setItem('axiom-theme', theme);
    updateThemeIcon();
  });
}

// システム設定変更を追従（ユーザーが手動変更していない場合のみ）
window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', e => {
  if (!localStorage.getItem('axiom-theme')) {
    theme = e.matches ? 'light' : 'dark';
    html.setAttribute('data-theme', theme);
    updateThemeIcon();
  }
});

// ── Specs Tabs ────────────────────────────────────────────
document.querySelectorAll('.specs-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const panel = tab.dataset.panel;
    document.querySelectorAll('.specs-tab').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    document.querySelectorAll('.specs-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');
    document.getElementById(panel)?.classList.add('active');
  });
});

// ── Cursor Glow ───────────────────────────────────────────
const cursorGlow = document.querySelector('.cursor-glow');
if (cursorGlow && window.innerWidth > 768) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  document.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; });
  function animateCursor() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    cursorGlow.style.left = cx + 'px';
    cursorGlow.style.top = cy + 'px';
    requestAnimationFrame(animateCursor);
  }
  animateCursor();
}

// ── Floating Particles ────────────────────────────────────
function createParticles() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 4 + 1;
    const colors = ['rgba(110,64,201,0.6)', 'rgba(6,182,212,0.5)', 'rgba(168,85,247,0.5)', 'rgba(245,158,11,0.4)'];
    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 10 + 8}s;
      animation-delay: ${Math.random() * 10}s;
    `;
    hero.appendChild(p);
  }
}
createParticles();

// ── Neural Network Canvas ─────────────────────────────────
function initNeuralCanvas() {
  const canvas = document.getElementById('neuralCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    const parent = canvas.parentElement;
    const w = parent.offsetWidth || 400;
    const h = parent.offsetHeight || w;
    canvas.width = w;
    canvas.height = h;
  }
  resize();
  window.addEventListener('resize', resize);

  const W = () => canvas.width;
  const H = () => canvas.height;
  const layers = [3, 5, 5, 4, 3];
  const nodes = [];

  layers.forEach((count, li) => {
    const xFrac = (li + 1) / (layers.length + 1);
    for (let ni = 0; ni < count; ni++) {
      const yFrac = (ni + 1) / (count + 1);
      nodes.push({ xFrac, yFrac, layer: li, active: 0 });
    }
  });

  let t = 0;
  function draw() {
    const cw = W(), ch = H();
    ctx.clearRect(0, 0, cw, ch);
    t += 0.02;

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j].layer === nodes[i].layer + 1) {
          const alpha = 0.06 + 0.04 * Math.sin(t + i * 0.3 + j * 0.2);
          const nx = nodes[i].xFrac * cw, ny = nodes[i].yFrac * ch;
          const mx = nodes[j].xFrac * cw, my = nodes[j].yFrac * ch;
          ctx.beginPath();
          ctx.moveTo(nx, ny);
          ctx.lineTo(mx, my);
          ctx.strokeStyle = `rgba(110,64,201,${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach((n, i) => {
      const nx = n.xFrac * cw, ny = n.yFrac * ch;
      const pulse = 0.5 + 0.5 * Math.sin(t * 1.5 + i * 0.8);
      const r = 4 + pulse * 2;
      const alpha = 0.4 + pulse * 0.6;

      ctx.beginPath();
      ctx.arc(nx, ny, r, 0, Math.PI * 2);
      const grd = ctx.createRadialGradient(nx, ny, 0, nx, ny, r * 2);
      grd.addColorStop(0, `rgba(168,85,247,${alpha})`);
      grd.addColorStop(1, `rgba(110,64,201,0)`);
      ctx.fillStyle = grd;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(nx, ny, r * 0.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha * 0.8})`;
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }
  draw();
}
initNeuralCanvas();

// ── Arch Block Hover Effects ──────────────────────────────
document.querySelectorAll('.arch-block').forEach(block => {
  block.addEventListener('mouseenter', () => {
    block.style.filter = 'brightness(1.3)';
  });
  block.addEventListener('mouseleave', () => {
    block.style.filter = '';
  });
});

// ── Smooth product card hover tilt ───────────────────────
document.querySelectorAll('.product-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    card.style.transform = `translateY(-8px) scale(1.01) perspective(600px) rotateY(${dx * 3}deg) rotateX(${-dy * 2}deg)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── Mobile Menu ───────────────────────────────────────────
const mobileToggle = document.querySelector('.nav-mobile-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileClose = document.querySelector('.mobile-menu-close');

mobileToggle?.addEventListener('click', () => mobileMenu?.classList.add('open'));
mobileClose?.addEventListener('click', () => mobileMenu?.classList.remove('open'));
mobileMenu?.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

// ── Bottom Nav Active State ───────────────────────────────
(function initBottomNav() {
  const bottomNav = document.querySelector('.bottom-nav');
  if (!bottomNav) return;
  const items = bottomNav.querySelectorAll('.bottom-nav-item[data-section]');
  if (!items.length) return;

  const sections = Array.from(items).map(item => {
    const id = item.dataset.section;
    return { item, el: document.getElementById(id) };
  }).filter(s => s.el);

  function updateActive() {
    const scrollY = window.scrollY + window.innerHeight / 3;
    let current = sections[0];
    sections.forEach(s => {
      if (s.el.offsetTop <= scrollY) current = s;
    });
    items.forEach(item => item.classList.remove('active'));
    if (current) current.item.classList.add('active');
  }

  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();
})();
