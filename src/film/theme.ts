export const FILM_COLORS = {
  background: '#050505',
  primary: '#FFFFFF',
  accent: '#F20505',
  secondary: '#888888',
  surface: '#0C0C0C',
  border: 'rgba(255,255,255,0.14)',
} as const;

export const FILM_FONT =
  "'Helvetica Neue', -apple-system, BlinkMacSystemFont, Inter, Arial, sans-serif";

export const FILM_MONO =
  "ui-monospace, 'SF Mono', 'Roboto Mono', Menlo, Consolas, monospace";

// Global timeline map (30fps). Every scene overlaps its neighbour by ~20
// frames so nothing hard-cuts: the outgoing shape is still resolving while
// the incoming one is already forming.
export const TIMELINE = {
  fps: 30,
  width: 1080,
  height: 1920,
  totalFrames: 1050, // 35s
  s1: {start: 0, end: 130}, // Hook
  s2: {start: 110, end: 280}, // Attention
  s3: {start: 260, end: 460}, // Offscript
  s4: {start: 440, end: 640}, // Process
  s5: {start: 620, end: 820}, // Performance
  s6: {start: 800, end: 1050}, // Payoff
} as const;
