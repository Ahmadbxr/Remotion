// ---------------------------------------------------------------------------
// Motion tokens — every duration/weight decision in the Reel reaches for
// one of these categories, converted from the brief's own ms ranges to
// frames @30fps. Nothing scattered as an arbitrary number in a component.
// ---------------------------------------------------------------------------
export const DUR = {
  micro: 4, // 100-180ms — ticks, tiny badges
  ui: 7, // 180-280ms — icon transitions, small UI
  text: 9, // 220-350ms — a single kinetic word/phrase settling
  card: 11, // 280-420ms — cards, panels
  transition: 14, // 350-550ms — scene-to-scene handoffs
  hero: 20, // 500-800ms — the big expressive moments
} as const;

// Designed, non-uniform stagger rhythms — never a flat 0/3/6/9/12 ladder.
// Pick the one whose "feel" matches the moment; the lead element gets 0.
export const STAGGER = {
  tight: [0, 2, 4, 9, 11],
  lead: [0, 4, 5, 10],
  wide: [0, 5, 12, 16],
} as const;
