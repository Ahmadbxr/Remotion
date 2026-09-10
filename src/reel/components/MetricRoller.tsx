import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {easeProgress, easeOutCubic} from '../motion/easings';
import {springProgress, IMPACT} from '../motion/springs';
import {motionBlur, velocityStretch} from '../motion/velocity';

type Props = {
  frame: number;
  fps: number;
  start: number;
  duration?: number;
  values: string[];
  slotHeight?: number;
  fontSize: number;
  style?: React.CSSProperties;
};

/**
 * A true vertical slot-machine roll: ONE continuous surface of stacked
 * numbers moving upward through a fixed window — incoming values rise in
 * from below while the outgoing ones keep travelling up and out, never a
 * value being replaced in place.
 *
 * Blur is vertical and velocity-derived: the digits smear along the axis
 * they're actually moving on (blur + a matching scaleY stretch), and both
 * resolve to exactly 0 / 1 as the roll decelerates, so the final number
 * lands pin-sharp. That final value then takes one spring overshoot
 * (0.9 -> 1.07 -> 1.0) so it arrives as a hit rather than a stop.
 */
export const MetricRoller: React.FC<Props> = ({
  frame,
  fps,
  start,
  duration = 22,
  values,
  slotHeight = 150,
  fontSize,
  style,
}) => {
  if (frame < start - 1) return null;

  const rollAt = (f: number) => easeProgress(f, start, start + duration, easeOutCubic) * (values.length - 1);
  const roll = rollAt(frame);
  const rollPrev = rollAt(frame - 1);
  const velocity = (roll - rollPrev) * slotHeight;
  const blur = motionBlur(velocity, slotHeight * 0.42, 30);
  const stretchY = velocityStretch(velocity, slotHeight * 0.42, 0.24);

  // The landing hit — starts just before the roll finishes so the
  // overshoot grows straight out of the deceleration instead of after it.
  const settleP = springProgress(frame, start + duration - 4, start + duration + 12, fps, IMPACT);
  const settleScale = interpolate(settleP, [0, 0.5, 0.78, 1], [0.9, 1.07, 0.99, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        width: fontSize * 4.2,
        height: slotHeight,
        overflow: 'hidden',
        transform: `scale(${settleScale})`,
        transformOrigin: '0% 50%',
        ...style,
      }}
    >
      <div
        style={{
          transform: `translateY(${-roll * slotHeight}px) scaleY(${stretchY})`,
          filter: blur ? `blur(${blur}px)` : undefined,
        }}
      >
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
