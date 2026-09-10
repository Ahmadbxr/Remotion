import React from 'react';
import {interpolate, Img, staticFile} from 'remotion';
import {progress, withOvershoot, motionBlur, SETTLE, SNAPPY_TEXT} from '../springs';

type Props = {
  frame: number;
  fps: number;
  start: number;
  width: number;
  duration?: number;
  /** Optional fade-out — omit for a closing lockup that should hold to the
   *  end. Without this, an earlier reveal instance would stay on screen
   *  forever and collide with everything rendered after it. */
  exitStart?: number;
  exitDuration?: number;
  style?: React.CSSProperties;
};

/** The real logo asset, unaltered — a slight scale-up-from-blur arrival
 *  with a single controlled settle, never recreated as text. */
export const LogoReveal: React.FC<Props> = ({frame, fps, start, width, duration = 18, exitStart, exitDuration = 12, style}) => {
  const p = progress(frame, start, start + duration, fps, SETTLE);
  const pPrev = progress(frame - 1, start, start + duration, fps, SETTLE);
  const scaleAt = (v: number) => withOvershoot(v, 0.9, 1, 0.045);
  const scale = scaleAt(p);
  const velocity = Math.abs(scale - scaleAt(pPrev));
  const blur = motionBlur(velocity, 0.05, 14);

  const hasExit = exitStart !== undefined;
  const exitP = hasExit ? progress(frame, exitStart, exitStart + exitDuration, fps, SNAPPY_TEXT) : 0;
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
        transform: `scale(${scale * exitScale})`,
        ...style,
      }}
    />
  );
};
