import React from 'react';
import {interpolate} from 'remotion';
import {ContentCard} from './ContentCard';
import {staggerProgress} from '../springs';

type Props = {
  frame: number;
  fps: number;
  startFrame: number;
  driftSpeed?: number;
  settle?: number; // 0-1, how far the drift has calmed into background rhythm
};

const LAYOUT = [
  {x: -320, y: -560, w: 210, h: 320, speed: 0.35},
  {x: 300, y: -420, w: 190, h: 280, speed: 0.22},
  {x: -260, y: -80, w: 220, h: 300, speed: -0.28},
  {x: 320, y: 60, w: 200, h: 300, speed: 0.18},
  {x: -300, y: 420, w: 210, h: 300, speed: -0.2},
  {x: 300, y: 560, w: 190, h: 260, speed: 0.3},
];

/**
 * Abstract background feed of drifting content cards — deliberately not an
 * Instagram/TikTok UI, just the rhythm of a social grid, parallaxing
 * slowly behind the central card.
 */
export const SocialFeed: React.FC<Props> = ({frame, fps, startFrame, driftSpeed = 1, settle = 0}) => {
  return (
    <>
      {LAYOUT.map((card, i) => {
        const enter = staggerProgress(frame, i, {
          startFrame,
          staggerFrames: 4,
          durationInFrames: 30,
          fps,
        });
        const localFrame = frame - startFrame;
        const drift = Math.sin(localFrame / 90 + i) * 14 * card.speed * driftSpeed;
        const blur = interpolate(enter, [0, 1], [10, interpolate(settle, [0, 1], [1.5, 4])]);
        const opacity = interpolate(enter, [0, 1], [0, interpolate(settle, [0, 1], [0.9, 0.4])]);
        const scale = interpolate(enter, [0, 1], [0.85, 1]);

        return (
          <ContentCard
            key={i}
            width={card.w}
            height={card.h}
            translateX={card.x + drift}
            translateY={card.y + drift * 0.6}
            scale={scale}
            blur={blur}
            opacity={opacity}
          />
        );
      })}
    </>
  );
};
