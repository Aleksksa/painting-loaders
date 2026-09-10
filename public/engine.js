/* =====================================================================
 *  engine.js — the reveal loop, shared by every style.
 *
 *  Lifted from loader.html without changing how anything paints: each
 *  stroke is drawn once into an offscreen buffer, then copied onto the
 *  visible canvas in slices along its direction so it looks drawn.
 *
 *  A styleConfig is:
 *    {
 *      label:      'Impressionism',
 *      canvasSize: 600,
 *      loopMs:     9000,
 *      holdMs:     1500,
 *      palette:    { ground, phrases, ...whatever the style's strokes want },
 *      strokes:    (palette) => [ descriptor, ... ],
 *      vocabulary: [ fn, ... ],   // for the gallery's Copy code button
 *    }
 *
 *  A descriptor is { fn, bb, axis, dir, dur, gap } — see D() below.
 *
 *  Three p5.brush facts this file is built around, all verified in 2.2.2:
 *    - scaleBrushes() multiplies the shared brush registry in place, so it
 *      must run exactly once per page. See ensureBrushes().
 *    - brush.load(target) is a global retarget, so it is re-issued whenever
 *      a config is (re)loaded rather than only once in setup.
 *    - brush.wash is deferred until the next drawing call. See flushWash().
 * ===================================================================== */

/* Canvas dimensions live at module scope so the style vocabularies can go on
   referencing bare W / H / m exactly as they did inside loader.html. The
   engine sets them from styleConfig.canvasSize before anything paints. */
let W = 600, H = 600, m = 600;

