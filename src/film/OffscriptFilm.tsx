import React from 'react';
import {AbsoluteFill, Img, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FILM_COLORS, TIMELINE} from './theme';
import {morphProgress, textSpring, gentleSpring, cameraSpring, flipSpring, premiumSpring} from './springs';
import {MorphingPill} from './components/MorphingPill';
import {MaskText} from './components/MaskText';
import {StatOdometer} from './components/StatOdometer';
import {CameraFrame} from './components/CameraFrame';
import {EditingTimeline} from './components/EditingTimeline';
import {AnalyticsGraph} from './components/AnalyticsGraph';
import {ContentCard} from './components/ContentCard';
import {FlipTransition} from './components/FlipTransition';
import {scrollOut, scrollIn, scrollTransform} from './components/ScrollTransition';

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
  {frame: T.dotBorn + 10, width: 14, height: 14, radius: 14, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_CENTER},
  {frame: T.pillGrow, width: 216, height: 62, radius: 31, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 14, y: Y_CENTER},
  {frame: T.pillHold, width: 216, height: 62, radius: 31, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 14, y: Y_CENTER},
  {frame: T.pillToRule, width: 68, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.headlineHold, width: 68, height: 4, radius: 2, bg: RED, borderColor: 'transparent', borderWidth: 0, shadow: 0, y: Y_ACCENT},
  {frame: T.servicesCardIn, width: CARD_W, height: CARD_H, radius: 24, bg: SURFACE, borderColor: RED, borderWidth: 2, shadow: 22, y: Y_CENTER},
  {frame: T.serviceStart, width: CARD_W, height: CARD_H, radius: 24, bg: SURFACE, borderColor: BORDER, borderWidth: 1.5, shadow: 22, y: Y_CENTER},
  {frame: T.servicesEnd - 14, width: CARD_W, height: CARD_H, radius: 24, bg: SURFACE, borderColor: BORDER, borderWidth: 1.5, shadow: 22, y: Y_CENTER},
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
// Services — treated as their own hero section. Each of the six gets a
// fixed rhythm within its serviceStep-frame slot:
//   0-14   arrival (shared with the previous service's exit transition)
//   14-28  icon build (the icon assembles itself, now that it has arrived)
//   28-60  complete hold — icon fully built, fully readable
//   60-74  exit transition (shared with the next service's arrival)
// A small motion vocabulary (flip / scroll / morph) rotates across the five
// boundaries so the section stays varied without ever feeling random; the
// final service exits via a camera-push instead, since it hands off to the
// stats section rather than another service.
// ---------------------------------------------------------------------------
const SERVICES = ['KONZEPTION', 'VIDEODREH', 'FOTOGRAFIE', 'SCHNITT', 'CREATOR', 'BETREUUNG'];
type TransitionKind = 'flip' | 'scroll' | 'morph';
const SERVICE_TRANSITIONS: TransitionKind[] = ['flip', 'scroll', 'flip', 'morph', 'scroll'];
// Build runs CONCURRENTLY with arrival, not after it: for every service
// past the first, the incoming icon starts assembling the moment its flip/
// scroll transition begins (not once the transition frame-window ends), so
// it's already partway built by the time it settles into place — no dead
// gap where the card has visibly arrived but shows nothing yet.
const BUILD_LEN = 18;
const TRANSITION_START = T.serviceStep - T.serviceTransitionFrames; // 60

const serviceAbsStart = (index: number) => T.serviceStart + index * T.serviceStep;

const getIconBuild = (index: number, frame: number, fps: number) => {
  const start = index === 0 ? serviceAbsStart(0) : serviceAbsStart(index) - T.serviceTransitionFrames;
  return morphProgress(frame, start, start + BUILD_LEN, fps, premiumSpring);
};

const getServiceStage = (frame: number, fps: number) => {
  const rel = frame - T.serviceStart;
  const rawIndex = Math.floor(rel / T.serviceStep);
  const index = Math.min(Math.max(rawIndex, 0), T.SERVICE_COUNT - 1);
  const local = rel - index * T.serviceStep;
  const inTransition = local >= TRANSITION_START && index < T.SERVICE_COUNT - 1;
  const transitionAbsStart = serviceAbsStart(index) + TRANSITION_START;
  const transitionProgress = inTransition
    ? morphProgress(frame, transitionAbsStart, transitionAbsStart + T.serviceTransitionFrames, fps, flipSpring)
    : 0;
  return {index, local, inTransition, transitionProgress};
};

