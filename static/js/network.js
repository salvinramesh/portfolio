// static/js/network.js
// Network flow with connecting lines sampled from the hero background,
// robust fallback behavior, guaranteed-visible lines, and debug hooks.

(function () {
  'use strict';

  // ---------------- CONFIG ----------------
  const CONFIG = {
    forceAnimate: false,        // set true to ignore prefers-reduced-motion
    desktopNodes: 130,          // increased count
    mobileNodes: 40,            // increased count
    connectDist: 160,           // threshold in px to draw a line (raised to help visibility)
    nodeRadiusMin: 2.5,         // larger nodes
    nodeRadiusMax: 7.0,         // larger nodes
    maxVelocity: 1.2,
    hoverRepel: 0.36,
    hoverRadius: 120,
    fps: 60,
    sampleDownscale: 0.18,      // offscreen sampling scale (0.1..0.4)
    fallbackLineBase: [220, 230, 245], // light fallback RGB
    fallbackLineAlphaBase: 0.45, // INCREASED base alpha
    fallbackNodeCore: 'rgba(20,20,20,0.98)',
    fallbackNodeHalo: 'rgba(50,50,50,0.08)',
    minLineAlpha: 0.15,         // INCREASED minimum alpha
    sampledAlphaFloor: 0.05     // treat sampled alpha below this as absent
  };
  // ----------------------------------------

  const LOG = (...args) => console.log('[hero-network]', ...args);

  const canvas = document.getElementById('network-canvas');
  if (!canvas) { LOG('canvas #network-canvas not found. aborting.'); return; }
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) { LOG('2D context not available. aborting.'); return; }

  // make lines more visible against dark backgrounds
  try { canvas.style.mixBlendMode = 'screen'; } catch (e) { /* ignore */ }

  // reduced-motion
  let prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let reducedMode = prefersReduced && !CONFIG.forceAnimate;

  let width = 0, height = 0, DPR = Math.max(1, window.devicePixelRatio || 1);
  let nodes = [], raf = null, lastTs = 0;
  const pointer = { x: -9999, y: -9999, active: false, down: false };

  // sampling
  let sampleCanvas = null, sampleCtx = null, sampleData = null;
  let sampleW = 0, sampleH = 0, samplingAvailable = false;

  // helpers
  const rand = (a, b) => Math.random() * (b - a) + a;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const now = () => (performance && performance.now && performance.now()) || Date.now();

  function nodeCountForViewport() {
    return Math.min(window.innerWidth, window.innerHeight) < 900 ? CONFIG.mobileNodes : CONFIG.desktopNodes;
  }

  // ---------- IMAGE SAMPLING ----------
  function extractBackgroundImageUrl(el) {
    if (!el) return null;
    const style = window.getComputedStyle(el);
    const bg = style.getPropertyValue('background-image') || '';
    const m = bg.match(/url\((['"]?)(.*?)\1\)/);
    return m ? m[2] : null;
  }

  function prepareImageSampling(bgUrl) {
    return new Promise((resolve) => {
      samplingAvailable = false;
      sampleData = null;
      if (!bgUrl) { LOG('No background image URL found for sampling.'); resolve(false); return; }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          sampleW = Math.max(2, Math.round(width * CONFIG.sampleDownscale));
          sampleH = Math.max(2, Math.round(height * CONFIG.sampleDownscale));
          sampleCanvas = document.createElement('canvas');
          sampleCanvas.width = sampleW;
          sampleCanvas.height = sampleH;
          sampleCtx = sampleCanvas.getContext('2d', { willReadFrequently: true });

          // draw scaled to sample canvas (approximate sampling for cover)
          sampleCtx.drawImage(img, 0, 0, sampleW, sampleH);
          sampleData = sampleCtx.getImageData(0, 0, sampleW, sampleH).data;
          samplingAvailable = true;
          LOG('Image sampling ready (size:', sampleW + 'x' + sampleH + ')');
          resolve(true);
        } catch (err) {
          LOG('Image sampling failed (likely CORS or read error):', err && err.message ? err.message : err);
          samplingAvailable = false;
          sampleData = null;
          resolve(false);
        }
      };
      img.onerror = () => { LOG('Background image load error for sampling url:', bgUrl); samplingAvailable = false; resolve(false); };
      img.src = bgUrl;
      if (img.complete && img.naturalWidth) img.onload();
    });
  }

  // returns {r,g,b,a} or null
  function sampleColorObjectAt(x, y) {
    if (!samplingAvailable || !sampleData) return null;
    const sx = Math.round(clamp(x / Math.max(1, width), 0, 1) * (sampleW - 1));
    const sy = Math.round(clamp(y / Math.max(1, height), 0, 1) * (sampleH - 1));
    const idx = (sy * sampleW + sx) * 4;
    const r = sampleData[idx], g = sampleData[idx + 1], b = sampleData[idx + 2], a = sampleData[idx + 3];
    const alpha = a / 255;
    if (alpha < CONFIG.sampledAlphaFloor) return null;
    return { r: r | 0, g: g | 0, b: b | 0, a: +alpha.toFixed(3) };
  }

  function rgbaFromObj(obj, alphaOverride = null) {
    if (!obj) return null;
    const a = (alphaOverride == null) ? obj.a : alphaOverride;
    return `rgba(${obj.r},${obj.g},${obj.b},${a})`;
  }

  // ---------- NODES ----------
  function regenerateNodes() {
    nodes = [];
    const total = nodeCountForViewport();
    const clusterCount = Math.max(1, Math.floor(total / 12));
    const clusters = [];
    for (let i = 0; i < clusterCount; i++) {
      clusters.push({
        x: rand(0.12 * width, 0.88 * width),
        y: rand(0.12 * height, 0.88 * height),
        spreadX: width * rand(0.05, 0.18),
        spreadY: height * rand(0.05, 0.18)
      });
    }

    const clusterNodesTarget = Math.round(total * 0.78);
    let created = 0;
    while (created < clusterNodesTarget) {
      for (let c = 0; c < clusters.length && created < clusterNodesTarget; c++) {
        const center = clusters[c];
        nodes.push({
          x: clamp(center.x + rand(-center.spreadX, center.spreadX), 0, width),
          y: clamp(center.y + rand(-center.spreadY, center.spreadY), 0, height),
          vx: rand(-0.35, 0.35),
          vy: rand(-0.35, 0.35),
          r: rand(CONFIG.nodeRadiusMin, CONFIG.nodeRadiusMax),
          alpha: rand(0.45, 0.95)
        });
        created++;
      }
    }

    const remaining = total - nodes.length;
    for (let i = 0; i < remaining; i++) {
      nodes.push({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-0.4, 0.4),
        vy: rand(-0.4, 0.4),
        r: rand(CONFIG.nodeRadiusMin * 0.9, CONFIG.nodeRadiusMax * 1.1),
        alpha: rand(0.35, 0.95)
      });
    }
  }

  // Build visible stroke color ensuring minimum alpha
  function strokeStyleForMidpoint(midX, midY, baseAlpha) {
    // ensure baseAlpha not below floor
    const alpha = Math.max(baseAlpha, CONFIG.minLineAlpha);
    const sampled = sampleColorObjectAt(midX, midY);
    if (sampled) {
      // use sampled RGB but override alpha to computed alpha for consistent visibility
      return `rgba(${sampled.r},${sampled.g},${sampled.b},${alpha.toFixed(3)})`;
    } else {
      const [r, g, b] = CONFIG.fallbackLineBase;
      // scale fallback alpha by provided baseAlpha (distance factor)
      return `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
    }
  }

  function drawLinks() {
    const cd = CONFIG.connectDist;
    const cd2 = cd * cd;
    // set line width scaled by DPR for crispness
    ctx.lineWidth = Math.max(0.9, 1 * (DPR || 1));
    let localLinkCount = 0;

    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d2 = dx * dx + dy * dy;
        if (d2 <= cd2) {
          const d = Math.sqrt(d2);
          // distance-based alpha: tweak multiplier so it's visible
          const baseAlpha = (1 - (d / cd)) * CONFIG.fallbackLineAlphaBase * Math.min(a.alpha, b.alpha);
          const midX = (a.x + b.x) * 0.5;
          const midY = (a.y + b.y) * 0.5;
          ctx.strokeStyle = strokeStyleForMidpoint(midX, midY, baseAlpha);
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
          localLinkCount++;
        }
      }
    }

    window.__heroNetwork = window.__heroNetwork || {};
    window.__heroNetwork._lastLinkCount = localLinkCount;
  }

  function drawNodes() {
    for (let n of nodes) {
      const obj = sampleColorObjectAt(n.x, n.y);
      const haloAlpha = 0.08 * n.alpha;
      const haloR = Math.max(8, n.r * 12);
      const g = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, haloR);
      if (obj) {
        g.addColorStop(0, `rgba(${obj.r},${obj.g},${obj.b},${haloAlpha.toFixed(3)})`);
        g.addColorStop(0.25, `rgba(${obj.r},${obj.g},${obj.b},${(haloAlpha * 0.45).toFixed(3)})`);
      } else {
        g.addColorStop(0, CONFIG.fallbackNodeHalo);
        g.addColorStop(0.25, CONFIG.fallbackNodeHalo);
      }
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(n.x, n.y, haloR, 0, Math.PI * 2);
      ctx.fill();

      // core
      if (obj) {
        const coreAlpha = Math.min(0.95, 0.6 + n.alpha * 0.35);
        ctx.fillStyle = `rgba(${obj.r},${obj.g},${obj.b},${coreAlpha.toFixed(3)})`;
      } else {
        ctx.fillStyle = CONFIG.fallbackNodeCore;
      }
      ctx.beginPath();
      ctx.arc(n.x, n.y, Math.max(1.2, n.r), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ---------- ANIMATION ----------
  function step(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(64, ts - lastTs);
    lastTs = ts;

    const minInterval = 1000 / CONFIG.fps;
    if (dt < minInterval) { raf = requestAnimationFrame(step); return; }

    ctx.clearRect(0, 0, width, height);

    for (let n of nodes) {
      n.vx += Math.cos((ts * 0.00025) + (n.r * 0.1)) * 0.0007 * (dt / 16);
      n.vy += Math.sin((ts * 0.00021) - (n.r * 0.1)) * 0.0007 * (dt / 16);

      if (pointer.active) {
        const dx = n.x - pointer.x, dy = n.y - pointer.y;
        const d2 = dx * dx + dy * dy;
        const hr2 = CONFIG.hoverRadius * CONFIG.hoverRadius;
        if (d2 < hr2 && d2 > 0.0001) {
          const d = Math.sqrt(d2);
          const push = CONFIG.hoverRepel * (1 - d / CONFIG.hoverRadius) * (dt / 16);
          n.vx += (dx / d) * push;
          n.vy += (dy / d) * push;
        }
      }

      n.vx *= 0.94; n.vy *= 0.94;
      n.vx = clamp(n.vx, -CONFIG.maxVelocity, CONFIG.maxVelocity);
      n.vy = clamp(n.vy, -CONFIG.maxVelocity, CONFIG.maxVelocity);

      n.x += n.vx * (dt / 16);
      n.y += n.vy * (dt / 16);

      if (n.x < -12) n.x = width + 12;
      if (n.x > width + 12) n.x = -12;
      if (n.y < -12) n.y = height + 12;
      if (n.y > height + 12) n.y = -12;
    }

    drawLinks();
    drawNodes();

    raf = requestAnimationFrame(step);
  }

  // ---------- INIT / RESIZE ----------
  function resizeAndPrepare() {
    const rect = canvas.parentElement.getBoundingClientRect();
    width = Math.max(100, Math.floor(rect.width));
    height = Math.max(60, Math.floor(rect.height));
    DPR = Math.max(1, window.devicePixelRatio || 1);

    canvas.width = Math.floor(width * DPR);
    canvas.height = Math.floor(height * DPR);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

    // try sampling hero background
    const bgUrl = extractBackgroundImageUrl(canvas.parentElement);

    regenerateNodes();

    prepareImageSampling(bgUrl).then((ok) => {
      if (!ok) {
        LOG('sampling not available; using fallback coloring.');
        samplingAvailable = false;
      } else {
        samplingAvailable = true;
      }

      if (reducedMode) {
        ctx.clearRect(0, 0, width, height);
        drawLinks();
        drawNodes();
      } else {
        if (raf) cancelAnimationFrame(raf);
        lastTs = now();
        raf = requestAnimationFrame(step);
      }
      LOG('network initialized:', nodes.length, 'nodes; sampling=', samplingAvailable);
    });
  }

  // ---------- POINTER ----------
  function updatePointer(e) {
    const p = (e.touches && e.touches[0]) ? e.touches[0] : e;
    const rect = canvas.getBoundingClientRect();
    pointer.x = clamp(p.clientX - rect.left, 0, rect.width);
    pointer.y = clamp(p.clientY - rect.top, 0, rect.height);
    pointer.active = true;
  }
  function leavePointer() { pointer.active = false; pointer.x = -9999; pointer.y = -9999; pointer.down = false; }
  function pointerDown() { pointer.down = true; } function pointerUp() { pointer.down = false; }

  const parent = canvas.parentElement || document.body;
  parent.addEventListener('mousemove', updatePointer, { passive: true });
  parent.addEventListener('mouseleave', leavePointer, { passive: true });
  parent.addEventListener('touchmove', updatePointer, { passive: true });
  parent.addEventListener('touchend', leavePointer, { passive: true });
  parent.addEventListener('pointerdown', pointerDown, { passive: true });
  parent.addEventListener('pointerup', pointerUp, { passive: true });

  window.addEventListener('resize', debounce(() => resizeAndPrepare(), 140));
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { if (raf) cancelAnimationFrame(raf); } else { if (!reducedMode) { lastTs = now(); raf = requestAnimationFrame(step); } }
  });

  // ---------- API ----------
  window.__heroNetwork = window.__heroNetwork || {};
  Object.assign(window.__heroNetwork, {
    start: () => { reducedMode = false; resizeAndPrepare(); },
    stop: () => { if (raf) cancelAnimationFrame(raf); raf = null; },
    regenerateNodes: () => { regenerateNodes(); },
    setPreferReduced: (v) => { reducedMode = !!v; LOG('reducedMode set to', reducedMode); resizeAndPrepare(); },
    forceSampling: async (url) => { const ok = await prepareImageSampling(url || extractBackgroundImageUrl(canvas.parentElement)); LOG('forceSampling result', ok); return ok; },
    getNodes: () => nodes,
    getLastLinkCount: () => window.__heroNetwork._lastLinkCount || 0,
    CONFIG
  });

  // ---------- UTIL ----------
  function debounce(fn, wait = 120) {
    let t = null;
    return function (...args) {
      clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // ---------- START ----------
  try {
    resizeAndPrepare();
  } catch (err) {
    console.error('[hero-network] initialization error', err);
  }

})();
