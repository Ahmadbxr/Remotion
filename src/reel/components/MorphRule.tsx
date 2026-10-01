import React from 'react';
import {interpolate} from 'remotion';
import {easeProgress, easeCamera} from '../motion/easings';

// ---------------------------------------------------------------------------
// ONE red rule, two jobs.
//
// It is the vertical rail the four services are measured against, and it is
// the horizontal connector the process chain is built on. Not two elements
// that resemble each other and swap — literally one div, pivoting from
// vertical to horizontal and travelling to its new post.
//
// The path is choreographed in three overlapping phases rather than as one
// blended tween, and that is not fussiness: pivoting and travelling at the
// same time swept the rule diagonally straight through the word IDEA. Each
// phase also keeps to one dominant axis, which is what stops a morph from
// reading as a plugin effect.
//
//   1. PIVOT   rotate about the rail's own top point, high in the frame,
//              well clear of everything the chain is about to build
//   2. SLIDE   travel right, still high
//   3. DROP    only once it is clear of IDEA's column, come down onto the
//              chain's baseline
//
// Origin is the top-left throughout, so `rotate(-90deg)` lays the bar down
// to the RIGHT — the direction the process reads in.
// ---------------------------------------------------------------------------

const BASE_W = 5;
const BASE_H = 375;

type Geom = {x: number; y: number; thickness: number; length: number};

type Props = {
  frame: number;
  color: string;
  /** The vertical state: top-left of the rail. */
  rail: Geom;
  /** The horizontal state: left end of the process line. */
  line: Geom;
  /** The rail draws itself downward from its top point — the previous
   *  beat's logo collapses into exactly that point. */
  drawStart: number;
  pivotStart: number;
  pivotDur?: number;
  slideStart: number;
  slideDur?: number;
  dropStart: number;
  dropDur?: number;
  exitStart: number;
  exitDur?: number;
};

export const MorphRule: React.FC<Props> = ({
  frame,
  color,
  rail,
  line,
  drawStart,
  pivotStart,
  pivotDur = 14,
  slideStart,
  slideDur = 12,
  dropStart,
  dropDur = 14,
  exitStart,
  exitDur = 10,
}) => {
  if (frame < drawStart - 1) return null;

  const draw = easeProgress(frame, drawStart, drawStart + 14, easeCamera);
  const pivot = easeProgress(frame, pivotStart, pivotStart + pivotDur, easeCamera);
  const slide = easeProgress(frame, slideStart, slideStart + slideDur, easeCamera);
  const drop = easeProgress(frame, dropStart, dropStart + dropDur, easeCamera);

  const rot = interpolate(pivot, [0, 1], [0, -90]);
  const sx = interpolate(pivot, [0, 1], [rail.thickness / BASE_W, line.thickness / BASE_W]);
  const sy = interpolate(pivot, [0, 1], [rail.length / BASE_H, line.length / BASE_H]) * (pivot < 0.001 ? draw : 1);
  const x = interpolate(slide, [0, 1], [rail.x, line.x]);
  const y = interpolate(drop, [0, 1], [rail.y, line.y]);

  const out = easeProgress(frame, exitStart, exitStart + exitDur, easeCamera);
  if (out >= 0.999) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: BASE_W,
        height: BASE_H,
        background: color,
        opacity: 1 - out,
        transformOrigin: '0% 0%',
        transform: `translate(${x}px, ${y}px) rotate(${rot}deg) scale(${sx}, ${sy})`,
      }}
    />
  );
};
