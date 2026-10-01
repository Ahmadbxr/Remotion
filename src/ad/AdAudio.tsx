// Music bed + motion-locked sound design + optional voice-over.
// SFX transients are placed 1–2 frames BEFORE the visual hit they belong to
// (early reads as synced, late reads as broken).
import React from 'react';
import {Audio, Sequence, interpolate, staticFile, useVideoConfig} from 'remotion';
import {AUDIO, CutId, HookId, VO} from './config';

type Cue = {at: number; file: string; vol: number; rate?: number};

const cuesFor = (cut: CutId, c: Record<string, number>): Cue[] => {
  const common: Cue[] = [
    {at: c.openAt - 8, file: 'sfx-open', vol: 0.55}, // swell peaks as the card opens
    {at: c.fullAt - 2, file: 'sfx-land', vol: 0.45},
  ];
  if (cut === 'short') {
    return [
      ...common,
      {at: 91, file: 'sfx-move', vol: 0.32},
      {at: c.panelLand - 2, file: 'sfx-place', vol: 0.4},
      {at: c.logoReveal, file: 'sfx-reveal', vol: 0.42},
      {at: 175, file: 'sfx-move', vol: 0.3},
      {at: c.proofLand + 24, file: 'sfx-figure', vol: 0.35},
      {at: c.ctaText - 24, file: 'sfx-riser', vol: 0.22},
      {at: c.ctaText + 4, file: 'sfx-impact', vol: 0.38},
      {at: c.ctaLand - 1, file: 'sfx-cta', vol: 0.4},
    ];
  }
  return [
    ...common,
    {at: 91, file: 'sfx-move', vol: 0.32},
    {at: 103, file: 'sfx-pop', vol: 0.3},
    {at: 149, file: 'sfx-move', vol: 0.28},
    {at: c.panelLand - 2, file: 'sfx-place', vol: 0.4},
    {at: c.logoReveal, file: 'sfx-reveal', vol: 0.42},
    {at: 271, file: 'sfx-turn', vol: 0.3},
    {at: 297, file: 'sfx-tick', vol: 0.26, rate: 1},
    {at: 335, file: 'sfx-tick', vol: 0.24, rate: 1.12},
    {at: 371, file: 'sfx-tick', vol: 0.24, rate: 1.26},
    {at: 407, file: 'sfx-tick', vol: 0.24, rate: 1.335},
    {at: 441, file: 'sfx-team', vol: 0.34},
    {at: 475, file: 'sfx-move', vol: 0.28},
    {at: c.proofLand + 24, file: 'sfx-figure', vol: 0.35},
    {at: 603, file: 'sfx-move', vol: 0.26},
    {at: 708, file: 'sfx-riser', vol: 0.22},
    {at: 738, file: 'sfx-impact', vol: 0.38},
    {at: c.ctaLand - 1, file: 'sfx-cta', vol: 0.4},
  ];
};

export const AdAudio: React.FC<{cut: CutId; hook: HookId; cues: Record<string, number>}> = ({cut, hook, cues}) => {
  const {durationInFrames, fps} = useVideoConfig();
  const vo = AUDIO.voiceover;
  const windows = vo.enabled ? VO[cut](hook).map((l) => [l.from * fps, l.to * fps] as const) : [];
  const musicVol = (f: number) => {
    const fadeOut = interpolate(f, [durationInFrames - 24, durationInFrames - 1], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    let duck = 1;
    for (const [a, b] of windows) {
      const k = interpolate(f, [a - 6, a + 2, b - 2, b + 8], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      duck = Math.min(duck, 1 - (1 - vo.duckTo) * k);
    }
    return AUDIO.music.volume * fadeOut * duck;
  };
  return (
    <>
      <Audio src={staticFile(AUDIO.music[cut])} volume={musicVol} />
      {cuesFor(cut, cues).map((q, i) => (
        <Sequence key={i} from={Math.max(0, q.at)} durationInFrames={Math.round(2.4 * fps)} layout="none">
          <Audio src={staticFile(`ad/audio/${q.file}.wav`)} volume={q.vol * AUDIO.sfxVolume} playbackRate={q.rate ?? 1} />
        </Sequence>
      ))}
      {vo.enabled ? <Audio src={staticFile(vo.file(cut, hook))} volume={vo.volume} /> : null}
    </>
  );
};
