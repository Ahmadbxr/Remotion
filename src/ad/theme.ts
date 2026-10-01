// Motion + type tokens for the ad. Colours come from config.ts (BRAND).
// Linear easing is not used anywhere in this film.
import {Easing} from 'remotion';
import {BRAND} from './config';

export const C = BRAND.colors;

export const EASE = {
  // entrances: fast start, long glide
  out: Easing.bezier(0.16, 1, 0.3, 1),
  // large card moves: decisive acceleration, long Apple-like deceleration
  smooth: Easing.bezier(0.45, 0, 0.15, 1),
  // symmetrical moves / camera-like drifts
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  inOutSine: Easing.bezier(0.37, 0, 0.63, 1),
  outSine: Easing.bezier(0.61, 1, 0.88, 1),
  // card settles into place with ~3 % overshoot (measured peak 1.030)
  settle: Easing.bezier(0.25, 1.3, 0.4, 1),
  // shape morphs: starts from rest (no velocity step), settles with 3.3 % overshoot
  morph: Easing.bezier(0.5, 0, 0.2, 1.25),
  // exits: faster than entrances, accelerate away
  in: Easing.bezier(0.6, 0, 0.8, 0.3),
} as const;

export const FONT = {
  display: `'${BRAND.fonts.display}', '${BRAND.fonts.text}', sans-serif`,
  text: `'${BRAND.fonts.text}', sans-serif`,
};

export const TYPE = {
  tracking: '-0.035em',
  trackingSmall: '-0.01em',
  eyebrowTracking: '0.16em',
};

// Two-stage soft shadow: contact + ambient. Never a hard drop shadow.
export const SHADOW = {
  card: '0 2px 6px rgba(17,17,17,0.06), 0 22px 48px -14px rgba(17,17,17,0.22)',
  lifted: '0 4px 10px rgba(17,17,17,0.08), 0 40px 80px -22px rgba(17,17,17,0.30)',
  cta: '0 6px 16px rgba(201,4,4,0.20), 0 34px 70px -20px rgba(201,4,4,0.45)',
};