const ServiceIcon: React.FC<{index: number; buildProgress: number; frame: number; fps: number}> = ({
  index,
  buildProgress,
  frame,
  fps,
}) => {
  if (index === 0) {
    const dots: [number, number][] = [[0, 0], [1, 0], [2, 0], [0, 1], [1, 1], [2, 1], [0, 2], [1, 2], [2, 2]];
    return (
      <svg width={220} height={220} viewBox="0 0 220 220">
        {dots.map(([gx, gy], i) => {
          const p = Math.min(Math.max(buildProgress * dots.length - i * 0.65, 0), 1);
          return (
            <circle
              key={i}
              cx={30 + gx * 80}
              cy={30 + gy * 80}
              r={interpolate(p, [0, 1], [0, gx === 1 && gy === 1 ? 7 : 5.5])}
              fill={gx === 1 && gy === 1 ? FILM_COLORS.accent : FILM_COLORS.primary}
              opacity={0.85}
            />
          );
        })}
      </svg>
    );
  }
  if (index === 1) {
    return <CameraFrame width={220} height={190} progress={buildProgress} />;
  }
  if (index === 2) {
    return (
      <div style={{position: 'relative'}}>
        <CameraFrame width={220} height={190} progress={buildProgress} />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) scale(${interpolate(buildProgress, [0.5, 1], [0.4, 1], {extrapolateLeft: 'clamp'})})`,
            opacity: interpolate(buildProgress, [0.5, 1], [0, 1], {extrapolateLeft: 'clamp'}),
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
    return <EditingTimeline width={240} progress={buildProgress} playheadProgress={buildProgress * 0.62} />;
  }
  if (index === 4) {
    return (
      <div style={{position: 'relative', width: 240, height: 220}}>
        {[-1, 0, 1].map((offset, i) => {
          const p = Math.min(Math.max(buildProgress * 3 - i * 0.55, 0), 1);
          const restX = offset * 72 - 50;
          const restY = offset === 0 ? 20 : 34;
          return (
            <ContentCard
              key={offset}
              width={100}
              height={170}
              translateX={interpolate(p, [0, 1], [-50, restX])}
              translateY={interpolate(p, [0, 1], [90, restY])}
              scale={interpolate(p, [0, 1], [0.75, offset === 0 ? 1.04 : 0.9])}
              rotate={interpolate(p, [0, 1], [0, offset * 3.5])}
              opacity={p}
            />
          );
        })}
      </div>
    );
  }
  return <AnalyticsGraph frame={frame} fps={fps} startFrame={serviceAbsStart(5) - T.serviceTransitionFrames} width={230} height={170} />;
};

const CardFace: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div style={{width: 240, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    {children}
  </div>
);

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
export const OffscriptFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const hero = getHero(frame, fps);

  // --- Pill label ("OFFSCRIPT") -------------------------------------------
  const pillLabelEnter = morphProgress(frame, T.pillGrow - 10, T.pillGrow + 6, fps, textSpring);
  const pillLabelExit = morphProgress(frame, T.pillHold + 2, T.pillToRule, fps, textSpring);

  // --- Headline ------------------------------------------------------------
  const headlineEnter = morphProgress(frame, T.headlineIn, T.headlineRevealEnd, fps, textSpring);
  const headlineExit = morphProgress(frame, T.headlineHold, T.headlineOut, fps, textSpring);

  // --- Services --------------------------------------------------------------
  const stage = getServiceStage(frame, fps);
  const isLast = stage.index === T.SERVICE_COUNT - 1;
  const nextIndex = Math.min(stage.index + 1, T.SERVICE_COUNT - 1);
  const kind: TransitionKind = SERVICE_TRANSITIONS[stage.index] ?? 'morph';

  const currentBuild = getIconBuild(stage.index, frame, fps);
  const nextBuild = stage.inTransition && !isLast ? getIconBuild(nextIndex, frame, fps) : 0;

  // The final service (BETREUUNG) exits via a camera push into the stats
  // section instead of pairing with a "next" service.
  const finalPush = isLast
    ? morphProgress(frame, serviceAbsStart(5) + TRANSITION_START, T.servicesEnd, fps, cameraSpring)
    : 0;

  const showServices = frame >= T.serviceStart - 4 && frame < T.servicesEnd + 4;

  const currentIcon = <ServiceIcon index={stage.index} buildProgress={currentBuild} frame={frame} fps={fps} />;
  const nextIcon = stage.inTransition && !isLast
    ? <ServiceIcon index={nextIndex} buildProgress={nextBuild} frame={frame} fps={fps} />
    : null;

  const cardEntranceOpacity = interpolate(frame, [T.servicesCardIn, T.servicesCardIn + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // --- Stats -----------------------------------------------------------------
  const statsBlockOpacity = interpolate(
    frame,
    [T.statsStart - 10, T.statsStart + 16, T.statsEnd - 16, T.statsEnd + 10],
    [0, 1, 1, 0],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
  );

  // --- Logo crossfade ----------------------------------------------------
  const lineFadeStart = T.logoIn - 14;
  const lineOpacity = interpolate(frame, [lineFadeStart, T.logoIn + 4], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const logoEnter = morphProgress(frame, T.logoIn, T.logoIn + 18, fps, gentleSpring);
  const logoScale = interpolate(logoEnter, [0, 1], [0.97, 1]);
  const logoOpacity = logoEnter;

  const subEnter = morphProgress(frame, T.logoSettled - 4, T.logoSettled + 20, fps, textSpring);
  const tagEnter = morphProgress(frame, T.logoSettled + 16, T.logoSettled + 46, fps, textSpring);

  // A settling breathing-room drift for the very end — barely perceptible.
  const settleT = Math.max(frame - (T.logoSettled + 70), 0) / fps;
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
          {showServices && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: cardEntranceOpacity,
              }}
            >
              {!stage.inTransition && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    opacity: isLast ? interpolate(finalPush, [0, 1], [1, 0]) : 1,
                    filter: isLast ? `blur(${interpolate(finalPush, [0, 1], [0, 10])}px)` : undefined,
                    transform: isLast ? `scale(${interpolate(finalPush, [0, 1], [1, 1.12])})` : undefined,
                  }}
                >
                  <CardFace>{currentIcon}</CardFace>
                </div>
              )}

              {stage.inTransition && kind === 'flip' && (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <FlipTransition
                    progress={stage.transitionProgress}
                    width={240}
                    height={220}
                    axis={stage.index % 2 === 0 ? 'Y' : 'X'}
                    outgoing={<CardFace>{currentIcon}</CardFace>}
                    incoming={<CardFace>{nextIcon}</CardFace>}
                  />
                </div>
              )}

              {stage.inTransition && kind === 'scroll' && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: scrollOut(stage.transitionProgress, 0.85).opacity,
                      transform: scrollTransform(scrollOut(stage.transitionProgress, 0.85)),
                    }}
                  >
                    <CardFace>{currentIcon}</CardFace>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: scrollIn(stage.transitionProgress, 0.85).opacity,
                      transform: scrollTransform(scrollIn(stage.transitionProgress, 0.85)),
                    }}
                  >
                    <CardFace>{nextIcon}</CardFace>
                  </div>
                </>
              )}

              {stage.inTransition && kind === 'morph' && (
                <>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: interpolate(stage.transitionProgress, [0, 1], [1, 0]),
                      filter: `blur(${interpolate(stage.transitionProgress, [0, 1], [0, 5])}px)`,
                      transform: `scale(${interpolate(stage.transitionProgress, [0, 1], [1, 0.95])})`,
                    }}
                  >
                    <CardFace>{currentIcon}</CardFace>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: interpolate(stage.transitionProgress, [0, 1], [0, 1]),
                      filter: `blur(${interpolate(stage.transitionProgress, [0, 1], [5, 0])}px)`,
                      transform: `scale(${interpolate(stage.transitionProgress, [0, 1], [1.05, 1])})`,
                    }}
                  >
                    <CardFace>{nextIcon}</CardFace>
                  </div>
                </>
              )}
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
      {showServices && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateY(${-CARD_H / 2 - 90}px)`,
          }}
        >
          {!stage.inTransition && (
            <MaskText
              key={`label-${stage.index}`}
              lines={[SERVICES[stage.index]]}
              rowHeight={56}
              width={CARD_W + 100}
              fontSize={38}
              fontWeight={800}
              letterSpacingFrom={5}
              letterSpacingTo={0}
              enter={morphProgress(frame, serviceAbsStart(stage.index), serviceAbsStart(stage.index) + 10, fps, textSpring)}
              exit={isLast ? finalPush : 0}
            />
          )}

          {stage.inTransition && (
            <>
              <div
                style={{
                  opacity: kind === 'scroll' ? 1 : interpolate(stage.transitionProgress, [0, 0.7], [1, 0], {extrapolateRight: 'clamp'}),
                  filter: `blur(${interpolate(stage.transitionProgress, [0, 1], [0, kind === 'flip' ? 4 : 6])}px)`,
                  transform: kind === 'scroll' ? scrollTransform(scrollOut(stage.transitionProgress, 1)) : `translateY(${interpolate(stage.transitionProgress, [0, 1], [0, -10])}px)`,
                }}
              >
                <MaskText
                  key={`label-out-${stage.index}`}
                  lines={[SERVICES[stage.index]]}
                  rowHeight={56}
                  width={CARD_W + 100}
                  fontSize={38}
                  fontWeight={800}
                  letterSpacingFrom={0}
                  letterSpacingTo={0}
                  enter={1}
                  exit={0}
                />
              </div>
              {!isLast && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: kind === 'scroll' ? 1 : interpolate(stage.transitionProgress, [0.3, 1], [0, 1], {extrapolateLeft: 'clamp'}),
                    filter: `blur(${interpolate(stage.transitionProgress, [0, 1], [kind === 'flip' ? 4 : 6, 0])}px)`,
                    transform: kind === 'scroll' ? scrollTransform(scrollIn(stage.transitionProgress, 1)) : `translateY(${interpolate(stage.transitionProgress, [0, 1], [10, 0])}px)`,
                  }}
                >
                  <MaskText
                    key={`label-in-${nextIndex}`}
                    lines={[SERVICES[nextIndex]]}
                    rowHeight={56}
                    width={CARD_W + 100}
                    fontSize={38}
                    fontWeight={800}
                    letterSpacingFrom={0}
                    letterSpacingTo={0}
                    enter={1}
                    exit={0}
                  />
                </div>
              )}
            </>
          )}
        </div>
      )}

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
