import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, MONO} from '../theme';
import {springProgress, withOvershoot, CARD} from '../motion/springs';
import {motionBlur} from '../motion/velocity';
import {PLANE, depth as depthT, parallaxFactor} from '../motion/depth';

type Props = {
  frame: number;
  fps: number;
  enterStart: number;
  x: number;
  y: number;
  rotate?: number;
  /** 0 = background (less contrast, slower, smaller travel), 1 = foreground. */
  depth?: number;
  /** Which depth plane this signal sits on. The headline is the base plane;
   *  these sit either side of it, and they travel by different amounts when
   *  the whole UI is swiped away — which is what makes the swipe feel like
   *  it has thickness rather than being one flat sheet sliding off. */
  plane?: number;
  accent?: boolean;
  label: string;
  /** Type size — these are few and strong now, not many and tiny. */
  size?: number;
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
  plane = PLANE.base,
  accent = false,
  label,
  size = 19,
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

  // Parallax, from the shared plane system: nearer signals travel further.
  // Strength is dialled up from the geometric default because a 6% spread
  // over 700px is not enough to read, and a 28% spread is still well short
  // of looking like a 3D scene.
  const swipeX = sp * swipeDirection * 700 * parallaxFactor(plane, 2.2);
  const rot = withOvershoot(enterP, rotate * 2.5, rotate, 0.08) + sp * swipeDirection * 16;

  const childP = interpolate(frame, [enterStart + 5, enterStart + 5 + 8], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `translate(${swipeX}px, ${y0}px) rotate(${rot}deg) scale(${scale}) ${depthT(plane)}`,
        // Anchored on its left edge, not its middle: a signal pinned to the
        // headline's margin should grow rightward when it comes forward,
        // not spread both ways and push its left edge out of the safe area.
        transformOrigin: '0% 50%',
      }}
    >
      <div
        style={{
          fontFamily: MONO,
          fontSize: size,
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
            fontSize: Math.round(size * 0.68),
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
