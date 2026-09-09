import {interpolate, spring} from 'remotion';

type SpringOpts = {
  frame: number;
  fps: number;
  delay?: number;
  durationInFrames?: number;
};

/**
 * One consistent motion system for the whole film. Every named spring
 * shares the same physical character — fast acceleration, long smooth
 * deceleration, a perfectly damped rest, almost no overshoot — they only
 * differ in how quickly they settle. Nothing in this file uses a one-off
 * spring config; every animation in the composition goes through one of
 * these four.
 */

/** The default: hero-shape morphs, card transforms, most everything. */
export const premiumSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 0.9, stiffness: 90},
  });

/** Slightly slower settle — large holds, the final logo settle. */
export const gentleSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 1.4, stiffness: 65},
  });

/** Camera pushes / compressions — a touch snappier onset. */
export const cameraSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 0.6, stiffness: 130},
  });

/**
 * Typography only. Deliberately the gentlest of the four — Apple-style
 * headlines move only a few pixels, so the spring must be soft enough that
 * a 12-24px travel doesn't read as a snap.
 */
export const textSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 1.1, stiffness: 70},
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
