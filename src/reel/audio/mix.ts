// ---------------------------------------------------------------------------
// THE MIX.
//
// One place to balance the whole Reel. Every cue declares a bus and a gain
// relative to that bus, so a section can be lifted or dropped without
// touching a single cue — and so the hierarchy the sound design depends on
// is a table you can read rather than thirty numbers scattered through a
// component tree.
//
// The hierarchy, quietest to loudest, is the point:
//
//   TEXTURE   beds that hold the piece together between events
//   UI        micro interactions — must never compete with a title
//   WHOOSH    movement
//   TONAL     brand and resolution moments
//   SUB       felt more than heard
//   IMPACT    the few moments that are allowed to hit
// ---------------------------------------------------------------------------

export const MIX = {
  /** Final trim on everything. Headroom lives here. */
  MASTER: 0.86,
  TEXTURE: 0.55,
  UI: 0.7,
  WHOOSH: 0.95,
  TONAL: 0.8,
  SUB: 0.72,
  IMPACT: 1,
} as const;

export type Bus = Exclude<keyof typeof MIX, 'MASTER'>;

export const busGain = (bus: Bus) => MIX[bus] * MIX.MASTER;
