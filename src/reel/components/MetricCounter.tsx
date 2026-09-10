import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {progress, withOvershoot, motionBlur, IMPACT} from '../springs';

type Props = {
  frame: number;
  fps: number;
  start: number;
  /** Rapid-fire milestones, last one is the real, final number. */
  values: string[];
  tickFrames?: number;
  landDuration?: number;
  fontSize: number;
  style?: React.CSSProperties;
};

/**
 * A growth counter that communicates ACCELERATION, not a dashboard tally:
 * it flickers rapidly through intermediate milestones (each one a discrete,
 * deliberately blurred jump — this is the one place blur isn't
 * velocity-measured, because the motion itself is a stepped flicker, not a
 * continuous move) before the real final number lands with a hard,
 * satisfying spring overshoot that resolves to perfectly sharp.
 */
export const MetricCounter: React.FC<Props> = ({
  frame,
  fps,
  start,
  values,
  tickFrames = 4,
  landDuration = 16,
  fontSize,
  style,
}) => {
  const tickCount = values.length - 1;
  const tickEnd = start + tickCount * tickFrames;
  const local = frame - start;

  const isTicking = local >= 0 && local < tickCount * tickFrames;
  const tickIndex = Math.min(Math.max(Math.floor(local / tickFrames), 0), tickCount - 1);

  const landP = progress(frame, tickEnd, tickEnd + landDuration, fps, IMPACT);
  const landPPrev = progress(frame - 1, tickEnd, tickEnd + landDuration, fps, IMPACT);
  const scaleAt = (p: number) => withOvershoot(p, 0.8, 1, 0.2);
  const scale = scaleAt(landP);
  const velocity = Math.abs(scale - scaleAt(landPPrev));
  const landBlur = motionBlur(velocity, 0.08, 16);

  const visible = local >= 0;
  const displayValue = isTicking ? values[tickIndex] : values[values.length - 1];
  const tickBlur = isTicking ? 9 : landBlur;

  const entranceOpacity = interpolate(local, [0, 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        letterSpacing: -2,
        color: BRAND.ink,
        opacity: visible ? entranceOpacity : 0,
        filter: tickBlur ? `blur(${tickBlur}px)` : undefined,
        transform: `scale(${isTicking ? 1 : scale})`,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {displayValue}
    </div>
  );
};
