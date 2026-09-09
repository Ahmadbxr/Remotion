import {interpolate} from 'remotion';
import {scrollSettle, withOvershoot} from '../springs';

export type ScrollLayerState = {
  translateY: number;
  opacity: number;
  scale: number;
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * The outgoing half of a scroll transition: drifts up and slightly away,
 * fast — it never needs to settle, it just has to be gone. `parallax`
 * scales how far THIS layer travels relative to the base scroll distance
 * (1 = full distance, 0.85/0.7/0.35 = progressively calmer background
 * layers), which is what actually reads as depth rather than everything
 * sliding uniformly.
 */
export const scrollOut = (progress: number, parallax = 1): ScrollLayerState => {
  const p = clamp01(progress);
  return {
    translateY: interpolate(p, [0, 0.7, 1], [0, -100 * parallax, -130 * parallax]),
    opacity: interpolate(p, [0, 0.55, 1], [1, 0.7, 0.55]),
    scale: interpolate(p, [0, 1], [1, 0.96]),
  };
};

/**
 * The incoming half: arrives from below fast (~85-90% of the travel is
 * covered by mid-progress), then the final stretch is pure deceleration —
 * one small overshoot past 0 and a soft correction back, via `scrollSettle`
 * — rather than a linear glide all the way in.
 */
export const scrollIn = (progress: number, parallax = 1): ScrollLayerState => {
  const p = clamp01(progress);
  return {
    translateY: scrollSettle(p, 150 * parallax, 0),
    opacity: interpolate(p, [0, 0.35, 1], [0.6, 0.92, 1]),
    scale: withOvershoot(p, 1.035, 1, 0.12),
  };
};

export const scrollTransform = (s: ScrollLayerState) =>
  `translateY(${s.translateY}px) scale(${s.scale})`;
