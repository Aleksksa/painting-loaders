# Painting Loaders

Loading states that paint themselves, in the manner of the movements that got there first.

Eight loaders across two movements — seven Monet scenes and a dusk abstraction. Each one is a
real painting built stroke by stroke with
[p5.brush](https://github.com/acamposuribe/p5.brush), not a video or a sprite sheet, so it is
different every time it runs and it scales to any size.

## Run it

Open `gallery.html` in a browser. That's it — no build step, no install. p5 and p5.brush come
from a CDN, so the page needs a network connection the first time.

If you'd rather serve it, any static server will do:

```
python3 -m http.server 8000
```

One caveat: the page loads `engine.js` and the style files as ordinary relative scripts, so it
needs a real page URL. Editor and IDE preview panes that inline the HTML into a `data:` URL
cannot resolve those paths — you get the layout with empty tiles and no paintings. Open the file
in a browser, or serve it, and it works.

The grid paints itself in on load and then holds the finished pictures. Hover a painting to
watch it painted again; click it to open it full screen; **Copy code** puts that loader on your
clipboard as a single standalone HTML file you can drop anywhere.

## How it fits together

| File | What it is |
| --- | --- |
| `gallery.html` | The page: layout, theme, the detail view, and the one canvas everything shares |
| `engine.js` | `createEngine(styleConfig, opts)` — the reveal loop, plus the movement-agnostic helpers |
| `style-*.js` | One movement each: its palette, its drawing vocabulary, and its stroke list |
| `copycode.js` | Assembles a style's standalone file from the live functions via `toString()` |

There is exactly **one** live canvas on the page. It gets moved into whichever tile is painting
and parks in a hidden staging div the rest of the time; every other card shows a flat still it
painted at load. That is why a grid of seven paintings costs nothing while you are not looking
at it.

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

Then add a `<script>` tag for it in `gallery.html` and one entry to the `GALLERY` array. Wrap the
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

Design tokens live in the `:root` block at the top of `gallery.html` — `--paper`, `--sunk`,
`--ink`, `--soft`, `--line`, `--accent`, plus the display type variables. Dark values sit in
`[data-theme="dark"]`. Five alternate typeface pairings are kept as a commented block right
below the tokens; swapping one in (and adding its family to the fonts link) re-voices the whole
page.
