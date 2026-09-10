import {interpolate, spring} from 'remotion';

// ---------------------------------------------------------------------------
// A small, named motion-preset system — every animation in the Reel reaches
// for one of these, never a bespoke one-off spring. Values are grounded in
// the installed motion-design skills' spring/damping tables (LottieFiles
// `reference/timing-easing-tables.md` "Spring Parameters", and the Remotion
// motion-designer skill's four "core spring personalities"), tuned per the
// brief's own taxonomy in section 21.
// ---------------------------------------------------------------------------

type SpringOpts = {frame: number; fps: number; delay?: number; durationInFrames?: number};

/** Kinetic typography: fast, precise, only a small controlled overshoot. */
export const SNAPPY_TEXT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 24, mass: 0.55, stiffness: 300}});

/** Impact words / hero hits: strong velocity, visible overshoot. */
export const IMPACT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 13, mass: 0.85, stiffness: 270}});

/** Cards / UI panels: softer spring, smooth settle, light overshoot. */
export const SOFT_CARD = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 21, mass: 1, stiffness: 145}});

/** Micro UI (ticks, tiny badges, icon strokes): very fast, almost no bounce. */
export const UI_MICRO = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 30, mass: 0.45, stiffness: 420}});

/** Large/hero transitions: strong initial velocity, controlled arrival. */
export const HERO = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 17, mass: 1.1, stiffness: 210}});

/** No-bounce settle: the logo, the final CTA lockup — premium, not playful. */
export const SETTLE = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 28, mass: 1, stiffness: 130}});

export type SpringEngine = typeof SNAPPY_TEXT;

/** Clamped 0→1 progress driven by a named spring engine, timed to land at
 *  rest exactly at `end`. The timing driver everywhere in the Reel. */
export const progress = (
  frame: number,
  start: number,
  end: number,
  fps: number,
  engine: SpringEngine = SNAPPY_TEXT,
) => {
  const raw = engine({frame, fps, delay: start, durationInFrames: Math.max(end - start, 1)});
  return Math.min(Math.max(raw, 0), 1);
};

/** Directionally-consistent single-overshoot curve: from -> peak (beyond
 *  `to`) -> settle back to exactly `to`. Growth overshoots bigger, upward
 *  motion overshoots further up — always in the direction `delta` points. */
export const withOvershoot = (p: number, from: number, to: number, overshoot = 0.06) => {
  const delta = to - from;
  const peak = to + delta * overshoot;
  const settleBack = to - delta * (overshoot * 0.3);
  return interpolate(p, [0, 0.6, 0.82, 1], [from, peak, settleBack, to], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
};

/** Measured per-frame velocity -> blur radius. The one place blur amount is
 *  decided anywhere in the Reel: 0 at rest, rising toward `maxBlur` as
 *  `velocity` nears `maxVelocity`. Never a hand-authored blur curve. */
export const motionBlur = (velocity: number, maxVelocity: number, maxBlur: number) =>
  interpolate(Math.abs(velocity), [0, maxVelocity], [0, maxBlur], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** Anticipation: a brief pre-move opposite the main direction before the
 *  main spring takes over — 2-5px, 3-6 frames, per section 16. Returns a
 *  0-1 "pull-back" amount that a caller subtracts from its own displacement
 *  during the anticipation window, and which is 0 once the main move starts. */
export const anticipation = (frame: number, start: number, fps: number, lengthFrames = 5) => {
  const t = (frame - start) / lengthFrames;
  if (t < 0 || t > 1) return 0;
  return Math.sin(t * Math.PI); // rises then returns to 0, peaking mid-window
};
