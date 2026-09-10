import {interpolate} from 'remotion';

// ---------------------------------------------------------------------------
// Cinematic (non-spring) easing — for the transitions the brief wants ONE
// decisive trajectory rather than a settle-with-bounce. Springs stay for
// physical, weighted objects (cards, icons); these are for directed camera-
// like moves (accelerating exits, decelerating arrivals, wipes).
// ---------------------------------------------------------------------------
export type Ease = (t: number) => number;

export const easeOutExpo: Ease = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const easeInExpo: Ease = (t) => (t <= 0 ? 0 : Math.pow(2, 10 * (t - 1)));
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInCubic: Ease = (t) => t * t * t;
export const easeInOutCubic: Ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/** Clamped 0->1 progress through an easing curve — the timing driver for
 *  directed, non-bouncing moves (accelerating exits, decelerating entries,
 *  wipes, mask reveals). */
export const easeProgress = (frame: number, start: number, end: number, ease: Ease = easeOutCubic) => {
  const t = interpolate(frame, [start, end], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return ease(t);
};
