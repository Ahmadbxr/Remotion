// Line icons drawn as SVG in theme colours (never emoji).
import React from 'react';

type P = {size: number; color: string; stroke?: number};

export const Heart: React.FC<P> = ({size, color, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 20.5s-7.5-4.6-9.2-9.1C1.6 8.1 3.6 4.5 7.1 4.5c2.1 0 3.6 1.2 4.9 2.9 1.3-1.7 2.8-2.9 4.9-2.9 3.5 0 5.5 3.6 4.3 6.9-1.7 4.5-9.2 9.1-9.2 9.1z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
export const Bubble: React.FC<P> = ({size, color, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M20.5 11.5a8.5 8 0 0 1-12.3 7.2L3.5 20l1.4-4.2A8 8 0 1 1 20.5 11.5z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
export const Send: React.FC<P> = ({size, color, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M21 3.5 10.5 14M21 3.5l-6.5 17-4-6.5-6.5-4 17-6.5z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
export const Bookmark: React.FC<P> = ({size, color, stroke = 2}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6 3.5h12v17l-6-4.2-6 4.2v-17z" stroke={color} strokeWidth={stroke} strokeLinejoin="round" />
  </svg>
);
export const Arrow: React.FC<P> = ({size, color, stroke = 2.6}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M4 12h15M13 5.5 19.5 12 13 18.5" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
