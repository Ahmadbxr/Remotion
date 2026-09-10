import React from 'react';
import {interpolate} from 'remotion';
import {BRAND, FONT, MONO} from '../theme';
import {easeProgress, easeOutExpo, easeInExpo} from '../motion/easings';
import {motionBlur, velocityStretch} from '../motion/velocity';
import {MaskReveal} from './MaskReveal';
import {AnimatedIcon, ServiceIconKind} from './Icons';

export type ServiceDef = {label: string; kind: ServiceIconKind};

type Props = {
  frame: number;
  start: number;
  services: ServiceDef[];
  slotFrames?: number;
  maskHeight?: number;
  maskWidth: number;
  fontSize: number;
};

/**
 * The editorial service machine: one huge, LEFT-aligned headline genuinely
 * CLIPPED by a fixed mask window as it scrolls through with real momentum
 * (accelerating exit, decelerating entrance — cinematic easing, not a
 * spring bounce), never four centered static slides. The icon sits
 * off-center to the right, offset 3 frames behind its headline (parent
 * leads, icon follows — a designed stagger, not simultaneous).
 */
export const ServiceMachine: React.FC<Props> = ({frame, start, services, slotFrames = 30, maskHeight = 180, maskWidth, fontSize}) => {
  return (
    <div style={{position: 'relative', width: maskWidth}}>
      <MaskReveal width={maskWidth} height={maskHeight} style={{overflow: 'hidden'}}>
        {services.map((service, i) => {
          const center = start + i * slotFrames + slotFrames * 0.42;
          const enterStart = center - 13;
          const enterDur = 13;
          const exitStart = center + 8;
          const exitDur = 12;

          const enterP = easeProgress(frame, enterStart, enterStart + enterDur, easeOutExpo);
          const enterPPrev = easeProgress(frame - 1, enterStart, enterStart + enterDur, easeOutExpo);
          const exitP = easeProgress(frame, exitStart, exitStart + exitDur, easeInExpo);
          const exitPPrev = easeProgress(frame - 1, exitStart, exitStart + exitDur, easeInExpo);

          const yAt = (e: number, x: number) => interpolate(e, [0, 1], [maskHeight * 1.4, 0]) - x * maskHeight * 2.2;
          const y = yAt(enterP, exitP);
          const yPrev = yAt(enterPPrev, exitPPrev);
          const velocity = Math.abs(y - yPrev);
          const blur = motionBlur(velocity, maskHeight * 0.5, 26);
          const stretchY = velocityStretch(velocity, maskHeight * 0.5, 0.14);

          const opacity = interpolate(enterP, [0, 0.25], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * interpolate(exitP, [0, 0.6], [1, 0], {extrapolateRight: 'clamp'});
          if (opacity <= 0.002) return null;

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                width: maskWidth,
                opacity,
                filter: blur ? `blur(${blur}px)` : undefined,
                transform: `translateY(${y - maskHeight / 2}px) scaleY(${stretchY})`,
              }}
            >
              <div
                style={{
                  fontFamily: FONT,
                  fontWeight: 800,
                  fontSize,
                  letterSpacing: -2,
                  color: BRAND.ink,
                  lineHeight: 1,
                }}
              >
                {service.label}
              </div>
            </div>
          );
        })}
      </MaskReveal>

      {/* Index number + icon — off to the side, offset 3 frames behind the
          headline (a designed lag, not simultaneous with it). */}
      {services.map((service, i) => {
        const center = start + i * slotFrames + slotFrames * 0.42 + 3;
        const enterStart = center - 11;
        const enterDur = 11;
        const exitStart = center + 6;
        const exitDur = 10;
        const enterP = easeProgress(frame, enterStart, enterStart + enterDur, easeOutExpo);
        const exitP = easeProgress(frame, exitStart, exitStart + exitDur, easeInExpo);
        const opacity = interpolate(enterP, [0, 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) * interpolate(exitP, [0, 0.6], [1, 0], {extrapolateRight: 'clamp'});
        if (opacity <= 0.002) return null;
        const iconP = Math.min(Math.max((frame - enterStart) / (enterDur + 8), 0), 1);
        const y = interpolate(enterP, [0, 1], [26, 0]) - interpolate(exitP, [0, 1], [0, -22]);

        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              right: -8,
              top: -52,
              opacity,
              transform: `translateY(${y}px) scale(0.62)`,
              transformOrigin: '100% 0%',
            }}
          >
            <AnimatedIcon kind={service.kind} progress={iconP} />
          </div>
        );
      })}

      {/* The running index — "02/04" — offset again, trailing the icon. */}
      {services.map((_, i) => {
        const center = start + i * slotFrames + slotFrames * 0.42 - 4;
        const enterStart = center - 9;
        const exitStart = center + slotFrames - 8;
        const enterP = easeProgress(frame, enterStart, enterStart + 9, easeOutExpo);
        const exitP = easeProgress(frame, exitStart, exitStart + 9, easeInExpo);
        const opacity = enterP * (1 - exitP);
        if (opacity <= 0.002) return null;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 2,
              top: maskHeight + 22,
              fontFamily: MONO,
              fontSize: 20,
              fontWeight: 600,
              letterSpacing: 3,
              color: BRAND.red,
              opacity,
            }}
          >
            {`0${i + 1}/0${services.length}`}
          </div>
        );
      })}
    </div>
  );
};
