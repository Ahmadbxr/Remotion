import React from 'react';
import {interpolate} from 'remotion';

type Props = {
  progress: number; // 0 = fully "outgoing", 1 = fully "incoming"
  outgoing: React.ReactNode;
  incoming: React.ReactNode;
  width: number;
  height: number;
  direction?: 'horizontal' | 'vertical';
};

/**
 * Wipes one visual into the next via clip-path (never a plain crossfade),
 * with a brief shared blur at the midpoint so the handoff reads as one
 * shape reconfiguring rather than two layers dissolving into each other.
 */
export const MorphTransition: React.FC<Props> = ({
  progress,
  outgoing,
  incoming,
  width,
  height,
  direction = 'horizontal',
}) => {
  const p = Math.min(Math.max(progress, 0), 1);
  const blur = interpolate(p, [0, 0.5, 1], [0, 5, 0]);
  const outClip =
    direction === 'horizontal'
      ? `inset(0 0 0 ${p * 100}%)`
      : `inset(${p * 100}% 0 0 0)`;
  const inClip =
    direction === 'horizontal'
      ? `inset(0 ${(1 - p) * 100}% 0 0)`
      : `inset(0 0 ${(1 - p) * 100}% 0)`;

  return (
    <div style={{position: 'relative', width, height}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          clipPath: outClip,
          filter: `blur(${blur}px)`,
        }}
      >
        {outgoing}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          clipPath: inClip,
          filter: `blur(${blur}px)`,
        }}
      >
        {incoming}
      </div>
    </div>
  );
};
