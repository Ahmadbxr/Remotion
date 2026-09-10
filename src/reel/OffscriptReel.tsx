import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND} from './theme';
import {springProgress, withOvershoot, TEXT, SETTLE} from './motion/springs';
import {easeProgress, easeOutExpo, easeInExpo, easeInOutCubic} from './motion/easings';
import {motionBlur} from './motion/velocity';
import {KineticWord, KineticPhrase} from './components/Kinetic';
import {MaskReveal} from './components/MaskReveal';
import {SocialMetric} from './components/SocialMetric';
import {ServiceMachine} from './components/ServiceMachine';
import {ProcessChain} from './components/ProcessChain';
import {MetricRoller} from './components/MetricRoller';
import {LogoReveal} from './components/LogoReveal';
import {CTAArrow} from './components/CTA';
import {GraphicLine, MetaLabel} from './components/Motifs';

// ---------------------------------------------------------------------------
// ONE 20-second movement, not seven scenes. Every beat below either grows
// directly out of the previous beat's own exit motion (a match by
// direction/velocity) or is revealed BY it (a wipe, a swipe, a clearing) —
// nothing fades to an empty frame and then fades something else in.
// ---------------------------------------------------------------------------

const breathe = (frame: number, amp = 0.01, freq = 0.4, phase = 0) =>
  1 + Math.sin((frame / 30) * freq * Math.PI * 2 + phase) * amp;

