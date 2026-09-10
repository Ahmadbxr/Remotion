import React from 'react';
import {BRAND, FONT} from '../theme';

type Props = {
  frame: number;
  start: number;
  style?: React.CSSProperties;
};

/** "LET'S CREATE →" — the arrow nudges twice (4-8px, out and back, exactly
 *  two cycles) then holds fully still. Deterministic and frame-bound, never
 *  an indefinite/looping animation that would distract from a closing card. */
export const CTAArrow: React.FC<Props> = ({frame, start, style}) => {
  const local = frame - start;
  const cycleLen = 22; // one out-and-back cycle
  const cycles = 2;
  const activeLen = cycleLen * cycles;
  const t = local >= 0 && local < activeLen ? (local % cycleLen) / cycleLen : 0;
  const nudge = local >= 0 && local < activeLen ? Math.sin(t * Math.PI) * 7 : 0;

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
          transform: `translateX(${nudge}px)`,
        }}
      >
        →
      </span>
    </span>
  );
};
