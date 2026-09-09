import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';

type Line = {text: string; color?: string; sizeMultiplier?: number};

type Props = {
  lines: (string | Line)[];
  progress: number;
  fontSize: number;
  fontWeight?: number;
  align?: 'center' | 'left';
  color?: string;
  lineHeight?: number;
  style?: React.CSSProperties;
};

/**
 * Word/line reveal built from clip-path wipe + blur-to-sharp + tracking
 * tighten + a small vertical settle — never a plain opacity fade. `progress`
 * is a single 0-1 value; lines reveal in a staggered sweep across it.
 */
export const AnimatedTypography: React.FC<Props> = ({
  lines,
  progress,
  fontSize,
  fontWeight = 800,
  align = 'center',
  color = FILM_COLORS.primary,
  lineHeight = 1.04,
  style,
}) => {
  const n = lines.length;
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        ...style,
      }}
    >
      {lines.map((raw, i) => {
        const line: Line = typeof raw === 'string' ? {text: raw} : raw;
        const local = Math.min(Math.max(progress * n - i * 0.82, 0), 1);
        const blur = interpolate(local, [0, 1], [16, 0]);
        const tracking = interpolate(local, [0, 1], [10, -0.5]);
        const translateY = interpolate(local, [0, 1], [26, 0]);
        const reveal = interpolate(local, [0, 1], [100, 0]);

        return (
          <div
            key={i}
            style={{
              overflow: 'hidden',
              clipPath: `inset(0 ${reveal}% 0 0)`,
            }}
          >
            <div
              style={{
                fontFamily: FILM_FONT,
                fontWeight,
                fontSize: fontSize * (line.sizeMultiplier ?? 1),
                lineHeight,
                letterSpacing: tracking,
                color: line.color ?? color,
                filter: `blur(${blur}px)`,
                transform: `translateY(${translateY}px)`,
                whiteSpace: 'nowrap',
              }}
            >
              {line.text}
            </div>
          </div>
        );
      })}
    </div>
  );
};
