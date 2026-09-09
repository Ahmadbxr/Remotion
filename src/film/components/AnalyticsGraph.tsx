import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS} from '../theme';
import {staggerProgress} from '../springs';

type Props = {
  frame: number;
  fps: number;
  startFrame: number;
  width: number;
  height: number;
  values?: number[]; // 0-1 normalized bar heights
  staggerFrames?: number;
};

const DEFAULT_VALUES = [0.28, 0.4, 0.35, 0.55, 0.5, 0.72, 0.68, 0.92, 1];

/**
 * A restrained bar graph — bars rise from the baseline with a staggered
 * spring, and a trend line draws across their tops. Used both as a small
 * inline motif (process/GROW) and blown up full-bleed (performance).
 */
export const AnalyticsGraph: React.FC<Props> = ({
  frame,
  fps,
  startFrame,
  width,
  height,
  values = DEFAULT_VALUES,
  staggerFrames = 3,
}) => {
  const barWidth = width / values.length - 8;

  const points = values.map((v, i) => {
    const p = staggerProgress(frame, i, {startFrame, staggerFrames, durationInFrames: 26, fps});
    return {x: i * (barWidth + 8) + barWidth / 2, y: height - v * height * p, p};
  });

  const path = points
    .map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`)
    .join(' ');

  const lineReveal = interpolate(
    staggerProgress(frame, values.length - 1, {startFrame, staggerFrames, durationInFrames: 26, fps}),
    [0, 1],
    [0, 1],
  );

  return (
    <div style={{position: 'relative', width, height}}>
      <div style={{position: 'absolute', bottom: 0, left: 0, right: 0, display: 'flex', gap: 8}}>
        {values.map((v, i) => {
          const p = staggerProgress(frame, i, {startFrame, staggerFrames, durationInFrames: 26, fps});
          return (
            <div
              key={i}
              style={{
                width: barWidth,
                height: height * v,
                background: i === values.length - 1 ? FILM_COLORS.accent : 'rgba(255,255,255,0.16)',
                borderRadius: 4,
                transform: `scaleY(${p})`,
                transformOrigin: 'bottom',
              }}
            />
          );
        })}
      </div>
      <svg
        width={width}
        height={height}
        style={{position: 'absolute', top: 0, left: 0, overflow: 'visible'}}
      >
        <path
          d={path}
          fill="none"
          stroke={FILM_COLORS.accent}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - lineReveal}
          opacity={0.9}
        />
      </svg>
    </div>
  );
};
