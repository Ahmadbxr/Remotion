import React from 'react';
import {AbsoluteFill, Series, interpolate, useCurrentFrame} from 'remotion';
import {COLORS, FONT_FAMILY} from '../theme';
import {EnterText} from '../components/EnterText';

const WORDS = ['Strategie', 'Produktion', 'Management', 'Wachstum'];
const WORD_DURATION = 40;

const Word: React.FC<{label: string; index: number}> = ({label, index}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(
    frame,
    [0, 10, WORD_DURATION - 10, WORD_DURATION],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          opacity,
          fontFamily: FONT_FAMILY,
          fontWeight: 800,
          fontSize: 108,
          letterSpacing: -2,
          color: COLORS.foreground,
        }}
      >
        <span style={{color: COLORS.muted, fontSize: 48, marginRight: 24}}>
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
        style={{alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 110}}
      >
        <EnterText delay={10} distance={12}>
          <div
            style={{
              fontFamily: FONT_FAMILY,
              fontWeight: 500,
              fontSize: 28,
              color: COLORS.muted,
              letterSpacing: 0.5,
            }}
          >
            Von der ersten Idee bis zum fertigen Post — aus einer Hand.
          </div>
        </EnterText>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
