import {interpolate, spring} from 'remotion';

type SpringOpts = {
  frame: number;
  fps: number;
  delay?: number;
  durationInFrames?: number;
};

/**
 * One consistent motion system for the whole film — fast acceleration,
 * a long smooth deceleration, minimal overshoot, no visible bounce. All
 * four configs sit just past critical damping (ratio ~1.1-1.7), which is
 * what actually reads as "premium" rather than "sluggish": snappy onset,
 * soft landing, never mushy.
 */

/** The default: hero-shape morphs, card transforms, most transitions. */
export const premiumSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 30, mass: 0.8, stiffness: 200},
  });

/** Slower settle — large holds, the final logo settle. */
export const gentleSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 34, mass: 1, stiffness: 100},
  });

/** Camera pushes / longer compressions — heavier, more overdamped. */
export const cameraSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 33, mass: 1, stiffness: 115},
  });

/** Typography — a touch softer than premium so large text never snaps. */
export const textSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 28, mass: 0.9, stiffness: 170},
  });

/** Flip / scroll transitions between services — the snappiest of the five. */
export const flipSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 29, mass: 0.75, stiffness: 220},
  });

export type SpringEngine = typeof premiumSpring;

/**
 * A 0→1 progress clamped to [start, end], eased with a spring whose
 * duration exactly matches the window so it lands at rest precisely on
 * `end` — the "perfect rest" half of the core motion principle.
 */
export const morphProgress = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  engine: SpringEngine = premiumSpring,
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
    engine = premiumSpring,
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
