import React from 'react';
import {spring, useCurrentFrame, useVideoConfig} from 'remotion';

type Props = {
  delay?: number;
  distance?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
};

/**
 * A line of type that springs up into place with a slight scale-in,
 * the same restrained bounce Apple product pages use for headline reveals.
 */
export const EnterText: React.FC<Props> = ({
  delay = 0,
  distance = 40,
  children,
  style,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: {damping: 200, mass: 0.6, stiffness: 120},
  });

  const translateY = (1 - progress) * distance;
  const opacity = Math.max(0, Math.min(1, progress));
  const scale = 0.94 + progress * 0.06;

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${translateY}px) scale(${scale})`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
