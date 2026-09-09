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

## `OffscriptFilm` — premium light editorial brand film (38s, German)

A continuous-motion brand film in the site's own light palette (`#F5F3EF`
off-white, near-black ink, red accent used sparingly) with the real
OFFSCRIPT logo asset (used unaltered, only in the final reveal) and the
agency's real performance numbers. All copy is German, kept intentionally
short — this is a brand film, not an explainer.

Architecture is built around **one persistent hero shape** (`<MorphingPill>`,
mounted for all 1140 frames — dot → pill → thin red rule → services card →
rule → collapses → travels to the logo's exact position) plus a small set of
always-mounted `<MaskText>` blocks for every piece of copy. Nothing in the
timeline conditionally mounts/unmounts at a scene boundary: every property
(position, size, color, text-reveal) is a continuous function of a single
global `frame`, so there is no seam for a jump to hide in.

**Rhythm**: fast transition, slow hold, throughout. Structural transitions
run ~10-16 frames; readable content then holds 30-60+ frames before the
next one starts. The services section is treated as its own hero section —
each of the six gets a fixed per-slot rhythm (arrival → icon build,
concurrent with arrival, not after it → a 30-44 frame complete hold →
a shared exit/entrance transition into the next) so no icon is ever cut
away before it's fully built.

**Motion vocabulary**: five service-to-service boundaries rotate through
`flip` (`<FlipTransition>`, a restrained ~85° 3D card flip, not a 180° spin),
`scroll` (`<ScrollTransition>`, translateY + opacity + scale with the icon
and label parallaxing at different rates), and `morph` (blur/scale
crossfade) — so the section stays varied without feeling random. The final
service exits via a camera-push (scale + blur) into the stats section
instead of pairing with a "next" service.

- `src/film/OffscriptFilm.tsx` — the whole timeline: one `heroKeyframes`
  array driving the persistent shape, a `getServiceStage`/`getIconBuild`
  pair driving the services section's per-slot rhythm and transition
  pairing, plus headline / service / stat / logo layers positioned
  relative to the hero.
- `src/film/components/MaskText.tsx` — fixed-container, vertical mask-reveal
  text (translateY within an `overflow: hidden` row, blur-to-sharp, tracking
  tighten, gentle settle on exit) — never a fly-in, never a plain fade.
- `src/film/components/StatOdometer.tsx` — the three real stats as one
  persistent scrolling column (a mechanical odometer, not a counter);
  outgoing/incoming numbers scale and blur individually for a fast, fluid
  handoff.
- `src/film/components/FlipTransition.tsx` / `ScrollTransition.tsx` — the
  two newer vocabulary pieces.
- `src/film/components/` — `RedDot`, `MorphingPill`, `ContentCard`,
  `CameraFrame`, `EditingTimeline`, `AnalyticsGraph`, `MorphTransition`
  (recolored for the light palette).
- `src/film/springs.ts` — one named motion system: `premiumSpring` /
  `gentleSpring` / `cameraSpring` / `textSpring` / `flipSpring`, tuned to
  the spec's damping/stiffness targets (ratio ~1.1-1.7: snappy onset, no
  bounce), plus `morphProgress` and `staggerProgress`.
- `src/film/theme.ts` — colors, font stacks, and `TIMELINE`, the single
  source of frame markers the whole film reads from.

**Real bugs found and fixed in this pass**:
- `overflow: hidden` on a flex container with `justify-content: center`
  doesn't reliably clip oversized content — browsers apply "safe alignment"
  and let it escape instead. `MaskText` and `MorphingPill` both center
  children via absolute positioning + `transform: translate(-50%, -50%)`
  instead, which clips correctly.
- `ContentCard` used `position: absolute` with no `top`/`left`, so its
  "auto" position resolved to its hypothetical in-flow (static) position —
  for CREATOR's three stacked sibling cards, that meant each one's `translate()`
  offset was applied on top of a *different* baseline, staggering them
  instead of fanning out from one anchor. Fixed by setting `top: 0; left: 0`
  explicitly.
- BETREUUNG's label had no exit animation, so as the hero card collapsed
  and traveled toward the label's screen position (to become the stats
  rule), its fading red accent visually crossed the still-fully-opaque
  label — a garbled red/black text overlap. Fixed by tying the last
  service's label exit to the same camera-push progress as its icon.
- The icon "build" animation was originally anchored to a service's formal
  start frame (when its incoming transition's frame-window ends), not when
  the transition begins — so for a stretch, an incoming card had visibly
  finished flipping/scrolling in but hadn't started assembling yet: a blank
  card. Fixed by anchoring build to the transition's own start, so the icon
  is already assembling itself while it arrives.

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
