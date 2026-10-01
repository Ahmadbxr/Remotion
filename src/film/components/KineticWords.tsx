import React from 'react';
import {interpolate} from 'remotion';
import {FILM_COLORS, FILM_FONT} from '../theme';
import {morphProgress, withOvershoot, getMotionBlur, OFFSCRIPT_OVERSHOOT, SpringEngine} from '../springs';

export type WordDirection = 'left-right' | 'right-left' | 'center-out' | 'outside-center' | 'bottom-top';

/** A line is a string of one or more SEMANTIC GROUPS, separated by `|`.
 *  Each group (e.g. "DAS BESTE") animates as ONE atomic unit — the words
 *  inside it never separate or stagger against each other, only whole
 *  groups stagger against other groups. This is deliberate: staggering
 *  every individual word reads as a mechanical typewriter effect, while
 *  staggering meaning-carrying phrases reads as an editorial kinetic cut. */
type Line = string;

type Props = {
  lines: Line[];
  frame: number;
  fps: number;
  /** Absolute frame the group wave entrance begins. */
  enterStart: number;
  /** Frames between each group's own start — the wave, kept small (1-3). */
  wordStagger?: number;
  /** How long each group's own spring takes to settle (6-12 frames). */
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
  /** Global GROUP index (counting across all lines) that gets a stronger,
   *  slightly delayed settle and the biggest scale swing — use sparingly,
   *  on the one phrase that carries the message. */
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

/** Stagger RANK per group (0 = animates first) for a given wave direction — the
 *  groups themselves never leave their natural reading position horizontally,
 *  only the ORDER and origin of their reveal changes, so a German sentence
 *  never looks like it's being shuffled. */
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
 * The film's primary typography motion language: sentences assemble as a
 * fast traveling wave of SEMANTIC GROUPS (1-3 frame stagger, ~6-12 frame
 * settle per group — the whole sentence is legible almost immediately, the
 * wave is felt more than watched) rather than one block fading in or a
 * mechanical per-word typewriter, and disperse the same way on exit, faster
 * and usually in reverse.
 *
 * Every group gets ONE controlled overshoot on Y, X and scale together, and
 * real velocity-based blur — each group's own position is compared frame to
 * frame, so blur is a measured consequence of how fast that group is
 * moving, not a hand-authored curve, and is structurally exactly 0 once
 * every group is at rest.
 */
export const KineticWords: React.FC<Props> = ({
  lines,
  frame,
  fps,
  enterStart,
  wordStagger = 2,
  wordDuration = 11,
  exitStart,
  exitStagger = 2,
  exitDuration = 9,
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
  maxBlur = 22,
  style,
}) => {
  const perLine = lines.map((l) => l.split('|'));
  const totalGroups = perLine.reduce((sum, g) => sum + g.length, 0);
  const enterRanks = rankWords(totalGroups, direction);
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
  const exitRanks = rankWords(totalGroups, exitDirection);

  const startY = direction === 'bottom-top' ? 100 : 72;
  const engine: SpringEngine = OFFSCRIPT_OVERSHOOT;

  let globalIndex = 0;

  return (
    <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width, ...style}}>
      {perLine.map((groups, lineIdx) => (
        <div
          key={lineIdx}
          style={{
            position: 'relative',
            width,
            height: rowHeight,
            overflow: 'visible',
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
            {groups.map((group, groupInLine) => {
              const gi = globalIndex++;
              const isEmphasis = emphasisIndex === gi;

              const enterRank = enterRanks[gi];
              const enterFrom = enterStart + enterRank * wordStagger + (isEmphasis ? 2 : 0);
              const enterTo = enterFrom + wordDuration;
              const enterP = clamp01(morphProgress(frame, enterFrom, enterTo, fps, engine));
              const enterPPrev = clamp01(morphProgress(frame - 1, enterFrom, enterTo, fps, engine));

              const hasExit = exitStart !== undefined;
              const exitRank = exitRanks[gi];
              const exitFrom = (exitStart ?? 0) + exitRank * exitStagger;
              const exitTo = exitFrom + exitDuration;
              const exitP = hasExit ? clamp01(morphProgress(frame, exitFrom, exitTo, fps, engine)) : 0;
              const exitPPrev = hasExit ? clamp01(morphProgress(frame - 1, exitFrom, exitTo, fps, engine)) : 0;

              const overshoot = isEmphasis ? 0.13 : 0.06;
              const exitDistanceY = direction === 'bottom-top' ? 85 : -70;
              // Directional X entry: earlier-ranked groups (per the wave
              // direction) slide in from further along the axis, resolving
              // to the group's own natural horizontal position at rest —
              // the sentence never re-orders, it just arrives from a side.
              const xSign = direction === 'right-left' ? 1 : direction === 'left-right' ? -1 : (gi % 2 === 0 ? -1 : 1);
              const startX = xSign * (isEmphasis ? 80 : 46);
              const exitDistanceX = -xSign * 55;

              const posYAt = (ep: number, xp: number) =>
                withOvershoot(ep, startY, 0, overshoot) + interpolate(xp, [0, 1], [0, exitDistanceY]);
              const posXAt = (ep: number, xp: number) =>
                withOvershoot(ep, startX, 0, overshoot * 0.8) + interpolate(xp, [0, 1], [0, exitDistanceX]);

              const y = posYAt(enterP, exitP);
              const yPrev = posYAt(enterPPrev, exitPPrev);
              const x = posXAt(enterP, exitP);
              const xPrev = posXAt(enterPPrev, exitPPrev);
              const velocity = Math.abs(y - yPrev) + Math.abs(x - xPrev);
              const blur = getMotionBlur(velocity, rowHeight * 0.55, maxBlur);

              // Scale ALWAYS settles back to exactly 1 at rest — only the
              // overshoot PEAK differs by emphasis (up to ~1.08 for the one
              // emphasis phrase, ~1.04 for the rest). A "to" other than 1
              // here would leave every settled group permanently oversized,
              // which silently eats into any inter-group margin as well as
              // just looking wrong once the sentence is fully legible.
              const enterScale = withOvershoot(enterP, isEmphasis ? 0.88 : 0.92, 1, isEmphasis ? 0.67 : 0.5);
              const exitScale = interpolate(exitP, [0, 1], [1, direction === 'bottom-top' ? 0.94 : 1.06]);
              const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(exitP, [0, 1], [1, 0]);

              return (
                <span
                  key={groupInLine}
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
                    transform: `translate(${x}px, ${y}px) scale(${enterScale * exitScale})`,
                    transformOrigin: '50% 100%',
                    // A text-node space between group spans is unreliable
                    // here (each group is its own inline-block box), so the
                    // gap is an explicit margin instead.
                    marginRight: groupInLine < groups.length - 1 ? fontSize * 0.28 : 0,
                  }}
                >
                  {group}
                </span>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
