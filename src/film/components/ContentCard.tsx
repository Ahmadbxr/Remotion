import React from 'react';
import {FILM_COLORS} from '../theme';

type Props = {
  width: number;
  height: number;
  radius?: number;
  blur?: number;
  opacity?: number;
  scale?: number;
  translateX?: number;
  translateY?: number;
  rotate?: number;
  accentBar?: boolean;
  style?: React.CSSProperties;
};

/**
 * The minimal vertical content-card used across the feed, the process
 * chain, and the showcase beat — always the same visual grammar (1px
 * border, soft shadow, 20-32px radius) so it reads as one recurring object.
 */
export const ContentCard: React.FC<Props> = ({
  width,
  height,
  radius = 24,
  blur = 0,
  opacity = 1,
  scale = 1,
  translateX = 0,
  translateY = 0,
  rotate = 0,
  accentBar = false,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width,
      height,
      borderRadius: radius,
      background: FILM_COLORS.background,
      border: `1px solid ${FILM_COLORS.border}`,
      boxShadow: '0 14px 28px rgba(17,17,17,0.14)',
      opacity,
      filter: blur ? `blur(${blur}px)` : undefined,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale}) rotate(${rotate}deg)`,
      overflow: 'hidden',
      ...style,
    }}
  >
    {accentBar ? (
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          background: FILM_COLORS.accent,
        }}
      />
    ) : null}
  </div>
);
