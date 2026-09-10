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
  /** When GROW hands the frame over entirely (synced to the metric launch). */
  growExitStart: number;
};

/**
 * ONE machine, visible as a machine. Every stage is caused by the previous
 * one and the parts stay on screen together — there is never a frame
 * holding a single unrelated word:
 *
 *   IDEA -> a red line grows out of it and travels ->
 *   the line's arrival ACTIVATES SHOOT ->
 *   a frame closes around SHOOT and that closure IS the cut to EDIT
 *   (the same rect persists, only the label inside changes) ->
 *   a playhead sweeps the rect -> the rect collapses and launches POST
 *   upward -> POST's upward velocity is continued by GROW's entrance ->
 *   GROW stays as the label the metric rolls under.
 *
 * IDEA and its line stay visible (dimmed back) through the SHOOT/EDIT
 * stage, so the causal path is legible the whole way across.
 */
export const ProcessChain: React.FC<Props> = ({frame, start, fontSize, growExitStart}) => {
  const S = start;

  // ---- IDEA: arrives from the left, decisive bezier, not a spring ----
  const ideaP = easeProgress(frame, S, S + 9, easeOutExpo);
  const ideaDim = easeProgress(frame, S + 24, S + 34, easeInOutCubic); // recedes, stays present
  const ideaOutP = easeProgress(frame, S + 56, S + 66, easeInExpo);
  const ideaOpacity = ideaP * interpolate(ideaDim, [0, 1], [1, 0.3]) * (1 - ideaOutP);
  const ideaX = interpolate(ideaP, [0, 1], [-50, 0]) - interpolate(ideaOutP, [0, 1], [0, 40]);

  // ---- the line: energy leaving IDEA and travelling to SHOOT ----
  const lineP = easeProgress(frame, S + 6, S + 22, easeInOutCubic);
  const lineOutP = easeProgress(frame, S + 56, S + 66, easeInExpo);
  const lineOpacity = (1 - lineOutP) * interpolate(ideaDim, [0, 1], [1, 0.55]);

  // ---- SHOOT: activated exactly when the line-tip lands on it ----
  const shootP = easeProgress(frame, S + 22, S + 29, easeOutExpo);
  const shootSwapP = easeProgress(frame, S + 37, S + 41, easeInOutCubic); // SHOOT -> EDIT, a snap
  const shootOpacity = shootP * (1 - shootSwapP);

  // ---- the rect: draws around SHOOT, then PERSISTS as EDIT's frame ----
  const frameDrawP = easeProgress(frame, S + 26, S + 37, easeInOutCubic);
  const frameCollapseP = easeProgress(frame, S + 58, S + 66, easeInExpo);
  const frameOpacity = interpolate(frameCollapseP, [0, 1], [1, 0]);
  const frameScaleY = interpolate(frameCollapseP, [0, 1], [1, 0.18]);

  // ---- EDIT: appears in the same rect the instant the frame shuts, and
  //      is fully gone BEFORE POST becomes legible — the rect hands over to
  //      one word at a time, never two overlapping labels. ----
  const editOpacity = shootSwapP * (1 - easeProgress(frame, S + 55, S + 60, easeInExpo));

  // ---- the playhead sweeping the rect ----
  const playheadP = easeProgress(frame, S + 42, S + 58, easeInOutCubic);
  const playheadVisible = frame >= S + 42 && frame <= S + 59;

  // ---- POST: launched upward BY the rect collapsing ----
  const postInP = easeProgress(frame, S + 60, S + 65, easeOutExpo);
  const postOutP = easeProgress(frame, S + 63, S + 73, easeInExpo);
  const postYAt = (f: number) =>
    interpolate(easeProgress(f, S + 60, S + 65, easeOutExpo), [0, 1], [24, 0]) -
    interpolate(easeProgress(f, S + 63, S + 73, easeInExpo), [0, 1], [0, 300]);
  const postY = postYAt(frame);
  const postBlur = motionBlur(postY - postYAt(frame - 1), 34, 26);
  const postOpacity = postInP * interpolate(postOutP, [0, 0.8, 1], [1, 0.35, 0]);

  // ---- GROW: continues POST's exact upward travel, then decelerates ----
  const growP = easeProgress(frame, S + 66, S + 78, easeOutExpo);
  const growYAt = (f: number) => interpolate(easeProgress(f, S + 66, S + 78, easeOutExpo), [0, 1], [220, 0]);
  const growY = growYAt(frame);
  const growBlur = motionBlur(growY - growYAt(frame - 1), 26, 22);
  const growExitP = easeProgress(frame, growExitStart, growExitStart + 8, easeInExpo);
  const growOpacity =
    interpolate(frame, [S + 66, S + 70], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * (1 - growExitP);

  if (frame < S - 3 || frame > growExitStart + 12) return null;

  const wordStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 800,
    fontSize,
    letterSpacing: -2,
    whiteSpace: 'nowrap',
    color: BRAND.ink,
  };

  const BOX_L = 468;
  const BOX_T = 120;
  const BOX_W = 330;
  const BOX_H = 120;

  return (
    <div style={{position: 'relative', width: 940, height: 320}}>
      {ideaOpacity > 0.002 && (
        <div style={{position: 'absolute', left: 0, top: 148, opacity: ideaOpacity, transform: `translateX(${ideaX}px)`, ...wordStyle}}>
          IDEA
        </div>
      )}

      {lineP > 0.002 && lineOpacity > 0.002 && (
        <GraphicLine
          orientation="h"
          length={272}
          thickness={5}
          progress={lineP}
          origin="start"
          style={{position: 'absolute', left: 196, top: 184, opacity: lineOpacity}}
        />
      )}

      {/* The rect: one element from SHOOT through EDIT — the label inside
          swaps, the frame itself never restarts. */}
      {frameOpacity > 0.002 && frameDrawP > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: BOX_L,
            top: BOX_T,
            width: BOX_W,
            height: BOX_H,
            opacity: frameOpacity,
            transform: `scaleY(${frameScaleY})`,
            transformOrigin: '50% 50%',
          }}
        >
          <GraphicFrame width={BOX_W} height={BOX_H} progress={frameDrawP} cornerLen={30} strokeWidth={4} />
          {shootOpacity > 0.002 && (
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: shootOpacity, ...wordStyle}}>
              SHOOT
            </div>
          )}
          {editOpacity > 0.002 && (
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: editOpacity, ...wordStyle}}>
              EDIT
            </div>
          )}
          {playheadVisible && <GraphicPlayhead trackWidth={BOX_W - 14} progress={playheadP} style={{top: BOX_H - 26}} />}
        </div>
      )}

      {postOpacity > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: BOX_L + 60,
            top: BOX_T + 26,
            opacity: postOpacity,
            filter: postBlur ? `blur(${postBlur}px)` : undefined,
            transform: `translateY(${postY}px)`,
            ...wordStyle,
          }}
        >
          POST
        </div>
      )}

      {growOpacity > 0.002 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 8,
            opacity: growOpacity,
            filter: growBlur ? `blur(${growBlur}px)` : undefined,
            transform: `translateY(${growY}px)`,
            ...wordStyle,
            fontSize: fontSize * 0.62,
            color: BRAND.red,
            letterSpacing: 2,
          }}
        >
          GROW
        </div>
      )}
    </div>
  );
};
