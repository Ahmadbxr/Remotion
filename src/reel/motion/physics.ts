// ---------------------------------------------------------------------------
// ONE impact-reaction system for the whole Reel.
//
// There is no Math.random(), no per-frame offset table, no frame-modulo and
// no alternating fixed offsets anywhere in this file or downstream of it —
// a shake built that way is a new random position every frame, which is
// jitter, not motion. Everything below is a continuous, decaying,
// directional, deterministic function of frame.
// ---------------------------------------------------------------------------

/**
 * The impulse response of a damped oscillator, windowed so it lands exactly
 * on rest:
 *
 *   value(u) = amplitude x decay(u) x sin(PI x cycles x u)
 *
 * The two boundary conditions are the entire point:
 *
 *   u <= 0   value 0
 *   u  = 0+  value 0, velocity MAXIMUM      <- this is what an impact IS
 *   u  = 1   value EXACTLY 0, velocity EXACTLY 0
 *   u >= 1   value 0
 *
 * The rest condition holds structurally, not approximately: `cycles` is a
 * whole number so the sine lands on a zero crossing, and the decay window
 * reaches exactly 0 there too — so both the term and its derivative vanish.
 * Nothing has to be faded out afterwards and no residual jitter survives.
 *
 * `amplitude` is the true peak displacement of the FIRST lobe (the envelope
 * is normalised at that lobe's peak), and its SIGN is the direction the
 * object is first pushed — i.e. the direction of the incoming force. Later
 * lobes are the recoil, each a fraction of the one before.
 */
const NORMALISER = new Map<string, number>();

/** Peak of the (unnormalised) first lobe. The sine peaks at u = 1/(2c) but
 *  the decay envelope is already falling there, so the product's real
 *  maximum sits slightly earlier — scanning for it is what makes
 *  `amplitude` mean the true peak displacement rather than roughly it. */
const lobePeak = (c: number, decay: number, attack: number) => {
  const key = `${c}|${decay}|${attack}`;
  const hit = NORMALISER.get(key);
  if (hit !== undefined) return hit;
  let max = 0;
  const steps = 512;
  for (let i = 1; i < steps; i++) {
    const u = i / (steps * c); // first lobe only
    max = Math.max(max, Math.abs(shape(u, c, decay, attack)));
  }
  NORMALISER.set(key, max);
  return max;
};

const smoothstep = (t: number) => t * t * (3 - 2 * t);

const shape = (u: number, c: number, decay: number, attack: number) => {
  // A short attack window means the reaction is PUSHED rather than
  // teleported: at u = 0 both the value and its rate of change are 0. It is
  // ~1 frame long, so it removes the single-frame jump without softening
  // the hit, and it is 1 by the time the first lobe peaks.
  const gate = u < attack ? smoothstep(u / attack) : 1;
  return gate * Math.pow(1 - u, decay) * Math.sin(Math.PI * c * u);
};

export const impactOffset = (
  frame: number,
  start: number,
  duration: number,
  amplitude: number,
  cycles = 2,
  decay = 2.4,
) => {
  if (amplitude === 0 || duration <= 0) return 0;
  const u = (frame - start) / duration;
  if (u <= 0 || u >= 1) return 0;
  const c = Math.max(1, Math.round(cycles));
  const attack = Math.min(0.16, 1.4 / duration);
  return (amplitude * shape(u, c, decay, attack)) / lobePeak(c, decay, attack);
};

/** One reaction to one force. Amplitudes are peak displacement in px
 *  (x/y), degrees (rotate) and fraction-of-1 (scale). Give the axes that
 *  the force actually acted on — a sideways swipe reacts sideways. */
export type Impact = {
  start: number;
  duration: number;
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
  /** Lobes in the reaction. 2 = one hit plus a small recoil (default, and
   *  right for almost everything). 3 = a heavier ring, for the single
   *  strongest moment only. */
  cycles?: number;
};

export type ImpactTransform = {x: number; y: number; rotate: number; scale: number};

export const NO_IMPACT: ImpactTransform = {x: 0, y: 0, rotate: 0, scale: 1};

/**
 * Sums a set of impacts into one transform. Axes ring at slightly
 * different rates (rotation and X carry one extra lobe over Y) so the
 * reaction is not a single rigid line of travel — but because every rate
 * is a whole number of half-cycles, all of them still land on exactly 0
 * together.
 */
export const impactTransform = (frame: number, impacts: Impact[]): ImpactTransform => {
  let x = 0;
  let y = 0;
  let rotate = 0;
  let scale = 0;
  for (const im of impacts) {
    const c = im.cycles ?? 2;
    if (im.x) x += impactOffset(frame, im.start, im.duration, im.x, c + 1);
    if (im.y) y += impactOffset(frame, im.start, im.duration, im.y, c);
    if (im.rotate) rotate += impactOffset(frame, im.start, im.duration, im.rotate, c + 1);
    if (im.scale) scale += impactOffset(frame, im.start, im.duration, im.scale, c);
  }
  return {x, y, rotate, scale: 1 + scale};
};

/** The single transform string every animated element in the Reel builds.
 *  Order is fixed project-wide — translate, then rotate, then scale — so
 *  that a rotation never bends a translation into an arc it was not
 *  authored to take, and a scale never multiplies a travel distance. */
export const transformOf = ({x, y, rotate, scale}: ImpactTransform) =>
  `translate(${x}px, ${y}px) rotate(${rotate}deg) scale(${scale})`;
