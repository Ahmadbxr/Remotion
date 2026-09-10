// ---------------------------------------------------------------------------
// THE DEPTH SYSTEM.
//
// Six named planes and nothing else. No component invents its own Z value,
// because the thing that makes 2.5D read as design rather than as a plugin
// is CONSISTENCY: the same distance always means the same thing.
//
//   BACKGROUND    far behind          things the eye should not chase
//   SECONDARY     slightly behind     supporting UI, the row you are not reading
//   BASE            neutral           the reading plane
//   ACTIVE        slightly forward    the element being read right now
//   IMPACT        further forward     the element that just took a hit
//   PASS          crosses the viewer  a transition surface, briefly
//
// Perspective is applied PER ELEMENT (`perspective(...)` inside the
// element's own transform) rather than once on an ancestor. Two reasons,
// both practical:
//
//   1. An ancestor `perspective` projects every descendant from one shared
//      vanishing point, so elements far from the centre get pushed sideways
//      as soon as depth exists at all — it would have quietly moved a
//      layout that is already verified against the safe zones.
//   2. Per element, translateZ(0) is exactly the identity transform. Adding
//      depth to one element cannot disturb anything else.
//
// The trade is that there is no shared vanishing point, so cross-element
// parallax has to be asked for explicitly (`parallaxFactor`) instead of
// falling out of the projection. That is the right trade here: the brief
// wants depth that is felt and not noticed, not a 3D scene.
// ---------------------------------------------------------------------------

export const PERSPECTIVE = 1400;

export const PLANE = {
  background: -260,
  secondary: -110,
  base: 0,
  active: 70,
  impact: 165,
  pass: 640,
} as const;

export type PlaneName = keyof typeof PLANE;

/** Apparent size of a plane. base = 1. */
export const depthScale = (z: number) => PERSPECTIVE / (PERSPECTIVE - z);

/** The transform for a depth, ready to be composed with translate/rotate.
 *  Project-wide order is translate -> rotate -> scale/perspective, so this
 *  always goes LAST in a transform string. */
export const depth = (z: number) => `perspective(${PERSPECTIVE}px) translateZ(${z}px)`;

/**
 * How much a plane should travel relative to the base plane for a shared
 * movement — the parallax rule, expressed once. Nearer things move more.
 * Deliberately damped to half the projected difference: geometric parallax
 * at these distances is already more than the brief wants to see.
 */
export const parallaxFactor = (z: number, strength = 0.5) => 1 + (depthScale(z) - 1) * strength;

/** Depth-of-field: an element far from the reading plane is softly out of
 *  focus. Small numbers on purpose — this is hierarchy, not a lens effect,
 *  and it is exactly 0 at the base plane so nothing at rest is ever soft. */
export const depthBlur = (z: number, max = 2.2) => Math.min(Math.abs(z) / 260, 1) * max;
