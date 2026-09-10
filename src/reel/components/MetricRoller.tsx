import React from 'react';
import {BRAND, FONT} from '../theme';
import {easeProgress, easeCamera} from '../motion/easings';
import {smoothKeys} from '../motion/curves';
import {springProgress, IMPACT} from '../motion/springs';
import {motionBlur, velocityStretch} from '../motion/velocity';

type Props = {
  frame: number;
  fps: number;
  start: number;
  duration?: number;
  values: string[];
  slotHeight?: number;
  fontSize: number;
  style?: React.CSSProperties;
};

/**
 * A true vertical slot-machine roll: ONE continuous surface of stacked
 * numbers moving upward through a fixed window — incoming values rise in
 * from below while the outgoing ones keep travelling up and out, never a
 * value being replaced in place.
 *
 * Blur is vertical and velocity-derived: the digits smear along the axis
 * they're actually moving on (blur + a matching scaleY stretch), and both
 * resolve to exactly 0 / 1 as the roll decelerates, so the final number
 * lands pin-sharp.
 *
 * THE RECTANGLE BUG. The window used to be exactly one slot tall, barely
 * taller than the glyphs themselves, with a hard `overflow: hidden` edge.
 * A 30px blur on the column therefore had nowhere to fade: the haze ran
 * straight into the clip edge and stopped dead on a horizontal line. The
 * launch that follows then scales that box 3.8x and blurs it another 38px,
 * which smeared those two hard lines into a grey rectangular field sitting
 * behind the number — the "shadow constrained inside a container".
 *
 * The fix is not a z-index or a filter-bounds trick, because nothing was
 * ever clipped by accident: the window has real headroom now (the glyphs
 * occupy the middle ~60% of it, so blur haze has room to fall off inside
 * the window), and the remaining edge is a soft mask gradient rather than
 * a cut, so there is no hard boundary left to smear into a rectangle.
 */
export const MetricRoller: React.FC<Props> = ({
  frame,
  fps,
  start,
  duration = 22,
  values,
  slotHeight,
  fontSize,
  style,
}) => {
  if (frame < start - 1) return null;

  // Row pitch carries real headroom around the glyphs — this is what gives
  // the velocity blur somewhere to fall off before it reaches an edge.
  const pitch = slotHeight ?? Math.round(fontSize * 1.34);

  // easeCamera, not easeOutCubic. easeOutCubic leaves the gate at MAXIMUM
  // velocity: the column went from dead still to 85px/frame between two
  // frames, so the velocity-derived blur jumped 0 -> full in one frame and
  // the roll appeared to stutter — sharp, sharp, smear. A slot machine
  // spins UP. This curve accelerates from rest, runs fast through the
  // middle (where the intermediate values should be unreadable), and
  // decelerates into the landing, so blur rises and falls with it instead
  // of popping at either end.
  const rollAt = (f: number) => easeProgress(f, start, start + duration, easeCamera) * (values.length - 1);
  const roll = rollAt(frame);
  const rollPrev = rollAt(frame - 1);
  const velocity = (roll - rollPrev) * pitch;
  const blur = motionBlur(velocity, pitch * 0.42, 18);
  const stretchY = velocityStretch(velocity, pitch * 0.42, 0.2);

  // The landing hit. Two things matter here beyond the shape.
  //
  // First, it is a DEVIATION from rest, so it is exactly 1 before it
  // begins — the previous version sat at 0.9 from the moment the component
  // mounted and only grew once the roll ended, meaning the whole roll
  // played 10% undersized and then changed size for no visible cause.
  //
  // Second, the profile is restrained: a small compression as the roll
  // decelerates (anticipation), one overshoot, one small correction, rest.
  // Smooth-keyed, so the apex is a turn rather than a corner.
  const settleP = springProgress(frame, start + duration - 5, start + duration + 13, fps, IMPACT);
  const settleScale = smoothKeys(settleP, [0, 0.2, 0.5, 0.78, 1], [1, 0.968, 1.06, 0.99, 1]);

  // Soft edges instead of a cut. The glyphs sit in the middle ~60% of the
  // window, so the fade never touches the number itself — it only removes
  // the hard line the blur used to terminate on.
  const softEdge =
    'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 15%, rgba(0,0,0,1) 85%, rgba(0,0,0,0) 100%)';

  return (
    <div
      style={{
        // The settle scale lives on an OUTER element with no clipping of
        // its own, so scaling the number never moves it relative to a mask.
        transform: `scale(${settleScale})`,
        transformOrigin: '0% 50%',
        ...style,
      }}
    >
      <div
        style={{
          width: fontSize * 4.2,
          height: pitch,
          overflow: 'hidden',
          maskImage: softEdge,
          WebkitMaskImage: softEdge,
        }}
      >
      <div
        style={{
          transform: `translateY(${-roll * pitch}px) scaleY(${stretchY})`,
          transformOrigin: '50% 50%',
          filter: blur ? `blur(${blur}px)` : undefined,
        }}
      >
        {values.map((v, i) => (
          <div
            key={i}
            style={{
              height: pitch,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-start',
              fontFamily: FONT,
              fontWeight: 800,
              fontSize,
              letterSpacing: -3,
              color: BRAND.ink,
              fontVariantNumeric: 'tabular-nums',
              whiteSpace: 'nowrap',
            }}
          >
            {v}
          </div>
        ))}
      </div>
      </div>
    </div>
  );
};
