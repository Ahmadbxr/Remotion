import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT} from '../theme';
import {progress, withOvershoot, motionBlur, IMPACT, SNAPPY_TEXT} from '../springs';
import {AnimatedIcon, ServiceIconKind} from './Icons';

export type ServiceDef = {label: string; kind: ServiceIconKind};

type Props = {
  frame: number;
  fps: number;
  start: number;
  services: ServiceDef[];
  slotFrames?: number;
};

/**
 * ONE continuous vertical relay — never four static slides. Every service's
 * enter/exit is a pure function of the absolute frame (nothing conditionally
 * mounts), so the next item is always already rising into frame while the
 * current one is still finishing its exit: a genuine overlap, not a cut.
 */
export const ServiceScroller: React.FC<Props> = ({frame, fps, start, services, slotFrames = 27}) => {
  return (
    <div style={{position: 'relative', width: '100%', height: 420}}>
      {services.map((service, i) => {
        const center = start + i * slotFrames + slotFrames * 0.55;
        const enterStart = center - 15;
        const enterDur = 15;
        const exitStart = center + 6;
        const exitDur = 13;

        const enterP = progress(frame, enterStart, enterStart + enterDur, fps, IMPACT);
        const enterPPrev = progress(frame - 1, enterStart, enterStart + enterDur, fps, IMPACT);
        const exitP = progress(frame, exitStart, exitStart + exitDur, fps, SNAPPY_TEXT);
        const exitPPrev = progress(frame - 1, exitStart, exitStart + exitDur, fps, SNAPPY_TEXT);

        const yAt = (e: number, x: number) => withOvershoot(e, 130, 0, 0.08) - x * 150;
        const y = yAt(enterP, exitP);
        const yPrev = yAt(enterPPrev, exitPPrev);
        const velocity = Math.abs(y - yPrev);
        const blur = motionBlur(velocity, 26, 20);

        const scale = withOvershoot(enterP, 0.86, 1, 0.05) * interpolate(exitP, [0, 1], [1, 0.94]);
        const opacity = interpolate(enterP, [0, 1], [0, 1]) * interpolate(exitP, [0, 1], [1, 0]);
        if (opacity <= 0.001) return null;

        // Icon build progress: keeps assembling itself through the enter
        // window and stays fully built until this instance starts exiting.
        const iconP = progress(frame, enterStart, enterStart + enterDur + 6, fps, IMPACT);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 28,
              opacity,
              filter: blur ? `blur(${blur}px)` : undefined,
              transform: `translateY(${y}px) scale(${scale})`,
            }}
          >
            <AnimatedIcon kind={service.kind} progress={Math.min(Math.max(iconP, 0), 1)} />
            <div
              style={{
                fontFamily: FONT,
                fontWeight: 800,
                fontSize: 76,
                letterSpacing: -2,
                color: BRAND.ink,
                textAlign: 'center',
              }}
            >
              {service.label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
