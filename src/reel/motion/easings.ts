import {Easing, interpolate} from 'remotion';

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

// ---------------------------------------------------------------------------
// Gentler arrivals. easeOutExpo dumps ~75% of its travel in the first
// quarter of its window: at 30fps a 16-frame move under it is effectively a
// 4-frame move followed by 12 frames of almost nothing, which reads as
// abrupt no matter how long the window is. For large, camera-like travel
// these spread the same distance across the frames it actually occupies —
// still fast, but fast because the velocity is high, not because the
// duration is short.
// ---------------------------------------------------------------------------
export const easeOutQuart: Ease = (t) => 1 - Math.pow(1 - t, 4);
export const easeOutQuint: Ease = (t) => 1 - Math.pow(1 - t, 5);

/** The camera curve: slow anticipation, rapid acceleration, long smooth
 *  deceleration — and no overshoot, ever. A camera is the heaviest object
 *  in the frame and must not bounce. */
export const easeCamera: Ease = Easing.bezier(0.42, 0, 0.1, 1);

/** A decisive arrival for typography — quicker off the mark than the
 *  camera, still decelerating into rest rather than snapping to it. */
export const easeArrive: Ease = Easing.bezier(0.16, 0.72, 0.2, 1);

/** Leaving frame: build speed and keep it. Exits are shorter than
 *  entrances, so the tail does not need to be shaped. */
export const easeDepart: Ease = Easing.bezier(0.6, 0, 0.9, 0.35);