export const OffscriptReel: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();

  // =========================================================================
  // BEAT 1 — HOOK (0-75): already in motion at frame 0.
  // =========================================================================
  const b1DeineStart = -4;
  const b1MarkeStart = 6;
  const b1IstNichtStart = 22;
  const b1ImpactStart = 34;
  const b1ImpactDur = 15;
  const b1ImpactHit = b1ImpactStart + b1ImpactDur * 0.62;
  const b1WipeStart = Math.round(b1ImpactHit) + 6;
  const b1WipeCoverEnd = b1WipeStart + 11;
  const b1WipeRecedeStart = b1WipeCoverEnd + 5;
  const b1WipeRecedeEnd = 75;

  const wipeCoverP = easeProgress(frame, b1WipeStart, b1WipeCoverEnd, easeInExpo);
  const wipeRecedeP = easeProgress(frame, b1WipeRecedeStart, b1WipeRecedeEnd, easeOutExpo);
  // The panel is pre-sized to the FULL frame and scales from a near-zero
  // seed (at LANGWEILIG.'s own position) up to 1 — not a small box scaled
  // by a few x, which could never cover 1080x1920 from a 60px seed.
  const wipeScale = interpolate(wipeCoverP, [0, 1], [0.02, 1]);
  const wipeOpacity = wipeCoverP * (1 - interpolate(wipeRecedeP, [0, 0.7, 1], [0, 0.15, 1]));
  const wipeY = interpolate(wipeRecedeP, [0, 1], [0, -2300]);

  // The shared impact "kick" every earlier word gets the instant LANGWEILIG
  // lands — one shockwave, not independent per-word reactions.
  const kickT = frame - b1ImpactHit;
  const kickAmt = kickT >= 0 && kickT <= 10 ? Math.sin((kickT / 10) * Math.PI) * 10 : 0;
  // A tiny anticipation compress on the settled words right before impact.
  const anticT = b1ImpactHit - 6 - frame;
  const anticAmt = anticT >= 0 && anticT <= 6 ? Math.sin((anticT / 6) * Math.PI) * 0.03 : 0;

  // =========================================================================
  // BEAT 2 — THE PROBLEM (75-150)
  // =========================================================================
  const b2TextStart = 60;
  const b2MetricsStart = 80;
  const b2AnticStart = 128;
  const b2SwipeStart = 134;
  const b2SwipeDur = 16;
  const anticP = easeProgress(frame, b2AnticStart, b2SwipeStart, easeInOutCubic);
  const anticX = interpolate(anticP, [0, 1], [0, 14]); // opposite the swipe direction (swipe goes left)
  const swipeProgress = interpolate(frame, [b2SwipeStart, b2SwipeStart + b2SwipeDur], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  // SKIP -> physically travels across frame; when its position crosses
  // "0 SHARES" that chip gets a small reactive nudge — an approximated
  // collision, not two independently-timed animations.
  const skipTravelStart = 100;
  const skipTravelDur = 14;
  const skipEnterP = easeProgress(frame, b2MetricsStart + 7, b2MetricsStart + 15, easeOutExpo);
  const skipP = easeProgress(frame, skipTravelStart, skipTravelStart + skipTravelDur, easeInOutCubic);
  const skipX = interpolate(skipP, [0, 1], [-40, 340]);
  const collideT = frame - (skipTravelStart + skipTravelDur * 0.55);
  const collideKick = collideT >= 0 && collideT <= 8 ? Math.sin((collideT / 8) * Math.PI) * 12 : 0;

  // =========================================================================
  // BEAT 3 — OFFSCRIPT REVEAL (150-210)
  // =========================================================================
  const b3LogoStart = 148;
  const b3LogoExit = 200;
  const b3TextStart = 164;
  const b3TextExit = 204;
  const b3WiggleStart = 199;
  // The "stacked sheets" peeling away — two plain panels, no content,
  // sliding off just ahead of the real content, cheaply suggesting layers.
  const b3SheetsStart = b2SwipeStart + 4;

  // =========================================================================
  // BEAT 4 — SERVICES (210-330)
  // =========================================================================
  const b4AnchorStart = 202;
  const b4AnchorExit = 316;
  const b4MachineStart = 212;

  // =========================================================================
  // BEAT 5 — ENGINE (330-420)
  // =========================================================================
  const b5ChainStart = 322;
  const b5MetricStart = b5ChainStart + 90; // overlaps GROW's own fade-out
  const b5LaunchStart = b5MetricStart + 22;
  const b5LaunchEnd = b5LaunchStart + 20;

  // =========================================================================
  // BEAT 6 — HERO (420-510)
  // =========================================================================
  const b6Line1Start = b5LaunchStart + 6; // rises directly out of the counter's own launch
  const b6AnticStart = b6Line1Start + 20;
  const b6Line2Start = b6AnticStart + 6;
  const b6ExitStart = 495;
  const b6ExitEnd = 515;

  // =========================================================================
  // BEAT 7 — CTA (510-600)
  // =========================================================================
  const b7LogoStart = 505;
  const b7TaglineStart = 524;
  const b7UrlStart = 542;
  const b7CtaStart = 554;

  // =========================================================================
  // SOUND — sparse rhythm accents only, reusing the project's synthesized
  // library as audio assets, retimed to this rebuild's own event schedule.
  // =========================================================================
  type Cue = {frame: number; file: string; volume: number};
  const cues: Cue[] = [
    {frame: Math.round(b1ImpactHit), file: 'icon-lock.wav', volume: 0.7},
    {frame: b1WipeStart, file: 'morph-tone.wav', volume: 0.4},
    {frame: b2SwipeStart, file: 'scroll-air.wav', volume: 0.6},
    {frame: b3LogoStart, file: 'offscript-signature.wav', volume: 0.85},
    {frame: b3WiggleStart, file: 'flip-air.wav', volume: 0.35},
    {frame: b4MachineStart + 13, file: 'icon-lock.wav', volume: 0.3},
    {frame: b4MachineStart + 43, file: 'icon-lock.wav', volume: 0.3},
    {frame: b4MachineStart + 73, file: 'icon-lock.wav', volume: 0.3},
    {frame: b4MachineStart + 103, file: 'icon-lock.wav', volume: 0.3},
    {frame: b5ChainStart + 20, file: 'flip-air.wav', volume: 0.3}, // SHOOT delivered
    {frame: b5ChainStart + 76, file: 'icon-lock.wav', volume: 0.4}, // GROW lands
    {frame: b5MetricStart + 20, file: 'metric-pulse-3.wav', volume: 0.55},
    {frame: b6Line1Start, file: 'morph-tone.wav', volume: 0.3},
    {frame: Math.round(b6Line2Start + 15 * 0.62), file: 'offscript-signature.wav', volume: 0.5},
    {frame: b7LogoStart, file: 'soft-settle.wav', volume: 0.45},
    {frame: b7CtaStart + 4, file: 'icon-lock.wav', volume: 0.18},
  ];

  return (
    <AbsoluteFill style={{backgroundColor: BRAND.background, overflow: 'hidden'}}>
      {cues.map((cue, i) => (
        <Sequence key={i} from={Math.max(cue.frame, 0)} layout="none">
          <Audio src={staticFile(`sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}

      {/* ================= BEAT 1 — HOOK =================
          Everything here is hidden behind the red wipe once it fully
          covers the frame (wipeCoverP -> 1) and STAYS hidden — the wipe
          only recedes to reveal Beat 2 underneath, never this. Without this
          wrapper these words would sit at full opacity forever, the exact
          "forgot the exit" bug class this project has hit before. */}
      <div style={{opacity: 1 - wipeCoverP}}>
        <MaskReveal width={936} height={230} style={{position: 'absolute', left: 72, top: 250}}>
          <B1Line frame={frame} fps={fps} deineStart={b1DeineStart} markeStart={b1MarkeStart} kickAmt={kickAmt} anticAmt={anticAmt} />
        </MaskReveal>
        <div style={{position: 'absolute', left: 72, top: 512, transform: `translateY(${kickAmt * 0.5}px)`}}>
          <KineticWord text="IST NICHT" frame={frame} fps={fps} enterStart={b1IstNichtStart} fontSize={38} fontWeight={700} color={BRAND.muted} fromY={30} transformOrigin="0% 100%" />
        </div>
        <div style={{position: 'absolute', left: 72, top: 580}}>
          <KineticWord
            text="LANGWEILIG."
            frame={frame}
            fps={fps}
            enterStart={b1ImpactStart}
            enterDur={b1ImpactDur}
            fontSize={104}
            color={BRAND.red}
            impact
            tilt
            scaleFrom={0.7}
            transformOrigin="0% 50%"
            maxBlur={30}
          />
        </div>
      </div>
      {wipeOpacity > 0.002 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: BRAND.red,
            opacity: wipeOpacity,
            transform: `translateY(${wipeY}px) scale(${wipeScale})`,
            transformOrigin: '7% 33%', // LANGWEILIG.'s own position — the word IS the wipe's seed
          }}
        />
      )}

      {/* ================= BEAT 2 — THE PROBLEM ================= */}
      <div style={{position: 'absolute', left: 72, top: 640, width: 940}}>
        <KineticPhrase
          words={[{text: 'DEIN'}, {text: 'CONTENT'}]}
          frame={frame}
          fps={fps}
          enterStart={b2TextStart}
          exitStart={b2SwipeStart}
          fontSize={72}
          align="left"
          style={{justifyContent: 'flex-start'}}
        />
        <div style={{marginTop: 6}}>
          <KineticPhrase
            words={[{text: 'VIELLEICHT'}, {text: 'SCHON.'}]}
            frame={frame}
            fps={fps}
            enterStart={b2TextStart + 5}
            exitStart={b2SwipeStart}
            fontSize={72}
            align="left"
            style={{justifyContent: 'flex-start'}}
          />
        </div>
      </div>
      <div style={{position: 'absolute', inset: 0, transform: `translateX(${anticX}px)`}}>
        <SocialMetric frame={frame} fps={fps} enterStart={b2MetricsStart} x={100} y={560} rotate={-4} depth={1} label="327 VIEWS" child="+12/min" swipeProgress={swipeProgress} swipeDelay={0} swipeDirection={-1} />
        <SocialMetric frame={frame} fps={fps} enterStart={b2MetricsStart + 4} x={720} y={600} rotate={3} depth={0.6} label="0 SHARES" swipeProgress={swipeProgress} swipeDelay={0.05} swipeDirection={-1} />
        <div
          style={{
            position: 'absolute',
            left: 60 + skipX,
            top: 900,
            opacity: skipEnterP * (1 - swipeProgress),
            transform: `rotate(${-skipP * 6}deg)`,
          }}
        >
          <MetaLabel text="SKIP →" color={BRAND.red} style={{fontSize: 20}} />
        </div>
        <div style={{transform: `translateY(${collideKick}px)`}}>
          <SocialMetric frame={frame} fps={fps} enterStart={b2MetricsStart + 10} x={760} y={860} rotate={-3} depth={0.8} label="2 LIKES" swipeProgress={swipeProgress} swipeDelay={0.08} swipeDirection={-1} />
        </div>
        <SocialMetric frame={frame} fps={fps} enterStart={b2MetricsStart + 14} x={120} y={1080} rotate={2} depth={0.5} label="RETENTION" child="12%" swipeProgress={swipeProgress} swipeDelay={0.12} swipeDirection={-1} />
      </div>

      {/* ================= BEAT 3 — OFFSCRIPT REVEAL ================= */}
      <B3Sheets frame={frame} start={b3SheetsStart} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: 40}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 56}}>
          <LogoReveal frame={frame} fps={fps} start={b3LogoStart} width={380} exitStart={b3LogoExit} />
          <B3Wiggle frame={frame} wiggleStart={b3WiggleStart}>
            <KineticPhrase
              words={[{text: 'WIR'}, {text: 'MACHEN'}, {text: 'CONTENT,'}]}
              frame={frame}
              fps={fps}
              enterStart={b3TextStart}
              exitStart={b3TextExit}
              fontSize={50}
              align="center"
            />
            <div style={{marginTop: 6}}>
              <KineticPhrase
                words={[{text: 'DEN'}, {text: 'MAN'}, {text: 'NICHT'}, {text: 'WEGSWIPT.', impact: true}]}
                frame={frame}
                fps={fps}
                enterStart={b3TextStart + 4}
                exitStart={b3TextExit}
                fontSize={50}
                align="center"
              />
            </div>
          </B3Wiggle>
        </div>
      </AbsoluteFill>

      {/* ================= BEAT 4 — SERVICES ================= */}
      <div style={{position: 'absolute', left: 72, top: 640}}>
        <B4Anchor frame={frame} start={b4AnchorStart} exitStart={b4AnchorExit} />
        <div style={{marginTop: 30}}>
          <ServiceMachine
            frame={frame}
            start={b4MachineStart}
            maskWidth={860}
            fontSize={128}
            services={[
              {label: 'CONTENT', kind: 'content'},
              {label: 'STRATEGIE', kind: 'strategy'},
              {label: 'SOCIAL', kind: 'social'},
              {label: 'CREATOR', kind: 'creator'},
            ]}
          />
        </div>
      </div>

      {/* ================= BEAT 5 — ENGINE =================
          Positioned clear of Beat 4's tail end (which spans roughly
          y=600-940) — a brief temporal overlap between the two beats is
          intentional (overlapping action), but they must never occupy the
          same screen region while both are partially visible. */}
      <div style={{position: 'absolute', left: 72, top: 1040}}>
        <ProcessChain frame={frame} start={b5ChainStart} fontSize={80} />
      </div>
      <B5MetricLaunch frame={frame} launchStart={b5LaunchStart} launchEnd={b5LaunchEnd}>
        <div style={{position: 'absolute', left: 90, top: 1010}}>
          <MetricRoller frame={frame} start={b5MetricStart} values={['3K', '12K', '47K', '100K+']} fontSize={140} />
        </div>
      </B5MetricLaunch>

      {/* ================= BEAT 6 — HERO ================= */}
      <B6Collapse frame={frame} exitStart={b6ExitStart} exitEnd={b6ExitEnd}>
        <div style={{position: 'absolute', left: 72, top: 780, transform: `scale(${breathe(frame)})`}}>
          <B6Antic frame={frame} anticStart={b6AnticStart} pushStart={b6Line2Start}>
            <KineticWord text="FALL AUF." frame={frame} fps={fps} enterStart={b6Line1Start} enterDur={18} fontSize={118} color={BRAND.ink} transformOrigin="0% 100%" maxBlur={32} fromY={70} />
          </B6Antic>
          <div style={{marginTop: 6}}>
            <KineticWord text="NICHT DURCH." frame={frame} fps={fps} enterStart={b6Line2Start} enterDur={18} fontSize={118} color={BRAND.red} impact tilt transformOrigin="0% 0%" maxBlur={32} />
          </div>
        </div>
      </B6Collapse>

      {/* ================= BEAT 7 — CTA ================= */}
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center'}}>
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18}}>
          <LogoReveal frame={frame} fps={fps} start={b7LogoStart} width={460} fromRotate={-7} />
          <GraphicLine orientation="h" length={46} progress={springProgress(frame, b7LogoStart + 14, b7LogoStart + 22, fps, SETTLE)} origin="center" style={{marginTop: 2}} />
          <div style={{marginTop: 8}}>
            <KineticPhrase words={[{text: 'CONTENT,'}, {text: 'DER'}, {text: 'HÄNGEN'}, {text: 'BLEIBT.'}]} frame={frame} fps={fps} enterStart={b7TaglineStart} fontSize={34} align="center" />
          </div>
          <B7FadeUp frame={frame} start={b7UrlStart}>
            <MetaLabel text="offscript.ch" color={BRAND.muted} style={{fontSize: 21}} />
          </B7FadeUp>
          <div style={{marginTop: 14}}>
            <B7FadeUp frame={frame} start={b7CtaStart}>
              <CTAArrow frame={frame} start={b7CtaStart + 8} />
            </B7FadeUp>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Small per-beat helpers — each a pure function of frame.
// ---------------------------------------------------------------------------

/** DEINE MARKE, sharing one row inside the mask window — MARKE catches up
 *  from below a few frames after DEINE (overlapping action), both riding
 *  the shared impact kick. */
const B1Line: React.FC<{frame: number; fps: number; deineStart: number; markeStart: number; kickAmt: number; anticAmt: number}> = ({
  frame,
  fps,
  deineStart,
  markeStart,
  kickAmt,
  anticAmt,
}) => (
  <div style={{position: 'absolute', top: 40, left: 0, display: 'flex', alignItems: 'baseline', gap: 20, transform: `translateY(${kickAmt}px) scale(${1 - anticAmt})`}}>
    <KineticWord text="DEINE" frame={frame} fps={fps} enterStart={deineStart} enterDur={17} fontSize={128} transformOrigin="0% 100%" fromY={170} maxBlur={26} />
    <KineticWord text="MARKE" frame={frame} fps={fps} enterStart={markeStart} enterDur={16} fontSize={128} transformOrigin="0% 100%" fromY={130} maxBlur={26} />
  </div>
);

/** Two plain, contentless panels sliding off just ahead of the real UI —
 *  a cheap, robust approximation of "stacked sheets peeling away." */
const B3Sheets: React.FC<{frame: number; start: number}> = ({frame, start}) => {
  const sheets = [
    {delay: 0, color: BRAND.surface, offset: 18},
    {delay: 3, color: '#FFFFFF', offset: -14},
  ];
  return (
    <>
      {sheets.map((s, i) => {
        // Never rendered before its own window — an easeProgress at p=0
        // still resolves to a valid (visible) rest pose, so an explicit
        // frame check is required, not just "p >= 0.999" at the far end.
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

const B3Wiggle: React.FC<{frame: number; wiggleStart: number; children: React.ReactNode}> = ({frame, wiggleStart, children}) => {
  const local = frame - wiggleStart;
  const pullLen = 6;
  const pull = local >= 0 && local <= pullLen ? interpolate(local, [0, pullLen], [0, -70]) : local > pullLen ? -70 : 0;
  const back = local > pullLen ? withOvershoot(Math.min((local - pullLen) / 14, 1), -70, 0, 0.2) : 0;
  const x = local > pullLen ? back : pull;
  return <div style={{transform: `translateX(${x}px)`}}>{children}</div>;
};

const B4Anchor: React.FC<{frame: number; start: number; exitStart: number}> = ({frame, start, exitStart}) => {
  const enterP = easeProgress(frame, start, start + 12, easeOutExpo);
  const exitP = easeProgress(frame, exitStart, exitStart + 10, easeInExpo);
  const opacity = enterP * (1 - exitP);
  const y = interpolate(enterP, [0, 1], [16, 0]) - interpolate(exitP, [0, 1], [0, 14]);
  return (
    <div style={{opacity, transform: `translateY(${y}px)`}}>
      <MetaLabel text="OFFSCRIPT SERVICES — 01–04" color={BRAND.red} />
    </div>
  );
};

/** The counter explodes toward camera instead of fading — that explosion
 *  IS the transition into the hero statement. */
const B5MetricLaunch: React.FC<{frame: number; launchStart: number; launchEnd: number; children: React.ReactNode}> = ({
  frame,
  launchStart,
  launchEnd,
  children,
}) => {
  const p = interpolate(frame, [launchStart, launchEnd], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const scale = interpolate(p, [0, 1], [1, 3.6]);
  const blur = interpolate(p, [0, 1], [0, 36]);
  const opacity = interpolate(p, [0, 1], [1, 0]);
  return <div style={{transform: `scale(${scale})`, filter: blur ? `blur(${blur}px)` : undefined, opacity}}>{children}</div>;
};

/** FALL AUF. shifts up slightly in anticipation, then gets pushed a touch
 *  further by NICHT DURCH. landing — the two lines react to each other. */
const B6Antic: React.FC<{frame: number; anticStart: number; pushStart: number; children: React.ReactNode}> = ({
  frame,
  anticStart,
  pushStart,
  children,
}) => {
  const anticP = easeProgress(frame, anticStart, anticStart + 6, easeInOutCubic);
  const pushT = frame - (pushStart + 18 * 0.62);
  const pushKick = pushT >= 0 && pushT <= 8 ? Math.sin((pushT / 8) * Math.PI) * 10 : 0;
  const y = interpolate(anticP, [0, 1], [0, -8]) - pushKick;
  return <div style={{transform: `translateY(${y}px)`}}>{children}</div>;
};

/** The hero statement scales down and rotates slightly — resolving, at the
 *  same anchor point, into the closing logo's own inverse rotation settle. */
const B6Collapse: React.FC<{frame: number; exitStart: number; exitEnd: number; children: React.ReactNode}> = ({
  frame,
  exitStart,
  exitEnd,
  children,
}) => {
  const p = easeProgress(frame, exitStart, exitEnd, easeInExpo);
  const scale = interpolate(p, [0, 1], [1, 0.16]);
  const rotate = interpolate(p, [0, 1], [0, -7]);
  const blur = interpolate(p, [0, 0.7, 1], [0, 10, 24]);
  const opacity = interpolate(p, [0, 0.85, 1], [1, 1, 0]);
  return (
    <div style={{transform: `rotate(${rotate}deg) scale(${scale})`, filter: blur ? `blur(${blur}px)` : undefined, opacity}}>
      {children}
    </div>
  );
};

const B7FadeUp: React.FC<{frame: number; start: number; children: React.ReactNode}> = ({frame, start, children}) => {
  const p = springProgress(frame, start, start + 12, 30, TEXT);
  return <div style={{opacity: p, transform: `translateY(${interpolate(p, [0, 1], [12, 0])}px)`}}>{children}</div>;
};
