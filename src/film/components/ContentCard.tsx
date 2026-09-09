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
      width,
      height,
      borderRadius: radius,
      background: 'linear-gradient(155deg, #131313 0%, #0A0A0A 100%)',
      border: `1px solid ${FILM_COLORS.border}`,
      boxShadow: '0 24px 50px rgba(0,0,0,0.5)',
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
