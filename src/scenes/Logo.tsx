import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COLORS, MONO_FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

export const Logo: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
      }}
    >
      <WhipIn delay={0} distance={50}>
        <Img src={staticFile('offscript-logo.png')} style={{width: 460}} />
      </WhipIn>
      <WhipIn delay={12} distance={20}>
        <div
          style={{
            fontFamily: MONO_FONT_FAMILY,
            fontWeight: 600,
            fontSize: 20,
            letterSpacing: 4,
            textTransform: 'uppercase',
            color: COLORS.muted,
            marginTop: 28,
          }}
        >
          Zürich · Content &amp; Social Media
        </div>
      </WhipIn>
    </AbsoluteFill>
  );
};
