// The animation layer shared by NaiaPreview (over the clip) and NaiaOverlay
// (on transparency). Pure function of the frame: renders identically every time.
import React from 'react';
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {NAIA, sec} from './config';
import {ensureNaiaFonts} from './fonts';

ensureNaiaFonts();

const easeOut = Easing.bezier(0.22, 0.61, 0.36, 1);
const easeIn = Easing.bezier(0.55, 0, 0.75, 0.45);
const clamp = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

export const Headline: React.FC = () => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const k = width / NAIA.refWidth;
  const h = NAIA.headline;
  const a = sec(h.inSec);
  const b = sec(h.inSec + h.fadeSec);
  const d = sec(h.outEndSec);
  const c = d - sec(h.outFadeSec);
  if (frame < a || frame > d) return null;
  const inP = interpolate(frame, [a, b], [0, 1], {...clamp, easing: easeOut});
  const outP = interpolate(frame, [c, d], [0, 1], {...clamp, easing: easeIn});
  const opacity = inP * (1 - outP);
  // rises a few pixels on the way in, drifts on by a hair while fading out
  const y = ((1 - inP) * h.risePx - outP * h.risePx * 0.25) * k;
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        width,
        top: height * h.cy - h.size * k * 0.6,
        textAlign: 'center',
        opacity,
        transform: `translateY(${y.toFixed(2)}px)`,
        fontFamily: `'${NAIA.fonts.display.family}', serif`,
        fontWeight: h.weight,
        fontSize: h.size * k,
        lineHeight: 1.2,
        letterSpacing: h.tracking,
        // optical centring: letter-spacing adds trailing space after the last glyph
        paddingLeft: h.tracking,
        color: NAIA.color,
        textShadow: `0 ${3 * k}px ${28 * k}px rgba(0,0,0,0.38)`,
        whiteSpace: 'nowrap',
      }}
    >
      {h.useDe ? h.textDe : h.text}
    </div>
  );
};

export const Logo: React.FC<{tempLabel?: boolean}> = ({tempLabel = false}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const k = width / NAIA.refWidth;
  const l = NAIA.logo;
  const a = Math.min(sec(l.inSec), durationInFrames - 1);
  const b = sec(l.inSec + l.fadeSec);
  if (frame < a) return null;
  const p = interpolate(frame, [a, b], [0, 1], {...clamp, easing: easeOut});
  const w = width * l.widthFrac;
  const wrap: React.CSSProperties = {
    position: 'absolute',
    left: width * l.cx - w / 2,
    width: w,
    top: height * l.cy,
    transform: `translateY(calc(-50% + ${((1 - p) * l.risePx * k).toFixed(2)}px))`,
    opacity: p,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };
  if (l.src) {
    return (
      <div style={wrap}>
        <Img src={staticFile(l.src)} style={{width: w, height: 'auto'}} />
      </div>
    );
  }
  // TEMPORARY wordmark — replace by setting NAIA.logo.src to the real logo
  const nameSize = w * 0.3;
  return (
    <div style={wrap}>
      <div
        style={{
          fontFamily: `'${NAIA.fonts.display.family}', serif`,
          fontWeight: 500,
          fontSize: nameSize,
          lineHeight: 1,
          letterSpacing: '0.32em',
          paddingLeft: '0.32em',
          color: l.color,
        }}
      >
        {l.tempName}
      </div>
      <div style={{width: w * 0.16, height: Math.max(1.5, 3 * k), background: l.color, opacity: 0.75, margin: `${nameSize * 0.22}px 0`}} />
      <div
        style={{
          fontFamily: `'${NAIA.fonts.text.family}', sans-serif`,
          fontWeight: 500,
          fontSize: nameSize * 0.2,
          letterSpacing: '0.34em',
          paddingLeft: '0.34em',
          color: l.color,
          whiteSpace: 'nowrap',
        }}
      >
        {l.tempSub}
      </div>
      {tempLabel ? (
        <div
          style={{
            marginTop: nameSize * 0.35,
            padding: `${10 * k}px ${26 * k}px`,
            borderRadius: 999,
            background: 'rgba(255,0,90,0.85)',
            color: '#fff',
            fontFamily: `'${NAIA.fonts.text.family}', sans-serif`,
            fontWeight: 500,
            fontSize: 34 * k,
            whiteSpace: 'nowrap',
          }}
        >
          TEMPORÄRE WORTMARKE – durch echtes NAIA-Logo ersetzen
        </div>
      ) : null}
    </div>
  );
};

/** QA guides: phone-UI zones of Reels/TikTok and the side margins */
export const Guides: React.FC = () => {
  const {width, height} = useVideoConfig();
  const hatch = `repeating-linear-gradient(135deg, rgba(255,0,90,0.18) 0 ${28 * width / NAIA.refWidth}px, rgba(255,0,90,0.06) ${28 * width / NAIA.refWidth}px ${56 * width / NAIA.refWidth}px)`;
  const m = width * 0.06;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: height * 0.14, background: hatch}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: height * 0.35, background: hatch}} />
      <div style={{position: 'absolute', left: m, right: m, top: 0, bottom: 0, borderLeft: '4px dashed rgba(255,0,90,0.8)', borderRight: '4px dashed rgba(255,0,90,0.8)'}} />
    </AbsoluteFill>
  );
};

export const NaiaGraphics: React.FC<{tempLabel?: boolean}> = ({tempLabel}) => (
  <AbsoluteFill>
    <Headline />
    <Logo tempLabel={tempLabel} />
  </AbsoluteFill>
);
