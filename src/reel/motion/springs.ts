import {spring} from 'remotion';
import {smoothKeys} from './curves';

// ---------------------------------------------------------------------------
// MASS CLASSES.
//
// Every engine below is critically damped or heavier (damping >= 2*sqrt(k*m)),
// which is deliberate and is the single biggest change in this pass. The
// previous IMPACT preset had a damping ratio of 0.43 — it oscillated well
// past its target, and `springProgress` then CLAMPED that oscillation at 1.
// A clamp is a velocity cliff: the value slammed into a wall, stopped dead,
// then travelled backwards as the spring swung under 1 again, and the
// non-linear pose curve on top of it turned that into visible rubber.
//
// So: these engines are TIMING DRIVERS ONLY. They are monotone, they never
// exceed 1, and the clamp in `springProgress` is now a no-op. Every visible
// overshoot in the Reel comes from `withOvershoot`, where it is one number
// you can read, audit and cap — not an emergent property of a spring
// constant. Different classes still feel different because their mass and
// stiffness differ; they just no longer bounce on their own.
//
//   class     mass      behaviour
//   CAMERA    heavy     smooth, deliberate, NEVER overshoots
//   HERO      med-heavy fast, small overshoot at the call site
//   TEXT      medium    snappy
//   UI        light     quick response
//   MICRO     v. light  very fast
// ---------------------------------------------------------------------------
type SpringOpts = {frame: number; fps: number; delay?: number; durationInFrames?: number};

/** Very light, very fast — ticks, tiny badges. crit = 2*sqrt(420*0.4) = 25.9 */
export const MICRO = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 27, mass: 0.4, stiffness: 420}});

/** Light — icons, small UI. crit = 2*sqrt(320*0.55) = 26.5 */
export const UI = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 28, mass: 0.55, stiffness: 320}});

/** Medium — a kinetic word settling. crit = 2*sqrt(290*0.6) = 26.4 */
export const TEXT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 27, mass: 0.6, stiffness: 290}});

/** Light-medium — cards, chips. crit = 2*sqrt(150*0.95) = 23.9 */
export const CARD = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 25, mass: 0.95, stiffness: 150}});

/** Heavy and fast — the words that land. crit = 2*sqrt(270*0.85) = 30.3 */
export const IMPACT = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 31, mass: 0.85, stiffness: 270}});

/** Medium-heavy — hero typography. crit = 2*sqrt(205*1.1) = 30.0 */
export const HERO = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 31, mass: 1.1, stiffness: 205}});

/** Slow and soft — closing lockups. crit = 2*sqrt(130*1) = 22.8 */
export const SETTLE = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 24, mass: 1, stiffness: 130}});

/** The camera. Heaviest thing in the Reel and deliberately OVERDAMPED
 *  (ratio 1.12) — the camera must never bounce, because a camera has no
 *  reason to. crit = 2*sqrt(90*1.6) = 24.0 */
export const CAMERA = ({frame, fps, delay = 0, durationInFrames}: SpringOpts) =>
  spring({frame: frame - delay, fps, durationInFrames, config: {damping: 27, mass: 1.6, stiffness: 90}});

export type SpringEngine = typeof TEXT;

/** Monotone 0->1 progress driven by a named mass class. The clamp is a
 *  safety net, not a mechanism — none of the engines above reach it. */
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

/**
 * The Reel's ONE overshoot profile: accelerate -> a single visible
 * overshoot -> one small counter-correction -> settle, arriving with zero
 * velocity.
 *
 *   from -> to+6% -> to-1.5% -> to
 *
 * Restrained on purpose. The failure mode this replaces is rubber:
 * 1.15 / 0.9 / 1.08 / 0.95 / 1. Professional UI motion needs one overshoot
 * and one tiny correction, so that is all this offers — the only knob is
 * how big the single overshoot is, and 0.06 is the house default.
 *
 * Interpolation is monotone cubic Hermite rather than `interpolate`'s
 * straight lines, so the apex is a smooth turn instead of a corner, and the
 * final pose is approached at a decelerating rate instead of being reached
 * at full speed and stopped.
 */
export const withOvershoot = (p: number, from: number, to: number, overshoot = 0.06) => {
  const delta = to - from;
  if (delta === 0) return to;
  if (overshoot <= 0) return from + delta * Math.min(Math.max(p, 0), 1);
  return smoothKeys(
    p,
    [0, 0.62, 0.85, 1],
    [from, to + delta * overshoot, to - delta * overshoot * 0.25, to],
  );
};
