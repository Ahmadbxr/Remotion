import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {COLORS, FONT_FAMILY, MONO_FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

export const Outro: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 90px',
      }}
    >
      <WhipIn delay={0} distance={30}>
        <Img src={staticFile('offscript-logo.png')} style={{width: 260, marginBottom: 44}} />
      </WhipIn>
      <WhipIn delay={14}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: 62,
            lineHeight: 1.15,
            letterSpacing: -1,
            textAlign: 'center',
            color: COLORS.ink,
          }}
        >
          Content, der im Kopf bleibt.
        </div>
      </WhipIn>
      <WhipIn delay={28} distance={20}>
        <div
          style={{
            fontFamily: FONT_FAMILY,
            fontWeight: 500,
            fontSize: 26,
            textAlign: 'center',
            color: COLORS.muted,
            marginTop: 18,
          }}
        >
          Marken, die online nicht übersehen werden.
        </div>
      </WhipIn>
      <WhipIn delay={48} distance={20}>
        <div
          style={{
            marginTop: 56,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 22,
          }}
        >
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 1,
              color: '#FFFFFF',
              backgroundColor: COLORS.buttonDark,
              borderRadius: 999,
              padding: '20px 44px',
              textTransform: 'uppercase',
            }}
          >
            Erstgespräch buchen
          </div>
          <div
            style={{
              fontFamily: MONO_FONT_FAMILY,
              fontWeight: 500,
              fontSize: 22,
              letterSpacing: 1,
              color: COLORS.accent,
            }}
          >
            offscript.ch
          </div>
        </div>
      </WhipIn>
    </AbsoluteFill>
  );
};
