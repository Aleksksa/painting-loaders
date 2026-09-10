# Painting Loaders

Loading states that paint themselves, in the manner of the movements that got there first.

Eight loaders across two movements — seven Monet scenes and a dusk abstraction. Each one is a
real painting built stroke by stroke with
[p5.brush](https://github.com/acamposuribe/p5.brush), not a video or a sprite sheet, so it is
different every time it runs and it scales to any size.

## Run it

Open `public/index.html` in a browser. That's it — no build step, no install. p5 and p5.brush come
from a CDN, so the page needs a network connection the first time.

If you'd rather serve it, any static server will do:

```
python3 -m http.server 8000
```

## Deploy it

The site is static, so Cloudflare Workers serves it with no build step and no Worker script —
`wrangler.jsonc` points the asset uploader at `public/`, and `public/index.html` answers `/`.

That directory exists for exactly this reason. Wrangler's only built-in ignores are
`.assetsignore`, `_redirects` and `_headers`, so uploading the repo root would publish `.git`
along with the site unless an ignore file caught it. A directory holding nothing but the site
cannot leak by omission.

```
npx wrangler deploy
```

Connecting the repo in the Cloudflare dashboard does the same thing on every push: leave the
build command empty and keep `npx wrangler deploy` as the deploy command.

`name` in `wrangler.jsonc` has to match the Worker it belongs to. Dashboard builds deploy to the
connected Worker whatever the file says, but a local `wrangler deploy` believes the file — a name
that matches nothing uploads a second Worker at its own URL and leaves the real site untouched.

One caveat: the page loads `engine.js` and the style files as ordinary relative scripts, so it
needs a real page URL. Editor and IDE preview panes that inline the HTML into a `data:` URL
cannot resolve those paths — you get the layout with empty tiles and no paintings. Open the file
in a browser, or serve it, and it works.

The grid shows the finished pictures immediately. Hover a painting to watch it painted again;
click it to open it full screen; **Copy code** puts that loader on your clipboard as a single
standalone HTML file you can drop anywhere.

Full screen, the arrows on either edge — or the left and right arrow keys — move to the next
painting and wrap around at both ends, so the whole gallery can be watched without going back to
the grid. `Esc` returns to it.

## How it fits together

| File | What it is |
| --- | --- |
| `public/` | The site — everything here, and nothing else, is what gets deployed |
| `public/index.html` | The page itself: markup, design tokens, layout |
| `public/gallery.js` | Cards, hover replay, the full-screen view, theme, the boot overlay |
| `public/engine.js` | `createEngine(styleConfig, opts)` — the reveal loop, plus the movement-agnostic helpers |
| `public/style-*.js` | One movement each: its palette, its drawing vocabulary, and its stroke list |
| `public/copycode.js` | Assembles a style's standalone file from the live functions via `toString()` |
| `public/favicon.svg` | The painted bloom, also drawn in CSS as the boot overlay's loader |
| `public/stills/*.webp` | The finished pictures, rendered ahead of time — what the grid shows at rest |
| `wrangler.jsonc` | Cloudflare Workers config — assets only, no Worker script |
| `tools/` | Re-render the stills; see below |

There is exactly **one** live canvas on the page. It gets moved into whichever tile is painting
and parks in a hidden staging div the rest of the time.

**Nothing paints at load.** A painting costs about ten seconds of p5.brush fills — `loopMs` is
9000, so that is the intended speed, not a bug — and computing eight of them up front froze the
page for a minute and a half. The finished pictures ship as WebP instead (276 KB for all eight),
and the engine only runs when someone asks to watch one being painted. Every scene uses a fixed
seed, so a shipped still is the same picture a live repaint produces.

## Rendering the stills

Any time a style's strokes, palette or dials change, its still is stale and has to be re-rendered:

```
python3 tools/serve.py
```

then open `http://localhost:8000/tools/render-stills.html` and press **Render all**. It paints
every style and writes `public/stills/<key>.webp` back into the repo through the server's `PUT`
handler (which only ever accepts `.webp` under `public/stills/`). It takes about 90 seconds — one full painting
per style, by definition.

Two things that will waste your afternoon otherwise:

- **Keep the tab in the foreground.** A backgrounded tab is throttled to zero frames and the
  render silently stops making progress.
- **Headless is not a shortcut.** Under SwiftShader a single 600px still takes minutes and a
  dense scene can hang outright.

GPU rasterisation is not bit-exact, so re-rendering rewrites all eight files even when nothing
changed. The pictures are identical; the bytes are not. Commit only the ones you meant to change.

### Adding a movement

Write a `style-<movement>.js` that exports a config onto `window.STYLES`:

```js
STYLES.myMovement = {
  key: 'my-movement',
  movement: 'My Movement',
  label: 'My Movement · Scene',
  note: 'One line about how it paints, for the full-screen view.',
  canvasSize: 600,
  loopMs: 9000,
  holdMs: 1500,
  dials: S,                                  // must be named S — Copy code emits it by that name
  palette: PALETTE,                          // { ground, seed, phrases, ...whatever your strokes want }
  strokes: (palette) => buildMyMovement(palette),   // name the builder literally, not via a variable
  vocabulary: [/* every function Copy code needs to serialise */],
};
```

Then add a `<script>` tag for it in `public/index.html` and one entry to the `GALLERY` array. Wrap the
file in an IIFE so movements can reuse names like `drawFlower` without colliding.

Three rules the Copy code assembler imposes, all of which fail loudly if broken:

- **Only functions are serialised.** Any non-function top-level binding the engine needs is
  written out by hand in `copycode.js`'s template.
- **The dials object must be called `S`.** The emitted file declares `const S = …` and the
  vocabulary references it by that name.
- **`strokes` must name its builder literally.** `toString()` cannot see through a captured
  variable, so `(palette) => builder(palette)` would be undefined in the copied file.

Every style on one page must share `canvasSize`, because p5.brush's `scaleBrushes()` multiplies
the shared brush registry in place and is therefore once-per-page.

## Theming

Design tokens live in the `:root` block at the top of `public/index.html` — `--paper`, `--sunk`,
`--ink`, `--soft`, `--line`, `--accent`, plus the display type variables. Dark values sit in
`[data-theme="dark"]`. Five alternate typeface pairings are kept as a commented block right
below the tokens; swapping one in (and adding its family to the fonts link) re-voices the whole
page.
