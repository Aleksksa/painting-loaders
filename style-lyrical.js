/* =====================================================================
 *  style-lyrical.js — Lyrical Abstraction (Kandinsky-inspired).
 *
 *  Fully non-representational, so there is no scene to lay out: the whole
 *  generator is a seeded scatter of soft colour washes and drifting curved
 *  lines with no focal point. Full-spectrum palette, medium saturation, no
 *  black. The lightest of the styles by design.
 *
 *  Same contract as the other style files: an IIFE exporting onto
 *  window.STYLES, dials named S (Copy code emits `const S = …`), palette
 *  carrying ground / seed / phrases, strokes naming its builder literally.
 * ===================================================================== */
window.STYLES = window.STYLES || {};

(function () {
  // washes / curves are counts; bleed is the wash edge softness; wiggle is the
  // amplitude of the 'curved' vector field on the lines; weight scales line width.
  // Sampler-tuned: bleed 0.7 drifts well past the ellipse while still holding a shape;
  // the 'curved' field is nearly invisible below wiggle ~3 and clearly undulates at 4.
  const S = { washes: 10, curves: 20, bleed: 0.7, texture: 0.45, wiggle: 3.5, weight: 1 };

  const PALETTE = {
    seed: 1911,
    ground: '#f7f3ea',                                                  // warm paper
    hues: Array.from({ length: 12 }, (_, i) => hslHex(i / 12, 0.55, 0.58)),  // the wheel, no dominant hue
    phrases: ['creating…', 'washing colour…', 'drawing lines…', 'drifting…', 'finished'],
  };

  // A soft ellipse of colour. Fill only, no wash base: the bleed is meant to
  // drift and let the paper through. The reveal box is padded well past the
  // polygon because high bleed spreads far beyond it.
  function dWash(x, y, rx, ry, color, rot) {
    const pts = jitterEllipse(x, y, rx, ry, 14, 0.15, rot);
    const opacity = Math.round(rr(140, 200));          // some washes ghostly, some with body
    const pad = Math.max(rx, ry) * 1.2 + 20;
    const bb = [Math.max(0, x - rx - pad), Math.max(0, y - ry - pad), Math.min(W, x + rx + pad), Math.min(H, y + ry + pad)].map(Math.round);
    return D(() => { fillStyle(color, opacity, S.bleed, S.texture, 0.3); brush.polygon(pts); }, bb, raxis(), rdir(), 480, 70);
  }

  // A flowing line: a spline over a few drifting points, bent by the 'curved'
  // field with wiggle as its amplitude, so it reads gestural rather than drawn.
  function dCurve(pts, color, weight, name) {
    const bb = bboxOf(pts, 16 + weight * 5);
    const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
    const axis = (bb[2] - bb[0]) >= (bb[3] - bb[1]) ? 'x' : 'y';
    const dir = axis === 'x' ? (Math.sign(x1 - x0) || 1) : (Math.sign(y1 - y0) || 1);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return D(() => {
      brush.field('curved'); brush.wiggle(S.wiggle);
      strokeStyle(name, color, weight * S.weight);
      brush.spline(pts, 0.5);
      brush.noField();
    }, bb, axis, dir, 200 + len, 50);
  }

  function buildLyrical(C) {
    const out = [];
    // 1. colour washes, anywhere, any size, any tilt
    for (let i = 0; i < S.washes; i++) {
      const rx = W * rr(0.08, 0.22);
      out.push(dWash(rr(0, W), rr(0, H), rx, rx * rr(0.5, 1), pickOne(C.hues), rr(0, Math.PI)));
    }
    // 2. lines that travel: each point steps on from the last at a wandering heading
    for (let i = 0; i < S.curves; i++) {
      const pts = [[rr(0, W), rr(0, H)]];
      let a = rr(0, Math.PI * 2);
      const n = 3 + Math.floor(rr(0, 3));
      for (let k = 1; k < n; k++) {
        a += rr(-Math.PI / 3, Math.PI / 3);
        const step = m * rr(0.12, 0.3);
        pts.push([pts[k - 1][0] + Math.cos(a) * step, pts[k - 1][1] + Math.sin(a) * step]);
      }
      const crisp = random() < 0.3;
      out.push(dCurve(pts, pickOne(C.hues), crisp ? rr(2, 3) : rr(2.5, 4.5), crisp ? 'pen' : 'marker'));
    }
    // 3. a few dots
    for (let i = 0; i < 4; i++) {
      const r = rr(6, 14);
      out.push(dWash(rr(W * 0.05, W * 0.95), rr(H * 0.05, H * 0.95), r, r * rr(0.8, 1), pickOne(C.hues), rr(0, Math.PI)));
    }
    return out;
  }

  STYLES.lyrical = {
    key: 'lyrical',
    movement: 'Lyrical Abstraction',
    note: 'Washes of colour drift into one another, and a few drawn lines decide where the eye comes to rest.',
    label: 'Lyrical Abstraction',
    canvasSize: 600,
    loopMs: 9000,
    holdMs: 1500,
    dials: S,
    palette: PALETTE,
    strokes: (palette) => buildLyrical(palette),
    vocabulary: [dWash, dCurve, buildLyrical],
  };
})();
