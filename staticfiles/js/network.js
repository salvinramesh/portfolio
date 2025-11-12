// network.js - interactive network flow for hero
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // config - tune density & visuals
  const CONFIG = {
    maxNodesDesktop: 36,
    maxNodesMobile: 18,
    connectDist: 160,        // distance (px) where we draw links
    nodeRadiusMin: 1.8,
    nodeRadiusMax: 3.6,
    linkBaseAlpha: 0.12,
    attractStrength: 0.02,   // how strongly nodes are pulled toward mouse
    repelStrength: 0.18,     // how strongly they are repelled if too close
    maxVelocity: 0.9,
    lineWidth: 1.0
  };

  const canvas = document.querySelector('.network-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  let width = 0, height = 0, DPR = Math.max(1, window.devicePixelRatio || 1);

  // Node structure
  class Node {
    constructor(x, y, vx=0, vy=0, r=2) {
      this.x = x; this.y = y;
      this.vx = vx; this.vy = vy;
      this.r = r;
    }
    step(dt) {
      this.x += this.vx * dt;
      this.y += this.vy * dt;
    }
  }

  let nodes = [];
  let mouse = { x: -9999, y: -9999, down: false, active: false };

  // Resize canvas
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

  // Initialize nodes (spread across hero)
  function initNodes() {
    nodes.length = 0;
    const isMobile = (Math.min(window.innerWidth, window.innerHeight) < 900);
    const count = isMobile ? CONFIG.maxNodesMobile : CONFIG.maxNodesDesktop;
    for (let i=0; i<count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const r = CONFIG.nodeRadiusMin + Math.random() * (CONFIG.nodeRadiusMax - CONFIG.nodeRadiusMin);
      const vx = (Math.random() - 0.5) * 0.18;
      const vy = (Math.random() - 0.5) * 0.18;
      nodes.push(new Node(x, y, vx, vy, r));
    }
  }

  // limit vector magnitude
  function clampVel(v, max) {
    const mag = Math.hypot(v.x, v.y);
    if (mag > max) {
      v.x = (v.x / mag) * max;
      v.y = (v.y / mag) * max;
    }
  }

  // animation loop
  let raf = null;
  let lastTime = performance.now();

  function step(now) {
    const dt = Math.min(32, now - lastTime) / 16.66; // normalized ~60fps scale
    lastTime = now;

    // clear
    ctx.clearRect(0, 0, width, height);

    // update each node
    for (let i=0;i<nodes.length;i++){
      const n = nodes[i];

      // a gentle wandering force
      n.vx += (Math.cos((now*0.0002) + i) * 0.0008) * dt;
      n.vy += (Math.sin((now*0.00019) - i) * 0.0008) * dt;

      // mouse interaction: attract or repel depending on distance
      if (mouse.active) {
        let dx = mouse.x - n.x;
        let dy = mouse.y - n.y;
        let d2 = dx*dx + dy*dy;
        if (d2 < 40000) { // only affect when near (200px)
          const d = Math.sqrt(d2) + 0.0001;
          // if mouse is down -> repel stronger, else attract gently
          if (mouse.down) {
            const force = -CONFIG.repelStrength * (1 - (d / 200)); // negative for repulsion
            n.vx += (dx / d) * force * dt;
            n.vy += (dy / d) * force * dt;
          } else {
            const force = CONFIG.attractStrength * (1 - (d / 320));
            n.vx += (dx / d) * force * dt;
            n.vy += (dy / d) * force * dt;
          }
        }
      }

      // boundary soft constraints (bounce)
      if (n.x < 0) { n.x = 0; n.vx *= -0.5; }
      if (n.x > width) { n.x = width; n.vx *= -0.5; }
      if (n.y < 0) { n.y = 0; n.vy *= -0.5; }
      if (n.y > height) { n.y = height; n.vy *= -0.5; }

      // clamp velocities
      clampVel(n, CONFIG.maxVelocity);

      // step position
      n.step(dt);
    }

    // draw connections & nodes
    draw();

    raf = requestAnimationFrame(step);
  }

  function draw() {
    // draw lines first
    ctx.lineWidth = CONFIG.lineWidth;
    for (let i=0; i<nodes.length; i++){
      const a = nodes[i];
      for (let j=i+1; j<nodes.length; j++){
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx*dx + dy*dy;
        if (d2 < CONFIG.connectDist * CONFIG.connectDist) {
          const dist = Math.sqrt(d2);
          let alpha = (1 - (dist / CONFIG.connectDist)) * CONFIG.linkBaseAlpha;
          // boost alpha near mouse
          if (mouse.active) {
            const mdx = (a.x + b.x)/2 - mouse.x;
            const mdy = (a.y + b.y)/2 - mouse.y;
            const md2 = mdx*mdx + mdy*mdy;
            if (md2 < (CONFIG.connectDist*CONFIG.connectDist)) {
              alpha *= 1.8 - Math.min(1.6, md2 / (CONFIG.connectDist*CONFIG.connectDist));
            }
          }
          ctx.strokeStyle = `rgba(160,200,255,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw nodes on top
    for (let i=0;i<nodes.length;i++){
      const n = nodes[i];
      const glow = Math.min(0.8, 0.3 + (Math.abs(Math.sin((performance.now()*0.001) + i)) * 0.5));
      const r = n.r;
      // soft halo
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, Math.max(12, r*6));
      g.addColorStop(0, `rgba(120,180,255,${0.06*glow})`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, Math.max(12, r*6), 0, Math.PI*2);
      ctx.fill();

      // core
      ctx.fillStyle = `rgba(220,240,255,${0.9 * (0.6 + 0.4*glow)})`;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI*2);
      ctx.fill();
    }
  }

  // pointer events
  function onPointerMove(e) {
    const p = (e.touches && e.touches[0]) ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    mouse.x = (p.clientX - rect.left);
    mouse.y = (p.clientY - rect.top);
    mouse.active = true;
  }
  function onPointerLeave() {
    mouse.active = false;
    mouse.x = -9999; mouse.y = -9999;
  }
  function onPointerDown() { mouse.down = true; }
  function onPointerUp() { mouse.down = false; }

  // start
  function start() {
    if (prefersReduced) {
      // Respect reduced motion: draw a single soft layer or disable animation
      canvas.style.opacity = 0.45;
      resize();
      initNodes();
      draw(); // single static render
      return;
    }
    resize();
    initNodes();
    lastTime = performance.now();
    raf = requestAnimationFrame(step);
  }

  // events
  window.addEventListener('resize', () => {
    resize();
    initNodes();
  }, { passive: true });

  // pointer events on canvas parent so hero-wide pointer works
  const parent = canvas.parentElement;
  parent.addEventListener('mousemove', onPointerMove, { passive: true });
  parent.addEventListener('mouseleave', onPointerLeave, { passive: true });
  parent.addEventListener('touchmove', onPointerMove, { passive: true });
  parent.addEventListener('touchend', onPointerLeave, { passive: true });

  parent.addEventListener('pointerdown', onPointerDown, { passive: true });
  parent.addEventListener('pointerup', onPointerUp, { passive: true });

  // initial call (wait a tick so hero layout has been applied)
  requestAnimationFrame(start);

  // expose for debugging (optional)
  window.__heroNetwork = { start, nodes };

})();
