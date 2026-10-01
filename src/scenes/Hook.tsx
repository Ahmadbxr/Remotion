import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

const lineStyle: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontWeight: 800,
  fontSize: 76,
  lineHeight: 1.08,
  letterSpacing: -1.5,
  textAlign: 'center',
  color: COLORS.ink,
};

export const Hook: React.FC = () => {
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
        <div style={lineStyle}>Das Beste passiert,</div>
      </WhipIn>
      <WhipIn delay={10}>
        <div style={lineStyle}>
          sobald das <span style={{color: COLORS.accent}}>Script</span> weg
          ist.
        </div>
      </WhipIn>
    </AbsoluteFill>
  );
};
