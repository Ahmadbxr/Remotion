// =============================================================================
// NAIA "Sushi Making" — subtle motion design. Everything editable lives here.
// =============================================================================

export const NAIA = {
  // --- source clip (relative to public/) -----------------------------------
  // The supplied clip (HEVC) as a frame-exact H.264 working copy — Chromium
  // cannot decode HEVC everywhere. scripts/naia/run.sh rebuilds it.
  source: 'naia/source.mp4',
  sourceIsStandIn: false,

  // --- must match the source exactly (verified by scripts/naia/probe.sh) ---
  // Measured on the supplied clip: 1080x1920, 24/1 fps, 378 frames, no audio.
  width: 1080,
  height: 1920,
  fps: 24,
  durationInFrames: 378,
  // the 4K master named in the brief, for NaiaOverlay4K
  master4k: {width: 2160, height: 3840, fps: 24000 / 1001},
  // all pixel sizes below are authored for a 2160 px wide frame and scaled
  refWidth: 2160,

  // --- look -----------------------------------------------------------------
  color: '#F6EFE4', // warm white
  shadow: '0 3px 28px rgba(0,0,0,0.38)',
  fonts: {
    // Replacement fonts until the NAIA brand fonts are supplied (public/naia/fonts)
    display: {family: 'Cormorant Garamond', files: {500: 'cormorant-garamond-latin-500-normal.woff2', 600: 'cormorant-garamond-latin-600-normal.woff2'}},
    text: {family: 'Inter', files: {500: 'inter-latin-500-normal.woff2'}},
  },

  // --- 1) headline ------------------------------------------------------------
  headline: {
    text: 'THE ART OF SUSHI',
    textDe: 'DIE KUNST DES SUSHI', // set useDe: true if NAIA communicates in German
    useDe: false,
    // centre of the text block as a fraction of the frame. Measured on the
    // clip (frames 5–53): dark steel 0–23.4 %, board below. 0.175 keeps the
    // headline on the steel, clear of the board edge, and below the top 14 %
    // the Reels UI covers. No hands enter this area in 0.2–2.2 s.
    cx: 0.5,
    cy: 0.175,
    size: 120, // px at 2160 wide (= 60 px on a 1080 phone frame)
    weight: 600, // thin serif strokes need weight to survive phone downscaling
    tracking: '0.26em',
    inSec: 0.2,
    fadeSec: 0.3,
    outEndSec: 2.2,
    outFadeSec: 0.35,
    risePx: 24, // "a few pixels" at 2160 wide (= 12 px at 1080)
  },

  // --- 3) logo --------------------------------------------------------------
  logo: {
    // Real NAIA logo (PNG/SVG with transparency) relative to public/, e.g.
    // 'naia/naia-logo.png'. While null, a TEMPORARY wordmark is drawn.
    src: null as string | null,
    // Measured on the last frames: the six finished pieces sit at x 0.49–0.80,
    // y 0.31–0.42; the board runs to 0.80. Centred under the sushi group,
    // ~130 px below the pieces and above the bottom 35 % the Reels UI covers.
    cx: 0.645,
    cy: 0.53,
    widthFrac: 0.34, // logo width as a fraction of the frame width
    // the board is light cream (luminance ~0.43): warm white would read at
    // ~1.9:1, so the logo is set in warm charcoal (~6.9:1) — use a dark logo file
    color: '#2A2420',
    // Hands still clear the board over exactly this area until frame 356
    // (14.83 s); the area is clean from frame 357/358. Starting at 14.5 s would
    // fade the logo in over the hands.
    inSec: 14.88,
    fadeSec: 0.45,
    risePx: 18,
    tempName: 'NAIA',
    tempSub: 'SUSHI & STEAK',
  },
} as const;

/** seconds → frame at the source frame rate (deterministic rounding) */
export const sec = (s: number) => Math.round(s * NAIA.fps);
