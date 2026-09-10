/* =====================================================================
 *  gallery.js — the page: cards, hover replay, the full-screen view, theme
 *  and the boot overlay. Loaded with `defer` after engine.js and the styles,
 *  so p5 finds setup()/draw() on window in the usual global-mode way.
 * ===================================================================== */
// The gallery's styles, in display order. Adding a movement is one entry here
// plus its own style-*.js in the head.
const GALLERY = [
  STYLES.impressionismGarden, STYLES.impressionismDawn,
  STYLES.impressionismWillow, STYLES.impressionismWisteria,
  STYLES.impressionismOrchard, STYLES.impressionismIrises,
  STYLES.impressionismPoppies,
  STYLES.abstractionDusk,
];

// =====================================================================
//  Theme. The opening value is already on <html> (see the head script);
//  this only labels the button and handles presses.
// =====================================================================
// Lucide (ISC), inlined as path data. Five icons is not worth a script tag, and
// inlining keeps the page dependency-free apart from p5. Attributes below are
// Lucide's own defaults — 24x24 box, currentColor, stroke-width 2, round caps.
const LUCIDE = {
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>',
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>',
  copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
  'maximize-2': '<polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" x2="14" y1="3" y2="10"/><line x1="3" x2="10" y1="21" y2="14"/>',
  'chevron-left': '<path d="m15 18-6-6 6-6"/>',
};
const icon = (name, size = 16) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" ` +
  `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ` +
  `aria-hidden="true">${LUCIDE[name]}</svg>`;

// fill the placeholders sitting in the static markup
document.querySelectorAll('[data-icon]').forEach((el) => { el.outerHTML = icon(el.dataset.icon); });

// =====================================================================
//  Theme. The opening value is already on <html> (see the head script);
//  this only labels the button and handles presses.
// =====================================================================
const themeBtn = document.getElementById('theme');

function paintThemeButton() {
  const dark = document.documentElement.dataset.theme === 'dark';
  themeBtn.innerHTML = icon(dark ? 'sun' : 'moon', 18);
  themeBtn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
}
themeBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  try { localStorage.setItem('pl-theme', next); } catch (e) {}
  paintThemeButton();
});
paintThemeButton();

// =====================================================================
//  Cards. One engine and one live canvas, moved into whichever tile is
//  painting; every other card shows the flat still it painted at load.
// =====================================================================
const grid = document.getElementById('grid');
const staging = document.getElementById('staging');

const cards = GALLERY.map((cfg, i) => {
  const card = document.createElement('article');
  card.className = 'card';
  // Above the fold the still is worth fetching eagerly; below it, not.
  const load = i < 4 ? 'fetchpriority="high"' : 'loading="lazy"';
  card.innerHTML =
    `<div class="tile" tabindex="0" role="button" aria-label="Open ${cfg.label} full screen">
       <img class="still" src="stills/${cfg.key}.webp" alt="" width="560" height="560"
            decoding="async" ${load}>
     </div>
     <h2></h2>
     <div class="actions">
       <button class="btn copy" type="button">${icon('copy')}<span class="copy-label">Copy code</span></button>
       <button class="btn expand" type="button" aria-label="Open ${cfg.label} full screen">${icon('maximize-2')}</button>
     </div>`;
  card.querySelector('h2').textContent = cfg.label;
  const tile = card.querySelector('.tile');
  tile.style.setProperty('--ground', cfg.palette.ground);  // shows until this card has been painted
  // copyText() flashes textContent, so hand it the label span and leave the icon alone.
  card.querySelector('.copy').addEventListener('click', (e) =>
    copyCode(cfg, e.currentTarget.querySelector('.copy-label')));
  grid.appendChild(card);
  return {
    cfg, card, tile,
    still: card.querySelector('.still'),
    expandBtn: card.querySelector('.expand'),
  };
});

let engine = null;
let activeIndex = -1;
let detailIndex = -1;
let hoverTimer = null;

// =====================================================================
//  Hover / tap to replay
//
//  Nothing paints at load. A painting costs about ten seconds of p5.brush
//  fills — loopMs is 9000, so that is the intended speed, not a bug — and
//  eight of them in a row froze the page for a minute and a half. The
//  finished pictures are rendered ahead of time into stills/ instead (see
//  tools/render-stills.html) and the engine only runs when someone actually
//  asks to watch one being painted.
// =====================================================================
function activate(i) {
  if (!engine || detailIndex >= 0 || i === activeIndex) return;
  if (activeIndex >= 0) deactivate();
  activeIndex = i;
  const c = cards[i];
  engine.mount(c.tile);                    // layers over this card's still
  engine.switchTo(c.cfg, null);            // next draw() rebuilds from stroke 1
  loop();
}

