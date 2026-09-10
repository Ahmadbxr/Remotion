import React from 'react';
import {BRAND, MONO} from '../theme';

// ---------------------------------------------------------------------------
// The Reel's recurring graphic system — three motifs reused across every
// beat so the film reads as ONE designed system, not seven unrelated
// scenes: a red line (underline / connector / timeline / playhead), frame
// corners (content / camera / focus), and tiny meta type (index numbers,
// format, location). Used sparingly by design.
// ---------------------------------------------------------------------------

/** The red line — a single div, reused as underline/connector/timeline by
 *  whoever calls it. `progress` (0-1) drives length via scaleX/scaleY from
 *  `origin`, never by animating width directly (keeps it GPU-cheap and
 *  layout-stable). */
export const GraphicLine: React.FC<{
  orientation?: 'h' | 'v';
  length: number;
  thickness?: number;
  progress: number;
  origin?: 'start' | 'end' | 'center';
  color?: string;
  style?: React.CSSProperties;
}> = ({orientation = 'h', length, thickness = 4, progress, origin = 'start', color = BRAND.red, style}) => {
  const transformOrigin = origin === 'start' ? '0% 0%' : origin === 'end' ? '100% 100%' : '50% 50%';
  return (
    <div
      style={{
        width: orientation === 'h' ? length : thickness,
        height: orientation === 'h' ? thickness : length,
        background: color,
        borderRadius: thickness / 2,
        transform: orientation === 'h' ? `scaleX(${progress})` : `scaleY(${progress})`,
        transformOrigin,
        ...style,
      }}
    />
  );
};

/** A small marker traveling along an implicit line — the "playhead"
 *  variant of the red-line motif (used for EDIT's scrubber). */
export const GraphicPlayhead: React.FC<{trackWidth: number; progress: number; style?: React.CSSProperties}> = ({
  trackWidth,
  progress,
  style,
}) => (
  <div
    style={{
      position: 'absolute',
      width: 3,
      height: 22,
      borderRadius: 2,
      background: BRAND.red,
      left: 0,
      // Transform, not `left` — a layout property animated frame by frame
      // gets pixel-snapped and the playhead sweeps in visible steps.
      transform: `translateX(${trackWidth * progress}px)`,
      ...style,
    }}
  />
);

/** Frame corners — the content/camera/focus motif. `progress` 0 = fully
 *  open (no brackets), 1 = fully drawn. */
export const GraphicFrame: React.FC<{
  width: number;
  height: number;
  progress: number;
  cornerLen?: number;
  color?: string;
  strokeWidth?: number;
}> = ({width, height, progress, cornerLen = 20, color = BRAND.ink, strokeWidth = 3}) => {
  const c = cornerLen * Math.min(Math.max(progress, 0), 1);
  const corners: [number, number, number, number][] = [
    [0, 0, 1, 1],
    [width, 0, -1, 1],
    [0, height, 1, -1],
    [width, height, -1, -1],
  ];
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {corners.map(([x, y, dx, dy], i) => (
        <path
          key={i}
          d={`M ${x} ${y + dy * c} L ${x} ${y} L ${x + dx * c} ${y}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
};

/** Tiny meta type — "01/04", "1080x1920", "ZÜRICH". Used sparingly for
 *  editorial texture, never as primary information. */
export const MetaLabel: React.FC<{
  text: string;
  opacity?: number;
  color?: string;
  style?: React.CSSProperties;
}> = ({text, opacity = 1, color = BRAND.muted, style}) => (
  <div
    style={{
      fontFamily: MONO,
      fontSize: 18,
      fontWeight: 600,
      letterSpacing: 3,
      color,
      opacity,
      whiteSpace: 'nowrap',
      ...style,
    }}
  >
    {text}
  </div>
);
