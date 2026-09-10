import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {BRAND, FONT} from './theme';
import {springProgress, TEXT, SETTLE} from './motion/springs';
import {
  easeProgress,
  easeArrive,
  easeCamera,
  easeOutExpo,
  easeOutCubic,
  easeOutQuint,
  easeInExpo,
  easeInCubic,
  easeInOutCubic,
} from './motion/easings';
import {smoothKeys} from './motion/curves';
import {Impact, impactOffset, impactTransform, transformOf} from './motion/physics';
import {motionBlur, velocityStretch} from './motion/velocity';
import {CameraRig} from './components/CameraRig';
import {MorphRule} from './components/MorphRule';
import {PLANE, depth, depthScale} from './motion/depth';
import {SURFACE, TONE, blendTone} from './motion/palette';
import {CONTENT, CONTENT_W, SafeZoneGuides, widthAt} from './layout';
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

// The opening display size. Down ~12% from 236: at 236 the headline could
// not be set inside the content-safe area without clipping its first
// letter, which is a legibility cost the "oversized" gesture does not
// justify. The editorial scale survives the trim — 208px is still nearly a
// fifth of the frame width per character.
const HOOK_SIZE = 192;

// "NICHT DURCH." at 124px overran the content-safe right edge; 116 sets the
// full line inside it without touching the story or the composition.
const HERO_SIZE = 108;

