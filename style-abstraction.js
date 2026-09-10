/* =====================================================================
 *  style-abstraction.js — Abstraction · Dusk.
 *
 *  The playground's `abstract` generator at its dusk mood: no scene, no
 *  subject. Wide soft columns of colour stained down the paper, translucent
 *  marker glazes running with them, then a crowd of tall wet drips clustered
 *  around two or three attractors, a last veil of glaze over the top and a
 *  few light touches. Everything travels vertically, which is what makes it
 *  read as poured rather than composed.
 *
 *  Ported from playground.html rather than rewritten: the build draws the
 *  same random numbers in the same order as the playground does, so at seed
 *  1874 this is the picture the mood was picked from. The one thing that
 *  cannot carry over is per-stroke brush grain — the engine reseeds before
 *  each stroke so it can redraw them independently — so the shapes, colours
 *  and paint order match while the wet texture inside them differs.
 *
 *  Same contract as the other style files: an IIFE exporting onto
 *  window.STYLES, dials named S (Copy code emits `const S = …`), palette
 *  carrying ground / seed / phrases, strokes naming its builder literally.
 * ===================================================================== */
window.STYLES = window.STYLES || {};

(function () {
  // The dusk preset's dials, baked in. pattern picks the mark shape and flow
  // the direction everything runs; the rest are the playground's sliders.
  // detail and brushSize come from the playground's MARK_DEFAULTS, which the
  // abstract moods inherit rather than set.
  const S = {
    pattern: 'drips', flow: 'vertical',
    water: 0.7, coverage: 0.5, density: 0.35, scale: 1, soft: 0.6, glaze: 0.4, touch: 0.2,
    detail: 0.6, brushSize: 1,
  };

  const PALETTE = {
    seed: 1874,
    ground: '#f4ece6',                                            // warm paper, barely tinted
    washes: ['#8f7fa8', '#c68aa0', '#e6b39a', '#f0cfa0'],          // violet → rose → apricot → sand
    accents: ['#6d5c8a', '#e28f8f', '#d9a56b'],                    // the drips
    highlights: ['#f9dc9c', '#fff3e0'],                            // the last touches
    phrases: ['creating…', 'washing…', 'flowing…', 'blooming…', 'finished'],
  };

  // =====================================================================
  //  Geometry
  // =====================================================================
  // The vertical twin of engine.js's bandPolygon: a column between x0 and x1,
  // both edges wobbling, run off the top and bottom of the canvas.
  function columnPolygon(x0, x1, wobble, n = 9) {
    const left = [], right = [];
    for (let i = 0; i <= n; i++) {
      const y = -20 + (H + 40) * (i / n);
      left.push([x0 + rr(-wobble, wobble), y]);
      right.push([x1 + rr(-wobble, wobble), y]);
    }
    return left.concat(right.reverse());
  }

  // The playground scheduled every stroke on a 0..1 timeline and painted them
  // in t order; the engine paints them in array order. Keeping the schedule and
  // sorting on it at the end reproduces the playground's paint order — which
  // marks land on top of which — and, because it draws its random numbers in
  // the same places, everything built after it.
  function schedule(items, t0, t1, jitter = 0.3) {
    const step = (t1 - t0) / Math.max(items.length, 1);
    items.forEach((it, i) => { it.t = t0 + step * (i + 0.5) + rr(-jitter, jitter) * step; });
    return items;
  }

  // =====================================================================
  //  Drawing vocabulary
  // =====================================================================
  function glazeDraw(x0, y0, x1, y1, color, weight, field = 'hand') {
    brush.field(field); strokeStyle('marker', color, weight * S.brushSize);
    brush.line(x0, y0, x1, y1); brush.noField();
  }
  function flickDraw(x, y, len, a, color, weight) {
    strokeStyle('flick', color, weight * S.brushSize);
    brush.line(x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2, x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2);
  }

  // =====================================================================
  //  Descriptor factories
  //
  //  Nothing here calls raxis() / rdir(): the flow already says which way the
  //  paint travels, and drawing extra random numbers would move every shape
  //  built after it off the composition this mood was picked at.
  // =====================================================================
  const flowAxis = () => (S.flow === 'horizontal' ? 'x' : 'y');
  const longAxis = (bb) => ((bb[2] - bb[0]) >= (bb[3] - bb[1]) ? 'x' : 'y');

  function dWash(color, opacity) {
    const pts = [[-20, -20], [W + 20, -20], [W + 20, H + 20], [-20, H + 20]];
    return D(() => { washStyle(color, opacity); brush.polygon(pts); }, [0, 0, W, H], flowAxis(), 1, 700, 120);
  }
  // One of the wide stained columns (or bands, or pools) the picture is built on.
  function dGround(pts, color, opacity, bleed, texture) {
    return D(() => { fillStyle(color, opacity, bleed, texture, 0.3); brush.polygon(pts); },
             bboxOf(pts, m * 0.25), flowAxis(), 1, 520, 90);
  }
  function dGlaze(x0, y0, x1, y1, color, weight, field) {
    const bb = bboxOf([[x0, y0], [x1, y1]], 14 + weight * 4 * S.brushSize);
    const axis = Math.abs(x1 - x0) >= Math.abs(y1 - y0) ? 'x' : 'y';
    const dir = axis === 'x' ? (Math.sign(x1 - x0) || 1) : (Math.sign(y1 - y0) || 1);
    const len = Math.hypot(x1 - x0, y1 - y0);
    return D(() => glazeDraw(x0, y0, x1, y1, color, weight, field), bb, axis, dir, 90 + len * 0.45, 45);
  }
  // A mark: at this water the bleed drifts well past the polygon, so the reveal
  // box is padded generously — the buffer holds only this stroke, so an
  // oversized box copies nothing but transparency. Drips are revealed downwards
  // whatever their shape, so each one runs rather than appearing.
  function dMark(pts, color, opacity, bleed, texture) {
    const bb = bboxOf(pts, m * 0.08 + 14);
    const axis = S.pattern === 'drips' ? 'y' : longAxis(bb);
    const extent = axis === 'x' ? bb[2] - bb[0] : bb[3] - bb[1];
    return D(() => { fillStyle(color, opacity, bleed, texture, 0.3); brush.polygon(pts); },
             bb, axis, 1, 180 + extent * 0.9, 70);
  }
  function dFlick(x, y, len, a, color, weight) {
    const ends = [[x - Math.cos(a) * len / 2, y - Math.sin(a) * len / 2], [x + Math.cos(a) * len / 2, y + Math.sin(a) * len / 2]];
    const axis = Math.abs(Math.cos(a)) >= Math.abs(Math.sin(a)) ? 'x' : 'y';
    return D(() => flickDraw(x, y, len, a, color, weight), bboxOf(ends, 10 + weight * 5), axis, 1, 90, 25);
  }
  // Small light strokes dropped near the marks already placed.
  function dTouches(points, C, count, angleFn, sizeMul = 1) {
    const items = [];
    count = Math.round(count * (0.4 + 0.6 * S.detail));
    for (let i = 0; i < count; i++) {
      const p = points.length ? pickOne(points) : [rr(0, W), rr(0, H), 20];
      const x = p[0] + rr(-p[2], p[2]), y = p[1] + rr(-p[2] * 0.6, p[2] * 0.6);
      const color = random() < 0.85 ? pickOne(C.highlights) : pickOne(C.accents);
      const len = rr(8, 22) * S.scale * sizeMul, weight = rr(0.6, 1.1) * S.scale;
      items.push(dFlick(x, y, len, angleFn(), color, weight));
    }
    return items;
  }

  // =====================================================================
  //  The picture
  // =====================================================================
  function buildAbstraction(C) {
    const out = [];
    const group = (items, t0, t1) => { schedule(items, t0, t1); out.push(...items); };
    const { water, density: dens, scale: sc, soft } = S;
    const { washes, accents, highlights } = C;
    const horizontal = S.flow === 'horizontal', vertical = S.flow === 'vertical';

    // 1. the coverage wash, flat, under everything
    if (S.coverage > 0.02) {
      const w = dWash(washes[0], Math.round(S.coverage * 200));
      w.t = 0.02;
      out.push(w);
    }

    // 2. the ground: a few wide stains, one per wash colour, overlapping
    const nGround = 2 + Math.round(dens * 2);
    const ground = [];
    for (let i = 0; i < nGround; i++) {
      const color = washes[i % washes.length];
      const opacity = Math.round(225 - water * 80);
      const bleed = 0.25 + water * 0.55, texture = 0.3 + water * 0.5;
      let pts;
      if (horizontal) { const y0 = -20 + (i / nGround) * H + rr(-30, 30), h = H / nGround * rr(1.2, 1.8); pts = bandPolygon(y0, y0 + h, 14 + soft * 20); }
      else if (vertical) { const x0 = -20 + (i / nGround) * W + rr(-30, 30), w = W / nGround * rr(1.2, 1.8); pts = columnPolygon(x0, x0 + w, 14 + soft * 20); }
      else pts = jitterEllipse(rr(W * 0.2, W * 0.8), rr(H * 0.2, H * 0.8), W * rr(0.35, 0.6), H * rr(0.25, 0.45), 14, 0.1 + soft * 0.25, rr(-0.6, 0.6));
      ground.push(dGround(pts, color, opacity, bleed, texture));
    }
    group(ground, 0.03, 0.16);

    // 3. glazes travelling with the flow. A quarter of them are held back as a
    //    veil and laid over the marks at the end instead.
    const glazes = [];
    for (let i = 0; i < Math.round(S.glaze * 22); i++) {
      const color = random() < 0.7 ? pickOne(washes) : pickOne(accents);
      const weight = rr(1.2, 3.2) * Math.sqrt(sc);
      let x0, y0, x1, y1, field;
      if (horizontal) { y0 = rr(0, H); x0 = rr(-10, W * 0.5); x1 = x0 + rr(W * 0.3, W * 0.9); y1 = y0 + rr(-8, 8); field = random() < 0.25 ? 'waves' : 'hand'; }
      else if (vertical) { x0 = rr(0, W); y0 = rr(-10, H * 0.5); y1 = y0 + rr(H * 0.25, H * 0.8); x1 = x0 + rr(-8, 8); field = 'hand'; }
      else { x0 = rr(0, W); y0 = rr(0, H); const a = rr(-0.6, 0.6), len = rr(m * 0.2, m * 0.5); x1 = x0 + Math.cos(a) * len; y1 = y0 + Math.sin(a) * len; field = random() < 0.5 ? 'curved' : 'seabed'; }
      glazes.push(dGlaze(x0, y0, x1, y1, color, weight, field));
    }
    const veil = glazes.splice(0, Math.round(glazes.length * 0.25));
    group(glazes, 0.16, 0.30);

    // 4. the marks. Most fall near two or three attractors, which is what gives
    //    the picture its clusters and its empty right-hand side; the rest are
    //    scattered anywhere. Painted biggest first so the small ones sit on top.
    const nMarks = Math.round((3 + dens * 34) * (S.pattern === 'dapple' ? 1.6 : 1));
    const attractors = [];
    for (let i = 0, n = 2 + Math.floor(rr(0, 3)); i < n; i++) attractors.push([rr(W * 0.15, W * 0.85), rr(H * 0.15, H * 0.85)]);
    const s0 = m * 0.06 * sc;
    const marks = [], centers = [];
    for (let i = 0; i < nMarks; i++) {
      let x, y;
      if (random() < 0.25) { x = rr(0, W); y = rr(0, H); }
      else { const a = pickOne(attractors); const sd = m * (S.pattern === 'dapple' ? 0.1 : 0.16); x = a[0] + randomGaussian(0, sd); y = a[1] + randomGaussian(0, sd); }
      const r = s0 * rr(0.5, 1.6);
      const color = random() < 0.2 ? pickOne(highlights) : pickOne(accents);
      const jit = 0.08 + soft * 0.3;
      let pts, opacity, bleed, texture;
      switch (S.pattern) {
        case 'bands': pts = jitterEllipse(x, y, r * rr(2.5, 4.5), r * rr(0.25, 0.5), 14, jit * 0.6); opacity = 205 - water * 60; bleed = 0.3 + water * 0.5; texture = 0.4 + water * 0.4; break;
        case 'petals': pts = jitterEllipse(x, y, r * rr(0.7, 1.1), r * rr(0.28, 0.45), 10, jit * 0.5, rr(0, TWO_PI)); opacity = 225 - water * 45; bleed = 0.12 + water * 0.3; texture = 0.3 + water * 0.3; break;
        case 'drips': pts = jitterEllipse(x, y, r * rr(0.3, 0.5), r * rr(2, 4), 14, jit * 0.7); opacity = 200 - water * 60; bleed = 0.4 + water * 0.4; texture = 0.4 + water * 0.4; break;
        case 'dapple': pts = jitterEllipse(x, y, r * 0.45, r * rr(0.35, 0.45), 10, jit); opacity = 200 - water * 40; bleed = 0.2 + water * 0.3; texture = 0.3 + water * 0.3; break;
        default: pts = jitterEllipse(x, y, r, r * rr(0.6, 1), 12, jit); opacity = 200 - water * 60; bleed = 0.3 + water * 0.5; texture = 0.4 + water * 0.4;
      }
      centers.push([x, y, r]);
      const d = dMark(pts, color, Math.round(opacity), bleed, texture);
      d.r = r;
      marks.push(d);
    }
    marks.sort((a, b) => b.r - a.r);
    group(marks, 0.30, 0.86);

    // 5. the held-back glazes over the top, then the touches
    group(veil, 0.86, 0.92);
    const angle = () => (horizontal ? rr(-0.1, 0.1) : vertical ? HALF_PI + rr(-0.15, 0.15) : rr(0, TWO_PI));
    group(dTouches(centers, C, Math.round(S.touch * 20), angle), 0.92, 1.0);

    // the engine paints in array order; t is the playground's paint order
    return out.sort((a, b) => a.t - b.t);
  }

  STYLES.abstractionDusk = {
    key: 'abstraction-dusk',
    movement: 'Abstraction',
    note: 'The hour when color stops trying to be anything specific.',
    label: 'Abstraction · Dusk',
    canvasSize: 600,
    loopMs: 9000,
    holdMs: 1500,
    dials: S,
    palette: PALETTE,
    strokes: (palette) => buildAbstraction(palette),
    vocabulary: [columnPolygon, schedule, glazeDraw, flickDraw, flowAxis, longAxis,
                 dWash, dGround, dGlaze, dMark, dFlick, dTouches, buildAbstraction],
  };
})();
