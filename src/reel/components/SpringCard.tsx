import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT, MONO} from '../theme';
import {progress, withOvershoot, motionBlur, SOFT_CARD} from '../springs';

type Props = {
  frame: number;
  fps: number;
  enterStart: number;
  /** Own physical character: cards don't all move identically. */
  fromX?: number;
  fromY?: number;
  rotateFrom?: number;
  restRotate?: number;
  duration?: number;
  /** 0 (settled) -> 1 (fully swiped away) — the whole boring-content world
   *  gets swiped off in one gesture; every card shares `swipeProgress` but
   *  reacts with its own delay/velocity via `swipeDelay`. */
  swipeProgress?: number;
  swipeDelay?: number;
  swipeDirection?: 1 | -1;
  width: number;
  height: number;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

/**
 * A small abstract card — the Reel's own interpretation of a social-media
 * UI element, never a literal screenshot. Enters with SOFT_CARD physics
 * (position + scale + a touch of rotation, never opacity alone), and can be
 * swiped off in a single shared gesture with the rest of its "world".
 */
export const SpringCard: React.FC<Props> = ({
  frame,
  fps,
  enterStart,
  fromX = 0,
  fromY = 70,
  rotateFrom = -4,
  restRotate = 0,
  duration = 16,
  swipeProgress = 0,
  swipeDelay = 0,
  swipeDirection = 1,
  width,
  height,
  style,
  children,
}) => {
  const enterP = progress(frame, enterStart, enterStart + duration, fps, SOFT_CARD);
  const enterPPrev = progress(frame - 1, enterStart, enterStart + duration, fps, SOFT_CARD);

  const sp = interpolate(swipeProgress - swipeDelay, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const spPrev = interpolate(swipeProgress - swipeDelay - 0.02, [0, 1], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const xAt = (e: number, s: number) =>
    withOvershoot(e, fromX, 0, 0.04) + s * swipeDirection * 900;
  const yAt = (e: number, s: number) => withOvershoot(e, fromY, 0, 0.06) - s * 40;

  const x = xAt(enterP, sp);
  const xPrev = xAt(enterPPrev, spPrev);
  const y = yAt(enterP, sp);
  const yPrev = yAt(enterPPrev, spPrev);
  const velocity = Math.abs(x - xPrev) + Math.abs(y - yPrev);
  const blur = motionBlur(velocity, 30, 14);

  const rotate = withOvershoot(enterP, rotateFrom, restRotate, 0.15) + sp * swipeDirection * 22;
  const scale = withOvershoot(enterP, 0.82, 1, 0.06) * interpolate(sp, [0, 1], [1, 0.9]);
  const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(sp, [0, 1], [1, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        width,
        height,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
        borderRadius: 20,
        background: '#FFFFFF',
        border: `1px solid ${BRAND.border}`,
        boxShadow: '0 10px 28px rgba(17,17,17,0.08)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 18px',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

/** Small monospace signal chip used inside social-abstraction cards
 *  ("327 Views", "0 Shares", "Skip →") — never a literal platform UI. */
export const SignalChip: React.FC<{label: string; accent?: boolean}> = ({label, accent}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 21,
      fontWeight: 600,
      letterSpacing: 0.5,
      color: accent ? BRAND.red : BRAND.ink,
    }}
  >
    {label}
  </div>
);

export const CardLabel: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{fontFamily: FONT, fontSize: 24, fontWeight: 700, color: BRAND.ink}}>{children}</div>
);
