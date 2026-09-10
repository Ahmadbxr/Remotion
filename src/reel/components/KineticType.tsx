import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {progress, withOvershoot, motionBlur, SNAPPY_TEXT, IMPACT} from '../springs';

export type KWord = {
  text: string;
  /** This word hits harder: bigger overshoot, IMPACT spring, optional color. */
  emphasis?: boolean;
  color?: string;
};

type Props = {
  lines: KWord[][];
  frame: number;
  fps: number;
  enterStart: number;
  stagger?: number;
  wordDuration?: number;
  exitStart?: number;
  exitStagger?: number;
  exitDuration?: number;
  fontSize: number;
  fontWeight?: number;
  color?: string;
  rowHeight: number;
  lineHeight?: number;
  letterSpacing?: number;
  width?: number;
  maxBlur?: number;
  style?: React.CSSProperties;
};

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);

/**
 * The Reel's hero typography engine. Every sentence assembles word-by-word
 * (never all-at-once) with a fast Y-up entrance, a light scale settle, and
 * velocity-measured blur that only exists while a word is actually moving.
 * The one word marked `emphasis` gets a distinct choreography per the
 * brief: scale 0.70 -> 1.10 -> 1.0 with blur resolving to sharp on the hit,
 * and every OTHER word in the sentence receives a brief physical "kick"
 * displacement the instant the emphasis word lands — this is what makes the
 * impact read as physical contact instead of an isolated animation.
 */
export const KineticSentence: React.FC<Props> = ({
  lines,
  frame,
  fps,
  enterStart,
  stagger = 4,
  wordDuration = 14,
  exitStart,
  exitStagger = 3,
  exitDuration = 10,
  fontSize,
  fontWeight = 800,
  color = BRAND.ink,
  rowHeight,
  lineHeight = 1.04,
  letterSpacing = -1,
  width,
  maxBlur = 24,
  style,
}) => {
  const flat = lines.flat();
  const emphasisIdx = flat.findIndex((w) => w.emphasis);
  // The emphasis word's own overshoot PEAK frame — this is the "hit" moment
  // every other word reacts to.
  const emphasisEnterFrom = enterStart + (emphasisIdx >= 0 ? emphasisIdx : 0) * stagger;
  const impactHitFrame = emphasisEnterFrom + wordDuration * 0.62; // withOvershoot peaks at p=0.62

  let gi = 0;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width, ...style}}>
      {lines.map((words, lineIdx) => (
        <div key={lineIdx} style={{position: 'relative', width, height: rowHeight, overflow: 'visible'}}>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {words.map((word, wordInLine) => {
              const idx = gi++;
              const isEmphasis = !!word.emphasis;
              const engine = isEmphasis ? IMPACT : SNAPPY_TEXT;

              const enterFrom = enterStart + idx * stagger;
              const enterTo = enterFrom + wordDuration;
              const enterP = clamp01(progress(frame, enterFrom, enterTo, fps, engine));
              const enterPPrev = clamp01(progress(frame - 1, enterFrom, enterTo, fps, engine));

              const hasExit = exitStart !== undefined;
              const exitFrom = (exitStart ?? 0) + idx * exitStagger;
              const exitTo = exitFrom + exitDuration;
              const exitP = hasExit ? clamp01(progress(frame, exitFrom, exitTo, fps, engine)) : 0;
              const exitPPrev = hasExit ? clamp01(progress(frame - 1, exitFrom, exitTo, fps, engine)) : 0;

              // Entrance: fast Y-up arrival with a small controlled
              // overshoot; emphasis gets a much bigger vertical throw.
              const startY = isEmphasis ? 90 : 56;
              const overshoot = isEmphasis ? 0.14 : 0.05;
              const exitDistanceY = -60;
              const yAt = (ep: number, xp: number) =>
                withOvershoot(ep, startY, 0, overshoot) + interpolate(xp, [0, 1], [0, exitDistanceY]);
              const y = yAt(enterP, exitP);
              const yPrev = yAt(enterPPrev, exitPPrev);

              // The physical "kick": every word (including the emphasis
              // word itself, faintly) gets a brief decaying nudge exactly
              // when the emphasis word lands — a shockwave, not a reaction
              // any single word chooses on its own.
              const kickT = frame - impactHitFrame;
              const kickWindow = 10;
              const kickAmount =
                kickT >= 0 && kickT <= kickWindow
                  ? Math.sin((kickT / kickWindow) * Math.PI) * (isEmphasis ? 3 : 6)
                  : 0;
              const kickSign = idx % 2 === 0 ? -1 : 1;

              const velocity = Math.abs(y - yPrev);
              const blur = motionBlur(velocity, rowHeight * 0.6, maxBlur);

              const scaleFrom = isEmphasis ? 0.7 : 0.9;
              const scalePeakOvershoot = isEmphasis ? 0.14 : 0.045;
              const enterScale = withOvershoot(enterP, scaleFrom, 1, scalePeakOvershoot);
              const exitScale = interpolate(exitP, [0, 1], [1, 1.05]);
              const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(exitP, [0, 1], [1, 0]);

              return (
                <span
                  key={wordInLine}
                  style={{
                    display: 'inline-block',
                    fontFamily: FONT,
                    fontWeight,
                    fontSize: isEmphasis ? fontSize * 1.05 : fontSize,
                    lineHeight,
                    letterSpacing,
                    color: word.color ?? (isEmphasis ? BRAND.red : color),
                    opacity,
                    filter: blur ? `blur(${blur}px)` : undefined,
                    transform: `translate(${kickAmount * kickSign}px, ${y}px) scale(${enterScale * exitScale})`,
                    transformOrigin: '50% 100%',
                    marginRight: wordInLine < words.length - 1 ? fontSize * 0.26 : 0,
                  }}
                >
                  {word.text}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
