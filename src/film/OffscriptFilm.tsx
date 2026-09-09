import React from 'react';
import {AbsoluteFill, interpolate, interpolateColors, useCurrentFrame, useVideoConfig} from 'remotion';
import {FILM_COLORS, FILM_FONT, FILM_MONO, TIMELINE} from './theme';
import {morphProgress, cameraPush, ramp, staggerProgress} from './springs';
import {RedDot} from './components/RedDot';
import {MorphingPill} from './components/MorphingPill';
import {AnimatedTypography} from './components/AnimatedTypography';
import {ContentCard} from './components/ContentCard';
import {SocialFeed} from './components/SocialFeed';
import {CameraFrame} from './components/CameraFrame';
import {EditingTimeline} from './components/EditingTimeline';
import {AnalyticsGraph} from './components/AnalyticsGraph';
import {MetricCounter} from './components/MetricCounter';
import {OffscriptLogo} from './components/OffscriptLogo';
import {MorphTransition} from './components/MorphTransition';

const {s1, s2, s3, s4, s5, s6} = TIMELINE;

// ---------------------------------------------------------------------------
// Scene 1 — Hook: dot -> pill -> text container -> camera push through MOVE
// ---------------------------------------------------------------------------
const Scene1: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  if (frame > s1.end + 10) return null;

  const dotIn = morphProgress(frame, 0, 12, fps, true);
  const pillGrow = morphProgress(frame, 12, 46, fps);
  const cardGrow = morphProgress(frame, 46, 92, fps);
  const wordProgress = morphProgress(frame, 58, 108, fps);
  const push = cameraPush(frame, s1.end - 30, s1.end, fps, {toScale: 1.6, blurPeak: 26, drift: -70});

  const width = interpolate(pillGrow, [0, 1], [8, 260], undefined) + interpolate(cardGrow, [0, 1], [0, 640]);
  const height = interpolate(pillGrow, [0, 1], [8, 68]) + interpolate(cardGrow, [0, 1], [0, 300]);
  const radius = interpolate(cardGrow, [0, 1], [34, 28]);
  const background = interpolateColors(cardGrow, [0, 1], [FILM_COLORS.accent, FILM_COLORS.surface]) as string;
  const borderWidth = interpolate(cardGrow, [0, 1], [0, 2]);

  const showLabel = pillGrow > 0.55 && cardGrow < 0.25;
  const labelOpacity = interpolate(pillGrow, [0.55, 0.75], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) *
    interpolate(cardGrow, [0, 0.3], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // Scene 1 must be fully gone (not just blurred) before Scene 2's opaque
  // shape settles on the same screen position, or its text pokes out from
  // behind the incoming card. Opacity is paired with the blur/scale push,
  // not used alone.
  const exitOpacity = interpolate(push.progress, [0.35, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        opacity: exitOpacity,
        transform: `scale(${push.scale}) translateY(${push.translateY}px)`,
        filter: `blur(${push.blur}px)`,
      }}
    >
      <div style={{opacity: interpolate(dotIn, [0, 1], [0, 1]), transform: `scale(${interpolate(dotIn, [0, 1], [0.3, 1])})`}}>
        <MorphingPill
          width={width}
          height={height}
          radius={radius}
          background={background}
          borderColor={FILM_COLORS.accent}
          borderWidth={borderWidth}
        >
          {showLabel && (
            <div
              style={{
                opacity: labelOpacity,
                fontFamily: FILM_FONT,
                fontWeight: 700,
                fontSize: 26,
                letterSpacing: 1,
                color: FILM_COLORS.primary,
              }}
            >
              CONTENT.
            </div>
          )}
          {cardGrow > 0.15 && (
            <AnimatedTypography
              progress={wordProgress}
              fontSize={78}
              lineHeight={1.02}
              lines={[
                'CONTENT',
                'SHOULD',
                {text: 'MOVE.', color: FILM_COLORS.accent},
              ]}
            />
          )}
        </MorphingPill>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 2 — Attention: card compresses, feed drifts in, STOP THE SCROLL,
// central card scales to fill the screen (becomes Scene 3's canvas).
// ---------------------------------------------------------------------------
const Scene2: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  if (frame < s2.start - 20 || frame > s2.end + 15) return null;

  const compress = morphProgress(frame, s2.start + 10, s2.start + 60, fps);
  const feedSettle = morphProgress(frame, s2.start + 40, s2.start + 90, fps);
  const typeProgress = morphProgress(frame, s2.start + 90, s2.start + 150, fps);
  const fill = morphProgress(frame, s2.end - 40, s2.end, fps, true);

  // The card resolves into view (opacity + blur + scale together, timed to
  // finish just as Scene 1 has fully dissolved) rather than snapping in
  // opaque on top of it.
  const entry = morphProgress(frame, s2.start - 20, s2.start + 15, fps, true);
  const entryOpacity = entry;
  const entryBlur = interpolate(entry, [0, 1], [16, 0]);
  const entryScale = interpolate(entry, [0, 1], [0.9, 1]);

  const cardW = interpolate(compress, [0, 1], [640, 300]) + interpolate(fill, [0, 1], [0, 1080 - 300]);
  const cardH = interpolate(compress, [0, 1], [300, 460]) + interpolate(fill, [0, 1], [0, 1920 - 460]);
  const radius = interpolate(fill, [0, 1], [28, 0]);
  const typeExit = interpolate(fill, [0, 0.6], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: interpolate(fill, [0, 0.5], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
        <SocialFeed frame={frame} fps={fps} startFrame={s2.start + 20} settle={feedSettle} driftSpeed={interpolate(fill, [0, 1], [1, 0])} />
      </div>

      <MorphingPill
        width={cardW}
        height={cardH}
        radius={radius}
        background={interpolateColors(fill, [0, 1], [FILM_COLORS.surface, FILM_COLORS.background]) as string}
        borderColor={interpolateColors(compress, [0, 1], [FILM_COLORS.accent, FILM_COLORS.border]) as string}
        borderWidth={interpolate(compress, [0, 1], [2, 1.2]) * interpolate(fill, [0, 1], [1, 0])}
        shadow={30 * interpolate(fill, [0, 1], [1, 0])}
        style={{
          opacity: entryOpacity,
          filter: `blur(${entryBlur}px)`,
          transform: `scale(${entryScale})`,
        }}
      />

      <div
        style={{
          position: 'absolute',
          opacity: typeExit,
          filter: `blur(${interpolate(fill, [0, 1], [0, 14])}px)`,
          transform: `scale(${interpolate(fill, [0, 1], [1, 1.15])})`,
        }}
      >
        <AnimatedTypography
          progress={typeProgress}
          align="center"
          fontSize={98}
          lineHeight={0.98}
          lines={[
            {text: 'STOP', sizeMultiplier: 1.35},
            'THE',
            {text: 'SCROLL.', color: FILM_COLORS.secondary}, // red used sparingly: only the accent dot below carries it
          ]}
        />
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: 10,
            background: FILM_COLORS.accent,
            margin: '18px auto 0',
            opacity: interpolate(typeProgress, [0.85, 1], [0, 1], {extrapolateLeft: 'clamp'}),
          }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 3 — Offscript: full-bleed black canvas (the scaled card from Scene 2
// merges with the root background), a red label pill, and four words that
// each morph into their visual representation.
// ---------------------------------------------------------------------------
const StrategyVisual: React.FC<{progress: number}> = ({progress}) => {
  const dots = [
    [0, 0], [1, 0], [2, 0],
    [0, 1], [1, 1], [2, 1],
    [0, 2], [1, 2], [2, 2],
  ];
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%'}}>
    <svg width={280} height={280} viewBox="0 0 280 280">
      {dots.map(([gx, gy], i) => {
        const p = Math.min(Math.max(progress * dots.length - i * 0.7, 0), 1);
        const cx = 40 + gx * 100;
        const cy = 40 + gy * 100;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={interpolate(p, [0, 1], [0, 7])}
            fill={gx === 1 && gy === 1 ? FILM_COLORS.accent : FILM_COLORS.primary}
            opacity={0.85}
          />
        );
      })}
      {dots.slice(0, -1).map(([gx, gy], i) => {
        const [nx, ny] = dots[i + 1];
        const p = Math.min(Math.max(progress * dots.length - i * 0.7 - 0.4, 0), 1);
        return (
          <line
            key={`l${i}`}
            x1={40 + gx * 100}
            y1={40 + gy * 100}
            x2={40 + gx * 100 + (nx - gx) * 100 * p}
            y2={40 + gy * 100 + (ny - gy) * 100 * p}
            stroke="rgba(255,255,255,0.25)"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
    </div>
  );
};

const ContentVisual: React.FC<{progress: number}> = ({progress}) => (
  <div style={{position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <CameraFrame width={300} height={260} progress={progress} />
    <div
      style={{
        position: 'absolute',
        width: 0,
        height: 0,
        opacity: interpolate(progress, [0.6, 1], [0, 1], {extrapolateLeft: 'clamp'}),
        borderTop: '16px solid transparent',
        borderBottom: '16px solid transparent',
        borderLeft: `24px solid ${FILM_COLORS.primary}`,
        marginLeft: 6,
      }}
    />
  </div>
);

const SocialVisual: React.FC<{progress: number}> = ({progress}) => (
  <div style={{position: 'relative', width: 300, height: 280}}>
    {[-1, 0, 1].map((offset, i) => {
      const p = Math.min(Math.max(progress * 3 - i * 0.6, 0), 1);
      return (
        <ContentCard
          key={i}
          width={130}
          height={220}
          translateX={offset * 90 - 65}
          translateY={interpolate(p, [0, 1], [40, 0]) + 30}
          scale={interpolate(p, [0, 1], [0.7, offset === 0 ? 1.05 : 0.92])}
          opacity={p}
          rotate={offset * 4}
        />
      );
    })}
  </div>
);

const PerformanceVisual: React.FC<{frame: number; fps: number; startFrame: number}> = ({frame, fps, startFrame}) => (
  <AnalyticsGraph frame={frame} fps={fps} startFrame={startFrame} width={300} height={220} />
);

const WORD_STOPS = [s3.start + 30, s3.start + 72, s3.start + 115, s3.start + 158, s3.end];
const WORD_LABELS = ['STRATEGY', 'CONTENT', 'SOCIAL', 'PERFORMANCE'];

const Scene3: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  if (frame < s3.start - 15 || frame > s3.end + 15) return null;

  const pillIn = morphProgress(frame, s3.start, s3.start + 30, fps);
  const labelPillWidth = interpolate(pillIn, [0, 1], [40, 280]);

  const stageIndex = (() => {
    for (let i = 0; i < WORD_LABELS.length; i++) {
      if (frame < WORD_STOPS[i + 1]) return i;
    }
    return WORD_LABELS.length - 1;
  })();

  const visuals = [
    <StrategyVisual key="strategy" progress={1} />,
    <ContentVisual key="content" progress={1} />,
    <SocialVisual key="social" progress={1} />,
    <PerformanceVisual key="performance" frame={frame} fps={fps} startFrame={WORD_STOPS[2]} />,
  ];

  const segStart = WORD_STOPS[stageIndex];
  const segEnd = WORD_STOPS[stageIndex + 1];
  const crossfade = morphProgress(frame, segStart, Math.min(segStart + 26, segEnd), fps);
  const labelProgress = morphProgress(frame, segStart, segStart + 20, fps);

  // Everything collapses into the red dot that opens Scene 4 — the group
  // shrinks and dissolves toward center rather than just stopping.
  const collapse = morphProgress(frame, s3.end - 40, s3.end, fps, true);
  const collapseScale = interpolate(collapse, [0, 1], [1, 0.12]);
  const collapseOpacity = interpolate(collapse, [0, 1], [1, 0]);
  const collapseBlur = interpolate(collapse, [0, 0.6, 1], [0, 8, 3]);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 48,
          transform: `scale(${collapseScale})`,
          opacity: collapseOpacity,
          filter: `blur(${collapseBlur}px)`,
        }}>
        <MorphingPill width={labelPillWidth} height={54} radius={27} background={FILM_COLORS.accent}>
          {pillIn > 0.7 && (
            <div style={{fontFamily: FILM_FONT, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: FILM_COLORS.primary}}>
              OFFSCRIPT
            </div>
          )}
        </MorphingPill>

        {pillIn > 0.9 && (
          <>
            <AnimatedTypography
              key={stageIndex}
              progress={labelProgress}
              fontSize={44}
              align="center"
              lines={[WORD_LABELS[stageIndex]]}
            />
            <MorphTransition
              width={320}
              height={300}
              progress={crossfade}
              outgoing={visuals[stageIndex]}
              incoming={visuals[Math.min(stageIndex + 1, visuals.length - 1)]}
            />
          </>
        )}
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 4 — The Process: one red dot travels through IDEA -> SHOOT -> EDIT ->
// PUBLISH -> GROW, each stage the physical successor of the last.
// ---------------------------------------------------------------------------
const PROCESS_LABELS = ['IDEA', 'SHOOT', 'EDIT', 'PUBLISH', 'GROW'];
const PROCESS_STOPS = [s4.start, s4.start + 44, s4.start + 88, s4.start + 132, s4.start + 176, s4.end];

const Scene4: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  if (frame < s4.start - 15 || frame > s4.end + 15) return null;

  const stageIndex = (() => {
    for (let i = 0; i < PROCESS_LABELS.length; i++) {
      if (frame < PROCESS_STOPS[i + 1]) return i;
    }
    return PROCESS_LABELS.length - 1;
  })();

  const segStart = PROCESS_STOPS[stageIndex];
  const segEnd = PROCESS_STOPS[stageIndex + 1];
  const local = morphProgress(frame, segStart, segEnd, fps);
  const labelProgress = morphProgress(frame, segStart, segStart + 18, fps);

  // The dot is born from Scene 3's collapse — it grows in from nothing
  // rather than snapping to full size on arrival.
  const dotIn = morphProgress(frame, s4.start - 15, s4.start + 14, fps, true);

  const stages = [
    <div key="idea" style={{opacity: dotIn, transform: `scale(${interpolate(dotIn, [0, 1], [0.2, 1])})`}}>
      <RedDot size={14} glow={interpolate(local, [0, 1], [0, 20])} />
    </div>,
    <CameraFrame key="shoot" width={260} height={220} progress={local} />,
    <EditingTimeline key="edit" width={320} progress={local} playheadProgress={local} />,
    <ContentCard key="publish" width={interpolate(local, [0, 1], [320, 170])} height={interpolate(local, [0, 1], [40, 260])} accentBar radius={20} style={{position: 'relative'}} />,
    <AnalyticsGraph key="grow" frame={frame} fps={fps} startFrame={segStart} width={300} height={220} />,
  ];

  const crossfade = morphProgress(frame, segStart, Math.min(segStart + 22, segEnd), fps);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40}}>
        <div style={{width: 340, height: 260, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <MorphTransition
            width={340}
            height={260}
            progress={crossfade}
            outgoing={stages[stageIndex]}
            incoming={stages[Math.min(stageIndex + 1, stages.length - 1)]}
          />
        </div>
        <AnimatedTypography
          key={stageIndex}
          progress={labelProgress}
          fontSize={40}
          align="center"
          lines={[{text: PROCESS_LABELS[stageIndex], color: FILM_COLORS.secondary}]}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 5 — Performance: the graph expands, kinetic numbers roll through,
// 59.2K+ dominates, then everything compresses toward center.
// ---------------------------------------------------------------------------
const METRIC_WORDS = [
  {frame: s5.start + 55, word: 'VIEWS'},
  {frame: s5.start + 95, word: 'REACH'},
  {frame: s5.start + 135, word: 'ATTENTION'},
  {frame: s5.start + 175, word: 'GROWTH'},
];

const Scene5: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  if (frame < s5.start - 15 || frame > s5.end + 20) return null;

  const graphExpand = morphProgress(frame, s5.start, s5.start + 40, fps);
  const graphW = interpolate(graphExpand, [0, 1], [300, 880]);
  const graphH = interpolate(graphExpand, [0, 1], [220, 560]);

  const dominate = morphProgress(frame, s5.end - 40, s5.end - 10, fps, true);
  const compress = morphProgress(frame, s5.end - 10, s5.end + 20, fps, true);

  const wordIndex = METRIC_WORDS.reduce((acc, w, i) => (frame >= w.frame ? i : acc), 0);
  const wordProgress = morphProgress(frame, METRIC_WORDS[wordIndex].frame, METRIC_WORDS[wordIndex].frame + 18, fps);

  const numberScale = interpolate(dominate, [0, 1], [1, 1.9]) * interpolate(compress, [0, 1], [1, 0.5]);
  const numberY = interpolate(compress, [0, 1], [0, -140]);
  const graphOpacity = interpolate(dominate, [0, 1], [1, 0]) * interpolate(compress, [0, 1], [1, 0]);
  // The number itself dissolves into Scene 6's red line rather than sitting
  // opaque on top of it once the line has resolved.
  const numberOpacity = interpolate(compress, [0.35, 1], [1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <div style={{opacity: graphOpacity, position: 'absolute'}}>
        <AnalyticsGraph frame={frame} fps={fps} startFrame={s5.start + 10} width={graphW} height={graphH} />
      </div>

      <div
        style={{
          position: 'absolute',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 14,
          opacity: numberOpacity,
          transform: `scale(${numberScale}) translateY(${numberY}px)`,
        }}
      >
        <MetricCounter
          frame={frame}
          fps={fps}
          fontSize={132}
          suffixOnLast="+"
          checkpoints={[
            {frame: s5.start + 30, value: 3900},
            {frame: s5.start + 90, value: 12200},
            {frame: s5.start + 140, value: 26200},
            {frame: s5.end - 30, value: 59200},
          ]}
        />
        <AnimatedTypography
          key={wordIndex}
          progress={wordProgress}
          fontSize={32}
          align="center"
          lines={[{text: METRIC_WORDS[wordIndex].word, color: FILM_COLORS.secondary}]}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Scene 6 — Brand payoff: collapse to a red line, breathe, draw the
// wordmark, reveal the brand pillars, hold, fade to black.
// ---------------------------------------------------------------------------
const Scene6: React.FC<{frame: number; fps: number}> = ({frame, fps}) => {
  if (frame < s6.start - 6) return null;

  const collapse = morphProgress(frame, s6.start, s6.start + 30, fps, true);
  const lineWidth = interpolate(collapse, [0, 1], [420, 90]);
  const lineOpacity = morphProgress(frame, s6.start - 6, s6.start + 8, fps, true);

  const logoStart = s6.start + 45;
  const logoProgress = morphProgress(frame, logoStart, logoStart + 105, fps);

  const pillarsProgress = morphProgress(frame, logoStart + 110, logoStart + 150, fps);
  const zurichProgress = morphProgress(frame, logoStart + 145, logoStart + 175, fps);
  const taglineProgress = morphProgress(frame, logoStart + 175, logoStart + 225, fps);

  const glowT = (frame - (logoStart + 100)) / 40;
  const glow = interpolate(Math.sin(Math.max(glowT, 0)), [-1, 1], [0.12, 0.22]);

  const fadeOut = ramp(frame, s6.end - 35, s6.end, 0, 1);

  return (
    <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% 45%, rgba(242,5,5,${glow}), rgba(242,5,5,0) 60%)`,
          opacity: interpolate(logoProgress, [0, 0.3], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
        }}
      />

      {logoProgress < 0.02 ? (
        <div
          style={{
            width: lineWidth,
            height: 4,
            opacity: lineOpacity,
            borderRadius: 4,
            background: FILM_COLORS.accent,
          }}
        />
      ) : (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <OffscriptLogo progress={logoProgress} fontSize={110} wordmarkWidth={640} />

          <div style={{marginTop: 74}}>
            <AnimatedTypography
              progress={pillarsProgress}
              align="center"
              fontSize={30}
              color={FILM_COLORS.secondary}
              fontWeight={600}
              lines={['STRATEGY. CONTENT.', 'SOCIAL. PERFORMANCE.']}
            />
          </div>

          <div
            style={{
              marginTop: 30,
              opacity: zurichProgress,
              filter: `blur(${interpolate(zurichProgress, [0, 1], [8, 0])}px)`,
              fontFamily: FILM_MONO,
              fontSize: 22,
              letterSpacing: 5,
              color: FILM_COLORS.secondary,
            }}
          >
            ZÜRICH
          </div>

          <div style={{marginTop: 56}}>
            <AnimatedTypography
              progress={taglineProgress}
              align="center"
              fontSize={34}
              fontWeight={700}
              lines={["BECAUSE THE BEST STORIES", "AREN'T SCRIPTED."]}
            />
          </div>
        </div>
      )}

      <AbsoluteFill style={{backgroundColor: '#000000', opacity: fadeOut}} />
    </AbsoluteFill>
  );
};

export const OffscriptFilm: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  return (
    <AbsoluteFill style={{backgroundColor: FILM_COLORS.background}}>
      <Scene1 frame={frame} fps={fps} />
      <Scene2 frame={frame} fps={fps} />
      <Scene3 frame={frame} fps={fps} />
      <Scene4 frame={frame} fps={fps} />
      <Scene5 frame={frame} fps={fps} />
      <Scene6 frame={frame} fps={fps} />
    </AbsoluteFill>
  );
};
