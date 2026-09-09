import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';
import {withOvershoot} from '../springs';

type Line = {text: string; color?: string};

type Props = {
  lines: (string | Line)[];
  rowHeight: number;
  width?: number;
  fontSize: number;
  fontWeight?: number;
  color?: string;
  align?: 'center' | 'left';
  lineHeight?: number;
  letterSpacingFrom?: number;
  letterSpacingTo?: number;
  /** 0-1: the row-mask reveal (text slides up into view within a fixed,
   *  overflow-hidden row — never a screen-level fly-in). */
  enter: number;
  /** 0-1: a small blur/fade/drift dissolve, NOT a mirrored re-mask. */
  exit?: number;
  staggerFraction?: number;
  style?: React.CSSProperties;
};

/**
 * Every dimension here (width, rowHeight, fontSize, lineHeight,
 * letterSpacing, transformOrigin) is fixed by the caller, never derived
 * from the text — so swapping `lines` never reflows the layout around it.
 * Enter is a mask sweep inside a stable row; exit is a small, Apple-style
 * settle-away (blur + fade + a few px of drift), never a large motion.
 */
export const MaskText: React.FC<Props> = ({
  lines,
  rowHeight,
  width,
  fontSize,
  fontWeight = 800,
  color = FILM_COLORS.primary,
  align = 'center',
  lineHeight = 1.05,
  letterSpacingFrom = 6,
  letterSpacingTo = -0.5,
  enter,
  exit = 0,
  staggerFraction = 0.75,
  style,
}) => {
  const n = lines.length;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: align === 'center' ? 'center' : 'flex-start',
        width,
        ...style,
      }}
    >
      {lines.map((raw, i) => {
        const line: Line = typeof raw === 'string' ? {text: raw} : raw;
        const localEnter = Math.min(Math.max(enter * n - i * staggerFraction, 0), 1);

        // Text gets less overshoot than icons — a couple of px of drift and
        // a fraction of a percent of scale, never a bouncy fly-in: the mask
        // reveal itself stays the dominant motion, this just keeps its
        // landing from reading as a hard linear stop.
        const translateY =
          withOvershoot(localEnter, rowHeight, 0, 0.02) + interpolate(exit, [0, 1], [0, -14]);
        const blur = interpolate(localEnter, [0, 1], [6, 0]) + interpolate(exit, [0, 1], [0, 7]);
        const opacity = interpolate(localEnter, [0, 1], [0, 1]) * interpolate(exit, [0, 1], [1, 0]);
        const scale = withOvershoot(localEnter, 0.985, 1, 0.6);
        const tracking = interpolate(localEnter, [0, 1], [letterSpacingFrom, letterSpacingTo]);

        // Flexbox's `justify-content: center` applies "safe alignment" when
        // content overflows — it falls back to start alignment instead of
        // clipping, so oversized nowrap text escapes `overflow: hidden`
        // entirely. Absolute-positioned centering has no such fallback and
        // clips reliably.
        const centerX = align === 'center';
        return (
          <div
            key={i}
            style={{
              position: 'relative',
              width,
              height: rowHeight,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: centerX ? '50%' : 0,
                fontFamily: FILM_FONT,
                fontWeight,
                fontSize,
                lineHeight,
                letterSpacing: tracking,
                color: line.color ?? color,
                whiteSpace: 'nowrap',
                opacity,
                filter: `blur(${blur}px)`,
                transform: `translate(${centerX ? '-50%' : '0'}, calc(-50% + ${translateY}px)) scale(${scale})`,
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
