import {interpolate} from 'remotion';

// ---------------------------------------------------------------------------
// Everything visual-effect-from-motion in the Reel goes through here.
// Callers measure an actual frame-to-frame delta of the thing that's
// moving and pass it in — never a hand-authored blur/rotation curve. Blur
// is structurally exactly 0 the instant motion stops.
// ---------------------------------------------------------------------------

/** velocity -> blur radius (px). 0 at rest, rising toward maxBlur. */
export const motionBlur = (velocity: number, maxVelocity: number, maxBlur: number) =>
  interpolate(Math.abs(velocity), [0, maxVelocity], [0, maxBlur], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** velocity -> a tiny secondary rotation (deg) — faster movement reads as
 *  slightly less rigid. Kept small; this is a whisper, not a wobble. */
export const velocityTilt = (velocity: number, maxVelocity: number, maxDeg: number) =>
  interpolate(velocity, [-maxVelocity, 0, maxVelocity], [-maxDeg, 0, maxDeg], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

/** A directional stretch approximation: elongates an element slightly
 *  along its axis of travel while it's blurred, snapping back to 1 at
 *  rest — reads as directional blur without a true multi-sample blur. */
export const velocityStretch = (velocity: number, maxVelocity: number, maxStretch = 0.1) =>
  1 + interpolate(Math.abs(velocity), [0, maxVelocity], [0, maxStretch], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
