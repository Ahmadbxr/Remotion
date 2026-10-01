// ---------------------------------------------------------------------------
// Pose interpolation with CONTINUOUS VELOCITY.
//
// `interpolate(p, [0, 0.6, 0.82, 1], [0, 1.06, 0.985, 1])` is piecewise
// LINEAR: the property's velocity changes instantly at every keyframe. At
// 30fps that reads as exactly the defect the brief names — "target ->
// overshoot -> suddenly target". Every pose sequence in the Reel goes
// through `smoothKeys` instead.
// ---------------------------------------------------------------------------

type KeyOpts = {
  /** Rate of change at the first pose. Defaults to the first secant, i.e.
   *  the property is already moving when the sequence starts (correct when
   *  the driver `p` is itself eased). Pass 0 for a true standing start. */
  startTangent?: number;
  /** Rate of change at the last pose. Defaults to 0 — a property that
   *  finishes a move should ARRIVE, not still be travelling. */
  endTangent?: number;
};

/**
 * Monotone cubic Hermite (Fritsch-Carlson) through a pose sequence.
 *
 * Two properties matter, and both are why this is not a generic spline:
 *
 *  1. C1 continuous — no velocity step at any pose, so no visible kink.
 *  2. It passes through the authored poses and invents NOTHING between
 *     them. A plain Catmull-Rom asked for 0 -> 1.06 -> 0.985 -> 1 actually
 *     peaks near 1.09; the monotone tangent limiter pins the slope to 0 at
 *     every local extremum, so an authored 6% overshoot is 6% on screen.
 *
 * The last tangent is 0 by default, which is the whole point: the property
 * decelerates into its rest pose instead of stopping dead at it.
 */
export const smoothKeys = (p: number, keys: number[], values: number[], opts: KeyOpts = {}): number => {
  const n = keys.length;
  if (n === 0) return 0;
  if (n === 1) return values[0];
  if (p <= keys[0]) return values[0];
  if (p >= keys[n - 1]) return values[n - 1];

  // Secants between consecutive poses.
  const secant: number[] = [];
  for (let i = 0; i < n - 1; i++) {
    const h = keys[i + 1] - keys[i];
    secant.push(h === 0 ? 0 : (values[i + 1] - values[i]) / h);
  }

  // Tangents: average of neighbouring secants, but EXACTLY 0 wherever the
  // secants change sign (a local max/min — the apex of an overshoot, the
  // bottom of a counter-motion). That is what keeps the curve inside its
  // authored poses.
  const m: number[] = new Array(n);
  m[0] = opts.startTangent ?? secant[0];
  m[n - 1] = opts.endTangent ?? 0;
  for (let i = 1; i < n - 1; i++) {
    m[i] = secant[i - 1] * secant[i] <= 0 ? 0 : (secant[i - 1] + secant[i]) / 2;
  }

  // Fritsch-Carlson limiter — keeps each segment monotone between its own
  // two poses, so no segment can bulge past the pose it is heading for.
  for (let i = 0; i < n - 1; i++) {
    if (secant[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / secant[i];
    const b = m[i + 1] / secant[i];
    const s = a * a + b * b;
    if (s > 9) {
      const tau = 3 / Math.sqrt(s);
      m[i] = tau * a * secant[i];
      m[i + 1] = tau * b * secant[i];
    }
  }

  let i = 0;
  while (i < n - 2 && p > keys[i + 1]) i++;
  const h = keys[i + 1] - keys[i];
  const t = (p - keys[i]) / h;
  const t2 = t * t;
  const t3 = t2 * t;

  return (
    (2 * t3 - 3 * t2 + 1) * values[i] +
    (t3 - 2 * t2 + t) * m[i] * h +
    (-2 * t3 + 3 * t2) * values[i + 1] +
    (t3 - t2) * m[i + 1] * h
  );
};