/* ---- seeded helpers (all randomness goes through p5's seeded random) ---- */
const rr = (a, b) => random(a, b);
const pickOne = (arr) => arr[Math.floor(random(arr.length))];
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---- colour maths ---- */
function hexRgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)); }
function mixHex(a, b, t) { const A = hexRgb(a), B = hexRgb(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function hexHsl(hex) {
  const [r, g, b] = hexRgb(hex).map((v) => v / 255);
  const max = Math.max(r, g, b), min = Math.min(r, g, b), l = (max + min) / 2;
  let h = 0, s = 0;
  if (max !== min) { const d = max - min; s = l > 0.5 ? d / (2 - max - min) : d / (max + min); if (max === r) h = (g - b) / d + (g < b ? 6 : 0); else if (max === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h /= 6; }
  return [h, s, l];
}
function hslHex(h, s, l) {
  const f = (p, q, t) => { if (t < 0) t += 1; if (t > 1) t -= 1; if (t < 1 / 6) return p + (q - p) * 6 * t; if (t < 1 / 2) return q; if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6; return p; };
  let r, g, b;
  if (s === 0) { r = g = b = l; } else { const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q; r = f(p, q, h + 1 / 3); g = f(p, q, h); b = f(p, q, h - 1 / 3); }
  return '#' + [r, g, b].map((v) => Math.round(v * 255).toString(16).padStart(2, '0')).join('');
}
function vivid(hex, amt) { if (!amt) return hex; const [h, s, l] = hexHsl(hex); return hslHex(h, s + (1 - s) * amt, l - (l - 0.45) * amt * 0.5); }

/* ---- geometry ---- */
function jitterEllipse(cx, cy, rx, ry, n, jitter, rot = 0) {
  const pts = [], a0 = rr(0, TWO_PI), cr = Math.cos(rot), sr = Math.sin(rot);
  for (let i = 0; i < n; i++) {
    const a = a0 + (i / n) * TWO_PI, k = 1 + rr(-jitter, jitter);
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    pts.push([cx + x * cr - y * sr, cy + x * sr + y * cr]);
  }
  return pts;
}
function rosette(cx, cy, r, lobes, inner, rot = 0, jit = 0.05) {
  const n = Math.max(24, lobes * 6), pts = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TWO_PI, k = inner + (1 - inner) * (0.5 + 0.5 * Math.cos(lobes * a));
    const rad = r * k * (1 + rr(-jit, jit));
    pts.push([cx + Math.cos(a + rot) * rad, cy + Math.sin(a + rot) * rad]);
  }
  return pts;
}
function bandPolygon(y0, y1, wobble, n = 9) {
  const top = [], bottom = [];
  for (let i = 0; i <= n; i++) { const x = -10 + (W + 20) * (i / n); top.push([x, y0 + rr(-wobble, wobble)]); bottom.push([x, y1 + rr(-wobble, wobble)]); }
  return top.concat(bottom.reverse());
}
const bboxOf = (pts, pad) => {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const [x, y] of pts) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return [Math.max(0, Math.floor(x0 - pad)), Math.max(0, Math.floor(y0 - pad)), Math.min(W, Math.ceil(x1 + pad)), Math.min(H, Math.ceil(y1 + pad))];
};

/* ---- style switches (fill, wash and stroke are independent in p5.brush,
        so each one turns the others off before drawing) ---- */
function fillStyle(color, opacity, bleed, texture, border) { brush.noStroke(); brush.noHatch(); brush.noWash(); brush.fill(color, opacity); brush.fillBleed(bleed, 'out'); brush.fillTexture(texture, border); }
function washStyle(color, opacity) { brush.noStroke(); brush.noHatch(); brush.noFill(); brush.wash(color, opacity); }
function strokeStyle(name, color, weight) { brush.noFill(); brush.noWash(); brush.noHatch(); brush.set(name, color, weight); }

/* ---- descriptor constructor: each stroke is revealed along its axis over
        `dur` ms, like a brush travelling across the paper ---- */
const D = (fn, bb, axis, dir, dur, gap = 60) => ({ fn, bb, axis, dir, dur, gap });
const rdir = () => (random() < 0.5 ? 1 : -1);
const raxis = () => (random() < 0.5 ? 'x' : 'y');

/* p5.brush queues flat washes and only renders them on the next drawing call
   (bleed fills are immediate). A tiny fully transparent fill off-canvas forces
   that flush so the buffer is complete before it is copied. */
function flushWash() {
  brush.noStroke(); brush.noHatch(); brush.noWash();
  brush.fill('#000000', 0); brush.fillBleed(0); brush.fillTexture(0, 0);
  brush.polygon([[-8, -8], [-6, -8], [-6, -6]]);
}

/* scaleBrushes() multiplies the shared brush registry in place, so calling it
   twice compounds. This runs once per page; a later call at a different scale
   is refused loudly rather than silently doubling every brush. */
let brushScale = null;
function ensureBrushes(scale) {
  if (brushScale !== null) {
    if (Math.abs(brushScale - scale) > 1e-6) {
      console.warn(`engine: brushes already scaled to ${brushScale}; ignoring request for ${scale}. ` +
                   'scaleBrushes multiplies in place, so all canvases on a page must share one size.');
    }
    return;
  }
  brush.add('flick', { weight: 0.7, vibration: 0.12, definition: 0.9, quality: 0.8, opacity: 200, spacing: 0.1, pressure: { curve: [0.25, 0.25], min_max: [1.1, 0.85] } });
  brush.add('rim', { weight: 0.45, vibration: 0.35, definition: 0.7, quality: 0.8, opacity: 190, spacing: 0.1, pressure: { curve: [0.15, 0.2], min_max: [1.2, 1] } });
  brush.scaleBrushes(scale);
  brushScale = scale;
}

/* =====================================================================
 *  createEngine(styleConfig, opts)
 *
 *  opts:
 *    mount       element the canvas is appended to (moved, if it already exists)
 *    statusEl    element that receives the palette's phrases (optional)
 *    freeze      progress 0..1 to freeze at instead of looping (optional)
 *    nextConfig  (cycle) => styleConfig, called at each cycle boundary.
 *                Defaults to the config passed in. loader.html uses this to
 *                keep its garden -> dawn -> willow -> wisteria rotation;
 *                the engine itself knows nothing about rotation.
 * ===================================================================== */
function createEngine(styleConfig, opts = {}) {
  let cfg = styleConfig;
  let buf, paint, canvasEl;
  let strokes = [], idx = 0;
  let startMs = null, currentCycle = -1, phaseIndex = -1, fadeTimer = null;
  let statusEl = opts.statusEl || null;
  const freeze = typeof opts.freeze === 'number' ? clamp01(opts.freeze) : null;
  const nextConfig = opts.nextConfig || (() => cfg);

  function setup() {
    W = cfg.canvasSize; H = cfg.canvasSize; m = Math.min(W, H);
    const cnv = createCanvas(W, H, WEBGL);
    canvasEl = cnv.elt || cnv.canvas || document.querySelector('canvas');
    if (opts.mount) mount(opts.mount);

    ensureBrushes(3 * m / 600);

    // `paint` holds everything finished so far; `buf` is paint plus the stroke
    // being drawn. Drawing each stroke over a copy of the painting lets its wet
    // edges mix with the real colours underneath, and every copy between the
    // three surfaces is opaque (no fringes).
    paint = createGraphics(W, H, WEBGL);
    buf = createGraphics(W, H, WEBGL);
    paint.imageMode(CORNER); buf.imageMode(CORNER);
    brush.load(buf);
    // pre-warm the fill shaders into the buffer, then wipe it
    buf.push(); buf.translate(-W / 2, -H / 2);
    fillStyle('#7a86bd', 200, 0.3, 0.5, 0.3); brush.circle(W / 2, H / 2, 12);
    buf.pop(); buf.clear();
    imageMode(CORNER);
    background(cfg.palette.ground);
  }

  /* Move the one canvas into a new parent. Used by the gallery to hand the
     live canvas from card to card. */
  function mount(el) {
    if (canvasEl && el && canvasEl.parentElement !== el) el.appendChild(canvasEl);
  }

  /* Point the engine at a different style and start it from the first stroke. */
  function load(nextCfg) {
    cfg = nextCfg || cfg;
    // The canvas and the scaled brushes are both fixed at setup, so every style
    // sharing a page has to share its size. Say so rather than paint at the
    // wrong coordinates.
    if (cfg.canvasSize !== W) {
      console.warn(`engine: "${cfg.label}" wants canvasSize ${cfg.canvasSize} but the canvas is ${W}. ` +
                   'Painting at ' + W + '. All styles on one page must share a canvasSize.');
    }
    brush.load(buf);                       // brush.load is a global retarget
    randomSeed(cfg.palette.seed); noiseSeed(cfg.palette.seed);
    strokes = cfg.strokes(cfg.palette);
    // give every stroke its own seed, then lay the timeline out end to end
    // and fit it to loopMs
    let cursor = 0;
    for (const s of strokes) { s.seed = Math.floor(random() * 1e9); s.begun = false; s.rev = null; s.start = cursor; cursor += s.dur + s.gap; }
    const k = cfg.loopMs / cursor;
    for (const s of strokes) { s.start *= k; s.dur *= k; s.end = s.start + s.dur; }
    idx = 0; phaseIndex = -1;
    paint.background(cfg.palette.ground);
    background(cfg.palette.ground);
  }

  function beginStroke(s) {
    buf.clear();
    buf.push(); buf.translate(-W / 2, -H / 2);
    buf.image(paint, 0, 0, W, H);          // start from the painting so far
    randomSeed(s.seed); noiseSeed(s.seed);
    s.fn();
    flushWash();
    buf.pop();
    s.begun = true; s.p = 0;
  }
  // a finished stroke becomes part of the painting
  function foldStroke() {
    paint.push(); paint.translate(-W / 2, -H / 2);
    paint.image(buf, 0, 0, W, H);
    paint.pop();
  }
  // draw the revealed part of the stroke in progress: a slice of its box,
  // growing along its direction
  function revealSlice(s) {
    const [x0, y0, x1, y1] = s.bb;
    if (x1 <= x0 || y1 <= y0 || s.p <= 0) return;
    if (s.axis === 'x') {
      const w = Math.round((x1 - x0) * s.p); if (w <= 0) return;
      const a = s.dir > 0 ? x0 : x1 - w;
      image(buf, a, y0, w, y1 - y0, a, y0, w, y1 - y0);
    } else {
      const h = Math.round((y1 - y0) * s.p); if (h <= 0) return;
      const a = s.dir > 0 ? y0 : y1 - h;
      image(buf, x0, a, x1 - x0, h, x0, a, x1 - x0, h);
    }
  }
  function paintUpTo(t) {
    while (idx < strokes.length && strokes[idx].start <= t) {
      const s = strokes[idx];
      if (!s.begun) beginStroke(s);
      s.p = Math.min(1, (t - s.start) / s.dur);
      if (s.p >= 1) { foldStroke(); idx++; } else break;
    }
  }
  function drawFrame(t) {
    paintUpTo(t);
    image(paint, 0, 0, W, H);
    const s = strokes[idx];
    if (s && s.begun) revealSlice(s);
  }

  function draw() {
    translate(-W / 2, -H / 2);
    if (freeze !== null) {
      if (!strokes.length) { load(nextConfig(0)); drawFrame(freeze * cfg.loopMs); updateStatus(freeze); noLoop(); }
      return;
    }
    if (startMs === null) startMs = millis();
    const now = millis() - startMs, cycleMs = cfg.loopMs + cfg.holdMs;
    const cycle = Math.floor(now / cycleMs), elapsed = now % cycleMs;
    if (cycle !== currentCycle) { currentCycle = cycle; load(nextConfig(cycle)); }
    drawFrame(Math.min(elapsed, cfg.loopMs));
    updateStatus(Math.min(elapsed / cfg.loopMs, 1));
  }

  /* Restart from the first stroke on the next frame. */
  function restart() { startMs = null; currentCycle = -1; }

  /* Paint up to t on demand, outside the animation loop. drawFrame is already
     incremental — paintUpTo resumes from where it left off — so the caller can
     walk t up over several frames to paint a whole picture without blocking.
     The gallery uses this to render each card's finished still at load. */
  function renderTo(t) { push(); translate(-W / 2, -H / 2); drawFrame(t); pop(); }

  /* Point at a different style and restart. The strokes are not rebuilt here —
     the next draw() does that once, via nextConfig. Used by the gallery when
     the live canvas moves to another card. */
  function switchTo(nextCfg, nextStatusEl) {
    cfg = nextCfg || cfg;
    if (nextStatusEl !== undefined) {
      if (statusEl && statusEl !== nextStatusEl) { clearTimeout(fadeTimer); statusEl.textContent = ''; }
      statusEl = nextStatusEl;
    }
    restart();
  }

  function updateStatus(progress) {
    if (!statusEl) return;
    const list = cfg.palette.phrases;
    if (!list || !list.length) return;
    let i;
    if (progress >= 1) i = list.length - 1;
    else { const active = Math.max(list.length - 1, 1); i = Math.min(Math.floor(progress * active), active - 1); }
    if (i === phaseIndex) return;
    const fresh = phaseIndex === -1;
    phaseIndex = i;
    clearTimeout(fadeTimer);
    if (fresh) { statusEl.classList.remove('fade'); statusEl.textContent = list[i]; return; }
    statusEl.classList.add('fade');
    fadeTimer = setTimeout(() => { statusEl.textContent = list[i]; statusEl.classList.remove('fade'); }, 250);
  }

  return {
    setup, draw, load, mount, restart, switchTo, renderTo,
    get config() { return cfg; },
    get canvas() { return canvasEl; },
  };
}

/* Every function above that a copied standalone file needs, in dependency
   order. The gallery serialises these with Function.prototype.toString().
   Keep in step when adding a shared helper. */
const SHARED_FOR_COPY = [
  rr, pickOne, clamp01, clampN,
  hexRgb, mixHex, hexHsl, hslHex, vivid,
  jitterEllipse, rosette, bandPolygon, bboxOf,
  fillStyle, washStyle, strokeStyle,
  D, rdir, raxis,
  flushWash, ensureBrushes, createEngine,
];
