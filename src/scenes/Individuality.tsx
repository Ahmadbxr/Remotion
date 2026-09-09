import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

export const Individuality: React.FC = () => {
  const frame = useCurrentFrame();
  const lineWidth = interpolate(frame, [20, 60], [0, 220], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 160px',
      }}
    >
      <EnterText delay={0}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: 76,
            lineHeight: 1.15,
            letterSpacing: -1.5,
            textAlign: 'center',
            color: COLORS.foreground,
          }}
        >
          Keine Vorlagen.
          <br />
          Jede Marke hat ihre eigene Geschichte.
        </div>
      </EnterText>
      <div
        style={{
          width: lineWidth,
          height: 3,
          marginTop: 40,
          borderRadius: 2,
          background: `linear-gradient(90deg, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
        }}
      />
    </AbsoluteFill>
  );
};
