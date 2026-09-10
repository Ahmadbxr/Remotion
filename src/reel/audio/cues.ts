import {Cue} from './AudioCue';

// ---------------------------------------------------------------------------
// THE CUE SHEET.
//
// Written against the finished picture, beat by beat, before a line of audio
// was wired up. Every entry names the visual event it serves and why it
// earns a place; anything that could only answer "because something moved"
// is not in this file.
//
// THE SOURCE LIBRARY, as measured rather than as named. The filenames say
// nothing useful, so each was decoded and analysed — duration, envelope,
// attack, band energy, temporal centroid:
//
//   src2  sub hit         86% below 80Hz, 270ms rise    -> sub-drop, sub-swell
//   src1  mid body        95% in 250Hz-2k, 10ms attack  -> body, tone-resolve
//   src5  crisp transient 50% mid + 43% hi, 30ms attack -> tick-mid
//   src3  airy tick       52% 2-8k + 37% air, quiet     -> tick-air, all air
//   src4  high transient  51% above 8k                  -> tick-hi
//
// src4 is the reason for analysing rather than trusting: its burst is 190ms
// INTO the file, behind near-silence. Dropped in on a beat it would have
// landed six frames late. It is trimmed so its transient sits at t=0.
//
// The library has no whoosh and no riser, so the movement layers are derived
// from the air source (src3) by stretching, filtering and re-enveloping —
// processing the provided material rather than substituting something else,
// so the whole Reel speaks with one voice.
//
// THE ARC: minimal -> first impact -> tension -> tonal relief -> rhythmic ->
// momentum -> deeper -> build -> CLIMAX -> reinforcement -> release -> space.
// ---------------------------------------------------------------------------