// LANGWEILIG. — the word the whole hook lands on.
const LW_SIZE = 114;

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

  // The red field bursts out of the word and DECELERATES as it fills the
  // frame, arriving with almost no velocity at f65. The recede then starts
  // from rest at f66 and accelerates away. Previously the fill ran on
  // easeInCubic and was still travelling at 4.5 scale-units per frame when
  // it hit its end stop, sat frozen for four frames, then started moving
  // again — a velocity cliff in both directions, and the single most
  // visible "coded, not animated" moment in the Reel.
  const b1BoxIn = easeProgress(frame, 46, 50, easeOutCubic); // the word's own red field lights up
  const b1BoxSX = interpolate(easeProgress(frame, 47, 63, easeCamera), [0, 1], [1, 1.5]);
  const b1BoxSY = interpolate(easeProgress(frame, 49, 65, easeCamera), [0, 1], [1, 19]);
  const b1Consumed = easeProgress(frame, 46, 58, easeInOutCubic); // the rest of the type is swallowed by the red
  const b1LwFade = easeProgress(frame, 58, 66, easeInOutCubic);
  // The lift-off, retimed. On easeInCubic the revealing bottom edge crawled
  // for eight frames (0.9px, 6px, 17px...) and then covered 300, 360 and
  // 427px on the last three — so the reveal, which is the whole point of
  // the shot, happened in three frames and read as a cut rather than a
  // wipe. It also travelled 2500px when 1990 clears the frame, wasting a
  // fifth of the move off-screen.
  //
  // Now: accelerate from rest over five frames, then leave at a steady
  // ~137px/frame. Same energy, but the edge is legible the whole way
  // across, which is what makes it a wipe.
  const b1RecedeU = easeProgress(frame, 66, 84, (t) => t);
  const b1BoxY = smoothKeys(b1RecedeU, [0, 0.28, 1], [0, -300, -2080], {startTangent: 0, endTangent: -2540});
  const b1BoxYPrev = smoothKeys(
    easeProgress(frame - 1, 66, 84, (t) => t),
    [0, 0.28, 1],
    [0, -300, -2080],
    {startTangent: 0, endTangent: -2540},
  );
  // Blur from its own travel, so the fast frames smear instead of stepping.
  // Divided by the panel's own scaleY, because a CSS filter is applied in
  // the element's LOCAL space and the transform scales the result — at
  // scaleY 19 a nominal 16px blur lands on screen as ~300px of mush. This
  // asks for ~50px of falloff and gets ~50px, which is about what a real
  // 180-degree shutter would give an edge travelling 145px per frame.
  const b1BoxBlur = motionBlur(b1BoxY - b1BoxYPrev, 150, 50) / Math.max(b1BoxSY, 1);
  const b1BoxOn = b1BoxIn > 0.002 && b1RecedeU < 0.999;

  // ---- the shockwave, as a HIERARCHY rather than one shared number ----
  // Everything shaking by the same amount is what makes a frame look cheap.
  // LANGWEILIG. is the object that lands, so it carries the whole reaction;
  // the type around it takes a fraction, and later, by distance from the
  // hit; the camera (below) takes least of all. Mass matters too — the
  // 208px display words barely move, the 42px kicker moves most.
  const lwRecoil = impactOffset(frame, b1ImpactHit, 11, -8, 3); // PRIMARY (Y support)
  // The primary impact now lives on Z: a short anticipation BACKWARD, a
  // fast push toward the viewer, one small counter, then a settle onto
  // ACTIVE. Depth is what makes the hit land, so the frame barely has to
  // move at all — which is the whole reason the camera amplitudes below
  // could come down.
  const lwZ = smoothKeys(
    easeProgress(frame, b1ImpactStart, b1ImpactStart + b1ImpactDur + 8, easeCamera),
    [0, 0.16, 0.6, 0.82, 1],
    [-90, -145, 205, 132, PLANE.active],
  );
  const istNichtRecoil = impactOffset(frame, b1ImpactHit + 1, 9, -7); // nearest + lightest
  const markeRecoil = impactOffset(frame, b1ImpactHit + 2, 10, -4.5);
  const deineRecoil = impactOffset(frame, b1ImpactHit + 4, 10, -3.5); // furthest + heaviest
  // Anticipation: a single 3% compression before the hit, not an oscillation.
  const anticAmt = impactOffset(frame, b1ImpactHit - 7, 7, 0.03, 1);

  // =========================================================================
  // BEAT 2 — THE PROBLEM. One headline, one secondary metric attached to it
  // by a red tick, two tertiary signals that physically interact.
  // =========================================================================
  // Nudged later with the longer wipe: the panel now clears around f84, and
  // the reveal must uncover typography that is still MOVING. Uncovering
  // settled type turns a continuous handoff back into two separate shots.
  const b2TextStart = 72;
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
  // A chip is MICRO UI: light, quick, and knocked along the axis it was
  // actually hit on. It used to take 46px + 7deg, which is a hero-scale
  // reaction on a 30px label — bigger than the object itself.
  const collideAt = skipTravelStart + skipTravelDur * 0.6;
  const collideX = impactOffset(frame, collideAt, 10, 14);
  const collideY = impactOffset(frame, collideAt, 10, -3);
  const collideRot = impactOffset(frame, collideAt, 10, 2.2, 3);

  // =========================================================================
  // BEAT 3 — OFFSCRIPT REVEAL + the WEGSWIPT resist.
  // =========================================================================
  const b3SheetsStart = b2SwipeStart + 4;
  const b3LogoStart = 144;
  const b3LogoExit = 196;
  const b3TextStart = 156;
  // Beat 4 now starts six frames earlier (the rail has to be free before it
  // can pivot), so beat 3's line has to be clear before CONTENT is dominant
  // — otherwise the two beats sit on top of each other and the handoff
  // reads as a dissolve instead of choreography.
  const b3TextExit = 196;
  const b3ExitStagger = [0, 2, 3, 5];
  const b3HitStart = 170; // the invisible swipe force lands here

  // =========================================================================
  // BEAT 4 — SERVICES, one continuous surface.
  // =========================================================================
  // The rail draws, and the surface is already rising into frame, WHILE
  // beat 3's text is still leaving — otherwise there are dead frames at the
  // boundary where one beat has gone and the next has not arrived.
  // The surface runs slightly earlier and slightly tighter than before, for
  // one specific reason: the rail's pivot into the process line sweeps a
  // quarter-circle out of the rail's own top, and that arc passes straight
  // through where the service labels sit. There is no angle that avoids it —
  // so the surface finishes and clears the mask BEFORE the rail lets go,
  // and the sweep crosses empty frame.
  const b4RailGrow = 202;
  const b4AnchorStart = 202;
  const b4MachineStart = 212;
  const b4Slot = 23;
  const b4AnchorExit = 306;

  // =========================================================================
  // BEAT 5 — THE MACHINE.
  // =========================================================================
  const b5ChainStart = 312;
  const b5MetricStart = b5ChainStart + 70;
  const b5RollDur = 24;
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
  const b6ExitStart = 486;
  const b6ExitEnd = 500;
  // The red rule under NICHT DURCH. — a hero accent that becomes the
  // endcard's underline. It is the object that carries beat 6 into beat 7.
  const b6RuleStart = b6Line2Start + 14;
  const b6RuleTravel = 486;
  const b6RuleTravelEnd = 508;

  // =========================================================================
  // BEAT 7 — ENDCARD. Paper unfurls FROM the red rule, which comes to rest
  // as offscript.ch's underline. Everything then stops, for a full second.
  // =========================================================================
  const b7PaperStart = 494;
  const b7PaperEnd = 516;
  const b7LogoStart = 506;
  const b7UrlStart = 522;
  const b7TaglineStart = 536;
  const b7CtaStart = 544;

  // Endcard geometry, anchored rather than centred by flow, so the rule's
  // rest position is a number this file knows instead of whatever the stack
  // happens to measure.
  const EC_TOP = 616;
  const EC_LOGO_W = 520;
  const EC_URL_Y = 905;
  // The rule is the width of the word it underlines, not a decorative bar
  // that overhangs it, and it clears the descenders.
  const EC_RULE_Y = 990;
  const EC_RULE_W = 348;
  const EC_RULE_X = (1080 - EC_RULE_W) / 2;

  // =========================================================================
  // SURFACES. Three changes, each performed by a moving object.
  //
  //   paper -> red    LANGWEILIG.'s own field floods (beat 1, already)
  //   red   -> paper  that field lifts away             (beat 1, already)
  //   paper -> navy   the process line expands vertically and turns
  //   navy  -> paper  the hero's red rule unfurls the endcard from itself
  //
  // Type contrast is driven by the SAME progress values, so the surface and
  // the typography can never disagree by even one frame.
  // =========================================================================
  // TWO expansions from the same seam, not one field changing colour.
  // Interpolating #F20505 -> #0E1626 in RGB passes through a dead maroon for
  // half a second, and a background crossfade is exactly what the brief
  // rules out. So the red floods out of the process line, and then the navy
  // floods out of that same line on top of it: shape, then shape.
  const redGrow = easeProgress(frame, 368, 382, easeCamera);
  const navyGrow = easeProgress(frame, 379, 395, easeCamera);
  const paperGrow = easeProgress(frame, b7PaperStart, b7PaperEnd, easeCamera);

  // Contrast rides the SAME progress values, so the surface and the type
  // cannot disagree by a frame. The red state is brief, so its window is
  // tight — type turns white just as the red reaches it.
  const toneDark = blendTone(
    blendTone(TONE.paper, TONE.red, easeProgress(frame, 370, 379, easeInOutCubic)),
    TONE.navy,
    easeProgress(frame, 381, 391, easeInOutCubic),
  );
  const tone = blendTone(toneDark, TONE.paper, paperGrow);

  // The colour BEHIND the camera rig. The rig is what the camera impacts
  // move, and a 4px nudge or a 0.9993 scale recoil pulls its edges inside
  // the frame — which was fine while the whole Reel was paper and the
  // sliver matched, and became a two-frame white flash down the left edge
  // and across the top the moment a chapter went navy. The fields
  // themselves grow from the centre, so the root is only ever exposed once
  // a surface is already complete: a step, not a blend.
  const rootSurface =
    paperGrow > 0.999 ? SURFACE.paper : navyGrow > 0.999 ? SURFACE.navy : redGrow > 0.999 ? SURFACE.red : SURFACE.paper;

  // =========================================================================
  // THE CAMERA — four moments in twenty seconds, and not one of them is
  // meant to be noticed as camera movement.
  //
  // Every amplitude here is inside the brief's ceiling (X 2-6px, Y 2-8px,
  // rotation 0.05-0.25deg, 5-10 frames). They are the third voice in each
  // reaction, under the object that was hit and under the type around it,
  // and each one reacts on the axis the force actually acted on:
  //
  //   LANGWEILIG.   punches up   -> the frame recoils DOWN
  //   WEGSWIPT.     thrown right -> the frame drags LEFT
  //   100K+         comes at you -> SCALE, plus a touch of Y (item 6)
  //   NICHT DURCH.  lands        -> DOWN, the closing weight
  // =========================================================================
  const cameraImpacts: Impact[] = [
    {start: b1ImpactHit, duration: 9, x: -2, y: 3.5, rotate: 0.12, cycles: 3},
    {start: b3HitStart + 2, duration: 8, x: -2.5, y: 1, rotate: 0.05},
    {start: b5MetricStart + b5RollDur, duration: 9, scale: 0.006, y: 2},
    {start: b6Line2Start + 11, duration: 8, x: 1.5, y: 4, rotate: 0.1},
  ];

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
    <AbsoluteFill style={{backgroundColor: rootSurface, overflow: 'hidden'}}>
      {cues.map((cue, i) => (
        <Sequence key={i} from={Math.max(cue.frame, 0)} layout="none">
          <Audio src={staticFile(`sfx/${cue.file}`)} volume={cue.volume} />
        </Sequence>
      ))}

      <CameraRig frame={frame} impacts={cameraImpacts}>
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
            filter: b1BoxBlur ? `blur(${b1BoxBlur}px)` : undefined,
            transform: `translateY(${b1BoxY}px) scale(${b1BoxSX}, ${b1BoxSY})`,
            transformOrigin: '50% 50%',
          }}
        />
      )}

      <div style={{opacity: 1 - b1Consumed}}>
        <HookWord frame={frame} text="DEINE" start={b1DeineStart} dur={15} fromY={280} fromZ={PLANE.secondary} fontSize={HOOK_SIZE} left={CONTENT.left} top={286} extraY={deineRecoil} extraScale={1 - anticAmt} />
        <HookWord frame={frame} text="MARKE" start={b1MarkeStart} dur={16} fromY={90} fromX={150} fromZ={PLANE.background} fontSize={HOOK_SIZE} left={CONTENT.left + 200} top={470} extraY={markeRecoil} extraScale={1 - anticAmt} />
        <div style={{position: 'absolute', left: CONTENT.left + 2, top: 652, transform: `translateY(${istNichtRecoil}px)`}}>
          <KineticWord text="IST NICHT" frame={frame} fps={fps} enterStart={b1IstNichtStart} enterDur={11} fontSize={46} fontWeight={700} color={BRAND.muted} fromY={26} transformOrigin="0% 100%" />
        </div>
      </div>

      {/* LANGWEILIG. — red on the page, white once its own field is behind
          it, then faded away while the field holds full-frame. */}
      <div
        style={{
          position: 'absolute',
          left: CONTENT.left - 6,
          top: 700,
          opacity: 1 - b1LwFade,
          transform: `translateY(${lwRecoil}px) ${depth(lwZ)}`,
          transformOrigin: '0% 50%',
        }}
      >
        <KineticWord
          text="LANGWEILIG."
          frame={frame}
          fps={fps}
          enterStart={b1ImpactStart}
          enterDur={b1ImpactDur}
          fontSize={LW_SIZE}
          color={BRAND.red}
          impact
          tilt
          scaleFrom={1}
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
            fontSize={LW_SIZE}
            color="#FFFFFF"
            impact
            tilt
            scaleFrom={1}
            transformOrigin="0% 50%"
            maxBlur={32}
          />
        </div>
      </div>

      {/* ================= BEAT 2 — THE PROBLEM ================= */}
      <div style={{position: 'absolute', left: CONTENT.left, top: 618, width: CONTENT_W}}>
        <KineticPhrase
          words={[{text: 'DEIN'}, {text: 'CONTENT'}]}
          frame={frame}
          fps={fps}
          enterStart={b2TextStart}
          exitStart={b2SwipeStart}
          fontSize={70}
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
            fontSize={70}
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
          style={{position: 'absolute', left: CONTENT.left + 4, top: 792}}
        />
        <SocialMetric
          frame={frame}
          fps={fps}
          enterStart={b2MetricsStart}
          x={CONTENT.left + 4}
          y={848}
          rotate={-2}
          depth={1}
          plane={PLANE.active}
          size={46}
          label="327 VIEWS"
          child="+12/min"
          swipeProgress={swipeProgress}
          swipeDelay={0}
          swipeDirection={-1}
        />
        <div style={{transform: `translate(${collideX}px, ${collideY}px) rotate(${collideRot}deg)`, transformOrigin: '50% 50%'}}>
          <SocialMetric
            frame={frame}
            fps={fps}
            enterStart={b2MetricsStart + 6}
            x={640}
            y={982}
            rotate={3}
            depth={0.72}
            plane={PLANE.secondary}
            size={36}
            label="0 SHARES"
            swipeProgress={swipeProgress}
            swipeDelay={0.06}
            swipeDirection={-1}
          />
        </div>
        <div
          style={{
            position: 'absolute',
            left: 60,
            top: 986,
            opacity: skipEnterP * (1 - swipeProgress),
            // `left` is a LAYOUT property: the browser resolves it during
            // layout and snaps text to whole pixels, so a smooth 900px
            // travel arrives as a staircase. Transforms are composited with
            // sub-pixel precision — same path, no stepping.
            transform: `translateX(${skipX}px) rotate(${-skipP * 5}deg) ${depth(PLANE.active + 30)}`,
            filter: skipP > 0 && skipP < 1 ? `blur(${motionBlur(skipX - interpolate(easeProgress(frame - 1, skipTravelStart, skipTravelStart + skipTravelDur, easeInOutCubic), [0, 1], [0, 900]), 80, 12)}px)` : undefined,
          }}
        >
          <MetaLabel text="SKIP →" color={BRAND.red} style={{fontSize: 36, letterSpacing: 2}} />
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
                exitStagger={b3ExitStagger}
                exitDur={7}
                fontSize={48}
                align="center"
              />
            </SwipeReact>
            {/* gap 26, not 14: WEGSWIPT.'s counter-swing is ~13px back to
                the left, which ate a 14px word space entirely and left it
                touching "NICHT" at the bottom of the recoil. The gap has to
                clear the recoil, not just the rest pose. */}
            <div style={{marginTop: 6, display: 'flex', alignItems: 'baseline', gap: 26}}>
              <SwipeReact frame={frame} hitStart={b3HitStart} amount={0.14} delay={2}>
                <KineticPhrase
                  words={[{text: 'DEN'}, {text: 'MAN'}, {text: 'NICHT'}]}
                  frame={frame}
                  fps={fps}
                  enterStart={b3TextStart + 4}
                  exitStart={b3TextExit}
                  exitStagger={b3ExitStagger}
                  exitDur={7}
                  fontSize={48}
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
                  exitDur={7}
                  fontSize={48}
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
      <div style={{position: 'absolute', left: CONTENT.left, top: 556}}>
        <B4Anchor frame={frame} start={b4AnchorStart} exitStart={b4AnchorExit} />
      </div>
      <div style={{position: 'absolute', left: CONTENT.left, top: 620}}>
        <ServiceMachine
          frame={frame}
          start={b4MachineStart}
          slot={b4Slot}
          hold={12}
          moveDur={11}
          rowHeight={250}
          width={widthAt(620)}
          fontSize={122}
          markerEnter={b4RailGrow + 8}
          markerExit={302}
          services={[
            {label: 'CONTENT', kind: 'content'},
            {label: 'STRATEGIE', kind: 'strategy'},
            {label: 'SOCIAL', kind: 'social'},
            {label: 'CREATOR', kind: 'creator'},
          ]}
        />
      </div>

      {/* The ONE red rule: the services rail, then the process connector.
          It pivots about its own bottom end — the point where the rail
          finishes and the chain begins — so the two states are visibly the
          same object rather than two lines that resemble each other. */}
      <MorphRule
        frame={frame}
        color={tone.accent}
        rail={{x: CONTENT.left, y: 620, thickness: 4, length: 375}}
        line={{x: 268, y: 1001, thickness: 5, length: 272}}
        drawStart={b4RailGrow}
        pivotStart={306}
        pivotDur={14}
        slideStart={314}
        slideDur={14}
        dropStart={316}
        dropDur={16}
        exitStart={380}
      />

      {/* THE DARK CHAPTER. The field does not fade in — it grows out of the
          process line, vertically, from that line's own baseline, and only
          then turns from red to navy. The background is choreography. */}
      {redGrow > 0.001 && paperGrow < 0.999 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: SURFACE.red,
            transformOrigin: `50% ${(1001 / 1920) * 100}%`,
            transform: `scaleY(${redGrow})`,
          }}
        />
      )}
      {navyGrow > 0.001 && paperGrow < 0.999 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: SURFACE.navy,
            transformOrigin: `50% ${(1001 / 1920) * 100}%`,
            transform: `scaleY(${navyGrow})`,
          }}
        />
      )}

      {/* ================= BEAT 5 — THE MACHINE ================= */}
      <div style={{position: 'absolute', left: CONTENT.left, top: 812}}>
        <ProcessChain frame={frame} start={b5ChainStart} fontSize={74} growExitStart={b5LaunchStart} tone={tone} externalLine />
      </div>
      {/* The roller sits in the same band the hero statement resolves into,
          so the explosion and the headline are one continuous mass rather
          than two things in two places. */}
      {/* 100K+ — emerges FROM depth, lands, then leaves THROUGH the viewer.
          Z is the dominant axis for this whole moment; nothing else moves. */}
      {/* The positioning is OUTSIDE the depth wrapper on purpose. A wrapper
          whose only child is absolutely positioned has a zero-height box, so
          `transformOrigin: 10% 50%` resolves to a point near the frame's top
          -left and the Z push sends the number away from its own position
          instead of toward the viewer. Positioned first, transformed second,
          the origin means what it says. */}
      <div style={{position: 'absolute', left: CONTENT.left, top: 860}}>
        <B5MetricLaunch
          frame={frame}
          launchStart={b5LaunchStart}
          launchEnd={b5LaunchEnd}
          emergeStart={b5MetricStart}
          emergeEnd={b5MetricStart + 20}
        >
          <MetricRoller frame={frame} fps={fps} start={b5MetricStart} duration={b5RollDur} values={['3K', '12K', '47K', '100K+']} fontSize={138} color={tone.ink} />
        </B5MetricLaunch>
      </div>

      {/* ================= BEAT 6 — HERO ================= */}
      <div style={{position: 'absolute', left: CONTENT.left, top: 840}}>
        <B6Collapse frame={frame} exitStart={b6ExitStart} exitEnd={b6ExitEnd}>
          <B6Antic frame={frame} anticStart={b6AnticStart} pushStart={b6Line2Start}>
            {/* Resolves straight out of the counter's blur — the receiving
                half of a Z match cut, not an entrance of its own. */}
            <MatchIn frame={frame} start={b6Line1Start} dur={16}>
              <div style={{fontFamily: FONT, fontWeight: 800, fontSize: HERO_SIZE, letterSpacing: -3, color: tone.ink, whiteSpace: 'nowrap'}}>
                FALL AUF.
              </div>
            </MatchIn>
          </B6Antic>
          {/* Enters from deeper Z and settles onto nearly FALL AUF.'s plane.
              Depth carries the scale, so the word itself does not also
              scale — one mechanism per behaviour. */}
          <div style={{marginTop: 4}}>
            <DepthIn frame={frame} start={b6Line2Start} dur={18} from={PLANE.secondary} to={PLANE.base} origin="0% 50%">
              <KineticWord
                text="NICHT DURCH."
                frame={frame}
                fps={fps}
                enterStart={b6Line2Start}
                enterDur={18}
                fontSize={HERO_SIZE}
                color={tone.accent}
                impact
                tilt
                fromY={80}
                scaleFrom={1}
                transformOrigin="0% 0%"
                maxBlur={34}
              />
            </DepthIn>
          </div>
        </B6Collapse>
      </div>

      {/* The endcard's paper, unfurled FROM the red rule below — not a
          crossfade, and not a new screen: the rule opens the frame. */}
      {paperGrow > 0.001 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            background: SURFACE.paper,
            transformOrigin: `50% ${(EC_RULE_Y / 1920) * 100}%`,
            transform: `scaleY(${paperGrow})`,
          }}
        />
      )}

      {/* THE shared red element: an accent rule under NICHT DURCH., which
          travels and becomes offscript.ch's underline. Beat 6 does not end
          and beat 7 begin — this object carries one into the other. */}
      <HeroRule
        frame={frame}
        color={tone.accent}
        start={b6RuleStart}
        travelStart={b6RuleTravel}
        travelEnd={b6RuleTravelEnd}
        from={{x: CONTENT.left, y: 1096, w: 620, h: 7}}
        to={{x: EC_RULE_X, y: EC_RULE_Y, w: EC_RULE_W, h: 4}}
      />

      {/* ================= BEAT 7 — ENDCARD =================
          Hierarchy is logo, then the website, then the tagline, then the
          CTA. The website is the thing a viewer has to be able to act on,
          so it is set as a design element rather than as a footnote. */}
      <div style={{position: 'absolute', left: 0, width: '100%', top: EC_TOP, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        <DepthIn frame={frame} start={b7LogoStart} dur={18} from={PLANE.secondary} to={PLANE.base}>
          <LogoReveal frame={frame} fps={fps} start={b7LogoStart} width={EC_LOGO_W} fromRotate={-4} fromScale={0.9} fromBlur={18} fadeIn={5} duration={20} />
        </DepthIn>
        <div style={{height: EC_URL_Y - EC_TOP - Math.round((EC_LOGO_W * 480) / 1020)}} />
        <B7FadeUp frame={frame} start={b7UrlStart}>
          <span
            style={{
              fontFamily: FONT,
              fontWeight: 600,
              fontSize: 54,
              letterSpacing: -1.2,
              color: BRAND.ink,
              whiteSpace: 'nowrap',
            }}
          >
            offscript.ch&nbsp;<span style={{color: BRAND.red, fontWeight: 500}}>↗</span>
          </span>
        </B7FadeUp>
        <div style={{height: 42}} />
        <B7FadeUp frame={frame} start={b7TaglineStart}>
          <div style={{fontFamily: FONT, fontWeight: 600, fontSize: 30, letterSpacing: -0.2, color: BRAND.muted, whiteSpace: 'nowrap'}}>
            CONTENT, DER HÄNGEN BLEIBT.
          </div>
        </B7FadeUp>
        <div style={{height: 40}} />
        <B7FadeUp frame={frame} start={b7CtaStart}>
          <CTAArrow frame={frame} start={b7CtaStart + 6} />
        </B7FadeUp>
      </div>
      </CameraRig>

      {/* QC only — flip to true to check safe zones on a still. */}
      <SafeZoneGuides />
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
  /** The plane it arrives FROM. The hook starts slightly behind the reading
   *  plane and comes gently forward as it settles, rather than starting
   *  oversized and shrinking — depth reads as approach, scale reads as a
   *  scale animation. */
  fromZ?: number;
  fontSize: number;
  left: number;
  top: number;
  extraY?: number;
  extraScale?: number;
}> = ({frame, text, start, dur, fromY = 0, fromX = 0, fromZ = PLANE.secondary, fontSize, left, top, extraY = 0, extraScale = 1}) => {
  // Not yet started is NOT the same as at rest. An eased progress clamps to
  // 0 before its window opens, and 0 here is a perfectly valid VISIBLE pose
  // — offset and oversized — so the word would sit parked at its entry
  // position for a couple of frames and then set off. It enters already
  // moving fast and heavily blurred, so there is nothing to fade in.
  if (frame < start) return null;
  const at = (f: number) => easeProgress(f, start, start + dur, easeOutCubic);
  const p = at(frame);
  const pPrev = at(frame - 1);
  const y = interpolate(p, [0, 1], [fromY, 0]);
  const x = interpolate(p, [0, 1], [fromX, 0]);
  const v = Math.abs(y - interpolate(pPrev, [0, 1], [fromY, 0])) + Math.abs(x - interpolate(pPrev, [0, 1], [fromX, 0]));
  const blur = motionBlur(v, fontSize * 0.34, 36);
  const stretch = velocityStretch(v, fontSize * 0.34, 0.1);
  const z = interpolate(p, [0, 1], [fromZ, PLANE.base]);
  // Two frames of ramp, spent entirely inside the entry blur, so the word
  // resolves out of its own smear instead of switching on.
  const opacity = easeProgress(frame, start, start + 2, easeOutCubic);

  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        opacity,
        fontFamily: FONT,
        fontWeight: 800,
        fontSize,
        letterSpacing: -6,
        lineHeight: 1,
        color: BRAND.ink,
        whiteSpace: 'nowrap',
        filter: blur ? `blur(${blur}px)` : undefined,
        transform: `translate(${x}px, ${y + extraY}px) scale(${extraScale}, ${extraScale * stretch}) ${depth(z)}`,
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
  const blur = Math.max(0, smoothKeys(p, [0, 0.6, 1], [0, 6, 16]));
  const opacity = smoothKeys(p, [0, 0.8, 1], [1, 0.7, 0]);
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
const SWIPE_THROW = 112; // px — inside the brief's 70-120 range
const SWIPE_DUR = 26;

/**
 * The swipe, as ONE continuous trajectory.
 *
 * It used to be two functions stitched together: an easeInCubic throw over
 * 5 frames, then a separate spring-back. At the seam the word was moving
 * +67px/frame and the next frame it was moving -14px/frame — an
 * instantaneous reversal with no deceleration between them, which is
 * exactly what "abrupt" and "mechanical" look like at 30fps.
 *
 * Now it is the impulse response of a damped oscillator: accelerate out,
 * reach the throw, decelerate, cross back through rest, one counter-swing
 * of about 12% of the throw, and settle at EXACTLY 0. Position, velocity
 * and acceleration are continuous the whole way, and there is no seam
 * because there is no second function.
 */
const swipeResistX = (local: number) => impactOffset(local, 0, SWIPE_DUR, SWIPE_THROW);

const SwipeResist: React.FC<{frame: number; fps: number; hitStart: number; children: React.ReactNode}> = ({frame, hitStart, children}) => {
  const x = swipeResistX(frame - hitStart);
  const v = x - swipeResistX(frame - hitStart - 1);
  // Reference speed matches the trajectory's real peak (~42px/frame), so
  // blur tracks the motion instead of saturating for most of the throw and
  // then falling off a cliff.
  const blur = motionBlur(v, 42, 24);
  const stretch = velocityStretch(v, 42, 0.16);
  // X is the dominant axis and stays dominant. The other two are support:
  // a rotateY of at most 4 degrees, so the leading edge turns very slightly
  // away from the force, and a small push BACK in Z at the peak, as though
  // the swipe pressed it into the page before it springs to the base plane.
  // Both are driven by the same trajectory, so all three land on rest
  // together and nothing is left ringing.
  const drive = x / SWIPE_THROW;
  const rotY = -drive * 4;
  const z = -Math.abs(drive) * 64;
  return (
    <div
      style={{
        display: 'inline-block',
        transform: `translateX(${x}px) rotateY(${rotY}deg) scale(${stretch}, 1) ${depth(z)}`,
        filter: blur ? `blur(${blur}px)` : undefined,
        // The word pivots about the edge the force arrives from, not its
        // middle — that is what makes the turn read as resistance.
        transformOrigin: '0% 50%',
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
        left: 0,
        transform: `translateX(${x}px)`,
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

/**
 * 100K+ emerges from depth, lands, and then leaves THROUGH the viewer.
 *
 * Z is the only axis that moves here, which is the point: a Z pass reads as
 * the object coming at you rather than as a scale animation, and it gives
 * the transition into FALL AUF. a physical reason to exist. As the glyphs
 * exceed the viewport their blurred mass IS the transition surface.
 *
 * Blur is divided by the depth scale because a CSS filter is applied in the
 * element's LOCAL space and the transform magnifies the result — at a 3.6x
 * projection an undivided 60px blur would land as 215px of mush.
 */
const B5MetricLaunch: React.FC<{
  frame: number;
  launchStart: number;
  launchEnd: number;
  emergeStart: number;
  emergeEnd: number;
  children: React.ReactNode;
}> = ({frame, launchStart, launchEnd, emergeStart, emergeEnd, children}) => {
  const emerge = easeProgress(frame, emergeStart, emergeEnd, easeCamera);
  const zRest = interpolate(emerge, [0, 1], [PLANE.secondary, PLANE.base]);

  const p = easeProgress(frame, launchStart, launchEnd, easeInCubic);
  if (p >= 0.999) return null;
  const z = zRest + interpolate(p, [0, 1], [0, 1150]);
  const scale = depthScale(z);
  const blur = interpolate(p, [0, 1], [0, 62]) / Math.max(scale, 1);
  // Opacity is held while the glyphs are still growing past the viewport —
  // that oversized blurred mass IS the transition surface, so fading it out
  // early would leave the cut with nothing to happen inside.
  const opacity = Math.max(0, smoothKeys(p, [0, 0.55, 0.86, 1], [1, 0.92, 0.4, 0]));
  return (
    <div
      style={{
        transform: depth(z),
        // Origin on the number's own left edge, where it actually sits —
        // pushing from the centre of an empty box would slide it sideways.
        transformOrigin: '10% 50%',
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        opacity,
      }}
    >
      {children}
    </div>
  );
};

/** Arrive from (or depart to) a named depth plane. The one way anything in
 *  the Reel moves between planes, so entrances cannot drift apart. */
const DepthIn: React.FC<{
  frame: number;
  start: number;
  dur: number;
  from: number;
  to: number;
  origin?: string;
  children: React.ReactNode;
}> = ({frame, start, dur, from, to, origin = '50% 50%', children}) => {
  const p = easeProgress(frame, start, start + dur, easeCamera);
  const z = interpolate(p, [0, 1], [from, to]);
  return (
    <div style={{transform: depth(z), transformOrigin: origin}}>{children}</div>
  );
};

/**
 * The red rule that belongs to two beats.
 *
 * It is an accent under NICHT DURCH., and it is offscript.ch's underline.
 * Between them it travels and resizes, and the endcard's paper unfurls from
 * its line — so the calm final screen is something this object opened, not
 * a scene that replaced the previous one.
 */
const HeroRule: React.FC<{
  frame: number;
  color: string;
  start: number;
  travelStart: number;
  travelEnd: number;
  from: {x: number; y: number; w: number; h: number};
  to: {x: number; y: number; w: number; h: number};
}> = ({frame, color, start, travelStart, travelEnd, from, to}) => {
  if (frame < start) return null;
  // Draws itself out of the word above it, left to right, once.
  const draw = easeProgress(frame, start, start + 14, easeCamera);
  const t = easeProgress(frame, travelStart, travelEnd, easeCamera);
  const x = interpolate(t, [0, 1], [from.x, to.x]);
  const y = interpolate(t, [0, 1], [from.y, to.y]);
  const w = interpolate(t, [0, 1], [from.w, to.w]);
  const h = interpolate(t, [0, 1], [from.h, to.h]);
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: from.w,
        height: from.h,
        background: color,
        borderRadius: h / 2,
        transformOrigin: '0% 50%',
        transform: `translate(${x}px, ${y}px) scale(${(w / from.w) * draw}, ${h / from.h})`,
      }}
    />
  );
};

/** Resolves out of an oversized blur — the receiving half of a match cut. */
const MatchIn: React.FC<{frame: number; start: number; dur: number; children: React.ReactNode}> = ({frame, start, dur, children}) => {
  // easeOutQuint, not easeOutExpo: expo puts three quarters of a 2.4x
  // scale collapse into the first four frames and then coasts, which reads
  // as a snap followed by a hold. Same distance, same window, spread over
  // the frames it actually occupies.
  const p = easeProgress(frame, start, start + dur, easeOutQuint);
  // Arrives from just short of the plane 100K+ left through, and settles on
  // ACTIVE — the same depth axis, so the two halves of the cut are the same
  // move continued rather than two different animations.
  const z = interpolate(p, [0, 1], [812, PLANE.active]);
  const scale = depthScale(z);
  // Blur resolves on a smooth curve that reaches 0 at zero rate — a blur
  // that pops off the instant an object lands is as visible as a jump — and
  // is divided by the projection so it means the same thing on screen.
  const blur = Math.max(0, smoothKeys(p, [0, 0.55, 1], [30, 6, 0])) / Math.max(scale, 1);
  const opacity = interpolate(p, [0, 0.25], [0, 1], {extrapolateRight: 'clamp'});
  return (
    <div style={{transform: depth(z), transformOrigin: '0% 50%', filter: blur > 0.05 ? `blur(${blur}px)` : undefined, opacity}}>
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
  // Pushed UP by the word landing beneath it — a secondary reaction, so a
  // fraction of the primary, on the axis the force arrived from.
  const pushKick = impactOffset(frame, pushStart + 18 * 0.62, 9, -6);
  const y = interpolate(anticP, [0, 1], [0, -9]) + pushKick;
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
  const blur = Math.max(0, smoothKeys(p, [0, 0.4, 0.66, 1], [0, 14, 32, 32]));
  const opacity = Math.max(0, smoothKeys(p, [0, 0.45, 0.66, 1], [1, 0.8, 0, 0]));
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
