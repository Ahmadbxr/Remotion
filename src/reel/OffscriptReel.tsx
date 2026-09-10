import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, FONT} from './theme';
import {springProgress, withOvershoot, TEXT, IMPACT, SETTLE} from './motion/springs';
import {easeProgress, easeOutExpo, easeOutCubic, easeInExpo, easeInCubic, easeInOutCubic} from './motion/easings';
import {motionBlur, velocityStretch} from './motion/velocity';
import {KineticWord, KineticPhrase} from './components/Kinetic';
import {SocialMetric} from './components/SocialMetric';
import {ServiceMachine} from './components/ServiceMachine';
import {ProcessChain} from './components/ProcessChain';
import {MetricRoller} from './components/MetricRoller';
import {LogoReveal} from './components/LogoReveal';
import {CTAArrow} from './components/CTA';
import {GraphicLine, MetaLabel} from './components/Motifs';

// ---------------------------------------------------------------------------
// ONE 20-second movement. At every boundary the question is "what visual
// element from the previous beat CREATES the next one?" — and the answer is
// always a specific object, never "the scene changes":
//
//   HOOK -> PROBLEM     LANGWEILIG.'s own red field floods the frame and
//                       recedes to uncover the next screen.
//   PROBLEM -> OFFSCRIPT the leftward swipe carries the UI off and the
//                       sheets under it peel away to expose the logo.
//   OFFSCRIPT -> SERVICES the logo collapses into a single point and the
//                       services rail draws itself downward from it.
//   SERVICES -> PROCESS the surface keeps scrolling past its last row, and
//                       the chain starts inside that same exit motion.
//   PROCESS -> HERO     the counter explodes toward camera; the hero
//                       statement resolves out of that same blur.
//   HERO -> LOGO        the statement compresses to one point under heavy
//                       blur and the logo is swapped in inside the blur.
// ---------------------------------------------------------------------------

const breathe = (frame: number, amp = 0.01, freq = 0.4, phase = 0) =>
  1 + Math.sin((frame / 30) * freq * Math.PI * 2 + phase) * amp;

// LANGWEILIG.'s own box — the red field is seeded from exactly these bounds.
const LW_L = 40;
const LW_T = 690;
const LW_W = 940;
const LW_H = 130;

