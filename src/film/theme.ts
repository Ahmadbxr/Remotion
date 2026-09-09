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
 * Rhythm principle throughout: FAST TRANSITION, SLOW HOLD. Structural
 * transitions (the hero reshaping, a card forming) run ~10-16 frames;
 * readable content then holds for 40-60+ frames before the next transition
 * starts. Momentum comes from how efficiently state changes, not from
 * cutting holds short.
 */
const dotBorn = 0;
const dotHold = 12;
const pillGrow = 38; // was 55 — tighter build
const pillHold = 66; // ~28-frame readable hold on "OFFSCRIPT"
const pillToRule = 80; // 14-frame transition

const headlineIn = 96; // brief (16f) rule-alone breath before headline
const headlineRevealEnd = 128; // 32-frame mask reveal
const headlineHold = 188; // ~60-frame readable hold (a full sentence)
const headlineOut = 202; // 14-frame exit

const servicesCardIn = 216; // 14-frame card-forming transition
const serviceStart = 224; // 8-frame settle before content starts

// Each service: ~10f enter, icon fully built by ~24f in, held complete
// until ~14f before the end, then a flip/scroll/morph transition into the
// next. Total per service comfortably clears the "20-30 frames fully
// built" and "30-40 frames readable" requirements.
const serviceStep = 74;
const SERVICE_COUNT = 6;
const serviceTransitionFrames = 14; // shared: outgoing's exit IS incoming's entrance
const servicesEnd = serviceStart + SERVICE_COUNT * serviceStep + 10;

const statsCardOut = servicesEnd + 14; // camera-push exit, see OffscriptFilm
const statsStart = statsCardOut + 10;
const statStep = 60; // ~46-frame hold + 14-frame transition per stat
const STAT_COUNT = 3;
const statsEnd = statsStart + STAT_COUNT * statStep;

const compressStart = statsEnd + 10;
const compressEnd = compressStart + 14;
const lineTravelEnd = compressEnd + 18;
const logoIn = lineTravelEnd + 8;
const logoSettled = logoIn + 20;

export const TOTAL_FRAMES = 1140; // 38s — services get real room, everything else is tighter

export const TIMELINE = {
  dotBorn,
  dotHold,
  pillGrow,
  pillHold,
  pillToRule,
  headlineIn,
  headlineRevealEnd,
  headlineHold,
  headlineOut,
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
