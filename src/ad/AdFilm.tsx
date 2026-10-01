// =============================================================================
// OFFSCRIPT PAID-SOCIAL AD — assembly
//
// Layer stack (bottom → top): backdrop light · problem grid · tiles · hook-C
// card · V2 · M (the recurring rectangle) · P (brand surface) · typography ·
// grain + vignette · QA overlay. Everything is a pure function of the frame.
// =============================================================================
import React, {useMemo} from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame} from 'remotion';
import {Rect, clamp01, numTrack, prog, rectSpeed, track, tw} from './anim';
import {buildChoreo} from './choreo';
import {AdAudio} from './AdAudio';
import {Backdrop, Finish} from './components/Backdrop';
import {Card} from './components/Card';
import {Arrow} from './components/Icons';
import {MediaSlot} from './components/MediaSlot';
import {ProcessContent} from './components/ProcessContent';
import {SafeZones} from './components/SafeZones';
import {Eyebrow, Line} from './components/Text';
import {BRAND, COPY, CutId, FormatId, HOOKS, HookId, PROOF_MODE, ProofMode} from './config';
import {ensureFonts} from './fonts';
import {Layout, layoutFor} from './layout';
import {C, EASE, FONT, SHADOW, TYPE} from './theme';

export type AdProps = {
  cut: CutId;
  hook: HookId;
  format: FormatId;
  qa?: 'none' | 'reels' | 'feed';
  proofMode?: ProofMode;
  silent?: boolean;
};

ensureFonts();

// ---------------------------------------------------------------------------
// small pieces
// ---------------------------------------------------------------------------
const Logo: React.FC<{x: number; y: number; w: number; light?: number; reveal?: number; opacity?: number}> = ({
  x,
  y,
  w,
  light = 0,
  reveal = 1,
  opacity = 1,
}) => {
  const h = w / BRAND.logoAspect;
  const clip = `inset(-4% ${((1 - reveal) * 104).toFixed(2)}% -4% -4%)`;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: w, height: h, opacity, clipPath: clip}}>
      <Img src={staticFile(BRAND.logo)} style={{position: 'absolute', inset: 0, width: w, height: h, opacity: 1 - light}} />
      {light > 0 ? (
        <Img src={staticFile(BRAND.logoLight)} style={{position: 'absolute', inset: 0, width: w, height: h, opacity: light}} />
      ) : null}
    </div>
  );
};

/** hook B: an empty draft post sitting over the (still undeveloped) motif */
const DraftSkeleton: React.FC<{w: number; h: number; frame: number}> = ({w, h, frame}) => {
  const p = w * 0.08;
  const bar = (top: number, width: number, hh: number, o = 0.12) => (
    <div style={{position: 'absolute', left: p, top, width, height: hh, borderRadius: hh, background: `rgba(17,17,17,${o})`}} />
  );
  return (
    <div style={{position: 'absolute', inset: 0, background: C.card}}>
      <div style={{position: 'absolute', left: p, top: p, width: h * 0.075, height: h * 0.075, borderRadius: h, background: 'rgba(17,17,17,0.10)'}} />
      {bar(p + h * 0.012, w * 0.36, h * 0.024)}
      {bar(p + h * 0.048, w * 0.22, h * 0.018, 0.07)}
      <div
        style={{
          position: 'absolute',
          left: p,
          right: p,
          top: h * 0.19,
          height: h * 0.55,
          borderRadius: 18,
          border: '3px dashed rgba(17,17,17,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg width={h * 0.1} height={h * 0.1} viewBox="0 0 24 24" fill="none" style={{transform: `scale(${1 + 0.08 * Math.sin(frame / 5)})`}}>
          <path d="M12 5v14M5 12h14" stroke="rgba(17,17,17,0.28)" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      </div>
      {bar(h * 0.79, w * 0.7, h * 0.026)}
      {bar(h * 0.85, w * 0.48, h * 0.026, 0.07)}
      {/* loading shimmer: the draft is waiting for content */}
      <div
        style={{
          position: 'absolute',
          top: -h * 0.2,
          height: h * 1.4,
          width: w * 0.35,
          left: -w * 0.5 + ((frame % 36) / 36) * w * 1.9,
          transform: 'rotate(14deg)',
          background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.75) 50%, rgba(255,255,255,0) 100%)',
          mixBlendMode: 'screen',
        }}
      />
    </div>
  );
};

