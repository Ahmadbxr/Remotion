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
 * hide. Consecutive markers overlap on purpose: a stage's hold is also the
 * next stage's approach.
 */
const dotBorn = 0;
const dotHold = 16;
const pillGrow = 55;
const pillHold = 80;
const pillToRule = 110;

const headlineIn = 150;
const headlineHold = 200;
const headlineOut = 230;

const servicesCardIn = 260;
const serviceStart = 272;
const serviceStep = 36;
const SERVICE_COUNT = 6;
const servicesEnd = serviceStart + SERVICE_COUNT * serviceStep + 16; // 504

const statsCardOut = servicesEnd + 24; // 528, card dissolves back to rule
const statsStart = statsCardOut + 8; // 536
const statStep = 80;
const STAT_COUNT = 3;
const statsEnd = statsStart + STAT_COUNT * statStep; // 776

const compressStart = statsEnd + 10; // 786
const compressEnd = compressStart + 36; // 822
const lineTravelEnd = compressEnd + 28; // 850
const logoIn = lineTravelEnd + 8; // 858
const logoSettled = logoIn + 32; // 890

export const TOTAL_FRAMES = 1050; // 35s — leaves a ~160-frame (5.3s) final hold

export const TIMELINE = {
  dotBorn,
  dotHold,
  pillGrow,
  pillHold,
  pillToRule,
  headlineIn,
  headlineHold,
  headlineOut,
  servicesCardIn,
  serviceStart,
  serviceStep,
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
