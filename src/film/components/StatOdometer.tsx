import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT, FILM_MONO} from '../theme';
import {morphProgress, withOvershoot, OFFSCRIPT_FAST} from '../springs';

type Stat = {value: string; label: string};

type Props = {
  frame: number;
  fps: number;
  startFrame: number;
  stepFrames: number;
  transitionFrames?: number;
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
 * The outgoing number settles back (scale 1→0.92, blur 0→3) while the
 * incoming one arrives slightly oversized (1.08→1, blur 3→0) — a fast,
 * fluid handoff rather than a slow parallel scroll.
 */
export const StatOdometer: React.FC<Props> = ({
  frame,
  fps,
  startFrame,
  stepFrames,
  transitionFrames = 14,
  stats,
  width,
  slotHeight,
  numberFontSize,
  labelFontSize,
}) => {
  const holdFrames = stepFrames - transitionFrames;
  const local = Math.max(frame - startFrame, 0);
  const rawStage = Math.floor(local / stepFrames);
  const stage = Math.min(rawStage, stats.length - 1);

  const shiftProgress =
    stage < stats.length - 1
      ? morphProgress(frame, startFrame + stage * stepFrames + holdFrames, startFrame + (stage + 1) * stepFrames, fps, OFFSCRIPT_FAST)
      : 0;

  const offset = -(stage + shiftProgress) * slotHeight;

  const enter = morphProgress(frame, startFrame, startFrame + 20, fps);
  const entranceBlur = interpolate(enter, [0, 1], [8, 0]);
  const entranceOpacity = interpolate(enter, [0, 1], [0, 1]);

  return (
    <div
      style={{
        width,
        height: slotHeight,
        overflow: 'hidden',
        opacity: entranceOpacity,
        filter: `blur(${entranceBlur * (1 - enter)}px)`,
      }}
    >
      <div style={{transform: `translateY(${offset}px)`}}>
        {stats.map((stat, i) => {
          const isOutgoing = i === stage && shiftProgress > 0;
          const isIncoming = i === stage + 1 && shiftProgress > 0;
          const scale = isOutgoing
            ? interpolate(shiftProgress, [0, 1], [1, 0.92])
            : isIncoming
              ? withOvershoot(shiftProgress, 1.08, 1, 0.2)
              : 1;
          const blockBlur = isOutgoing
            ? interpolate(shiftProgress, [0, 1], [0, 3])
            : isIncoming
              ? interpolate(shiftProgress, [0, 1], [3, 0])
              : 0;

          return (
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
                transform: `scale(${scale})`,
                filter: blockBlur ? `blur(${blockBlur}px)` : undefined,
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
          );
        })}
      </div>
    </div>
  );
};
