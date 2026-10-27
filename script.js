(function () {
  'use strict';

  var root = document.documentElement;

  /* ---------- Tema claro / escuro ---------- */
  var toggle = document.querySelector('.theme-toggle');
  var meta = document.querySelector('meta[name="theme-color"]');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', theme === 'dark' ? '#0B1020' : '#EDF1F7');
    try { localStorage.setItem('theme', theme); } catch (e) { /* armazenamento indisponível */ }
  }

  if (meta && root.getAttribute('data-theme') === 'dark') {
    meta.setAttribute('content', '#0B1020');
  }

  if (toggle) {
    toggle.addEventListener('click', function () {
      applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });
  }

  /* ---------- Linha do tempo: a linha acende conforme a rolagem ---------- */
  var timeline = document.getElementById('timeline');
  var stops = timeline ? Array.prototype.slice.call(timeline.querySelectorAll('.stop')) : [];
  var ticking = false;

  function updateTimeline() {
    ticking = false;
    if (!timeline) return;

    var mark = window.innerHeight * 0.55;
    var rect = timeline.getBoundingClientRect();
    var fill = Math.max(0, Math.min(rect.height, mark - rect.top));
    timeline.style.setProperty('--fill', fill + 'px');

    var currentIndex = -1;
    stops.forEach(function (stop, i) {
      var passed = stop.getBoundingClientRect().top + 20 < mark;
      stop.classList.toggle('passed', passed);
      if (passed) currentIndex = i;
    });
    stops.forEach(function (stop, i) {
      stop.classList.toggle('current', i === currentIndex);
    });
  }

  function requestUpdate() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(updateTimeline);
    }
  }

  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
  updateTimeline();

  /* ---------- Menu: destaca a seção visível ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.main-nav a'));
  var sections = navLinks
    .map(function (link) { return document.querySelector(link.getAttribute('href')); })
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          if (link.getAttribute('href') === '#' + entry.target.id) {
            link.setAttribute('aria-current', 'true');
          } else {
            link.removeAttribute('aria-current');
          }
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (section) { spy.observe(section); });
  }

  /* ---------- Copiar e-mail ---------- */
  var copyBtn = document.querySelector('.copy-btn');
  var status = document.getElementById('copy-status');

  function fallbackCopy(text) {
    var area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', '');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    document.body.removeChild(area);
    return ok;
  }

  function showCopied(ok) {
    if (!copyBtn) return;
    copyBtn.textContent = ok ? 'Copiado' : 'Não foi possível copiar';
    copyBtn.classList.toggle('copied', ok);
    if (status) status.textContent = ok ? 'E-mail copiado.' : 'Não foi possível copiar o e-mail.';
    setTimeout(function () {
      copyBtn.textContent = 'Copiar';
      copyBtn.classList.remove('copied');
    }, 2000);
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var text = copyBtn.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(
          function () { showCopied(true); },
          function () { showCopied(fallbackCopy(text)); }
        );
      } else {
        showCopied(fallbackCopy(text));
      }
    });
  }

  /* ---------- Ano no rodapé ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
