import {interpolate} from 'remotion';

export type ScrollLayerState = {
  translateY: number;
  opacity: number;
  scale: number;
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * The outgoing half of a scroll transition: drifts up and slightly away.
 * `parallax` scales how far THIS layer travels relative to the base scroll
 * distance (1 = full distance, 0.85/0.7/0.35 = progressively calmer
 * background layers), which is what actually reads as depth rather than
 * everything sliding uniformly.
 */
export const scrollOut = (progress: number, parallax = 1): ScrollLayerState => {
  const p = clamp01(progress);
  return {
    translateY: interpolate(p, [0, 1], [0, -120 * parallax]),
    opacity: interpolate(p, [0, 1], [1, 0.6]),
    scale: interpolate(p, [0, 1], [1, 0.97]),
  };
};

/** The incoming half: arrives from below, already 60% visible (not a pop). */
export const scrollIn = (progress: number, parallax = 1): ScrollLayerState => {
  const p = clamp01(progress);
  return {
    translateY: interpolate(p, [0, 1], [140 * parallax, 0]),
    opacity: interpolate(p, [0, 1], [0.6, 1]),
    scale: interpolate(p, [0, 1], [1.03, 1]),
  };
};

export const scrollTransform = (s: ScrollLayerState) =>
  `translateY(${s.translateY}px) scale(${s.scale})`;
