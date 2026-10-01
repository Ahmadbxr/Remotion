// A media window. With a file configured it shows the real Offscript work
// (OffthreadVideo / Img, cover-fit, focus-anchored zoom). Without one it shows
// a clearly labelled placeholder — a softly lit studio sweep — so nothing in
// the film ever pretends to be client work.
import React from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {MEDIA, MediaSlotId, QA} from '../config';
import {FONT} from '../theme';

const TONES: Record<string, [string, string]> = {
  warm: ['#A08E7C', '#51463D'],
  blush: ['#AE958F', '#56464A'],
  stone: ['#9A958D', '#4E4B47'],
  slate: ['#8A929B', '#434950'],
  sand: ['#A59A87', '#585043'],
};

type Props = {
  slot: MediaSlotId;
  w: number;
  h: number;
  zoom?: number;
  filter?: string;
  label?: boolean;
  /** absolute frame at which a video slot starts playing */
  videoFrom?: number;
  focusShift?: [number, number];
};

export const MediaSlot: React.FC<Props> = ({slot, w, h, zoom = 1, filter, label = true, videoFrom = 0, focusShift}) => {
  const m = MEDIA[slot];
  const fx = Math.min(100, Math.max(0, m.focus[0] + (focusShift?.[0] ?? 0)));
  const fy = Math.min(100, Math.max(0, m.focus[1] + (focusShift?.[1] ?? 0)));
  const layer: React.CSSProperties = {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: `${fx}% ${fy}%`,
    transform: `scale(${zoom})`,
    transformOrigin: `${fx}% ${fy}%`,
    filter,
  };

  if (m.src) {
    if (m.kind === 'video') {
      return (
        <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
          <Sequence from={videoFrom} layout="none">
            <OffthreadVideo
              src={staticFile(m.src)}
              muted
              startFrom={Math.round((m.startFromSeconds ?? 0) * 30)}
              style={layer}
            />
          </Sequence>
        </div>
      );
    }
    return (
      <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
        <Img src={staticFile(m.src)} style={layer} />
      </div>
    );
  }

  // ---- placeholder -------------------------------------------------------
  const [light, dark] = TONES[m.tone];
  const s = Math.max(10, Math.min(30, Math.min(w, h) * 0.05));
  const showLabel = label && QA.showPlaceholderLabels && Math.min(w, h) >= 150;
  return (
    <div style={{position: 'absolute', inset: 0, overflow: 'hidden'}}>
      <div
        style={{
          ...layer,
          background: `radial-gradient(120% 85% at ${fx}% 28%, ${light} 0%, ${dark} 78%)`,
        }}
      >
        {/* the floor of a seamless studio sweep */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: '64%',
            bottom: 0,
            background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.20) 100%)',
          }}
        />
      </div>
      {showLabel ? (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: s * 0.55,
            color: 'rgba(255,255,255,0.82)',
            fontFamily: FONT.text,
            textAlign: 'center',
            padding: s,
          }}
        >
          <svg width={s * 1.9} height={s * 1.5} viewBox="0 0 38 30" fill="none">
            <rect x="1.5" y="6" width="35" height="22" rx="5" stroke="currentColor" strokeWidth="2.4" />
            <circle cx="19" cy="17" r="6" stroke="currentColor" strokeWidth="2.4" />
            <path d="M12 6 L15 1.5 H23 L26 6" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round" />
          </svg>
          <div style={{fontSize: s * 0.62, fontWeight: 700, letterSpacing: '0.16em', opacity: 0.75}}>
            PLATZHALTER
          </div>
          <div style={{fontSize: s, fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.15, maxWidth: w * 0.84}}>
            {m.label}
          </div>
        </div>
      ) : null}
    </div>
  );
};
