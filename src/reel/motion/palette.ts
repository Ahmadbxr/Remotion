import {interpolateColors} from 'remotion';

// ---------------------------------------------------------------------------
// SURFACES AND THE TYPE THAT SITS ON THEM.
//
// The Reel changes background three times, and every one of those changes is
// performed by a moving object rather than a crossfade. What this file
// guarantees is the other half of that: whenever the surface changes, the
// contrast state changes WITH it, from the same progress value. There is no
// path through the timeline where the background has moved and the
// typography has not, which is how grey-on-dark and one-frame flashes
// happen.
// ---------------------------------------------------------------------------

export const SURFACE = {
  paper: '#F5F3EF',
  red: '#F20505',
  /** Very dark navy, not black — black flattens the red and reads cheap. */
  navy: '#0E1626',
} as const;

export type SurfaceName = keyof typeof SURFACE;

export type Tone = {
  ink: string;
  muted: string;
  accent: string;
  border: string;
  surface: string;
};

export const TONE: Record<SurfaceName, Tone> = {
  paper: {
    ink: '#111111',
    muted: '#6E6A63',
    accent: '#F20505',
    border: 'rgba(17,17,17,0.12)',
    surface: '#ECE9E2',
  },
  red: {
    ink: '#FFFFFF',
    muted: 'rgba(255,255,255,0.78)',
    accent: '#FFFFFF',
    border: 'rgba(255,255,255,0.30)',
    surface: 'rgba(255,255,255,0.10)',
  },
  navy: {
    ink: '#F5F3EF',
    muted: 'rgba(245,243,239,0.66)',
    // Brand red at #F20505 on navy sits at about 3:1 — legible as a shape,
    // marginal as text. Lifted for the dark chapter so red type and rules
    // hold up, while staying unmistakably the same red.
    accent: '#FF4433',
    border: 'rgba(245,243,239,0.18)',
    surface: 'rgba(245,243,239,0.06)',
  },
};

/** Blend two tones. `t` is the same progress that drives the surface itself,
 *  so type and background can never disagree by even one frame. */
export const blendTone = (from: Tone, to: Tone, t: number): Tone => {
  if (t <= 0) return from;
  if (t >= 1) return to;
  const c = (a: string, b: string) => interpolateColors(t, [0, 1], [a, b]);
  return {
    ink: c(from.ink, to.ink),
    muted: c(from.muted, to.muted),
    accent: c(from.accent, to.accent),
    border: c(from.border, to.border),
    surface: c(from.surface, to.surface),
  };
};
