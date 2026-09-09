import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

export const Outro: React.FC = () => {
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
            fontWeight: 800,
            fontSize: 84,
            lineHeight: 1.12,
            letterSpacing: -1.5,
            textAlign: 'center',
            color: COLORS.foreground,
          }}
        >
          Content, der im Kopf bleibt.
        </div>
      </EnterText>
      <EnterText delay={16}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 500,
            fontSize: 32,
            textAlign: 'center',
            color: COLORS.muted,
            marginTop: 20,
          }}
        >
          Marken, die online nicht übersehen werden.
        </div>
      </EnterText>
      <EnterText delay={40} distance={18}>
        <div
          style={{
            marginTop: 64,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: 1,
              color: COLORS.foreground,
              backgroundImage: `linear-gradient(90deg, ${COLORS.accentFrom}, ${COLORS.accentTo})`,
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            offscript.ch
          </div>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: 3,
              textTransform: 'uppercase',
              color: COLORS.muted,
            }}
          >
            Strategie · Produktion · Management · Wachstum
          </div>
        </div>
      </EnterText>
    </AbsoluteFill>
  );
};
