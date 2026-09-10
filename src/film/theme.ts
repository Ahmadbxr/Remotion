export const FILM_COLORS = {
  background: '#F5F3EF',
  primary: '#111111',
  accent: '#F20505',
  secondary: '#707070',
  surface: '#ECE9E2',
  border: 'rgba(17,17,17,0.14)',
} as const;

export const FILM_FONT =
  "'Helvetica Neue', -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif";

export const FILM_MONO =
  "ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace";

export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/**
 * One continuous timeline, expressed as named frame markers rather than
 * independent per-scene start/end pairs. Every stage below is a state of
 * the SAME persistent hero element and the SAME persistent headline slot —
 * nothing here unmounts and remounts at a boundary, so there is no seam to
 * hide.
 *
 * ENERGY-PASS REWORK: measured against a reference video (side-by-side,
 * 5-second-bucket event counting — see the commit that introduced this
 * timeline), the previous cut's problem was never transition mechanics —
 * it was frozen hold time. Icons/text were sampled bit-identical for
 * 1.5-2.5s at a stretch while the reference changes on every sampled
 * frame. This timeline is ~25% shorter throughout (38s -> ~28s) purely by
 * cutting hold time, never by cutting a service, a stat, or a line of
 * copy — every beat below still gets enough dwell to read, just far less
 * dead space after it's read. The remaining "never fully static" fix is
 * NOT a timing change: every hold everywhere now also carries a
 * continuous micro-drift/breathing motion (see OffscriptFilm.tsx) so two
 * consecutive sampled frames are never pixel-identical even mid-hold.
 */
const dotBorn = 0;
const dotHold = 8;
const pillGrow = 26;
const pillHold = 44; // ~18-frame readable hold on "OFFSCRIPT" — short, punchy
const pillToRule = 58; // 14-frame transition

const headlineIn = 66; // brief breath before the word-group wave starts
const headlineRevealEnd = 90; // fast group wave: fully assembled ~24f after headlineIn
const headlineHold = 136; // ~46-frame hold (~1.5s) — enough to read, no longer than that
const servicesCardIn = 148; // 12-frame card-forming transition
const serviceStart = 154; // 6-frame settle before content starts

// Each service now runs a much tighter, transition-heavy loop: build+hold
// gets ~34 frames fully readable, then a 16-frame transition (31% of the
// step, up from 15%) carries straight into the next — the section reads as
// one continuous relay of icons rather than six independent card-holds.
const serviceStep = 52;
const SERVICE_COUNT = 6;
const serviceTransitionFrames = 16;
const servicesEnd = serviceStart + SERVICE_COUNT * serviceStep + 8;

const statsCardOut = servicesEnd + 12; // camera-push exit, see OffscriptFilm
const statsStart = statsCardOut + 8;
const statStep = 46; // faster odometer beat — count/slam/blur reads fast, not a slow scroll
const STAT_COUNT = 3;
const statsEnd = statsStart + STAT_COUNT * statStep;

const compressStart = statsEnd + 8;
const compressEnd = compressStart + 12;
const lineTravelEnd = compressEnd + 16;
const logoIn = lineTravelEnd + 7;
const logoSettled = logoIn + 16;

export const TOTAL_FRAMES = 850; // ~28.3s @ 30fps — compressed from 38s via overlap/shorter holds, not cut copy

export const TIMELINE = {
  dotBorn,
  dotHold,
  pillGrow,
  pillHold,
  pillToRule,
  headlineIn,
  headlineRevealEnd,
  headlineHold,
  servicesCardIn,
  serviceStart,
  serviceStep,
  serviceTransitionFrames,
  SERVICE_COUNT,
  servicesEnd,
  statsCardOut,
  statsStart,
  statStep,
  STAT_COUNT,
  statsEnd,
  compressStart,
  compressEnd,
  lineTravelEnd,
  logoIn,
  logoSettled,
} as const;