export const OffscriptReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // =========================================================================
  // BEAT 1 — HOOK. Oversized type, already mid-flight at frame 0, bleeding
  // past both viewport edges. Decisive bezier arrivals (camera-like), with
  // the spring reserved for LANGWEILIG.'s physical impact.
  // =========================================================================
  const b1DeineStart = -4;
  const b1MarkeStart = 2;
  const b1IstNichtStart = 18;
  const b1ImpactStart = 32;
  const b1ImpactDur = 14;
  const b1ImpactHit = b1ImpactStart + b1ImpactDur * 0.62;

  const b1BoxIn = easeProgress(frame, 46, 50, easeOutCubic); // the word's own red field lights up
  const b1BoxSX = interpolate(easeProgress(frame, 47, 56, easeInCubic), [0, 1], [1, 1.5]);
  const b1BoxSY = interpolate(easeProgress(frame, 50, 62, easeInCubic), [0, 1], [1, 19]);
  const b1Consumed = easeProgress(frame, 46, 58, easeInOutCubic); // the rest of the type is swallowed by the red
  const b1LwFade = easeProgress(frame, 58, 66, easeInOutCubic);
  const b1RecedeP = easeProgress(frame, 66, 80, easeInOutCubic);
  const b1BoxY = interpolate(b1RecedeP, [0, 1], [0, -2500]);
  const b1BoxOn = b1BoxIn > 0.002 && b1RecedeP < 0.999;

  // The shockwave every settled word takes when LANGWEILIG. lands.
  const kickT = frame - b1ImpactHit;
  const kickAmt = kickT >= 0 && kickT <= 10 ? Math.sin((kickT / 10) * Math.PI) * 12 : 0;
  const anticT = b1ImpactHit - 6 - frame;
  const anticAmt = anticT >= 0 && anticT <= 6 ? Math.sin((anticT / 6) * Math.PI) * 0.03 : 0;

  // =========================================================================
  // BEAT 2 — THE PROBLEM. One headline, one secondary metric attached to it
  // by a red tick, two tertiary signals that physically interact.
  // =========================================================================
  const b2TextStart = 68;
  const b2TickStart = 96;
  const b2MetricsStart = 86;
  const b2AnticStart = 128;
  const b2SwipeStart = 134;
  const b2SwipeDur = 16;
  const anticX = interpolate(easeProgress(frame, b2AnticStart, b2SwipeStart, easeInOutCubic), [0, 1], [0, 16]);
  const swipeProgress = interpolate(frame, [b2SwipeStart, b2SwipeStart + b2SwipeDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const skipTravelStart = 104;
  const skipTravelDur = 16;
  const skipEnterP = easeProgress(frame, b2MetricsStart + 8, b2MetricsStart + 16, easeOutExpo);
  const skipP = easeProgress(frame, skipTravelStart, skipTravelStart + skipTravelDur, easeInOutCubic);
  const skipX = interpolate(skipP, [0, 1], [0, 900]);
  // SKIP physically reaches 0 SHARES at ~60% of its travel and knocks it.
  const collideT = frame - (skipTravelStart + skipTravelDur * 0.6);
  const collideKick = collideT >= 0 && collideT <= 9 ? Math.sin((collideT / 9) * Math.PI) : 0;

  // =========================================================================
  // BEAT 3 — OFFSCRIPT REVEAL + the WEGSWIPT resist.
  // =========================================================================
  const b3SheetsStart = b2SwipeStart + 4;
  const b3LogoStart = 144;
  const b3LogoExit = 196;
  const b3TextStart = 156;
  const b3TextExit = 200;
  const b3HitStart = 178; // the invisible swipe force lands here

  // =========================================================================
  // BEAT 4 — SERVICES, one continuous surface.
  // =========================================================================
  // The rail draws, and the surface is already rising into frame, WHILE
  // beat 3's text is still leaving — otherwise there are dead frames at the
  // boundary where one beat has gone and the next has not arrived.
  const b4RailGrow = 202;
  const b4AnchorStart = 202;
  const b4MachineStart = 218;
  const b4Slot = 25;
  const b4AnchorExit = 316;

  // =========================================================================
  // BEAT 5 — THE MACHINE.
  // =========================================================================
  const b5ChainStart = 312;
  const b5MetricStart = b5ChainStart + 78;
  const b5RollDur = 20;
  const b5LaunchStart = b5MetricStart + 30;
  const b5LaunchEnd = b5LaunchStart + 14;

  // =========================================================================
  // BEAT 6 — HERO. Its entrance starts at the launch's PEAK velocity, not
  // after it — otherwise the counter is still sitting there while the
  // headline arrives and the two read as separate events instead of one.
  // =========================================================================
  const b6Line1Start = b5LaunchStart + 10;
  const b6AnticStart = b6Line1Start + 22;
  const b6Line2Start = b6AnticStart + 6;
  const b6ExitStart = 492;
  const b6ExitEnd = 506;

  // =========================================================================
  // BEAT 7 — CTA.
  // =========================================================================
  const b7LogoStart = 502;
  const b7TaglineStart = 520;
  const b7UrlStart = 537;
  const b7CtaStart = 548;

  // =========================================================================
  // SOUND — sparse accents only, on the moments that carry weight.
  // =========================================================================
  type Cue = {frame: number; file: string; volume: number};
  const cues: Cue[] = [
    {frame: Math.round(b1ImpactHit), file: 'icon-lock.wav', volume: 0.7},
    {frame: 46, file: 'morph-tone.wav', volume: 0.45},
    {frame: b2SwipeStart, file: 'scroll-air.wav', volume: 0.6},
    {frame: b3LogoStart, file: 'offscript-signature.wav', volume: 0.85},
    {frame: b3HitStart, file: 'flip-air.wav', volume: 0.45},
    {frame: b4MachineStart, file: 'icon-lock.wav', volume: 0.3},
    {frame: b4MachineStart + b4Slot, file: 'icon-lock.wav', volume: 0.3},
    {frame: b4MachineStart + b4Slot * 2, file: 'icon-lock.wav', volume: 0.3},
    {frame: b4MachineStart + b4Slot * 3, file: 'icon-lock.wav', volume: 0.3},
    {frame: b5ChainStart + 22, file: 'flip-air.wav', volume: 0.3},
    {frame: b5ChainStart + 66, file: 'icon-lock.wav', volume: 0.4},
    {frame: b5MetricStart + b5RollDur, file: 'metric-pulse-3.wav', volume: 0.55},
    {frame: b6Line1Start, file: 'morph-tone.wav', volume: 0.3},
    {frame: Math.round(b6Line2Start + 18 * 0.62), file: 'offscript-signature.wav', volume: 0.5},
    {frame: b7LogoStart, file: 'soft-settle.wav', volume: 0.45},
    {frame: b7CtaStart + 6, file: 'icon-lock.wav', volume: 0.18},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: BRAND.background, overflow: 'hidden'}}>
      {cues.map((cue, i) => (
        <Sequence key={i} from={Math.max(cue.frame, 0)} layout="none">
          <Audio src={staticFile(`sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* ================= BEAT 1 — HOOK =================
          The red field sits UNDER the type so LANGWEILIG. stays readable on
          top of it while it floods — that is what makes the transition read
          as caused by the word instead of as a flash cutting across it. */}
      {b1BoxOn && (
        <div
          style={{
            position: 'absolute',
            left: LW_L,
            top: LW_T,
            width: LW_W,
            height: LW_H,
            background: BRAND.red,
            opacity: b1BoxIn,
            transform: `translateY(${b1BoxY}px) scale(${b1BoxSX}, ${b1BoxSY})`,
            transformOrigin: '50% 50%',
          }}
        />
      )}

      <div style={{opacity: 1 - b1Consumed}}>
        <HookWord frame={frame} text="DEINE" start={b1DeineStart} dur={13} fromY={280} fromScale={1.18} fontSize={236} left={-46} top={250} extraY={kickAmt} extraScale={1 - anticAmt} />
        <HookWord frame={frame} text="MARKE" start={b1MarkeStart} dur={14} fromY={90} fromX={230} fromScale={1.14} fontSize={236} left={300} top={440} extraY={kickAmt} extraScale={1 - anticAmt} />
        <div style={{position: 'absolute', left: 74, top: 640, transform: `translateY(${kickAmt * 0.45}px)`}}>
          <KineticWord text="IST NICHT" frame={frame} fps={fps} enterStart={b1IstNichtStart} enterDur={11} fontSize={42} fontWeight={700} color={BRAND.muted} fromY={26} transformOrigin="0% 100%" />
        </div>
      </div>

      {/* LANGWEILIG. — red on the page, white once its own field is behind
          it, then faded away while the field holds full-frame. */}
      <div style={{position: 'absolute', left: 64, top: 700, opacity: 1 - b1LwFade}}>
        <KineticWord
          text="LANGWEILIG."
          frame={frame}
          fps={fps}
          enterStart={b1ImpactStart}
          enterDur={b1ImpactDur}
          fontSize={122}
          color={BRAND.red}
          impact
          tilt
          scaleFrom={0.68}
          transformOrigin="0% 50%"
          maxBlur={32}
        />
        <div style={{position: 'absolute', left: 0, top: 0, opacity: b1BoxIn}}>
          <KineticWord
            text="LANGWEILIG."
            frame={frame}
            fps={fps}
            enterStart={b1ImpactStart}
            enterDur={b1ImpactDur}
            fontSize={122}
            color="#FFFFFF"
            impact
            tilt
            scaleFrom={0.68}
            transformOrigin="0% 50%"
            maxBlur={32}
          />
        </div>
      </div>

      {/* ================= BEAT 2 — THE PROBLEM ================= */}
      <div style={{position: 'absolute', left: 72, top: 618, width: 960}}>
        <KineticPhrase
          words={[{text: 'DEIN'}, {text: 'CONTENT'}]}
          frame={frame}
          fps={fps}
          enterStart={b2TextStart}
          exitStart={b2SwipeStart}
          fontSize={76}
          align="left"
          style={{justifyContent: 'flex-start'}}
        />
        <div style={{marginTop: 4}}>
          <KineticPhrase
            words={[{text: 'VIELLEICHT'}, {text: 'SCHON.'}]}
            frame={frame}
            fps={fps}
            enterStart={b2TextStart + 5}
            exitStart={b2SwipeStart}
            fontSize={76}
            align="left"
            style={{justifyContent: 'flex-start'}}
          />
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, transform: `translateX(${anticX}px)`}}>
        {/* The tick that physically attaches the metric to the headline. */}
        <GraphicLine
          orientation="v"
          length={46}
          thickness={3}
          progress={easeProgress(frame, b2TickStart, b2TickStart + 9, easeOutExpo) * (1 - swipeProgress)}
          origin="start"
          style={{position: 'absolute', left: 76, top: 792}}
        />
        <SocialMetric
          frame={frame}
          fps={fps}
          enterStart={b2MetricsStart}
          x={76}
          y={848}
          rotate={-2}
          depth={1}
          size={40}
          label="327 VIEWS"
          child="+12/min"
          swipeProgress={swipeProgress}
          swipeDelay={0}
          swipeDirection={-1}
        />
        <div style={{transform: `translate(${collideKick * 46}px, ${collideKick * -14}px) rotate(${collideKick * 7}deg)`, transformOrigin: '50% 50%'}}>
          <SocialMetric
            frame={frame}
            fps={fps}
            enterStart={b2MetricsStart + 6}
            x={640}
            y={982}
            rotate={3}
            depth={0.72}
            size={30}
            label="0 SHARES"
            swipeProgress={swipeProgress}
            swipeDelay={0.06}
            swipeDirection={-1}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 60 + skipX,
            top: 986,
            opacity: skipEnterP * (1 - swipeProgress),
            transform: `rotate(${-skipP * 5}deg)`,
            filter: skipP > 0 && skipP < 1 ? `blur(${motionBlur(skipX - interpolate(easeProgress(frame - 1, skipTravelStart, skipTravelStart + skipTravelDur, easeInOutCubic), [0, 1], [0, 900]), 80, 12)}px)` : undefined,
          }}
        >
          <MetaLabel text="SKIP →" color={BRAND.red} style={{fontSize: 30}} />
        </div>
      </div>

      {/* ================= BEAT 3 — OFFSCRIPT REVEAL ================= */}
      <B3Sheets frame={frame} start={b3SheetsStart} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56}}>
          {/* The logo collapses toward the rail's origin — it BECOMES the
              services rail rather than fading out near it. */}
          <B3LogoCollapse frame={frame} exitStart={b3LogoExit}>
            <LogoReveal frame={frame} fps={fps} start={b3LogoStart} width={380} />
          </B3LogoCollapse>

          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <SwipeReact frame={frame} hitStart={b3HitStart} amount={0.1}>
              <KineticPhrase
                words={[{text: 'WIR'}, {text: 'MACHEN'}, {text: 'CONTENT,'}]}
                frame={frame}
                fps={fps}
                enterStart={b3TextStart}
                exitStart={b3TextExit}
                fontSize={52}
                align="center"
              />
            </SwipeReact>
            <div style={{marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 14}}>
              <SwipeReact frame={frame} hitStart={b3HitStart} amount={0.14} delay={2}>
                <KineticPhrase
                  words={[{text: 'DEN'}, {text: 'MAN'}, {text: 'NICHT'}]}
                  frame={frame}
                  fps={fps}
                  enterStart={b3TextStart + 4}
                  exitStart={b3TextExit}
                  fontSize={52}
                  align="center"
                />
              </SwipeReact>
              {/* The word that resists. */}
              <SwipeResist frame={frame} fps={fps} hitStart={b3HitStart}>
                <KineticWord
                  text="WEGSWIPT."
                  frame={frame}
                  fps={fps}
                  enterStart={b3TextStart + 10}
                  exitStart={b3TextExit}
                  fontSize={52}
                  color={BRAND.red}
                  impact
                  transformOrigin="50% 100%"
                />
              </SwipeResist>
            </div>
          </div>
        </div>
      </AbsoluteFill>
      <SwipeStreak frame={frame} hitStart={b3HitStart} />

      {/* ================= BEAT 4 — SERVICES ================= */}
      <div style={{position: 'absolute', left: 72, top: 556}}>
        <B4Anchor frame={frame} start={b4AnchorStart} exitStart={b4AnchorExit} />
      </div>
      <div style={{position: 'absolute', left: 72, top: 620}}>
        <ServiceMachine
          frame={frame}
          start={b4MachineStart}
          slot={b4Slot}
          hold={14}
          moveDur={11}
          rowHeight={250}
          width={940}
          fontSize={132}
          railGrowStart={b4RailGrow}
          services={[
            {label: 'CONTENT', kind: 'content'},
            {label: 'STRATEGIE', kind: 'strategy'},
            {label: 'SOCIAL', kind: 'social'},
            {label: 'CREATOR', kind: 'creator'},
          ]}
        />
      </div>

      {/* ================= BEAT 5 — THE MACHINE ================= */}
      <div style={{position: 'absolute', left: 72, top: 812}}>
        <ProcessChain frame={frame} start={b5ChainStart} fontSize={80} growExitStart={b5LaunchStart} />
      </div>
      {/* The roller sits in the same band the hero statement resolves into,
          so the explosion and the headline are one continuous mass rather
          than two things in two places. */}
      <B5MetricLaunch frame={frame} launchStart={b5LaunchStart} launchEnd={b5LaunchEnd}>
        <div style={{position: 'absolute', left: 72, top: 884}}>
          <MetricRoller frame={frame} fps={fps} start={b5MetricStart} duration={b5RollDur} values={['3K', '12K', '47K', '100K+']} fontSize={148} />
        </div>
      </B5MetricLaunch>

      {/* ================= BEAT 6 — HERO ================= */}
      <B6Collapse frame={frame} exitStart={b6ExitStart} exitEnd={b6ExitEnd}>
        <div style={{position: 'absolute', left: 72, top: 840, transform: `scale(${breathe(frame)})`}}>
          <B6Antic frame={frame} anticStart={b6AnticStart} pushStart={b6Line2Start}>
            {/* Resolves straight out of the counter's blur — a match, not an
                entrance of its own. */}
            <MatchIn frame={frame} start={b6Line1Start} dur={16}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: 124, letterSpacing: -3, color: BRAND.ink, whiteSpace: 'nowrap'}}>
                FALL AUF.
              </div>
            </MatchIn>
          </B6Antic>
          <div style={{marginTop: 4}}>
            <KineticWord
              text="NICHT DURCH."
              frame={frame}
              fps={fps}
              enterStart={b6Line2Start}
              enterDur={18}
              fontSize={124}
              color={BRAND.red}
              impact
              tilt
              fromY={80}
              transformOrigin="0% 0%"
              maxBlur={34}
            />
          </div>
        </div>
      </B6Collapse>

      {/* ================= BEAT 7 — CTA ================= */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <LogoReveal frame={frame} fps={fps} start={b7LogoStart} width={560} fromRotate={-6} fromScale={0.42} fromBlur={26} fadeIn={4} duration={18} />
          <GraphicLine
            orientation="h"
            length={54}
            progress={springProgress(frame, b7LogoStart + 14, b7LogoStart + 22, fps, SETTLE)}
            origin="center"
            style={{marginTop: 34}}
          />
          <div style={{marginTop: 30}}>
            <KineticPhrase
              words={[{text: 'CONTENT,'}, {text: 'DER'}, {text: 'HÄNGEN'}, {text: 'BLEIBT.'}]}
              frame={frame}
              fps={fps}
              enterStart={b7TaglineStart}
              fontSize={38}
              align="center"
            />
          </div>
          <div style={{marginTop: 26}}>
            <B7FadeUp frame={frame} start={b7UrlStart}>
              <MetaLabel text="offscript.ch" color={BRAND.muted} style={{fontSize: 22}} />
            </B7FadeUp>
          </div>
          <div style={{marginTop: 44}}>
            <B7FadeUp frame={frame} start={b7CtaStart}>
              <CTAArrow frame={frame} start={b7CtaStart + 6} />
            </B7FadeUp>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Per-beat helpers — each a pure function of frame.
// ---------------------------------------------------------------------------

/** An oversized hook word: decisive bezier arrival (camera-like, no spring
 *  bounce), scaling down from "close to camera", with blur measured off its
 *  own travel so it is genuinely smeared while it is genuinely fast. */
const HookWord: React.FC<{
  frame: number;
  text: string;
  start: number;
  dur: number;
  fromY?: number;
  fromX?: number;
  fromScale?: number;
  fontSize: number;
  left: number;
  top: number;
  extraY?: number;
  extraScale?: number;
}> = ({frame, text, start, dur, fromY = 0, fromX = 0, fromScale = 1, fontSize, left, top, extraY = 0, extraScale = 1}) => {
  const at = (f: number) => easeProgress(f, start, start + dur, easeOutCubic);
  const p = at(frame);
  const pPrev = at(frame - 1);
  const y = interpolate(p, [0, 1], [fromY, 0]);
  const x = interpolate(p, [0, 1], [fromX, 0]);
  const v = Math.abs(y - interpolate(pPrev, [0, 1], [fromY, 0])) + Math.abs(x - interpolate(pPrev, [0, 1], [fromX, 0]));
  const blur = motionBlur(v, fontSize * 0.34, 36);
  const stretch = velocityStretch(v, fontSize * 0.34, 0.1);
  const scale = interpolate(p, [0, 1], [fromScale, 1]) * extraScale;

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        letterSpacing: -6,
        lineHeight: 1,
        color: BRAND.ink,
        whiteSpace: 'nowrap',
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `translate(${x}px, ${y + extraY}px) scale(${scale}, ${scale * stretch})`,
        transformOrigin: '0% 50%',
      }}
    >
      {text}
    </div>
  );
};

/** Two contentless panels peeling away ahead of the real content. */
const B3Sheets: React.FC<{frame: number; start: number}> = ({frame, start}) => {
  const sheets = [
    {delay: 0, color: BRAND.surface, offset: 18},
    {delay: 3, color: '#FFFFFF', offset: -14},
  ];
  return (
    <>
      {sheets.map((s, i) => {
        if (frame < start + s.delay - 2) return null;
        const p = easeProgress(frame, start + s.delay, start + s.delay + 16, easeInExpo);
        if (p >= 0.999) return null;
        const x = interpolate(p, [0, 1], [s.offset, -900]);
        const opacity = interpolate(p, [0, 0.85, 1], [0.5, 0.4, 0]);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              width: 640,
              height: 420,
              marginLeft: -320,
              marginTop: -210 + s.offset,
              background: s.color,
              border: `1px solid ${BRAND.border}`,
              borderRadius: 24,
              opacity,
              transform: `translateX(${x}px) rotate(${interpolate(p, [0, 1], [0, -8])}deg)`,
            }}
          />
        );
      })}
    </>
  );
};

/** The logo collapses to a point at the services rail's origin — the rail
 *  then draws downward out of that same point. */
const B3LogoCollapse: React.FC<{frame: number; exitStart: number; children: React.ReactNode}> = ({frame, exitStart, children}) => {
  const p = easeProgress(frame, exitStart, exitStart + 12, easeInExpo);
  if (p >= 0.999) return null;
  // Screen-space delta from the logo's centred position to the rail origin.
  const x = interpolate(p, [0, 1], [0, -394]);
  const y = interpolate(p, [0, 1], [0, -168]);
  const scale = interpolate(p, [0, 1], [1, 0.06]);
  const blur = interpolate(p, [0, 0.6, 1], [0, 6, 16]);
  const opacity = interpolate(p, [0, 0.8, 1], [1, 0.7, 0]);
  return (
    <div style={{transform: `translate(${x}px, ${y}px) scale(${scale})`, filter: blur ? `blur(${blur}px)` : undefined, opacity}}>
      {children}
    </div>
  );
};

/** The swipe force hitting WEGSWIPT.: it is thrown sideways fast (bezier —
 *  an external force, not a spring), then the CONTENT resists and springs
 *  back with one overshoot. Blur and a matching horizontal stretch are
 *  measured from its own travel, so the smear is genuinely directional. */
const swipeResistX = (local: number) => {
  // Thrown to the RIGHT, into open space — WEGSWIPT. is the last word on
  // its line, so a leftward throw would drag it across "DEN MAN NICHT" and
  // read as a collision rather than as the word resisting a swipe.
  const THROW = 112;
  if (local < 0) return 0;
  if (local <= 5) return interpolate(easeProgress(local, 0, 5, easeInCubic), [0, 1], [0, THROW]);
  return withOvershoot(Math.min((local - 5) / 16, 1), THROW, 0, 0.22);
};

const SwipeResist: React.FC<{frame: number; fps: number; hitStart: number; children: React.ReactNode}> = ({frame, hitStart, children}) => {
  const x = swipeResistX(frame - hitStart);
  const v = x - swipeResistX(frame - hitStart - 1);
  const blur = motionBlur(v, 26, 22);
  const stretch = velocityStretch(v, 26, 0.16);
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `translateX(${x}px) scale(${stretch}, 1)`,
        filter: blur ? `blur(${blur}px)` : undefined,
        transformOrigin: '50% 50%',
      }}
    >
      {children}
    </div>
  );
};

/** Neighbouring words take a fraction of the same hit, slightly delayed —
 *  the force travels through the sentence instead of affecting one word in
 *  isolation. */
const SwipeReact: React.FC<{frame: number; hitStart: number; amount: number; delay?: number; children: React.ReactNode}> = ({
  frame,
  hitStart,
  amount,
  delay = 0,
  children,
}) => {
  const x = swipeResistX(frame - hitStart - delay) * amount;
  return <div style={{transform: `translateX(${x}px)`}}>{children}</div>;
};

/** A single fast red streak — the otherwise invisible swipe force, made
 *  visible for three frames only. */
const SwipeStreak: React.FC<{frame: number; hitStart: number}> = ({frame, hitStart}) => {
  const local = frame - hitStart;
  if (local < -2 || local > 6) return null;
  const p = easeProgress(frame, hitStart - 2, hitStart + 6, easeInOutCubic);
  const x = interpolate(p, [0, 1], [-420, 1100]); // travels WITH the throw
  const opacity = interpolate(p, [0, 0.35, 1], [0, 0.5, 0]);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: 1118, // on WEGSWIPT.'s own baseline, not floating above it
        width: 340,
        height: 3,
        background: BRAND.red,
        opacity,
        filter: 'blur(2px)',
      }}
    />
  );
};

const B4Anchor: React.FC<{frame: number; start: number; exitStart: number}> = ({frame, start, exitStart}) => {
  const enterP = easeProgress(frame, start, start + 12, easeOutExpo);
  const exitP = easeProgress(frame, exitStart, exitStart + 10, easeInExpo);
  const opacity = enterP * (1 - exitP);
  const y = interpolate(enterP, [0, 1], [16, 0]) - interpolate(exitP, [0, 1], [0, 14]);
  return (
    <div style={{opacity, transform: `translateY(${y}px)`}}>
      <MetaLabel text="OFFSCRIPT SERVICES" color={BRAND.red} />
    </div>
  );
};

/** The counter explodes toward camera — that explosion IS the transition. */
const B5MetricLaunch: React.FC<{frame: number; launchStart: number; launchEnd: number; children: React.ReactNode}> = ({
  frame,
  launchStart,
  launchEnd,
  children,
}) => {
  const p = easeProgress(frame, launchStart, launchEnd, easeInCubic);
  if (p >= 0.999) return null;
  const scale = interpolate(p, [0, 1], [1, 3.8]);
  const blur = interpolate(p, [0, 1], [0, 38]);
  const opacity = interpolate(p, [0, 0.75, 1], [1, 0.35, 0]);
  return <div style={{transform: `scale(${scale})`, transformOrigin: '10% 50%', filter: blur ? `blur(${blur}px)` : undefined, opacity}}>{children}</div>;
};

/** Resolves out of an oversized blur — the receiving half of a match cut. */
const MatchIn: React.FC<{frame: number; start: number; dur: number; children: React.ReactNode}> = ({frame, start, dur, children}) => {
  const p = easeProgress(frame, start, start + dur, easeOutExpo);
  const scale = interpolate(p, [0, 1], [2.4, 1]);
  const blur = interpolate(p, [0, 0.55, 1], [30, 6, 0]);
  const opacity = interpolate(p, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{transform: `scale(${scale})`, transformOrigin: '0% 50%', filter: blur ? `blur(${blur}px)` : undefined, opacity}}>
      {children}
    </div>
  );
};

/** FALL AUF. lifts in anticipation, then is pushed further by NICHT DURCH.
 *  landing underneath it. */
const B6Antic: React.FC<{frame: number; anticStart: number; pushStart: number; children: React.ReactNode}> = ({
  frame,
  anticStart,
  pushStart,
  children,
}) => {
  const anticP = easeProgress(frame, anticStart, anticStart + 6, easeInOutCubic);
  const pushT = frame - (pushStart + 18 * 0.62);
  const pushKick = pushT >= 0 && pushT <= 8 ? Math.sin((pushT / 8) * Math.PI) * 12 : 0;
  const y = interpolate(anticP, [0, 1], [0, -9]) - pushKick;
  return <div style={{transform: `translateY(${y}px)`}}>{children}</div>;
};

/** The hero statement compresses to a single point under rising blur, and
 *  is fully gone before the logo is legible — the swap happens inside the
 *  blur, with zero frames of readable text behind the logo. */
const B6Collapse: React.FC<{frame: number; exitStart: number; exitEnd: number; children: React.ReactNode}> = ({
  frame,
  exitStart,
  exitEnd,
  children,
}) => {
  const p = easeProgress(frame, exitStart, exitEnd, easeInCubic);
  if (p >= 0.999) return null;
  const scale = interpolate(p, [0, 1], [1, 0.1]);
  const rotate = interpolate(p, [0, 1], [0, -6]);
  // Converge on the LOGO's centre, not the statement's own — the two lines
  // compress to exactly the point the logo resolves at, which is what makes
  // it read as a transformation instead of a swap.
  const y = interpolate(p, [0, 1], [0, -132]);
  const blur = interpolate(p, [0, 0.4, 0.66], [0, 14, 32], {extrapolateRight: 'clamp'});
  const opacity = interpolate(p, [0, 0.45, 0.66], [1, 0.8, 0], {extrapolateRight: 'clamp'});
  return (
    <div
      style={{
        transform: `translateY(${y}px) rotate(${rotate}deg) scale(${scale})`,
        transformOrigin: '50% 50%',
        filter: blur ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

const B7FadeUp: React.FC<{frame: number; start: number; children: React.ReactNode}> = ({frame, start, children}) => {
  const p = springProgress(frame, start, start + 12, 30, TEXT);
  return <div style={{opacity: p, transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`}}>{children}</div>;
};
