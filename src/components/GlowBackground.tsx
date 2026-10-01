import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COLORS} from '../theme';

/**
 * Flat warm off-white field with a barely-there drifting highlight,
 * matching offscript.ch's own light background rather than a dark keynote.
 */
export const GlowBackground: React.FC = () => {
  const frame = useCurrentFrame();

  const x = interpolate(Math.sin(frame / 240), [-1, 1], [35, 65]);
  const y = interpolate(Math.cos(frame / 300), [-1, 1], [15, 45]);

  return (
    <AbsoluteFill style={{backgroundColor: COLORS.background}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at ${x}% ${y}%, rgba(242,5,5,0.06), rgba(242,5,5,0) 45%)`,
        }}
      />
    </AbsoluteFill>
  );
};
