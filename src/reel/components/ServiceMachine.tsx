import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT, MONO} from '../theme';
import {easeProgress, easeOutExpo, easeOutQuint, easeInOutCubic} from '../motion/easings';
import {motionBlur, velocityStretch} from '../motion/velocity';
import {AnimatedIcon, ServiceIconKind} from './Icons';

export type ServiceDef = {label: string; kind: ServiceIconKind};

type Props = {
  frame: number;
  /** Frame at which the FIRST row is at rest and dominant. */
  start: number;
  services: ServiceDef[];
  slot?: number; // frames per service = hold + move
  hold?: number; // frames at rest before the surface moves on
  moveDur?: number;
  rowHeight?: number;
  width: number;
  fontSize?: number;
  /** The rail draws itself downward from its top point — the previous beat's
   *  logo collapses into exactly that point, so the rail is visibly what the
   *  logo became rather than a new element appearing. */
  railGrowStart?: number;
};

/**
 * ONE physical surface moving through a viewport — not four headlines that
 * each enter and leave. A single scroll position (in ROW units) is the only
 * state: the surface rises in from below, advances exactly one row per slot
 * with real momentum (accelerate out of the hold, decelerate into the next
 * row), and finally carries straight on past the last row, which is what
 * hands off to the following beat.
 *
 * Nothing here ever resets: every row's screen position is
 * `i - scroll` at all times, so during each move the outgoing row is still
 * visibly travelling up and out while the incoming one is already rising in
 * below it. Blur/stretch come from the surface's own scroll velocity and
 * are shared by every row, because it is one object.
 *
 * The index number and icon live INSIDE each row, so they travel with it —
 * the only fixed elements are the rail and its marker, which is what proves
 * all four belong to one system.
 */
export const ServiceMachine: React.FC<Props> = ({
  frame,
  start,
  services,
  slot = 25,
  hold = 14,
  moveDur = 11,
  rowHeight = 250,
  width,
  fontSize = 132,
  railGrowStart,
}) => {
  const n = services.length;
  const viewportH = Math.round(rowHeight * 1.5);

  // Parked fully BELOW the viewport, not at a visible resting pose — an
  // eased progress still resolves to a valid position before its window
  // opens, so the park value itself has to be off-screen.
  const PARKED = -(viewportH / rowHeight) - 0.06;

  const scrollAt = (f: number) => {
    if (f < start) {
      // Entrance is part of the same continuous motion — the surface is
      // already moving when the first row arrives, never a fade-in.
      return interpolate(easeProgress(f, start - moveDur, start, easeOutExpo), [0, 1], [PARKED, 0]);
    }
    const local = f - start;
    const idx = Math.floor(local / slot);
    const within = local - idx * slot;
    const p = easeProgress(within, hold, slot, easeInOutCubic);
    return Math.min(idx + p, n);
  };

  const scroll = scrollAt(frame);
  const scrollPrev = scrollAt(frame - 1);
  const velocity = (scroll - scrollPrev) * rowHeight;
  const blur = motionBlur(velocity, rowHeight * 0.4, 22);
  const stretchY = velocityStretch(velocity, rowHeight * 0.4, 0.1);

  // Rail marker tracks the surface itself, so it can never disagree with
  // what is on screen.
  const railTravel = Math.min(Math.max(scroll / Math.max(n - 1, 1), 0), 1);
  const railFade = interpolate(scroll, [n - 0.8, n - 0.3], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const railH = viewportH;
  const markerH = 46;
  const railGrow = railGrowStart === undefined ? 1 : easeProgress(frame, railGrowStart, railGrowStart + 14, easeOutQuint);
  const markerIn = railGrowStart === undefined ? 1 : easeProgress(frame, railGrowStart + 8, railGrowStart + 16, easeOutQuint);

  return (
    <div style={{position: 'relative', width, height: viewportH}}>
      {/* Persistent rail — the fixed anchor the moving surface is measured
          against. Fades only once the surface has left. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: railH,
          width: 3,
          background: BRAND.border,
          opacity: railFade,
          transform: `scaleY(${railGrow})`,
          transformOrigin: '50% 0%',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 5,
          height: markerH,
          borderRadius: 3,
          background: BRAND.red,
          opacity: railFade * markerIn,
          transform: `translateY(${railTravel * (railH - markerH)}px)`,
        }}
      />

      <div style={{position: 'absolute', left: 46, top: 0, width: width - 46, height: viewportH, overflow: 'hidden'}}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            filter: blur ? `blur(${blur}px)` : undefined,
            transform: `scaleY(${stretchY})`,
            transformOrigin: '50% 50%',
          }}
        >
          {services.map((service, i) => {
            const offset = (i - scroll) * rowHeight;
            // Cheap cull — anything a full row outside the viewport can't
            // be seen through the mask anyway.
            if (offset < -rowHeight * 1.2 || offset > viewportH + rowHeight * 0.4) return null;

            // Depth: the row being read is full contrast and full size; its
            // neighbours sit slightly back. Foreground/background scale
            // instead of decoration.
            const d = Math.abs(i - scroll);
            const rowOpacity = interpolate(d, [0, 1], [1, 0.28], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const rowScale = interpolate(d, [0, 1], [1, 0.93], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

            // The icon builds itself as its row becomes dominant — driven by
            // absolute frame so it is monotonic and never un-draws.
            const dominantAt = start + i * slot;
            const iconP = easeProgress(frame, dominantAt - 10, dominantAt + 12, easeOutExpo);

            return (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  width: '100%',
                  height: rowHeight,
                  opacity: rowOpacity,
                  // The scroll offset MUST be a transform. `top` is a layout
                  // property: the browser resolves it during layout and
                  // rounds glyph positions to whole pixels, so a surface
                  // moving 250px per 11 frames advanced in visible integer
                  // steps rather than gliding. This was the single largest
                  // source of the "frame-by-frame" feel in the service
                  // scroll — the timing was already smooth, the rasteriser
                  // was quantising it.
                  transform: `translateY(${offset}px) scale(${rowScale})`,
                  transformOrigin: '0% 50%',
                }}
              >
                <div style={{position: 'absolute', left: 0, top: 30, fontFamily: MONO, fontSize: 19, fontWeight: 600, letterSpacing: 3, color: BRAND.red}}>
                  {`0${i + 1}/0${n}`}
                </div>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 62,
                    fontFamily: FONT,
                    fontWeight: 800,
                    fontSize,
                    letterSpacing: -3,
                    lineHeight: 1,
                    color: BRAND.ink,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {service.label}
                </div>
                <div style={{position: 'absolute', right: 10, top: 46, transform: 'scale(0.66)', transformOrigin: '100% 0%'}}>
                  <AnimatedIcon kind={service.kind} progress={iconP} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
