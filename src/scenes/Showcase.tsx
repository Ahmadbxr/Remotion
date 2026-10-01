import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';
import {ViewfinderCard} from '../components/ViewfinderCard';

export const Showcase: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <WhipIn delay={0} distance={30}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 44,
            lineHeight: 1.15,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.ink,
            padding: '0 90px',
            marginBottom: 40,
          }}
        >
          Content, der aussieht wie ihr.
        </div>
      </WhipIn>
      <WhipIn delay={14} distance={40}>
        <ViewfinderCard index="01" title="Euer Content." category="Social Media" />
      </WhipIn>
    </AbsoluteFill>
  );
};
