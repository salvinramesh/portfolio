// main.js — robust hero tilt + glare + card parallax (DOMContentLoaded + debug)
(function () {
  'use strict';

  // enable debug logs by setting window.DEBUG_PARALLAX = true in the console
  const dbg = () => !!window.DEBUG_PARALLAX;
  const log = (...a) => { if (dbg()) console.log('[PARALLAX]', ...a); };

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // small clamp helper
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ensure DOM ready
  const init = () => {
    log('DOMContentLoaded - initializing parallax', { prefersReduced });

    // HERO PARALLAX
    const hero = document.querySelector('.hero');
    if (hero && !prefersReduced) {
      log('found hero element — enabling hero parallax');

      const tiltRoot = hero.querySelector('.hero-tilt') || hero;
      const glare = hero.querySelector('.hero-glare') || null;
      let rect = hero.getBoundingClientRect();

      // normalized pointer -0.5 .. 0.5
      let px = 0, py = 0;
      let bgOffset = 0;
      let ticking = false;

      const applyUpdate = () => {
        ticking = false;
        // write px/py to hero so CSS handles depth transforms
        hero.style.setProperty('--px', px.toFixed(3));
        hero.style.setProperty('--py', py.toFixed(3));
        hero.style.setProperty('--tiltX', px.toFixed(3));
        hero.style.setProperty('--tiltY', (-py).toFixed(3));

        // glare: set both CSS vars and background-position (robust cross-browser)
        const gx = Math.round((px + 0.5) * rect.width);
        const gy = Math.round((py + 0.5) * rect.height);
        hero.style.setProperty('--gx', gx + 'px');
        hero.style.setProperty('--gy', gy + 'px');

        // also set explicit background position optionally used by CSS
        if (glare) {
          glare.style.setProperty('background-position', `${gx}px ${gy}px`);
        }

        hero.style.setProperty('--bg-offset', `${bgOffset}px`);
      };

      const pointerHandler = (e) => {
        const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
        const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;

        const cx = clamp(clientX, rect.left, rect.right) - rect.left;
        const cy = clamp(clientY, rect.top, rect.bottom) - rect.top;

        px = (cx / rect.width) - 0.5;
        py = (cy / rect.height) - 0.5;

        if (!ticking) {
          window.requestAnimationFrame(applyUpdate);
          ticking = true;
        }
      };

      const onEnter = () => { rect = hero.getBoundingClientRect(); };
      const onLeave = () => { px = 0; py = 0; if (!ticking) { window.requestAnimationFrame(applyUpdate); ticking = true; } };

      // listeners
      hero.addEventListener('mousemove', pointerHandler, { passive: true });
      hero.addEventListener('touchmove', pointerHandler, { passive: true });
      hero.addEventListener('mouseenter', onEnter, { passive: true });
      hero.addEventListener('touchstart', onEnter, { passive: true });
      hero.addEventListener('mouseleave', onLeave, { passive: true });
      hero.addEventListener('touchend', onLeave, { passive: true });
      window.addEventListener('resize', () => { rect = hero.getBoundingClientRect(); }, { passive: true });

      // scroll parallax for background
      const onScroll = () => {
        const r = hero.getBoundingClientRect();
        const center = clamp(r.top + (r.height * 0.5), 0, window.innerHeight);
        const ratio = (center / window.innerHeight) - 0.5; // -0.5..0.5
        bgOffset = ratio * -60;
        if (!ticking) { window.requestAnimationFrame(applyUpdate); ticking = true; }
      };
      onScroll();
      document.addEventListener('scroll', onScroll, { passive: true });

      // initial apply
      applyUpdate();
      log('hero parallax initialized');
    } else {
      log('hero not found or reduced motion enabled');
      // ensure variables are zeroed
      if (hero) {
        hero.style.setProperty('--px', '0');
        hero.style.setProperty('--py', '0');
        hero.style.setProperty('--tiltX', '0');
        hero.style.setProperty('--tiltY', '0');
      }
    }

    // CARD PARALLAX — icons and title nudge
    const cards = Array.from(document.querySelectorAll('.card'));
    if (cards.length && !prefersReduced) {
      log('init card parallax for', cards.length);
      cards.forEach(card => {
        let rect = card.getBoundingClientRect();
        let raf = null;

        const setVars = (px, py) => {
          card.style.setProperty('--px', px.toFixed(3));
          card.style.setProperty('--py', py.toFixed(3));
        };

        const onMove = (e) => {
          const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
          const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
          const px = clamp((clientX - rect.left) / rect.width - 0.5, -0.5, 0.5);
          const py = clamp((clientY - rect.top) / rect.height - 0.5, -0.5, 0.5);

          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => setVars(px, py));
        };

        const onEnter = () => { rect = card.getBoundingClientRect(); };
        const onLeave = () => { if (raf) cancelAnimationFrame(raf); setVars(0, 0); };

        card.addEventListener('mouseenter', onEnter, { passive: true });
        card.addEventListener('mousemove', onMove, { passive: true });
        card.addEventListener('mouseleave', onLeave, { passive: true });
        card.addEventListener('touchstart', onEnter, { passive: true });
        card.addEventListener('touchmove', onMove, { passive: true });
        card.addEventListener('touchend', onLeave, { passive: true });
        window.addEventListener('resize', () => { rect = card.getBoundingClientRect(); }, { passive: true });
      });
    } else {
      log('no cards or reduced motion');
      cards.forEach(c => { c.style.setProperty('--px', '0'); c.style.setProperty('--py', '0'); });
    }

    console.log('main.js loaded — parallax initialized (DEBUG=' + dbg() + ')');
  }; // init

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
