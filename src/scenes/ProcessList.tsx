import React from 'react';
import {AbsoluteFill, Series, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {WhipIn} from '../components/WhipIn';

const WORDS = ['Strategie', 'Produktion', 'Management', 'Wachstum'];
const WORD_DURATION = 40;

const Word: React.FC<{label: string; index: number}> = ({label, index}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 8, WORD_DURATION - 10, WORD_DURATION],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );
  const blur = interpolate(
    frame,
    [0, 8, WORD_DURATION - 10, WORD_DURATION],
    [14, 0, 0, 10],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          opacity,
          filter: `blur(${blur}px)`,
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize: 84,
          letterSpacing: -1.5,
          color: COLORS.ink,
        }}
      >
        <span style={{color: COLORS.accent, fontSize: 38, marginRight: 18}}>
          0{index + 1}
        </span>
        {label}
      </div>
    </AbsoluteFill>
  );
};

export const ProcessList: React.FC = () => {
  return (
    <AbsoluteFill>
      <Series>
        {WORDS.map((word, index) => (
          <Series.Sequence key={word} durationInFrames={WORD_DURATION}>
            <Word label={word} index={index} />
          </Series.Sequence>
        ))}
      </Series>
      <AbsoluteFill
        style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 140}}
      >
        <WhipIn delay={10} distance={16}>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              fontSize: 24,
              color: COLORS.muted,
              letterSpacing: 0.3,
              textAlign: 'center',
              padding: '0 100px',
            }}
          >
            Von der ersten Idee bis zum fertigen Post — aus einer Hand.
          </div>
        </WhipIn>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
