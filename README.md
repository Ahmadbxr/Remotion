# Offscript Videos

Two Remotion/TypeScript compositions for [offscript.ch](https://offscript.ch),
a social media & content agency in Zurich. Both are 9:16 vertical, 30fps.

## `OffscriptPromo` — 9:16 light-theme reel (~29s)

A German-language promo in the site's own light brand style (cream
background, red accent, the real "offscript zh" logo), with a
camera-viewfinder motif pulled from the site's own project cards and
blurred kinetic-type transitions styled after a reference clip.

- `src/OffscriptPromo.tsx` — scene timeline, overlap-based cross-fade
  between consecutive `<Sequence>`s.
- `src/scenes/` — the eight scenes (logo, hook, positioning, showcase,
  process, platforms, individuality, outro).
- `src/components/` — `WhipIn` (blurred spring entrance), `FadeWrapper`
  (cross-fade), `GlowBackground`, `ViewfinderCard`.
- `src/theme.ts` — colors, font stack, cross-fade overlap constant.

## `OffscriptFilm` — premium light editorial brand film (35s, German)

A continuous-motion brand film in the site's own light palette (`#F5F3EF`
off-white, near-black ink, red accent used sparingly) with the real
OFFSCRIPT logo asset (used unaltered, only in the final reveal) and the
agency's real performance numbers. All copy is German, kept intentionally
short — this is a brand film, not an explainer.

Architecture is built around **one persistent hero shape** (`<MorphingPill>`,
mounted for all 1050 frames — dot → pill → thin red rule → services card →
rule → collapses → travels to the logo's exact position) plus a small set of
always-mounted `<MaskText>` blocks for every piece of copy. Nothing in the
timeline conditionally mounts/unmounts at a scene boundary: every property
(position, size, color, text-reveal) is a continuous function of a single
global `frame`, so there is no seam for a jump to hide in. Content still
changes (headline → service words → stats → logo), but always through a
fixed-size mask reveal or a shared-geometry crossfade, never a swap.

- `src/film/OffscriptFilm.tsx` — the whole timeline: one `heroKeyframes`
  array driving the persistent shape, plus headline / service / stat / logo
  layers positioned relative to it.
- `src/film/components/MaskText.tsx` — fixed-container, vertical mask-reveal
  text (translateY within an `overflow: hidden` row, blur-to-sharp, tracking
  tighten, gentle settle on exit) — never a fly-in, never a plain fade.
- `src/film/components/StatOdometer.tsx` — the three real stats as one
  persistent scrolling column (a mechanical odometer, not a counter).
- `src/film/components/` — `RedDot`, `MorphingPill`, `ContentCard`,
  `CameraFrame`, `EditingTimeline`, `AnalyticsGraph`, `MorphTransition`
  (recolored for the light palette).
- `src/film/springs.ts` — one named motion system: `premiumSpring` /
  `gentleSpring` / `cameraSpring` / `textSpring`, plus `morphProgress`
  (spring eased to land exactly at a target frame) and `staggerProgress`.
- `src/film/theme.ts` — colors, font stacks, and `TIMELINE`, the single
  source of frame markers the whole film reads from.

**A real bug worth knowing about**: `overflow: hidden` on a flex container
with `justify-content: center` doesn't reliably clip oversized content —
browsers apply "safe alignment" and let it escape instead. `MaskText` and
`MorphingPill` both center children via absolute positioning + `transform:
translate(-50%, -50%)` instead, which clips correctly.

## Usage

```bash
npm install

# Live preview / editor
npm run dev

# Render a composition (id = OffscriptPromo or OffscriptFilm)
npx remotion render src/index.ts OffscriptFilm out/offscript-film.mp4

# Render a single still frame
npx remotion still src/index.ts OffscriptFilm out/frame.png --frame=500
```

If no system Chrome/Chromium is found automatically, pass one explicitly:

```bash
npx remotion render src/index.ts OffscriptFilm out/offscript-film.mp4 \
  --browser-executable=/path/to/chrome
```