// Snap straight back to the finished still and stop: an unhovered grid costs
// nothing, and sweeping across it never leaves a card churning.
function deactivate() {
  if (activeIndex < 0) return;
  // Hand the status line back before stopping: noLoop() doesn't cancel a frame
  // already scheduled, and that frame would write the phrase straight back in.
  engine.switchTo(null, null);
  staging.appendChild(engine.canvas);      // reveals the still underneath
  activeIndex = -1;
  noLoop();
}

cards.forEach((c, i) => {
  // a short intent delay so dragging across the grid doesn't thrash the engine
  c.tile.addEventListener('mouseenter', () => {
    clearTimeout(hoverTimer);
    hoverTimer = setTimeout(() => activate(i), 150);
  });
  c.tile.addEventListener('mouseleave', () => {
    clearTimeout(hoverTimer);
    if (activeIndex === i) deactivate();
  });
  // Clicking the painting opens it full screen — the same thing the expand
  // button does, and the only path on touch, where there is no hover.
  c.tile.addEventListener('click', () => openDetail(i));
  c.tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(i); }
  });
  c.expandBtn.addEventListener('click', () => openDetail(i));
});

// =====================================================================
//  Detail view. The same one canvas, handed to a bigger tile.
// =====================================================================
const detail = document.getElementById('detail');
const detailTile = document.getElementById('detail-tile');
const detailStatus = document.getElementById('detail-status');

function openDetail(i) {
  if (!engine || detailIndex >= 0) return;
  clearTimeout(hoverTimer);
  deactivate();
  const cfg = cards[i].cfg;
  detailIndex = i;
  // Wall-label form: the movement above, the scene below. Labels are written
  // "Movement · Scene", so split on the middot; a style with no scene keeps its
  // whole label as the title and drops the eyebrow rather than saying it twice.
  const scene = cfg.label.split('·').pop().trim();
  const eyebrow = document.getElementById('detail-movement');
  eyebrow.textContent = cfg.movement;
  eyebrow.hidden = cfg.movement === scene;
  document.getElementById('detail-label').textContent = scene;
  document.getElementById('detail-note').textContent = cfg.note || '';
  detailTile.style.setProperty('--ground', cfg.palette.ground);
  detail.hidden = false;
  document.body.style.overflow = 'hidden';
  engine.mount(detailTile);
  engine.switchTo(cfg, detailStatus);
  loop();
  document.getElementById('detail-back').focus();
}

function closeDetail() {
  if (detailIndex < 0) return;
  engine.switchTo(null, null);             // see deactivate()
  staging.appendChild(engine.canvas);
  noLoop();
  detail.hidden = true;
  document.body.style.overflow = '';
  const back = cards[detailIndex].expandBtn;
  detailIndex = -1;
  back.focus();
}

document.getElementById('detail-back').addEventListener('click', closeDetail);
document.getElementById('detail-copy').addEventListener('click', (e) => {
  if (detailIndex < 0) return;
  copyCode(cards[detailIndex].cfg, e.currentTarget.querySelector('.copy-label'));
});
window.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDetail(); });

// =====================================================================
//  Boot overlay. Waits for the web font and the first row of stills, so the
//  page never appears mid-swap between a fallback face and Newsreader. Both
//  bounds matter: a floor so it cannot flash on a warm reload, and a ceiling
//  so a slow connection never traps anyone behind it — the page is usable
//  with the images still arriving.
// =====================================================================
(function boot() {
  const el = document.getElementById('boot');
  if (!el) return;
  const MIN_MS = 400, MAX_MS = 2500;
  const started = performance.now();
  let dismissed = false;

  const ready = Promise.all([
    document.fonts ? document.fonts.ready : Promise.resolve(),
    ...[...document.querySelectorAll('.still')].slice(0, 4).map((img) =>
      (img.decode ? img.decode() : Promise.resolve()).catch(() => {})),
  ]);

  function dismiss() {
    if (dismissed) return;
    dismissed = true;
    el.classList.add('gone');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600);   // in case the transition never fires
  }

  ready.then(() => setTimeout(dismiss, Math.max(0, MIN_MS - (performance.now() - started))));
  setTimeout(dismiss, MAX_MS);
})();

// =====================================================================
function setup() {
  // The canvas waits in staging until a card is hovered or expanded. The status
  // line belongs to the detail view; the grid replays silently.
  engine = createEngine(GALLERY[0], { mount: staging });
  engine.setup();
  noLoop();
}
function draw() { engine.draw(); }
