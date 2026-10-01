import React from 'react';
import {Impact, impactTransform} from '../motion/physics';
import {CameraState} from '../motion/camera';

// ---------------------------------------------------------------------------
// THE CAMERA. Exactly one of these exists, it wraps everything, and it is
// the ONLY thing in the Reel allowed to move the whole frame.
//
// That single-owner rule is the point. Camera shake plus a parent shake
// plus a text shake plus a card shake compound into jitter that no
// individual amplitude explains, because each layer looks reasonable on its
// own. Here the camera's contribution is declared in one list, so the total
// is readable at a glance and cannot quietly stack.
//
// Amplitude discipline, from the brief and not exceeded anywhere:
//
//   X          2-6 px
//   Y          2-8 px
//   rotation   0.05-0.25 deg
//   duration   5-10 frames @30fps
//
// The viewer must never notice "camera shake". They should notice that
// something hit hard. The camera's job is to confirm an impact the
// typography already performed — it is the third voice, never the event.
// ---------------------------------------------------------------------------

export const CameraRig: React.FC<{
  frame: number;
  impacts: Impact[];
  /** The dolly. Two moves in twenty seconds, both pass-throughs. */
  camera: CameraState;
  children: React.ReactNode;
}> = ({frame, impacts, camera, children}) => {
  const {x, y, rotate, scale} = impactTransform(frame, impacts);
  const still = x === 0 && y === 0 && rotate === 0 && scale === 1 && !camera.moving;
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        // No transform at all while the camera is at rest, so there is not
        // even a compositing-layer rounding difference between "still" and
        // "shaken" frames.
        // The dolly multiplies into the same transform rather than adding a
        // second wrapper — one transform on one element, so there is no
        // chance of the camera and an impact compounding into a stack.
        transform: still ? undefined : `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale * camera.scale})`,
        transformOrigin: camera.moving ? `${camera.fx}px ${camera.fy}px` : '50% 50%',
        willChange: still ? undefined : 'transform',
      }}
    >
      {children}
    </div>
  );
};
