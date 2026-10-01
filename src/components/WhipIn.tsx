import React from 'react';
import {interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * Fast blurred whip-in used throughout the reference reel: type rushes into
 * place with directional motion blur that resolves as the spring settles,
 * instead of a plain fade/slide.
 */
export const WhipIn: React.FC<Props> = ({
  delay = 0,
  direction = 'up',
  distance = 70,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const localFrame = frame - delay;

  const progress = spring({
    frame: localFrame,
    fps,
    config: {damping: 14, mass: 0.5, stiffness: 170},
  });

  const opacity = interpolate(localFrame, [0, 6], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const blur = interpolate(progress, [0, 1], [16, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const offset = (1 - progress) * distance;
  const translate =
    direction === 'up'
      ? `translateY(${offset}px)`
      : direction === 'left'
        ? `translateX(${offset}px)`
        : `translateX(${-offset}px)`;

  return (
    <div
      style={{
        opacity,
        transform: translate,
        filter: `blur(${blur}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
