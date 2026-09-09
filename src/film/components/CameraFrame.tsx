import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS} from '../theme';

type Props = {
  width: number;
  height: number;
  progress: number; // 0 = collapsed at center (born from the dot), 1 = fully framed
  strokeWidth?: number;
  cornerLength?: number;
};

const cornerBase: React.CSSProperties = {
  position: 'absolute',
  borderColor: FILM_COLORS.accent,
};

/**
 * Four corner brackets that grow outward from the center point — the red
 * dot literally expanding into a camera framing guide.
 */
export const CameraFrame: React.FC<Props> = ({
  width,
  height,
  progress,
  strokeWidth = 2.5,
  cornerLength = 34,
}) => {
  const w = interpolate(progress, [0, 1], [4, width]);
  const h = interpolate(progress, [0, 1], [4, height]);
  const len = interpolate(progress, [0, 1], [0, cornerLength]);
  const opacity = interpolate(progress, [0, 0.15, 1], [0, 1, 1]);

  return (
    <div style={{position: 'relative', width: w, height: h, opacity}}>
      <div style={{...cornerBase, top: 0, left: 0, width: len, height: strokeWidth, background: FILM_COLORS.accent}} />
      <div style={{...cornerBase, top: 0, left: 0, width: strokeWidth, height: len, background: FILM_COLORS.accent}} />

      <div style={{...cornerBase, top: 0, right: 0, width: len, height: strokeWidth, background: FILM_COLORS.accent}} />
      <div style={{...cornerBase, top: 0, right: 0, width: strokeWidth, height: len, background: FILM_COLORS.accent}} />

      <div style={{...cornerBase, bottom: 0, left: 0, width: len, height: strokeWidth, background: FILM_COLORS.accent}} />
      <div style={{...cornerBase, bottom: 0, left: 0, width: strokeWidth, height: len, background: FILM_COLORS.accent}} />

      <div style={{...cornerBase, bottom: 0, right: 0, width: len, height: strokeWidth, background: FILM_COLORS.accent}} />
      <div style={{...cornerBase, bottom: 0, right: 0, width: strokeWidth, height: len, background: FILM_COLORS.accent}} />
    </div>
  );
};