export const CUES: Cue[] = [
  // ======================= BEAT 1 — HOOK =======================
  // The opening does NOT announce itself. One air bed that rises with the
  // camera's approach and is gone before the word lands, so the visual hold
  // at f42-46 is genuinely silent and the red hits into a clean frame.
  {at: 8, bus: 'TEXTURE', file: 'air-push.wav', gain: 0.66, hold: 32, fadeIn: 4, fadeOut: 10,
   why: 'camera approach f0-38 — anticipation only; must not read as an effect'},

  // LANGWEILIG. lands. THREE layers, three frequency roles, one clean hit —
  // deliberately not a cinematic boom, and nothing that could re-introduce
  // the jitter that was fixed at exactly this moment.
  {at: 38, bus: 'IMPACT', file: 'tick-mid.wav', gain: 0.52, hold: 10, fadeOut: 4,
   why: 'PRIMARY / transient — the edge of the hit, gives it perceived sharpness'},
  {at: 38, bus: 'IMPACT', file: 'body.wav', gain: 0.47, hold: 18, fadeOut: 7,
   why: 'PRIMARY / body — mid weight, the sound of the word arriving'},
  {at: 38, bus: 'SUB', file: 'sub-drop.wav', gain: 0.40, hold: 26, fadeOut: 12,
   why: 'PRIMARY / low — felt, not heard; restrained so the climax stays bigger'},

  // The impact tail runs INTO the transition rather than stopping and
  // handing over: one physical event, not two sounds.
  {at: 45, bus: 'WHOOSH', file: 'air-pass.wav', gain: 0.70, hold: 26, fadeIn: 2, fadeOut: 8,
   why: 'camera accelerates f46-60 and passes through the type'},
  {at: 44, bus: 'SUB', file: 'sub-swell.wav', gain: 0.40, hold: 40, fadeIn: 4, fadeOut: 14,
   why: 'the red takeover needs weight underneath it, not volume'},
  {at: 62, bus: 'WHOOSH', file: 'air-pull.wav', gain: 0.38, hold: 22, fadeIn: 3, fadeOut: 8,
   why: 'the panel lifting away f66-84 — a release, the opposite gesture to the push'},

  // ======================= BEAT 2 — PROBLEM =======================
  // Almost silent, on purpose. The emptiness IS the story: this is what low
  // engagement sounds like. Two small sounds in three seconds.
  {at: 86, bus: 'UI', file: 'tick-air.wav', gain: 0.85, hold: 9,
   why: '327 VIEWS — one dry tick; the only acknowledgement the metric gets'},
  {at: 114, bus: 'UI', file: 'tick-hi.wav', gain: 0.62, hold: 7,
   why: "SKIP knocks 0 SHARES — tactility, and the section's only hard edge"},

  {at: 126, bus: 'WHOOSH', file: 'air-pull.wav', gain: 0.62, hold: 34, fadeIn: 4, fadeOut: 10, pitch: 0.9,
   why: 'camera pulls back f124-152 — pitched DOWN because we are moving away'},

  // ======================= BEAT 3 — OFFSCRIPT =======================
  // The brand does not need a sting. A tonal resolve and one tactile grain.
  {at: 144, bus: 'TONAL', file: 'tone-resolve.wav', gain: 0.70, hold: 34, fadeOut: 12,
   why: 'OFFSCRIPT reveal — relief and resolution after the problem, confident not loud'},
  {at: 145, bus: 'UI', file: 'tick-air.wav', gain: 0.34, hold: 8,
   why: 'a grain of tactility so the tonal layer has something to land on'},

  {at: 170, bus: 'WHOOSH', file: 'air-pass.wav', gain: 0.58, hold: 18, fadeIn: 1, fadeOut: 6, rate: 1.5,
   why: 'WEGSWIPT. thrown sideways — faster and higher than a Z move, because X is faster'},
  {at: 177, bus: 'UI', file: 'tick-mid.wav', gain: 0.42, hold: 9,
   why: 'the word resisting at the peak of the throw — the physical part of the gesture'},

  // ======================= BEAT 4 — SERVICES =======================
  // ONE bed across all four, not four transitions. The services are a single
  // mechanism, so they get a single continuous sound.
  {at: 202, bus: 'TEXTURE', file: 'air-bed.wav', gain: 0.52, hold: 103, fadeIn: 18, fadeOut: 26,
   why: 'the whole service surface as one continuous spatial movement'},
  {at: 212, bus: 'UI', file: 'tick-air.wav', gain: 0.88, hold: 9,
   why: 'CONTENT arrives — the service family accent'},
  {at: 235, bus: 'UI', file: 'tick-mid.wav', gain: 0.80, hold: 9, pitch: 1.06,
   why: 'STRATEGIE — same family, varied so it is never heard as the same sample'},
  {at: 258, bus: 'UI', file: 'tick-air.wav', gain: 0.84, hold: 9, pitch: 0.94,
   why: 'SOCIAL — alternating between the two tick colours keeps the rhythm alive'},
  {at: 281, bus: 'UI', file: 'tick-mid.wav', gain: 0.72, hold: 9, pitch: 1.12,
   why: 'CREATOR — the last and highest of the four, closing the sequence'},

  // ============ SERVICES -> PROCESS MORPH ============
  // The red line changes function, so the sound changes PITCH rather than
  // simply moving. Two tonal instances crossing IS the bend.
  {at: 304, bus: 'TONAL', file: 'tone-resolve.wav', gain: 0.52, hold: 22, fadeOut: 10, pitch: 0.82,
   why: 'the rail lets go — the low half of a tonal morph, not a swoosh'},
  {at: 313, bus: 'TONAL', file: 'tone-resolve.wav', gain: 0.46, hold: 26, fadeIn: 6, fadeOut: 12, pitch: 1.18,
   why: 'the same line arriving as the process connector — transformation, not travel'},

  // The chain: one family, escalating. The playhead sweep is SILENT — the
  // picture carries it, and something has to stay quiet.
  {at: 312, bus: 'UI', file: 'tick-air.wav', gain: 0.50, hold: 9,
   why: 'IDEA activates — smallest sound of the chain'},
  {at: 334, bus: 'UI', file: 'tick-mid.wav', gain: 0.58, hold: 10,
   why: 'the line reaches SHOOT — more tactile than IDEA, the chain is building'},
  {at: 349, bus: 'UI', file: 'tick-hi.wav', gain: 0.50, hold: 7,
   why: 'SHOOT->EDIT swaps inside the same frame — a precision tick for a precision cut'},
  {at: 375, bus: 'WHOOSH', file: 'air-pass.wav', gain: 0.48, hold: 12, fadeOut: 5, rate: 1.8,
   why: 'POST launches upward — the first movement sound of the chain'},
  {at: 378, bus: 'WHOOSH', file: 'air-push.wav', gain: 0.55, hold: 30, fadeIn: 3, fadeOut: 10, rate: 1.2,
   why: 'GROW — the chain stops ticking and starts travelling; escalation begins here'},

  // ============ THE DARK CHAPTER ============
  // The room changes: deeper, wider, a different air colour.
  {at: 364, bus: 'SUB', file: 'sub-swell.wav', gain: 0.42, hold: 42, fadeIn: 5, fadeOut: 14,
   why: 'the process line floods the frame and turns navy — the sound space goes dark with it'},
  {at: 368, bus: 'WHOOSH', file: 'air-pass.wav', gain: 0.34, hold: 22, fadeIn: 2, fadeOut: 8, pitch: 0.85,
   why: 'the flood itself, pitched down into the new darker world'},

  // ============ 100K+ ============
  // Two accents in a 24-frame roll, not a burst of clicking.
  {at: 392, bus: 'UI', file: 'tick-air.wav', gain: 0.30, hold: 7,
   why: 'the roll passing a milestone — barely there, just enough to feel mechanical'},
  {at: 398, bus: 'UI', file: 'tick-air.wav', gain: 0.34, hold: 7, pitch: 1.1,
   why: 'the next milestone, a step higher — the counter is climbing'},
  {at: 406, bus: 'IMPACT', file: 'body.wav', gain: 0.42, hold: 16, fadeOut: 7,
   why: '100K+ lands and holds — a moment of clarity before the camera moves'},
  {at: 406, bus: 'SUB', file: 'sub-drop.wav', gain: 0.36, hold: 22, fadeOut: 10,
   why: 'weight on the final number that the intermediate ones never got'},

  // ============ THE CLIMAX: camera pass -> FALL AUF ============
  // The build peaks just BEFORE the pass, so the impact lands into a gap.
  {at: 398, bus: 'WHOOSH', file: 'riser.wav', gain: 0.54, hold: 30, peakAt: 0.9,
   why: 'LAYER 2 — controlled tension, peaking a frame before the camera reaches the number'},
  {at: 418, bus: 'WHOOSH', file: 'air-pass.wav', gain: 1.0, hold: 20, fadeIn: 1, fadeOut: 7, pitch: 0.9,
   why: 'LAYER 1 — the camera pass itself, the strongest movement sound in the Reel'},
  {at: 404, bus: 'SUB', file: 'sub-swell.wav', gain: 0.48, hold: 22, fadeIn: 3, fadeOut: 8,
   why: 'LAYER 3 — low build under the pass, rising into the hit'},
  {at: 426, bus: 'UI', file: 'tick-hi.wav', gain: 0.92, hold: 7,
   why: 'LAYER 4 — the transient that makes FALL AUF. sharp rather than merely loud'},
  {at: 426, bus: 'IMPACT', file: 'body.wav', gain: 0.88, hold: 18, fadeOut: 8,
   why: 'LAYER 5 — body. The loudest moment of the Reel, and still not a trailer boom'},
  {at: 426, bus: 'SUB', file: 'sub-drop.wav', gain: 0.72, hold: 28, fadeOut: 13,
   why: 'LAYER 5 — sub. The one moment the low end is allowed to be fully present'},

  // f442-460: SILENCE. The impact is bigger because nothing follows it.

  {at: 461, bus: 'IMPACT', file: 'body.wav', gain: 0.30, hold: 14, fadeOut: 7, pitch: 0.88,
   why: 'NICHT DURCH. — secondary reinforcement only, pitched below FALL AUF. so it stays second'},

  // ======================= BEAT 7 — ENDCARD =======================
  {at: 486, bus: 'WHOOSH', file: 'air-pull.wav', gain: 0.60, hold: 34, fadeIn: 4, fadeOut: 12, pitch: 0.92,
   why: 'the final pull-out — energy leaving, low end thinning, the piece arriving'},
  {at: 508, bus: 'TONAL', file: 'tone-resolve.wav', gain: 0.62, hold: 22, fadeOut: 11,
   why: 'the logo settles — resolution, the tonal bookend to the reveal at f144'},
  {at: 522, bus: 'UI', file: 'tick-air.wav', gain: 1.0, hold: 9, pitch: 1.25,
   why: 'offscript.ch — a glassy accent, NOT a button click; the URL is what must be remembered'},
  {at: 550, bus: 'UI', file: 'tick-air.wav', gain: 0.28, hold: 8, pitch: 0.9,
   why: "the CTA arrow's single movement — the last sound in the Reel"},

  // f558-600: SILENCE. A second and a half to read the URL.
];
