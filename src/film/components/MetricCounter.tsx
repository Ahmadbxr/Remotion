import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';
import {fastSpring} from '../springs';

type Checkpoint = {frame: number; value: number};

type Props = {
  frame: number;
  fps: number;
  checkpoints: Checkpoint[];
  fontSize: number;
  suffixOnLast?: string;
  color?: string;
  style?: React.CSSProperties;
};

const formatK = (value: number) => {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return `${Math.round(value)}`;
};

/**
 * A continuously counting number (not discrete digit-swaps) that rolls
 * through every checkpoint in one motion, with a sharp little pulse at
 * each landing — kinetic typography standing in for a dashboard number.
 */
export const MetricCounter: React.FC<Props> = ({
  frame,
  fps,
  checkpoints,
  fontSize,
  suffixOnLast,
  color = FILM_COLORS.primary,
  style,
}) => {
  const frames = checkpoints.map((c) => c.frame);
  const values = checkpoints.map((c) => c.value);
  const clamped = Math.min(Math.max(frame, frames[0]), frames[frames.length - 1]);
  const value = interpolate(clamped, frames, values);

  const isLast = frame >= frames[frames.length - 1] - 6;
  const label = `${formatK(value)}${isLast && suffixOnLast ? suffixOnLast : ''}`;

  const nearestCheckpoint = frames.reduce((best, f) =>
    Math.abs(f - frame) < Math.abs(best - frame) ? f : best,
  );
  const pulse = fastSpring({frame, fps, delay: nearestCheckpoint, durationInFrames: 14});
  const scale = interpolate(pulse, [0, 0.4, 1], [1, 1.05, 1]);

  return (
    <div
      style={{
        fontFamily: FILM_FONT,
        fontWeight: 800,
        fontSize,
        color,
        letterSpacing: -2,
        transform: `scale(${scale})`,
        fontVariantNumeric: 'tabular-nums',
        ...style,
      }}
    >
      {label}
    </div>
  );
};
