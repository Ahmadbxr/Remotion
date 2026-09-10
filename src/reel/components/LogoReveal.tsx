import React from 'react';
import {interpolate, Img, staticFile} from 'remotion';
import {springProgress, withOvershoot, SETTLE, TEXT} from '../motion/springs';
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
  exitStart,
  exitDuration = 12,
  style,
}) => {
  const p = springProgress(frame, start, start + duration, fps, SETTLE);
  const pPrev = springProgress(frame - 1, start, start + duration, fps, SETTLE);
  const scaleAt = (v: number) => withOvershoot(v, 0.88, 1, 0.05);
  const scale = scaleAt(p);
  const rotate = withOvershoot(p, fromRotate, 0, 0.15);
  const velocity = Math.abs(scale - scaleAt(pPrev));
  const blur = motionBlur(velocity, 0.05, 14);

  const hasExit = exitStart !== undefined;
  const exitP = hasExit ? springProgress(frame, exitStart, exitStart + exitDuration, fps, TEXT) : 0;
  const exitOpacity = interpolate(exitP, [0, 1], [1, 0]);
  const exitBlur = interpolate(exitP, [0, 1], [0, 16]);
  const exitScale = interpolate(exitP, [0, 1], [1, 0.9]);

  const opacity = p * exitOpacity;
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
