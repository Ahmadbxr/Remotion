import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FILM_COLORS, TIMELINE} from './theme';
import {morphProgress, textSpring, gentleSpring, cameraSpring} from './springs';
import {MorphingPill} from './components/MorphingPill';
import {MaskText} from './components/MaskText';
import {StatOdometer} from './components/StatOdometer';
import {CameraFrame} from './components/CameraFrame';
import {EditingTimeline} from './components/EditingTimeline';
import {AnalyticsGraph} from './components/AnalyticsGraph';
import {ContentCard} from './components/ContentCard';

const T = TIMELINE;

// ---------------------------------------------------------------------------
// The persistent hero shape: ONE element, mounted for the entire film,
// whose geometry is a single continuous function of frame. Every stage
// below (dot / pill / rule / card / rule / line / logo-slot) is a keyframe
// in the SAME property set — nothing here is ever unmounted, so there is
// no seam between stages for a jump to hide in.
// ---------------------------------------------------------------------------

const Y_CENTER = 0;
const Y_ACCENT = -260; // where the hero sits when it's a quiet mark above other content
const CARD_W = 340;
const CARD_H = 300;
const LOGO_DISPLAY_WIDTH = 440;

type HeroKF = {
  frame: number;
  width: number;
  height: number;
  radius: number;
  bg: string;
  borderColor: string;
  borderWidth: number;
  shadow: number;
  y: number;
};

const RED = FILM_COLORS.accent;
const SURFACE = FILM_COLORS.surface;
const BORDER = FILM_COLORS.border;

const heroKeyframes: HeroKF[] = [
  {frame: T.dotBorn, width: 0, height: 0, radius: 20, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_CENTER},
  {frame: T.dotBorn + 14, width: 14, height: 14, radius: 14, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_CENTER},
  {frame: T.pillGrow, width: 216, height: 62, radius: 31, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 14, y: Y_CENTER},
  {frame: T.pillHold, width: 216, height: 62, radius: 31, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 14, y: Y_CENTER},
  {frame: T.pillToRule, width: 68, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.headlineHold, width: 68, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.servicesCardIn, width: CARD_W, height: CARD_H, radius: 24, bg: SURFACE, borderColor: RED, borderWidth: 2, shadow: 22, y: Y_CENTER},
  {frame: T.serviceStart, width: CARD_W, height: CARD_H, radius: 24, bg: SURFACE, borderColor: BORDER, borderWidth: 1.5, shadow: 22, y: Y_CENTER},
  {frame: T.servicesEnd, width: CARD_W, height: CARD_H, radius: 24, bg: SURFACE, borderColor: BORDER, borderWidth: 1.5, shadow: 22, y: Y_CENTER},
  {frame: T.statsCardOut, width: 60, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.statsEnd, width: 60, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.compressStart, width: 60, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.compressEnd, width: 24, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_CENTER},
  {frame: T.lineTravelEnd, width: LOGO_DISPLAY_WIDTH * 0.86, height: 3, radius: 1.5, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_CENTER},
  {frame: T.logoIn, width: LOGO_DISPLAY_WIDTH * 0.86, height: 3, radius: 1.5, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_CENTER},
];

const getHero = (frame: number, fps: number): HeroKF => {
  let a = heroKeyframes[0];
  let b = heroKeyframes[heroKeyframes.length - 1];
  for (let i = 0; i < heroKeyframes.length - 1; i++) {
    if (frame >= heroKeyframes[i].frame && frame <= heroKeyframes[i + 1].frame) {
      a = heroKeyframes[i];
      b = heroKeyframes[i + 1];
      break;
    }
  }
  if (frame > heroKeyframes[heroKeyframes.length - 1].frame) {
    a = b = heroKeyframes[heroKeyframes.length - 1];
  }
  if (frame < heroKeyframes[0].frame) {
    a = b = heroKeyframes[0];
  }

  const p = morphProgress(frame, a.frame, b.frame, fps, cameraSpring);
  const lerp = (x: number, y: number) => interpolate(p, [0, 1], [x, y]);

  return {
    frame,
    width: lerp(a.width, b.width),
    height: lerp(a.height, b.height),
    radius: lerp(a.radius, b.radius),
    bg: (a.bg === b.bg ? a.bg : (interpolateColors(p, [0, 1], [a.bg, b.bg]) as string)),
    borderColor: a.borderColor === b.borderColor ? a.borderColor : (interpolateColors(p, [0, 1], [a.borderColor === 'transparent' ? a.bg : a.borderColor, b.borderColor === 'transparent' ? b.bg : b.borderColor]) as string),
    borderWidth: lerp(a.borderWidth, b.borderWidth),
    shadow: lerp(a.shadow, b.shadow),
    y: lerp(a.y, b.y),
  };
};

