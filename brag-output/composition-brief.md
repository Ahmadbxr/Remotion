# Hyperframes Composition Brief: Offscript

## Objective
Create a short launch-style brag video for Offscript, a Zürich content agency.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 20.5 seconds

## Source Material
- Project root: `/home/user/Remotion` (`offscript-promo`)
- Primary files read: `src/reel/OffscriptReel.tsx`, `src/reel/theme.ts`,
  `src/reel/motion/palette.ts`, `src/reel/components/ProcessChain.tsx`,
  `README.md`, `package.json`
- Product name: Offscript (offscript.ch)
- Tagline / strongest claim: *DEINE MARKE IST NICHT LANGWEILIG. DEIN CONTENT
  VIELLEICHT SCHON.*
- Key visual moment to recreate: the **red as a takeover** — the brand's one
  loud gesture — plus the indexed service rail and the process chain, both of
  which are real agency artefacts rather than landing-page decoration.
- There is no app, no UI and no website in this repo. The agency's own copy
  and design system are the only honest source, and everything on screen is
  copy Offscript already uses.
- Copy that must appear verbatim:
  - DEINE MARKE IST NICHT LANGWEILIG.
  - DEIN CONTENT VIELLEICHT SCHON.
  - WIR MACHEN CONTENT, DEN MAN NICHT WEGSWIPT.
  - 01/04 CONTENT · 02/04 STRATEGIE · 03/04 SOCIAL · 04/04 CREATOR
  - IDEA → SHOOT → EDIT → POST → GROW
  - 100K+
  - offscript.ch
  - CONTENT, DER HÄNGEN BLEIBT.

## Creative Direction
- Tone preset: `polished`
- Creative direction: a Zürich agency that does not need to shout
- Interpretation: fewer scenes, longer holds, confidence through restraint.
  Type does the work; motion is decisive but never busy. Exactly one loud
  moment — the red takeover — and it reads as loud because everything around
  it is quiet.
- Angle: the agency's hook is an insult wrapped in a compliment. Let the line
  land, then show the agency is equipped to fix what it just diagnosed. No
  invented claims.
- Hook: *DEINE MARKE IST NICHT LANGWEILIG.* held as a compliment, then *DEIN
  CONTENT VIELLEICHT SCHON.* landing in red on the 1.60s beat and turning it
  into an accusation.
- Outro / punchline: after the red and the five-stage chain, everything stops
  and the agency just leaves its address — offscript.ch, set large, under a
  red rule.
- Avoid:
  - Generic SaaS language
  - Abstract filler visuals
  - Unrelated visual redesign
  - Any second loud moment competing with the red takeover

## Visual Identity
- Background: `#F5F3EF` (warm paper)
- Text: `#111111`
- Secondary text: `#6E6A63`
- Accent: `#F20505`
- Dark surface: `#0E1626` (very dark navy — black flattens the red)
- Red on navy lifts to `#FF4433` (`#F20505` is ~3:1 on navy, marginal as text)
- Display font: system sans stack, weight 800, tight negative tracking
- Body font: system monospace, letterspaced, for indices and meta labels
- Visual references from the project: the red takeover; the indexed service
  rail; the process chain as one connecting line; the endcard lockup with a
  red rule under the URL
- Logo: `assets/img/logo.png` — black brush wordmark with a red "zh", on
  transparent. Must sit on paper, never on navy.

## Storyboard
Use the storyboard in `brag-output/brag-plan.md` as the creative contract.

Scene summary:
1. The turn — 3.70s — two hook lines; the second lands in red on the beat and
   flips the meaning. Both must be readable together.
2. The red takeover — 3.68s — red floods out of the line; the promise is read
   white-on-red.
3. The service system — 5.27s — four indexed services arrive one by one
   against a persistent red rail, then hold together as a set.
4. Process to proof — 4.21s — the rail lays down into a horizontal chain,
   five stages read across it, the frame goes navy and resolves on 100K+.
5. The address — 3.64s — logo, offscript.ch under a drawn red rule, tagline,
   then stillness.

## Audio
- Audio role: warm bed with sparse, motion-matched accents.
- Audio arc: enters low under a dry hook, lifts once for the red takeover,
  holds a steady bed through the services and the chain, thins across the
  close, and is silent under the URL.
- Music: `assets/music/music.mp3`
  (happy-beats-business-moves-vol-11, 114.84 BPM)
- Music treatment: volume automation on the clip — in from 0, bed at ~0.30,
  brief lift to ~0.40 under the red, thinning from 16.9s, silent by 19.6s so
  the address is read in the clear. No ducking, no sidechain.
- Music cue guidance: bundled preset read from
  `assets/music/cues/happy-beats-business-moves-vol-11-...music-cues.md`.
  Strong cues to lock: **1.60s** (the turn), **3.70s** (red takeover),
  **12.65s** (chain begins), **17.91s** (logo settles). Beat grid for the
  sequential service reveal: **8.44 / 9.50 / 10.54 / 11.60** — every other
  beat, ~1.06s apart, clear of the 0.8s readability floor.
- Audio-reactive treatment: none. This brand is restrained; reactive glow or
  breathing motion would betray it. Documented as a deliberate choice, not an
  extraction failure.
- Audio-coupled moments:
  - Red takeover (3.70s) — one weighted impact landing exactly on the flood
  - Service arrivals (8.44/9.50/10.54/11.60) — four small related accents
  - 100K+ landing (~15.0s) — one warm transient; the payoff
  - Red rule under offscript.ch (~18.9s) — one soft accent as it draws
- SFX selection guidance: warm, low high-frequency-risk files only. Four cues
  in twenty seconds. Nothing on the tagline and nothing after it.
- SFX analysis guidance: `.agents/skills/brag/assets/sfx/sfx-analysis.md`.
  Selected: `impactSoft_heavy_002` (takeover), `bong_001` (service family),
  `impactSoft_medium_001` (100K+), `rollover2` (rule) — all warm or balanced,
  low/medium HF risk.
- Audio files: copied into `brag-output/composition/assets/`.

## Hyperframes Instructions
Domain skills `hyperframes-core`, `hyperframes-animation`, `hyperframes-audio`,
`hyperframes-keyframes` and `hyperframes-cli` are installed and were read for
the composition contract. `/brag` is its own workflow — the hyperframes
entry-point intent interview was not entered.

Requirements:
- Show at least one real visual element from the source project. (The service
  rail, process chain, red takeover and endcard lockup are all taken from the
  agency's own design system; the logo is the real asset.)
- Keep all text readable — every line clears the reading floor in the plan.
- Total duration 20.5s, inside 15-25s.
- Include the planned music/SFX layer.
- 1-3 strong-cue locks only; sequential reveals snap to the beat grid.
- Audio-reactive intentionally omitted (see above).
- Run `hyperframes check` before render — brag's single gate.
