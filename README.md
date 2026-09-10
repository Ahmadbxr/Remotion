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

## `OffscriptFilm` — premium light editorial brand film (~28s, German)

A continuous-motion brand film in the site's own light palette (`#F5F3EF`
off-white, near-black ink, red accent used sparingly) with the real
OFFSCRIPT logo asset (used unaltered, only in the final reveal) and the
agency's real performance numbers. All copy is German, kept intentionally
short — this is a brand film, not an explainer.

Architecture is built around **one persistent hero shape** (`<MorphingPill>`,
mounted for all 850 frames — dot → pill → thin red rule → services card →
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
run ~10-13 frames; readable content then holds 30-73+ frames before the
next one starts. The services section is treated as its own hero section —
each of the six gets a fixed per-slot rhythm (arrival → icon build,
concurrent with arrival, not after it → a complete hold → a shared
exit/entrance transition into the next) so no icon is ever cut away before
it's fully built. Nothing ever sits perfectly still, either: a slow
(~2-second-period), sub-1.5%-amplitude sine drift on the hero shape, the
stats block, and the logo group keeps every hold visibly alive without
ever registering as motion (it's too slow to trigger any of the
velocity-based blur described below), and a subtle whole-frame camera
scale-pulse (`cameraScaleAt`, ~2.2% at its peak) breathes at each major
scene boundary — motivated by, and only by, an actual transition, never a
random ambient zoom.

**Typography's primary motion language is word-GROUP kinetic typography,
not per-word and not full-line.** `<KineticWords>` splits a sentence into
*semantic phrases* (author-marked with `|` — "DAS BESTE|PASSIERT,|SOBALD
DAS|SCRIPT|WEG IST.", not "DAS|BESTE|PASSIERT,|…") and assembles it as a
fast traveling wave of those phrases — 2-frame stagger between groups,
each group's own ~11-frame settle, so a 5-group sentence is fully legible
in under half a second. Staggering whole phrases instead of individual
words was a deliberate choice: per-word stagger reads as a mechanical
typewriter effect, phrase-level stagger reads as an editorial kinetic cut.
Every group gets one controlled overshoot on Y, X, *and* scale together
(strong displacement — up to ±70px Y, ±80px X, scale swinging as low as
0.88 and as high as ~1.08 at the overshoot peak, always settling back to
exactly 1) plus the same velocity-measured blur as everything else in the
project, now with a higher ceiling (18-28px depending on the text's role)
so a fast-entering phrase visibly blurs and a settled one is pin-sharp,
automatically. Exits reverse the wave direction and run faster than
entrances. One phrase per sentence can be marked as `emphasisIndex` for a
slightly delayed, stronger settle and the biggest scale swing — used on
"SCRIPT" in both the headline and the closing tagline, the punchline
phrase in each. Direction (`left-right`, `center-out`, etc.) reorders
which phrase animates first without ever moving a phrase out of its
natural reading position horizontally. Used for the headline, the closing
tagline, and the subtext line; single-word labels (the pill, each service
name) stay on `<MaskText>`.

A real bug surfaced building this: a plain `' '` (and even a non-breaking
`' '`) placed as the last character *inside* a group's own
`<span>` reliably vanished with zero width once that span also carried a
permanent (bugged) resting `scale()` slightly above 1 — the symmetric
scale growth from `transformOrigin: '50% 100%'` ate the gap from both
sides. Diagnosed with a throwaway `outline`/`background` on each span to
see the true box geometry, which showed the boxes flush against each
other with no separating margin at all. The actual fix was two-part: (1)
stop relying on a text-node character for the gap at all — use an
explicit `marginRight: fontSize * 0.28` on every group but the last
instead; (2) fix `enterScale`'s overshoot to actually **settle at exactly
1** (`withOvershoot(enterP, from, 1, overshootFraction)`), not at a
permanently-inflated "to" value — the peak during the bounce differs by
emphasis, the rest state never does. Verified by rendering full-resolution
stills of the exact hold frame and reading the text directly, not just
scanning thumbnails.

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
- `src/film/components/KineticWords.tsx` — the word-by-word wave described
  above: per-word rank-based stagger (with `left-right` / `right-left` /
  `center-out` / `outside-center` / `bottom-top` ordering), one overshoot
  and one velocity-measured blur per word, optional `emphasisIndex`.
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

**A later "more energy" pass** raised the overall motion density without
touching brand identity, copy, or structure: word-by-word typography (see
`KineticWords` above) replaced full-line entrances on every multi-word
sentence; service-to-service transitions got shorter (`serviceTransitionFrames`
14→11, so the frames saved go straight into hold/read time, not lost);
blur ceilings roughly doubled on major structural transitions (the hero
shape, the camera-push exit, the morph transition) while staying
unchanged on small per-icon blur; the virtual-camera pulse and the
idle-drift system described above were both added in this pass. Verified
via the same rendered-frame method throughout (word-wave assembly,
CREATOR's centering under the new camera wrapper, a service boundary for
the double-pop fix, a whole-film low-res filmstrip) plus one added
quantitative signal: encoded bitrate roughly doubled (137→280 kb/s) at
the same CRF, i.e. h264 is spending meaningfully more bits because there
is meaningfully more genuine frame-to-frame change to encode. Actually
*watching* the render in real time and judging its energy against a
reference clip is a human judgment call this process can't substitute
for — the rendered file is the deliverable for that, not this checklist.

**A creative-direction reversal pass** retired "Apple-style minimalism" as
the motion-energy benchmark (it was making the film read as UI/presentation
animation, not a kinetic motion-design brand film) in favor of a
user-supplied reference video, while keeping the *current* film as the only
reference for visual identity, copy, colors, and brand design. Per the
brief's explicit "do not guess" requirement, the reference was actually
located on disk, `ffprobe`-verified (37s/30fps/16:9), and sampled at 4fps
into per-5-second-bucket contact sheets — matched against equal-density
buckets from the *current* render — before any code changed. That
side-by-side found the real gap was never transition mechanics: it was
frozen hold time. Buckets from the previous cut showed 10+ consecutive
sampled frames bit-identical (a headline sitting fully static for 2.44s, a
service icon frozen for 2s+) while the reference changes on *every*
sampled frame. Root cause, not symptom: the fix here is not "more
transitions," it's cutting how long anything sits doing nothing.

Concretely:
- **Timeline compressed 1140 → 850 frames (38s → ~28s)**, entirely by
  cutting hold duration and tightening transition windows throughout
  `theme.ts` — no copy, no service, no stat was cut. The services section
  in particular went from a 74-frame step (15% transition / 85% hold) to a
  52-frame step (31% transition / 69% hold), so the section now reads as a
  continuous relay of six icons rather than six independent card-holds.
- **Typography rebuilt around semantic word-groups** (see above) instead of
  per-word stagger — faster, stronger, and it no longer looks mechanical.
- **Nothing is ever allowed to be pixel-static anymore.** Every wrapper that
  previously had zero motion during its own hold (the headline, the service
  label) now carries the same phase-varied `microDrift` breathing scale the
  hero/stats/logo layers already had, at a slightly higher amplitude
  (0.016-0.022 vs. the original 0.009-0.013). `CardFace` (every service
  icon) additionally got its own tiny continuous idle rotation
  (`±0.9°`, `sin(frame * 0.08)`), independent of and faster than the
  hero's breathing, so a fully-built icon is never a dead bitmap during its
  hold.
- **Camera-push language extended to every service-to-service boundary**
  (previously only a few major beats), reinforced with a shorter, snappier
  pulse (16→13 frames, 0.022→0.03 peak amount) — this is the mechanism that
  makes the services section read as one continuous push-through sequence
  rather than six separate transitions, without redesigning the cards
  themselves.
- **Motion blur ceilings raised** across the board: `FlipTransition`/
  `ScrollTransition` icon blur 7px→13px (with bigger rotation/travel
  distances to actually earn it), the headline's `KineticWords` maxBlur
  18px→28px, `StatOdometer`'s handoff blur replaced with a real
  velocity-driven "slam" (up to 26px, via the same `getMotionBlur` every
  other blur value in the project goes through — not a new hand-authored
  curve).
- **`StatOdometer` rebuilt as a higher-energy event**: the outgoing number
  now shrinks harder and blurs on a real measured shift-velocity (a "slam,"
  not a fade), the incoming number overshoots further (1.22→1) before a
  harder settle, and `statStep` dropped 60→46 frames so the three stats
  read as three fast hits, not a slow scroll.
- **Overshoot diversified rather than applied everywhere uniformly**:
  `FlipTransition`'s incoming face now settles with a much smaller
  overshoot fraction (0.07→0.03, an intentional near-hard-stop) while its
  rotation/travel got faster and further — variation in *how* something
  settles (spring-bounce vs. hard-stop vs. soft-decelerate) is the
  sophistication the brief asked for, not overshoot on every single motion.

What this pass deliberately did **not** attempt, and why: a literal
typography-as-transition-mask system (a word's glyph shape becoming a wipe
mask for the next scene) and a fully de-centered/editorial compositional
layout (off-center, full-frame, extreme-scale shots) were both judged too
structurally risky for the existing single-centered-hero-column
architecture to absorb safely in one pass — CREATOR's deterministic
centering and the no-seam hero shape both depend on that column staying
centered. Instead, the headline's *exit* motion was strengthened and its
peak blur/scale deliberately timed to land on the same camera beat as the
services section's arrival, so the typography's own exit velocity is what
the camera-push reads as motivating — a scoped, lower-risk way to get at
"typography causes the next shot" without touching the centering
architecture. This is a known, honest scope limit, not an oversight.

Verified the same way as every prior pass — rendered stills and per-bucket
contact sheets at matching sample density, full-resolution stills at exact
hold frames (which is what caught the `KineticWords` spacing bug above),
and a direct re-comparison of the same 5-second buckets against the
pre-pass render, which now show continuous per-sample change throughout
instead of long stretches of identical frames. The same honest caveat as
every pass before it: this process cannot literally watch the render in
real time and judge perceived energy against the reference the way a human
can — the rendered file is the deliverable for that judgment call, not this
checklist.

## `OffscriptReel` — kinetic motion-design Reel (1080x1920, ~20s)

A complete motion-direction rebuild of the Reel from first principles — the
prior version (centered text → disappear → centered text) is used only as
a diagnostic reference for brand assets (logo, colors, fonts, copy). No
code, timing, layout, or choreography is carried over.

**The core problem being solved**: the previous cut read as "animated
brand slides" — isolated, centered compositions, each fading to empty
background before the next fades in. This rebuild's organizing principle
is spatial and causal continuity: every beat either grows directly out of
the previous beat's own exit motion (a match by direction or velocity,
not a literal morph) or is physically revealed BY it (a wipe, a swipe, a
clearing) — nothing fades to an empty frame and then fades something else
in. A viewer should rarely feel "new slide"; they should feel "the
previous thing became the next thing."

**Architecture** (`src/reel/`), matching the brief's own suggested shape:
- `motion/tokens.ts` — six duration categories (micro/ui/text/card/
  transition/hero) converted from the brief's ms ranges to frames @30fps,
  plus non-uniform designed stagger rhythms (never a flat 0/3/6/9/12
  ladder).
- `motion/easings.ts` — cubic/expo easing curves for CINEMATIC, non-
  bouncing moves (accelerating exits, decelerating entrances, wipes,
  masked scrolls) — reserved for the moments the brief specifically asks
  for "one decisive trajectory" instead of a spring settle.
- `motion/springs.ts` — six named spring presets (MICRO/UI/TEXT/CARD/
  IMPACT/HERO/SETTLE) reserved for physically-weighted objects that
  should visibly settle (icons, cards, impact words) — springs and
  easings are deliberately two different tools for two different kinds
  of motion, not one spring used everywhere.
- `motion/velocity.ts` — the one place blur, a whisper of rotation, and a
  directional stretch approximation are ever decided: all three are
  functions of a measured frame-to-frame delta, never hand-authored
  curves, and all three are structurally exactly 0 at rest.
- `components/Kinetic.tsx` — `KineticWord` (one word as a physical
  object: position, scale, blur, and velocity-linked rotation together)
  and `KineticPhrase` (a row of them sharing one designed stagger and one
  alignment — LEFT/right-aligned phrases, not always centered).
- `components/MaskReveal.tsx` — a fixed-size `overflow:hidden` window;
  content larger than it is genuinely CLIPPED as it passes through, which
  is what makes a word read as "traveling through frame" rather than
  just sliding in.
- `components/Motifs.tsx` — the three recurring graphic-system elements
  used throughout rather than once each: `GraphicLine` (the red line —
  underline, connector, timeline, playhead), `GraphicFrame` (corner
  brackets — content/camera/focus), `MetaLabel` (tiny mono meta type:
  "01/04", index numbers, "offscript.ch").
- `components/SocialMetric.tsx`, `ServiceMachine.tsx`, `ProcessChain.tsx`,
  `MetricRoller.tsx`, `LogoReveal.tsx`, `CTA.tsx`, `Icons.tsx` — the
  per-beat set pieces, detailed below.

**Seven beats, one movement**:
- **Hook (0-2.5s)**: already in motion at frame 0 — DEINE travels
  vertically through a `MaskReveal` window (genuinely cropped at the
  extremes of its entrance, not just translated), MARKE catches up from
  below a few frames later (overlapping action), IST NICHT sits much
  smaller and off-center (scale contrast). LANGWEILIG. hits hard (scale
  0.7→1.15→1) and every earlier word gets one shared "kick" displacement
  the instant it lands. The word itself then BECOMES the transition: it
  expands into a full-bleed red panel seeded from its own screen
  position, which recedes to reveal Beat 2 underneath — never a fade to
  black.
- **The problem (2.5-5s)**: left-aligned typography (off-center, not
  centered) with small connected social-signal chips at different pseudo-
  depths (background chips travel less and contrast less — parallax
  without any real 3D). "SKIP →" physically travels across the frame and
  triggers a small reactive nudge on "0 SHARES" as it crosses it — an
  approximated collision, not two independently-timed animations.
  Everything nudges slightly opposite the coming swipe direction first
  (anticipation), then the whole UI is swiped away in one gesture.
- **OFFSCRIPT reveal (5-7s)**: two plain, contentless panels slide off
  just ahead of the real content — a cheap, robust stand-in for "stacked
  sheets peeling away" that doesn't risk the render-correctness of a true
  layered-card simulation. The real logo is revealed underneath. WEGSWIPT.
  gets a dedicated micro-interaction: pulled ~70px as if being swiped
  away, then a hard spring back to rest — visual storytelling on a single
  word.
- **Services (7-11s)**: a complete rebuild — huge, LEFT-aligned headlines
  (CONTENT/STRATEGIE/SOCIAL/CREATOR) genuinely clipped by a `MaskReveal`
  window as they scroll through with real momentum (`easeOutExpo`
  deceleration in, `easeInExpo` acceleration out — cinematic, not a
  spring bounce), a persistent "OFFSCRIPT SERVICES — 01–04" anchor that
  stays on screen through the whole section, and a running "0X/04" index.
  Numbers, headline, and icon are offset 2-4 frames from each other
  (a designed lag, never simultaneous). Icons keep genuine internal
  build animation from the previous pass (a play triangle assembling
  inside a drawn frame, nodes connecting in sequence, cards stacking,
  camera brackets finding focus) — reused as a visual asset, not as
  scene choreography, and repositioned off-center to the side of the
  huge word instead of stacked centered beneath it.
- **The engine (11-14s)**: ONE process chain, not five title cards — IDEA
  appears, a red line (the same line motif) emerges from it and travels;
  SHOOT appears exactly where the line-tip arrives (the line delivers
  it); a frame closes around SHOOT and that closure IS the snap-cut into
  EDIT; a playhead sweeps through EDIT; POST launches upward at real,
  measured velocity and GROW's entrance continues that EXACT same
  upward momentum (a match by direction, not a fresh entrance). GROW
  hands off to a genuine slot-machine roll through 3K→12K→47K→100K+
  (`MetricRoller` — one continuous scroll with velocity-linked blur that
  sharpens exactly as it lands, not discrete blurred jumps), which then
  explodes toward camera (scale to 3.6x, blur to 36px) — that explosion
  IS the transition into the hero statement.
- **Hero (14-17.5s)**: "FALL AUF." rises directly out of the counter's
  own launch momentum. A small anticipation lifts it just before "NICHT
  DURCH." slams in in red — and NICHT DURCH.'s landing pushes FALL AUF.
  up slightly further, a small follow-through kick between the two lines
  (they react to each other, not independently). More breathing room
  than any earlier beat, per the brief, with a barely-perceptible
  continuous breathing scale so the hold is never fully static.
- **CTA (17.5-20s)**: the hero statement scales down AND rotates slightly
  while collapsing — at the same anchor point, the closing logo resolves
  with the inverse rotation settling to 0, a match transformation rather
  than a hard cut to the end card. Bigger logo, tighter grouping, a small
  persistent red tick as a signature micro-detail. The CTA arrow executes
  exactly the choreography specified — retract 4px, accelerate 12px
  right, settle to a small forward rest offset — once, never a loop.

**Real bugs found and fixed during QA** (full-resolution stills at exact
frames, not just thumbnails — this is what catches these, thumbnails
don't):
- `LogoReveal` originally had no exit; an earlier reveal instance stayed
  at full opacity for the rest of the 600-frame timeline and collided
  with everything rendered after it (a recurrence of a bug class this
  project has hit before). Every instance now either takes an explicit
  `exitStart` or is deliberately the final, permanent one.
- The Hook beat's `DEINE`/`MARKE`/`IST NICHT` had no exit either — hidden
  behind the red wipe while it's covering the frame, but with nothing
  stopping them from showing through once the wipe receded. Fixed by
  wrapping the whole beat in one opacity driven by the wipe's own cover
  progress, so it's provably gone before the wipe moves away.
- The red wipe panel was originally a 60x60px box scaled up to ~3.2x —
  nowhere near enough to cover a 1080x1920 frame from that seed. Fixed by
  sizing the panel to the full frame and scaling from near-zero (not a
  small box scaled by a few x), anchored via `transformOrigin` to
  LANGWEILIG.'s own screen position.
- The "stacked sheets" panels and the "SKIP →" label were both visible
  from frame 0 — an `easeProgress` call correctly returns 0 before its
  window starts, but both components had used `p=0` to mean "at its
  settled/pre-exit rest pose" rather than "not yet appeared," so they
  rendered at partial-to-full opacity for the entire film before their
  actual beat. Fixed with an explicit `frame < start` guard, and an
  actual entrance fade for SKIP rather than treating pre-swipe as its
  default visible state.
- `ProcessChain`'s `GROW` word and the emerging red line both had
  entrances but no exits, which would have left them on screen behind
  the metric roller for the rest of the film; both were given exit fades
  timed to complete just before the roller's own entrance.
- A spatial (not just temporal) collision: `ServiceMachine`'s last item
  (CREATOR) and the following beat's `ProcessChain`/`MetricRoller` were
  positioned in the same screen region, so their few frames of
  legitimate temporal overlap would have read as garbled overlapping
  text rather than an intentional handoff. Fixed by repositioning Beat 5
  clear of Beat 4's footprint.

**Sound design** (added last, after motion was verified to work in
silence): sparse rhythm accents on the moments that matter — the
LANGWEILIG impact, the swipe, the OFFSCRIPT reveal, the WEGSWIPT wiggle,
one tick per service arrival, three ticks through the counter's climb
plus a stronger pulse when it lands, a restrained reprise of the same
signature cue under NICHT DURCH., one click on the CTA. Reuses the
project's existing synthesized sound library (`public/sfx/`) as audio
assets, retimed to this rebuild's own event schedule.

**Known, documented scope limits** rather than silent omissions: the
"stacked sheets" reveal is two plain colored panels, not a true layered-
card physics simulation; the collision between "SKIP →" and "0 SHARES"
is a timed reactive nudge, not real hit-testing; the service icons carry
over their internal build animation from the prior pass as a visual
asset (the brief's complaint was about scene choreography, not icon
geometry) rather than being redrawn from zero.

### Motion-direction refinement pass

A follow-up pass on the same composition — no rebranding, no story change —
targeting the beats that still read as separate animated titles:

- **Opening**: `DEINE`/`MARKE` are now oversized (236px), bleed past
  opposite viewport edges, and are already mid-flight and motion-blurred at
  frame 0 — the impact lands by frame ~6 instead of the headline slowly
  assembling. Both arrive on decisive bezier curves (`easeOutCubic`, scaling
  down from "close to camera"), with the spring reserved for LANGWEILIG.'s
  physical hit.
- **The red transition is now visibly CAUSED by the typography**: a red
  field seeded from LANGWEILIG.'s exact text bounds lights up behind the
  word (which crossfades to white and stays readable on it), expands
  horizontally past the viewport, floods vertically, then recedes to
  uncover the next screen. The rest of the type is "consumed" by the flood
  rather than cut away by it.
- **The problem UI dropped from five scattered micro-labels to three
  stronger, connected signals**: `327 VIEWS` (40px) attached to the
  headline by a red tick that draws down from it, plus `0 SHARES` and
  `SKIP →`, which physically collides with and knocks `0 SHARES` aside as
  it travels.
- **WEGSWIPT. is now genuinely physical**: an external force throws the
  word ~112px sideways on an accelerating bezier with directional blur and
  a matching horizontal stretch, then the content resists and springs back
  with one overshoot; the neighbouring words take 10-14% of the same hit,
  two frames later, so the force travels through the sentence. Thrown to
  the RIGHT into open space — an earlier leftward throw dragged it across
  "DEN MAN NICHT" and read as a collision instead of resistance.
- **The services are ONE surface** (`ServiceMachine` rewritten): a single
  scroll position in row units, never reset, that rises in from below,
  advances one row per slot with real momentum (accelerate out of the hold,
  decelerate into the next), and finally carries straight on past the last
  row — which is what hands off to the next beat. The outgoing row is still
  travelling while the incoming one is already rising; index numbers and
  icons live inside the rows so they travel with them; the only fixed
  elements are the rail and its marker.
- **The process chain is one machine** (`ProcessChain` rewritten): IDEA
  stays visible (dimmed back) while its red line travels and *delivers*
  SHOOT; a rect closes around SHOOT and that closure is the cut to EDIT —
  the same rect persists, only the label inside changes; a playhead sweeps
  it; the rect collapses and ejects POST upward; GROW continues POST's
  exact travel. There is never a frame holding one unrelated word.
- **The metric roller** is a true slot machine: one continuous surface of
  stacked values, incoming rising from below while outgoing keep going up
  and out, vertical directional blur (blur + matching scaleY stretch) that
  resolves to zero as it decelerates, and a final 0.9 → 1.07 → 1.0 spring
  overshoot on the landing value.
- **Two transitions that were still collisions are now match cuts**: the
  counter explodes toward camera and `FALL AUF.` resolves out of that same
  blur, in the same screen band (previously the counter sat nearly static
  while the headline appeared above it — two events, not one); and the hero
  statement compresses toward the logo's own centre point under rising
  blur, fully gone before the logo is legible, so the swap happens inside
  the blur with zero frames of readable text behind the logo.
- **Final card** strengthened: logo 460 → 560px, wider spacing hierarchy,
  and the CTA arrow runs exactly one cycle (retract 4px, accelerate 12px,
  settle to +2px).
- **Springs vs. bezier** separated by role throughout, per the brief:
  springs only for physical reaction, resistance, overshoot and settling;
  decisive bezier curves for scrolls, swipes, wipes, match cuts and
  camera-like motion.

Bugs caught in this pass's frame-by-frame QC and fixed: the services
surface parked at a *visible* resting pose, so "CONTENT" and its index were
on screen from frame 0 (the park value now sits fully outside the
viewport); `EDIT` and `POST` were both legible in the same rect for a few
frames; and there were dead frames at the OFFSCRIPT → SERVICES boundary
where one beat had left and the next had not yet arrived (the rail now
draws and the surface rises while the previous text is still leaving).

### Motion smoothness / physics pass

A pass on the QUALITY of the motion rather than the amount of it. Nothing
was added; the existing choreography was made physically coherent.

**The shake system.** There was never a `Math.random()` in this project, but
the "shakes" were single half-sine bumps (`sin(t/N * PI) * amp`) which start
at maximum velocity from a standstill and are one push, not a reaction. They
are replaced by `motion/physics.ts` — `impactOffset()`, the windowed impulse
response of a damped oscillator:

    value(u) = amplitude x decay(u) x sin(PI x cycles x u)

Continuous, decaying, directional, deterministic. `u = 0` gives value 0 at
maximum velocity (which is what an impact *is*), `u = 1` gives EXACTLY 0
position and EXACTLY 0 velocity — structurally, because `cycles` is a whole
number so the sine lands on a zero crossing and the decay window reaches
zero there too. No residual jitter can survive. `amplitude` is the true peak
displacement (the envelope is normalised against a scan of the first lobe),
and its sign is the direction of the incoming force. A ~1-frame smoothstep
attack removes the single-frame teleport at the hit without softening it.

**One camera, four moments.** `components/CameraRig.tsx` wraps the whole
composition and is the only thing allowed to move the frame, so shake cannot
compound across parent/child layers. Every amplitude is inside the brief's
ceiling — X 2-6px, Y 2-8px, rotation 0.05-0.25 deg, 5-10 frames — and each
reacts on the axis the force acted on: LANGWEILIG. punches up so the frame
recoils down; WEGSWIPT. is thrown right so the frame drags left; 100K+ comes
at the viewer so the camera answers with scale; NICHT DURCH. lands and the
frame takes the closing weight.

**Impact hierarchy.** Reactions are tiered by role AND by mass, and the force
travels by distance from the hit rather than everything moving at once:

| element | reaction | note |
|---|---|---|
| LANGWEILIG. | 13px | primary — the object that lands, 3 lobes |
| IST NICHT | 7px | nearest and lightest, +1 frame |
| MARKE | 4.5px | heavy display type, +2 frames |
| DEINE | 3.5px | furthest and heaviest, +4 frames |
| camera | 5px | tertiary, and never the event |

**Springs stopped bouncing.** The old `IMPACT` preset had a damping ratio of
0.43: it oscillated past its target and `springProgress` then *clamped* it at
1. A clamp is a velocity cliff — the value slammed into a wall, stopped dead,
then travelled backwards as the spring swung under 1 again. Every engine is
now critically damped or heavier, so the clamp is a no-op and the engines are
pure timing drivers. All visible overshoot moved into `withOvershoot`, where
it is one auditable number, capped at the house default of 6%: the profile is
`1 -> 1.06 -> 0.985 -> 1`, never rubber like `1.15 / 0.9 / 1.08 / 0.95 / 1`.
The impact word's scale overshoot came down from 0.16 to 0.075.

**Pose curves are C1.** `motion/curves.ts` — `smoothKeys()`, monotone cubic
Hermite (Fritsch-Carlson) with the final tangent pinned to 0. `interpolate`
with multiple stops is piecewise LINEAR, so velocity changes instantly at
every pose, which at 30fps is exactly the "overshoot -> suddenly target"
kink. The monotone tangent limiter also matters: a plain Catmull-Rom asked
for `0 -> 1.06 -> 0.985 -> 1` actually peaks near 1.09, so an authored 6%
overshoot would arrive on screen as 9%. Verified numerically at 1.0600 /
0.9850 / 1.0000.

**Velocity continuity, found by measurement.** Per-frame mean pixel delta was
differentiated across all 600 frames to find jerk (a large single-frame change
in how much the image is moving) and a second pass looked for rapidly
alternating motion energy, the signature of shimmer. That surfaced:

- *The red wipe read as a cut.* On `easeInCubic` the revealing edge crawled
  for eight frames (0.9px, 6px, 17px...) then covered 300, 360 and 427px on
  the last three, and travelled 2500px when 1990 clears the frame. Retimed to
  accelerate from rest over five frames and then leave at a steady ~145px per
  frame — 18 legible frames of wipe instead of 3.
- *The fill froze mid-flight.* The panel's expansion ended at 4.5 scale-units
  per frame, sat still for four frames, then started moving again. Both sides
  of that junction now arrive and leave at zero velocity.
- *The swipe reversed instantly.* `swipeResistX` was an `easeInCubic` throw
  stitched to a separate spring-back: at the seam the word went from
  +67px/frame to -14px/frame in one frame. It is now a single continuous
  trajectory with no seam because there is no second function.
- *The metric roll popped its blur.* `easeOutCubic` leaves the gate at maximum
  velocity, so the column went from still to 85px/frame between two frames and
  the velocity-derived blur jumped 0 -> full. A slot machine spins *up*; it
  now accelerates, runs fast through the middle where intermediates should be
  unreadable, and decelerates into the landing.
- *The CTA arrow turned two corners at full speed.* Three eased segments
  switched on a frame counter became one smooth-keyed trajectory.

**Sub-pixel motion.** The service rows animated `top` and SKIP animated
`left`. Those are LAYOUT properties: the browser resolves them during layout
and snaps glyphs to whole pixels, so a surface moving 250px per 11 frames
advanced in visible integer steps. The timing was already smooth — the
rasteriser was quantising it. All of them are transforms now (also the rail
marker and the playhead), which composite with sub-pixel precision. There is
no `Math.round()` on any animated value.

**The 100K+ rectangle.** The roller's window was one slot tall, barely taller
than the glyphs, with a hard `overflow: hidden` edge. A 30px blur had nowhere
to fade, so the haze ran into the clip edge and stopped on a horizontal line
— and the launch that follows scales that box 3.8x and blurs it another 38px,
smearing those two lines into a grey rectangular field behind the number.
Fixed at the cause: real headroom (glyphs occupy the middle ~60%), a soft
mask gradient instead of a cut, a lower blur ceiling, and the settle scale
moved to an outer element and made exactly 1 before it starts (it used to sit
at 0.9 from mount, so the whole roll played 10% undersized).

Related: a CSS `filter` is applied in the element's LOCAL space and the
transform scales the result, so the red panel's nominal 16px blur landed on
screen as ~300px at `scaleY(19)`. Blur is now divided by its own scale.

**No ambient shimmer.** The 1% `breathe()` sine on the held hero block was
removed. A continuous sub-pixel scale on display type resamples every glyph
every frame; the type shimmers faintly for the whole hold, which is precisely
the texture the brief describes as jittery. A hold is now a hold.

**Safe zones.** `layout.ts` replaces three constants that nothing imported
with a real system: top 260, bottom 400 (the caption/audio bar is the most
underestimated one), sides 72, plus a 176px action-rail inset that only bites
below y=880 — with `rightEdgeAt(y)` and a `SafeZoneGuides` QC overlay. All
600 frames were checked programmatically against it. Information stays
inside; only decorative motion crosses (the red flood, the SKIP throw, the
peeling sheets, the metric explosion). Opening type came down 12% to 208px so
the headline sets inside the content area without clipping its first letter,
and the hero line to 116px for the same reason.

**Also caught in QC:** `HookWord` was parked visibly at its entry pose for
two frames before it moved (an eased progress at p=0 is a valid *visible*
pose, not "not yet started"); WEGSWIPT.'s ~13px counter-swing exactly ate the
14px word space and left it touching "NICHT"; the wipe was uncovering
typography that had already settled, which turns a continuous handoff back
into two separate shots.

Result: 600 frames, 9 frames exceed the 3.2-sigma jerk threshold and every
one of them is an intended event — the red flood (a clean
accelerate/peak/decelerate bell) and the wipe's graded tail.

## Usage

```bash
npm install

# Live preview / editor
npm run dev

# Render a composition (id = OffscriptPromo, OffscriptFilm, or OffscriptReel)
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
