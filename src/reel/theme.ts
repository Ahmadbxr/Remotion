// ---------------------------------------------------------------------------
// OFFSCRIPT — Brand Motion Reel. Built from zero: no code, timing, layout,
// or transition logic is shared with the earlier `src/film/OffscriptFilm`
// composition. Only actual brand ASSETS are reused below (color tokens,
// font stack, the logo file) — exactly what the brief allows.
// ---------------------------------------------------------------------------

export const BRAND = {
  background: '#F5F3EF', // warm off-white
  ink: '#111111', // near-black / charcoal typography
  red: '#F20505', // OFFSCRIPT red — used strategically, never flooding a frame
  muted: '#6E6A63', // warm secondary grey
  surface: '#ECE9E2', // subtle warm-grey UI surface
  border: 'rgba(17,17,17,0.12)', // very subtle borders
} as const;

export const FONT =
  "'Helvetica Neue', -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif";
export const MONO = "ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

// Mobile-safe zone: keep essential content inside this inset so nothing
// important sits under platform UI (captions, profile chrome, CTA bars).
export const SAFE_TOP = 220;
export const SAFE_BOTTOM = 260;
export const SAFE_X = 72;

// ---------------------------------------------------------------------------
// Timeline — 20s @ 30fps = 600 frames. Seven sequences, each with a nominal
// anchor below, but every sequence's actual entrance begins BEFORE its
// neighbor's exit finishes — see OffscriptReel.tsx. These anchors are the
// choreography's spine, not hard cut points.
// ---------------------------------------------------------------------------
export const SEQ = {
  A: 0, // pattern interrupt — kinetic headline
  B: 75, // the problem — boring content world
  C: 150, // OFFSCRIPT reveal
  D: 210, // service scroller
  E: 330, // the engine — process chain + metrics
  F: 420, // hero statement
  G: 510, // CTA
  END: 600,
} as const;

export const TOTAL_FRAMES = SEQ.END; // 20s
