import React from 'react';
import {BRAND, FONT} from '../theme';
import {easeProgress, easeInOutCubic} from '../motion/easings';
import {smoothKeys} from '../motion/curves';

type Props = {
  frame: number;
  start: number;
  style?: React.CSSProperties;
};

/** "LET'S CREATE →" — ONE deterministic cycle: retract 4px, accelerate
 *  12px right, settle to a small forward rest offset. Never repeats. */
export const CTAArrow: React.FC<Props> = ({frame, start, style}) => {
  // ONE continuous cycle through four poses: retract 4px (anticipation),
  // accelerate 12px right, settle to a small forward rest. Never loops.
  //
  // These used to be three separate eased segments switched on `local`,
  // and the switches were velocity cliffs — the arrow reached -4px moving
  // at full speed and instantly reversed, then hit +12px and instantly
  // reversed again. One smooth-keyed trajectory turns each of those
  // corners into a real deceleration and turn-around, which is the whole
  // difference between a nudge that reads as animated and one that reads
  // as scripted.
  const u = easeProgress(frame, start, start + 20, easeInOutCubic);
  const x = smoothKeys(u, [0, 0.2, 0.6, 1], [0, -4, 12, 2]);

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
