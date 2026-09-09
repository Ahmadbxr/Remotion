import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

export const Logo: React.FC = () => {
  const frame = useCurrentFrame();

  const letterSpacing = interpolate(frame, [0, 45], [28, 4], {
    extrapolateRight: 'clamp',
  });
  const opacity = interpolate(frame, [0, 25], [0, 1], {
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <div
        style={{
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize: 128,
          color: COLORS.foreground,
          letterSpacing,
          opacity,
        }}
      >
        OFFSCRIPT
      </div>
      <EnterText delay={30} distance={16}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 600,
            fontSize: 26,
            letterSpacing: 6,
            textTransform: 'uppercase',
            color: COLORS.muted,
            marginTop: 22,
          }}
        >
          Social Media &amp; Content Agentur · Zürich
        </div>
      </EnterText>
    </AbsoluteFill>
  );
};
