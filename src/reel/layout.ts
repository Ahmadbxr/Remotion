import React from 'react';
import {HEIGHT, WIDTH} from './theme';

// ---------------------------------------------------------------------------
// SOCIAL SAFE ZONES — one system, not a guess per element.
//
// A 9:16 Reel is never seen edge to edge. The platform paints its own UI
// over the frame, and the areas it takes are consistent enough to design
// against:
//
//   top     profile row / status bar
//   bottom  caption, handle, audio ticker, the platform's own CTA — this is
//           the deepest one by far and the one most often underestimated
//   right   the like / comment / share / more column, which only exists
//           over the LOWER part of the frame
//
// The rule the Reel follows: DECORATIVE motion may cross these lines freely
// (a red field flooding the frame, a graphic streak, type bleeding off an
// edge as a gesture). INFORMATION may not — headline, logo, metrics, CTA
// and any UI the viewer is meant to read stay inside `CONTENT`.
// ---------------------------------------------------------------------------

export const SAFE = {
  top: 260,
  bottom: 400,
  left: 72,
  right: 72,
  /** The action column is narrow but deep; it only bites below `railTop`. */
  rail: 176,
  railTop: 880,
} as const;

export const CONTENT = {
  left: SAFE.left,
  right: WIDTH - SAFE.right,
  top: SAFE.top,
  bottom: HEIGHT - SAFE.bottom,
} as const;

export const CONTENT_W = CONTENT.right - CONTENT.left;

/** The usable right edge at a given y — tighter where the action column is.
 *  Call this instead of hard-coding a width next to anything readable. */
export const rightEdgeAt = (y: number) => (y >= SAFE.railTop ? WIDTH - SAFE.rail : CONTENT.right);

/** Usable width for a block whose top sits at `y`. */
export const widthAt = (y: number) => rightEdgeAt(y) - CONTENT.left;

/**
 * QC overlay. Never rendered in output — it exists so safe-zone checks are
 * done by LOOKING at the guides on a still, rather than by re-deriving
 * pixel arithmetic by hand every time a block moves.
 */
export const SafeZoneGuides: React.FC<{enabled?: boolean}> = ({enabled = false}) => {
  if (!enabled) return null;
  const band = (style: React.CSSProperties) =>
    React.createElement('div', {style: {position: 'absolute', background: 'rgba(242,5,5,0.16)', ...style}});
  return React.createElement(
    React.Fragment,
    null,
    band({left: 0, right: 0, top: 0, height: SAFE.top}),
    band({left: 0, right: 0, bottom: 0, height: SAFE.bottom}),
    band({left: 0, top: 0, bottom: 0, width: SAFE.left}),
    band({right: 0, top: 0, bottom: 0, width: SAFE.right}),
    band({right: 0, top: SAFE.railTop, bottom: SAFE.bottom, width: SAFE.rail, background: 'rgba(0,80,255,0.16)'}),
  );
};
