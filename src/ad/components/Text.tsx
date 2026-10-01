// Masked line reveal: the line rises out of its own baseline mask, sharpening
// as it lands; exits are faster and leave upward through the same mask.
import React from 'react';
import {useCurrentFrame} from 'remotion';
import {clamp01, prog} from '../anim';
import {EASE, FONT, TYPE} from '../theme';

type LineProps = {
  text: string;
  x: number;
  y: number;
  size: number;
  color: string;
  inAt: number;
  outAt?: number | null;
  weight?: number;
  align?: 'left' | 'center';
  width?: number; // for centred lines: the frame width
  font?: string;
  tracking?: string;
  dur?: number;
  upper?: boolean;
};

export const Line: React.FC<LineProps> = ({
  text,
  x,
  y,
  size,
  color,
  inAt,
  outAt = null,
  weight = 700,
  align = 'left',
  width,
  font = FONT.display,
  tracking = TYPE.tracking,
  dur = 16,
  upper = false,
}) => {
  const frame = useCurrentFrame();
  const pin = prog(frame, inAt, inAt + dur, EASE.out);
  const pout = outAt == null ? 0 : prog(frame, outAt, outAt + 9, EASE.in);
  if (pin <= 0 || pout >= 1) return null;
  const pad = Math.round(size * 0.12);
  const ty = (1 - pin) * size * 0.95 - pout * size * 0.55;
  const op = clamp01(pin * 1.8) * (1 - pout);
  const blur = (1 - pin) * 5 + pout * 3;
  return (
    <div
      style={{
        position: 'absolute',
        left: align === 'center' ? 0 : x - pad,
        top: y - pad,
        width: align === 'center' ? width : undefined,
        height: size * 1.16 + pad * 2,
        padding: pad,
        overflow: 'hidden',
        textAlign: align,
      }}
    >
      <div
        style={{
          transform: `translateY(${ty.toFixed(2)}px)`,
          opacity: op,
          filter: blur > 0.1 ? `blur(${blur.toFixed(2)}px)` : undefined,
          fontFamily: font,
          fontWeight: weight,
          fontSize: size,
          lineHeight: 1.08,
          letterSpacing: tracking,
          color,
          whiteSpace: 'nowrap',
          textTransform: upper ? 'uppercase' : undefined,
        }}
      >
        {text}
      </div>
    </div>
  );
};

/** small, letter-spaced kicker in Inter */
export const Eyebrow: React.FC<Omit<LineProps, 'font' | 'tracking' | 'weight' | 'upper'>> = (p) => (
  <Line {...p} font={FONT.text} tracking={TYPE.eyebrowTracking} weight={600} upper dur={p.dur ?? 14} />
);
