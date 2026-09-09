import React from 'react';
import {interpolate} from 'remotion';
import {withOvershoot} from '../springs';

type Props = {
  progress: number; // 0 = fully outgoing, 1 = fully incoming
  outgoing: React.ReactNode;
  incoming: React.ReactNode;
  width: number;
  height: number;
  axis?: 'X' | 'Y';
};

/**
 * A restrained 3D card flip — not a 180° PowerPoint spin. The outgoing face
 * rotates to ~-85° (edge-on, not past it) while the incoming face unrotates
 * from ~85° to 0° in the same beat, so they meet near the edge rather than
 * ever showing a mirrored backface. backface-visibility hides each face
 * once it turns away instead of a hard opacity cut. Rotation never moves
 * alone: a small translateY + scale rides along with it on both faces, and
 * the incoming face's arrival (rotation, lift, scale — all three) carries
 * ONE small controlled overshoot via `withOvershoot` so it settles rather
 * than snapping flat at 0deg/1.0.
 */
export const FlipTransition: React.FC<Props> = ({
  progress,
  outgoing,
  incoming,
  width,
  height,
  axis = 'Y',
}) => {
  const p = Math.min(Math.max(progress, 0), 1);
  const outRot = interpolate(p, [0, 1], [0, -85]);
  const outTranslateY = interpolate(p, [0, 1], [0, -10]);
  const outScale = interpolate(p, [0, 1], [1, 0.94]);
  const inRot = withOvershoot(p, 85, 0, 0.05);
  const inTranslateY = withOvershoot(p, 18, 0, 0.18);
  const inScale = withOvershoot(p, 0.9, 1, 0.04);
  const outOpacity = interpolate(p, [0, 0.5, 0.62], [1, 1, 0], {extrapolateRight: 'clamp'});
  const inOpacity = interpolate(p, [0.38, 0.5, 1], [0, 1, 1], {extrapolateLeft: 'clamp'});
  const rotate = (deg: number) => (axis === 'Y' ? `rotateY(${deg}deg)` : `rotateX(${deg}deg)`);

  return (
    <div style={{position: 'relative', width, height, perspective: 1800}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          opacity: outOpacity,
          transform: `${rotate(outRot)} translateY(${outTranslateY}px) scale(${outScale})`,
        }}
      >
        {outgoing}
      </div>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
          opacity: inOpacity,
          transform: `${rotate(inRot)} translateY(${inTranslateY}px) scale(${inScale})`,
        }}
      >
        {incoming}
      </div>
    </div>
  );
};
