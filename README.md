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

## `OffscriptReel` — kinetic brand Reel (1080x1920, ~20s)

Built completely from zero: no code, timing, layout, transition, or
typography logic is shared with `OffscriptFilm` above — only actual brand
assets (color tokens, the font stack, the logo file) are reused, exactly as
scoped. Lives entirely under `src/reel/`.

**Creative direction**: kinetic editorial design, not a slow keynote reveal
— word-by-word typography as the hero element, a continuous chain of
cause-and-effect transitions (an impact triggers the next scene; a swipe
gesture clears a "world" of content to reveal the logo underneath; a growth
counter explodes toward camera and that explosion *becomes* the hero
statement's entrance), never a fade-to-black between sequences.

**Motion system** (`src/reel/springs.ts`): six named presets grounded in
the installed motion-design skills' own spring/timing tables —
`SNAPPY_TEXT` (kinetic type), `IMPACT` (hits, hero words), `SOFT_CARD`
(the social-content cards), `UI_MICRO` (tiny ticks), `HERO` (large
transitions), `SETTLE` (the logo, no bounce). Every animation reaches for
one of these; none are ad-hoc. `progress`/`withOvershoot`/`motionBlur` are
the same class of utility as the earlier film's (a clamped spring-driven
0→1 timing driver, a directionally-consistent single-overshoot shaper, and
velocity→blur mapping) but are a fresh, independent implementation — blur
in particular is never hand-authored; every blur value in the Reel is a
measured frame-to-frame velocity run through `motionBlur`, so it is
structurally exactly 0 the instant something stops moving.

**Structure** — seven sequences, each bleeding into the next rather than
cutting:
- **A — Pattern interrupt** (`src/reel/components/KineticType.tsx`):
  "DEINE MARKE IST NICHT LANGWEILIG." assembles word-by-word; LANGWEILIG.
  hits hard (scale 0.7→1.1→1, IMPACT spring, turns red) and every other
  word in the sentence gets a brief physical "kick" displacement the
  instant it lands — a shared-trigger reaction, not an isolated animation.
  The impact itself (no pause) starts the exit into Sequence B.
- **B — The problem**: "DEIN CONTENT VIELLEICHT SCHON." plus five small
  abstract social-signal cards (`SpringCard`/`SignalChip` —
  "327 Views", "Skip →", etc., an original visual interpretation, never a
  literal screenshot) that spring in with their own physical character,
  then get violently swiped off in one shared gesture (`swipeProgress`)
  that becomes the transition into Sequence C.
- **C — OFFSCRIPT reveal**: the real logo asset (unaltered) revealed as
  the swipe clears, then "WIR MACHEN CONTENT, DEN MAN NICHT WEGSWIPT." —
  WEGSWIPT. gets a dedicated micro-interaction (`CWiggleWrap`): a brief
  attempted-swipe pull, then a hard spring back to rest.
- **D — Service scroller** (`src/reel/components/ServiceScroller.tsx`):
  CONTENT / STRATEGIE / SOCIAL MEDIA / CREATOR as ONE continuous vertical
  relay — every item's enter/exit is a pure function of frame (nothing
  conditionally mounts), so the next service is always already rising
  while the current one is still leaving. Each icon
  (`src/reel/components/Icons.tsx`) has genuine internal draw-in animation
  — a play triangle assembling inside a drawn frame, nodes connecting in
  sequence, cards stacking dynamically, camera corner-brackets finding
  focus — never a shape that just fades or scales in as a static whole.
- **E — The engine** (`src/reel/components/ProcessChain.tsx` +
  `MetricCounter.tsx`): IDEA → SHOOT → EDIT → POST → GROW as a horizontal
  chain reaction (one word visible at a time, a red line growing beneath
  each is what visually "pushes" the next one into frame), which GROW
  hands off to a rapid-fire counter (3K → 12K → 47K → 100K+) that doesn't
  fade out — it explodes toward camera (`MetricLaunch`: scale to 3.4x,
  blur to 34px) and that explosion motion crossfades directly into
  Sequence F's entrance.
- **F — Hero statement**: "FALL AUF." (ink) / "NICHT DURCH." (red, full
  line) at the Reel's largest type size, ~0.5s more breathing room than
  earlier sequences per the brief, with a barely-perceptible continuous
  breathing scale so the hold never reads as fully static. Its own
  collapse toward center (`HeroCollapse`) becomes the closing logo's
  entrance in Sequence G.
- **G — CTA**: logo, "CONTENT, DER HÄNGEN BLEIBT.", `offscript.ch`, then
  "LET'S CREATE →" — the arrow nudges exactly twice
  (`src/reel/components/CTA.tsx`, deterministic, frame-bound) and stops,
  never an indefinite loop. ~1.5s of pure readability before the video ends.

**A real bug found and fixed during QA**: `LogoReveal` and the section-D
"WAS WIR MACHEN" kicker were both built with an entrance but no exit —
once their spring settled, they stayed at full opacity for the rest of the
600-frame timeline. Caught by rendering full-resolution stills mid-Sequence-D
and mid-Sequence-F (not just thumbnails): a small leftover OFFSCRIPT logo
and kicker text were silently colliding with "STRATEGIE", then with "FALL
AUF." itself (a garbled double-exposure, the exact defect class the brief's
own QA checklist calls out). Root cause was structural, not cosmetic — an
element with only a built-in entrance and no exit is a persistent-forever
element the instant it's used inside a composition where every sequence's
`AbsoluteFill` stays mounted for the full timeline (chosen deliberately,
same as `OffscriptFilm`, so nothing conditionally remounts and creates a
reset seam). Fixed by giving `LogoReveal` an optional `exitStart` and
giving the kicker its own exit fade, both timed to complete before the next
sequence needs that screen space. Reverified via fresh full-resolution
stills at the exact frames that were broken.

**Sound design** (added last, after motion was verified to work silently):
sparse rhythm accents, never one sound per movement — the LANGWEILIG
impact, the swipe, the OFFSCRIPT reveal (the Reel's one loudest moment),
the WEGSWIPT. wiggle, one soft tick per service arrival, three quiet ticks
during the counter's rapid-fire climb plus one stronger pulse when 100K+
lands, a restrained (not maximum-volume) reprise of the same signature cue
under NICHT DURCH., and one subtle click on the CTA. Reuses the project's
existing synthesized sound library (`public/sfx/`, `scripts/synth-sfx.py`
— no sampled or licensed audio) as audio assets, retimed to this Reel's
own event schedule.

**Known scope limits, documented rather than silently skipped**: a
literal glyph-shaped typography mask (a word's letterforms becoming the
next scene's wipe mask) was judged too large an undertaking for this pass
given the render-correctness risk, in favor of the counter-explosion and
hero-collapse transitions actually implemented, which achieve the same
"motion causes the next motion" goal through scale/blur rather than
literal masking. The four service icons intentionally stay small and
centered rather than filling 60-90% of frame width (reserved for the
kinetic typography, the Reel's actual hero element, per the brief).

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
