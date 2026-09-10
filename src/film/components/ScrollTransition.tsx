import {interpolate} from 'remotion';
import {scrollSettle, getMotionBlur} from '../springs';

export type ScrollLayerState = {
  translateY: number;
  opacity: number;
  scale: number;
  /** Velocity-derived, 0 unless a `progressPrev` was supplied — see below. */
  blur: number;
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

// Icons get a much lighter motion blur than text, and only while the layer
// is spatially moving — never during its own path-drawing.
const MAX_SCROLL_VELOCITY = 16; // px/frame — a fast stretch of the travel
const MAX_ICON_BLUR = 7;

/**
 * The outgoing half of a scroll transition: drifts up and slightly away,
 * fast — it never needs to settle, it just has to be gone. `parallax`
 * scales how far THIS layer travels relative to the base scroll distance
 * (1 = full distance, 0.85/0.7/0.35 = progressively calmer background
 * layers), which is what actually reads as depth rather than everything
 * sliding uniformly. Pass `progressPrev` (the same progress one frame
 * earlier) to get real velocity-based `blur`; omit it for zero blur.
 */
export const scrollOut = (progress: number, parallax = 1, progressPrev?: number): ScrollLayerState => {
  const p = clamp01(progress);
  const pPrev = clamp01(progressPrev ?? progress);
  const travel = (v: number) => interpolate(v, [0, 0.7, 1], [0, -125 * parallax, -160 * parallax]);
  const translateY = travel(p);
  const blur = getMotionBlur(translateY - travel(pPrev), MAX_SCROLL_VELOCITY, MAX_ICON_BLUR);
  return {
    translateY,
    opacity: interpolate(p, [0, 0.55, 1], [1, 0.7, 0.55]),
    scale: interpolate(p, [0, 1], [1, 0.96]),
    blur,
  };
};

/**
 * The incoming half: arrives from below fast (~85-90% of the travel is
 * covered by mid-progress), then the final stretch is pure deceleration —
 * one small overshoot past 0 and a soft correction back, via `scrollSettle`
 * — rather than a linear glide all the way in. `scrollSettle` (position)
 * is the one overshoot this container owns; scale here is a plain
 * monotonic ease on purpose. Both callers of this (the icon, via CardFace,
 * and the label, via MaskText) already own their own content-level scale
 * overshoot — a second one here, on the same scale value at the same time,
 * would read as a double pop rather than one settle. Pass `progressPrev`
 * for real velocity-based `blur`; omit it for zero blur.
 */
export const scrollIn = (progress: number, parallax = 1, progressPrev?: number): ScrollLayerState => {
  const p = clamp01(progress);
  const pPrev = clamp01(progressPrev ?? progress);
  const travel = (v: number) => scrollSettle(v, 175 * parallax, 0);
  const translateY = travel(p);
  const blur = getMotionBlur(translateY - travel(pPrev), MAX_SCROLL_VELOCITY, MAX_ICON_BLUR);
  return {
    translateY,
    opacity: interpolate(p, [0, 0.35, 1], [0.6, 0.92, 1]),
    scale: interpolate(p, [0, 1], [1.035, 1]),
    blur,
  };
};

export const scrollTransform = (s: ScrollLayerState) =>
  `translateY(${s.translateY}px) scale(${s.scale})`;
