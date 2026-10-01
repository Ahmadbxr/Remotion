// What lives INSIDE the production card. One card, four states of the same
// motif — idea board → recording window → edit view → finished post — so the
// viewer watches a single piece of content being made, not four slides.
import React from 'react';
import {COPY} from '../config';
import {clamp01, hash01, prog, tw} from '../anim';
import {C, EASE, FONT, TYPE} from '../theme';
import {MediaSlot} from './MediaSlot';
import {Bookmark, Bubble, Heart, Send} from './Icons';

type Props = {
  k: number; // 0 idea · 1 shoot · 2 edit · 3 post (continuous while morphing)
  w: number;
  h: number;
  frame: number;
  starts: [number, number, number, number]; // frame each state is entered
  naiaIn: number; // 0..1: the finished post becomes the NAIA case video
  naiaFrom: number;
};

const layerOpacity = (k: number, i: number) => clamp01(1 - Math.abs(k - i) * 1.35);

const Idea: React.FC<{w: number; h: number; frame: number; at: number}> = ({w, h, frame, at}) => {
  const pad = w * 0.06;
  const gap = w * 0.032;
  const fw = (w - pad * 2 - gap * 2) / 3;
  const fh = Math.min(fw * 1.28, h * 0.58);
  const top = pad + h * 0.115;
  const s = h * 0.038;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.card}}>
      <div
        style={{
          position: 'absolute',
          left: pad,
          top: pad,
          fontFamily: FONT.text,
          fontWeight: 600,
          fontSize: s,
          letterSpacing: TYPE.eyebrowTracking,
          color: C.muted,
          textTransform: 'uppercase',
        }}
      >
        {COPY.process.board.label}
      </div>
      <div style={{position: 'absolute', right: pad, top: pad + s * 0.18, width: s * 0.7, height: s * 0.7, borderRadius: s, background: C.red}} />
      {COPY.process.board.frames.map((name, i) => {
        const p = prog(frame, at + 4 + i * 4, at + 22 + i * 4, EASE.out);
        const x = pad + i * (fw + gap);
        return (
          <div key={name} style={{position: 'absolute', left: x, top: top + (1 - p) * 26, opacity: clamp01(p * 1.5)}}>
            <div style={{position: 'relative', width: fw, height: fh, borderRadius: 14, overflow: 'hidden', background: '#E6E2DC'}}>
              <MediaSlot
                slot="hookMotif"
                w={fw}
                h={fh}
                zoom={1.5 + i * 0.25}
                filter="grayscale(1) contrast(0.92) brightness(1.06)"
                label={false}
                focusShift={[(i - 1) * 14, (i - 1) * -6]}
              />
              <div style={{position: 'absolute', inset: 0, border: '1.5px dashed rgba(255,255,255,0.55)', borderRadius: 14}} />
            </div>
            <div style={{marginTop: h * 0.03, fontFamily: FONT.text, fontWeight: 600, fontSize: s * 0.8, letterSpacing: '0.08em', color: C.faint}}>
              {String(i + 1).padStart(2, '0')}
            </div>
            <div style={{fontFamily: FONT.display, fontWeight: 700, fontSize: s * 1.18, letterSpacing: TYPE.trackingSmall, color: C.ink}}>
              {name}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const Shoot: React.FC<{w: number; h: number; frame: number; at: number}> = ({w, h, frame, at}) => {
  const inset = 12;
  const arm = Math.min(w, h) * 0.085;
  const bi = Math.min(w, h) * 0.075;
  const s = h * 0.042;
  const focus = tw(frame, [at + 6, at + 22], [1.35, 1], EASE.out);
  const focusO = tw(frame, [at + 6, at + 12], [0, 1], EASE.out) * tw(frame, [at + 30, at + 40], [1, 0.55], EASE.inOutSine);
  const bracket = (style: React.CSSProperties) => (
    <div style={{position: 'absolute', width: arm, height: arm, borderColor: 'rgba(255,255,255,0.92)', borderStyle: 'solid', borderWidth: 0, ...style}} />
  );
  const fsz = Math.min(w, h) * 0.17;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.night}}>
      <div style={{position: 'absolute', left: inset, top: inset, right: inset, bottom: inset, borderRadius: 24, overflow: 'hidden'}}>
        <MediaSlot slot="hookMotif" w={w - inset * 2} h={h - inset * 2} zoom={1.12} label={false} />
        {bracket({left: bi, top: bi, borderLeftWidth: 4, borderTopWidth: 4})}
        {bracket({right: bi, top: bi, borderRightWidth: 4, borderTopWidth: 4})}
        {bracket({left: bi, bottom: bi, borderLeftWidth: 4, borderBottomWidth: 4})}
        {bracket({right: bi, bottom: bi, borderRightWidth: 4, borderBottomWidth: 4})}
        <div style={{position: 'absolute', left: bi + arm * 0.35, top: bi + arm * 0.35, display: 'flex', alignItems: 'center', gap: s * 0.4}}>
          <div style={{width: s * 0.62, height: s * 0.62, borderRadius: s, background: C.red}} />
          <div style={{fontFamily: FONT.text, fontWeight: 700, fontSize: s, letterSpacing: '0.12em', color: C.white}}>{COPY.process.rec}</div>
        </div>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: fsz,
            height: fsz,
            marginLeft: -fsz / 2,
            marginTop: -fsz / 2,
            border: '2.5px solid rgba(255,255,255,0.9)',
            borderRadius: 6,
            transform: `scale(${focus})`,
            opacity: focusO,
          }}
        />
      </div>
    </div>
  );
};

