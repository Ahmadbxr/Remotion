import React from 'react';
import {Audio, Sequence, interpolate, staticFile} from 'remotion';
import {Bus, busGain} from './mix';

// ---------------------------------------------------------------------------
// One renderer for every sound in the Reel.
//
// A cue is data, not markup: when it lands, which bus it belongs to, how loud
// relative to that bus, how it is shaped, and — the field that actually keeps
// the design honest — WHY it is there. Item 50 of the brief says every sound
// must answer that question, so the answer is a required field.
// ---------------------------------------------------------------------------

export type Cue = {
  /** Composition frame the sound should LAND on. */
  at: number;
  bus: Bus;
  file: string;
  /** Level relative to the bus, 0-1. */
  gain: number;
  /** Frames of ramp at each end. Every cue gets a fade-out by default so no
   *  sound can end on a hard cut, which is where clicks come from. */
  fadeIn?: number;
  fadeOut?: number;
  /** Frames to play. The tail is cut here, so nothing bleeds into a beat it
   *  does not belong to. */
  hold?: number;
  /** Skip this much of the source (frames) before it starts sounding. */
  trimBefore?: number;
  /** Pitch only, no speed change. Used sparingly, and never far from 1. */
  pitch?: number;
  /** Play faster/slower. Shifts pitch with it — for air, that is desirable. */
  rate?: number;
  /** Shape the level as a swell that peaks at this fraction of `hold`,
   *  instead of a plain fade pair. This is how a sound gets tied to a
   *  camera move: the peak sits on the move's peak velocity. */
  peakAt?: number;
  /** Why this sound exists. Not decoration — the design rule. */
  why: string;
};

const envelope = (f: number, c: Cue, holdFrames: number) => {
  if (c.peakAt !== undefined) {
    const peak = holdFrames * c.peakAt;
    return interpolate(f, [0, peak, holdFrames], [0, 1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  }
  const fin = c.fadeIn ?? 0;
  const fout = c.fadeOut ?? 3;
  const up = fin > 0 ? interpolate(f, [0, fin], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 1;
  const down = interpolate(f, [holdFrames - fout, holdFrames], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return up * down;
};

/**
 * LATENCY COMPENSATION.
 *
 * A cue's `at` is the frame the sound should LAND on, and landing means the
 * frame the ear hears — the peak, not the first sample. These sounds peak
 * one to two frames after their file starts, so dropping them on the visual
 * frame puts every transient 30-70ms late, which at 30fps is exactly the
 * "SFX arriving after visual impacts" the QC list warns about.
 *
 * Measured from the built files, not guessed. Only TRANSIENTS are listed:
 * the swells and beds (air-pull, sub-swell, riser, air-bed) peak 20-36
 * frames in by design and are placed by their start, so shifting those
 * would break the shapes they were authored with.
 */
const PEAK_OFFSET: Record<string, number> = {
  'tick-air.wav': 2,
  'tick-hi.wav': 1,
  'tick-mid.wav': 2,
  'body.wav': 1,
  'sub-drop.wav': 2,
  'tone-resolve.wav': 2,
};

export const AudioCue: React.FC<{cue: Cue; totalFrames: number}> = ({cue, totalFrames}) => {
  const from = Math.round(cue.at) - (PEAK_OFFSET[cue.file] ?? 0);
  if (from >= totalFrames) return null;
  const holdFrames = Math.min(cue.hold ?? 240, totalFrames - Math.max(from, 0));
  if (holdFrames <= 0) return null;
  const level = cue.gain * busGain(cue.bus);
  return (
    <Sequence from={Math.max(from, 0)} durationInFrames={holdFrames} layout="none">
      <Audio
        src={staticFile(`sfx/${cue.file}`)}
        volume={(f) => envelope(f, cue, holdFrames) * level}
        trimBefore={cue.trimBefore}
        toneFrequency={cue.pitch}
        playbackRate={cue.rate}
      />
    </Sequence>
  );
};

/** The whole soundtrack, rendered from the cue sheet. */
export const SoundDesign: React.FC<{cues: Cue[]; totalFrames: number}> = ({cues, totalFrames}) => (
  <>
    {cues.map((c, i) => (
      <AudioCue key={`${c.file}-${c.at}-${i}`} cue={c} totalFrames={totalFrames} />
    ))}
  </>
);
