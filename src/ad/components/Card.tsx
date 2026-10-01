// The persistent rounded rectangle. Geometry comes from a keyframed Rect;
// content is whatever the scene puts inside. Shadow fades out as the card
// approaches full bleed (a full-frame image has nothing to cast onto).
import React from 'react';
import {Rect} from '../anim';
import {SHADOW} from '../theme';

type Props = {
  rect: Rect;
  bg?: string;
  shadow?: string;
  blur?: number; // velocity blur on the content only, never on the frame
  border?: string;
  children?: React.ReactNode;
};

export const Card: React.FC<Props> = ({rect, bg = '#FFFFFF', shadow = SHADOW.card, blur = 0, border, children}) => {
  const o = rect.o ?? 1;
  if (o <= 0.001 || rect.w < 1 || rect.h < 1) return null;
  const fullness = Math.min(1, rect.r / 12); // r → 0 means full bleed
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.w,
        height: rect.h,
        borderRadius: rect.r,
        overflow: 'hidden',
        background: bg,
        opacity: o,
        boxShadow: fullness > 0.02 ? shadow : 'none',
        border,
        transform: `perspective(1800px) rotateY(${rect.ry ?? 0}deg) rotate(${rect.rot ?? 0}deg) scale(${rect.s ?? 1})`,
        transformOrigin: '50% 50%',
        // keeps the rounded clip crisp while transformed
        WebkitMaskImage: '-webkit-radial-gradient(white, black)',
      }}
    >
      <div style={{position: 'absolute', inset: 0, filter: blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : undefined}}>
        {children}
      </div>
    </div>
  );
};
