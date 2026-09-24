/* =====================================================================
 *  style-impressionism.js — Monet.
 *
 *  Everything here is lifted verbatim from loader.html; only the wrapper
 *  changed. The vocabulary lives inside an IIFE so later movements can
 *  reuse names like drawFlower without colliding, and reads W / H / m from
 *  engine.js at call time (never captured at load time).
 *
 *  Exports eleven sibling configs sharing one vocabulary, all of them
 *  cards in index.html. loader.html rotates the first four (garden, dawn,
 *  willow, wisteria).
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
    // The second set. The four colour lists keep their generic names; what each
    // slot means in these scenes is noted per palette.
    // koi: washes = teals / foliage = deep water and the shadow fish / accents = koi oranges / highlights = cream flecks
    koi: {
      seed: 1874, ground: '#3f7f8a',
      washes: ['#4f9aa0', '#7fc0b8', '#2f6e8a', '#a8d4c6'], foliage: ['#2a5d70', '#1f4a60', '#173a4a', '#5f9a90'],
      accents: ['#e8621e', '#f08a2a', '#c9471a', '#f6b06a'], highlights: ['#f3efc9', '#e9e6a8'],
      phrases: ['creating…', 'stirring the water…', 'swirling…', 'the koi come up…', 'finished'],
    },
    // roses: washes = lilac-grey, gold, pale blue, cream / accents = rose pinks light to deep, coral heart / highlights = gold light, white
    roses: {
      seed: 1874, ground: '#eee6dc',
      washes: ['#d9cdc9', '#e8d9a8', '#c9c2d4', '#f1e2c4'], foliage: ['#5f7a4a', '#3f5a3a', '#2f4432', '#9bb47a'],
      accents: ['#f3b4a9', '#ea8f8a', '#d96468', '#f8cfc4', '#fbe6de'], highlights: ['#f4d98a', '#fff6e6'],
      phrases: ['creating…', 'dappling the light…', 'shading the leaves…', 'opening the roses…', 'finished'],
    },
    // oranges: washes = sky blues and a pale ground / accents = the fruit, light to deep / highlights = blossom white, rind light
    oranges: {
      seed: 1874, ground: '#eef0ea',
      washes: ['#b7cfe2', '#9fbfd9', '#d7e3ea', '#c2d4b0'], foliage: ['#6f9a3f', '#3f6b2f', '#24401f', '#a9c35a'],
      accents: ['#f28c1e', '#e5731a', '#f7a23a', '#c95a12'], highlights: ['#fff6e0', '#fdf1c9'],
      phrases: ['creating…', 'clearing the sky…', 'growing the leaves…', 'ripening…', 'finished'],
    },
    // sail: washes = sky blue, lilac sea, pink glow, grey-blue ripple / foliage = hull and rowboat darks / accents = cloud peach
    sail: {
      seed: 1874, ground: '#e9e2e0',
      washes: ['#b9c3d9', '#c9b4c6', '#e6b9b0', '#8d95b3'], foliage: ['#4a4f6a', '#3a3f55', '#2c3044', '#7a7f9a'],
      accents: ['#f0b39a', '#e8a48e', '#f6cdb5', '#f9dccb'], highlights: ['#f8e6d2', '#fdf5ee'],
      phrases: ['creating…', 'washing the sky…', 'stilling the sea…', 'raising a sail…', 'finished'],
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
  function flowerCols(C, v = S.vivid) {
    const a = C.accents, h = C.highlights;
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
  //  Second set: koi, roses, oranges, sail. Same rules as the flowers above:
  //  a flat wash body under a bleeding fill for solid colour, never an
  //  outline, never brush.circle at a small radius.
  //
  //  Where the playground tuned one of these scenes away from the shared
  //  dials (wetter, more glazes, a paler rose), the builder keeps that value
  //  as a local constant, as buildPoppies does, so no other painting moves.
  // =====================================================================
  function ringPts(cx, cy, r, a0, a1, n = 10) {
    const pts = [];
    for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * (i / n); pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); }
    return pts;
  }
  // a pointed ellipse: round at the base (-rx along rot), tapering to a tip at +rx. Petals, leaves, buds.
  function petalPts(cx, cy, rx, ry, rot, n = 14, jit = 0.05) {
    const pts = [], cr = Math.cos(rot), sr = Math.sin(rot);
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TWO_PI, c = Math.cos(a), k = 1 + rr(-jit, jit);
      const px = rx * c * k, py = ry * Math.sin(a) * Math.sqrt(1 - 0.9 * c) / 1.1 * k;
      pts.push([cx + px * cr - py * sr, cy + px * sr + py * cr]);
    }
    return pts;
  }
  // a fish silhouette: blunt head toward `angle`, fullest a third of the way back, a waist, a forked tail
  function taperedBody(x, y, len, wid, angle, jit = 0.06) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const P = (t, v) => { const u = len / 2 - t * len; return [x + u * ca - v * sa, y + u * sa + v * ca]; };
    const T = [0, 0.1, 0.3, 0.5, 0.7, 0.82, 0.92, 1], HW = [0.3, 0.72, 1, 0.9, 0.62, 0.3, 0.55, 0.85];
    const top = [], bottom = [];
    for (let i = 0; i < T.length; i++) {
      const h = HW[i] * (wid / 2) * (1 + rr(-jit, jit));
      top.push(P(T[i], -h)); bottom.push(P(T[i], h));
    }
    return top.concat([P(0.88, 0)], bottom.reverse());
  }
  function drawKoi(x, y, len, angle, K) {
    const ca = Math.cos(angle), sa = Math.sin(angle);
    const off = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca];
    washStyle(K.body, 250); brush.polygon(taperedBody(x, y, len, len * 0.3, angle, 0.04));
    bloomFill(K.body, 235, 0.22); brush.polygon(taperedBody(x, y, len * 1.04, len * 0.33, angle, 0.08));
    // a deeper saddle along the back, a paler belly, cream flecks, an eye
    const [bx, by] = off(len * 0.08, -len * 0.06);
    washStyle(K.deep, 200); brush.polygon(jitterEllipse(bx, by, len * 0.28, len * 0.07, 10, 0.15, angle));
    const [px, py] = off(len * 0.05, len * 0.08);
    washStyle(K.pale, 170); brush.polygon(jitterEllipse(px, py, len * 0.26, len * 0.05, 10, 0.15, angle));
    for (let i = 0; i < 3; i++) { const [fx, fy] = off(rr(-len * 0.2, len * 0.35), rr(-len * 0.08, len * 0.08)); centerDot(fx, fy, len * rr(0.02, 0.04), K.fleck, 220); }
    const [ex, ey] = off(len * 0.4, -len * 0.04); centerDot(ex, ey, len * 0.018, K.eye, 230);
  }
  // a rose: four nested scalloped rings, the heart drifting off centre so it hints at the spiral,
  // and a few pale petal rims between the rings
  function drawRose(x, y, s, F) {
    const rings = [
      { r: 1.0, lobes: 9, inner: 0.8, col: F.light },
      { r: 0.74, lobes: 7, inner: 0.74, col: mixHex(F.light, F.mid, 0.5) },
      { r: 0.5, lobes: 6, inner: 0.7, col: F.mid },
      { r: 0.3, lobes: 5, inner: 0.66, col: F.deep },
    ];
    const dx = rr(-0.08, 0.08) * s, dy = rr(-0.06, 0.06) * s;
    // the outer ring gets a wider solid body so the bloom reads as paint, not a stain
    rings.forEach((R, i) => bloomShape(x + dx * i, y + dy * i, s * R.r, R.lobes, R.inner, R.col, 0.26 - i * 0.03, 0.8 + i * 0.02));
    if (S.detail > 0.3) {
      for (let i = 0; i < 3; i++) {
        const a = rr(0, TWO_PI), d = s * rr(0.5, 0.8);
        washStyle(F.pale, 120); brush.polygon(jitterEllipse(x + Math.cos(a) * d, y + Math.sin(a) * d, s * 0.22, s * 0.045, 8, 0.15, a + HALF_PI));
      }
    }
    centerDot(x + dx * 3, y + dy * 3, s * 0.1, mixHex(F.deep, F.shade, 0.4), 220);
  }
  // an orange: a solid disc, a shade crescent lower right, light upper left, one glint
  function drawOrange(x, y, r, O) {
    // mostly a solid wash disc: the bleed is kept low so the fruit has a rind, not a halo
    const rot = rr(0, TWO_PI);
    washStyle(O.mid, 252); brush.polygon(jitterEllipse(x, y, r * 0.94, r * 0.9, 14, 0.05, rot));
    fillStyle(O.mid, 235, 0.12 + S.water * 0.1, 0.4, 0.3); brush.polygon(jitterEllipse(x, y, r, r * 0.96, 14, 0.05, rot));
    washStyle(O.deep, 120); brush.polygon(jitterEllipse(x + r * 0.16, y + r * 0.2, r * 0.7, r * 0.6, 12, 0.08, 0.6));
    washStyle(O.light, 140); brush.polygon(jitterEllipse(x - r * 0.22, y - r * 0.26, r * 0.4, r * 0.3, 10, 0.1, 0.7));
    centerDot(x - r * 0.36, y - r * 0.4, r * 0.1, O.glint, 150);
  }

  // a reveal box of half-size r around a point, clipped to the canvas
  function boxAround(x, y, r) { return [Math.max(0, x - r), Math.max(0, y - r), Math.min(W, x + r), Math.min(H, y + r)].map(Math.round); }
  // pointed leaf dabs inside an ellipse, batched through dMarks. rotBias(x, y) gives each leaf a direction to fan along.
  function dLeafDabs(cx, cy, rx, ry, n, cols, size, rotBias = null, op = [170, 235]) {
    const marks = [];
    n = Math.max(2, Math.round(n * (0.3 + 0.7 * S.detail)));
    size *= S.brushSize * (1.4 - 0.4 * S.detail);
    for (let i = 0; i < n; i++) {
      const a = rr(0, TWO_PI), d = Math.sqrt(random());
      const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d, r = size * rr(0.6, 1.4);
      const rot = rotBias ? rotBias(x, y) + rr(-0.5, 0.5) : rr(0, TWO_PI);
      marks.push({ color: pickOne(cols), pts: petalPts(x, y, r * 2, r * 0.7, rot, 10, 0.1), op: Math.round(rr(op[0], op[1]) - S.water * 40) });
    }
    return dMarks(marks);
  }

  // Koi in swirling water. Darker, wetter and more heavily glazed than the
  // shared dials; everything turns around one bright eye upper right.
  function buildKoi(C) {
    const out = [], { density: dens, scale: sc, detail: det, brushSize: bs } = S;
    const water = 0.6, coverage = 0.9, glaze = 0.7, touch = 0.3;
    const { washes, foliage, accents, highlights } = C;
    const cx0 = W * 0.68, cy0 = H * 0.34;
    const K = { body: vivid(accents[0], S.vivid), deep: accents[2] || accents[0], pale: accents[3] || mixHex(accents[1] || accents[0], '#ffffff', 0.4), fleck: highlights[0], eye: foliage[2] };

    // the water: a lighter zone around the swirl, dark zones at the corners, a bright eye
    out.push(dWash(washes[0], Math.round(coverage * 200)));
    out.push(dBlob(cx0, cy0, W * 0.36, H * 0.3, washes[1] || washes[0], 200, 0.6, 0.5, 0.3, 0.25, 520));
    out.push(dBlob(W * 0.15, H * 0.15, W * 0.3, H * 0.28, foliage[0], 210, 0.5, 0.5, 0.4, 0.25, 460));
    out.push(dBlob(W * 0.2, H * 0.85, W * 0.34, H * 0.26, washes[2] || washes[0], 200, 0.5, 0.5, -0.3, 0.25, 460));
    out.push(dBlob(W * 0.9, H * 0.9, W * 0.2, H * 0.2, foliage[1], 190, 0.5, 0.5, 0, 0.25, 380));
    out.push(dBlob(W * 0.55, H * 0.55, W * 0.3, H * 0.14, washes[3] || washes[1] || washes[0], 150, 0.6, 0.5, -0.5, 0.25, 420));
    out.push(dBlob(cx0, cy0, W * 0.1, H * 0.08, highlights[0], 90, 0.7, 0.5, 0, 0.25, 300));

    // the swirl: marker glazes along arcs around the eye, opening out a little as
    // they go, inside first and four to a stroke; then the ripple rings at the eye
    const swirlCols = [washes[1] || washes[0], washes[3] || washes[1] || washes[0], washes[2] || washes[0], highlights[0], foliage[3] || washes[0], washes[0], highlights[1] || highlights[0]];
    const nArc = Math.round((40 + glaze * 60) * (0.5 + 0.5 * det));
    const arcs = [];
    for (let i = 0; i < nArc; i++) {
      const r = m * (0.05 + 0.62 * Math.pow(random(), 0.8)) * sc;
      const a0 = rr(0, TWO_PI), span = rr(0.4, 1.6) * (r < m * 0.15 ? 1.6 : 1);
      const pts = ringPts(cx0, cy0, r, a0, a0 + span, 9).map(([px, py], k) => { const g = 1 + k * 0.012; return [cx0 + (px - cx0) * g, cy0 + (py - cy0) * g]; });
      arcs.push({ r, pts, color: pickOne(swirlCols), w: rr(1.4, 5) * bs * (0.6 + 0.4 * sc) });
    }
    arcs.sort((a, b) => a.r - b.r);
    for (let i = 0; i < arcs.length; i += 4) {
      const b = arcs.slice(i, i + 4);
      const bb = bboxOf(b.flatMap((A) => A.pts), 14 + Math.max(...b.map((A) => A.w)) * 4);
      out.push(D(() => { for (const A of b) { brush.field('waves'); strokeStyle('marker', A.color, A.w); brush.spline(A.pts, 0.5); brush.noField(); } }, bb, raxis(), rdir(), 260, 40));
    }
    const rings = [];
    for (let k = 0; k < 4; k++) {
      const r = m * (0.03 + k * 0.03) * sc, a0 = rr(0, TWO_PI);
      const pts = ringPts(cx0 + rr(-2, 2), cy0 + rr(-2, 2), r, a0, a0 + TWO_PI * rr(0.7, 0.95), 14);
      rings.push({ pts, color: k % 2 ? (highlights[1] || highlights[0]) : highlights[0], w: rr(1.5, 2.5) * bs });
    }
    out.push(D(() => { for (const R of rings) { strokeStyle('marker', R.color, R.w); brush.spline(R.pts, 0.5); } }, bboxOf(rings.flatMap((R) => R.pts), 24), 'y', -1, 320, 60));

    // two shadow koi deep in the water, then the orange ones, each revealed tail to head
    const shadows = [{ x: W * 0.28, y: H * 0.3, len: m * 0.3 * sc, a: 0.5 }, { x: W * 0.7, y: H * 0.78, len: m * 0.26 * sc, a: -2.6 }];
    for (const s of shadows) {
      const body = taperedBody(s.x, s.y, s.len, s.len * 0.3, s.a, 0.08);
      out.push(D(() => { fillStyle(foliage[1], 130, 0.35 + water * 0.2, 0.5, 0.3); brush.polygon(body); }, bboxOf(body, s.len * 0.3 + 20), 'x', Math.sign(Math.cos(s.a)) || 1, 340, 60));
    }
    const koi = [
      { x: W * 0.6, y: H * 0.3, len: m * 0.3 * sc, a: -0.5 + rr(-0.15, 0.15) },
      { x: W * 0.3, y: H * 0.68, len: m * 0.36 * sc, a: 0.35 + rr(-0.15, 0.15) },
    ];
    if (dens > 0.75) koi.push({ x: W * 0.85, y: H * 0.65, len: m * 0.2 * sc, a: 2.4 });
    for (const k of koi) out.push(D(() => drawKoi(k.x, k.y, k.len, k.a, K), boxAround(k.x, k.y, k.len * 0.55 + 20), 'x', Math.sign(Math.cos(k.a)) || 1, 440, 100));

    // cream flecks riding the swirl, a glaze back over each tail so the fish sit in the water, light at the eye
    const flecks = [];
    for (let i = 0; i < Math.round((30 + dens * 30) * (0.4 + 0.6 * det)); i++) {
      const r = m * rr(0.06, 0.6) * sc, a = rr(0, TWO_PI), x = cx0 + Math.cos(a) * r, y = cy0 + Math.sin(a) * r;
      if (x < -5 || x > W + 5 || y < -5 || y > H + 5) continue;
      const len = m * rr(0.01, 0.03) * sc * bs, h = m * rr(0.002, 0.004) * bs;
      flecks.push({ color: random() < 0.6 ? highlights[0] : (highlights[1] || highlights[0]), pts: jitterEllipse(x, y, len, h, 8, 0.2, a + HALF_PI + rr(-0.2, 0.2)), op: Math.round(rr(150, 230)) });
    }
    out.push(...dMarks(flecks));
    for (const k of koi) {
      const tx = k.x - Math.cos(k.a) * k.len * 0.35, ty = k.y - Math.sin(k.a) * k.len * 0.35;
      const th = Math.atan2(ty - cy0, tx - cx0), r = Math.hypot(tx - cx0, ty - cy0);
      const pts = ringPts(cx0, cy0, r, th - 0.3, th + 0.3, 6), w = rr(3, 5) * bs;
      out.push(D(() => { brush.field('waves'); strokeStyle('marker', washes[1] || washes[0], w); brush.spline(pts, 0.5); brush.noField(); }, bboxOf(pts, 14 + w * 4), raxis(), rdir(), 200, 40));
    }
    const eyePts = [];
    for (let i = 0; i < 8; i++) { const a = rr(0, TWO_PI), r = m * rr(0.05, 0.4); eyePts.push([cx0 + Math.cos(a) * r, cy0 + Math.sin(a) * r, 10]); }
    out.push(...dTouches(eyePts, C, Math.round(touch * 16), () => rr(0, TWO_PI), 0.6));
    return out;
  }

  // Roses in dappled light. Painted a little larger than the shared scale and
  // less saturated than the shared vivid, so the pinks stay soft.
  function buildRoses(C) {
    const out = [], { water, density: dens, soft, detail: det, brushSize: bs } = S;
    const sc = 1.2;
    const { washes, accents, highlights } = C;
    const F = flowerCols(C, 0.25), G = foliageCols(C);
    const lilac = washes[0], gold = washes[1] || highlights[0], blue = washes[2] || lilac, cream = washes[3] || highlights[1] || highlights[0];

    // a lilac-grey ground, a gold glow upper right, a cool patch low left, the dark leaf mass upper left
    if (S.coverage > 0.02) out.push(dWash(lilac, Math.round(S.coverage * 200)));
    out.push(dBlob(W * 0.5, H * 0.6, W * 0.55, H * 0.45, lilac, 190, 0.5, 0.5, 0, 0.2, 520));
    out.push(dBlob(W * 0.78, H * 0.14, W * 0.34, H * 0.24, gold, 200, 0.6, 0.5, 0.2, 0.25, 480));
    out.push(dBlob(W * 0.85, H * 0.06, W * 0.2, H * 0.12, highlights[0], 150, 0.7, 0.5, 0, 0.25, 360));
    out.push(dBlob(W * 0.2, H * 0.85, W * 0.32, H * 0.22, blue, 160, 0.6, 0.5, 0, 0.25, 440));
    out.push(dBlob(W * 0.18, H * 0.14, W * 0.26, H * 0.2, G.shade, 215, 0.4 + water * 0.2, 0.5, 0.3, 0.25, 440));
    out.push(dBlob(W * 0.36, H * 0.08, W * 0.16, H * 0.1, G.deep, 200, 0.45, 0.5, -0.2, 0.25, 340));
    out.push(dBlob(W * 0.08, H * 0.36, W * 0.14, H * 0.12, G.deep, 190, 0.45, 0.5, 0.4, 0.25, 340));

    // the dapple, everywhere, then leaves in the dark mass and a few loose ones right of the roses
    const dapple = [];
    const dotCols = [lilac, gold, blue, cream, highlights[1] || cream, highlights[0], accents[3] || F.pale, mixHex(lilac, '#ffffff', 0.4)];
    for (let i = 0; i < Math.round((120 + dens * 160) * (0.3 + 0.7 * det)); i++) {
      const x = rr(-5, W + 5), y = rr(-5, H + 5), r = m * rr(0.008, 0.02) * sc * bs * (1.4 - 0.4 * det);
      dapple.push({ color: pickOne(dotCols), pts: jitterEllipse(x, y, r * rr(1, 1.6), r, 12, 0.1 + soft * 0.08, rr(0, TWO_PI)), op: Math.round(rr(90, 170) - water * 30) });
    }
    out.push(...dMarks(dapple));
    out.push(...dLeafDabs(W * 0.2, H * 0.16, W * 0.26, H * 0.18, Math.round(22 + dens * 24), [G.shade, G.deep, G.mid, G.light], m * 0.011 * sc, null, [130, 200]));
    out.push(...dLeafDabs(W * 0.62, H * 0.28, W * 0.14, H * 0.12, Math.round(6 + dens * 8), [G.deep, G.mid, G.light], m * 0.011 * sc, null, [130, 200]));

    // a pale bud-rose behind the group, two stems up into the leaves, then the roses back to front
    const roses = [
      { x: W * 0.32, y: H * 0.36, s: m * 0.115 * sc },
      { x: W * 0.54, y: H * 0.6, s: m * 0.15 * sc },
      { x: W * 0.28, y: H * 0.7, s: m * 0.11 * sc },
    ];
    if (dens > 0.7) roses.push({ x: W * 0.78, y: H * 0.8, s: m * 0.08 * sc });
    const bud = { x: W * 0.74, y: H * 0.5, s: m * 0.07 * sc };
    out.push(D(() => bloomShape(bud.x, bud.y, bud.s, 7, 0.76, mixHex(F.light, cream, 0.5), 0.3, 0.72), boxAround(bud.x, bud.y, bud.s * 2.2 + 16), raxis(), rdir(), 320, 80));
    const sorted = roses.slice().sort((a, b) => a.y - b.y);
    for (const r of sorted.slice(0, 2)) {
      const stem = [[r.x - r.s * 0.2, r.y - r.s * 0.95], [r.x - W * 0.06 + rr(-8, 8), r.y - r.s - H * 0.1], [r.x - W * 0.12, H * 0.2]];
      const w = rr(1.8, 2.6) * bs;
      out.push(D(() => { brush.field('hand'); strokeStyle('marker', G.deep, w); brush.spline(stem, 0.6); brush.noField(); }, bboxOf(stem, 14 + w * 4), 'y', 1, 220, 40));
    }
    for (const r of sorted) out.push(D(() => drawRose(r.x, r.y, r.s, F), boxAround(r.x, r.y, r.s * 2.2 + 16), raxis(), rdir(), 460, 100));

    // a lighter cream and gold dapple over the roses' rims, then light
    const light = [];
    for (let i = 0; i < Math.round(30 + dens * 30); i++) {
      const r0 = pickOne(roses), a = rr(0, TWO_PI), d = r0.s * rr(1.1, 1.6);
      const x = r0.x + Math.cos(a) * d, y = r0.y + Math.sin(a) * d, r = m * rr(0.006, 0.012) * sc * bs;
      light.push({ color: random() < 0.5 ? cream : (random() < 0.5 ? gold : (highlights[1] || cream)), pts: jitterEllipse(x, y, r * 1.5, r, 8, 0.2, rr(0, TWO_PI)), op: 100 });
    }
    out.push(...dMarks(light));
    out.push(...dTouches(roses.map((r) => [r.x, r.y - r.s * 0.6, r.s * 0.8]), C, Math.round(S.touch * 16), () => rr(-0.4, 0.4), 0.7));
    return out;
  }

  // An orange tree against the sky. A little drier than the shared dials so
  // the sky stays clear and the fruit keeps a rind instead of a halo.
  function buildOranges(C) {
    const out = [], { density: dens, scale: sc, detail: det, brushSize: bs } = S;
    const water = 0.45;
    const { washes, foliage, accents, highlights } = C;
    const G = foliageCols(C);
    const O = { light: vivid(accents[2] || accents[0], S.vivid), mid: vivid(accents[0], S.vivid), deep: accents[3] || accents[1] || accents[0], glint: highlights[1] || highlights[0] };
    const canopyX = W * 0.62, canopyY = H * 0.58;

    // a blue sky, brightest upper left, a pale ground behind the leaves lower right
    if (S.coverage > 0.02) out.push(dWash(washes[2] || washes[0], Math.round(S.coverage * 200)));
    out.push(dBand(-20, H * 0.45, washes[0], Math.round(200 - water * 40), m * 0.04));
    out.push(dBlob(W * 0.15, H * 0.2, W * 0.3, H * 0.28, washes[1] || washes[0], 190, 0.6, 0.5, 0.2, 0.2, 480));
    out.push(dBlob(W * 0.1, H * 0.5, W * 0.16, H * 0.2, mixHex(washes[0], highlights[0], 0.5), 150, 0.7, 0.5, 0, 0.25, 360));
    out.push(dBand(H * 0.4, H + 20, washes[3] || washes[2] || washes[0], Math.round(190 - water * 40), m * 0.04));

    // canopy masses lower right and top right, blossom specks where the sky meets the leaves
    out.push(dBlob(canopyX, canopyY, W * 0.44, H * 0.4, mixHex(G.deep, G.shade, 0.5), 235, 0.35 + water * 0.2, 0.5, 0.2, 0.25, 540));
    out.push(dBlob(W * 0.8, H * 0.14, W * 0.26, H * 0.14, G.deep, 205, 0.45, 0.5, -0.3, 0.25, 400));
    out.push(dBlob(W * 0.5, H * 0.85, W * 0.36, H * 0.16, G.shade, 215, 0.4, 0.5, 0.1, 0.25, 420));
    out.push(dBlob(W * 0.85, H * 0.62, W * 0.2, H * 0.24, G.shade, 200, 0.4, 0.5, 0, 0.25, 380));
    out.push(dBlob(W * 0.35, H * 0.42, W * 0.18, H * 0.14, G.mid, 190, 0.5, 0.5, 0.4, 0.25, 340));
    const specks = [];
    for (let i = 0; i < Math.round((24 + dens * 30) * (0.4 + 0.6 * det)); i++) {
      const x = rr(0, W * 0.55), y = rr(0, H * 0.5), r = m * rr(0.004, 0.008) * sc * bs;
      specks.push({ color: random() < 0.7 ? highlights[0] : (highlights[1] || highlights[0]), pts: jitterEllipse(x, y, r, r * rr(0.8, 1), 8, 0.2), op: Math.round(rr(170, 240)) });
    }
    out.push(...dMarks(specks));

    // the fruit is planned now so the leaf pass can fan around it
    const fruit = [
      { x: W * 0.42, y: H * 0.36, r: m * 0.09 * sc },
      { x: W * 0.8, y: H * 0.28, r: m * 0.075 * sc },
      { x: W * 0.56, y: H * 0.66, r: m * 0.085 * sc },
    ];
    if (dens > 0.4) fruit.push({ x: W * 0.1, y: H * 0.9, r: m * 0.06 * sc });
    if (dens > 0.7) fruit.push({ x: W * 0.92, y: H * 0.86, r: m * 0.055 * sc });

    // the leaf pass, fanning out from the canopy centre, then the oranges
    const leafCols = [G.shade, G.deep, G.mid, G.light, mixHex(G.mid, highlights[1] || highlights[0], 0.35), foliage[0]];
    const fan = (x, y) => Math.atan2(y - canopyY, x - canopyX);
    out.push(...dLeafDabs(canopyX, canopyY, W * 0.48, H * 0.44, Math.round(150 + dens * 150), leafCols, m * 0.013 * sc, fan, [150, 235]));
    out.push(...dLeafDabs(W * 0.8, H * 0.14, W * 0.26, H * 0.14, Math.round(26 + dens * 30), leafCols, m * 0.012 * sc, fan, [150, 235]));
    out.push(...dLeafDabs(W * 0.3, H * 0.42, W * 0.2, H * 0.14, Math.round(18 + dens * 20), [G.mid, G.light, leafCols[4]], m * 0.011 * sc, fan, [150, 235]));
    for (const f of fruit) out.push(D(() => drawOrange(f.x, f.y, f.r, O), boxAround(f.x, f.y, f.r * 1.6 + 16), 'y', 1, 380, 90));

    // small half-hidden oranges, a few leaves crossing the fruit, light on the rinds
    const small = [];
    for (let i = 0; i < 3 + Math.round(dens * 4); i++) {
      const x = rr(W * 0.2, W * 0.98), y = rr(H * 0.2, H * 0.98), r = m * rr(0.02, 0.035) * sc;
      small.push({ color: random() < 0.5 ? O.mid : O.deep, pts: jitterEllipse(x, y, r, r * 0.95, 10, 0.1), op: 215 });
    }
    out.push(...dMarks(small, 260));
    const over = [];
    for (const f of fruit) for (let k = 0; k < 2; k++) {
      const a = rr(0, TWO_PI), x = f.x + Math.cos(a) * f.r * 0.9, y = f.y + Math.sin(a) * f.r * 0.9, r = m * rr(0.012, 0.02) * sc * bs;
      over.push({ color: random() < 0.5 ? G.deep : G.mid, pts: petalPts(x, y, r * 2, r * 0.7, a + rr(-0.6, 0.6), 10, 0.1), op: 200 });
    }
    out.push(...dMarks(over));
    out.push(...dTouches(fruit.map((f) => [f.x - f.r * 0.3, f.y - f.r * 0.4, f.r * 0.5]), C, Math.round(S.touch * 14), () => rr(-0.5, 0.5), 0.6));
    return out;
  }

  // Evening sea, one sail. Wetter than the shared dials, with more still-water
  // glazes and more light on the water.
  function buildSail(C) {
    const out = [], { density: dens, scale: sc, soft, detail: det, brushSize: bs } = S;
    const water = 0.6, glaze = 0.5, touch = 0.3;
    const { washes, foliage, accents, highlights } = C;
    const horizon = H * 0.52, sunX = W * 0.56;
    const sky = washes[0], sea = washes[1], glow = washes[2] || highlights[0], ripple = washes[3] || mixHex(sea, foliage[0], 0.4);

    // sky, a warm band at the horizon, the sea in two bands, the glow's reflection
    if (S.coverage > 0.02) out.push(dWash(sky, Math.round(S.coverage * 200)));
    out.push(dBand(-20, horizon * 0.7, sky, Math.round(200 - water * 40), m * 0.033));
    out.push(dBand(horizon * 0.55, horizon + H * 0.02, glow, Math.round(190 - water * 40), m * 0.03));
    out.push(dBand(horizon - H * 0.01, H * 0.8, sea, Math.round(210 - water * 40), m * 0.017));
    out.push(dBand(H * 0.7, H + 20, mixHex(sea, ripple, 0.35), Math.round(215 - water * 40), m * 0.02));
    out.push(dBlob(sunX, horizon + H * 0.12, W * 0.2, H * 0.14, mixHex(glow, highlights[0], 0.5), 150, 0.7, 0.5, 0, 0.15, 460));

    // cumulus: a big lit cloud upper right, a low bank left, each a grey underside
    // under a peach body and a lit crown; then wisps near the horizon
    const under = mixHex(sea, foliage[2], 0.3);
    const clouds = [
      { x: W * 0.62, y: H * 0.2, rx: W * 0.2, ry: H * 0.12 },
      { x: W * 0.85, y: H * 0.32, rx: W * 0.16, ry: H * 0.07 },
      { x: W * 0.12, y: H * 0.24, rx: W * 0.17, ry: H * 0.06 },
      { x: W * 0.3, y: H * 0.4, rx: W * 0.22, ry: H * 0.045 },
    ];
    if (dens > 0.6) clouds.push({ x: W * 0.45, y: H * 0.1, rx: W * 0.1, ry: H * 0.05 });
    for (const c of clouds) {
      const peach = random() < 0.5 ? accents[0] : (accents[1] || accents[0]);
      out.push(dBlob(c.x, c.y + c.ry * 0.3, c.rx, c.ry * 0.7, under, 170, 0.5 + water * 0.2, 0.5, 0, 0.2, 380));
      out.push(dBlob(c.x, c.y, c.rx * 0.95, c.ry, peach, 215, 0.45 + water * 0.2, 0.5, rr(-0.1, 0.1), 0.25 + soft * 0.15, 420));
      out.push(dBlob(c.x - c.rx * 0.2, c.y - c.ry * 0.45, c.rx * 0.6, c.ry * 0.6, accents[2] || highlights[0], 200, 0.5, 0.5, rr(-0.2, 0.2), 0.3, 340));
    }
    for (let i = 0; i < 3; i++) {
      const x = rr(W * 0.1, W * 0.9), y = rr(horizon * 0.62, horizon * 0.92);
      out.push(dBlob(x, y, W * rr(0.08, 0.16), H * rr(0.012, 0.025), under, 120, 0.6, 0.5, 0, 0.3, 300));
    }

    // the ripples: short horizontal dashes, grey-blue with a few warm ones, longer
    // and denser toward the bottom; then still-water glazes
    const dashes = [];
    for (let i = 0; i < Math.round((90 + dens * 160) * (0.3 + 0.7 * det)); i++) {
      const y = horizon + (H - horizon) * Math.pow(random(), 0.7), near = (y - horizon) / (H - horizon), x = rr(-5, W + 5);
      const len = m * rr(0.012, 0.04) * sc * (0.5 + near) * bs, h = m * rr(0.002, 0.0035) * (0.6 + near) * bs;
      const dark = random() < 0.65;
      const color = dark ? (random() < 0.5 ? ripple : mixHex(ripple, sea, 0.4)) : (random() < 0.5 ? highlights[0] : mixHex(glow, highlights[1] || highlights[0], 0.5));
      dashes.push({ color, pts: jitterEllipse(x, y, len, h, 8, 0.2, rr(-0.06, 0.06)), op: Math.round(rr(120, 200) - water * 30) });
    }
    out.push(...dMarks(dashes));
    for (let i = 0; i < Math.round(3 + glaze * 8); i++) {
      const y = rr(horizon + 5, H), x0 = rr(-10, W * 0.5), x1 = x0 + rr(W * 0.3, W * 0.8);
      const color = random() < 0.5 ? sea : (random() < 0.5 ? ripple : glow);
      out.push(dGlaze(x0, y, x1, y + rr(-3, 3), color, rr(1.5, 3) * Math.sqrt(sc), 'waves'));
    }

    // the sail and its hull over a faint reflection, a rowboat with two specks aboard, glints down the light
    const sx = W * 0.55, sy = horizon + H * 0.1, sh = m * 0.165 * sc;
    const sailPts = [[sx, sy - sh], [sx + sh * 0.45 + rr(-2, 2), sy], [sx - sh * 0.04, sy]];
    const jib = [[sx - sh * 0.02, sy - sh * 0.7], [sx - sh * 0.3, sy - sh * 0.02], [sx - sh * 0.03, sy]];
    const hull = jitterEllipse(sx + sh * 0.05, sy + sh * 0.03, sh * 0.32, sh * 0.035, 8, 0.15);
    out.push(dBlob(sx, sy + sh * 0.5, sh * 0.35, sh * 0.5, highlights[1] || highlights[0], 110, 0.7, 0.5, 0, 0.2, 320));
    out.push(D(() => {
      washStyle(highlights[1] || highlights[0], 250); brush.polygon(sailPts); brush.polygon(jib);
      bloomFill(highlights[0], 160, 0.15); brush.polygon(sailPts);
      washStyle(foliage[1], 235); brush.polygon(hull);
    }, bboxOf([...sailPts, ...jib, ...hull], 24), 'y', -1, 440, 90));
    const bx = W * 0.38, by = horizon + H * 0.18;
    const boat = jitterEllipse(bx, by, m * 0.02 * sc, m * 0.004 * sc, 8, 0.15);
    out.push(D(() => {
      washStyle(foliage[2], 230); brush.polygon(boat);
      centerDot(bx - m * 0.005, by - m * 0.006, m * 0.004, foliage[2], 220); centerDot(bx + m * 0.006, by - m * 0.005, m * 0.0035, foliage[2], 220);
    }, bboxOf(boat, 14), 'x', rdir(), 160, 40));
    const glintPts = [];
    for (let i = 0; i < 10; i++) glintPts.push([sunX + randomGaussian(0, W * 0.1), rr(horizon + 5, H * 0.95), 12]);
    out.push(...dTouches(glintPts, C, Math.round(touch * 18), () => rr(-0.05, 0.05)));
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
    ringPts, petalPts, taperedBody, drawKoi, drawRose, drawOrange, boxAround, dLeafDabs,
    buildKoi, buildRoses, buildOranges, buildSail,
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

  STYLES.impressionismGarden = scene('garden', 'Garden',
    'Warm and a little too much, in the best way.',
    (palette) => buildGarden(palette));
  STYLES.impressionismDawn = scene('dawn', 'Dawn',
    'Quiet, like nothing has happened yet.',
    (palette) => buildDawn(palette));
  STYLES.impressionismWillow = scene('willow', 'Willow',
    'Cool and wistful, the kind of quiet you don’t want to leave.',
    (palette) => buildWillow(palette));
  STYLES.impressionismWisteria = scene('wisteria', 'Wisteria',
    'Delicate in a way that already feels like a memory.',
    (palette) => buildWisteria(palette));
  STYLES.impressionismPoppies = scene('poppies', 'Poppies',
    'Red that refuses to be background.',
    (palette) => buildPoppies(palette));
  STYLES.impressionismIrises = scene('irises', 'Irises',
    'Purple standing at attention, politely.',
    (palette) => buildIrises(palette));
  STYLES.impressionismOrchard = scene('orchard', 'Orchard',
    'Light and a little giddy, spring before it’s sure of itself.',
    (palette) => buildOrchard(palette));
  STYLES.impressionismKoi = scene('koi', 'Koi',
    'Stillness is just movement too slow to notice.',
    (palette) => buildKoi(palette));
  STYLES.impressionismRoses = scene('roses', 'Roses',
    'Everything opens at its own speed.',
    (palette) => buildRoses(palette));
  STYLES.impressionismOranges = scene('oranges', 'Oranges',
    'Ripening is just time becoming sweet.',
    (palette) => buildOranges(palette));
  STYLES.impressionismSail = scene('sail', 'Sail',
    'A boat is mostly waiting for wind.',
    (palette) => buildSail(palette));
})();
