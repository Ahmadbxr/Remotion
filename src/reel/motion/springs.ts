import {interpolate, spring} from 'remotion';

// ---------------------------------------------------------------------------
// Named spring presets — reserved for objects that should feel PHYSICALLY
// WEIGHTED and settle (icons, cards, impact words). Directed camera-like
// moves (scrolls, wipes, exits) use easings.ts instead — per the brief,
// not every transition should bounce toward its destination.
// ---------------------------------------------------------------------------
type SpringOpts = {frame: number; fps: number; delay?: number; durationInFrames?: number};

export const MICRO = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 30, mass: 0.4, stiffness: 420}});

export const UI = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 26, mass: 0.55, stiffness: 320}});

export const TEXT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 24, mass: 0.6, stiffness: 290}});

export const CARD = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 21, mass: 0.95, stiffness: 150}});

export const IMPACT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 13, mass: 0.85, stiffness: 270}});

export const HERO = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 17, mass: 1.1, stiffness: 205}});

export const SETTLE = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 28, mass: 1, stiffness: 130}});

export type SpringEngine = typeof TEXT;

/** Clamped 0->1 progress driven by a named spring engine. */
export const springProgress = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  engine: SpringEngine = TEXT,
) => {
  const raw = engine({frame, fps, delay: start, durationInFrames: Math.max(end - start, 1)});
  return Math.min(Math.max(raw, 0), 1);
};

/** Directionally-consistent single overshoot: from -> peak (past `to`) ->
 *  settle back to exactly `to`. Reserve larger `overshoot` for key moments
 *  only — most UI motion in this Reel should be subtle (0.03-0.06). */
export const withOvershoot = (p: number, from: number, to: number, overshoot = 0.045) => {
  const delta = to - from;
  const peak = to + delta * overshoot;
  const settleBack = to - delta * (overshoot * 0.3);
  return interpolate(p, [0, 0.6, 0.82, 1], [from, peak, settleBack, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};
