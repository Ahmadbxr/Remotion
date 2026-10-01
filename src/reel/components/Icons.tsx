import React from 'react';
import {interpolate} from 'remotion';
import {BRAND} from '../theme';

const clamp01 = (v: number) => Math.min(Math.max(v, 0), 1);
const seg = (p: number, from: number, to: number) => clamp01(interpolate(p, [from, to], [0, 1]));

/**
 * Four icon glyphs, one per service, each with genuine INTERNAL animation
 * driven by a single 0-1 `progress` — never a static shape that just fades
 * or scales in as a whole. Every part is centered on its own 120x120
 * viewBox with deterministic geometry (no hand-picked pixel offsets), so
 * none of them can drift off-center the way an earlier icon once did.
 */

const SIZE = 120;

export const ContentIcon: React.FC<{progress: number}> = ({progress: p}) => {
  const frame = seg(p, 0, 0.45); // outer frame draws first
  const timeline = seg(p, 0.35, 0.75); // timeline bar grows
  const play = seg(p, 0.65, 1); // play triangle scales in last, the payoff
  const frameLen = 2 * (84 + 60);
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120">
      <rect
        x={18}
        y={30}
        width={84}
        height={60}
        rx={12}
        fill="none"
        stroke={BRAND.ink}
        strokeWidth={3}
        strokeDasharray={frameLen}
        strokeDashoffset={frameLen * (1 - frame)}
      />
      <rect x={30} y={78} width={60 * timeline} height={4} rx={2} fill={BRAND.red} opacity={frame} />
      <polygon
        points="52,48 52,72 78,60"
        fill={BRAND.ink}
        opacity={play}
        transform={`translate(60 60) scale(${0.6 + 0.4 * play}) translate(-60 -60)`}
      />
    </svg>
  );
};

export const StrategyIcon: React.FC<{progress: number}> = ({progress: p}) => {
  const nodes: [number, number][] = [
    [24, 84],
    [50, 40],
    [78, 66],
    [98, 30],
  ];
  const nodeP = nodes.map((_, i) => seg(p, i * 0.18, i * 0.18 + 0.32));
  const lineP = (i: number) => seg(p, 0.1 + i * 0.18, 0.1 + i * 0.18 + 0.28);
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120">
      {nodes.slice(0, -1).map(([x1, y1], i) => {
        const [x2, y2] = nodes[i + 1];
        const t = lineP(i);
        return (
          <line
            key={i}
            x1={x1}
            y1={y1}
            x2={x1 + (x2 - x1) * t}
            y2={y1 + (y2 - y1) * t}
            stroke={BRAND.red}
            strokeWidth={3}
          />
        );
      })}
      {nodes.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r={interpolate(nodeP[i], [0, 1], [0, 7])} fill={BRAND.ink} />
      ))}
    </svg>
  );
};

export const SocialIcon: React.FC<{progress: number}> = ({progress: p}) => {
  const cards = [0, 1, 2];
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120">
      {cards.map((i) => {
        const cp = seg(p, i * 0.2, i * 0.2 + 0.45);
        const restY = 30 + i * 14;
        const startY = restY + 40;
        const y = interpolate(cp, [0, 1], [startY, restY]);
        const scale = interpolate(cp, [0, 0.7, 1], [0.7, 1.04, 1]);
        return (
          <rect
            key={i}
            x={26 - i * 4}
            y={y}
            width={68}
            height={30}
            rx={8}
            fill={i === 2 ? BRAND.red : '#FFFFFF'}
            stroke={BRAND.ink}
            strokeWidth={i === 2 ? 0 : 2}
            opacity={cp}
            transform={`translate(60 ${y + 15}) scale(${scale}) translate(-60 ${-(y + 15)})`}
          />
        );
      })}
    </svg>
  );
};

export const CreatorIcon: React.FC<{progress: number}> = ({progress: p}) => {
  const subject = seg(p, 0, 0.4);
  const corners = seg(p, 0.3, 0.85);
  const flash = seg(p, 0.8, 1);
  const c = 18;
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 120 120">
      <circle cx={60} cy={60} r={interpolate(subject, [0, 1], [0, 20])} fill={BRAND.surface} stroke={BRAND.ink} strokeWidth={2} />
      {/* four corner brackets drawing in — a camera-frame finding focus */}
      {[
        [22, 22, 1, 1],
        [98, 22, -1, 1],
        [22, 98, 1, -1],
        [98, 98, -1, -1],
      ].map(([x, y, dx, dy], i) => (
        <path
          key={i}
          d={`M ${x} ${y + dy * c * corners} L ${x} ${y} L ${x + dx * c * corners} ${y}`}
          fill="none"
          stroke={BRAND.red}
          strokeWidth={4}
          strokeLinecap="round"
        />
      ))}
      <circle cx={60} cy={60} r={26} fill="none" stroke={BRAND.red} strokeWidth={2} opacity={flash * 0.6} />
    </svg>
  );
};

export type ServiceIconKind = 'content' | 'strategy' | 'social' | 'creator';

export const AnimatedIcon: React.FC<{kind: ServiceIconKind; progress: number}> = ({kind, progress: p}) => {
  if (kind === 'content') return <ContentIcon progress={p} />;
  if (kind === 'strategy') return <StrategyIcon progress={p} />;
  if (kind === 'social') return <SocialIcon progress={p} />;
  return <CreatorIcon progress={p} />;
};
