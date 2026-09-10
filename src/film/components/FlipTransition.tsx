import React from 'react';
import {interpolate} from 'remotion';
import {withOvershoot, getMotionBlur} from '../springs';

type Props = {
  progress: number; // 0 = fully outgoing, 1 = fully incoming
  /** Same as `progress`, one frame earlier — lets the spatial motion blur
   *  below be measured from a real rotation delta instead of guessed from
   *  `progress` alone. Optional: omitting it yields zero measured
   *  velocity, so the faces render pin-sharp with no blur. */
  progressPrev?: number;
  outgoing: React.ReactNode;
  incoming: React.ReactNode;
  width: number;
  height: number;
  axis?: 'X' | 'Y';
};

// Icons get a much lighter motion blur than text, and only while the whole
// face is spatially moving (rotating/lifting) — never while its own paths
// are being drawn.
const MAX_ROT_VELOCITY = 9;
const MAX_ICON_BLUR = 7;

/**
 * A restrained 3D card flip — not a 180° PowerPoint spin. The outgoing face
 * rotates to ~-85° (edge-on, not past it) while the incoming face unrotates
 * from ~85° to 0° in the same beat, so they meet near the edge rather than
 * ever showing a mirrored backface. backface-visibility hides each face
 * once it turns away instead of a hard opacity cut. Rotation never moves
 * alone: a small translateY rides along with it on both faces, and the
 * incoming face's arrival (rotation + lift) carries ONE small controlled
 * overshoot via `withOvershoot` so it settles rather than snapping flat at
 * 0deg. Scale here is deliberately a PLAIN monotonic ease, never an
 * overshoot: the icon inside (via CardFace) already owns the one
 * completion-overshoot pulse on scale — doubling it at the container level
 * too reads as two pops instead of one. Container = translation/rotation,
 * content = the sole scale overshoot.
 */
export const FlipTransition: React.FC<Props> = ({
  progress,
  progressPrev,
  outgoing,
  incoming,
  width,
  height,
  axis = 'Y',
}) => {
  const p = Math.min(Math.max(progress, 0), 1);
  const pPrev = Math.min(Math.max(progressPrev ?? progress, 0), 1);

  const outRot = interpolate(p, [0, 1], [0, -85]);
  const outRotPrev = interpolate(pPrev, [0, 1], [0, -85]);
  const outTranslateY = interpolate(p, [0, 1], [0, -14]);
  const outScale = interpolate(p, [0, 1], [1, 0.92]);
  const outBlur = getMotionBlur(outRot - outRotPrev, MAX_ROT_VELOCITY, MAX_ICON_BLUR);

  const inRot = withOvershoot(p, 85, 0, 0.07);
  const inRotPrev = withOvershoot(pPrev, 85, 0, 0.07);
  const inTranslateY = withOvershoot(p, 24, 0, 0.22);
  const inScale = interpolate(p, [0, 1], [0.88, 1]);
  const inBlur = getMotionBlur(inRot - inRotPrev, MAX_ROT_VELOCITY, MAX_ICON_BLUR);

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
          filter: outBlur ? `blur(${outBlur}px)` : undefined,
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
          filter: inBlur ? `blur(${inBlur}px)` : undefined,
          transform: `${rotate(inRot)} translateY(${inTranslateY}px) scale(${inScale})`,
        }}
      >
        {incoming}
      </div>
    </div>
  );
};
