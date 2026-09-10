import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {springProgress, withOvershoot, TEXT, IMPACT} from '../motion/springs';
import {motionBlur, velocityTilt} from '../motion/velocity';

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

export type WordProps = {
  text: string;
  frame: number;
  fps: number;
  enterStart: number;
  enterDur?: number;
  exitStart?: number;
  exitDur?: number;
  fontSize: number;
  fontWeight?: number;
  color?: string;
  /** Where the word grows/settles from — never always center, per the
   *  off-center composition rule. */
  transformOrigin?: string;
  /** Vertical throw (px) on entrance; sign sets direction (negative = from
   *  above, positive = from below). */
  fromY?: number;
  fromX?: number;
  scaleFrom?: number;
  overshoot?: number;
  impact?: boolean;
  /** Fast-moving words pick up a whisper of rotation, not just blur. */
  tilt?: boolean;
  maxBlur?: number;
  style?: React.CSSProperties;
};

/** ONE word or short phrase as a physical object — position, scale, blur
 *  AND a whisper of velocity-linked rotation, never opacity alone. The
 *  atomic unit every text moment in the Reel is built from. */
export const KineticWord: React.FC<WordProps> = ({
  text,
  frame,
  fps,
  enterStart,
  enterDur = 9,
  exitStart,
  exitDur = 8,
  fontSize,
  fontWeight = 800,
  color = BRAND.ink,
  transformOrigin = '50% 100%',
  fromY = 46,
  fromX = 0,
  scaleFrom = 0.92,
  overshoot = 0.05,
  impact = false,
  tilt = false,
  maxBlur = 20,
  style,
}) => {
  const engine = impact ? IMPACT : TEXT;
  const enterP = clamp01(springProgress(frame, enterStart, enterStart + enterDur, fps, engine));
  const enterPPrev = clamp01(springProgress(frame - 1, enterStart, enterStart + enterDur, fps, engine));

  const hasExit = exitStart !== undefined;
  const exitP = hasExit ? clamp01(springProgress(frame, exitStart, exitStart + exitDur, fps, engine)) : 0;
  const exitPPrev = hasExit ? clamp01(springProgress(frame - 1, exitStart, exitStart + exitDur, fps, engine)) : 0;

  const exitDistY = fromY >= 0 ? -60 : 60;
  const yAt = (e: number, x: number) => withOvershoot(e, fromY, 0, overshoot) + interpolate(x, [0, 1], [0, exitDistY]);
  const xAt = (e: number, x: number) => withOvershoot(e, fromX, 0, overshoot * 0.7) + interpolate(x, [0, 1], [0, -fromX * 0.6]);

  const y = yAt(enterP, exitP);
  const yPrev = yAt(enterPPrev, exitPPrev);
  const x = xAt(enterP, exitP);
  const xPrev = xAt(enterPPrev, exitPPrev);
  const velocity = Math.abs(y - yPrev) + Math.abs(x - xPrev);
  const blur = motionBlur(velocity, fontSize * 0.5, maxBlur);
  const rotate = tilt ? velocityTilt(y - yPrev, fontSize * 0.35, 3.5) : 0;

  const scale = withOvershoot(enterP, scaleFrom, 1, impact ? 0.16 : overshoot * 0.7) * interpolate(exitP, [0, 1], [1, 1.05]);
  const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(exitP, [0, 1], [1, 0]);

  return (
    <span
      style={{
        display: 'inline-block',
        fontFamily: FONT,
        fontWeight,
        fontSize,
        color,
        opacity,
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin,
        whiteSpace: 'nowrap',
        ...style,
      }}
    >
      {text}
    </span>
  );
};

export type PhraseWord = {text: string; impact?: boolean; color?: string};

type PhraseProps = {
  words: PhraseWord[];
  frame: number;
  fps: number;
  enterStart: number;
  stagger?: number[];
  enterDur?: number;
  exitStart?: number;
  exitStagger?: number[];
  exitDur?: number;
  fontSize: number;
  fontWeight?: number;
  color?: string;
  align?: 'left' | 'center' | 'right';
  gap?: number;
  maxBlur?: number;
  style?: React.CSSProperties;
};

/** A row of KineticWords sharing one designed (non-uniform) stagger rhythm
 *  and one alignment — left/right-aligned phrases are how the Reel breaks
 *  out of centered "slide" composition. */
export const KineticPhrase: React.FC<PhraseProps> = ({
  words,
  frame,
  fps,
  enterStart,
  stagger = [0, 4, 5, 10],
  enterDur = 9,
  exitStart,
  exitStagger,
  exitDur = 8,
  fontSize,
  fontWeight = 800,
  color = BRAND.ink,
  align = 'center',
  gap,
  maxBlur = 20,
  style,
}) => {
  const justify = align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';
  return (
    <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: justify, gap: gap ?? fontSize * 0.26, ...style}}>
      {words.map((w, i) => (
        <KineticWord
          key={i}
          text={w.text}
          frame={frame}
          fps={fps}
          enterStart={enterStart + (stagger[i % stagger.length] ?? i * 4)}
          enterDur={enterDur}
          exitStart={exitStart === undefined ? undefined : exitStart + (exitStagger ? exitStagger[i % exitStagger.length] : (stagger[i % stagger.length] ?? i * 3))}
          exitDur={exitDur}
          fontSize={w.impact ? fontSize * 1.06 : fontSize}
          fontWeight={fontWeight}
          color={w.color ?? (w.impact ? BRAND.red : color)}
          impact={w.impact}
          tilt={w.impact}
          maxBlur={maxBlur}
        />
      ))}
    </div>
  );
};
