// QA-only overlay: simulates the ad UI of the target placements so the
// previews can be checked for covered text/logo/CTA. Never in a delivery file.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Layout} from '../layout';

const hatch = 'repeating-linear-gradient(135deg, rgba(255,0,90,0.16) 0 14px, rgba(255,0,90,0.06) 14px 28px)';

export const SafeZones: React.FC<{L: Layout; mode: 'reels' | 'feed'}> = ({L, mode}) => {
  if (mode === 'feed') {
    const m = L.side;
    return (
      <AbsoluteFill style={{pointerEvents: 'none'}}>
        <div style={{position: 'absolute', left: m, top: m, right: m, bottom: m, border: '2px dashed rgba(255,0,90,0.8)'}} />
        <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: m, background: hatch}} />
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: m, background: hatch}} />
      </AbsoluteFill>
    );
  }
  const bottom = L.H - L.safeBottom;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', fontFamily: 'Inter, sans-serif'}}>
      <div style={{position: 'absolute', left: 0, right: 0, top: 0, height: L.safeTop, background: hatch}} />
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: bottom, background: hatch}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: L.safeTop, borderTop: '2px dashed rgba(255,0,90,0.85)'}} />
      <div style={{position: 'absolute', left: 0, right: 0, top: L.safeBottom, borderTop: '2px dashed rgba(255,0,90,0.85)'}} />
      {/* mock platform UI */}
      <div style={{position: 'absolute', left: 40, top: 120, color: 'rgba(255,255,255,0.95)', fontSize: 34, fontWeight: 700, textShadow: '0 1px 6px rgba(0,0,0,0.6)'}}>Reels</div>
      {[0, 1, 2, 3, 4].map((i) => (
        <div key={i} style={{position: 'absolute', right: 34, top: 1160 + i * 132, width: 76, height: 76, borderRadius: 40, background: 'rgba(30,30,30,0.55)', border: '2px solid rgba(255,255,255,0.8)'}} />
      ))}
      <div style={{position: 'absolute', left: 40, bottom: 300, width: 300, height: 34, borderRadius: 8, background: 'rgba(30,30,30,0.55)'}} />
      <div style={{position: 'absolute', left: 40, bottom: 250, width: 620, height: 26, borderRadius: 8, background: 'rgba(30,30,30,0.45)'}} />
      <div style={{position: 'absolute', left: 40, bottom: 120, width: 1000, height: 92, borderRadius: 14, background: 'rgba(30,30,30,0.65)', color: '#fff', fontSize: 32, fontWeight: 600, display: 'flex', alignItems: 'center', paddingLeft: 32}}>Mehr dazu</div>
    </AbsoluteFill>
  );
};
