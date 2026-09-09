import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT, FILM_MONO} from '../theme';
import {morphProgress, gentleSpring} from '../springs';

type Stat = {value: string; label: string};

type Props = {
  frame: number;
  fps: number;
  startFrame: number;
  stepFrames: number;
  stats: Stat[];
  width: number;
  slotHeight: number;
  numberFontSize: number;
  labelFontSize: number;
};

/**
 * One persistent column holding all three stats, stacked. A fixed-height
 * viewport shows exactly one slot; moving to the next stat is the SAME
 * column translating up by one slot height — a mechanical odometer, not a
 * counter and not a cut. No stat block is ever unmounted while visible.
 */
export const StatOdometer: React.FC<Props> = ({
  frame,
  fps,
  startFrame,
  stepFrames,
  stats,
  width,
  slotHeight,
  numberFontSize,
  labelFontSize,
}) => {
  const holdFrames = stepFrames - 26;
  const local = Math.max(frame - startFrame, 0);
  const rawStage = Math.floor(local / stepFrames);
  const stage = Math.min(rawStage, stats.length - 1);
  const stageLocal = local - stage * stepFrames;

  const shiftProgress =
    stage < stats.length - 1
      ? morphProgress(frame, startFrame + stage * stepFrames + holdFrames, startFrame + (stage + 1) * stepFrames, fps, gentleSpring)
      : 0;

  const offset = -(stage + shiftProgress) * slotHeight;
  const blur = interpolate(shiftProgress, [0, 0.5, 1], [0, 3, 0]);

  const enter = morphProgress(frame, startFrame, startFrame + 30, fps);
  const entranceBlur = interpolate(enter, [0, 1], [8, 0]);
  const entranceOpacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        height: slotHeight,
        overflow: 'hidden',
        opacity: entranceOpacity,
      }}
    >
      <div
        style={{
          transform: `translateY(${offset}px)`,
          filter: `blur(${Math.max(blur, entranceBlur * (1 - enter))}px)`,
        }}
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            style={{
              width,
              height: slotHeight,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 22,
            }}
          >
            <div
              style={{
                fontFamily: FILM_FONT,
                fontWeight: 800,
                fontSize: numberFontSize,
                letterSpacing: -2,
                color: FILM_COLORS.primary,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
              }}
            >
              {stat.value}
            </div>
            <div
              style={{
                fontFamily: FILM_MONO,
                fontWeight: 600,
                fontSize: labelFontSize,
                letterSpacing: 4,
                textTransform: 'uppercase',
                color: FILM_COLORS.accent,
                whiteSpace: 'nowrap',
              }}
            >
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
