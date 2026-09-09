import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

/**
 * Slow-drifting radial glow over a pure black field, the quiet backdrop
 * Apple keynote pieces use so type stays the only thing in motion.
 */
export const GlowBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const x = interpolate(Math.sin(frame / 210), [-1, 1], [30, 70]);
  const y = interpolate(Math.cos(frame / 260), [-1, 1], [20, 60]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.background}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}% ${y}%, rgba(43,95,255,0.20), rgba(178,75,255,0.10) 35%, rgba(0,0,0,0) 65%)`,
        }}
      />
    </AbsoluteFill>
  );
};
