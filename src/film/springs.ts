import {interpolate, spring} from 'remotion';

type SpringOpts = {
  frame: number;
  fps: number;
  delay?: number;
  durationInFrames?: number;
};

/**
 * The film's default motion signature: fast acceleration, long smooth
 * deceleration, and a perfectly damped rest — no overshoot, no bounce.
 */
export const smoothSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 0.9, stiffness: 90},
  });

/** Sharper onset for quick beats: digit ticks, dot pops, snap-ins. */
export const fastSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 0.4, stiffness: 260},
  });

/** Gentle, unhurried settle for camera moves and large holds. */
export const slowSpring = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({
    frame: frame - delay,
    fps,
    durationInFrames,
    config: {damping: 200, mass: 1.6, stiffness: 60},
  });

/**
 * A 0→1 morph progress clamped to [start, end], eased with a spring whose
 * duration exactly matches the window so it lands at rest precisely on
 * `end` — the "perfect rest" half of the core motion principle.
 */
export const morphProgress = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  fast = false,
) => {
  const engine = fast ? fastSpring : smoothSpring;
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
    fast = false,
  }: {
    startFrame: number;
    staggerFrames?: number;
    durationInFrames?: number;
    fps: number;
    fast?: boolean;
  },
) => morphProgress(frame, startFrame + index * staggerFrames, startFrame + index * staggerFrames + durationInFrames, fps, fast);

/**
 * Continuous virtual-camera push: scale + blur + vertical drift, used at
 * scene joins so the viewer feels like they travelled through the frame
 * rather than watching a cut.
 */
export const cameraPush = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  opts: {fromScale?: number; toScale?: number; blurPeak?: number; drift?: number} = {},
) => {
  const {fromScale = 1, toScale = 1.35, blurPeak = 18, drift = -40} = opts;
  const p = morphProgress(frame, start, end, fps, true);
  const scale = interpolate(p, [0, 1], [fromScale, toScale]);
  const blur = interpolate(p, [0, 0.5, 1], [0, blurPeak, 0]);
  const translateY = interpolate(p, [0, 1], [0, drift]);
  return {scale, blur, translateY, progress: p};
};

/** Clamped linear helper used throughout for local, non-spring ramps. */
export const ramp = (
  frame: number,
  start: number,
  end: number,
  fromV = 0,
  toV = 1,
) =>
  interpolate(frame, [start, end], [fromV, toV], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
