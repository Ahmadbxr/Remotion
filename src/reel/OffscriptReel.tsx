import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, MONO} from './theme';
import {withOvershoot} from './springs';
import {KineticSentence} from './components/KineticType';
import {SpringCard, SignalChip} from './components/SpringCard';
import {ServiceScroller} from './components/ServiceScroller';
import {ProcessChain} from './components/ProcessChain';
import {MetricCounter} from './components/MetricCounter';
import {LogoReveal} from './components/LogoReveal';
import {CTAArrow} from './components/CTA';

// ---------------------------------------------------------------------------
// A tiny whole-frame camera pulse, motivated only by an actual handoff
// between sequences (the LANGWEILIG impact, the swipe clearing, the engine
// launching into the hero statement, the hero collapsing into the logo) —
// never a random ambient zoom. Kept small and snappy.
// ---------------------------------------------------------------------------
const CAMERA_BEATS = [38, 145, 322, 420, 505];
const cameraScaleAt = (frame: number) => {
  let bump = 0;
  for (const beat of CAMERA_BEATS) {
    const t = frame - beat;
    if (t >= 0 && t <= 11) {
      const b = Math.sin((Math.PI * t) / 11) * 0.028;
      if (b > bump) bump = b;
    }
  }
  return 1 + bump;
};

const breathe = (frame: number, amp = 0.012, freq = 0.5, phase = 0) =>
  1 + Math.sin((frame / 30) * freq * Math.PI * 2 + phase) * amp;

