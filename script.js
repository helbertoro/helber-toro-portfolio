(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Año del footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Tema claro / oscuro ---------- */
  var themeBtn = document.getElementById('theme-toggle');
  var metaTheme = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.dataset.theme = theme;
    if (metaTheme) metaTheme.setAttribute('content', theme === 'light' ? '#f6f4ee' : '#0d0f12');
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }
  applyTheme(root.dataset.theme || 'dark');

  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      applyTheme(root.dataset.theme === 'light' ? 'dark' : 'light');
    });
  }

  /* ---------- Menú móvil ---------- */
  var menuBtn = document.getElementById('menu-toggle');
  var links = document.getElementById('nav-links');

  function setMenu(open) {
    links.classList.toggle('is-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
  }
  if (menuBtn && links) {
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    links.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
  }

  /* ---------- Header + barra de progreso ---------- */
  var header = document.querySelector('.site-header');
  var progress = document.getElementById('progress');
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    var max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('is-scrolled', y > 8);
    if (progress) progress.style.transform = 'scaleX(' + (max > 0 ? Math.min(y / max, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- Enlace activo en la navegación ---------- */
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll('.nav__links a'));
  var sections = navAnchors
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navAnchors.forEach(function (a) {
          a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(function (s) { spy.observe(s); });
  }

  /* ---------- Revelado al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');

  // Escalonado suave entre hermanos que aparecen juntos.
  document.querySelectorAll('.cards, .skills, .certs, .edu__list, .hero__copy, .stats').forEach(function (group) {
    group.querySelectorAll(':scope > .reveal').forEach(function (el, i) {
      el.style.setProperty('--delay', Math.min(i, 8) * 70 + 'ms');
    });
  });

  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Contadores ---------- */
  function yearsSince(ym) {
    var p = ym.split('-');
    var now = new Date();
    var months = (now.getFullYear() - Number(p[0])) * 12 + (now.getMonth() + 1 - Number(p[1]));
    return Math.max(0, Math.floor(months / 12));
  }

  function animateNumber(el, target, suffix) {
    suffix = suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var duration = 1200;
    var start = performance.now();
    (function tick(now) {
      var t = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  }

  var counters = document.querySelectorAll('[data-count], [data-since]');
  counters.forEach(function (el) {
    var target = el.dataset.since ? yearsSince(el.dataset.since) : Number(el.dataset.count);
    var suffix = el.dataset.suffix || '';
    el.textContent = target + suffix;           // valor final como base (sin JS/IO queda correcto)
    if (!('IntersectionObserver' in window) || reduceMotion) return;
    el.textContent = '0' + suffix;
    var co = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        animateNumber(el, target, suffix);
        co.disconnect();
      }
    }, { threshold: 0.6 });
    co.observe(el);
  });
})();
