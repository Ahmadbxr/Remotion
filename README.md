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

## `OffscriptFilm` — premium dark cinematic brand film (35s)

A continuous-motion brand film (English copy): pure black background,
white/red accent system, Apple-product-motion × creative-agency pacing.
Built as a single unbroken transformation — a dot becomes a pill becomes a
card becomes a full-bleed canvas, a red dot becomes a camera frame becomes
an editing timeline becomes a content card becomes an analytics graph,
kinetic numbers roll through view counts, and a collapsed red line draws
itself into the OFFSCRIPT wordmark. No hard scene cuts.

- `src/film/OffscriptFilm.tsx` — the six-scene timeline (Hook, Attention,
  Offscript, Process, Performance, Payoff), all driven off one global
  frame so every handoff is geometry-matched rather than cut.
- `src/film/components/` — `RedDot`, `MorphingPill`, `AnimatedTypography`
  (clip/blur/tracking word reveals), `ContentCard`, `SocialFeed`,
  `CameraFrame`, `EditingTimeline`, `AnalyticsGraph`, `MetricCounter`,
  `OffscriptLogo`, `MorphTransition` (clip-path wipe between two visuals).
- `src/film/springs.ts` — `smoothSpring` / `fastSpring` / `slowSpring`,
  `morphProgress` (spring eased to land exactly at a target frame),
  `staggerProgress`, `cameraPush`.
- `src/film/theme.ts` — colors, font stacks, and the frame-boundary map
  for all six scenes.

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
