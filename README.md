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
global `frame`, so there is no seam for a jump to hide in. Because the hero
shape is one continuously-morphing element, several of its stage changes
(dot → pill, pill → rule, the card collapsing, the rule stretching into the
logo's line) double as shared-element transitions: the same shape doesn't
cut from one form to the next, it visibly becomes it.

The hero shape carries the same velocity-based motion blur as everything
else (`getHero` measures its own width/height delta frame-to-frame and runs
it through `getMotionBlur`) — its fast structural morphs (pill collapsing to
a rule, the rule stretching out into the logo's line) blur convincingly in
motion and land perfectly sharp the instant they're at rest; every hold
(the pill showing "OFFSCRIPT", the services card, a quiet rule) has
identical width/height frame-to-frame, so blur is structurally guaranteed
to be exactly 0 there, not just visually tuned to look that way.

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
  text (translateY within an `overflow: hidden` row, tracking tighten,
  gentle settle on exit) — never a fly-in, never a plain fade. Blur is
  velocity-based, not authored: every frame it measures how far the text
  actually moved since the previous frame (from `enter`/`enterPrev` and
  `exit`/`exitPrev`) and runs that real speed through `getMotionBlur` —
  fast movement blurs, a hold is always exactly 0px, headlines carry a
  higher `maxBlur` ceiling than small labels. Two faint trailing "ghost"
  copies (opacity ~0.04-0.13) ride along the same measured velocity to
  simulate directional blur, and disappear entirely at rest.
- `src/film/components/StatOdometer.tsx` — the three real stats as one
  persistent scrolling column (a mechanical odometer, not a counter);
  outgoing/incoming numbers scale and blur individually for a fast, fluid
  handoff.
- `src/film/components/FlipTransition.tsx` / `ScrollTransition.tsx` — the
  two newer vocabulary pieces. Flip moves rotation and translateY together
  (never rotation alone) with one controlled overshoot via `withOvershoot`;
  scroll's incoming travel follows `scrollSettle`, a fixed 5-point curve
  (fast 0-85%, one small overshoot, soft correction into a hard 0) modeled
  directly on the film's reference y-position example. Scale in both is a
  plain monotonic ease, deliberately without its own overshoot — see the
  double-overshoot fix below. Both accept an optional `progressPrev` and
  derive a light (max ~5px) velocity-based icon blur from the measured
  rotation/position delta, exactly like `MaskText`'s text blur but weaker
  and never applied while an icon's own paths are still drawing.
- `src/film/components/` — `RedDot`, `MorphingPill`, `ContentCard`,
  `CameraFrame`, `EditingTimeline`, `AnalyticsGraph`, `MorphTransition`
  (recolored for the light palette).
- `src/film/springs.ts` — the named motion language every animation reaches
  for: `OFFSCRIPT_FAST` (cards/UI), `OFFSCRIPT_SMOOTH` (typography, quiet
  holds — no bounce), `OFFSCRIPT_OVERSHOOT` (icon builds/lock-ins),
  `OFFSCRIPT_SCROLL`, `OFFSCRIPT_FLIP`, and `OFFSCRIPT_SETTLE` (camera
  pushes, the final logo — no bounce), each tuned to the spec's per-category
  damping/stiffness/mass ranges. Most sit underdamped (ratio ~0.72-0.92) for
  one small single-bounce overshoot; SMOOTH and SETTLE land at/past critical
  on purpose, for the few places a bounce would read as noise. Also exports
  `morphProgress`/`staggerProgress` (the clamped 0→1 timing driver — kept
  clamped because it also gates stage-selection and opacity logic) and two
  value-shaping helpers used on top of it: `withOvershoot` (a generic
  directionally-consistent single-overshoot curve — growth overshoots
  larger, upward motion overshoots further up, by construction) and
  `scrollSettle` (the scroll-specific 5-point settle curve), and
  `getMotionBlur` — the one place blur amount is decided anywhere in the
  film: it maps a measured per-frame velocity to a blur radius (0 at rest,
  rising toward a caller-given ceiling). Every blur value in the project
  (text, its trailing ghosts, icons in flip/scroll) is driven through it
  rather than hand-authored per moment.
- `src/film/theme.ts` — colors, font stacks, and `TIMELINE`, the single
  source of frame markers the whole film reads from.
- `scripts/synth-sfx.py` — generates the entire sound library from scratch
  (numpy sine/harmonic synthesis + FFT band-limited noise, no sampled or
  licensed audio) into `public/sfx/`. Apple is a quality reference only;
  nothing here is or resembles an actual Apple system sound.

**Sound design**: a fixed 7-sound library, each cue tied to the exact frame
of the motion event it belongs to (never one-off custom sounds per moment):
`scroll-air` / `flip-air` (broadband air that starts 2-4 frames before the
visible movement, peaks at max velocity, a subtle tonal cue right at the
overshoot, fading to silence at settle), `morph-tone` (a quiet sine wash
under blur/scale crossfades), `soft-settle` (every hero-shape settle),
`icon-lock` (one clean tonal ping per service, exactly on its
completion-overshoot frame — CREATOR included, on the same timing as every
other icon, now that its centering is deterministic), three `metric-pulse`
variants (one soft one-shot per stat — no counter-tick, no casino chime),
and `offscript-signature` (the film's one loudest, most deliberate sonic
moment: a low harmonic swell during the line's transformation, a soft
impact the instant the logo is fully visible, one clean high harmonic, then
true silence for the multi-second hold that follows). Wired into the
timeline in `OffscriptFilm.tsx`'s `SFX_CUES` list via `<Sequence from=…>`
+ `<Audio>` — no continuous music bed exists yet to duck around.

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
- CREATOR's fan-cards were still visibly off-center after that fix — a
  *different* bug: the offset math (`restX = offset*72 - 50`) centered the
  three-card cluster's bounding box at local x=0, the container's left
  edge, not its true center at width/2. Fixed by deriving every rest
  position from the container's actual center and each card's own
  half-width/height (`centerX - CARD_W/2 + offset*FAN_SPACING`, etc.) —
  deterministic geometry instead of hand-picked pixel offsets. The
  completion "lock-in" overshoot (shared by every icon via `CardFace`) also
  scales the whole cluster around that same true center.
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
- Every service-to-service label transition (flip, scroll, and morph alike)
  crossfaded the outgoing and incoming words through a wide overlapping
  opacity window (e.g. outgoing 1→0 over 0-70%, incoming 0→1 over 30-100%)
  — for roughly 40% of the transition, two different German words sat at
  full-ish opacity in the same position, reading as garbled double-exposure
  text rather than a clean swap. Fixed so the outgoing word is fully gone
  (opacity 0) by the transition's midpoint and the incoming word doesn't
  start appearing until then — never simultaneously legible — with blur
  peaking right at that midpoint crossover instead of at the endpoints.
- **The service "double-pop" bug**: the hold-state service label recomputed
  its `MaskText` `enter` value from `serviceAbsStart(stage.index)` — the
  frame its own render branch starts being used, not the frame the service
  actually began arriving. At that exact frame `enter` reads back near 0,
  even though the transition's own "incoming label" had already carried it
  to `enter=1` moments earlier — so the label visibly snapped back to its
  pre-reveal state and re-animated in a second time right as the transition
  handed off to the hold. Fixed by anchoring the hold-state label to the
  same start frame the icon build already uses (`iconBuildStart`), so the
  value is already saturated at 1 by the time the hand-off happens —
  continuous across the remount instead of resetting. (The icon itself
  never had this bug: `buildProgress` is a pure function of frame/index,
  not of which render branch is currently mounted, so it was already
  continuous across the same hand-off.)
- **Double scale-overshoot on flip/scroll service transitions**: both
  `FlipTransition`'s incoming face and `scrollIn`'s incoming layer applied
  their own `withOvershoot` bounce to `scale`, *on top of* `CardFace`'s
  content-level completion-overshoot pulse on the icon inside — two
  independent bounces on the same value at overlapping times, reading as a
  second pop. Fixed by making the container-level scale in both a plain
  monotonic ease; `CardFace` (icons) and `MaskText` (labels) are now each
  the sole owner of the one overshoot on their own content, while their
  containers only ever animate position/rotation.
- Text and icon blur used to be flat, hand-authored curves (fixed px over a
  fixed number of frames) with no way to actually go to 0 during a hold.
  Replaced with a real velocity measurement (`enter`/`enterPrev`,
  `exit`/`exitPrev` a frame apart) run through the new `getMotionBlur`, so
  blur now rises and falls with how fast something is actually moving and
  is exactly 0 the instant it stops.

A programmatic scene-change scan (`ffmpeg`'s `scene` filter) across the
full rendered video confirms the fix: only 4 frames in all 1140 register a
notable frame-to-frame change, and all 4 land exactly on legitimate
structural transitions (pill→rule, headline exit, the two stat handoffs)
— none at any service or icon boundary.

## Usage

```bash
npm install

# Live preview / editor
npm run dev

# Render a composition (id = OffscriptPromo or OffscriptFilm)
npx remotion render src/index.ts OffscriptFilm out/offscript-film.mp4

# Render a single still frame
npx remotion still src/index.ts OffscriptFilm out/frame.png --frame=500

# Regenerate the sound-design library (public/sfx/) after a timing change
python3 scripts/synth-sfx.py
```

If no system Chrome/Chromium is found automatically, pass one explicitly:

```bash
npx remotion render src/index.ts OffscriptFilm out/offscript-film.mp4 \
  --browser-executable=/path/to/chrome
```
