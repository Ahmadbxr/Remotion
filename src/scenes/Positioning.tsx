import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

export const Positioning: React.FC = () => {
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
            fontSize: 68,
            lineHeight: 1.2,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.foreground,
          }}
        >
          <span
            style={{
              backgroundImage: `linear-gradient(90deg, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              color: 'transparent',
            }}
          >
            OFFSCRIPT
          </span>{' '}
          ist eure Social-Media- und Content-Agentur aus Zürich.
        </div>
      </EnterText>
      <EnterText delay={20} distance={16}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 500,
            fontSize: 30,
            letterSpacing: 1,
            textAlign: 'center',
            color: COLORS.muted,
            marginTop: 30,
          }}
        >
          Sichtbarkeit. Marke. Messbare Ergebnisse.
        </div>
      </EnterText>
    </AbsoluteFill>
  );
};