export const OffscriptReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const camera = cameraScaleAt(frame);

  // ---------------------------------------------------------------------
  // SEQUENCE A — pattern interrupt (0-75, ~2.5s)
  // ---------------------------------------------------------------------
  const aEnter = 4;
  const aStagger = 5;
  const aWordDur = 14;
  // LANGWEILIG. is word index 4 (DEINE, MARKE, IST, NICHT, LANGWEILIG.)
  const aImpactHit = aEnter + 4 * aStagger + aWordDur * 0.62;
  const aExitStart = aImpactHit + 5; // the impact itself triggers the exit — no pause

  // ---------------------------------------------------------------------
  // SEQUENCE B — the problem (starts sliding in before A finishes leaving)
  // ---------------------------------------------------------------------
  const bTextStart = 60;
  const bCardsStart = 78;
  const bSwipeStart = 128;
  const bSwipeDur = 18;
  const swipeProgress = interpolate(frame, [bSwipeStart, bSwipeStart + bSwipeDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // ---------------------------------------------------------------------
  // SEQUENCE C — OFFSCRIPT reveal
  // ---------------------------------------------------------------------
  const cLogoStart = 144;
  const cTextStart = 160;
  const cWegswiptWiggleStart = 197;

  // ---------------------------------------------------------------------
  // SEQUENCE D — service scroller
  // ---------------------------------------------------------------------
  const dKickerStart = 200;
  const dScrollerStart = 210;

  // ---------------------------------------------------------------------
  // SEQUENCE E — the engine: process chain -> metrics
  // ---------------------------------------------------------------------
  const eChainStart = 320;
  const eMetricStart = 402;
  // The metric's own launch INTO the hero statement — no fade, the number
  // itself explodes toward camera and that motion IS the transition.
  const eLaunchStart = 410;
  const eLaunchEnd = 434;

  // ---------------------------------------------------------------------
  // SEQUENCE F — hero statement
  // ---------------------------------------------------------------------
  const fLine1Start = 406;
  const fLine2Start = 438;
  const fExitStart = 497;

  // ---------------------------------------------------------------------
  // SEQUENCE G — CTA
  // ---------------------------------------------------------------------
  const gLogoStart = 503;
  const gTaglineStart = 528;
  const gUrlStart = 546;
  const gCtaStart = 560;

  // ---------------------------------------------------------------------
  // SOUND DESIGN — motion works fully without it; these are sparse rhythm
  // accents on the moments that matter, never one sound per movement. Reuses
  // the project's existing synthesized sound library (public/sfx/, no
  // sampled/licensed audio) as audio ASSETS, retimed to this Reel's own
  // event schedule — none of its composition/timing logic is reused.
  // ---------------------------------------------------------------------
  const dSlot = 27;
  type Cue = {frame: number; file: string; volume: number};
  const cues: Cue[] = [
    {frame: Math.round(aImpactHit), file: 'icon-lock.wav', volume: 0.7}, // LANGWEILIG hits
    {frame: bCardsStart, file: 'soft-settle.wav', volume: 0.3}, // the boring-content world arrives, once
    {frame: bSwipeStart, file: 'scroll-air.wav', volume: 0.6}, // the swipe
    {frame: cLogoStart, file: 'offscript-signature.wav', volume: 0.85}, // OFFSCRIPT reveal — the strongest beat
    {frame: cWegswiptWiggleStart, file: 'flip-air.wav', volume: 0.35}, // the attempted-swipe wiggle on WEGSWIPT.
    ...[0, 1, 2, 3].map((i) => ({
      frame: Math.round(dScrollerStart + i * dSlot + dSlot * 0.55 - 15),
      file: 'icon-lock.wav',
      volume: 0.32,
    })), // one soft tick per service arrival
    {frame: eMetricStart, file: 'icon-lock.wav', volume: 0.22},
    {frame: eMetricStart + 4, file: 'icon-lock.wav', volume: 0.26},
    {frame: eMetricStart + 8, file: 'icon-lock.wav', volume: 0.3},
    {frame: eMetricStart + 12, file: 'metric-pulse-3.wav', volume: 0.55}, // 100K+ lands
    {frame: fLine1Start, file: 'morph-tone.wav', volume: 0.3}, // FALL AUF.
    {frame: Math.round(fLine2Start + 15 * 0.62), file: 'offscript-signature.wav', volume: 0.5}, // NICHT DURCH. — restrained, not maxed
    {frame: gLogoStart, file: 'soft-settle.wav', volume: 0.45}, // closing logo settle
    {frame: gCtaStart + 12, file: 'icon-lock.wav', volume: 0.18}, // CTA's one subtle click
  ];

  return (
    <AbsoluteFill style={{backgroundColor: BRAND.background}}>
      {cues.map((cue, i) => (
        <Sequence key={i} from={cue.frame} layout="none">
          <Audio src={staticFile(`sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}
      <div style={{position: 'absolute', inset: 0, transform: `scale(${camera})`, transformOrigin: '50% 50%'}}>
        {/* ================= SEQUENCE A ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <KineticSentence
            frame={frame}
            fps={fps}
            lines={[
              [{text: 'DEINE'}, {text: 'MARKE'}],
              [{text: 'IST'}, {text: 'NICHT'}],
              [{text: 'LANGWEILIG.', emphasis: true}],
            ]}
            enterStart={aEnter}
            stagger={aStagger}
            wordDuration={aWordDur}
            exitStart={aExitStart}
            exitStagger={4}
            exitDuration={11}
            fontSize={78}
            rowHeight={98}
            width={920}
            maxBlur={26}
          />
        </AbsoluteFill>

        {/* ================= SEQUENCE B ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <KineticSentence
            frame={frame}
            fps={fps}
            lines={[[{text: 'DEIN'}, {text: 'CONTENT'}], [{text: 'VIELLEICHT'}, {text: 'SCHON.'}]]}
            enterStart={bTextStart}
            stagger={4}
            wordDuration={13}
            exitStart={bSwipeStart}
            exitStagger={3}
            exitDuration={12}
            fontSize={68}
            rowHeight={86}
            width={880}
            maxBlur={22}
            style={{marginTop: -30}}
          />

          {[
            {x: -350, y: -460, rot: -6, delay: 0, label: '327 Views'},
            {x: 300, y: -360, rot: 5, delay: 4, label: '0 Shares'},
            {x: -330, y: 360, rot: 4, delay: 8, label: 'Skip →'},
            {x: 320, y: 440, rot: -5, delay: 12, label: '2 Likes'},
            {x: 0, y: 560, rot: 2, delay: 16, label: '„Schon wieder?“'},
          ].map((card, i) => (
            <SpringCard
              key={i}
              frame={frame}
              fps={fps}
              enterStart={bCardsStart + card.delay}
              fromX={card.x * 0.15}
              fromY={70}
              rotateFrom={card.rot * 3}
              restRotate={card.rot}
              width={230}
              height={72}
              swipeProgress={swipeProgress}
              swipeDelay={i * 0.06}
              swipeDirection={i % 2 === 0 ? -1 : 1}
              style={{left: '50%', top: '50%', marginLeft: card.x - 115, marginTop: card.y - 36}}
            >
              <SignalChip label={card.label} accent={card.label.includes('Skip')} />
            </SpringCard>
          ))}
        </AbsoluteFill>

        {/* ================= SEQUENCE C ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 64}}>
            <LogoReveal frame={frame} fps={fps} start={cLogoStart} width={420} exitStart={dKickerStart - 8} />
            <CWiggleWrap frame={frame} wiggleStart={cWegswiptWiggleStart}>
              <KineticSentence
                frame={frame}
                fps={fps}
                lines={[
                  [{text: 'WIR'}, {text: 'MACHEN'}, {text: 'CONTENT,'}],
                  [{text: 'DEN'}, {text: 'MAN'}, {text: 'NICHT'}],
                  [{text: 'WEGSWIPT.', emphasis: true}],
                ]}
                enterStart={cTextStart}
                stagger={4}
                wordDuration={13}
                exitStart={dKickerStart - 4}
                exitStagger={3}
                exitDuration={10}
                fontSize={52}
                rowHeight={68}
                width={820}
                maxBlur={18}
              />
            </CWiggleWrap>
          </div>
        </AbsoluteFill>

        {/* ================= SEQUENCE D ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%'}}>
            <Kicker frame={frame} start={dKickerStart} exitStart={eChainStart - 12} text="WAS WIR MACHEN" />
            <ServiceScroller
              frame={frame}
              fps={fps}
              start={dScrollerStart}
              services={[
                {label: 'CONTENT', kind: 'content'},
                {label: 'STRATEGIE', kind: 'strategy'},
                {label: 'SOCIAL MEDIA', kind: 'social'},
                {label: 'CREATOR', kind: 'creator'},
              ]}
            />
          </div>
        </AbsoluteFill>

        {/* ================= SEQUENCE E ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 70}}>
            <ProcessChain
              frame={frame}
              fps={fps}
              start={eChainStart}
              fontSize={92}
              words={[
                {text: 'IDEA'},
                {text: 'SHOOT'},
                {text: 'EDIT'},
                {text: 'POST'},
                {text: 'GROW', emphasis: true},
              ]}
            />
            <MetricLaunch frame={frame} fps={fps} launchStart={eLaunchStart} launchEnd={eLaunchEnd}>
              <MetricCounter frame={frame} fps={fps} start={eMetricStart} values={['3K', '12K', '47K', '100K+']} fontSize={132} />
            </MetricLaunch>
          </div>
        </AbsoluteFill>

        {/* ================= SEQUENCE F ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <HeroCollapse frame={frame} exitStart={fExitStart} exitEnd={gLogoStart + 6}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                transform: `scale(${breathe(frame, 0.01, 0.4, 0)})`,
              }}
            >
              <KineticSentence
                frame={frame}
                fps={fps}
                lines={[[{text: 'FALL'}, {text: 'AUF.'}]]}
                enterStart={fLine1Start}
                stagger={5}
                wordDuration={15}
                fontSize={116}
                rowHeight={128}
                width={1000}
                maxBlur={30}
              />
              <KineticSentence
                frame={frame}
                fps={fps}
                lines={[[{text: 'NICHT', color: BRAND.red}, {text: 'DURCH.', emphasis: true}]]}
                enterStart={fLine2Start}
                stagger={5}
                wordDuration={15}
                fontSize={116}
                rowHeight={128}
                width={1000}
                maxBlur={30}
              />
            </div>
          </HeroCollapse>
        </AbsoluteFill>

        {/* ================= SEQUENCE G ================= */}
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 30}}>
            <LogoReveal frame={frame} fps={fps} start={gLogoStart} width={400} style={{transform: `scale(${breathe(frame, 0.008, 0.3, Math.PI)})`}} />
            <div style={{marginTop: 10}}>
              <KineticSentence
                frame={frame}
                fps={fps}
                lines={[[{text: 'CONTENT,'}, {text: 'DER'}, {text: 'HÄNGEN'}, {text: 'BLEIBT.'}]]}
                enterStart={gTaglineStart}
                stagger={4}
                wordDuration={13}
                fontSize={36}
                rowHeight={48}
                width={700}
                maxBlur={14}
              />
            </div>
            <FadeUp frame={frame} start={gUrlStart} dur={12}>
              <div style={{fontFamily: MONO, fontSize: 22, letterSpacing: 2, color: BRAND.muted}}>offscript.ch</div>
            </FadeUp>
            <div style={{marginTop: 26}}>
              <FadeUp frame={frame} start={gCtaStart} dur={12}>
                <CTAArrow frame={frame} start={gCtaStart + 12} />
              </FadeUp>
            </div>
          </div>
        </AbsoluteFill>
      </div>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Small local helpers — each a pure function of frame, none reused from any
// earlier composition.
// ---------------------------------------------------------------------------

const Kicker: React.FC<{frame: number; start: number; exitStart: number; text: string}> = ({frame, start, exitStart, text}) => {
  const enterP = Math.min(Math.max((frame - start) / 14, 0), 1);
  const exitP = Math.min(Math.max((frame - exitStart) / 12, 0), 1);
  const y = interpolate(enterP, [0, 1], [24, 0]) - interpolate(exitP, [0, 1], [0, 18]);
  const opacity = enterP * (1 - exitP);
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 22,
        fontWeight: 600,
        letterSpacing: 5,
        color: BRAND.red,
        opacity,
        transform: `translateY(${y}px)`,
        marginBottom: 34,
      }}
    >
      {text}
    </div>
  );
};

const FadeUp: React.FC<{frame: number; start: number; dur: number; children: React.ReactNode}> = ({frame, start, dur, children}) => {
  const p = Math.min(Math.max((frame - start) / dur, 0), 1);
  return <div style={{opacity: p, transform: `translateY(${interpolate(p, [0, 1], [14, 0])}px)`}}>{children}</div>;
};

/** The "attempted swipe that springs back" micro-interaction on WEGSWIPT. —
 *  a brief horizontal pull, then a hard spring return, well after the
 *  sentence has already settled. */
const CWiggleWrap: React.FC<{frame: number; wiggleStart: number; children: React.ReactNode}> = ({frame, wiggleStart, children}) => {
  const local = frame - wiggleStart;
  const pullLen = 6;
  const pull = local >= 0 && local <= pullLen ? interpolate(local, [0, pullLen], [0, -34]) : local > pullLen ? -34 : 0;
  const back = local > pullLen ? withOvershoot(Math.min((local - pullLen) / 14, 1), -34, 0, 0.22) : 0;
  const x = local > pullLen ? back : pull;
  return <div style={{transform: `translateX(${x}px)`}}>{children}</div>;
};

/** The final metric explodes toward camera — scale + blur ramp, fading to
 *  0 right as the hero statement's own entrance takes over. This motion IS
 *  the transition; nothing fades to black in between. */
const MetricLaunch: React.FC<{frame: number; fps: number; launchStart: number; launchEnd: number; children: React.ReactNode}> = ({
  frame,
  launchStart,
  launchEnd,
  children,
}) => {
  const p = interpolate(frame, [launchStart, launchEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(p, [0, 1], [1, 3.4]);
  const blur = interpolate(p, [0, 1], [0, 34]);
  const opacity = interpolate(p, [0, 1], [1, 0]);
  return (
    <div style={{transform: `scale(${scale})`, filter: blur ? `blur(${blur}px)` : undefined, opacity}}>{children}</div>
  );
};

/** The hero statement collapses smoothly toward center — that collapse
 *  motion is what becomes the closing logo's entrance. */
const HeroCollapse: React.FC<{frame: number; exitStart: number; exitEnd: number; children: React.ReactNode}> = ({
  frame,
  exitStart,
  exitEnd,
  children,
}) => {
  const p = interpolate(frame, [exitStart, exitEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(p, [0, 1], [1, 0.22]);
  const blur = interpolate(p, [0, 0.7, 1], [0, 10, 26]);
  const opacity = interpolate(p, [0, 0.85, 1], [1, 1, 0]);
  return (
    <div style={{transform: `scale(${scale})`, filter: blur ? `blur(${blur}px)` : undefined, opacity}}>{children}</div>
  );
};
