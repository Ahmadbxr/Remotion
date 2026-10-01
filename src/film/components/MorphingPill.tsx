import React from 'react';
import {FILM_COLORS} from '../theme';

type Props = {
  width: number;
  height: number;
  radius: number;
  background: string;
  borderColor?: string;
  borderWidth?: number;
  shadow?: number;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * The film's single recurring "anchor" shape. Its geometry is driven
 * entirely by the caller's interpolated width/height/radius/background, so
 * the same element can read as a dot, a pill, a card, or a full-bleed
 * canvas without ever swapping components mid-morph.
 */
export const MorphingPill: React.FC<Props> = ({
  width,
  height,
  radius,
  background,
  borderColor = 'transparent',
  borderWidth = 0,
  shadow = 0,
  children,
  style,
}) => (
  <div
    style={{
      width,
      height,
      borderRadius: radius,
      background,
      border: borderWidth ? `${borderWidth}px solid ${borderColor}` : undefined,
      boxShadow: shadow
        ? `0 ${shadow * 0.6}px ${shadow * 1.6}px rgba(17,17,17,0.16)`
        : undefined,
      // Deliberately not flex + justify-content: center — that combination
      // applies "safe alignment" when a child overflows (falls back to
      // start instead of clipping), which lets oversized content escape
      // overflow: hidden entirely. Children center themselves instead.
      overflow: 'hidden',
      position: 'relative',
      ...style,
    }}
  >
    {children}
  </div>
);

export const pillDefaults = {
  background: FILM_COLORS.accent,
};
