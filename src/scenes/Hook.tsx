import React from 'react';
import {AbsoluteFill} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

const lineStyle: React.CSSProperties = {
  fontFamily: FONT_FAMILY,
  fontWeight: 700,
  fontSize: 92,
  lineHeight: 1.08,
  letterSpacing: -1.5,
  textAlign: 'center',
  color: COLORS.foreground,
};

export const Hook: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        padding: '0 140px',
      }}
    >
      <EnterText delay={0}>
        <div style={lineStyle}>Gute Arbeit reicht nicht.</div>
      </EnterText>
      <EnterText delay={14}>
        <div style={{...lineStyle, color: COLORS.muted}}>
          Man muss gesehen werden.
        </div>
      </EnterText>
    </AbsoluteFill>
  );
};
