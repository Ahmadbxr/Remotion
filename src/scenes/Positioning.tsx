import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

export const Positioning: React.FC = () => {
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
            fontSize: 56,
            lineHeight: 1.18,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.ink,
          }}
        >
          <span style={{color: COLORS.accent}}>Offscript</span> ist die
          Social-Media- und Videoproduktions-Agentur aus Zürich.
        </div>
      </WhipIn>
      <WhipIn delay={16} distance={24}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 500,
            fontSize: 26,
            lineHeight: 1.4,
            textAlign: 'center',
            color: COLORS.muted,
            marginTop: 28,
          }}
        >
          Wir konzipieren, drehen, schneiden und betreuen —
          <br />
          für Marken, die auf Instagram &amp; TikTok
          <br />
          wie sie selbst klingen sollen.
        </div>
      </WhipIn>
    </AbsoluteFill>
  );
};
