/* =====================================================================
 *  style-expressionism.js — German Expressionism (Munch, Kirchner, Marc, Macke).
 *
 *  One silhouette — Marc's blue horse — against a turbulent, colour-blocked
 *  sky and land. Few shapes; colour and stroke energy carry it. The fills
 *  are firm-edged (low bleed, high texture), and a pass of dark contour
 *  strokes over the silhouette and the sky seams is what makes it read
 *  Expressionist rather than Impressionist.
 *
 *  Same contract as style-impressionism.js: an IIFE exporting a config onto
 *  window.STYLES, reading W / H / m from engine.js at call time. The dials
 *  object is named S because the gallery's Copy code emits `const S = …`.
 *  Built-in brushes only — a style can't brush.add() without an engine change.
 * ===================================================================== */
window.STYLES = window.STYLES || {};

(function () {
  // bleed/texture are the fill handling; energy scales the slash pass; contour
  // scales outline weight; tilt is the diagonal bias (0 = horizontal, 1 = jagged).
  const S = { bleed: 0.14, texture: 0.8, energy: 0.6, contour: 1.0, tilt: 0.7 };

  const PALETTE = {
    seed: 1905,                   // Die Brücke
    ground: '#e8641c',            // cadmium orange — the placeholder tile already looks the part
    sky: ['#1f3fa8', '#2b1f6e', '#3a56c9'],     // cobalt, deep violet, lighter cobalt
    land: ['#b7d21c', '#d8351e', '#f08c1e'],    // acid yellow-green, cadmium red, orange
    figure: '#142a8c',            // the blue horse; sky leans violet so it stays the bluest thing
    contour: '#1b1233',           // near-black indigo: reads black, harmonises with the violet
    accent: '#f5e63b',            // acid yellow
    phrases: ['creating…', 'blocking the sky…', 'cutting the land…', 'drawing the outline…', 'finished'],
  };

  // =====================================================================
  //  Geometry
  // =====================================================================
  // A line broken into n segments with jitter perpendicular to its direction:
  // the seams between colour blocks, torn rather than wobbly.
  function jaggedLine(x0, y0, x1, y1, n, jit) {
    const pts = [], dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    for (let i = 0; i <= n; i++) {
      const t = i / n, j = i === 0 || i === n ? 0 : rr(-jit, jit);
      pts.push([x0 + dx * t + nx * j, y0 + dy * t + ny * j]);
    }
    return pts;
  }
  // Two seams (top, bottom) enclose a block.
  const between = (top, bottom) => top.concat(bottom.slice().reverse());

  // Marc's horse in profile, facing left. Unit coords scaled by s (roughly the
  // body length), jittered so the fills aren't geometric. Mane and tail are
  // contour-only. Returns the fill polygons and the ordered edge chains the
  // contour pass traces.
  function horse(cx, cy, s, jit) {
    const P = ([x, y]) => [cx + x * s + rr(-jit, jit) * s, cy + y * s + rr(-jit, jit) * s];
    const Q = ([x, y]) => [cx + x * s, cy + y * s];
    const body = [[-0.48, -0.14], [-0.15, -0.22], [0.2, -0.26], [0.5, -0.2], [0.55, 0.0], [0.42, 0.18], [0.0, 0.22], [-0.42, 0.16], [-0.55, 0.0]];
    // arched neck rising steeply from the withers, head hanging down-forward from the poll
    const head = [[-0.22, -0.18], [-0.36, -0.42], [-0.48, -0.62], [-0.56, -0.74],
                  [-0.53, -0.86], [-0.58, -0.76], [-0.64, -0.88], [-0.67, -0.76],          // ears
                  [-0.78, -0.62], [-0.86, -0.5], [-0.85, -0.42], [-0.76, -0.4],            // forehead, muzzle, jaw
                  [-0.66, -0.5], [-0.56, -0.3], [-0.5, -0.08]];                            // throat
    const leg = (x0, y0, x1, y1, w0, w1) => [[x0 - w0 / 2, y0], [x0 + w0 / 2, y0], [x1 + w1 / 2, y1], [x1 - w1 / 2, y1]];
    const farFront = leg(-0.28, 0.12, -0.3, 0.68, 0.1, 0.055), farRear = leg(0.46, 0.12, 0.56, 0.68, 0.12, 0.055);
    const nearFront = leg(-0.4, 0.12, -0.46, 0.72, 0.11, 0.06), nearRear = leg(0.36, 0.14, 0.46, 0.72, 0.13, 0.06);
    const fills = {
      far: [farFront.map(P), farRear.map(P)],
      body: body.map(P), head: head.map(P),
      near: [nearFront.map(P), nearRear.map(P)],
    };
    // outer edge of a leg down to the hoof and across it
    const legEdge = (l) => [l[0], l[3], l[2]].map(Q);
    const edges = {
      hero: [[-0.85, -0.42], [-0.86, -0.5], [-0.78, -0.62], [-0.67, -0.76], [-0.64, -0.88], [-0.58, -0.76], [-0.53, -0.86], [-0.56, -0.74],
             [-0.48, -0.62], [-0.36, -0.42], [-0.22, -0.18], [-0.15, -0.22], [0.2, -0.26], [0.5, -0.2], [0.55, 0.0]].map(Q),
      under: [[-0.76, -0.4], [-0.66, -0.5], [-0.56, -0.3], [-0.55, 0.0], [-0.42, 0.16], [0.0, 0.22], [0.42, 0.18], [0.55, 0.0]].map(Q),
      legs: [legEdge(nearFront), legEdge(nearRear), [farFront[3], farFront[2]].map(Q), [farRear[3], farRear[2]].map(Q)],
      tail: [[[0.55, -0.08], [0.7, 0.08], [0.74, 0.36]].map(Q), [[0.56, -0.02], [0.68, 0.2], [0.64, 0.44]].map(Q)],
      mane: [[[-0.5, -0.66], [-0.4, -0.76]], [[-0.42, -0.5], [-0.32, -0.6]], [[-0.32, -0.34], [-0.22, -0.44]]].map((l) => l.map(Q)),
      eye: [[-0.72, -0.56], [-0.7, -0.54]].map(Q),
    };
    return { fills, edges };
  }

  // =====================================================================
  //  Descriptor factories
  // =====================================================================
  // A flat wash under a low-bleed fill. Bleed fills on their own go pale and let the
  // ground through (cobalt over orange reads olive), so the wash keeps the colour
  // solid and saturated while the fill gives it a rough, firm rim.
  function dBlock(pts, color, opacity, bleed = S.bleed, dur = 600) {
    return D(() => {
      washStyle(color, 255); brush.polygon(pts);
      flushWash();                                   // wash is deferred; force it under the fill
      fillStyle(color, opacity, bleed, S.texture, 0.3); brush.polygon(pts);
    }, bboxOf(pts, m * 0.12), raxis(), rdir(), dur, 80);
  }
  // A knife-like mark: a thin polygon rotated to angle a, washed then filled, so it is
  // opaque and firm-edged rather than a translucent marker glaze. The angle is the point —
  // this is the "diagonal jitter, no vector field" stroke.
  function dSlash(x, y, len, a, color, wid) {
    const pts = jitterEllipse(x, y, len / 2, wid / 2, 10, 0.18, a);
    const dx = Math.cos(a), dy = Math.sin(a);
    const axis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y';
    const dir = axis === 'x' ? (Math.sign(dx) || 1) : (Math.sign(dy) || 1);
    return D(() => {
      washStyle(color, 245); brush.polygon(pts);
      flushWash();
      fillStyle(color, 215, 0.1, S.texture, 0.3); brush.polygon(pts);
    }, bboxOf(pts, 14), axis, dir, 140 + len * 1.2, 40);
  }
  // One contour trace along a point chain. At this scale (scaleBrushes 3) the pencil
  // brushes are stipple: `pen` is the only continuous opaque line, so it carries the
  // silhouette; `2B` at ~6 gives a dense scratchy band for the rougher strokes.
  // Curvature 0 keeps the chain angular (ears, seams); the tail sweeps pass their own.
  function dContour(pts, color, weight, name = 'pen', curv = 0) {
    const bb = bboxOf(pts, 12 + weight * 4);
    const [x0, y0] = pts[0], [x1, y1] = pts[pts.length - 1];
    const axis = (bb[2] - bb[0]) >= (bb[3] - bb[1]) ? 'x' : 'y';
    const dir = axis === 'x' ? (Math.sign(x1 - x0) || 1) : (Math.sign(y1 - y0) || 1);
    let len = 0;
    for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    return D(() => { strokeStyle(name, color, weight * S.contour); brush.spline(pts, curv); }, bb, axis, dir, 160 + len * 1.1, 60);
  }

  // =====================================================================
  //  The picture
  // =====================================================================
  function buildExpressionism(C) {
    const out = [], tilt = S.tilt, energy = S.energy;
    const jag = m * 0.02;

    // 1. ground
    out.push(D(() => { washStyle(C.ground, 255); brush.polygon([[-10, -10], [W + 10, -10], [W + 10, H + 10], [-10, H + 10]]); }, [0, 0, W, H], 'x', rdir(), 700, 120));

    // 2–3. sky and land as blocks between torn seams; the seams tilt against each other
    const top = [[-10, -10], [W + 10, -10]], bottom = [[-10, H + 10], [W + 10, H + 10]];
    const seamA = jaggedLine(-10, H * 0.42, W + 10, H * 0.28, 9, jag);   // sky / sky
    const seamB = jaggedLine(-10, H * 0.52, W + 10, H * 0.6, 9, jag);    // sky / land
    const seamC = jaggedLine(-10, H * 0.72, W + 10, H * 0.8, 8, jag);    // land / land
    out.push(dBlock(between(top, seamA), C.sky[0], 240));
    out.push(dBlock(between(seamA, seamB), C.sky[1], 235));
    // a lighter cobalt wedge cutting into the upper right
    out.push(dBlock([[W * 0.42, -10], [W + 10, -10], [W + 10, H * 0.2]].concat(jaggedLine(W + 10, H * 0.2, W * 0.42, -10, 5, jag).slice(1, -1)), C.sky[2], 210, S.bleed, 480));
    out.push(dBlock(between(seamB, seamC), C.land[0], 240));
    out.push(dBlock(between(seamC, bottom), C.land[1], 240));
    // darker orange wedge lower left
    out.push(dBlock([[-10, H * 0.8]].concat(jaggedLine(-10, H * 0.8, W * 0.46, H * 0.86, 5, jag).slice(1), [[W * 0.3, H + 10], [-10, H + 10]]), C.land[2], 225, S.bleed, 480));

    // 4. sky slashes: opposing colours over the blue, diagonal
    const skyCols = [C.land[1], C.ground, C.ground, C.sky[2], C.accent];
    const nSky = Math.round(10 + energy * 8);
    for (let i = 0; i < nSky; i++) {
      const x = rr(W * 0.02, W * 0.98), y = rr(H * 0.03, H * 0.5);
      const a = rdir() * (Math.PI / 6 + rr(0, tilt * Math.PI / 4));
      out.push(dSlash(x, y, rr(60, 150) * (0.7 + energy * 0.6), a, pickOne(skyCols), rr(8, 16)));
    }
    // 5. land slashes: blues over the green and red, steeper
    const landCols = [C.sky[1], C.sky[0], C.sky[2], C.contour];
    const nLand = Math.round(4 + energy * 4);
    for (let i = 0; i < nLand; i++) {
      const x = rr(W * 0.02, W * 0.98), y = rr(H * 0.6, H * 0.97);
      const a = rdir() * (Math.PI / 3 + rr(0, tilt * Math.PI / 6));
      out.push(dSlash(x, y, rr(50, 120) * (0.7 + energy * 0.6), a, pickOne(landCols), rr(7, 13)));
    }

    // 6. seam contours — traced before the horse so they never run across it
    const dark = C.contour;
    out.push(dContour(seamA.slice(1, -1), dark, 4.5, '2B'));
    out.push(dContour(seamB.slice(1, -1), dark, 4.5, '2B'));
    out.push(dContour(seamC.slice(1, -1), dark, 4, '2B'));

    // 7. the horse: far legs first, body over them, head last
    const hs = horse(W * 0.5, H * 0.6, m * 0.34, 0.02);
    const farCol = mixHex(C.figure, C.contour, 0.3);
    for (const l of hs.fills.far) out.push(dBlock(l, farCol, 240, 0.08, 300));
    out.push(dBlock(hs.fills.body, C.figure, 245, 0.08, 520));
    out.push(dBlock(hs.fills.head, C.figure, 245, 0.08, 420));
    for (const l of hs.fills.near) out.push(dBlock(l, C.figure, 245, 0.08, 300));

    // 8. the silhouette contour, then the expressive bits
    const E = hs.edges;
    out.push(dContour(E.hero, dark, 5.5));
    out.push(dContour(E.under, dark, 5));
    for (const l of E.legs) out.push(dContour(l, dark, 4.5));
    for (const t of E.tail) out.push(dContour(t, dark, 6.5, '2B', 0.5));
    // mane: three short jagged strokes off the crest, one descriptor
    const maneBB = bboxOf(E.mane.flat(), 24);
    out.push(D(() => { strokeStyle('2B', dark, 6 * S.contour); for (const l of E.mane) brush.line(l[0][0], l[0][1], l[1][0], l[1][1]); }, maneBB, 'x', 1, 260, 50));

    // 9. accents: an acid-yellow eye (a flat dot — pencil is too stippled this small), two sky sparks
    const eye = jitterEllipse(E.eye[0][0], E.eye[0][1], m * 0.012, m * 0.009, 10, 0.15, -0.4);
    out.push(D(() => { washStyle(C.accent, 250); brush.polygon(eye); }, bboxOf(eye, 10), 'x', 1, 160, 40));
    for (let i = 0; i < 2; i++) out.push(dSlash(rr(W * 0.1, W * 0.9), rr(H * 0.06, H * 0.3), rr(20, 40), rdir() * rr(0.4, 1.1), C.accent, rr(5, 8)));
    return out;
  }

  STYLES.expressionism = {
    key: 'expressionism',
    movement: 'Expressionism',
    note: 'Thick strokes put down fast and wet, blocked in from the sky down, then cut through with a drawn outline.',
    label: 'Expressionism',
    canvasSize: 600,
    loopMs: 9000,
    holdMs: 1500,
    dials: S,
    palette: PALETTE,
    // named literally: Copy code serialises this with toString()
    strokes: (palette) => buildExpressionism(palette),
    vocabulary: [jaggedLine, between, horse, dBlock, dSlash, dContour, buildExpressionism],
  };
})();