// ---------------------------------------------------------------------------
// Small always-mounted helper: a generic fade/blur/scale envelope for a
// visual that lives inside the services card. Never unmounts across the
// whole film — only its own opacity/blur reach zero outside its window.
// ---------------------------------------------------------------------------
const stageEnvelope = (frame: number, start: number, end: number, fps: number) => {
  const fade = 16;
  const enter = morphProgress(frame, start, start + fade, fps, textSpring);
  const exit = morphProgress(frame, end - fade, end, fps, textSpring);
  return {
    opacity: enter * (1 - exit),
    blur: interpolate(enter, [0, 1], [6, 0]) + interpolate(exit, [0, 1], [0, 6]),
    scale: interpolate(enter, [0, 1], [0.97, 1]),
  };
};

const SERVICES = ['KONZEPTION', 'VIDEODREH', 'FOTOGRAFIE', 'SCHNITT', 'CREATOR', 'BETREUUNG'];

const ServiceVisual: React.FC<{index: number; frame: number; fps: number}> = ({index, frame, fps}) => {
  if (index === 0) {
    // KONZEPTION — a small structured grid, ink dots on a connecting line.
    const dots: [number, number][] = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
    return (
      <svg width={220} height={220} viewBox="0 0 220 220">
        {dots.map(([gx, gy], i) => (
          <circle key={i} cx={30 + gx * 80} cy={30 + gy * 80} r={gx === 1 && gy === 1 ? 7 : 5.5} fill={gx === 1 && gy === 1 ? FILM_COLORS.accent : FILM_COLORS.primary} opacity={0.85} />
        ))}
      </svg>
    );
  }
  if (index === 1) {
    return <CameraFrame width={220} height={190} progress={1} />;
  }
  if (index === 2) {
    return (
      <div style={{position: 'relative'}}>
        <CameraFrame width={220} height={190} progress={1} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 26,
            height: 26,
            borderRadius: 26,
            border: `2.5px solid ${FILM_COLORS.primary}`,
          }}
        />
      </div>
    );
  }
  if (index === 3) {
    return <EditingTimeline width={240} progress={1} playheadProgress={0.62} />;
  }
  if (index === 4) {
    return (
      <div style={{position: 'relative', width: 240, height: 220}}>
        {[-1, 0, 1].map((offset) => (
          <ContentCard
            key={offset}
            width={100}
            height={170}
            translateX={offset * 72 - 50}
            translateY={offset === 0 ? 20 : 34}
            scale={offset === 0 ? 1.04 : 0.9}
            rotate={offset * 3.5}
          />
        ))}
      </div>
    );
  }
  return <AnalyticsGraph frame={frame} fps={fps} startFrame={T.serviceStart + 5 * T.serviceStep} width={230} height={170} />;
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
export const OffscriptFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const hero = getHero(frame, fps);

  // --- Pill label ("OFFSCRIPT") -------------------------------------------
  const pillLabelEnter = morphProgress(frame, T.pillGrow - 12, T.pillGrow + 10, fps, textSpring);
  const pillLabelExit = morphProgress(frame, T.pillHold + 4, T.pillToRule, fps, textSpring);

  // --- Headline ------------------------------------------------------------
  const headlineEnter = morphProgress(frame, T.headlineIn, T.headlineIn + 42, fps, textSpring);
  const headlineExit = morphProgress(frame, T.headlineHold, T.headlineOut, fps, textSpring);

  // --- Services label + card content ---------------------------------------
  const serviceStageIndex = Math.min(
    Math.max(Math.floor((frame - T.serviceStart) / T.serviceStep), 0),
    T.SERVICE_COUNT - 1,
  );
  const serviceLabelStart = T.serviceStart + serviceStageIndex * T.serviceStep;
  const serviceLabelEnter = morphProgress(frame, serviceLabelStart, serviceLabelStart + 16, fps, textSpring);
  const serviceLabelExit = morphProgress(
    frame,
    serviceLabelStart + T.serviceStep - 14,
    serviceLabelStart + T.serviceStep,
    fps,
    textSpring,
  );
  const showServiceLabel = frame >= T.serviceStart && frame < T.servicesEnd;

  const cardContentOpacity = interpolate(
    frame,
    [T.servicesCardIn, T.servicesCardIn + 20, T.servicesEnd - 20, T.servicesEnd],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // --- Stats -----------------------------------------------------------------
  const statsBlockOpacity = interpolate(
    frame,
    [T.statsStart - 10, T.statsStart + 20, T.statsEnd - 20, T.statsEnd + 10],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // --- Logo crossfade ----------------------------------------------------
  const lineFadeStart = T.logoIn - 20;
  const lineOpacity = interpolate(frame, [lineFadeStart, T.logoIn + 6], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const logoEnter = morphProgress(frame, T.logoIn, T.logoIn + 26, fps, gentleSpring);
  const logoScale = interpolate(logoEnter, [0, 1], [0.97, 1]);
  const logoOpacity = logoEnter;

  const subEnter = morphProgress(frame, T.logoSettled - 8, T.logoSettled + 24, fps, textSpring);
  const tagEnter = morphProgress(frame, T.logoSettled + 18, T.logoSettled + 55, fps, textSpring);

  // A settling breathing-room drift for the very end — barely perceptible.
  const settleT = Math.max(frame - (T.logoSettled + 80), 0) / fps;
  const settleDrift = Math.sin(settleT * 0.35) * 1.4;

  return (
    <AbsoluteFill style={{backgroundColor: FILM_COLORS.background}}>
      {/* Persistent hero shape */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${hero.y + settleDrift}px)`,
        }}
      >
        <MorphingPill
          width={hero.width}
          height={hero.height}
          radius={hero.radius}
          background={hero.bg}
          borderColor={hero.borderColor}
          borderWidth={hero.borderWidth}
          shadow={hero.shadow}
          style={{opacity: frame >= lineFadeStart ? lineOpacity : 1}}
        >
          {/* OFFSCRIPT pill label */}
          <MaskText
            lines={[{text: 'OFFSCRIPT', color: '#FFFFFF'}]}
            rowHeight={34}
            width={200}
            fontSize={24}
            fontWeight={800}
            letterSpacingFrom={5}
            letterSpacingTo={2}
            enter={pillLabelEnter}
            exit={pillLabelExit}
            style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}
          />

          {/* Services card content */}
          {showServiceLabel && (
            <div style={{opacity: cardContentOpacity}}>
              {SERVICES.map((_, i) => {
                const {opacity, blur, scale} = stageEnvelope(
                  frame,
                  T.serviceStart + i * T.serviceStep,
                  T.serviceStart + (i + 1) * T.serviceStep,
                  fps,
                );
                if (opacity <= 0.002) return null;
                return (
                  <div
                    key={i}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity,
                      filter: `blur(${blur}px)`,
                      transform: `scale(${scale})`,
                    }}
                  >
                    <ServiceVisual index={i} frame={frame} fps={fps} />
                  </div>
                );
              })}
            </div>
          )}
        </MorphingPill>
      </div>

      {/* Headline, positioned to align with the rule above it */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%) translateY(40px)',
        }}
      >
        <MaskText
          lines={['DAS BESTE PASSIERT,', 'SOBALD DAS SCRIPT WEG IST.']}
          rowHeight={80}
          width={1000}
          fontSize={56}
          fontWeight={800}
          letterSpacingFrom={5}
          letterSpacingTo={-1.5}
          enter={headlineEnter}
          exit={headlineExit}
        />
      </div>

      {/* Service label, above the card */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${-CARD_H / 2 - 90}px)`,
        }}
      >
        <MaskText
          key={serviceStageIndex}
          lines={[SERVICES[serviceStageIndex]]}
          rowHeight={56}
          width={CARD_W + 100}
          fontSize={38}
          fontWeight={800}
          letterSpacingFrom={5}
          letterSpacingTo={0}
          enter={serviceLabelEnter}
          exit={serviceLabelExit}
        />
      </div>

      {/* Stats */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          opacity: statsBlockOpacity,
        }}
      >
        <StatOdometer
          frame={frame}
          fps={fps}
          startFrame={T.statsStart}
          stepFrames={T.statStep}
          width={760}
          slotHeight={260}
          numberFontSize={100}
          labelFontSize={20}
          stats={[
            {value: "3'250'000", label: 'AUFRUFE'},
            {value: "1'400'000", label: 'ERREICHTE ACCOUNTS'},
            {value: "3'000+", label: 'NEUE FOLLOWER'},
          ]}
        />
      </div>

      {/* Logo + subtext + tagline */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${settleDrift}px)`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <div
          style={{
            opacity: logoOpacity,
            transform: `scale(${logoScale})`,
          }}
        >
          <Img src={staticFile('offscript-logo.png')} style={{width: LOGO_DISPLAY_WIDTH}} />
        </div>

        <div style={{marginTop: 30}}>
          <MaskText
            lines={[
              {text: 'CONTENT & SOCIAL MEDIA'},
              {text: 'ZÜRICH', color: FILM_COLORS.secondary},
            ]}
            rowHeight={30}
            width={420}
            fontSize={17}
            fontWeight={600}
            color={FILM_COLORS.secondary}
            letterSpacingFrom={4}
            letterSpacingTo={3}
            enter={subEnter}
          />
        </div>

        <div style={{marginTop: 44}}>
          <MaskText
            lines={['DAS BESTE PASSIERT,', 'SOBALD DAS SCRIPT WEG IST.']}
            rowHeight={44}
            width={620}
            fontSize={30}
            fontWeight={700}
            letterSpacingFrom={3}
            letterSpacingTo={-0.5}
            enter={tagEnter}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
