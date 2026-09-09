import {interpolate, spring} from 'remotion';

type SpringOpts = {
  frame: number;
  fps: number;
  delay?: number;
  durationInFrames?: number;
};

/**
 * ONE shared motion language for the whole film. Every animation reaches
 * for one of these six named presets — no more ad-hoc per-scene easing.
 * All six sit slightly underdamped (ratio ~0.72-0.92) except SMOOTH and
 * SETTLE, which land at/just past critical (ratio ~1.0-1.25): they are the
 * two presets used where a bounce would read as noise (big holds, the
 * final logo, camera pushes) — everywhere else gets one small, controlled
 * overshoot before resting.
 */

/** Fast cards / UI — hero-shape morphs, card transforms, most entrances. */
export const OFFSCRIPT_FAST = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 22, mass: 0.75, stiffness: 250},
  });

/** Smooth, no-bounce settle — typography-adjacent motion, quiet holds. */
export const OFFSCRIPT_SMOOTH = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 27, mass: 1, stiffness: 165},
  });

/** Strongest controlled overshoot — icon builds, completion lock-ins. */
export const OFFSCRIPT_OVERSHOOT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 20, mass: 0.7, stiffness: 270},
  });

/** Scroll transitions — fast main travel, long soft deceleration. */
export const OFFSCRIPT_SCROLL = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 25, mass: 0.9, stiffness: 205},
  });

/** Flip transitions — punchy, single-bounce 3D card turns. */
export const OFFSCRIPT_FLIP = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 24, mass: 0.8, stiffness: 260},
  });

/** Soft landing — camera pushes, the final logo settle. No bounce. */
export const OFFSCRIPT_SETTLE = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 30, mass: 1.15, stiffness: 125},
  });

export type SpringEngine = typeof OFFSCRIPT_FAST;

/**
 * A 0→1 progress clamped to [start, end], eased with a spring whose
 * duration exactly matches the window so it lands at rest precisely on
 * `end` — the "perfect rest" half of the core motion principle. This is
 * the TIMING driver (when things happen); it is deliberately clamped to
 * [0, 1] because it also gates stage-selection and opacity logic. Use
 * `withOvershoot` on top of it wherever the VALUE itself should overshoot.
 */
export const morphProgress = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  engine: SpringEngine = OFFSCRIPT_FAST,
) => {
  const raw = engine({
    frame,
    fps,
    delay: start,
    durationInFrames: Math.max(end - start, 1),
  });
  return Math.min(Math.max(raw, 0), 1);
};

/** Per-item delayed progress for staggered reveals (cards, words, bars). */
export const staggerProgress = (
  frame: number,
  index: number,
  {
    startFrame,
    staggerFrames = 5,
    durationInFrames = 24,
    fps,
    engine = OFFSCRIPT_FAST,
  }: {
    startFrame: number;
    staggerFrames?: number;
    durationInFrames?: number;
    fps: number;
    engine?: SpringEngine;
  },
) =>
  morphProgress(
    frame,
    startFrame + index * staggerFrames,
    startFrame + index * staggerFrames + durationInFrames,
    fps,
    engine,
  );

/** Clamped linear helper for local, non-spring ramps (opacity masks etc). */
export const ramp = (frame: number, start: number, end: number, fromV = 0, toV = 1) =>
  interpolate(frame, [start, end], [fromV, toV], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/**
 * The scroll transition's exact settle curve: ~85-90% of the travel is
 * covered fast, then the final stretch overshoots past `to` once and
 * corrects back — modeled directly on the film's reference y-position
 * example (150 → 10 → -7 → 2 → 0 over frames 0/8/11/15/19 of a 19-frame
 * move), expressed here as fractions of the total distance so it scales
 * to any from/to pair and any duration.
 */
export const scrollSettle = (p: number, from: number, to: number) => {
  const range = from - to;
  const fractions = [1, 0.0667, -0.0467, 0.0133, 0];
  const breakpoints = [0, 0.421, 0.579, 0.789, 1];
  const values = fractions.map((f) => to + range * f);
  return interpolate(p, breakpoints, values, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/**
 * Shapes a clamped 0→1 progress into a value that overshoots `to` by
 * `overshoot` (a fraction of the from→to distance) before settling back —
 * ONE bounce, never a cartoon oscillation. Directionally consistent by
 * construction: the peak is always `to + delta * overshoot`, so growth
 * overshoots larger, upward motion overshoots further up, shrinkage
 * overshoots smaller — whatever direction `delta` already points.
 * Breakpoints are skewed early (fast travel to the peak by 62%, a quick
 * pull back to a slight undershoot by 82%, then an 18%-of-duration soft
 * settle) so the last stretch of any movement gets proportionally more
 * time, per the film's "fast in, long soft settle" easing shape.
 */
export const withOvershoot = (
  p: number,
  from: number,
  to: number,
  overshoot = 0.03,
) => {
  const delta = to - from;
  const peak = to + delta * overshoot;
  const settleBack = to - delta * (overshoot * 0.3);
  return interpolate(p, [0, 0.62, 0.82, 1], [from, peak, settleBack, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
