// Frame-pure animation helpers. Every function is deterministic in `frame`.
import {interpolate} from 'remotion';
import {EASE} from './theme';

export type EasingFn = (t: number) => number;

export type Rect = {
  x: number;
  y: number;
  w: number;
  h: number;
  r: number; // corner radius
  rot?: number; // deg, z rotation
  ry?: number; // deg, rotation in depth
  o?: number; // opacity
  s?: number; // extra uniform scale about the centre
};

export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** eased 0..1 progress of `frame` across [a, b] */
export const prog = (frame: number, a: number, b: number, ease: EasingFn = EASE.out) =>
  ease(clamp01((frame - a) / Math.max(1e-6, b - a)));

/** clamped, eased interpolate — the only way values are tweened in this film */
export const tw = (
  frame: number,
  input: [number, number],
  output: [number, number],
  ease: EasingFn = EASE.out,
) =>
  interpolate(frame, input, output, {
    easing: ease,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerpRect = (a: Rect, b: Rect, t: number): Rect => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
  w: lerp(a.w, b.w, t),
  h: lerp(a.h, b.h, t),
  r: lerp(a.r, b.r, t),
  rot: lerp(a.rot ?? 0, b.rot ?? 0, t),
  ry: lerp(a.ry ?? 0, b.ry ?? 0, t),
  o: lerp(a.o ?? 1, b.o ?? 1, t),
  s: lerp(a.s ?? 1, b.s ?? 1, t),
});

export type Key = {f: number; v: Rect; e?: EasingFn};

/** Keyframed rectangle. The easing on a key shapes the segment arriving at it. */
export const track = (frame: number, keys: Key[]): Rect => {
  if (frame <= keys[0].f) return lerpRect(keys[0].v, keys[0].v, 0);
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (frame <= b.f) {
      const t = clamp01((frame - a.f) / Math.max(1e-6, b.f - a.f));
      return lerpRect(a.v, b.v, (b.e ?? EASE.smooth)(t));
    }
  }
  const last = keys[keys.length - 1].v;
  return lerpRect(last, last, 0);
};

export type NumKey = [number, number, EasingFn?];

/** Keyframed number, same semantics as track(). */
export const numTrack = (frame: number, keys: NumKey[]): number => {
  if (frame <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [fa, va] = keys[i - 1];
    const [fb, vb, e] = keys[i];
    if (frame <= fb) {
      const t = clamp01((frame - fa) / Math.max(1e-6, fb - fa));
      return lerp(va, vb, (e ?? EASE.smooth)(t));
    }
  }
  return keys[keys.length - 1][1];
};

/** speed of a rect in px/frame — drives velocity-based motion blur */
export const rectSpeed = (frame: number, keys: Key[]) => {
  const a = track(frame - 1, keys);
  const b = track(frame, keys);
  return Math.abs(b.x - a.x) + Math.abs(b.y - a.y) + 0.5 * (Math.abs(b.w - a.w) + Math.abs(b.h - a.h));
};

export const scaleRect = (r: Rect, k: number): Rect => ({
  ...r,
  x: r.x + (r.w * (1 - k)) / 2,
  y: r.y + (r.h * (1 - k)) / 2,
  w: r.w * k,
  h: r.h * k,
  r: r.r * k,
});

export const centerOf = (r: Rect) => ({cx: r.x + r.w / 2, cy: r.y + r.h / 2});

/** move rect r so that it shrinks toward point (px,py) by factor k */
export const toward = (r: Rect, px: number, py: number, k: number): Rect => {
  const {cx, cy} = centerOf(r);
  const ncx = px + (cx - px) * k;
  const ncy = py + (cy - py) * k;
  const w = r.w * k;
  const h = r.h * k;
  return {...r, x: ncx - w / 2, y: ncy - h / 2, w, h, r: r.r * k};
};

const hex = (c: string) => {
  const v = c.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(v.slice(i, i + 2), 16));
};
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  const k = clamp01(t);
  const c = A.map((x, i) => Math.round(x + (B[i] - x) * k));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

/** deterministic pseudo-random in [0,1) from an integer seed (no Math.random) */
export const hash01 = (n: number) => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);
};
