import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

export const Individuality: React.FC = () => {
  const frame = useCurrentFrame();
  const lineWidth = interpolate(frame, [18, 55], [0, 180], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 90px',
      }}
    >
      <WhipIn delay={0}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 62,
            lineHeight: 1.15,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.ink,
          }}
        >
          Keine Vorlagen.
          <br />
          Jede Marke hat ihre
          <br />
          eigene Geschichte.
        </div>
      </WhipIn>
      <div
        style={{
          width: lineWidth,
          height: 4,
          marginTop: 34,
          borderRadius: 2,
          backgroundColor: COLORS.accent,
        }}
      />
    </AbsoluteFill>
  );
};
