/* =====================================================================
 *  style-impressionism.js — Monet.
 *
 *  Everything here is lifted verbatim from loader.html; only the wrapper
 *  changed. The vocabulary lives inside an IIFE so later movements can
 *  reuse names like drawFlower without colliding, and reads W / H / m from
 *  engine.js at call time (never captured at load time).
 *
 *  Exports four sibling configs sharing one vocabulary. index.html shows
 *  garden as the Impressionism card; loader.html rotates all four.
 * ===================================================================== */
window.STYLES = window.STYLES || {};

(function () {
  // The dials settled on in the playground, baked in.
  // `flower` scales blooms only — not pads, leaves or the compositions around them.
  // At 1.8 a willow lily grows from ~20px to ~36px on its unchanged ~60px pad, so it
  // sits proud of the pad rather than on it, the way Monet paints them.
  const S = { water: 0.55, coverage: 0.84, density: 0.5, scale: 1.1, soft: 0.7, glaze: 0.3, touch: 0.2, detail: 0.45, brushSize: 1.49, vivid: 0.45, flower: 1.8 };

  const SCENES = {
    garden: {
      seed: 1874, ground: '#f6f0ea',
      washes: ['#eed7dc', '#dcc3cf', '#cdd8c0', '#f1e2d2'], foliage: ['#8fae72', '#5f8656', '#3f6146', '#b8cf95'],
      accents: ['#f4b3cb', '#ea8fb4', '#d8679a', '#fbd7e3', '#f7e6ec'], highlights: ['#f7e0a4', '#fff4f7'],
      phrases: ['creating…', 'growing…', 'blooming…', 'catching the light…', 'finished'],
    },
    dawn: {
      seed: 1874, ground: '#f4efe9',
      washes: ['#f2c9d3', '#e8b0c6', '#c9c0d9', '#b8cfd4'], foliage: ['#b9cfae', '#7fa38f', '#5a8272', '#d5e2c4'],
      accents: ['#f3b8cf', '#e79ab9', '#d97fa3', '#fbe6ee'], highlights: ['#fde7b8', '#fff7e6'],
      phrases: ['creating…', 'glowing…', 'growing the reeds…', 'opening the lilies…', 'finished'],
    },
    willow: {
      seed: 1874, ground: '#f3efe6',
      washes: ['#6f8fb3', '#4f6fa0', '#a9c8d6', '#3f5a86'], foliage: ['#5f8a5a', '#8fb15b', '#31504a', '#d2c96a'],
      accents: ['#f2b6c9', '#e88fb0', '#d9749a', '#fbe3ea'], highlights: ['#f6e0a0', '#fff6d6'],
      phrases: ['creating…', 'painting the water…', 'hanging the willow…', 'floating the lilies…', 'finished'],
    },
    wisteria: {
      seed: 1874, ground: '#f5efe3',
      washes: ['#e9dfa0', '#d9c9b8', '#c9b9d9', '#b7c68a'], foliage: ['#9bb26f', '#7c9a5e', '#5a7a4c', '#b9c98a'],
      accents: ['#b99bd6', '#9c7fc4', '#e8b3c7', '#f3d6a2', '#7f63b0'], highlights: ['#fbf1c4', '#fff8e8'],
      phrases: ['creating…', 'dappling the meadow…', 'hanging the wisteria…', 'scattering blossoms…', 'finished'],
    },
    poppies: {
      seed: 1874, ground: '#f5f0e6',
      washes: ['#c9d6e3', '#a9bfd4', '#b9c98a', '#8fa86a'], foliage: ['#7f9d5e', '#5b7f4d', '#3a5a40', '#c9d47a'],
      accents: ['#d9463f', '#e4614f', '#b73838', '#f2a49e'], highlights: ['#f7e7b4', '#fff6e6'],
      phrases: ['creating…', 'washing the sky…', 'growing the meadow…', 'scattering poppies…', 'finished'],
    },
    irises: {
      seed: 1874, ground: '#f4eee2',
      washes: ['#e6d6b8', '#d9c9a6', '#c8b8d6', '#b6c9a2'], foliage: ['#7fa565', '#5b8452', '#3c5f45', '#b9cf8a'],
      accents: ['#8a6bb8', '#6c4fa0', '#4e3a85', '#c9b3e0', '#b28fd0'], highlights: ['#f4e3a6', '#fff6e6'],
      phrases: ['creating…', 'laying the path…', 'raising the blades…', 'opening the irises…', 'finished'],
    },
    orchard: {
      seed: 1874, ground: '#f5f1e8',
      washes: ['#cfdcea', '#b9cbe0', '#c5d39a', '#9db877'], foliage: ['#7fa26a', '#5c8455', '#3e5f47', '#c0d28d'],
      accents: ['#f6d4dc', '#eeb6c4', '#e39bb0', '#fff1f4', '#f9e4ea'], highlights: ['#f7e6b4', '#fff8ee'],
      phrases: ['creating…', 'washing the sky…', 'planting the orchard…', 'blossoming…', 'finished'],
    },
  };

  // =====================================================================
  //  Drawing vocabulary (the watercolor style from the playground)
  // =====================================================================
  function softBlobDraw(x, y, rx, ry, color, opacity, bleed, texture, rot = 0, jit = 0.12) {
    const w = S.water - 0.5;
    fillStyle(color, Math.round(opacity - w * 60), clamp01(bleed + w * 0.4), clamp01(texture + w * 0.2), 0.3);
    brush.polygon(jitterEllipse(x, y, rx, ry, 14, jit, rot));
  }
  function bloomFill(color, opacity, bleed) { fillStyle(color, opacity, clamp01(bleed + S.water * 0.3), 0.5, 0.4); }
  // One bloom layer: a flat body inset under a bleeding fill of the same scalloped
  // shape. The body makes the colour solid (no ground showing through), the fill
  // keeps the rim wet. No outline is ever stroked, so nothing reads as a line.
  function bloomShape(x, y, r, lobes, inner, color, bleed = 0.3, solid = 0.72) {
    const rot = rr(0, TWO_PI);
    washStyle(color, 255); brush.polygon(rosette(x, y, r * solid, lobes, inner, rot, 0.08));
    bloomFill(color, 250, bleed); brush.polygon(rosette(x, y, r, lobes, inner, rot, 0.05));
  }
  function centerDot(x, y, r, color, opacity = 250) { washStyle(color, opacity); brush.polygon(jitterEllipse(x, y, r, r * rr(0.85, 1), 12, 0.14)); }
  function flowerCols(C) {
    const a = C.accents, h = C.highlights, v = S.vivid;
    const light = vivid(a[0], v), mid = vivid(a[1] || a[0], v), deep = vivid(a[2] || a[1] || a[0], v);
    return { light, mid, deep, base: a[3] || mixHex(light, '#ffffff', 0.45), center: vivid(h[0] || '#e6b94f', v), pale: h[1] || mixHex(light, '#ffffff', 0.7), shade: mixHex(deep, '#3b3550', 0.45) };
  }
  function foliageCols(C) { const f = C.foliage; return { light: f[3] || mixHex(f[0], '#ffffff', 0.35), mid: f[0], deep: f[1] || f[0], shade: f[2] || mixHex(f[0], '#1f2f2a', 0.5) }; }
  function drawPeony(x, y, s, F) {
    const det = S.detail;
    bloomShape(x, y, s * 1.08, 8, 0.74, mixHex(F.light, F.mid, S.vivid * 0.5), 0.32, 0.74);
    bloomShape(x, y, s * 0.62, 6, 0.68, F.mid, 0.24, 0.68);
    if (det > 0.35) bloomShape(x, y, s * 0.32, 5, 0.66, F.deep, 0.2, 0.62);
    centerDot(x, y, 0.1 * s, F.center, 235);
  }
  function drawDaisy(x, y, s, F) {
    const lobes = 7 + Math.round(4 * S.detail);
    bloomShape(x, y, s * 1.05, lobes, 0.4, F.pale, 0.28, 0.8);
    bloomFill(F.light, 170, 0.3); brush.polygon(rosette(x, y, s * 0.52, lobes, 0.55, rr(0, TWO_PI)));
    centerDot(x, y, 0.24 * s, F.center, 245);
    centerDot(x + 0.06 * s, y + 0.07 * s, 0.1 * s, mixHex(F.center, F.shade, 0.45), 190);
  }
  function drawBlossom(x, y, s, F) {
    bloomShape(x, y, s * 0.9, 5, 0.5, random() < 0.5 ? F.light : F.mid, 0.26, 0.74);
    centerDot(x, y, 0.14 * s, F.center, 240);
  }
  function drawLily(x, y, s, F) {
    const pts = [], n = 36, lobes = 6;
    for (let i = 0; i <= n; i++) {
      const a = Math.PI + (i / n) * Math.PI, k = 0.62 + 0.38 * (0.5 + 0.5 * Math.cos(lobes * a));
      pts.push([x + Math.cos(a) * 10 * s * k * (1 + rr(-0.05, 0.05)), y + 2 * s + Math.sin(a) * 9 * s * k]);
    }
    pts.push([x + 4 * s, y + 4.5 * s], [x, y + 5.5 * s], [x - 4 * s, y + 4.5 * s]);
    washStyle(F.light, 255); brush.polygon(pts.map(([px, py]) => [x + (px - x) * 0.76, y + 2 * s + (py - y - 2 * s) * 0.76]));
    bloomFill(F.light, 250, 0.3); brush.polygon(pts);
    bloomFill(F.deep, 235, 0.28); brush.polygon(jitterEllipse(x, y + 2 * s, 5.5 * s, 3.2 * s, 10, 0.12));
    centerDot(x, y + 1 * s, 2.2 * s, F.center, 242);
  }
  function drawFlower(type, x, y, s, F) {
    if (type === 'peony') drawPeony(x, y, s, F); else if (type === 'daisy') drawDaisy(x, y, s, F); else if (type === 'lily') drawLily(x, y, s, F); else drawBlossom(x, y, s, F);
  }
  function drawPad(x, y, r, G) {
    fillStyle(G.mid, 240, clamp01(0.2 + S.water * 0.25), 0.5, 0.35);
    brush.polygon(jitterEllipse(x, y, r, r * 0.42, 12, 0.08));
    strokeStyle('flick', G.light, 1.1 * S.brushSize);
    brush.spline([[x - r * 0.6, y - r * 0.2], [x - r * 0.1, y - r * 0.4], [x + r * 0.5, y - r * 0.3]], 0.5);
    strokeStyle('rim', G.shade, 1.4 * S.brushSize);
    brush.spline([[x - r * 0.7, y + r * 0.2], [x, y + r * 0.45], [x + r * 0.7, y + r * 0.2]], 0.5);
  }
  function drawStrand(x0, y0, len, sway, color, weight, name = 'flick') {
    brush.field('hand');
    const watery = S.water > 0.6 && random() < (S.water - 0.6) * 1.5;
    strokeStyle(watery ? 'marker' : name, color, weight * S.brushSize * (watery ? 2 : 1));
    brush.spline([[x0, y0], [x0 + sway * 0.5 + rr(-2, 2), y0 + len * 0.5], [x0 + sway, y0 + len]], 0.6);
    brush.noField();
  }
  function glazeDraw(x0, y0, x1, y1, color, weight, field = 'hand') { brush.field(field); strokeStyle('marker', color, weight * S.brushSize); brush.line(x0, y0, x1, y1); brush.noField(); }
  function flickDraw(x, y, len, a, color, weight) { strokeStyle('flick', color, weight * S.brushSize); brush.line(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2, x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2); }

  // =====================================================================
  //  Descriptor factories
  // =====================================================================
  function dWash(color, opacity) {
    const pts = [[-10, -10], [W + 10, -10], [W + 10, H + 10], [-10, H + 10]];
    return D(() => { washStyle(color, opacity); brush.polygon(pts); }, [0, 0, W, H], 'x', rdir(), 700, 120);
  }
  function dBand(y0, y1, color, opacity, wobble) {
    const pts = bandPolygon(y0, y1, wobble), water = S.water;
    const bleed = 0.25 + water * 0.5, texture = 0.3 + water * 0.5;
    return D(() => { fillStyle(color, opacity, bleed, texture, 0.3); brush.polygon(pts); }, bboxOf(pts, m * 0.25), 'x', rdir(), 600, 100);
  }
  // Reveal boxes are padded generously: bleed spreads well past the polygon, and since the
  // buffer only holds the current stroke an oversized box copies nothing but transparency.
  function dBlob(x, y, rx, ry, color, opacity, bleed, texture, rot = 0, jit = 0.12, dur = 420) {
    const big = Math.max(rx, ry), pad = big * 0.9 + 14;
    const bb = [Math.max(0, x - big - pad), Math.max(0, y - big - pad), Math.min(W, x + big + pad), Math.min(H, y + big + pad)];
    return D(() => softBlobDraw(x, y, rx, ry, color, opacity, bleed, texture, rot, jit), bb.map(Math.round), raxis(), rdir(), dur, 80);
  }
  function dGlaze(x0, y0, x1, y1, color, weight, field) {
    const bb = bboxOf([[x0, y0], [x1, y1]], 14 + weight * 4 * S.brushSize);
    const axis = Math.abs(x1 - x0) >= Math.abs(y1 - y0) ? 'x' : 'y';
    const dir = axis === 'x' ? Math.sign(x1 - x0) || 1 : Math.sign(y1 - y0) || 1;
    const len = Math.hypot(x1 - x0, y1 - y0);
    return D(() => glazeDraw(x0, y0, x1, y1, color, weight, field), bb, axis, dir, 160 + len * 1.4, 50);
  }
  function dStrand(x0, y0, len, sway, color, weight, name) {
    const bb = bboxOf([[x0, y0], [x0 + sway, y0 + len]], 14 + weight * 5 * S.brushSize);
    return D(() => drawStrand(x0, y0, len, sway, color, weight, name), bb, 'y', Math.sign(len) || 1, 120 + Math.abs(len) * 1.2, 30);
  }
  function dLeaves(cx, cy, rx, ry, n, cols, size, rot = 0) {
    n = Math.max(2, Math.round(n * (0.3 + 0.7 * S.detail)));
    size *= S.brushSize * (1.4 - 0.4 * S.detail);
    const items = [];
    let batch = [];
    for (let i = 0; i < n; i++) {
      const a = rr(0, TWO_PI), d = Math.sqrt(random());
      const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, r = size * rr(0.6, 1.4);
      batch.push({ x, y, r, color: pickOne(cols), rot: rot + rr(-0.7, 0.7), op: Math.round(rr(170, 235) - S.water * 40) });
      if (batch.length === 5 || i === n - 1) {
        const b = batch; batch = [];
        const bb = bboxOf(b.map((lf) => [lf.x, lf.y]), size * 2.5 + 8);
        items.push(D(() => { for (const lf of b) { washStyle(lf.color, lf.op); brush.polygon(jitterEllipse(lf.x, lf.y, lf.r * 1.7, lf.r * 0.7, 8, 0.12, lf.rot)); } }, bb, raxis(), rdir(), 200, 40));
      }
    }
    return items;
  }
  function dFlower(type, x, y, s, F) {
    const r = (type === 'lily' ? 11 * s : s * 1.3) * 1.6 + 10;
    const bb = [Math.max(0, x - r), Math.max(0, y - r), Math.min(W, x + r), Math.min(H, y + r)].map(Math.round);
    const dur = type === 'blossom' ? 260 : type === 'lily' ? 380 : 420;
    return D(() => drawFlower(type, x, y, s, F), bb, raxis(), rdir(), dur, 90);
  }
  function dPad(x, y, r, G) {
    const bb = [Math.max(0, x - r * 1.8 - 8), Math.max(0, y - r * 1.2 - 8), Math.min(W, x + r * 1.8 + 8), Math.min(H, y + r * 1.3 + 8)].map(Math.round);
    return D(() => drawPad(x, y, r, G), bb, 'x', rdir(), 240, 50);
  }
  function dFlick(x, y, len, a, color, weight) {
    const bb = bboxOf([[x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2], [x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2]], 10 + weight * 5);
    const axis = Math.abs(Math.cos(a)) >= Math.abs(Math.sin(a)) ? 'x' : 'y';
    return D(() => flickDraw(x, y, len, a, color, weight), bb, axis, rdir(), 90, 25);
  }
  function dTouches(points, C, count, angleFn, sizeMul = 1) {
    const items = [];
    count = Math.round(count * (0.4 + 0.6 * S.detail));
    for (let i = 0; i < count; i++) {
      const p = points.length ? pickOne(points) : [rr(0, W), rr(0, H), 10];
      const x = p[0] + rr(-p[2], p[2]), y = p[1] + rr(-p[2] * 0.6, p[2] * 0.6);
      const color = random() < 0.85 ? pickOne(C.highlights) : pickOne(C.accents);
      items.push(dFlick(x, y, rr(6, 16) * S.scale * sizeMul * (m / 600) * 3, angleFn(), color, rr(0.6, 1.1) * S.scale));
    }
    return items;
  }

  // A batch of pre-computed flat wash marks — grass, petal dapple, iris heads.
  // A meadow is hundreds of these; drawing them eight to a stroke keeps the
  // reveal readable instead of turning one scene into 300 strokes.
  function dMarks(marks, dur = 220, gap = 40) {
    const items = [];
    for (let i = 0; i < marks.length; i += 8) {
      const b = marks.slice(i, i + 8);
      let pts = [];
      for (const d of b) pts = pts.concat(d.pts);
      items.push(D(() => { for (const d of b) { washStyle(d.color, d.op); brush.polygon(d.pts); } }, bboxOf(pts, 10), raxis(), rdir(), dur, gap));
    }
    return items;
  }

  // =====================================================================
  //  Scenes (proportions from the playground, scaled by canvas size)
  // =====================================================================
  function buildGarden(C) {
    const out = [], { water, density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const F = flowerCols(C), G = foliageCols(C), washes = C.washes;
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    for (let i = 0; i < 3; i++) out.push(dBlob(rr(W * 0.2, W * 0.8), rr(H * 0.1, H * 0.5), W * rr(0.3, 0.5), H * rr(0.2, 0.35), washes[(i + 1) % washes.length], Math.round(190 - water * 40), 0.5 + water * 0.3, 0.5, rr(-0.5, 0.5), 0.2, 500));
    const nMass = 5 + Math.round(dens * 6);
    for (let i = 0; i < nMass; i++) {
      const y = H * rr(0.35, 0.95), x = rr(-W * 0.05, W * 1.05);
      const rx = W * rr(0.12, 0.26) * (0.6 + y / H), ry = rx * rr(0.45, 0.8);
      const color = random() < 0.5 ? G.mid : (random() < 0.5 ? G.deep : G.light);
      out.push(dBlob(x, y, rx, ry, color, Math.round(200 - water * 30), 0.4 + water * 0.3, 0.6, rr(-0.4, 0.4), 0.2 + soft * 0.2, 380));
    }
    out.push(...dLeaves(W * 0.5, H * 0.68, W * 0.55, H * 0.32, Math.round(24 + dens * 40), [G.deep, G.mid, G.light, F.light], m * 0.012 * sc, 0));
    // flowers planned first so stalks lead to them
    const nFlower = Math.round(6 + dens * 16), flowers = [];
    for (let i = 0; i < nFlower; i++) {
      const y = H * (0.3 + 0.68 * Math.pow(random(), 0.8)), x = rr(W * 0.04, W * 0.96), depth = 0.55 + (y / H) * 0.7, r = random();
      const type = r < 0.5 ? 'peony' : r < 0.75 ? 'daisy' : 'blossom';
      const s = m * (type === 'peony' ? rr(0.055, 0.085) : type === 'daisy' ? rr(0.045, 0.065) : rr(0.03, 0.045)) * sc * depth * S.flower;
      flowers.push({ x, y, s, type });
    }
    flowers.sort((a, b) => a.y - b.y);
    const paleF = { ...F, light: mixHex(F.light, '#ffffff', 0.35), mid: mixHex(F.mid, '#ffffff', 0.35) };
    // Distant scatter high in the frame: deliberately NOT scaled by S.flower. These are
    // background texture, and growing them with the near blooms would flatten the depth.
    for (let i = 0; i < Math.round((8 + dens * 12) * (0.4 + 0.6 * det)); i++) {
      const x = rr(W * 0.03, W * 0.97), y = H * rr(0.12, 0.45), s = m * rr(0.012, 0.022) * sc * bs;
      out.push(dFlower('blossom', x, y, s, paleF));
    }
    for (const f of flowers) {
      if (random() > 0.3 + 0.7 * det) continue;
      const len = rr(H * 0.08, H * 0.22), sway = rr(-5, 5) * (m / 600) * 3;
      const sc2 = random() < 0.5 ? G.mid : G.deep;
      const stem = [[f.x, f.y + f.s * 0.3], [f.x + sway * 0.5, f.y + len * 0.5], [f.x + sway, f.y + len]];
      out.push(D(() => { brush.field('hand'); strokeStyle('marker', sc2, rr(2.4, 4.2) * bs); brush.spline(stem, 0.6); brush.noField(); }, bboxOf(stem, 10 * bs), 'y', 1, 100 + len * 1.5, 30));
      if (random() < 0.2 + 0.6 * det) {
        const lx = f.x + rr(-f.s, f.s), ly = f.y + rr(f.s * 0.6, f.s * 2.2), lr = f.s * rr(0.6, 1.1) * bs, rot = rr(-1.2, 1.2), lc = random() < 0.5 ? G.mid : G.deep;
        out.push(dBlob(lx, ly, lr * 1.6, lr * 0.55, lc, 230, 0.25, 0.5, rot, 0.1, 220));
      }
    }
    for (const f of flowers) out.push(dFlower(f.type, f.x, f.y, f.s, F));
    out.push(...dTouches(flowers.map((f) => [f.x, f.y - f.s * 0.4, f.s]), C, Math.round(S.touch * 18), () => rr(-0.3, 0.3), 0.7));
    return out;
  }

  function buildDawn(C) {
    const out = [], { water, density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const F = flowerCols(C), G = foliageCols(C), washes = C.washes, highlights = C.highlights;
    const sunX = W * 0.5, sunY = H * 0.34, horizon = H * 0.52;
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-10, horizon + H * 0.05, washes[1], Math.round(200 - water * 40), m * 0.04));
    out.push(dBlob(W * 0.15, H * 0.2, W * 0.3, H * 0.28, washes[2], 180, 0.6, 0.6, 0.3));
    out.push(dBlob(W * 0.85, H * 0.22, W * 0.3, H * 0.28, washes[2], 180, 0.6, 0.6, -0.3));
    out.push(dBlob(sunX, sunY, W * 0.26, H * 0.2, highlights[1] || '#fff7e6', 170, 0.75, 0.5, 0, 0.2, 520));
    out.push(dBlob(sunX, sunY, W * 0.12, H * 0.09, highlights[0], 190, 0.7, 0.4, 0, 0.2, 360));
    out.push(dBand(horizon - H * 0.03, H * 0.8, washes[2], Math.round(205 - water * 40), m * 0.023));
    out.push(dBand(H * 0.72, H + 10, washes[3] || washes[2], Math.round(215 - water * 40), m * 0.023));
    out.push(dBlob(sunX, H * 0.72, W * 0.14, H * 0.24, highlights[1] || '#fff7e6', 140, 0.7, 0.5, 0, 0.2, 420));
    for (let i = 0; i < Math.round(4 + S.glaze * 12); i++) {
      const y = rr(horizon, H), color = random() < 0.5 ? washes[0] : (random() < 0.5 ? washes[1] : washes[2]);
      const x0 = rr(-5, W * 0.5), x1 = x0 + rr(W * 0.3, W * 0.9);
      out.push(dGlaze(x0, y, x1, y + rr(-2, 2), color, rr(1.5, 3.5) * Math.sqrt(sc), random() < 0.3 ? 'waves' : 'hand'));
    }
    out.push(dBlob(W * 0.06, H * 0.62, W * 0.22, H * 0.36, G.mid, 190, 0.5, 0.6, 0.1));
    out.push(dBlob(W * 0.94, H * 0.6, W * 0.22, H * 0.38, G.mid, 190, 0.5, 0.6, -0.1));
    out.push(dBlob(W * 0.1, H * 0.85, W * 0.2, H * 0.2, G.deep, 180, 0.5, 0.6, 0));
    out.push(dBlob(W * 0.9, H * 0.85, W * 0.2, H * 0.2, G.deep, 180, 0.5, 0.6, 0));
    out.push(...dLeaves(W * 0.06, H * 0.62, W * 0.2, H * 0.3, Math.round(16 + dens * 24), [G.deep, G.mid, G.light], m * 0.011 * sc, 0.2));
    out.push(...dLeaves(W * 0.94, H * 0.6, W * 0.2, H * 0.3, Math.round(16 + dens * 24), [G.deep, G.mid, G.light], m * 0.011 * sc, -0.2));
    const nReed = Math.round((50 + dens * 110) * (0.35 + 0.65 * det));
    for (let i = 0; i < nReed; i++) {
      const left = i % 2 === 0;
      const edge = left ? rr(-3, W * 0.24) : rr(W * 0.76, W + 3);
      const c = left ? edge / (W * 0.24) : (W - edge) / (W * 0.24);
      const len = -H * rr(0.18, 0.55) * (1 - c * 0.5) * (0.8 + sc * 0.2);
      const y0 = H + 4 - rr(0, H * 0.12), sway = (left ? -1 : 1) * rr(1.5, 7) * (m / 600) * 3;
      const color = random() < 0.25 ? G.shade : (random() < 0.5 ? G.deep : (random() < 0.7 ? G.mid : G.light));
      out.push(dStrand(edge, y0, len, sway, color, rr(0.5, 1.1) * sc * (1.5 - 0.5 * det), random() < 0.6 ? 'rim' : 'flick'));
    }
    const rafts = [{ cx: W * 0.24, cy: H * 0.8, n: 4 }, { cx: W * 0.72, cy: H * 0.88, n: 5 }], lilies = [];
    for (const rf of rafts) {
      const pads = [];
      for (let i = 0; i < rf.n + Math.round(dens * 2); i++) pads.push({ x: rf.cx + rr(-W * 0.1, W * 0.1), y: rf.cy + rr(-H * 0.035, H * 0.035), r: m * rr(0.03, 0.05) * sc });
      pads.sort((a, b) => a.y - b.y);
      pads.forEach((p) => out.push(dPad(p.x, p.y, p.r, G)));
      const byR = pads.slice().sort((a, b) => b.r - a.r);
      for (let i = 0; i < 2; i++) { const p = byR[i]; const s = (p.r / (m * 0.045)) * 1.2 * sc * S.flower; lilies.push(dFlower('lily', p.x, p.y - p.r * 0.1, s, F)); }
    }
    out.push(...lilies);
    const glintPts = [];
    for (let i = 0; i < 10; i++) glintPts.push([sunX + randomGaussian(0, W * 0.08), rr(horizon + 4, H * 0.95), 6]);
    out.push(...dTouches(glintPts, C, Math.round(S.touch * 20), () => rr(-0.06, 0.06)));
    return out;
  }

  function buildWillow(C) {
    const out = [], { water, density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const F = flowerCols(C), G = foliageCols(C), washes = C.washes, highlights = C.highlights, foliage = C.foliage;
    const pathX = W * 0.5;
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-10, H * 0.5, washes[2], Math.round(215 - water * 40), m * 0.027));
    out.push(dBand(H * 0.35, H * 0.78, washes[0], Math.round(220 - water * 40), m * 0.027));
    out.push(dBand(H * 0.68, H + 10, washes[3] || washes[1], Math.round(230 - water * 40), m * 0.027));
    out.push(dBlob(pathX, H * 0.62, W * 0.16, H * 0.42, highlights[1] || '#fff6d6', 150, 0.7, 0.6, 0, 0.15, 520));
    for (let i = 0; i < Math.round(4 + S.glaze * 10); i++) {
      const y0 = rr(H * 0.3, H * 0.95), len = rr(H * 0.08, H * 0.22), x = pathX + randomGaussian(0, W * 0.05);
      const color = i % 3 === 0 ? highlights[0] : mixHex(highlights[1] || '#fff6d6', washes[2], 0.4);
      out.push(dGlaze(x, y0, x + rr(-2, 2), y0 + len, color, rr(2, 4), 'hand'));
    }
    const dark = G.shade, midG = G.mid, sunG = foliage[3] || mixHex(G.mid, highlights[0], 0.6);
    out.push(dBlob(W * 0.12, H * 0.1, W * 0.36, H * 0.3, dark, 235, 0.35 + water * 0.3, 0.5, 0.3));
    out.push(dBlob(W * 0.9, H * 0.12, W * 0.34, H * 0.32, dark, 235, 0.35 + water * 0.3, 0.5, -0.3));
    out.push(dBand(-15, H * 0.09, dark, 225, m * 0.03));
    out.push(dBlob(W * 0.3, H * 0.14, W * 0.22, H * 0.14, midG, 200, 0.5, 0.6, 0.2));
    out.push(dBlob(W * 0.72, H * 0.16, W * 0.2, H * 0.13, midG, 200, 0.5, 0.6, -0.2));
    const leafCols = [G.shade, G.deep, G.mid, sunG];
    out.push(...dLeaves(W * 0.14, H * 0.16, W * 0.36, H * 0.2, Math.round(30 + dens * 40), leafCols, m * 0.012 * sc, 0.3));
    out.push(...dLeaves(W * 0.86, H * 0.18, W * 0.34, H * 0.2, Math.round(30 + dens * 40), leafCols, m * 0.012 * sc, -0.3));
    out.push(...dLeaves(W * 0.5, H * 0.05, W * 0.4, H * 0.08, Math.round(20 + dens * 30), [G.shade, G.deep, G.mid], m * 0.011 * sc, 0));
    const nStrand = Math.round((40 + dens * 110) * (0.35 + 0.65 * det));
    for (let i = 0; i < nStrand; i++) {
      const x0 = rr(-3, W + 3), c = Math.abs(x0 - pathX) / (W * 0.5);
      const y0 = H * 0.03 + Math.pow(c, 1.5) * H * 0.3 + rr(-5, 5);
      const len = (H * rr(0.15, 0.5)) * (1 - 0.35 * (1 - c)) * (0.8 + sc * 0.2);
      const backlit = c < 0.45 && random() < 0.7;
      const color = backlit ? (random() < 0.5 ? sunG : highlights[0]) : (random() < 0.7 ? G.deep : G.mid);
      out.push(dStrand(x0, y0, len, rr(-6, 6) * (m / 600) * 3, color, rr(0.7, 1.3) * sc * (1.5 - 0.5 * det), random() < 0.2 ? 'rim' : 'flick'));
    }
    const rafts = [
      { cx: W * 0.22, cy: H * 0.82, n: 5, r: [0.035, 0.055], flowers: 2 },
      { cx: W * 0.5, cy: H * 0.6, n: 4, r: [0.02, 0.032], flowers: 1 },
      { cx: W * 0.78, cy: H * 0.86, n: 5, r: [0.035, 0.05], flowers: 2 },
    ];
    const lilies = [];
    for (const rf of rafts) {
      const pads = [];
      for (let i = 0; i < rf.n + Math.round(dens * 3); i++) pads.push({ x: rf.cx + rr(-W * 0.11, W * 0.11), y: rf.cy + rr(-H * 0.04, H * 0.04), r: m * rr(rf.r[0], rf.r[1]) * sc });
      pads.sort((a, b) => a.y - b.y);
      pads.forEach((p) => out.push(dPad(p.x, p.y, p.r, G)));
      const byR = pads.slice().sort((a, b) => b.r - a.r);
      for (let i = 0; i < rf.flowers; i++) { const p = byR[i]; const s = (p.r / (m * 0.045)) * 0.9 * sc * S.flower; lilies.push(dFlower('lily', p.x + rr(-p.r * 0.2, p.r * 0.2), p.y - p.r * 0.12, s, F)); }
    }
    out.push(...lilies);
    for (let i = 0; i < 3 + Math.round(dens * 4); i++) out.push(dFlower('blossom', rr(W * 0.02, W * 0.2), rr(H * 0.42, H * 0.72), m * rr(0.02, 0.035) * sc * S.flower, F));
    const sparklePts = [];
    for (let i = 0; i < 12; i++) sparklePts.push([pathX + randomGaussian(0, W * 0.06), rr(H * 0.5, H * 0.95), 4]);
    out.push(...dTouches(sparklePts, C, Math.round(S.touch * 24), () => rr(-0.08, 0.08)));
    return out;
  }

  function buildWisteria(C) {
    const out = [], { water, density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const F = flowerCols(C), G = foliageCols(C), washes = C.washes, accents = C.accents, highlights = C.highlights;
    const lav = [accents[0], accents[1] || accents[0], accents[4] || accents[1] || accents[0]];
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-10, H * 0.45, washes[2], Math.round(200 - water * 40), m * 0.037));
    out.push(dBand(H * 0.3, H * 0.75, washes[0], Math.round(215 - water * 40), m * 0.037));
    out.push(dBand(H * 0.62, H + 10, washes[3] || washes[1], Math.round(215 - water * 40), m * 0.037));
    out.push(dBlob(W * 0.5, H * 0.5, W * 0.3, H * 0.14, highlights[0], 150, 0.7, 0.5, 0, 0.2, 420));
    // dappled meadow in small batches
    const nDots = Math.round((80 + dens * 160) * (0.3 + 0.7 * det));
    const dotCols = [...washes, accents[2] || accents[0], accents[3] || highlights[0], highlights[0], G.light];
    let batch = [];
    for (let i = 0; i < nDots; i++) {
      const y = H * (0.25 + 0.75 * Math.pow(random(), 0.7)), x = rr(-2, W + 2);
      const r = m * rr(0.005, 0.013) * sc * (0.6 + y / H) * bs * (1.5 - 0.5 * det);
      const pts = jitterEllipse(x, y, r * rr(1.6, 2.6), r, 8, 0.15 + soft * 0.2, rr(-0.25, 0.25));
      batch.push({ color: pickOne(dotCols), pts, op: Math.round(rr(130, 210) - water * 30) });
      if (batch.length === 10 || i === nDots - 1) {
        const b = batch; batch = [];
        out.push(D(() => { for (const d of b) { washStyle(d.color, d.op); brush.polygon(d.pts); } }, bboxOf(b.flatMap((d) => d.pts), 8), 'x', rdir(), 220, 40));
      }
    }
    out.push(dBand(-15, H * 0.06, G.deep, 200, m * 0.023));
    const nRac = 5 + Math.round(dens * 6);
    for (let i = 0; i < nRac; i++) {
      const x = ((i + rr(0.2, 0.8)) / nRac) * W;
      const y0 = rr(-4, H * 0.04), L = H * rr(0.14, 0.34) * (0.8 + sc * 0.2), w = m * rr(0.04, 0.065) * sc;
      const parts = [[], [], []], nd = Math.round(L / ((4 + (1 - det) * 6) * (m / 600)));
      for (let k = 0; k < nd; k++) {
        const t = k / nd, half = (w * (1 - t * 0.75)) / 2;
        const dx = randomGaussian(0, half / 1.6), dy = y0 + t * L + rr(-1, 1);
        const r = m * rr(0.007, 0.012) * sc * (1 - t * 0.3) * bs * (1 + (1 - det) * 0.8);
        const color = random() < 0.15 ? lav[2] : (random() < 0.5 ? lav[0] : lav[1]);
        const pale = Math.abs(dx) > half * 0.6 && random() < 0.5;
        parts[Math.min(2, Math.floor(t * 3))].push({ x: x + dx, y: dy, r, color: pale ? mixHex(color, '#ffffff', 0.35) : color, rot: rr(-0.5, 0.5) });
      }
      const leaves = [];
      for (let k = 0; k < 3; k++) leaves.push({ x: x + rr(-w, w), y: y0 + rr(0, L * 0.12), r: m * 0.014 * sc, rot: rr(-1, 1), color: random() < 0.5 ? G.mid : G.deep });
      out.push(D(() => { for (const lf of leaves) { washStyle(lf.color, 230); brush.polygon(jitterEllipse(lf.x, lf.y, lf.r * 1.8, lf.r * 0.7, 8, 0.1, lf.rot)); } }, bboxOf(leaves.map((l) => [l.x, l.y]), m * 0.05), 'x', rdir(), 140, 30));
      for (const part of parts) {
        if (!part.length) continue;
        out.push(D(() => { for (const d of part) { washStyle(d.color, 235); brush.polygon(jitterEllipse(d.x, d.y, d.r * 1.3, d.r, 8, 0.15, d.rot)); } }, bboxOf(part.map((d) => [d.x, d.y]), w + 8), 'y', 1, 220, 30));
      }
    }
    const blossomPts = [], fl = [];
    for (let i = 0; i < 6 + Math.round(dens * 10); i++) {
      const y = H * rr(0.55, 0.97), x = rr(W * 0.03, W * 0.97), s = m * rr(0.018, 0.032) * sc * (0.6 + y / H) * S.flower;
      blossomPts.push([x, y, s]);
      fl.push({ y, d: dFlower(random() < 0.35 ? 'daisy' : 'blossom', x, y, s, F) });
    }
    fl.sort((a, b) => a.y - b.y);
    out.push(...fl.map((f) => f.d));
    out.push(...dTouches(blossomPts, C, Math.round(S.touch * 16), () => rr(-0.2, 0.2)));
    return out;
  }

  // Poppy field. Deliberately the wettest and largest of the scenes: the
  // playground preset already asked for water 0.7 against the 0.55 its siblings
  // share, and the drift only reads as poppies when the blooms are big enough to
  // carry a wet edge. Both are local to this scene rather than dials, so the
  // other six paintings are untouched.
  function buildPoppies(C) {
    const out = [], { density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const { washes, accents, highlights } = C;
    const F = flowerCols(C), G = foliageCols(C);
    const horizon = H * 0.38, wet = 0.72, pop = 1.35;

    // sky with two pale clouds, then the meadow in two warm-green bands
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-20, horizon + H * 0.04, washes[1], Math.round(180 - wet * 40), m * 0.033));
    out.push(dBlob(W * 0.28, H * 0.14, W * 0.26, H * 0.09, highlights[1] || '#fff6e6', 160, 0.8, 0.5, 0.1, 0.2, 520));
    out.push(dBlob(W * 0.74, H * 0.22, W * 0.2, H * 0.07, highlights[1] || '#fff6e6', 150, 0.8, 0.5, -0.1, 0.2, 460));
    out.push(dBand(horizon - H * 0.02, H * 0.7, washes[2], Math.round(190 - wet * 40), m * 0.027));
    out.push(dBand(H * 0.6, H + 20, washes[3] || washes[2], Math.round(200 - wet * 40), m * 0.027));

    // a dark tree line on the horizon, then grass that grows toward the front
    out.push(dBand(horizon - H * 0.03, horizon + H * 0.02, G.deep, Math.round(200 - wet * 30), m * 0.01));
    const nTree = 4 + Math.round(dens * 2);
    for (let i = 0; i < nTree; i++) {
      const x = ((i + rr(0.2, 0.8)) / nTree) * W, rx = W * rr(0.05, 0.11), ry = H * rr(0.04, 0.09);
      const color = random() < 0.6 ? G.shade : G.deep;
      out.push(dBlob(x, horizon - ry * 0.6, rx, ry, color, 215, 0.35 + wet * 0.3, 0.5, rr(-0.2, 0.2), 0.18, 340));
    }
    const grass = [], grassCols = [G.light, G.mid, washes[2], highlights[0], G.mid];
    for (let i = 0; i < Math.round((70 + dens * 140) * (0.3 + 0.7 * det)); i++) {
      const y = horizon + (H - horizon) * Math.pow(random(), 0.75), x = rr(-5, W + 5);
      const r = m * rr(0.003, 0.007) * sc * (0.5 + y / H) * bs * (1.5 - 0.5 * det);
      grass.push({ color: pickOne(grassCols), pts: jitterEllipse(x, y, r * rr(2.5, 4.5), r * 0.55, 8, 0.15 + soft * 0.2, rr(-0.15, 0.15)), op: Math.round(rr(110, 190) - wet * 30) });
    }
    out.push(...dMarks(grass));

    // the poppy drift: a diagonal band from upper left to lower right, bigger as
    // it comes forward. Small ones are a wet halo under a flat dab; the big ones
    // are bleeding fills with a shade dot at the centre.
    const reds = [accents[0], accents[1] || accents[0], accents[2] || accents[0]];
    const pops = [], blooms = [];
    for (let i = 0; i < Math.round((60 + dens * 120) * (0.3 + 0.7 * det)); i++) {
      const y = H * (0.4 + 0.6 * Math.pow(random(), 0.6));
      const depth = (y - horizon) / (H - horizon);           // 0 far, 1 near
      const cx = W * (0.15 + depth * 0.6);                   // the band walks right as it comes forward
      const x = random() < 0.3 ? rr(-5, W + 5) : cx + randomGaussian(0, W * 0.16);
      const r = m * rr(0.006, 0.012) * sc * (0.5 + depth * 1.4) * bs * (1.3 - 0.3 * det) * pop;
      const color = pickOne(reds), rot = rr(-0.5, 0.5);
      if (r > m * 0.018 && random() < 0.6) blooms.push({ x, y, r, color, rot });
      else {
        pops.push({ color: mixHex(color, '#ffffff', 0.3), pts: jitterEllipse(x, y, r * 2.1, r * 1.7, 9, 0.22, rot), op: Math.round(120 - wet * 40) });
        pops.push({ color, pts: jitterEllipse(x, y, r * rr(1.1, 1.5), r, 9, 0.18, rot), op: Math.round(rr(160, 210) - wet * 40) });
      }
    }
    out.push(...dMarks(pops));
    blooms.sort((a, b) => a.y - b.y);
    for (const b of blooms) {
      const pad = b.r * 2.4 + 16;
      const bb = [Math.max(0, b.x - pad), Math.max(0, b.y - pad), Math.min(W, b.x + pad), Math.min(H, b.y + pad)].map(Math.round);
      out.push(D(() => {
        softBlobDraw(b.x, b.y, b.r * 1.3, b.r, b.color, 195, 0.55, 0.65, b.rot, 0.22);
        washStyle(F.shade, 200);
        brush.polygon(jitterEllipse(b.x, b.y + b.r * 0.1, b.r * 0.3, b.r * 0.25, 8, 0.15));
      }, bb, raxis(), rdir(), 300, 60));
    }

    // a few readable poppies in front, grass stalks, light on the horizon
    const redF = { ...F, light: vivid(accents[0], S.vivid), mid: vivid(accents[1] || accents[0], S.vivid), pale: mixHex(accents[0], '#ffffff', 0.5), center: F.shade };
    for (let i = 0; i < 5 + Math.round(dens * 4); i++) {
      const y = H * rr(0.72, 0.97), x = rr(W * 0.05, W * 0.95), s = m * rr(0.03, 0.05) * sc * pop;
      out.push(dFlower('blossom', x, y, s, redF));
    }
    for (let i = 0; i < Math.round((10 + dens * 14) * (0.4 + 0.6 * det)); i++) {
      const x = rr(0, W), y0 = H + 5 - rr(0, H * 0.1), len = -H * rr(0.06, 0.2) * sc;
      out.push(dStrand(x, y0, len, rr(-8, 8) * (m / 600) * 3, random() < 0.5 ? G.deep : G.mid, rr(0.5, 0.9) * sc, 'rim'));
    }
    const glowPts = [];
    for (let i = 0; i < 10; i++) glowPts.push([rr(0, W), horizon + rr(-H * 0.02, H * 0.05), 14]);
    out.push(...dTouches(glowPts, C, Math.round(S.touch * 18), () => rr(-0.1, 0.1)));
    return out;
  }

  // Iris path at Giverny. Everything is arranged around a path that narrows to a
  // point near the top, so the blades have to keep off it or the perspective goes.
  function buildIrises(C) {
    const out = [], { water, density: dens, scale: sc, detail: det, brushSize: bs } = S;
    const { washes, accents, highlights } = C;
    const F = flowerCols(C), G = foliageCols(C);
    const topY = H * 0.28;
    const pathHalf = (y) => { const t = clamp01((H - y) / (H - topY)); return W * (0.2 - 0.15 * t); };
    const pathX = (y) => W * 0.5 + (1 - clamp01((H - y) / (H - topY))) * W * 0.02;
    const irisCols = [accents[0], accents[1] || accents[0], accents[2] || accents[0], accents[4] || accents[1] || accents[0]];
    const paleIris = accents[3] || mixHex(accents[0], '#ffffff', 0.5);

    // sky, the pale path, a warm core, meadow either side
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-20, topY + H * 0.06, washes[2], Math.round(195 - water * 40), m * 0.033));
    out.push(dBand(topY - H * 0.02, H + 20, washes[3] || washes[1], Math.round(200 - water * 40), m * 0.03));
    const trap = [];
    for (let i = 0; i <= 6; i++) { const y = H + 20 - (H + 20 - topY) * (i / 6); trap.push([pathX(y) - pathHalf(y) * rr(0.9, 1.1), y]); }
    for (let i = 6; i >= 0; i--) { const y = H + 20 - (H + 20 - topY) * (i / 6); trap.push([pathX(y) + pathHalf(y) * rr(0.9, 1.1), y]); }
    out.push(D(() => { fillStyle(washes[1], Math.round(220 - water * 40), 0.3 + water * 0.4, 0.4 + water * 0.4, 0.3); brush.polygon(trap); }, bboxOf(trap, m * 0.2), 'y', -1, 620, 100));
    out.push(dBlob(W * 0.5, H * 0.8, W * 0.12, H * 0.3, washes[0], 170, 0.6, 0.5, 0, 0.15, 480));
    out.push(dBlob(W * 0.5, topY + H * 0.04, W * 0.14, H * 0.06, highlights[1] || '#fff6e6', 160, 0.7, 0.5, 0, 0.2, 420));

    // the beds: soft green masses, then rising blades that keep off the path
    for (const side of [-1, 1]) {
      out.push(dBlob(W * (0.5 + side * 0.33), H * 0.6, W * 0.2, H * 0.22, G.mid, 195, 0.5, 0.6, side * 0.15, 0.12, 400));
      out.push(dBlob(W * (0.5 + side * 0.36), H * 0.86, W * 0.2, H * 0.16, G.deep, 190, 0.5, 0.6, 0, 0.12, 400));
      out.push(dBlob(W * (0.5 + side * 0.24), H * 0.4, W * 0.16, H * 0.1, G.light, 170, 0.6, 0.6, side * 0.3, 0.12, 340));
    }
    const tops = [];
    for (let i = 0; i < Math.round((50 + dens * 110) * (0.35 + 0.65 * det)); i++) {
      const side = i % 2 === 0 ? -1 : 1;
      const y0 = H * (0.34 + 0.7 * Math.pow(random(), 0.8));
      const near = (y0 - topY) / (H - topY);                 // 0 far, 1 near
      const x0 = pathX(y0) + side * (pathHalf(y0) + rr(4, W * 0.36 * (0.4 + 0.6 * near)));
      const len = -H * rr(0.08, 0.26) * (0.3 + near) * (0.8 + sc * 0.2);
      const sway = side * rr(-6, 14) * (m / 600) * 3;
      const color = random() < 0.2 ? G.shade : (random() < 0.5 ? G.deep : (random() < 0.7 ? G.mid : G.light));
      out.push(dStrand(x0, y0, len, sway, color, rr(0.6, 1.1) * sc * (1.5 - 0.5 * det), random() < 0.6 ? 'rim' : 'flick'));
      tops.push({ x: x0 + sway, y: y0 + len, near });
    }

    // iris heads on a subset of the blades: a tall standard over a wider fall
    const heads = [];
    const chosen = tops.slice().sort(() => random() - 0.5).slice(0, Math.round(tops.length * (0.45 + 0.2 * dens)));
    for (const h of chosen) {
      const r = m * rr(0.009, 0.015) * sc * (0.5 + h.near) * bs * (1.3 - 0.3 * det);
      const pale = random() < 0.2;
      const cs = pale ? paleIris : pickOne(irisCols), cf = pale ? mixHex(paleIris, irisCols[1], 0.4) : irisCols[2];
      heads.push({ color: vivid(cf, S.vivid), pts: jitterEllipse(h.x, h.y + r * 0.6, r * 1.5, r * 0.8, 8, 0.2, rr(-0.3, 0.3)), op: Math.round(225 - water * 30) });
      heads.push({ color: vivid(cs, S.vivid), pts: jitterEllipse(h.x, h.y - r * 0.4, r * 0.8, r * 1.4, 8, 0.18, rr(-0.3, 0.3)), op: Math.round(235 - water * 30) });
      if (det > 0.35 && r > m * 0.011) heads.push({ color: highlights[0], pts: jitterEllipse(h.x, h.y + r * 0.4, r * 0.25, r * 0.2, 6, 0.2), op: 235 });
    }
    heads.sort((a, b) => a.pts[0][1] - b.pts[0][1]);
    out.push(...dMarks(heads));

    // a few large irises in the foreground beds, then light falling down the path
    const purpleF = { ...F, light: vivid(irisCols[3], S.vivid), mid: vivid(irisCols[0], S.vivid), deep: vivid(irisCols[2], S.vivid), pale: paleIris };
    for (let i = 0; i < 6 + Math.round(dens * 4); i++) {
      const side = i % 2 === 0 ? -1 : 1, y = H * rr(0.68, 0.96);
      const x = pathX(y) + side * (pathHalf(y) + rr(W * 0.02, W * 0.26));
      const s = m * rr(0.026, 0.04) * sc, pad = s * 2.6 + 14;
      const bb = [Math.max(0, x - pad), Math.max(0, y - pad), Math.min(W, x + pad), Math.min(H, y + pad)].map(Math.round);
      out.push(D(() => {
        washStyle(purpleF.deep, 230);
        brush.polygon(jitterEllipse(x, y + s * 0.5, s * 1.1, s * 0.55, 10, 0.18));
        drawFlower('blossom', x, y - s * 0.2, s * 1.3, purpleF);
      }, bb, raxis(), rdir(), 320, 80));
    }
    const pathPts = [];
    for (let i = 0; i < 10; i++) { const y = rr(topY + 10, H * 0.95); pathPts.push([pathX(y) + rr(-pathHalf(y), pathHalf(y)) * 0.8, y, 10]); }
    out.push(...dTouches(pathPts, C, Math.round(S.touch * 18), () => HALF_PI + rr(-0.2, 0.2)));
    return out;
  }

  // Orchard in blossom. The trees are planned before anything is drawn, so the
  // trunks, the canopies and the light on top all agree about where they stand.
  function buildOrchard(C) {
    const out = [], { water, density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const { washes, accents, highlights } = C;
    const F = flowerCols(C), G = foliageCols(C);
    const horizon = H * 0.45;

    // sky with a glow upper right, then the meadow
    if (S.coverage > 0.02) out.push(dWash(washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-20, horizon + H * 0.03, washes[1], Math.round(195 - water * 40), m * 0.037));
    out.push(dBlob(W * 0.78, H * 0.16, W * 0.3, H * 0.18, highlights[1] || '#fff8ee', 150, 0.75, 0.5, 0, 0.2, 520));
    out.push(dBand(horizon - H * 0.02, H * 0.75, washes[2], Math.round(210 - water * 40), m * 0.027));
    out.push(dBand(H * 0.66, H + 20, washes[3] || washes[2], Math.round(220 - water * 40), m * 0.027));

    const nTree = 3 + Math.round(dens * 1.5), trees = [];
    for (let i = 0; i < nTree; i++) {
      const x = W * (0.05 + 0.9 * (i + rr(0.25, 0.75)) / nTree), base = H * rr(0.72, 0.9);
      const h = H * rr(0.3, 0.45) * sc, r = m * rr(0.12, 0.18) * sc * (0.7 + (base / H) * 0.4);
      trees.push({ x, base, h, r, cy: base - h * 0.85 });
    }
    trees.sort((a, b) => a.base - b.base);

    // trunks and branches, then grass
    for (const t of trees) {
      const lean = rr(-12, 12) * (m / 600) * 3;
      const trunk = [[t.x, t.base], [t.x + lean * 0.5, t.base - t.h * 0.5], [t.x + lean, t.base - t.h]];
      const tw = rr(2.2, 3.2) * bs * sc;
      out.push(D(() => { strokeStyle('rim', G.shade, tw); brush.spline(trunk, 0.4); }, bboxOf(trunk, 12 * bs), 'y', -1, 260, 40));
      for (let k = 0; k < 2 + Math.round(det * 2); k++) {
        const y0 = t.base - t.h * rr(0.55, 0.85), x0 = t.x + lean * ((t.base - y0) / t.h);
        const a = rr(-2.4, -0.7), len = t.r * rr(0.5, 0.9);
        const br = [[x0, y0], [x0 + Math.cos(a) * len * 0.5, y0 + Math.sin(a) * len * 0.5 - 4], [x0 + Math.cos(a) * len, y0 + Math.sin(a) * len]];
        const bw = rr(1, 1.6) * bs * sc;
        out.push(D(() => { strokeStyle('rim', G.shade, bw); brush.spline(br, 0.4); }, bboxOf(br, 10 * bs), raxis(), rdir(), 160, 30));
      }
    }
    const grass = [], grassCols = [G.light, G.mid, washes[2], highlights[0]];
    for (let i = 0; i < Math.round((50 + dens * 100) * (0.3 + 0.7 * det)); i++) {
      const y = horizon + (H - horizon) * Math.pow(random(), 0.75), x = rr(-5, W + 5);
      const r = m * rr(0.003, 0.007) * sc * (0.5 + y / H) * bs * (1.5 - 0.5 * det);
      grass.push({ color: pickOne(grassCols), pts: jitterEllipse(x, y, r * rr(2.5, 4.5), r * 0.55, 8, 0.15 + soft * 0.2, rr(-0.15, 0.15)), op: Math.round(rr(110, 190) - water * 30) });
    }
    out.push(...dMarks(grass));

    // blossom clouds: a soft pink mass per tree, then a dapple of petals and leaves
    const petalCols = [accents[0], accents[1] || accents[0], accents[2] || accents[0], accents[3] || '#fff1f4', accents[4] || accents[0]];
    for (const t of trees) {
      out.push(dBlob(t.x, t.cy, t.r * 1.1, t.r * 0.8, accents[0], 170, 0.65, 0.5, rr(-0.3, 0.3), 0.25, 460));
      out.push(dBlob(t.x + rr(-t.r * 0.4, t.r * 0.4), t.cy - t.r * 0.3, t.r * 0.7, t.r * 0.5, accents[3] || '#fff1f4', 160, 0.7, 0.5, rr(-0.3, 0.3), 0.25, 400));
      const dots = [];
      for (let i = 0; i < Math.round((40 + dens * 50) * (0.3 + 0.7 * det)); i++) {
        const a = rr(0, TWO_PI), d = Math.sqrt(random());
        const x = t.x + Math.cos(a) * t.r * 1.05 * d, y = t.cy + Math.sin(a) * t.r * 0.8 * d;
        const r0 = m * rr(0.005, 0.011) * sc * bs * (1.4 - 0.4 * det);
        const low = y > t.cy + t.r * 0.3;
        const color = random() < 0.25 ? G.light : (low && random() < 0.3 ? G.deep : pickOne(petalCols));
        dots.push({ color, pts: jitterEllipse(x, y, r0, r0 * rr(0.8, 1), 8, 0.15), op: Math.round(rr(170, 235) - water * 30) });
      }
      out.push(...dMarks(dots));
    }

    // readable blossoms in the nearest canopy, fallen petals, light on the tops
    const near = trees[trees.length - 1];
    for (let i = 0; i < 6 + Math.round(dens * 4); i++) {
      const a = rr(0, TWO_PI), d = Math.sqrt(random());
      const x = near.x + Math.cos(a) * near.r * 0.9 * d, y = near.cy + Math.sin(a) * near.r * 0.7 * d;
      out.push(dFlower('blossom', x, y, m * rr(0.02, 0.032) * sc, F));
    }
    const fallen = [];
    for (let i = 0; i < Math.round(20 + dens * 20); i++) {
      const x = rr(0, W), y = rr(H * 0.72, H), r = m * rr(0.003, 0.006) * sc * bs;
      fallen.push({ color: pickOne(petalCols), pts: jitterEllipse(x, y, r * 1.6, r, 6, 0.2), op: 200 });
    }
    out.push(...dMarks(fallen));
    out.push(...dTouches(trees.map((t) => [t.x, t.cy - t.r * 0.6, t.r * 0.6]), C, Math.round(S.touch * 16), () => rr(-0.3, 0.3)));
    return out;
  }

  // =====================================================================
  //  Configs. Everything the vocabulary closes over that isn't in
  //  engine.js goes in `dials` so Copy code can emit it.
  // =====================================================================
  const VOCABULARY = [
    softBlobDraw, bloomFill, bloomShape, centerDot, flowerCols, foliageCols,
    drawPeony, drawDaisy, drawBlossom, drawLily, drawFlower, drawPad, drawStrand,
    glazeDraw, flickDraw,
    dWash, dBand, dBlob, dGlaze, dStrand, dLeaves, dMarks, dFlower, dPad, dFlick, dTouches,
    buildGarden, buildDawn, buildWillow, buildWisteria,
    buildPoppies, buildIrises, buildOrchard,
  ];

  // `strokes` must name its builder literally: Copy code serialises this arrow
  // with toString(), so a captured `builder` variable would be undefined in the
  // emitted file. Each one has to resolve against VOCABULARY by name.
  const scene = (key, label, note, strokes) => ({
    key: 'impressionism-' + key,
    movement: 'Impressionism',
    label,
    note,
    canvasSize: 600,
    loopMs: 9000,
    holdMs: 1500,
    dials: S,
    palette: SCENES[key],
    strokes,
    vocabulary: VOCABULARY,
  });

  STYLES.impressionismGarden = scene('garden', 'Impressionism · Garden',
    'Warm and a little too much, in the best way.',
    (palette) => buildGarden(palette));
  STYLES.impressionismDawn = scene('dawn', 'Impressionism · Dawn',
    'Quiet, like nothing has happened yet.',
    (palette) => buildDawn(palette));
  STYLES.impressionismWillow = scene('willow', 'Impressionism · Willow',
    'Cool and wistful, the kind of quiet you don’t want to leave.',
    (palette) => buildWillow(palette));
  STYLES.impressionismWisteria = scene('wisteria', 'Impressionism · Wisteria',
    'Delicate in a way that already feels like a memory.',
    (palette) => buildWisteria(palette));
  STYLES.impressionismPoppies = scene('poppies', 'Impressionism · Poppies',
    'Red that refuses to be background.',
    (palette) => buildPoppies(palette));
  STYLES.impressionismIrises = scene('irises', 'Impressionism · Irises',
    'Purple standing at attention, politely.',
    (palette) => buildIrises(palette));
  STYLES.impressionismOrchard = scene('orchard', 'Impressionism · Orchard',
    'Light and a little giddy, spring before it’s sure of itself.',
    (palette) => buildOrchard(palette));
})();
