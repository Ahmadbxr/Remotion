import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS} from '../theme';

type Props = {
  width: number;
  progress: number; // 0 = just born from the camera frame, 1 = fully drawn
  playheadProgress?: number; // 0-1 position of the red playhead along the bar
};

const SEGMENTS = [0.22, 0.14, 0.3, 0.18, 0.16];

/**
 * A minimal clip timeline: segments draw in left-to-right as the camera
 * frame's width collapses into this bar, with a red playhead sweeping
 * through — the red element staying continuous with the frame before it.
 */
export const EditingTimeline: React.FC<Props> = ({width, progress, playheadProgress = 0.5}) => {
  const barOpacity = interpolate(progress, [0, 0.2, 1], [0, 1, 1]);
  let cursor = 0;

  return (
    <div style={{width, opacity: barOpacity}}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 34,
          borderRadius: 8,
          border: `1px solid ${FILM_COLORS.border}`,
          display: 'flex',
          overflow: 'hidden',
          background: FILM_COLORS.surface,
        }}
      >
        {SEGMENTS.map((frac, i) => {
          const start = cursor;
          cursor += frac;
          const local = interpolate(progress, [start * 0.9, start * 0.9 + 0.25], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                width: `${frac * 100}%`,
                height: '100%',
                borderRight: i < SEGMENTS.length - 1 ? '1px solid rgba(17,17,17,0.08)' : undefined,
                transform: `scaleX(${local})`,
                transformOrigin: 'left center',
                background: i % 2 === 0 ? 'rgba(17,17,17,0.07)' : 'rgba(17,17,17,0.12)',
              }}
            />
          );
        })}
      </div>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: 2,
          marginTop: 10,
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: `${playheadProgress * 100}%`,
            top: -6,
            width: 2,
            height: 14,
            background: FILM_COLORS.accent,
            opacity: interpolate(progress, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'}),
          }}
        />
      </div>
    </div>
  );
};