/** problem scene: the small, neglected content block */
const DullPost: React.FC<{w: number; h: number}> = ({w, h}) => (
  <div style={{position: 'absolute', inset: 0, background: '#EAE6E0'}}>
    <div style={{position: 'absolute', left: 8, top: 8, right: 8, height: h * 0.6, borderRadius: 10, overflow: 'hidden'}}>
      <MediaSlot slot="hookMotif" w={w - 16} h={h * 0.6} zoom={1.3} filter="grayscale(0.9) contrast(0.7) brightness(1.15)" label={false} />
      <div style={{position: 'absolute', inset: 0, background: 'rgba(234,230,224,0.35)'}} />
    </div>
    <div style={{position: 'absolute', left: 10, top: h * 0.7, width: w * 0.62, height: 7, borderRadius: 4, background: 'rgba(17,17,17,0.13)'}} />
    <div style={{position: 'absolute', left: 10, top: h * 0.7 + 14, width: w * 0.4, height: 7, borderRadius: 4, background: 'rgba(17,17,17,0.08)'}} />
  </div>
);

/** fallback proof: four real works from four industries inside the case card */
const FallbackMosaic: React.FC<{w: number; h: number}> = ({w, h}) => {
  const g = 8;
  const cw = (w - g) / 2;
  const chh = (h - g) / 2;
  const slots = ['workGastro', 'workBeauty', 'workRealEstate', 'workTelco'] as const;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.card}}>
      {slots.map((s, i) => (
        <div key={s} style={{position: 'absolute', left: (i % 2) * (cw + g), top: Math.floor(i / 2) * (chh + g), width: cw, height: chh, overflow: 'hidden'}}>
          <MediaSlot slot={s} w={cw} h={chh} />
        </div>
      ))}
    </div>
  );
};

