import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';

type Props = {
  progress: number; // 0-1: the red line drawing itself into the wordmark
  fontSize: number;
  wordmarkWidth: number; // approximate rendered width at fontSize, tuned visually
};

/**
 * The final physical state of the red thread: a line draws itself out,
 * and the OFFSCRIPT wordmark reveals in lockstep with the line's leading
 * edge, then the line settles as a slim rule beneath the mark.
 */
export const OffscriptLogo: React.FC<Props> = ({progress, fontSize, wordmarkWidth}) => {
  const lineWidth = interpolate(progress, [0, 0.55], [0, wordmarkWidth], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const textReveal = interpolate(progress, [0.22, 0.82], [100, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const settle = interpolate(progress, [0.8, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineHeight = interpolate(settle, [0, 1], [10, 3]);
  const lineTranslateY = interpolate(settle, [0, 1], [0, fontSize * 0.72]);
  const textBlur = interpolate(progress, [0.2, 0.6], [6, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
      <div style={{position: 'relative', width: wordmarkWidth, height: fontSize * 1.05}}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%)`,
            width: wordmarkWidth,
            overflow: 'hidden',
            clipPath: `inset(0 ${textReveal}% 0 0)`,
          }}
        >
          <div
            style={{
              fontFamily: FILM_FONT,
              fontWeight: 800,
              fontSize,
              letterSpacing: 2,
              color: FILM_COLORS.primary,
              filter: `blur(${textBlur}px)`,
              whiteSpace: 'nowrap',
              textAlign: 'center',
            }}
          >
            OFFSCRIPT
          </div>
        </div>
      </div>
      <div
        style={{
          width: lineWidth,
          height: lineHeight,
          borderRadius: lineHeight,
          background: FILM_COLORS.accent,
          transform: `translateY(${-fontSize * 0.15 + lineTranslateY}px)`,
        }}
      />
    </div>
  );
};
