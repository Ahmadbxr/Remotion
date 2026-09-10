import React from 'react';
import {BRAND, FONT} from '../theme';
import {easeProgress, easeOutCubic} from '../motion/easings';
import {motionBlur} from '../motion/velocity';

type Props = {
  frame: number;
  start: number;
  duration?: number;
  values: string[];
  slotHeight?: number;
  fontSize: number;
  style?: React.CSSProperties;
};

/** A genuine slot-machine roll through the milestones (3K -> 12K -> 47K ->
 *  100K+) — one continuous scroll, not discrete blurred jumps. Fast at
 *  first, decelerating hard into the final, real number, which is what
 *  makes the blur resolve to sharp exactly as it lands rather than cutting
 *  from blurry to sharp. */
export const MetricRoller: React.FC<Props> = ({frame, start, duration = 26, values, slotHeight = 150, fontSize, style}) => {
  const local = frame - start;
  if (local < 0) return null;

  const rollAt = (f: number) => easeProgress(f, start, start + duration, easeOutCubic) * (values.length - 1);
  const roll = rollAt(frame);
  const rollPrev = rollAt(frame - 1);
  const velocity = Math.abs(roll - rollPrev) * slotHeight;
  const blur = motionBlur(velocity, slotHeight * 0.5, 26);

  const offset = -roll * slotHeight;

  return (
    <div style={{width: fontSize * 4, height: slotHeight, overflow: 'hidden', ...style}}>
      <div style={{transform: `translateY(${offset}px)`, filter: blur ? `blur(${blur}px)` : undefined}}>
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              height: slotHeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize,
              letterSpacing: -3,
              color: BRAND.ink,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {v}
          </div>
        ))}
      </div>
    </div>
  );
};
