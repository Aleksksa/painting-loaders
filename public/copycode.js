/* =====================================================================
 *  copycode.js — "Copy code" and "Copy settings", shared by index.html
 *  and playground-lyrical.html.
 *
 *  standaloneHTML(cfg) assembles a style's full standalone file from the
 *  LIVE functions (Function.prototype.toString), so what you paste out is
 *  exactly what you just watched run. Only functions are serialised, so the
 *  two non-function bindings the engine relies on (W/H/m and the
 *  scaleBrushes once-only guard) are declared in the template by hand.
 *
 *  Only the functions the style actually reaches are emitted — see
 *  reachableFrom(). A copied Willow used to carry the builders for all seven
 *  Monet scenes, half the file being paint it never applies.
 * ===================================================================== */

// Pinned, not floating: a copied file is meant to keep working untouched, and
// `@latest` would hand it a p5.brush that has moved on. These are the versions
// the gallery itself loads — keep the three in step (index.html,
// tools/render-stills.html, here), or a copy stops matching what it painted.
const CDN_TAGS =
  '  <script src="https://cdn.jsdelivr.net/npm/p5@2.3.3/lib/p5.min.js"><\/script>\n' +
  '  <script src="https://cdn.jsdelivr.net/npm/p5.brush@2.2.2"><\/script>';

// Function declarations serialise with their own name; arrow consts don't,
// so those have to be re-bound explicitly.
function emitFn(fn) {
  const src = fn.toString();
  return /^\s*(async\s+)?function\b/.test(src) ? src : `const ${fn.name} = ${src};`;
}

// The functions `seedNames` and `seedSources` reach, directly or through each
// other, in `pool` order so a const is still declared before anything runs it.
//
// Names are matched literally in the source, which is the one rule the
// vocabulary has to keep to: a function only ever reached through a name built
// at runtime (`fns[key]()`) would look unused here and be dropped.
function reachableFrom(pool, seedSources, seedNames) {
  const byName = new Map(pool.map((fn) => [fn.name, fn]));
  const kept = new Set(seedNames);
  const queue = [...seedNames];
  const scan = (src) => {
    for (const name of byName.keys()) {
      if (!kept.has(name) && new RegExp('\\b' + name + '\\b').test(src)) {
        kept.add(name);
        queue.push(name);
      }
    }
  };
  seedSources.forEach(scan);
  while (queue.length) scan(byName.get(queue.shift()).toString());
  return pool.filter((fn) => kept.has(fn.name));
}

function standaloneHTML(cfg) {
  // The emitted page calls exactly two things: createEngine, and the style's
  // own `strokes`. Everything else in the file is here because one of those
  // two leads to it.
  const pool = [...SHARED_FOR_COPY, ...cfg.vocabulary];
  const fns = reachableFrom(pool, [cfg.strokes.toString()], ['createEngine'])
    .map(emitFn).join('\n\n');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${cfg.label}</title>
  <style>
    html, body { margin: 0; min-height: 100vh; background: #f4efe6; }
    body { display: flex; align-items: center; justify-content: center;
           font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    .frame { display: flex; flex-direction: column; align-items: center; gap: 12px; }
    .sheet { padding: 8px; background: #fbf8f2;
             box-shadow: 0 12px 28px -18px rgba(47,58,72,.5), 0 1px 3px rgba(47,58,72,.08); }
    .sheet canvas { display: block; }
    #status { font-size: 13px; letter-spacing: .04em; color: #4b5b8f;
              min-height: 1.3em; transition: opacity 250ms ease; }
    #status.fade { opacity: 0; }
  </style>
  <!-- Load order matters: p5 first, then p5.brush (it registers itself as a p5 addon). -->
${CDN_TAGS}
</head>
<body>
<main class="frame">
  <div class="sheet" id="sheet"></div>
  <div id="status" aria-live="polite"></div>
</main>

<script>
// engine.js module state. Only functions are serialised below, so the two
// non-function bindings the engine relies on are declared here by hand:
// canvas dimensions (read by the vocabulary at call time) and the
// scaleBrushes once-only guard.
let W = ${cfg.canvasSize}, H = ${cfg.canvasSize}, m = ${cfg.canvasSize};
let brushScale = null;

// The dials this style was tuned with.
const S = ${JSON.stringify(cfg.dials, null, 2)};

const PALETTE = ${JSON.stringify(cfg.palette, null, 2)};

${fns}

const CONFIG = {
  label: ${JSON.stringify(cfg.label)},
  canvasSize: ${cfg.canvasSize},
  loopMs: ${cfg.loopMs},
  holdMs: ${cfg.holdMs},
  palette: PALETTE,
  strokes: ${cfg.strokes.toString()},
};

const engine = createEngine(CONFIG, {
  mount: document.getElementById('sheet'),
  statusEl: document.getElementById('status'),
});
function setup() { engine.setup(); }
function draw() { engine.draw(); }
<\/script>
</body>
</html>
`;
}

// Put text on the clipboard and flash the button. file:// is a secure context
// in Chrome so navigator.clipboard works there, but not everywhere — fall back.
async function copyText(text, btn) {
  const was = btn.textContent;
  const done = (msg) => { btn.textContent = msg; setTimeout(() => { btn.textContent = was; }, 1600); };
  try {
    await navigator.clipboard.writeText(text);
    done('Copied ✓');
  } catch (err) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    console.warn('clipboard API unavailable, used execCommand fallback:', err);
    done(ok ? 'Copied ✓' : 'Copy failed');
  }
}

function copyCode(cfg, btn) { return copyText(standaloneHTML(cfg), btn); }
