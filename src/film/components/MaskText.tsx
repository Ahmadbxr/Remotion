import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';
import {withOvershoot, getMotionBlur} from '../springs';

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
  /** Same value as `enter`, one frame earlier. Optional — omit it (or pass
   *  `enter` itself) for a caller that only ever holds `enter` constant
   *  (e.g. a transition wrapper that already owns the motion externally),
   *  which correctly yields zero measured velocity and therefore zero
   *  motion blur here. Passing the true previous-frame value is what lets
   *  blur be driven by actual measured speed instead of a hand-authored
   *  curve. */
  enterPrev?: number;
  /** 0-1: a larger, higher-quality settle-away (drift + blur + fade) than
   *  the old flat dissolve — text keeps moving as the next one arrives. */
  exit?: number;
  /** Same as `enterPrev`, for `exit`. */
  exitPrev?: number;
  /** How far in px the text drifts on exit (negative = up/away). */
  exitDistance?: number;
  /** Peak blur (px) at high velocity. Bigger text can carry more —
   *  headlines pass ~12-14, small labels use the ~6 default. */
  maxBlur?: number;
  /** Position-overshoot amount (fraction of rowHeight) on the mask-reveal
   *  settle. Scale-overshoot rides proportionally with it. */
  overshootAmount?: number;
  /** Faint trailing ghost copies that appear only while moving fast, to
   *  simulate directional motion blur beyond what filter: blur() alone
   *  reads as. Disabled automatically at rest (zero velocity = zero
   *  ghost opacity), never a permanent effect. */
  ghosts?: boolean;
  staggerFraction?: number;
  style?: React.CSSProperties;
};

/**
 * Every dimension here (width, rowHeight, fontSize, lineHeight,
 * letterSpacing, transformOrigin) is fixed by the caller, never derived
 * from the text — so swapping `lines` never reflows the layout around it.
 * Enter is a mask sweep inside a fixed, overflow-hidden row; exit is a
 * drift-and-dissolve in the same direction, never a mirrored re-mask.
 *
 * Blur is velocity-based, not a fixed per-frame curve: every frame this
 * measures how far the text's own position actually moved since the
 * previous frame (from `enter`/`enterPrev` and `exit`/`exitPrev`) and maps
 * that measured speed through `getMotionBlur` — fast movement blurs, a
 * hold is always perfectly sharp (0px), and the "when" of the blur falls
 * out of the motion curve itself rather than being authored separately.
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
  enterPrev,
  exit = 0,
  exitPrev,
  exitDistance = -35,
  maxBlur = 6,
  overshootAmount = 0.035,
  ghosts = true,
  staggerFraction = 0.75,
  style,
}) => {
  const n = lines.length;
  const ep = enterPrev ?? enter;
  const xp = exitPrev ?? exit;

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
        const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
        const localEnter = clamp01(enter * n - i * staggerFraction);
        const localEnterPrev = clamp01(ep * n - i * staggerFraction);

        // Text gets less overshoot than icons — a couple of px of drift and
        // a fraction of a percent of scale, never a bouncy fly-in: the mask
        // reveal itself stays the dominant motion, this just keeps its
        // landing from reading as a hard linear stop.
        const posAt = (le: number, ex: number) =>
          withOvershoot(le, rowHeight, 0, overshootAmount) + interpolate(ex, [0, 1], [0, exitDistance]);

        const translateY = posAt(localEnter, exit);
        const translateYPrev = posAt(localEnterPrev, xp);
        const velocityPx = translateY - translateYPrev; // px/frame, signed

        const maxVelocityPx = rowHeight * 0.16;
        const blur = getMotionBlur(velocityPx, maxVelocityPx, maxBlur);

        const opacity = interpolate(localEnter, [0, 1], [0, 1]) * interpolate(exit, [0, 1], [1, 0]);
        const enterScale = withOvershoot(localEnter, 1 - overshootAmount * 0.7, 1, 0.6);
        const exitScale = interpolate(exit, [0, 1], [1, 0.99]);
        const scale = enterScale * exitScale;
        const tracking = interpolate(localEnter, [0, 1], [letterSpacingFrom, letterSpacingTo]);

        // Directional-blur simulation: two faint copies trailing behind the
        // main glyph along its own direction of travel, intensity tied to
        // the SAME measured velocity as the blur above — never visible at
        // rest, never a separate hand-timed effect.
        const ghostIntensity = ghosts ? interpolate(Math.abs(velocityPx), [0, maxVelocityPx], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
        const ghost1Y = translateY - velocityPx * 1.6;
        const ghost2Y = translateY - velocityPx * 3.0;
        const ghost1Opacity = ghostIntensity * 0.13 * opacity;
        const ghost2Opacity = ghostIntensity * 0.06 * opacity;
        const ghostBlur = 2 + ghostIntensity * 4;

        // Flexbox's `justify-content: center` applies "safe alignment" when
        // content overflows — it falls back to start alignment instead of
        // clipping, so oversized nowrap text escapes `overflow: hidden`
        // entirely. Absolute-positioned centering has no such fallback and
        // clips reliably.
        const centerX = align === 'center';
        const glyphStyle = (y: number, op: number, bl: number, sc: number): React.CSSProperties => ({
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
          opacity: op,
          filter: bl ? `blur(${bl}px)` : undefined,
          transform: `translate(${centerX ? '-50%' : '0'}, calc(-50% + ${y}px)) scale(${sc})`,
        });

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
            {ghostIntensity > 0.01 && (
              <>
                <div style={glyphStyle(ghost2Y, ghost2Opacity, ghostBlur, scale)}>{line.text}</div>
                <div style={glyphStyle(ghost1Y, ghost1Opacity, ghostBlur, scale)}>{line.text}</div>
              </>
            )}
            <div style={glyphStyle(translateY, opacity, blur, scale)}>{line.text}</div>
          </div>
        );
      })}
    </div>
  );
};
