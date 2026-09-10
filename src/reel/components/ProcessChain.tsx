import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {progress, withOvershoot, motionBlur, IMPACT} from '../springs';

export type ChainWord = {text: string; emphasis?: boolean};

type Props = {
  frame: number;
  fps: number;
  start: number;
  words: ChainWord[];
  slotFrames?: number;
  fontSize: number;
};

/**
 * A horizontal chain reaction — IDEA -> SHOOT -> EDIT -> POST -> GROW —
 * never five words shown at once. Each word arrives from the right, a red
 * line grows beneath it (the thing that visually "pushed" it into frame),
 * then both word and line get shoved out to the left as the next one
 * arrives — the exiting word's own exit motion is what the next word's
 * entrance reads as continuing.
 */
export const ProcessChain: React.FC<Props> = ({frame, fps, start, words, slotFrames = 17, fontSize}) => {
  return (
    <div style={{position: 'relative', width: '100%', height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      {words.map((word, i) => {
        const center = start + i * slotFrames + slotFrames * 0.5;
        const enterStart = center - 10;
        const enterDur = 10;
        const exitStart = center + 4;
        const exitDur = 9;

        const enterP = progress(frame, enterStart, enterStart + enterDur, fps, IMPACT);
        const enterPPrev = progress(frame - 1, enterStart, enterStart + enterDur, fps, IMPACT);
        const exitP = progress(frame, exitStart, exitStart + exitDur, fps, IMPACT);
        const exitPPrev = progress(frame - 1, exitStart, exitStart + exitDur, fps, IMPACT);

        const xAt = (e: number, x: number) => withOvershoot(e, 150, 0, 0.1) - x * 170;
        const x = xAt(enterP, exitP);
        const xPrev = xAt(enterPPrev, exitPPrev);
        const velocity = Math.abs(x - xPrev);
        const blur = motionBlur(velocity, 30, 22);

        const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(exitP, [0, 1], [1, 0]);
        if (opacity <= 0.001) return null;

        const lineWidth = interpolate(enterP, [0.15, 0.9], [0, 90], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 14,
              opacity,
              filter: blur ? `blur(${blur}px)` : undefined,
              transform: `translateX(${x}px)`,
            }}
          >
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: word.emphasis ? fontSize * 1.15 : fontSize,
                letterSpacing: -1,
                color: word.emphasis ? BRAND.red : BRAND.ink,
                whiteSpace: 'nowrap',
              }}
            >
              {word.text}
            </div>
            <div style={{width: lineWidth, height: 4, borderRadius: 2, background: BRAND.red}} />
          </div>
        );
      })}
    </div>
  );
};