const Edit: React.FC<{w: number; h: number; frame: number; at: number}> = ({w, h, frame, at}) => {
  const pad = 14;
  const previewH = h * 0.66;
  const tlTop = previewH + pad * 2;
  const tlH = h - tlTop - pad;
  const trackH = (tlH - 12) / 3;
  const innerW = w - pad * 2;
  const s = h * 0.034;
  const play = tw(frame, [at, at + 44], [0.06, 0.92], EASE.inOutSine);
  const clips = [0.24, 0.3, 0.18, 0.28];
  let acc = 0;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.nightUi}}>
      <div style={{position: 'absolute', left: pad, top: pad, width: innerW, height: previewH, borderRadius: 18, overflow: 'hidden'}}>
        <MediaSlot slot="hookMotif" w={innerW} h={previewH} zoom={1.2} label={false} />
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: previewH * 0.1,
            transform: 'translateX(-50%)',
            background: 'rgba(255,255,255,0.94)',
            borderRadius: 10,
            padding: `${s * 0.28}px ${s * 0.6}px`,
            fontFamily: FONT.display,
            fontWeight: 700,
            fontSize: s * 1.1,
            letterSpacing: TYPE.trackingSmall,
            color: C.ink,
            whiteSpace: 'nowrap',
          }}
        >
          {COPY.process.subtitle}
        </div>
      </div>
      {/* timeline: picture, subtitles, sound */}
      <div style={{position: 'absolute', left: pad, top: tlTop, width: innerW, height: tlH}}>
        {clips.map((c, i) => {
          const x = acc * innerW;
          acc += c;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: x + 2,
                top: 0,
                width: c * innerW - 4,
                height: trackH,
                borderRadius: 6,
                background: i % 2 ? '#4A4744' : '#5A5550',
              }}
            />
          );
        })}
        {[0.04, 0.3, 0.55, 0.78].map((x, i) => (
          <div key={i} style={{position: 'absolute', left: x * innerW, top: trackH + 6 + trackH * 0.3, width: innerW * 0.16, height: trackH * 0.4, borderRadius: 4, background: 'rgba(255,255,255,0.72)'}} />
        ))}
        {Array.from({length: 46}).map((_, i) => {
          const amp = 0.18 + 0.82 * Math.abs(Math.sin(i * 0.61) * (0.45 + 0.55 * hash01(i)));
          const bw = innerW / 46;
          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: i * bw + bw * 0.2,
                top: trackH * 2 + 12 + (trackH * (1 - amp)) / 2,
                width: bw * 0.6,
                height: trackH * amp,
                borderRadius: 2,
                background: '#77726B',
              }}
            />
          );
        })}
        <div style={{position: 'absolute', left: play * innerW - 1.5, top: -6, width: 3, height: tlH + 6, background: C.red, borderRadius: 2}} />
        <div style={{position: 'absolute', left: play * innerW - 6, top: -10, width: 12, height: 12, borderRadius: 3, background: C.red}} />
      </div>
    </div>
  );
};

