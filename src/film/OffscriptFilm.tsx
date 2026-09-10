import React from 'react';
import {AbsoluteFill, Audio, Img, Sequence, interpolate, interpolateColors, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {FILM_COLORS, TIMELINE} from './theme';
import {morphProgress, withOvershoot, getMotionBlur, OFFSCRIPT_FAST, OFFSCRIPT_SMOOTH, OFFSCRIPT_OVERSHOOT, OFFSCRIPT_SCROLL, OFFSCRIPT_FLIP, OFFSCRIPT_SETTLE} from './springs';
import {MorphingPill} from './components/MorphingPill';
import {MaskText} from './components/MaskText';
import {KineticWords} from './components/KineticWords';
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

const computeHeroAt = (frame: number, fps: number): HeroKF => {
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

  const p = morphProgress(frame, a.frame, b.frame, fps, OFFSCRIPT_SETTLE);
  const lerp = (x: number, y: number) => interpolate(p, [0, 1], [x, y]);

  return {
    frame,
    // Size changes (not position) get a small, controlled overshoot — the
    // hero shape briefly overgrows/overshrinks its target size by ~2%
    // before settling, rather than arriving at its new dimensions dead flat.
    width: withOvershoot(p, a.width, b.width, 0.02),
    height: withOvershoot(p, a.height, b.height, 0.02),
    radius: lerp(a.radius, b.radius),
    bg: (a.bg === b.bg ? a.bg : (interpolateColors(p, [0, 1], [a.bg, b.bg]) as string)),
    borderColor: a.borderColor === b.borderColor ? a.borderColor : (interpolateColors(p, [0, 1], [a.borderColor === 'transparent' ? a.bg : a.borderColor, b.borderColor === 'transparent' ? b.bg : b.borderColor]) as string),
    borderWidth: lerp(a.borderWidth, b.borderWidth),
    shadow: lerp(a.shadow, b.shadow),
    y: lerp(a.y, b.y),
  };
};

type HeroState = HeroKF & {blur: number};

// The hero shape is the fastest-moving thing on screen at several points
// (pill -> rule, the compress -> line stretch into the logo slot) but,
// unlike text and icons, never got its own motion blur. Measured the same
// way as everywhere else: a real width/height delta between this frame and
// the last, run through getMotionBlur — not a hand-timed blur pulse, and
// exactly 0 the instant a hold begins (nothing is moving) so readable
// states (the pill hold, the services card, a quiet rule) stay crisp.
const HERO_MAX_VELOCITY = 20; // px/frame combined width+height change — a fast morph
const HERO_MAX_BLUR = 19; // major structural morphs get a strong, clearly-readable blur peak

const getHero = (frame: number, fps: number): HeroState => {
  const cur = computeHeroAt(frame, fps);
  const prev = computeHeroAt(frame - 1, fps);
  const velocity = Math.abs(cur.width - prev.width) + Math.abs(cur.height - prev.height);
  const blur = getMotionBlur(velocity, HERO_MAX_VELOCITY, HERO_MAX_BLUR);
  return {...cur, blur};
};

// A subtle virtual camera: a whole-frame scale pulse motivated by, and only
// by, an actual scene transition — never a random ambient zoom. Each beat
// is a smooth push-in-then-settle bump (sine-shaped, not a spring, so it's
// perfectly symmetric and always returns exactly to 1.0), applied to a
// wrapper around the whole visual tree. Because the wrapper is absolutely
// positioned and sized to the full frame BEFORE the transform is applied,
// every child's percentage-based positioning still resolves against the
// same 1080x1920 box — the transform only scales the final paint, so nothing
// inside needs to know the camera exists.
const TRANSITION_START = T.serviceStep - T.serviceTransitionFrames;
const serviceAbsStart = (index: number) => T.serviceStart + index * T.serviceStep;

const CAMERA_BEATS = [
  T.pillToRule, // pill collapsing to a rule
  T.headlineHold, // headline dispersing into the card-forming beat — the
  // typography's own exit velocity is what the camera is riding here
  T.servicesCardIn, // arriving into the services section
  // Every service-to-service handoff now gets its own camera beat too —
  // this is the mechanism that makes the section read as ONE continuous
  // push-through relay rather than six independent card transitions.
  ...[0, 1, 2, 3, 4].map((i) => serviceAbsStart(i) + TRANSITION_START),
  T.servicesEnd - T.serviceTransitionFrames, // the last service handing off to the camera-push exit
  T.compressStart, // the rule compressing before it stretches into the logo's line
  T.logoIn, // the logo itself arriving
];
const CAMERA_PULSE_DURATION = 13;
const CAMERA_PULSE_AMOUNT = 0.03;

const cameraScaleAt = (frame: number): number => {
  let bump = 0;
  for (const beat of CAMERA_BEATS) {
    const t = frame - beat;
    if (t >= 0 && t <= CAMERA_PULSE_DURATION) {
      const b = Math.sin((Math.PI * t) / CAMERA_PULSE_DURATION) * CAMERA_PULSE_AMOUNT;
      if (b > bump) bump = b;
    }
  }
  return 1 + bump;
};

// A continuous, very slow breathing scale so no hold ever reads as
// completely dead — small enough (≤1.5%) and slow enough that it never
// registers as motion blur, only as "the frame is alive." Different phase
// per layer so the hero and the stats don't move in perfect lockstep,
// which is what actually reads as depth/parallax rather than one flat
// plane pulsing uniformly.
const microDrift = (frame: number, fps: number, amplitude = 0.013, freq = 0.55, phase = 0) =>
  1 + Math.sin((frame / fps) * freq * Math.PI * 2 + phase) * amplitude;

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

const iconBuildStart = (index: number) => (index === 0 ? serviceAbsStart(0) : serviceAbsStart(index) - T.serviceTransitionFrames);

const getIconBuild = (index: number, frame: number, fps: number) => {
  const start = iconBuildStart(index);
  return morphProgress(frame, start, start + BUILD_LEN, fps, OFFSCRIPT_OVERSHOOT);
};

// ---------------------------------------------------------------------------
// Sound design — a fixed 7-sound library (public/sfx/, generated by
// scripts/synth-sfx.py: pure sine/harmonic/filtered-noise synthesis, no
// sampled or licensed audio), each cue tied to the exact frame of the
// motion event it belongs to. Never more than this library — reused across
// every matching event rather than inventing a new sound per moment.
// ---------------------------------------------------------------------------
type SfxCue = {frame: number; file: string; volume: number};

const ICON_LOCK_OFFSET = 17; // where an icon's build (see CardFace) crosses its completion-overshoot

const SFX_CUES: SfxCue[] = [
  // Hero-shape settles: soft-settle plays as each stage of the persistent
  // shape comes to rest (dot->pill, pill->rule, headline mask settled,
  // rule->card, camera-push into stats, the compress/line/logo-slot beats).
  {frame: T.pillGrow, file: 'soft-settle.wav', volume: 0.55},
  {frame: T.pillToRule, file: 'soft-settle.wav', volume: 0.5},
  {frame: T.headlineRevealEnd, file: 'soft-settle.wav', volume: 0.45},
  {frame: T.serviceStart, file: 'soft-settle.wav', volume: 0.5},
  {frame: T.statsCardOut, file: 'soft-settle.wav', volume: 0.55},
  {frame: T.compressEnd, file: 'soft-settle.wav', volume: 0.5},
  {frame: T.lineTravelEnd, file: 'soft-settle.wav', volume: 0.45},

  // Morph-tone: the blur/scale-crossfade beats (rule -> services card, the
  // SCHNITT -> CREATOR morph transition) plus the two new camera-pulse
  // beats that don't already coincide with another cue (headline
  // dispersing into the card-forming beat; the rule compressing before it
  // stretches into the logo's line) — quiet, background reinforcement,
  // never a dominant hit.
  {frame: T.servicesCardIn, file: 'morph-tone.wav', volume: 0.42},
  {frame: serviceAbsStart(3) + TRANSITION_START, file: 'morph-tone.wav', volume: 0.5},
  {frame: T.headlineHold, file: 'morph-tone.wav', volume: 0.3},
  {frame: T.compressStart, file: 'morph-tone.wav', volume: 0.3},

  // Flip transitions (KONZEPTION->VIDEODREH, FOTOGRAFIE->SCHNITT): air
  // starts ~2 frames ahead of the visible rotation.
  {frame: serviceAbsStart(0) + TRANSITION_START - 2, file: 'flip-air.wav', volume: 0.6},
  {frame: serviceAbsStart(2) + TRANSITION_START - 2, file: 'flip-air.wav', volume: 0.6},

  // Scroll transitions (VIDEODREH->FOTOGRAFIE, CREATOR->BETREUUNG): air
  // starts 3 frames ahead of the visible scroll, per the brief's
  // "air begins 2-4 frames before movement" spec.
  {frame: serviceAbsStart(1) + TRANSITION_START - 3, file: 'scroll-air.wav', volume: 0.6},
  {frame: serviceAbsStart(4) + TRANSITION_START - 3, file: 'scroll-air.wav', volume: 0.6},

  // Icon lock — one per service, exactly at its completion-overshoot frame
  // (CardFace's lock pulse). CREATOR (index 4) is included on equal terms,
  // now that its centering is deterministic and shares this exact timing.
  ...[0, 1, 2, 3, 4, 5].map((index) => ({
    frame: iconBuildStart(index) + ICON_LOCK_OFFSET,
    file: 'icon-lock.wav',
    volume: index === 4 ? 0.4 : 0.38,
  })),

  // Kinetic-typography rhythmic accents — the same icon-lock ping, reused
  // at a low volume as a barely-audible tick-tick-IMPACT: the first group
  // to settle gets a soft tick, the EMPHASIS group (the word that carries
  // the message) gets a louder impact. Never one sound per group — that
  // would read as a chattering counter, not a rhythm. Frames mirror the
  // exact KineticWords group timing below (enterStart + rank*stagger +
  // wordDuration; wordStagger=2, wordDuration=11 are the component defaults).
  {frame: T.headlineIn + 11, file: 'icon-lock.wav', volume: 0.14}, // first group ("DAS BESTE") settles
  {frame: T.headlineIn + 3 * 2 + 2 + 11, file: 'icon-lock.wav', volume: 0.22}, // emphasis ("SCRIPT") — the impact
  {frame: T.logoSettled + 16 + 11, file: 'icon-lock.wav', volume: 0.14}, // tagline first-settling group
  {frame: T.logoSettled + 16 + 2 * 2 + 2 + 11, file: 'icon-lock.wav', volume: 0.22}, // tagline emphasis ("SCRIPT")

  // Metric pulses — one distinct variant per stat, on arrival.
  {frame: T.statsStart + 20, file: 'metric-pulse-1.wav', volume: 0.5},
  {frame: T.statsStart + T.statStep + 6, file: 'metric-pulse-2.wav', volume: 0.5},
  {frame: T.statsStart + 2 * T.statStep + 6, file: 'metric-pulse-3.wav', volume: 0.55},

  // The film's single strongest sonic moment: starts as the line begins
  // becoming the logo, its impact lands almost exactly as the logo settles
  // fully visible, then true silence for the long hold that follows.
  {frame: T.logoIn, file: 'offscript-signature.wav', volume: 0.8},
];

const getServiceStage = (frame: number, fps: number) => {
  const rel = frame - T.serviceStart;
  const rawIndex = Math.floor(rel / T.serviceStep);
  const index = Math.min(Math.max(rawIndex, 0), T.SERVICE_COUNT - 1);
  const local = rel - index * T.serviceStep;
  const inTransition = local >= TRANSITION_START && index < T.SERVICE_COUNT - 1;
  const transitionAbsStart = serviceAbsStart(index) + TRANSITION_START;
  const transitionProgress = inTransition
    ? morphProgress(frame, transitionAbsStart, transitionAbsStart + T.serviceTransitionFrames, fps, OFFSCRIPT_FLIP)
    : 0;
  // Same window, one frame earlier — lets flip/scroll spatial motion blur
  // be measured from a real position delta instead of guessed from `p`.
  const transitionProgressPrev = inTransition
    ? morphProgress(frame - 1, transitionAbsStart, transitionAbsStart + T.serviceTransitionFrames, fps, OFFSCRIPT_FLIP)
    : 0;
  return {index, local, inTransition, transitionProgress, transitionProgressPrev};
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
    // Deterministic centering: every rest position is derived from the
    // container's actual geometric center (CREATOR_W/2, CREATOR_H/2) minus
    // half the card's own size — never a hand-picked pixel offset. The
    // fan cluster is symmetric around offset 0, so its bounding box is
    // guaranteed centered in the container regardless of FAN_SPACING or
    // CENTER_LIFT tuning.
    const CREATOR_W = 240;
    const CREATOR_H = 220;
    const CARD_W = 100;
    const CARD_H = 170;
    const FAN_SPACING = 72;
    const CENTER_LIFT = 7;
    const centerX = CREATOR_W / 2;
    const centerY = CREATOR_H / 2;
    const baseX = centerX - CARD_W / 2;
    const baseY = centerY - CARD_H / 2;
    const entryX = baseX;
    const entryY = baseY + 65;
    // Completion lock-in for this whole cluster is applied once, uniformly
    // for every icon, by the CardFace wrapper around this component — not
    // duplicated here.
    return (
      <div
        style={{
          position: 'relative',
          width: CREATOR_W,
          height: CREATOR_H,
        }}
      >
        {[-1, 0, 1].map((offset, i) => {
          const p = Math.min(Math.max(buildProgress * 3 - i * 0.55, 0), 1);
          const restX = baseX + offset * FAN_SPACING;
          const restY = baseY + (offset === 0 ? -CENTER_LIFT : CENTER_LIFT);
          return (
            <ContentCard
              key={offset}
              width={CARD_W}
              height={CARD_H}
              translateX={interpolate(p, [0, 1], [entryX, restX])}
              translateY={interpolate(p, [0, 1], [entryY, restY])}
              scale={interpolate(p, [0, 1], [0.75, offset === 0 ? 1 : 0.9])}
              rotate={interpolate(p, [0, 1], [0, offset * 3.5])}
              opacity={p}
              style={{transformOrigin: '50% 50%'}}
            />
          );
        })}
      </div>
    );
  }
  return <AnalyticsGraph frame={frame} fps={fps} startFrame={serviceAbsStart(5) - T.serviceTransitionFrames} width={230} height={170} />;
};

