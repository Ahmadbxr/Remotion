import React from 'react';

type Props = {
  width: number;
  height: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
};

/** A fixed-size overflow:hidden window. Content inside larger than the
 *  window (a huge word traveling through it) is genuinely CLIPPED by real
 *  frame edges as it passes — masking, not just opacity/translate. This is
 *  what makes a word "travel through frame" instead of just sliding in. */
export const MaskReveal: React.FC<Props> = ({width, height, style, children}) => (
  <div style={{position: 'relative', width, height, overflow: 'hidden', ...style}}>{children}</div>
);
