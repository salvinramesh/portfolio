// network.js - brighter, more reactive network flow for hero
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // config - tune density & visuals
  const CONFIG = {
    maxNodesDesktop: 42,
    maxNodesMobile: 18,
    connectDist: 180,        // distance (px) where we draw links
    nodeRadiusMin: 1.8,
    nodeRadiusMax: 4.2,
    linkBaseAlpha: 0.16,
    hoverAlphaBoost: 2.6,
    attractStrength: 0.045,   // stronger attract so hover pulls nodes visibly
    repelStrength: 0.28,     // stronger repel on pointer down
    maxVelocity: 1.6,
    lineWidth: 1.2,
    haloSize: 18             // base halo radius multiplier
  };

  const canvas = document.querySelector('.network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0, DPR = Math.max(1, window.devicePixelRatio || 1);

  class Node {
    constructor(x, y, vx = 0, vy = 0, r = 2) {
      this.x = x; this.y = y;
      this.vx = vx; this.vy = vy;
      this.r = r;
      this.baseR = r;
      this.pulse = Math.random() * Math.PI * 2;
    }
    step(dt) {
      // simple damping
      this.vx *= 0.995;
      this.vy *= 0.995;
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      // small internal pulse for breathing
      this.pulse += 0.018 * dt;
      this.r = this.baseR * (1 + 0.06 * Math.sin(this.pulse));
    }
  }

  let nodes = [];
  let mouse = { x: -9999, y: -9999, down: false, active: false };

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(100, Math.floor(rect.width));
    height = Math.max(60, Math.floor(rect.height));
    DPR = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function initNodes() {
    nodes.length = 0;
    const isMobile = (Math.min(window.innerWidth, window.innerHeight) < 900);
    const count = isMobile ? CONFIG.maxNodesMobile : CONFIG.maxNodesDesktop;
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = CONFIG.nodeRadiusMin + Math.random() * (CONFIG.nodeRadiusMax - CONFIG.nodeRadiusMin);
      const vx = (Math.random() - 0.5) * 0.3;
      const vy = (Math.random() - 0.5) * 0.3;
      nodes.push(new Node(x, y, vx, vy, r));
    }
  }

  function clampVel(vx, vy, max) {
    const mag = Math.hypot(vx, vy);
    if (mag > max) {
      const s = max / mag;
      return { vx: vx * s, vy: vy * s };
    }
    return { vx, vy };
  }

  let raf = null;
  let lastTime = performance.now();

  function step(now) {
    const rawDt = Math.min(48, now - lastTime);
    const dtNorm = rawDt / (1000 / 60) * 1.0; // normalized dt
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    // Update nodes physics
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // wandering noise
      n.vx += (Math.cos((now * 0.00028) + i) * 0.0014) * dtNorm;
      n.vy += (Math.sin((now * 0.00026) - i) * 0.0014) * dtNorm;

      // pointer interaction
      if (mouse.active) {
        const dx = mouse.x - n.x, dy = mouse.y - n.y;
        const d2 = dx * dx + dy * dy;
        const maxAffect = Math.max(1, CONFIG.connectDist);
        if (d2 < maxAffect * maxAffect) {
          const d = Math.sqrt(d2) + 0.0001;
          if (mouse.down) {
            // repel stronger when pointer is down
            const f = -CONFIG.repelStrength * (1 - (d / maxAffect));
            n.vx += (dx / d) * f * dtNorm;
            n.vy += (dy / d) * f * dtNorm;
          } else {
            // gentle attraction while hovering
            const f = CONFIG.attractStrength * (1 - (d / (maxAffect * 1.2)));
            n.vx += (dx / d) * f * dtNorm;
            n.vy += (dy / d) * f * dtNorm;
          }
          // grow node when near pointer
          const grow = 1 + (1 - (Math.min(d, maxAffect) / maxAffect)) * 1.6;
          n.baseR = clamp(n.baseR * 0.98 + n.baseR * 0.02 * grow, CONFIG.nodeRadiusMin, CONFIG.nodeRadiusMax * 2.4);
        } else {
          // relax base size slowly toward original
          n.baseR += (n.r - n.baseR) * -0.02;
        }
      } else {
        // relax base radius slowly toward original
        n.baseR += (n.baseR - n.baseR) * 0; // no-op but left for clarity
      }

      // boundary soft bounce
      if (n.x < 0) { n.x = 0; n.vx *= -0.45; }
      if (n.x > width) { n.x = width; n.vx *= -0.45; }
      if (n.y < 0) { n.y = 0; n.vy *= -0.45; }
      if (n.y > height) { n.y = height; n.vy *= -0.45; }

      // clamp velocity
      const cl = clampVel(n.vx, n.vy, CONFIG.maxVelocity);
      n.vx = cl.vx; n.vy = cl.vy;

      n.step(dtNorm);
    }

    // DRAW LINKS: we draw brighter lines near the mouse
    ctx.lineWidth = CONFIG.lineWidth;
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 < CONFIG.connectDist * CONFIG.connectDist) {
          const dist = Math.sqrt(d2);
          let alpha = (1 - (dist / CONFIG.connectDist)) * CONFIG.linkBaseAlpha;

          // hover amplification
          if (mouse.active) {
            const mx = (a.x + b.x) * 0.5 - mouse.x;
            const my = (a.y + b.y) * 0.5 - mouse.y;
            const md2 = mx * mx + my * my;
            if (md2 < (CONFIG.connectDist * CONFIG.connectDist)) {
              const factor = 1 + (1 - (Math.sqrt(md2) / CONFIG.connectDist)) * (CONFIG.hoverAlphaBoost - 1);
              alpha *= factor;
            }
          }

          // color gradient slight cyan-magenta mix
          ctx.strokeStyle = `rgba(140,200,255,${Math.min(0.95, alpha)})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // DRAW NODES: halo + core
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];

      // stronger halo near mouse
      let haloScale = 1.0;
      if (mouse.active) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y;
        const md2 = dx * dx + dy * dy;
        if (md2 < CONFIG.connectDist * CONFIG.connectDist) {
          haloScale += (1 - (Math.sqrt(md2) / CONFIG.connectDist)) * 1.4;
        }
      }

      const haloR = Math.max(8, n.r * CONFIG.haloSize) * haloScale;

      // radial halo gradient
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
      g.addColorStop(0, `rgba(150,210,255,${0.18 * haloScale})`);
      g.addColorStop(0.25, `rgba(150,210,255,${0.06 * haloScale})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
      ctx.fill();

      // core
      const coreAlpha = 0.85;
      ctx.fillStyle = `rgba(235,245,255,${coreAlpha})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, Math.max(1.2, n.r), 0, Math.PI * 2);
      ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  function onPointerMove(e) {
    const p = (e.touches && e.touches[0]) ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    mouse.x = Math.max(0, Math.min(rect.width, p.clientX - rect.left));
    mouse.y = Math.max(0, Math.min(rect.height, p.clientY - rect.top));
    mouse.active = true;
  }
  function onPointerLeave() {
    mouse.active = false;
    mouse.x = -9999; mouse.y = -9999;
  }
  function onPointerDown() { mouse.down = true; }
  function onPointerUp() { mouse.down = false; }

  function start() {
    if (prefersReduced) {
      canvas.style.opacity = 0.45;
      resize();
      initNodes();
      drawStatic();
      return;
    }
    resize();
    initNodes();
    lastTime = performance.now();
    raf = requestAnimationFrame(step);
  }

  // single static draw for reduced motion
  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    // simple faint grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = 'rgba(200,220,255,0.04)';
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      ctx.fillStyle = 'rgba(220,230,245,0.6)';
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  window.addEventListener('resize', () => {
    resize();
    initNodes();
  }, { passive: true });

  const parent = canvas.parentElement;
  parent.addEventListener('mousemove', onPointerMove, { passive: true });
  parent.addEventListener('mouseleave', onPointerLeave, { passive: true });
  parent.addEventListener('touchmove', onPointerMove, { passive: true });
  parent.addEventListener('touchend', onPointerLeave, { passive: true });

  parent.addEventListener('pointerdown', onPointerDown, { passive: true });
  parent.addEventListener('pointerup', onPointerUp, { passive: true });

  requestAnimationFrame(start);

  // debug hook for tweaking in console
  window.__heroNetwork = { start, nodes, CONFIG };

})();
