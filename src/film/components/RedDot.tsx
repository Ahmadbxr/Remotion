import React from 'react';
import {FILM_COLORS} from '../theme';

type Props = {
  size: number;
  opacity?: number;
  glow?: number;
  style?: React.CSSProperties;
};

/**
 * The persistent red thread: the same visual unit reappears at every major
 * joint of the film (hook dot, process idea/cursor, payoff line) so the red
 * accent reads as one continuous element rather than repeated decoration.
 */
export const RedDot: React.FC<Props> = ({size, opacity = 1, glow = 0, style}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size,
      backgroundColor: FILM_COLORS.accent,
      opacity,
      boxShadow: glow > 0 ? `0 0 ${glow}px ${glow / 2}px rgba(242,5,5,0.45)` : undefined,
      ...style,
    }}
  />
);
