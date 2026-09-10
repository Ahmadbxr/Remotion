import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, MONO} from '../theme';
import {springProgress, withOvershoot, CARD} from '../motion/springs';
import {motionBlur} from '../motion/velocity';

type Props = {
  frame: number;
  fps: number;
  enterStart: number;
  x: number;
  y: number;
  rotate?: number;
  /** 0 = background (less contrast, slower, smaller travel), 1 = foreground. */
  depth?: number;
  accent?: boolean;
  label: string;
  /** A child value that drops in slightly AFTER the parent — the
   *  parent/child follow-through hierarchy the brief asks for, not every
   *  child animating independently on its own clock. */
  child?: string;
  swipeProgress?: number;
  swipeDelay?: number;
  swipeDirection?: 1 | -1;
};

/** A small, connected UI signal — never a literal screenshot, never
 *  floating at random. Parent (the chip) leads; the child value follows
 *  2-4 frames behind, a genuine parent/child hierarchy rather than two
 *  independently-timed elements. */
export const SocialMetric: React.FC<Props> = ({
  frame,
  fps,
  enterStart,
  x,
  y,
  rotate = 0,
  depth = 1,
  accent = false,
  label,
  child,
  swipeProgress = 0,
  swipeDelay = 0,
  swipeDirection = 1,
}) => {
  const enterP = springProgress(frame, enterStart, enterStart + 11, fps, CARD);
  const enterPPrev = springProgress(frame - 1, enterStart, enterStart + 11, fps, CARD);

  const sp = interpolate(swipeProgress - swipeDelay, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const spPrev = interpolate(swipeProgress - swipeDelay - 0.02, [0, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  const travel = 26 * depth; // background chips travel less — pseudo-depth
  const yAt = (e: number, s: number) => withOvershoot(e, travel, 0, 0.06) - s * 30 * depth;
  const y0 = yAt(enterP, sp);
  const y0Prev = yAt(enterPPrev, spPrev);
  const velocity = Math.abs(y0 - y0Prev) + sp * 40;
  const blur = motionBlur(velocity, 24, 12 * depth + 4);

  const scale = withOvershoot(enterP, 0.8, 0.7 + depth * 0.3, 0.05) * interpolate(sp, [0, 1], [1, 0.92]);
  const opacity = interpolate(enterP, [0, 1], [0, 0.55 + depth * 0.45]) * interpolate(sp, [0, 1], [1, 0]);
  if (opacity <= 0.002) return null;

  const swipeX = sp * swipeDirection * 700 * (0.6 + depth * 0.4);
  const rot = withOvershoot(enterP, rotate * 2.5, rotate, 0.2) + sp * swipeDirection * 16;

  const childP = interpolate(frame, [enterStart + 5, enterStart + 5 + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `translate(${swipeX}px, ${y0}px) rotate(${rot}deg) scale(${scale})`,
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: 19,
          fontWeight: 600,
          letterSpacing: 0.5,
          color: accent ? BRAND.red : BRAND.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </div>
      {child && (
        <div
          style={{
            fontFamily: MONO,
            fontSize: 15,
            color: BRAND.muted,
            opacity: childP,
            transform: `translateY(${interpolate(childP, [0, 1], [-6, 0])}px)`,
            whiteSpace: 'nowrap',
          }}
        >
          {child}
        </div>
      )}
    </div>
  );
};
