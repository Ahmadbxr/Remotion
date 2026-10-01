import {interpolate} from 'remotion';
import {Ease, easeProgress, easeCamera} from './easings';

// ---------------------------------------------------------------------------
// THE VIRTUAL CAMERA.
//
// A dolly: one magnification about one focal point. Two rules make it a
// camera rather than a scale animation on the root container.
//
// 1. IT IS EXACTLY IDENTITY WHEN IT IS NOT MOVING. Not `scale(1)` — no
//    transform property at all. A permanent non-integer scale on the root
//    puts every glyph in the Reel on a composited layer and its edges
//    resample frame to frame; that is the shimmer this project has already
//    chased down twice. So every move either returns to 1, or ends inside a
//    moment where the frame is a solid colour and the reset is invisible.
//
// 2. IT CROPS, SO IT IS ONLY USED WHERE CROPPING IS THE POINT. Pushing in
//    about a focal point carries everything away from that point, which will
//    happily march a headline out of the safe area. The dolly is therefore
//    reserved for the two pass-throughs where the typography is MEANT to
//    exceed the viewport. Every other camera move in the Reel is expressed
//    through the depth system instead — layers receding or advancing in Z,
//    which changes their size without moving the frame's edges.
//
// The camera has mass: `easeCamera` by default, never a spring, and never a
// shake. Impact comes from velocity, depth and timing.
// ---------------------------------------------------------------------------

export type CameraMove = {
  start: number;
  end: number;
  from: number;
  to: number;
  /** Focal point in frame coordinates — what the camera is aimed at. */
  fx: number;
  fy: number;
  ease?: Ease;
};

export type CameraState = {
  scale: number;
  fx: number;
  fy: number;
  /** Frame-to-frame magnification change, for velocity-derived blur. */
  velocity: number;
  moving: boolean;
};

const scaleAt = (frame: number, moves: CameraMove[]) => {
  let scale = 1;
  let fx = 540;
  let fy = 960;
  for (const m of moves) {
    if (frame >= m.end) {
      scale = m.to;
      fx = m.fx;
      fy = m.fy;
    } else if (frame > m.start) {
      scale = interpolate(easeProgress(frame, m.start, m.end, m.ease ?? easeCamera), [0, 1], [m.from, m.to]);
      fx = m.fx;
      fy = m.fy;
      break;
    } else {
      break;
    }
  }
  return {scale, fx, fy};
};

export const cameraAt = (frame: number, moves: CameraMove[]): CameraState => {
  const now = scaleAt(frame, moves);
  const prev = scaleAt(frame - 1, moves);
  const velocity = now.scale - prev.scale;
  return {
    ...now,
    velocity,
    // A hair of tolerance so a curve's last thousandth does not keep the
    // transform alive for frames that should be perfectly static.
    moving: Math.abs(now.scale - 1) > 0.0015,
  };
};

/**
 * How much the depth planes separate for a given camera magnification.
 *
 * This is what stops a push from being a flat scale on everything: as the
 * camera closes in, the near plane grows faster than the far one, exactly
 * as it would through a real lens. Gain is 1 when the camera is at rest, so
 * a still camera changes nothing about the layout it is looking at.
 */
export const depthGain = (scale: number, strength = 1.5) => 1 + (scale - 1) * strength;
