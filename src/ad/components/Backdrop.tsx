// Bottom and top of the layer stack. Paper with a soft overhead light below
// everything; a whisper of grain and vignette above everything. No colour
// gradients, no particles — the light is the only "effect".
import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../theme';

export const Backdrop: React.FC = () => (
  <AbsoluteFill style={{background: C.paper}}>
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(90% 55% at 50% -6%, rgba(255,255,255,0.85) 0%, rgba(255,255,255,0) 70%)',
      }}
    />
    <AbsoluteFill
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0) 62%, rgba(84,72,58,0.06) 100%)',
      }}
    />
  </AbsoluteFill>
);

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")";

export const Finish: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <>
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          backgroundImage: NOISE,
          backgroundSize: '220px',
          backgroundPosition: `${(frame * 37) % 220}px ${(frame * 71) % 220}px`,
          opacity: 0.032,
          mixBlendMode: 'multiply',
        }}
      />
      <AbsoluteFill
        style={{
          pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 62%, rgba(40,30,20,0.10) 100%)',
        }}
      />
    </>
  );
};
