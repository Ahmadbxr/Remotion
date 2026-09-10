import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {easeProgress, easeOutExpo, easeInOutCubic} from '../motion/easings';

type Props = {
  frame: number;
  start: number;
  style?: React.CSSProperties;
};

/** "LET'S CREATE →" — ONE deterministic cycle: retract 4px, accelerate
 *  12px right, settle to a small forward rest offset. Never repeats. */
export const CTAArrow: React.FC<Props> = ({frame, start, style}) => {
  const local = frame - start;
  // Exactly one cycle, three explicit segments: anticipate back 4px,
  // accelerate 12px right, settle to a small forward rest. Never loops.
  const retract = easeProgress(local, 0, 4, easeInOutCubic);
  const launch = easeProgress(local, 4, 12, easeOutExpo);
  const settle = easeProgress(local, 12, 20, easeInOutCubic);

  const x =
    local < 4
      ? interpolate(retract, [0, 1], [0, -4])
      : local < 12
        ? interpolate(launch, [0, 1], [-4, 12])
        : interpolate(settle, [0, 1], [12, 2]);

  return (
    <span style={{display: 'inline-flex', alignItems: 'center', gap: 10, ...style}}>
      <span style={{fontFamily: FONT, fontWeight: 700, fontSize: 26, color: BRAND.ink}}>LET&apos;S CREATE</span>
      <span
        style={{
          display: 'inline-block',
          fontFamily: FONT,
          fontWeight: 700,
          fontSize: 26,
          color: BRAND.red,
          transform: `translateX(${x}px)`,
        }}
      >
        →
      </span>
    </span>
  );
};