// Icon completion "lock-in": once an icon's build finishes (buildProgress
// crosses ~0.86, since builds settle slightly before their nominal end), a
// single subtle scale pulse (1 -> 1.04 -> 0.995 -> 1 over ~10 frames' worth
// of progress) plays around the CardFace's own true center — the same
// treatment for every icon, applied once, here, instead of duplicated per
// icon branch.
const CardFace: React.FC<{children: React.ReactNode; buildProgress?: number; frame?: number}> = ({
  children,
  buildProgress = 1,
  frame = 0,
}) => {
  const lockT = interpolate(buildProgress, [0.86, 1], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lockScale = interpolate(lockT, [0, 0.45, 0.8, 1], [1, 1.04, 0.995, 1], {extrapolateRight: 'clamp'});
  // A tiny continuous idle rotation, independent of (and much faster than)
  // the hero shape's own breathing scale — this is what keeps a fully-built
  // icon from reading as a dead bitmap during its hold, without adding any
  // new visual element to the frame.
  const idleRotate = Math.sin(frame * 0.08) * 0.9;
  return (
    <div
      style={{
        width: 240,
        height: 220,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transform: `scale(${lockScale}) rotate(${idleRotate}deg)`,
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main composition
// ---------------------------------------------------------------------------
export const OffscriptFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  const hero = getHero(frame, fps);

  // Every MaskText enter/exit below is measured as a {value, prev} pair so
  // MaskText can derive real per-frame velocity (and therefore real
  // velocity-based motion blur) instead of guessing from progress alone —
  // `prev` is the identical window evaluated one frame earlier.
  const mp2 = (start: number, end: number, engine = OFFSCRIPT_SMOOTH) => ({
    value: morphProgress(frame, start, end, fps, engine),
    prev: morphProgress(frame - 1, start, end, fps, engine),
  });

  // --- Pill label ("OFFSCRIPT") -------------------------------------------
  const pillLabelEnter = mp2(T.pillGrow - 10, T.pillGrow + 6);
  const pillLabelExit = mp2(T.pillHold + 2, T.pillToRule);

  // --- Headline ------------------------------------------------------------
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
    ? morphProgress(frame, serviceAbsStart(5) + TRANSITION_START, T.servicesEnd, fps, OFFSCRIPT_SETTLE)
    : 0;
  const finalPushPrev = isLast
    ? morphProgress(frame - 1, serviceAbsStart(5) + TRANSITION_START, T.servicesEnd, fps, OFFSCRIPT_SETTLE)
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
  const logoEnter = morphProgress(frame, T.logoIn, T.logoIn + 18, fps, OFFSCRIPT_SETTLE);
  const logoScale = interpolate(logoEnter, [0, 1], [0.97, 1]);
  const logoOpacity = logoEnter;


  // A settling breathing-room drift for the very end — barely perceptible.
  const settleT = Math.max(frame - (T.logoSettled + 70), 0) / fps;
  const settleDrift = Math.sin(settleT * 0.35) * 1.4;
  const cameraScale = cameraScaleAt(frame);

  return (
    <AbsoluteFill style={{backgroundColor: FILM_COLORS.background}}>
      {SFX_CUES.map((cue, i) => (
        <Sequence key={i} from={cue.frame} layout="none">
          <Audio src={staticFile(`sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* Virtual camera: the whole visual tree, scaled by a subtle
          transition-motivated pulse. Positioned + sized to the full frame
          BEFORE the transform, so every descendant's percentage-based
          positioning still resolves against this same 1080x1920 box. */}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${cameraScale})`, transformOrigin: '50% 50%'}}>

      {/* Persistent hero shape */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(${hero.y + settleDrift}px) scale(${microDrift(frame, fps, 0.022, 0.5, 0)})`,
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
          style={{
            opacity: frame >= lineFadeStart ? lineOpacity : 1,
            filter: hero.blur ? `blur(${hero.blur}px)` : undefined,
          }}
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
            enter={pillLabelEnter.value}
            enterPrev={pillLabelEnter.prev}
            exit={pillLabelExit.value}
            exitPrev={pillLabelExit.prev}
            maxBlur={9}
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
                    filter: isLast ? `blur(${interpolate(finalPush, [0, 1], [0, 18])}px)` : undefined,
                    transform: isLast ? `scale(${interpolate(finalPush, [0, 1], [1, 1.2])})` : undefined,
                  }}
                >
                  <CardFace buildProgress={currentBuild} frame={frame}>{currentIcon}</CardFace>
                </div>
              )}

              {stage.inTransition && kind === 'flip' && (
                <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <FlipTransition
                    progress={stage.transitionProgress}
                    progressPrev={stage.transitionProgressPrev}
                    width={240}
                    height={220}
                    axis={stage.index % 2 === 0 ? 'Y' : 'X'}
                    outgoing={<CardFace buildProgress={currentBuild} frame={frame}>{currentIcon}</CardFace>}
                    incoming={<CardFace buildProgress={nextBuild} frame={frame}>{nextIcon}</CardFace>}
                  />
                </div>
              )}

              {stage.inTransition && kind === 'scroll' && (() => {
                const iconOut = scrollOut(stage.transitionProgress, 0.85, stage.transitionProgressPrev);
                const iconIn = scrollIn(stage.transitionProgress, 0.85, stage.transitionProgressPrev);
                return (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: iconOut.opacity,
                        filter: iconOut.blur ? `blur(${iconOut.blur}px)` : undefined,
                        transform: scrollTransform(iconOut),
                      }}
                    >
                      <CardFace buildProgress={currentBuild} frame={frame}>{currentIcon}</CardFace>
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: iconIn.opacity,
                        filter: iconIn.blur ? `blur(${iconIn.blur}px)` : undefined,
                        transform: scrollTransform(iconIn),
                      }}
                    >
                      <CardFace buildProgress={nextBuild} frame={frame}>{nextIcon}</CardFace>
                    </div>
                  </>
                );
              })()}

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
                      filter: `blur(${interpolate(stage.transitionProgress, [0, 1], [0, 11])}px)`,
                      transform: `scale(${interpolate(stage.transitionProgress, [0, 1], [1, 0.92])})`,
                    }}
                  >
                    <CardFace buildProgress={currentBuild} frame={frame}>{currentIcon}</CardFace>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: interpolate(stage.transitionProgress, [0, 1], [0, 1]),
                      filter: `blur(${interpolate(stage.transitionProgress, [0, 1], [11, 0])}px)`,
                      transform: `scale(${interpolate(stage.transitionProgress, [0, 1], [1.08, 1])})`,
                    }}
                  >
                    <CardFace buildProgress={nextBuild} frame={frame}>{nextIcon}</CardFace>
                  </div>
                </>
              )}
            </div>
          )}
        </MorphingPill>
      </div>

      {/* Headline, positioned to align with the rule above it. Semantic
          GROUPS (not per-word): "DAS BESTE" / "PASSIERT," / "SOBALD DAS" /
          "SCRIPT" / "WEG IST." — five phrases, SCRIPT (index 3) carries the
          emphasis. A continuous micro-drift keeps the hold alive; it never
          fully freezes even while the sentence is fully legible. */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: `translate(-50%, -50%) translateY(40px) scale(${microDrift(frame, fps, 0.016, 0.5, Math.PI / 3)})`,
        }}
      >
        <KineticWords
          lines={['DAS BESTE|PASSIERT,', 'SOBALD DAS|SCRIPT|WEG IST.']}
          frame={frame}
          fps={fps}
          enterStart={T.headlineIn}
          exitStart={T.headlineHold}
          direction="left-right"
          emphasisIndex={3}
          rowHeight={80}
          width={1000}
          fontSize={56}
          fontWeight={800}
          letterSpacing={-1.5}
          maxBlur={28}
        />
      </div>

      {/* Service label, above the card */}
      {showServices && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: `translate(-50%, -50%) translateY(${-CARD_H / 2 - 90}px) scale(${microDrift(frame, fps, 0.02, 0.6, Math.PI)})`,
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
              // Anchored to the SAME frame the incoming transition (and the
              // icon build) started, not to this hold-block's own mount
              // frame. The transition's "label-in" instance already carries
              // this reveal to enter=1 by the time it hands off here — if
              // this recomputed enter from serviceAbsStart(stage.index)
              // instead, it would read back near 0 at the exact remount
              // frame and the label would visibly reset and re-reveal
              // itself a second time (the "double pop" bug). Anchoring both
              // sides to the same start frame keeps the value continuous
              // across the remount instead.
              enter={morphProgress(frame, iconBuildStart(stage.index), iconBuildStart(stage.index) + 8, fps, OFFSCRIPT_SMOOTH)}
              enterPrev={morphProgress(frame - 1, iconBuildStart(stage.index), iconBuildStart(stage.index) + 8, fps, OFFSCRIPT_SMOOTH)}
              exit={isLast ? finalPush : 0}
              exitPrev={isLast ? finalPushPrev : 0}
              maxBlur={11}
              overshootAmount={0.05}
            />
          )}

          {stage.inTransition && (
            <>
              <div
                style={{
                  // Outgoing and incoming labels never share opacity — for
                  // ANY transition kind, scroll included: the outgoing word
                  // is fully gone by the transition's midpoint and the
                  // incoming word doesn't start appearing until then, so
                  // two different words are never simultaneously legible.
                  // (Relying on scroll's translateY offset alone to keep
                  // them apart isn't enough — at typical scroll distances
                  // they still land close enough in Y to double-expose.)
                  opacity: interpolate(stage.transitionProgress, [0, 0.42, 0.5], [1, 0, 0], {extrapolateRight: 'clamp'}),
                  filter: `blur(${interpolate(stage.transitionProgress, [0, 0.5], [0, kind === 'flip' ? 13 : 16], {extrapolateRight: 'clamp'})}px)`,
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
                    opacity: interpolate(stage.transitionProgress, [0.5, 0.58, 1], [0, 0, 1], {extrapolateLeft: 'clamp'}),
                    filter: `blur(${interpolate(stage.transitionProgress, [0.5, 1], [kind === 'flip' ? 13 : 16, 0], {extrapolateLeft: 'clamp'})}px)`,
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
          transform: `translate(-50%, -50%) scale(${microDrift(frame, fps, 0.02, 0.45, Math.PI / 2)})`,
          opacity: statsBlockOpacity,
        }}
      >
        <StatOdometer
          frame={frame}
          fps={fps}
          startFrame={T.statsStart}
          stepFrames={T.statStep}
          transitionFrames={16}
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
          transform: `translate(-50%, -50%) translateY(${settleDrift}px) scale(${microDrift(frame, fps, 0.016, 0.35, Math.PI)})`,
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
          <KineticWords
            lines={['CONTENT &|SOCIAL MEDIA', 'ZÜRICH']}
            frame={frame}
            fps={fps}
            enterStart={T.logoSettled - 4}
            direction="left-right"
            rowHeight={30}
            width={420}
            fontSize={17}
            fontWeight={600}
            color={FILM_COLORS.secondary}
            letterSpacing={3}
            maxBlur={14}
          />
        </div>

        <div style={{marginTop: 44}}>
          <KineticWords
            lines={['DAS BESTE|PASSIERT,', 'SOBALD DAS|SCRIPT|WEG IST.']}
            frame={frame}
            fps={fps}
            enterStart={T.logoSettled + 16}
            direction="center-out"
            emphasisIndex={3}
            rowHeight={44}
            width={620}
            fontSize={30}
            fontWeight={700}
            letterSpacing={-0.5}
            maxBlur={12}
          />
        </div>
      </div>
      </div>
    </AbsoluteFill>
  );
};
