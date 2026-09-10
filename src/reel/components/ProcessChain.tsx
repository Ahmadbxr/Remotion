import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {easeProgress, easeOutExpo, easeInExpo, easeInOutCubic} from '../motion/easings';
import {motionBlur} from '../motion/velocity';
import {GraphicLine, GraphicFrame, GraphicPlayhead} from './Motifs';

type Props = {
  frame: number;
  start: number;
  fontSize: number;
};

/**
 * ONE process chain, not five title cards: IDEA appears, a red line
 * emerges from it and travels — SHOOT appears exactly where the line-tip
 * arrives (the line delivers it), a frame closes around SHOOT and that
 * closure IS the snap-cut into EDIT, a playhead sweeps through EDIT, POST
 * launches upward at real velocity and GROW's entrance continues that
 * exact same upward momentum (a match by direction, not a fresh entrance).
 */
export const ProcessChain: React.FC<Props> = ({frame, start, fontSize}) => {
  const local = frame - start;

  // ---- IDEA ----
  const ideaEnterEnd = 10;
  const ideaP = easeProgress(frame, start, start + ideaEnterEnd, easeOutExpo);
  // IDEA's job (spawning the line) is done once SHOOT has landed — it
  // fades rather than sitting on screen for the rest of the chain.
  const ideaExitStart = start + 29;
  const ideaExitP = easeProgress(frame, ideaExitStart, ideaExitStart + 8, easeInExpo);
  const ideaOpacity = ideaP * (1 - ideaExitP);
  const ideaX = interpolate(ideaP, [0, 1], [-40, 0]) + interpolate(ideaExitP, [0, 1], [0, -30]);

  // ---- the emerging line — same exit window as IDEA, its origin. ----
  const lineStart = start + 6;
  const lineEnd = start + 20;
  const lineLen = 300;
  const lineP = easeProgress(frame, lineStart, lineEnd, easeInOutCubic);
  const lineExitP = easeProgress(frame, ideaExitStart, ideaExitStart + 8, easeInExpo);
  const lineOpacity = 1 - lineExitP;

  // ---- SHOOT (delivered by the line) ----
  const shootStart = lineEnd;
  const shootEnterEnd = shootStart + 7;
  const shootP = easeProgress(frame, shootStart, shootEnterEnd, easeOutExpo);
  const shootExitStart = shootStart + 18;
  const shootExitEnd = shootExitStart + 4;
  const shootExitP = easeProgress(frame, shootExitStart, shootExitEnd, easeInExpo);
  const shootOpacity = shootP * (1 - shootExitP);
  const shootScale = interpolate(shootP, [0, 1], [0.7, 1]) * interpolate(shootExitP, [0, 1], [1, 0.85]);

  // ---- the frame closing around SHOOT — its closure snaps into EDIT ----
  const frameCloseStart = shootStart + 9;
  const frameCloseEnd = shootExitStart;
  const frameP = easeProgress(frame, frameCloseStart, frameCloseEnd, easeInOutCubic);

  // ---- EDIT (appears the instant the frame snaps shut) ----
  const editStart = shootExitStart;
  const editEnterEnd = editStart + 4; // a SNAP, not a settle
  const editP = easeProgress(frame, editStart, editEnterEnd, easeOutExpo);
  const editExitStart = editStart + 22;
  const editExitEnd = editExitStart + 4;
  const editExitP = easeProgress(frame, editExitStart, editExitEnd, easeInExpo);
  const editOpacity = editP * (1 - editExitP);

  // ---- the playhead sweeping through EDIT ----
  const playheadStart = editStart + 5;
  const playheadEnd = editExitStart - 2;
  const playheadTrack = 170;
  const playheadP = easeProgress(frame, playheadStart, playheadEnd, easeInOutCubic);

  // ---- POST — arrives, holds, then LAUNCHES upward ----
  const postStart = editExitStart - 2;
  const postEnterEnd = postStart + 8;
  const postP = easeProgress(frame, postStart, postEnterEnd, easeOutExpo);
  const postExitStart = postStart + 12;
  const postExitEnd = postExitStart + 8;
  const postExitP = easeProgress(frame, postExitStart, postExitEnd, easeInExpo);
  const postY = interpolate(postP, [0, 1], [36, 0]) - interpolate(postExitP, [0, 1], [0, 420]);
  const postYPrev =
    interpolate(easeProgress(frame - 1, postStart, postEnterEnd, easeOutExpo), [0, 1], [36, 0]) -
    interpolate(easeProgress(frame - 1, postExitStart, postExitEnd, easeInExpo), [0, 1], [0, 420]);
  const postVelocity = Math.abs(postY - postYPrev);
  const postBlur = motionBlur(postVelocity, 40, 26);
  const postOpacity = postP * interpolate(postExitP, [0, 0.75, 1], [1, 0.4, 0]);

  // ---- GROW — enters ALREADY moving, continuing POST's exact upward
  //      velocity, then decelerates into rest. This is the match. ----
  const growStart = postExitStart + 6;
  const growEnterEnd = growStart + 13;
  const growP = easeProgress(frame, growStart, growEnterEnd, easeOutExpo);
  const growY = interpolate(growP, [0, 1], [-260, 0]);
  const growYPrev = interpolate(easeProgress(frame - 1, growStart, growEnterEnd, easeOutExpo), [0, 1], [-260, 0]);
  const growVelocity = Math.abs(growY - growYPrev);
  const growBlur = motionBlur(growVelocity, 30, 22);
  // GROW hands off to the metric roller shortly after landing — it MUST
  // fade out here rather than sit at full opacity forever once the
  // roller (rendered separately, by the caller) takes over the same area.
  const growExitStart = growEnterEnd + 3;
  const growExitP = easeProgress(frame, growExitStart, growExitStart + 6, easeInExpo);
  const growOpacity =
    interpolate(frame, [growStart, growStart + 4], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    (1 - growExitP);

  if (local < -4 || local > 100) return null;

  const wordStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 800,
    fontSize,
    letterSpacing: -2,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{position: 'relative', width: 640, height: 220}}>
      {ideaOpacity > 0.002 && (
        <div style={{position: 'absolute', left: 0, top: 60, opacity: ideaOpacity, transform: `translateX(${ideaX}px)`, ...wordStyle, color: BRAND.ink}}>
          IDEA
        </div>
      )}

      {lineP > 0.002 && lineOpacity > 0.002 && (
        <GraphicLine
          orientation="h"
          length={lineLen}
          progress={lineP}
          origin="start"
          style={{position: 'absolute', left: 160, top: 92, opacity: lineOpacity}}
        />
      )}

      {shootOpacity > 0.002 && (
        <div style={{position: 'absolute', left: 470, top: 44, width: 150, height: 90}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: shootOpacity,
              transform: `scale(${shootScale})`,
              ...wordStyle,
              color: BRAND.ink,
            }}
          >
            SHOOT
          </div>
          {frameP > 0.002 && <GraphicFrame width={150} height={90} progress={frameP} cornerLen={26} />}
        </div>
      )}

      {editOpacity > 0.002 && (
        <div style={{position: 'absolute', left: 470, top: 44, width: 170, height: 90}}>
          <div style={{position: 'absolute', top: 10, left: 0, opacity: editOpacity, ...wordStyle, color: BRAND.ink}}>EDIT</div>
          {playheadP > 0.002 && playheadP < 1 && (
            <GraphicPlayhead trackWidth={playheadTrack} progress={playheadP} style={{top: 56}} />
          )}
          {playheadP >= 0.002 && (
            <GraphicLine orientation="h" length={playheadTrack} progress={1} thickness={2} color={BRAND.border} style={{position: 'absolute', top: 64, opacity: 0.6}} />
          )}
        </div>
      )}

      {postOpacity > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 150,
            opacity: postOpacity,
            filter: postBlur ? `blur(${postBlur}px)` : undefined,
            transform: `translateY(${postY}px)`,
            ...wordStyle,
            color: BRAND.ink,
          }}
        >
          POST
        </div>
      )}

      {growOpacity > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: 40,
            top: 150,
            opacity: growOpacity,
            filter: growBlur ? `blur(${growBlur}px)` : undefined,
            transform: `translateY(${growY}px)`,
            ...wordStyle,
            color: BRAND.red,
          }}
        >
          GROW
        </div>
      )}
    </div>
  );
};
