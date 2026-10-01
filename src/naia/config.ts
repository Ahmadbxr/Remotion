// =============================================================================
// NAIA "Sushi Making" — subtle motion design. Everything editable lives here.
// =============================================================================

export const NAIA = {
  // --- source clip (relative to public/) -----------------------------------
  // Copy the original to public/naia/source.mp4 (scripts/naia/run.sh does this)
  // and set `source` to 'naia/source.mp4'. Until then a clearly marked stand-in
  // with identical specs is used, only to test timing and the export pipeline.
  source: 'naia/standin/standin.mp4',
  sourceIsStandIn: true,

  // --- must match the source exactly (verified by scripts/naia/probe.sh) ---
  width: 2160,
  height: 3840,
  fps: 24000 / 1001,
  durationInFrames: 378,

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
    // centre of the text block, as a fraction of the frame (check against the
    // real frames — it must sit on the dark area above the cutting board)
    cx: 0.5,
    cy: 0.17,
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
    cx: 0.5,
    cy: 0.8, // on the free board area below the finished sushi — check on real frames
    widthFrac: 0.34, // logo width as a fraction of the frame width
    inSec: 14.5,
    fadeSec: 0.6,
    risePx: 18,
    tempName: 'NAIA',
    tempSub: 'SUSHI & STEAK',
  },
} as const;

/** seconds → frame at the source frame rate (deterministic rounding) */
export const sec = (s: number) => Math.round(s * NAIA.fps);
