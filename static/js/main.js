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
    // HACKER SCRAMBLE EFFECT
    class TextScramble {
      constructor(el) {
        this.el = el;
        this.chars = '!<>-_\\/[]{}—=+*^?#________';
        this.update = this.update.bind(this);
      }
      setText(newText) {
        const oldText = this.el.innerText;
        const length = Math.max(oldText.length, newText.length);
        const promise = new Promise((resolve) => this.resolve = resolve);
        this.queue = [];
        for (let i = 0; i < length; i++) {
          const from = oldText[i] || '';
          const to = newText[i] || '';
          const start = Math.floor(Math.random() * 40);
          const end = start + Math.floor(Math.random() * 40);
          this.queue.push({ from, to, start, end });
        }
        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
        return promise;
      }
      update() {
        let output = '';
        let complete = 0;
        for (let i = 0, n = this.queue.length; i < n; i++) {
          let { from, to, start, end, char } = this.queue[i];
          if (this.frame >= end) {
            complete++;
            output += to;
          } else if (this.frame >= start) {
            if (!char || Math.random() < 0.28) {
              char = this.randomChar();
              this.queue[i].char = char;
            }
            output += `<span class="dud">${char}</span>`;
          } else {
            output += from;
          }
        }
        this.el.innerHTML = output;
        if (complete === this.queue.length) {
          this.resolve();
        } else {
          this.frameRequest = requestAnimationFrame(this.update);
          this.frame++;
        }
      }
      randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
      }
    }

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

        const setVars = (px, py, x, y) => {
          card.style.setProperty('--px', px.toFixed(3));
          card.style.setProperty('--py', py.toFixed(3));
          card.style.setProperty('--mouse-x', `${x}px`);
          card.style.setProperty('--mouse-y', `${y}px`);
        };

        const onMove = (e) => {
          const clientX = (e.touches && e.touches[0]) ? e.touches[0].clientX : e.clientX;
          const clientY = (e.touches && e.touches[0]) ? e.touches[0].clientY : e.clientY;
          const x = clientX - rect.left;
          const y = clientY - rect.top;
          const px = clamp(x / rect.width - 0.5, -0.5, 0.5);
          const py = clamp(y / rect.height - 0.5, -0.5, 0.5);

          if (raf) cancelAnimationFrame(raf);
          raf = requestAnimationFrame(() => setVars(px, py, x, y));
        };

        const title = card.querySelector('h3');
        let fx = null;
        let originalTitle = '';
        if (title) {
          originalTitle = title.innerText;
          fx = new TextScramble(title);
        }

        const onEnter = () => {
          rect = card.getBoundingClientRect();
          if (fx) {
            fx.setText(originalTitle);
            title.style.color = 'var(--accent)';
            title.style.textShadow = '0 0 8px var(--accent)';
          }
        };
        const onLeave = () => {
          if (raf) cancelAnimationFrame(raf);
          setVars(0, 0, -1000, -1000);
          if (title) {
            title.style.color = '';
            title.style.textShadow = '';
          }
        };

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



    // Apply to About section headers or specific text
    // For the main body text, scrambling the whole block is too much.
    // Let's scramble the "About Me" title instead, and maybe the list items on hover.

    const aboutTitle = document.querySelector('#about-title');
    if (aboutTitle) {
      const fx = new TextScramble(aboutTitle);
      let counter = 0;
      const phrases = [aboutTitle.innerText, 'System.Root.User', 'Access Granted', aboutTitle.innerText];

      const next = () => {
        fx.setText(phrases[counter]).then(() => {
          setTimeout(next, 2000);
        });
        counter = (counter + 1) % phrases.length;
      };
      // Start the loop on hover
      aboutTitle.addEventListener('mouseenter', () => {
        fx.setText('Decrypting...').then(() => {
          fx.setText(aboutTitle.getAttribute('data-original') || aboutTitle.innerText);
        });
      });
      // Save original
      aboutTitle.setAttribute('data-original', aboutTitle.innerText);
    }

    // For the body text, let's do a "Matrix Decode" style on the list items
    const aboutBody = document.querySelector('.about-content');
    if (aboutBody) {
      // The linebreaks filter creates <p> tags.
      const paragraphs = aboutBody.querySelectorAll('p');
      if (paragraphs.length === 0) {
        // Fallback if no p tags (e.g. raw text)
        const html = aboutBody.innerHTML;
        const lines = html.split(/<br\s*\/?>/i);
        if (lines.length > 1) {
          aboutBody.innerHTML = lines.map(line => `<span class="scramble-line">${line}</span>`).join('<br>');
        }
      } else {
        paragraphs.forEach(p => {
          const html = p.innerHTML;
          // Split by <br> (case-insensitive, optional slash)
          const parts = html.split(/<br\s*\/?>/i);
          if (parts.length > 1) {
            p.innerHTML = parts.map(line => {
              const trimmed = line.trim();
              return trimmed ? `<span class="scramble-line">${trimmed}</span>` : '';
            }).join('<br>');
          } else {
            // Single line paragraph
            p.innerHTML = `<span class="scramble-line">${html}</span>`;
          }
        });
      }

      // Re-select now that we've injected spans
      const lines = document.querySelectorAll('.scramble-line');
      lines.forEach(line => {
        const originalText = line.innerText;
        // Only scramble if text is substantial
        if (originalText.length < 2) return;

        const fx = new TextScramble(line);

        line.addEventListener('mouseenter', () => {
          fx.setText(originalText);
          line.style.color = 'var(--accent)';
          line.style.textShadow = '0 0 8px var(--accent)';
        });
        line.addEventListener('mouseleave', () => {
          line.style.color = '';
          line.style.textShadow = '';
        });
      });
    }

    // Modal dismissal logic
    const allMessages = document.querySelectorAll('.messages');
    allMessages.forEach(messagesContainer => {
      // Close on click anywhere
      messagesContainer.addEventListener('click', () => {
        messagesContainer.style.opacity = '0';
        setTimeout(() => messagesContainer.remove(), 300);
      });

      // Auto-dismiss after 6s
      setTimeout(() => {
        if (document.body.contains(messagesContainer)) {
          messagesContainer.style.opacity = '0';
          setTimeout(() => messagesContainer.remove(), 300);
        }
      }, 6000);
    });

    // Disintegration / Thanos Snap Effect
    class DisintegrationEffect {
      constructor(triggerSelector, targetSelector) {
        this.trigger = document.querySelector(triggerSelector);
        this.target = document.querySelector(targetSelector);
        this.isSnapping = false;

        if (this.trigger && this.target) {
          console.log('DisintegrationEffect initialized on', this.trigger);
          this.trigger.style.cursor = 'pointer';
          this.trigger.style.position = 'relative'; // Ensure z-index works
          this.trigger.style.zIndex = '1000'; // Force on top
          this.trigger.addEventListener('click', (e) => {
            console.log('Hero title clicked!');
            this.snap();
          });
        } else {
          console.warn('DisintegrationEffect: Trigger or Target not found', triggerSelector, targetSelector);
        }
      }

      snap() {
        if (this.isSnapping) return;
        this.isSnapping = true;

        // Create particles
        const rect = this.target.getBoundingClientRect();
        const particleCount = 150; // Number of dust motes

        for (let i = 0; i < particleCount; i++) {
          const p = document.createElement('div');
          p.classList.add('dust-particle');

          // Random position within the element
          const x = Math.random() * rect.width;
          const y = Math.random() * rect.height;

          p.style.left = (rect.left + x) + 'px';
          p.style.top = (rect.top + y + window.scrollY) + 'px';

          // Random color variant
          p.style.background = Math.random() > 0.5 ? 'var(--accent)' : '#fff';
          p.style.width = Math.random() * 4 + 2 + 'px';
          p.style.height = p.style.width;

          document.body.appendChild(p);

          // Animate
          requestAnimationFrame(() => {
            const angle = Math.random() * Math.PI * 2;
            const velocity = Math.random() * 100 + 50;
            const tx = Math.cos(angle) * velocity;
            const ty = Math.sin(angle) * velocity - 50; // Drift up
            const rot = Math.random() * 360;

            p.style.transform = `translate(${tx}px, ${ty}px) rotate(${rot}deg)`;
            p.style.opacity = '0';
          });

          // Cleanup
          setTimeout(() => p.remove(), 1000);
        }

        // Fade out target
        this.target.style.transition = 'opacity 1s ease, filter 1s ease';
        this.target.style.opacity = '0';
        this.target.style.filter = 'blur(10px)';

        // Restore after delay
        setTimeout(() => {
          this.target.style.opacity = '1';
          this.target.style.filter = 'none';
          this.isSnapping = false;
        }, 4000);
      }
    }

    // Initialize Snap on Hero Image
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
      // Target the image inside
      const heroImg = heroVisual.querySelector('img');
      if (heroImg) {
        new DisintegrationEffect('.hero-visual', '.hero-visual img');
      }
    }

    console.log('main.js loaded — parallax & scramble initialized');
  }; // init

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
