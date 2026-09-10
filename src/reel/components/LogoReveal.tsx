import React from 'react';
import {interpolate, Img, staticFile} from 'remotion';
import {springProgress, withOvershoot, SETTLE, TEXT} from '../motion/springs';
import {smoothKeys} from '../motion/curves';
import {motionBlur} from '../motion/velocity';

type Props = {
  frame: number;
  fps: number;
  start: number;
  width: number;
  duration?: number;
  /** A small counter-rotation the logo settles OUT of — pairs with the
   *  hero statement's own rotate-down-to-resolve exit for a match
   *  transformation at the same anchor point. */
  fromRotate?: number;
  /** Arrive already blurred and undersized, resolving to sharp — this is
   *  what lets a match cut land INSIDE the blur, with no frame where the
   *  outgoing typography is still legible behind the logo. */
  fromBlur?: number;
  fromScale?: number;
  /** Frames over which opacity ramps in. Kept short for a match cut. */
  fadeIn?: number;
  /** Optional fade-out. Omit for a closing lockup that holds to the end —
   *  every earlier use of this component MUST set this, or it persists
   *  forever and collides with whatever renders after it. */
  exitStart?: number;
  exitDuration?: number;
  style?: React.CSSProperties;
};

/** The real logo asset, unaltered. */
export const LogoReveal: React.FC<Props> = ({
  frame,
  fps,
  start,
  width,
  duration = 16,
  fromRotate = 0,
  fromBlur = 0,
  fromScale = 0.88,
  fadeIn,
  exitStart,
  exitDuration = 12,
  style,
}) => {
  const p = springProgress(frame, start, start + duration, fps, SETTLE);
  const pPrev = springProgress(frame - 1, start, start + duration, fps, SETTLE);
  const scaleAt = (v: number) => withOvershoot(v, fromScale, 1, 0.05);
  const scale = scaleAt(p);
  // The logo is a heavy object settling: one small overshoot, no wobble.
  const rotate = withOvershoot(p, fromRotate, 0, 0.06);
  const velocity = Math.abs(scale - scaleAt(pPrev));
  // An explicit arrival blur that resolves fast (front-loaded, so the logo
  // is already sharp well before it finishes settling) plus the usual
  // velocity blur.
  // Smooth-keyed so the blur eases off instead of hitting 0 at full rate
  // and stopping — a blur that snaps off is as visible as a position jump.
  const arrivalBlur = Math.max(0, smoothKeys(p, [0, 0.45, 1], [fromBlur, 0, 0]));
  const blur = motionBlur(velocity, 0.05, 14) + arrivalBlur;

  const hasExit = exitStart !== undefined;
  const exitP = hasExit ? springProgress(frame, exitStart, exitStart + exitDuration, fps, TEXT) : 0;
  const exitOpacity = interpolate(exitP, [0, 1], [1, 0]);
  const exitBlur = interpolate(exitP, [0, 1], [0, 16]);
  const exitScale = interpolate(exitP, [0, 1], [1, 0.9]);

  const enterOpacity = fadeIn === undefined ? p : interpolate(frame, [start, start + fadeIn], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const opacity = enterOpacity * exitOpacity;
  const totalBlur = blur + exitBlur;

  return (
    <Img
      src={staticFile('offscript-logo.png')}
      style={{
        width,
        opacity,
        filter: totalBlur ? `blur(${totalBlur}px)` : undefined,
        transform: `rotate(${rotate}deg) scale(${scale * exitScale})`,
        ...style,
      }}
    />
  );
};