const Post: React.FC<{w: number; h: number; frame: number; naiaIn: number; naiaFrom: number}> = ({w, h, naiaIn, naiaFrom}) => {
  const head = h * 0.095;
  const foot = h * 0.17;
  const s = h * 0.03;
  const ui = 1 - naiaIn;
  // media window grows from the post layout to the whole card
  const mx = 12 * ui;
  const my = head * ui;
  const mw = w - mx * 2;
  const mh = h - my - foot * ui - 12 * ui;
  return (
    <div style={{position: 'absolute', inset: 0, background: C.card}}>
      <div style={{position: 'absolute', left: 16, top: 0, height: head, right: 16, display: 'flex', alignItems: 'center', gap: s * 0.6, opacity: ui}}>
        <div style={{width: head * 0.52, height: head * 0.52, borderRadius: head, background: '#D9D3CA'}} />
        <div style={{fontFamily: FONT.text, fontWeight: 600, fontSize: s * 1.05, color: C.ink, letterSpacing: TYPE.trackingSmall}}>
          {COPY.process.postName}
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', gap: 4}}>
          {[0, 1, 2].map((i) => (
            <div key={i} style={{width: 5, height: 5, borderRadius: 3, background: C.faint}} />
          ))}
        </div>
      </div>
      <div style={{position: 'absolute', left: mx, top: my, width: mw, height: mh, borderRadius: 18 * ui, overflow: 'hidden'}}>
        <div style={{position: 'absolute', inset: 0, opacity: 1 - naiaIn}}>
          <MediaSlot slot="hookMotif" w={mw} h={mh} zoom={1.1} label={false} />
        </div>
        <div style={{position: 'absolute', inset: 0, opacity: naiaIn}}>
          <MediaSlot slot="naiaReel" w={mw} h={mh} videoFrom={naiaFrom} />
        </div>
      </div>
      <div style={{position: 'absolute', left: 18, right: 18, bottom: 12, height: foot - 12, opacity: ui}}>
        <div style={{display: 'flex', alignItems: 'center', gap: s * 0.75, height: foot * 0.42}}>
          <Heart size={s * 1.5} color={C.ink} />
          <Bubble size={s * 1.5} color={C.ink} />
          <Send size={s * 1.5} color={C.ink} />
          <div style={{marginLeft: 'auto'}}>
            <Bookmark size={s * 1.5} color={C.ink} />
          </div>
        </div>
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: foot * 0.05}}>
          {COPY.process.planDays.map((d, i) => {
            const on = (COPY.process.planDots as readonly number[]).includes(i);
            return (
              <div key={d} style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5}}>
                <div style={{fontFamily: FONT.text, fontWeight: 600, fontSize: s * 0.72, color: on ? C.ink : C.faint}}>{d}</div>
                <div style={{width: 7, height: 7, borderRadius: 4, background: on ? C.red : 'rgba(17,17,17,0.10)'}} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export const ProcessContent: React.FC<Props> = ({k, w, h, frame, starts, naiaIn, naiaFrom}) => {
  const layers = [
    <Idea key="i" w={w} h={h} frame={frame} at={starts[0]} />,
    <Shoot key="s" w={w} h={h} frame={frame} at={starts[1]} />,
    <Edit key="e" w={w} h={h} frame={frame} at={starts[2]} />,
    <Post key="p" w={w} h={h} frame={frame} naiaIn={naiaIn} naiaFrom={naiaFrom} />,
  ];
  return (
    <>
      {layers.map((el, i) => {
        const o = layerOpacity(k, i);
        if (o <= 0.001) return null;
        return (
          <div key={i} style={{position: 'absolute', inset: 0, opacity: o, transform: `scale(${0.97 + 0.03 * o})`}}>
            {el}
          </div>
        );
      })}
    </>
  );
};
