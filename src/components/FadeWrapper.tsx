import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

type Props = {
  durationInFrames: number;
  fadeIn: number;
  fadeOut: number;
  children: React.ReactNode;
};

/**
 * Wraps a scene so consecutive overlapping <Sequence>s cross-fade instead of
 * hard-cutting, matching the soft dissolve transitions of Apple promo edits.
 */
export const FadeWrapper: React.FC<Props> = ({
  durationInFrames,
  fadeIn,
  fadeOut,
  children,
}) => {
  const frame = useCurrentFrame();

  const opacity = interpolate(
    frame,
    [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};