// ---------------------------------------------------------------------------
// the film
// ---------------------------------------------------------------------------
export const AdFilm: React.FC<AdProps> = ({cut, hook, format, qa = 'none', proofMode = PROOF_MODE, silent = false}) => {
  const frame = useCurrentFrame();
  const L: Layout = useMemo(() => layoutFor(format), [format]);
  const ch = useMemo(() => buildChoreo(L, cut, hook), [L, cut, hook]);
  const sc = ch.scenes;
  const H = HOOKS[hook];

  // ---- M, the recurring rectangle ----------------------------------------
  const mBase = track(frame, ch.M);
  // the hook card floats from frame 0 and comes to rest just before it opens
  const float = 7 * Math.sin(frame / 9) * (1 - prog(frame, ch.cues.openAt - 12, ch.cues.openAt, EASE.inOutSine));
  const m: Rect = {...mBase, y: mBase.y + float, ry: (mBase.ry ?? 0) + numTrack(frame, ch.mRy)};
  const mSpeed = rectSpeed(frame, ch.M);
  const mBlur = Math.min(4, Math.max(0, (mSpeed - 18) / 20));
  const mZoom = numTrack(frame, ch.mZoom);
  const procIn = numTrack(frame, ch.procIn);
  const procK = numTrack(frame, ch.procK);
  const naiaIn = numTrack(frame, ch.naiaIn);
  const naiaDirect = numTrack(frame, ch.naiaDirect);
  const redIn = numTrack(frame, ch.redIn);
  const draft = numTrack(frame, ch.draft);

  // how "open" the hook card is: drives the text inversion and the scrim
  const startRect = ch.M[0].v;
  // fades by time after the hook (not by a hard frame cut), so the scrim never pops
  const open = clamp01((m.w - startRect.w) / (L.W - startRect.w)) * (frame < 92 ? 1 : 1 - prog(frame, 92, 106, EASE.inOutSine));

  const procStarts: [number, number, number, number] = sc.process != null ? [300, 336, 372, 408] : [0, 0, 0, 0];
  const naiaFrom = cut === 'main' ? 470 : 178;
  const proofMedia = (w: number, h: number) =>
    proofMode === 'fallback' ? <FallbackMosaic w={w} h={h} /> : <MediaSlot slot="naiaReel" w={w} h={h} videoFrom={naiaFrom} />;

  // ---- P, the brand surface ------------------------------------------------
  const p = ch.P ? track(frame, ch.P) : null;
  const pDull = numTrack(frame, ch.pDull);
  const logoReveal = prog(frame, ch.cues.logoReveal, ch.cues.logoReveal + 20, EASE.smooth);

  // ---- V2, S --------------------------------------------------------------
  const v2 = ch.V2 ? track(frame, ch.V2) : null;
  const sRect = ch.S ? track(frame, ch.S) : null;
  const sDull = numTrack(frame, ch.sDull);

  const hookOut = 88;
  const T = L.hook.text;

  return (
    <AbsoluteFill style={{background: C.paper, overflow: 'hidden'}}>
      <Backdrop />

      {/* ---- problem: the opened card's edges become the grid ---- */}
      {sc.problem != null
        ? (() => {
            const b = L.problem.big;
            const g = prog(frame, 100, 128, EASE.out);
            const fade = 1 - prog(frame, 146, 168, EASE.inOutSine);
            if (g <= 0 || fade <= 0) return null;
            const line = (style: React.CSSProperties) => (
              <div style={{position: 'absolute', background: 'rgba(17,17,17,0.14)', opacity: fade, ...style}} />
            );
            return (
              <>
                {line({left: b.x, top: 0, width: 1.5, height: L.H, transform: `scaleY(${g})`, transformOrigin: `50% ${b.y + b.h / 2}px`})}
                {line({left: b.x + b.w - 1.5, top: 0, width: 1.5, height: L.H, transform: `scaleY(${g})`, transformOrigin: `50% ${b.y + b.h / 2}px`})}
                {line({left: 0, top: b.y, width: L.W, height: 1.5, transform: `scaleX(${g})`, transformOrigin: `${b.x + b.w / 2}px 50%`})}
                {line({left: 0, top: b.y + b.h - 1.5, width: L.W, height: 1.5, transform: `scaleX(${g})`, transformOrigin: `${b.x + b.w / 2}px 50%`})}
              </>
            );
          })()
        : null}

      {/* ---- benefit tiles (M is the centre one) ---- */}
      {ch.tiles.map((t, i) => {
        const r = track(frame, t.keys);
        return (
          <Card key={i} rect={r} bg="#D9D4CC">
            <MediaSlot slot={t.slot} w={r.w} h={r.h} zoom={1.02 + 0.03 * Math.sin((frame + i * 40) / 60)} />
          </Card>
        );
      })}

      {/* ---- hook C: the small content card ---- */}
      {sRect ? (
        <Card rect={sRect} bg="#D9D4CC">
          <MediaSlot
            slot="hookMotif"
            w={sRect.w}
            h={sRect.h}
            zoom={1.25}
            filter={`grayscale(${0.9 * sDull}) contrast(${1 - 0.25 * sDull}) brightness(${1 + 0.12 * sDull})`}
            label={false}
          />
        </Card>
      ) : null}

      {/* ---- V2: a second real work ---- */}
      {v2 ? (
        <Card rect={v2} bg="#D9D4CC">
          <MediaSlot slot="workBeauty" w={v2.w} h={v2.h} zoom={1.04} />
        </Card>
      ) : null}

      {/* ---- M ---- */}
      <Card rect={m} bg={C.card} blur={mBlur} shadow={frame > 600 ? SHADOW.lifted : SHADOW.card}>
        {(1 - procIn) * (1 - naiaDirect) > 0.001 ? (
          <div style={{position: 'absolute', inset: 0, opacity: (1 - procIn) * (1 - naiaDirect)}}>
            <MediaSlot
              slot="hookMotif"
              w={m.w}
              h={m.h}
              zoom={mZoom}
              filter={draft > 0.001 ? `blur(${(draft * 14).toFixed(2)}px) grayscale(${draft})` : undefined}
            />
            {draft > 0.001 ? (
              <div style={{position: 'absolute', inset: 0, opacity: draft}}>
                <DraftSkeleton w={m.w} h={m.h} frame={frame} />
              </div>
            ) : null}
            {/* scrim so the hook copy stays legible over any real image */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                opacity: open,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 34%, rgba(0,0,0,0) 56%)',
              }}
            />
          </div>
        ) : null}
        {procIn > 0.001 ? (
          <div style={{position: 'absolute', inset: 0, opacity: procIn}}>
            <ProcessContent k={procK} w={m.w} h={m.h} frame={frame} starts={procStarts} naiaIn={naiaIn} naiaFrom={naiaFrom} />
            {proofMode === 'fallback' && naiaIn > 0.001 ? (
              <div style={{position: 'absolute', inset: 0, opacity: naiaIn}}>{proofMedia(m.w, m.h)}</div>
            ) : null}
          </div>
        ) : null}
        {naiaDirect > 0.001 ? <div style={{position: 'absolute', inset: 0, opacity: naiaDirect}}>{proofMedia(m.w, m.h)}</div> : null}
        {redIn > 0.001 ? <div style={{position: 'absolute', inset: 0, background: C.red, opacity: redIn}} /> : null}
      </Card>

      {/* ---- P: neglected block → brand surface ---- */}
      {p ? (
        <Card rect={p} bg={C.card} shadow={SHADOW.lifted}>
          {pDull > 0.001 ? (
            <div style={{position: 'absolute', inset: 0, opacity: pDull}}>
              <DullPost w={p.w} h={p.h} />
            </div>
          ) : null}
          {pDull < 0.999
            ? (() => {
                const lw = p.w * 0.62;
                const lh = lw / BRAND.logoAspect;
                const edge = Math.sin(Math.PI * logoReveal);
                return (
                  <div style={{position: 'absolute', inset: 0, opacity: 1 - pDull}}>
                    <div
                      style={{
                        position: 'absolute',
                        left: (p.w - lw) / 2 + (1 - logoReveal) * 22,
                        top: (p.h - lh) / 2,
                        transform: `scale(${1.04 - 0.04 * logoReveal})`,
                      }}
                    >
                      <Logo x={0} y={0} w={lw} reveal={logoReveal} />
                      {edge > 0.01 ? (
                        <div
                          style={{
                            position: 'absolute',
                            left: logoReveal * lw * 1.04 - 3,
                            top: -lh * 0.12,
                            width: 6,
                            height: lh * 1.24,
                            borderRadius: 3,
                            background: C.red,
                            opacity: edge,
                          }}
                        />
                      ) : null}
                    </div>
                  </div>
                );
              })()
            : null}
        </Card>
      ) : null}

      {/* =================================================================== */}
      {/* TYPOGRAPHY                                                          */}
      {/* =================================================================== */}

      {/* ---- hook: knockout typography ------------------------------------
           The copy is rendered twice and split exactly along the card's
           contour: ink over paper, white over the image. As the card opens,
           the inversion follows its edge pixel for pixel. */}
      {frame < 106
        ? (() => {
            const rr = (r: Rect) => {
              const k = Math.max(0, Math.min(r.r, r.w / 2, r.h / 2));
              const {x, y, w, h} = r;
              return `M${x + k},${y} H${x + w - k} A${k},${k} 0 0 1 ${x + w},${y + k} V${y + h - k} A${k},${k} 0 0 1 ${x + w - k},${y + h} H${x + k} A${k},${k} 0 0 1 ${x},${y + h - k} V${y + k} A${k},${k} 0 0 1 ${x + k},${y} Z`;
            };
            const inside = `path("${rr(m)}")`;
            const outside = `path(evenodd, "M0,0 H${L.W} V${L.H} H0 Z ${rr(m)}")`;
            const logoO = tw(frame, [-6, 8], [0, 1], EASE.out) * (1 - prog(frame, hookOut - 2, hookOut + 8, EASE.in));
            const copy = (light: boolean) => (
              <>
                <Logo x={L.hook.logo.x} y={L.hook.logo.y} w={L.hook.logo.w} light={light ? 1 : 0} opacity={logoO} />
                {hook !== 'C' ? (
                  <>
                    {H.lines.map((t, i) => (
                      <Line key={t} text={t} x={T.x} y={T.y + i * T.pitch} size={T.size} color={light ? C.white : C.ink} inAt={-8 + i * 3} outAt={hookOut + i * 2} />
                    ))}
                    {H.payoff ? (
                      <Line text={H.payoff} x={T.x} y={L.hook.payoffY} size={T.size} color={light ? '#FF2B1F' : C.red} inAt={40} outAt={hookOut + 4} />
                    ) : null}
                  </>
                ) : (
                  [...H.lines, ...(H.lines2 ?? [])].map((t, i) => {
                    const TC = L.hook.textC;
                    const y = i < 2 ? TC.y + i * TC.pitch : L.hook.text2Y + (i - 2) * TC.pitch;
                    const col = i >= 2 ? (light ? '#FF2B1F' : C.red) : light ? C.white : C.ink;
                    return <Line key={t} text={t} x={TC.x} y={y} size={TC.size} color={col} inAt={i < 2 ? -8 + i * 3 : 34 + (i - 2) * 4} outAt={hookOut + i} />;
                  })
                )}
              </>
            );
            return (
              <>
                <AbsoluteFill style={{clipPath: outside}}>{copy(false)}</AbsoluteFill>
                <AbsoluteFill style={{clipPath: inside}}>{copy(true)}</AbsoluteFill>
              </>
            );
          })()
        : null}

      {/* ---- problem ---- */}
      {sc.problem != null ? (
        <>
          <Line text={COPY.problem.l1} x={L.problem.text.x} y={L.problem.text.y} size={L.problem.text.size} color={C.ink} inAt={sc.problem + 18} outAt={sc.problem + 66} />
          <Line
            text={COPY.problem.l2}
            x={L.problem.text.x}
            y={L.problem.text.y + L.problem.text.pitch}
            size={L.problem.text.size}
            color={C.muted}
            inAt={sc.problem + 30}
            outAt={sc.problem + 68}
          />
        </>
      ) : null}

      {/* ---- solution ---- */}
      {(() => {
        const out = sc.process != null ? sc.process - 38 : sc.proof - 4;
        const t = L.solution.text;
        return (
          <>
            <Eyebrow text={COPY.solution.eyebrow} x={0} y={L.solution.eyebrowY} size={26} color={C.muted} align="center" width={L.W} inAt={ch.cues.logoReveal + 4} outAt={out} />
            <Line text={COPY.solution.l1} x={0} y={t.y} size={t.size} color={C.ink} align="center" width={L.W} inAt={ch.cues.logoReveal + 12} outAt={out} />
            <Line text={COPY.solution.l2} x={0} y={t.y + t.pitch} size={t.size} color={C.ink} align="center" width={L.W} inAt={ch.cues.logoReveal + 17} outAt={out + 2} />
          </>
        );
      })()}

      {/* ---- process ---- */}
      {sc.process != null
        ? (() => {
            const P = L.process;
            const steps = COPY.process.steps;
            const starts = [298, 334, 370, 406, 442];
            const words = [...steps.map((s) => s.word), COPY.process.finale];
            const caps = [...steps.map((s) => s.caption), COPY.process.finaleCaption];
            const barIn = prog(frame, 296, 312, EASE.out);
            const barOut = prog(frame, 474, 484, EASE.in);
            const team = prog(frame, 442, 462, EASE.smooth);
            const segGap = 12 * (1 - team);
            const segW = (L.W - 2 * L.side - 3 * segGap) / 4;
            return (
              <>
                {words.map((w, i) => (
                  <Line key={w} text={w} x={P.word.x} y={P.word.y} size={P.word.size} color={C.ink} inAt={starts[i]} outAt={i < 4 ? starts[i + 1] - 9 : 476} />
                ))}
                {caps.map((c, i) => (
                  <Line
                    key={c}
                    text={c}
                    x={P.word.x + 2}
                    y={P.captionY}
                    size={P.captionSize}
                    color={C.muted}
                    font={FONT.text}
                    weight={500}
                    tracking={TYPE.trackingSmall}
                    inAt={starts[i] + 3}
                    outAt={i < 4 ? starts[i + 1] - 9 : 476}
                  />
                ))}
                {barIn > 0 && barOut < 1 ? (
                  <div style={{position: 'absolute', left: L.side, top: P.barY, width: L.W - 2 * L.side, height: 6, opacity: barIn * (1 - barOut)}}>
                    {[0, 1, 2, 3].map((i) => {
                      const done = clamp01(procK - i + 1); // filled as the card enters state i
                      const active = clamp01(1 - Math.abs(procK - i) * 1.6);
                      const col = team > 0 ? C.red : active > 0.5 ? C.red : done > 0.5 ? C.ink : 'rgba(17,17,17,0.12)';
                      return (
                        <div key={i} style={{position: 'absolute', left: i * (segW + segGap), top: 0, width: segW, height: 6, borderRadius: team > 0.95 ? 0 : 3, background: 'rgba(17,17,17,0.10)', overflow: 'hidden'}}>
                          <div style={{position: 'absolute', inset: 0, background: col, transform: `scaleX(${Math.max(done, team)})`, transformOrigin: '0 50%'}} />
                        </div>
                      );
                    })}
                  </div>
                ) : null}
              </>
            );
          })()
        : null}

      {/* ---- proof ---- */}
      {(() => {
        const P = L.proof;
        const land = ch.cues.proofLand;
        const out = sc.benefit != null ? sc.benefit - 30 : sc.cta - 15;
        if (proofMode === 'fallback') {
          const F = COPY.proofFallback;
          return (
            <>
              <Eyebrow text={F.eyebrow} x={P.colX} y={P.eyebrowY} size={24} color={C.muted} inAt={land - 6} outAt={out} />
              {[F.l1, F.l2, F.l3, F.l4].map((t, i) => (
                <Line key={i} text={t} x={P.colX} y={P.l1Y - 40 + i * (P.textSize * 1.08) + (i >= 2 ? 30 : 0)} size={P.textSize} color={i % 2 ? C.ink : C.muted} inAt={land + 6 + i * 6} outAt={out} />
              ))}
              {F.industries.map((t, i) => (
                <Eyebrow key={t} text={t} x={P.colX} y={P.l1Y + 4 * P.textSize * 1.08 + 60 + i * 40} size={22} color={C.muted} inAt={land + 34 + i * 4} outAt={out} />
              ))}
            </>
          );
        }
        const pr = COPY.proof;
        return (
          <>
            <Eyebrow text={pr.eyebrow} x={P.colX} y={P.eyebrowY} size={22} color={C.muted} inAt={land - 8} outAt={out} />
            <Line text={pr.client} x={P.colX} y={P.clientY} size={P.clientSize} color={C.ink} inAt={land - 4} outAt={out} tracking="-0.02em" />
            {(() => {
              const bp = prog(frame, land + 2, land + 20, EASE.out) * (1 - prog(frame, out, out + 9, EASE.in));
              return bp > 0 ? (
                <div style={{position: 'absolute', left: P.colX, top: P.clientY + P.clientSize * 1.5, width: 64 * bp, height: 6, borderRadius: 3, background: C.red}} />
              ) : null;
            })()}
            <Line text={pr.l1} x={P.colX} y={P.l1Y} size={P.textSize} color={C.ink} inAt={land + 8} outAt={out} />
            <Line text={pr.pre} x={P.colX} y={P.preY} size={P.textSize} color={C.muted} inAt={land + 22} outAt={out} />
            <Line text={pr.figure} x={P.colX} y={P.figY} size={P.figSize} color={C.ink} weight={800} inAt={land + 26} outAt={out} tracking="-0.045em" dur={20} />
            <Line text={pr.post} x={P.colX} y={P.postY} size={P.textSize} color={C.ink} inAt={land + 32} outAt={out} />
            <Line text={pr.source} x={P.colX} y={P.sourceY} size={24} color={C.muted} font={FONT.text} weight={500} tracking="0" inAt={land + 44} outAt={out} />
          </>
        );
      })()}

      {/* ---- benefit ---- */}
      {sc.benefit != null
        ? (() => {
            const t = L.benefit.text;
            const b = sc.benefit;
            const out = 720;
            return (
              <>
                <Line text={COPY.benefit.l1a} x={t.x} y={t.y} size={t.size} color={C.muted} inAt={b + 4} outAt={out} />
                <Line text={COPY.benefit.l1b} x={t.x} y={t.y + t.pitch} size={t.size} color={C.muted} inAt={b + 8} outAt={out + 1} />
                <Line text={COPY.benefit.l2a} x={t.x} y={t.y + t.pitch * 2 + t.size * 0.22} size={t.size} color={C.ink} inAt={b + 26} outAt={out + 2} />
                <Line text={COPY.benefit.l2b} x={t.x} y={t.y + t.pitch * 3 + t.size * 0.22} size={t.size} color={C.ink} inAt={b + 30} outAt={out + 3} />
              </>
            );
          })()
        : null}

      {/* ---- CTA ---- */}
      {(() => {
        const c = L.cta;
        const t0 = ch.cues.ctaText;
        const land = ch.cues.ctaLand;
        const lw = c.logo.w;
        const reveal = prog(frame, t0, t0 + 18, EASE.smooth);
        const labelP = prog(frame, land - 8, land + 6, EASE.out);
        const shimmer = prog(frame, land + 40, land + 66, EASE.inOutSine);
        const b = c.button;
        if (frame < t0 - 1) return null;
        return (
          <>
            <Logo x={c.logo.cx - lw / 2} y={c.logo.y} w={lw} reveal={reveal} opacity={clamp01(reveal * 3)} />
            <Line text={COPY.cta.l1} x={0} y={c.text.y} size={c.text.size} color={C.ink} align="center" width={L.W} inAt={t0 + 3} dur={14} />
            <Line text={COPY.cta.l2} x={0} y={c.text.y + c.text.pitch} size={c.text.size} color={C.ink} align="center" width={L.W} inAt={t0 + 7} dur={14} />
            {labelP > 0 ? (
              <div
                style={{
                  position: 'absolute',
                  left: b.x,
                  top: b.y,
                  width: b.w,
                  height: b.h,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: c.buttonSize * 0.42,
                  opacity: labelP,
                  transform: `translateY(${(1 - labelP) * 14}px)`,
                  fontFamily: FONT.display,
                  fontWeight: 700,
                  fontSize: c.buttonSize,
                  letterSpacing: '-0.02em',
                  color: C.white,
                  whiteSpace: 'nowrap',
                }}
              >
                {COPY.cta.button}
                <Arrow size={c.buttonSize * 0.92} color={C.white} />
              </div>
            ) : null}
            {shimmer > 0 && shimmer < 1 ? (
              <div style={{position: 'absolute', left: b.x, top: b.y, width: b.w, height: b.h, borderRadius: b.r, overflow: 'hidden', pointerEvents: 'none'}}>
                <div
                  style={{
                    position: 'absolute',
                    top: -b.h,
                    height: b.h * 3,
                    width: 140,
                    left: -200 + shimmer * (b.w + 400),
                    transform: 'rotate(18deg)',
                    background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0) 100%)',
                  }}
                />
              </div>
            ) : null}
            <Line text={COPY.cta.sub} x={0} y={c.subY} size={c.subSize} color={C.muted} font={FONT.text} weight={500} tracking="0" align="center" width={L.W} inAt={land - 4} dur={12} />
            <Line text={COPY.cta.url} x={0} y={c.urlY} size={c.urlSize} color={C.ink} align="center" width={L.W} inAt={land - 1} dur={12} tracking="-0.02em" />
          </>
        );
      })()}

      <Finish />
      {qa !== 'none' ? <SafeZones L={L} mode={qa} /> : null}
      {!silent ? <AdAudio cut={cut} hook={hook} cues={ch.cues} /> : null}
    </AbsoluteFill>
  );
};
