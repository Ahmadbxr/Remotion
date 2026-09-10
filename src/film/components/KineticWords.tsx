import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';
import {morphProgress, withOvershoot, getMotionBlur, OFFSCRIPT_OVERSHOOT, SpringEngine} from '../springs';

export type WordDirection = 'left-right' | 'right-left' | 'center-out' | 'outside-center' | 'bottom-top';

type Line = string;

type Props = {
  lines: Line[];
  frame: number;
  fps: number;
  /** Absolute frame the word-wave entrance begins. */
  enterStart: number;
  /** Frames between each word's own start — this is the wave, keep it small (2-4). */
  wordStagger?: number;
  /** How long each word's own spring takes to settle. */
  wordDuration?: number;
  /** Absolute frame the exit wave begins. Omit to never exit (e.g. final tagline). */
  exitStart?: number;
  exitStagger?: number;
  exitDuration?: number;
  /** Reverse the wave direction on exit relative to entrance. Default true — the
   *  sentence assembles one way and disperses the other, reading as one continuous
   *  gesture rather than a mirrored replay. */
  reverseOnExit?: boolean;
  direction?: WordDirection;
  /** Global word index (counting across all lines) that gets a stronger, slightly
   *  delayed settle — use sparingly, on the one word that carries the message. */
  emphasisIndex?: number;
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

/** Stagger RANK per word (0 = animates first) for a given wave direction — the
 *  words themselves never leave their natural reading position horizontally,
 *  only the ORDER and vertical origin of their reveal changes, so a German
 *  sentence never looks like it's being shuffled. */
const rankWords = (n: number, direction: WordDirection): number[] => {
  const idx = Array.from({length: n}, (_, i) => i);
  let order: number[];
  if (direction === 'right-left') {
    order = [...idx].reverse();
  } else if (direction === 'center-out') {
    const mid = (n - 1) / 2;
    order = [...idx].sort((a, b) => Math.abs(a - mid) - Math.abs(b - mid));
  } else if (direction === 'outside-center') {
    const mid = (n - 1) / 2;
    order = [...idx].sort((a, b) => Math.abs(b - mid) - Math.abs(a - mid));
  } else {
    order = idx; // 'left-right' and 'bottom-top' both read in natural order
  }
  const ranks = new Array(n).fill(0);
  order.forEach((wordIndex, rank) => {
    ranks[wordIndex] = rank;
  });
  return ranks;
};

/**
 * The film's primary typography motion language for full sentences: words
 * assemble as a fast traveling wave (2-4 frame stagger, ~12-16 frame settle
 * per word — the whole sentence is legible almost immediately, the wave is
 * felt more than watched) rather than one block fading in, and disperse the
 * same way on exit, faster and usually in reverse.
 *
 * Every word gets ONE controlled overshoot (position + scale together) and
 * real velocity-based blur — each word's own y-position is compared frame to
 * frame, so blur is a measured consequence of how fast that word is moving,
 * not a hand-authored curve, and is structurally exactly 0 once every word
 * is at rest.
 */
export const KineticWords: React.FC<Props> = ({
  lines,
  frame,
  fps,
  enterStart,
  wordStagger = 3,
  wordDuration = 14,
  exitStart,
  exitStagger = 2,
  exitDuration = 10,
  reverseOnExit = true,
  direction = 'left-right',
  emphasisIndex,
  fontSize,
  fontWeight = 800,
  color = FILM_COLORS.primary,
  rowHeight,
  lineHeight = 1.05,
  letterSpacing = -1,
  width,
  maxBlur = 16,
  style,
}) => {
  const perLine = lines.map((l) => l.split(' '));
  const totalWords = perLine.reduce((sum, w) => sum + w.length, 0);
  const enterRanks = rankWords(totalWords, direction);
  const exitDirection: WordDirection =
    reverseOnExit && direction === 'left-right'
      ? 'right-left'
      : reverseOnExit && direction === 'right-left'
        ? 'left-right'
        : reverseOnExit && direction === 'center-out'
          ? 'outside-center'
          : reverseOnExit && direction === 'outside-center'
            ? 'center-out'
            : direction;
  const exitRanks = rankWords(totalWords, exitDirection);

  const startY = direction === 'bottom-top' ? 60 : 40;
  const engine: SpringEngine = OFFSCRIPT_OVERSHOOT;

  let globalIndex = 0;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width, ...style}}>
      {perLine.map((words, lineIdx) => (
        <div
          key={lineIdx}
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
              left: '50%',
              transform: 'translate(-50%, -50%)',
              whiteSpace: 'nowrap',
            }}
          >
            {words.map((word, wordInLine) => {
              const wi = globalIndex++;
              const isEmphasis = emphasisIndex === wi;

              const enterRank = enterRanks[wi];
              const enterFrom = enterStart + enterRank * wordStagger + (isEmphasis ? 3 : 0);
              const enterTo = enterFrom + wordDuration;
              const enterP = clamp01(morphProgress(frame, enterFrom, enterTo, fps, engine));
              const enterPPrev = clamp01(morphProgress(frame - 1, enterFrom, enterTo, fps, engine));

              const hasExit = exitStart !== undefined;
              const exitRank = exitRanks[wi];
              const exitFrom = (exitStart ?? 0) + exitRank * exitStagger;
              const exitTo = exitFrom + exitDuration;
              const exitP = hasExit ? clamp01(morphProgress(frame, exitFrom, exitTo, fps, engine)) : 0;
              const exitPPrev = hasExit ? clamp01(morphProgress(frame - 1, exitFrom, exitTo, fps, engine)) : 0;

              const overshoot = isEmphasis ? 0.09 : 0.04;
              const exitDistance = direction === 'bottom-top' ? 55 : -45;

              const posAt = (ep: number, xp: number) =>
                withOvershoot(ep, startY, 0, overshoot) + interpolate(xp, [0, 1], [0, exitDistance]);

              const y = posAt(enterP, exitP);
              const yPrev = posAt(enterPPrev, exitPPrev);
              const velocity = y - yPrev;
              const blur = getMotionBlur(velocity, rowHeight * 0.5, maxBlur);

              const enterScale = withOvershoot(enterP, isEmphasis ? 0.94 : 0.97, isEmphasis ? 1.05 : 1, overshoot * 0.6);
              const exitScale = interpolate(exitP, [0, 1], [1, direction === 'bottom-top' ? 0.98 : 1.02]);
              const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(exitP, [0, 1], [1, 0]);

              return (
                <span
                  key={wordInLine}
                  style={{
                    display: 'inline-block',
                    fontFamily: FILM_FONT,
                    fontWeight,
                    fontSize,
                    lineHeight,
                    letterSpacing,
                    color,
                    opacity,
                    filter: blur ? `blur(${blur}px)` : undefined,
                    transform: `translateY(${y}px) scale(${enterScale * exitScale})`,
                    transformOrigin: '50% 100%',
                  }}
                >
                  {word}
                  {wordInLine < words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
