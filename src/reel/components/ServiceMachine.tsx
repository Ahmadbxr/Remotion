import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT, MONO} from '../theme';
import {easeProgress, easeOutExpo, easeOutQuint, easeInOutCubic} from '../motion/easings';
import {PLANE, depth} from '../motion/depth';
import {motionBlur, velocityStretch} from '../motion/velocity';
import {AnimatedIcon, ServiceIconKind} from './Icons';

export type ServiceDef = {label: string; kind: ServiceIconKind};

export type ScrollSpec = {start: number; slot: number; hold: number; moveDur: number; count: number};

/**
 * The surface's scroll position, in ROW units, as a pure function of frame.
 * Exported because the red rail lives OUTSIDE this component now — it has
 * to become the process line later, so it cannot be owned by the thing it
 * outlives — and the rail's marker still has to agree with what is on
 * screen frame for frame. One definition, two readers.
 */
export const serviceScrollAt = (f: number, {start, slot, hold, moveDur, count}: ScrollSpec) => {
  const parked = -1.5 - 0.06;
  if (f < start) {
    return interpolate(easeProgress(f, start - moveDur, start, easeOutExpo), [0, 1], [parked, 0]);
  }
  const local = f - start;
  const idx = Math.floor(local / slot);
  const within = local - idx * slot;
  return Math.min(idx + easeProgress(within, hold, slot, easeInOutCubic), count);
};

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
  /** Frame at which the travelling marker hands over — the rail itself is
   *  owned by the orchestrator (it has to survive this beat and become the
   *  process line), so only the marker lives here. */
  markerExit?: number;
  markerEnter?: number;
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
  markerEnter,
  markerExit,
}) => {
  const n = services.length;
  const viewportH = Math.round(rowHeight * 1.5);

  const spec = {start, slot, hold, moveDur, count: n};
  const scroll = serviceScrollAt(frame, spec);
  const scrollPrev = serviceScrollAt(frame - 1, spec);
  const velocity = (scroll - scrollPrev) * rowHeight;
  const blur = motionBlur(velocity, rowHeight * 0.4, 22);
  const stretchY = velocityStretch(velocity, rowHeight * 0.4, 0.1);

  // The marker tracks the surface itself, so it can never disagree with
  // what is on screen. The RAIL it runs on is rendered by the orchestrator:
  // that line has to outlive this beat and become the process connector,
  // so it cannot belong to the component it outlives.
  const railTravel = Math.min(Math.max(scroll / Math.max(n - 1, 1), 0), 1);
  const railH = viewportH;
  const markerH = 46;
  const markerIn = markerEnter === undefined ? 1 : easeProgress(frame, markerEnter, markerEnter + 12, easeOutQuint);
  const markerOut = markerExit === undefined ? 0 : easeProgress(frame, markerExit, markerExit + 10, easeInOutCubic);

  return (
    <div style={{position: 'relative', width, height: viewportH}}>
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: 7,
          height: markerH,
          borderRadius: 3.5,
          background: BRAND.red,
          opacity: markerIn * (1 - markerOut),
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

            // Depth, on the shared plane system rather than an ad-hoc
            // scale: the row being read sits on ACTIVE, its neighbours fall
            // back toward SECONDARY, and rows already read (rel < 0) go a
            // little further back still as they leave. Same vertical
            // surface, now with a front and a back.
            const rel = i - scroll;
            const d = Math.abs(rel);
            const rowOpacity = interpolate(d, [0, 1], [1, 0.3], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
            const rowZ =
              interpolate(d, [0, 1], [PLANE.active, PLANE.secondary], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) +
              (rel < 0 ? -20 : 0);

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
                  // Origin at the left edge: the row grows out of the rail
                  // it is measured against, not out of its own middle.
                  transform: `translateY(${offset}px) ${depth(rowZ)}`,
                  transformOrigin: '0% 50%',
                }}
              >
                <div style={{position: 'absolute', left: 0, top: 30, fontFamily: MONO, fontSize: 24, fontWeight: 700, letterSpacing: 2.5, color: BRAND.red}}>
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
