// Format-specific layout. The choreography is identical across formats; only
// the positions change, so the 4:5 version is a real re-layout, not a crop.
//
// 9:16 safe zone (Meta Reels/Stories ads): keep text, logo and CTA out of the
// top 14 % (270 px) and the bottom 35 % (672 px), plus side margins.
// 4:5 feed: 72 px margin all round.
import {Rect} from './anim';
import {FormatId} from './config';

type TextSpot = {x: number; y: number; size: number; pitch: number; align?: 'left' | 'center'};

export type Layout = {
  W: number;
  H: number;
  side: number;
  safeTop: number;
  safeBottom: number;
  full: Rect;
  hook: {
    logo: {x: number; y: number; w: number};
    text: TextSpot;
    payoffY: number;
    card: Rect;
    // hook C
    textC: TextSpot;
    text2Y: number;
    cBig: Rect;
    cSmall: Rect;
    cBigEq: Rect;
    cSmallEq: Rect;
  };
  problem: {text: TextSpot; big: Rect; block: Rect};
  solution: {eyebrowY: number; panel: Rect; left: Rect; right: Rect; text: TextSpot};
  process: {
    word: TextSpot;
    captionY: number;
    captionSize: number;
    barY: number;
    states: [Rect, Rect, Rect, Rect];
  };
  proof: {
    card: Rect;
    colX: number;
    colW: number;
    eyebrowY: number;
    clientY: number;
    clientSize: number;
    l1Y: number;
    preY: number;
    figY: number;
    postY: number;
    textSize: number;
    figSize: number;
    sourceY: number;
  };
  benefit: {text: TextSpot; tiles: Rect[]};
  cta: {
    logo: {cx: number; y: number; w: number};
    text: TextSpot;
    button: Rect;
    buttonSize: number;
    subY: number;
    subSize: number;
    urlY: number;
    urlSize: number;
  };
};

const grid = (x0: number, y0: number, w: number, h: number, gap: number, cols: number, rows: number, r: number) => {
  const out: Rect[] = [];
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) out.push({x: x0 + i * (w + gap), y: y0 + j * (h + gap), w, h, r});
  return out;
};

const L916: Layout = {
  W: 1080,
  H: 1920,
  side: 72,
  safeTop: 270,
  safeBottom: 1248,
  full: {x: 0, y: 0, w: 1080, h: 1920, r: 0},
  hook: {
    logo: {x: 72, y: 296, w: 200},
    text: {x: 72, y: 418, size: 106, pitch: 108},
    payoffY: 418 + 2 * 108 + 6,
    card: {x: 300, y: 800, w: 480, h: 480, r: 46},
    textC: {x: 72, y: 400, size: 86, pitch: 90},
    text2Y: 400 + 2 * 90 + 18,
    cBig: {x: 72, y: 846, w: 580, h: 456, r: 40},
    cSmall: {x: 700, y: 1102, w: 200, h: 200, r: 24},
    cBigEq: {x: 72, y: 846, w: 456, h: 456, r: 40},
    cSmallEq: {x: 552, y: 846, w: 456, h: 456, r: 40},
  },
  problem: {
    text: {x: 72, y: 300, size: 106, pitch: 112},
    big: {x: 72, y: 572, w: 936, h: 780, r: 44},
    block: {x: 840, y: 1066, w: 136, h: 180, r: 18},
  },
  solution: {
    eyebrowY: 336,
    panel: {x: 200, y: 414, w: 680, h: 440, r: 50},
    left: {x: 40, y: 450, w: 310, h: 414, r: 34, rot: -6},
    right: {x: 730, y: 480, w: 310, h: 414, r: 34, rot: 6},
    text: {x: 0, y: 946, size: 94, pitch: 100, align: 'center'},
  },
  process: {
    word: {x: 72, y: 290, size: 104, pitch: 108},
    captionY: 414,
    captionSize: 34,
    barY: 478,
    states: [
      {x: 100, y: 590, w: 880, h: 640, r: 32},
      {x: 72, y: 580, w: 936, h: 660, r: 40},
      {x: 260, y: 548, w: 560, h: 920, r: 34},
      {x: 280, y: 544, w: 520, h: 924, r: 42},
    ],
  },
  proof: {
    card: {x: 72, y: 330, w: 468, h: 832, r: 40},
    colX: 584,
    colW: 424,
    eyebrowY: 372,
    clientY: 410,
    clientSize: 40,
    l1Y: 600,
    preY: 700,
    figY: 774,
    postY: 900,
    textSize: 64,
    figSize: 118,
    sourceY: 1120,
  },
  benefit: {
    text: {x: 72, y: 290, size: 76, pitch: 80},
    tiles: grid(151, 664, 250, 333, 14, 3, 2, 28),
  },
  cta: {
    logo: {cx: 540, y: 332, w: 380},
    text: {x: 0, y: 566, size: 94, pitch: 100, align: 'center'},
    button: {x: 100, y: 842, w: 880, h: 172, r: 86},
    buttonSize: 50,
    subY: 1058,
    subSize: 34,
    urlY: 1110,
    urlSize: 56,
  },
};

const L45: Layout = {
  W: 1080,
  H: 1350,
  side: 72,
  safeTop: 72,
  safeBottom: 1278,
  full: {x: 0, y: 0, w: 1080, h: 1350, r: 0},
  hook: {
    logo: {x: 72, y: 84, w: 176},
    text: {x: 72, y: 196, size: 96, pitch: 98},
    payoffY: 196 + 2 * 98 + 6,
    card: {x: 380, y: 560, w: 380, h: 380, r: 40},
    textC: {x: 72, y: 186, size: 80, pitch: 84},
    text2Y: 186 + 2 * 84 + 16,
    cBig: {x: 72, y: 580, w: 560, h: 420, r: 38},
    cSmall: {x: 690, y: 820, w: 180, h: 180, r: 22},
    cBigEq: {x: 72, y: 580, w: 456, h: 420, r: 38},
    cSmallEq: {x: 552, y: 580, w: 456, h: 420, r: 38},
  },
  problem: {
    text: {x: 72, y: 92, size: 96, pitch: 100},
    big: {x: 72, y: 340, w: 936, h: 640, r: 42},
    block: {x: 846, y: 880, w: 132, h: 176, r: 18},
  },
  solution: {
    eyebrowY: 96,
    panel: {x: 230, y: 168, w: 620, h: 400, r: 46},
    left: {x: 64, y: 206, w: 280, h: 372, r: 32, rot: -6},
    right: {x: 736, y: 232, w: 280, h: 372, r: 32, rot: 6},
    text: {x: 0, y: 690, size: 88, pitch: 94, align: 'center'},
  },
  process: {
    word: {x: 72, y: 82, size: 92, pitch: 96},
    captionY: 192,
    captionSize: 30,
    barY: 248,
    states: [
      {x: 180, y: 380, w: 720, h: 520, r: 30},
      {x: 120, y: 360, w: 840, h: 560, r: 38},
      {x: 324, y: 320, w: 432, h: 900, r: 32},
      {x: 336, y: 318, w: 408, h: 906, r: 40},
    ],
  },
  proof: {
    card: {x: 72, y: 214, w: 520, h: 924, r: 40},
    colX: 636,
    colW: 372,
    eyebrowY: 262,
    clientY: 298,
    clientSize: 34,
    l1Y: 482,
    preY: 572,
    figY: 640,
    postY: 756,
    textSize: 58,
    figSize: 104,
    sourceY: 1100,
  },
  benefit: {
    text: {x: 72, y: 84, size: 64, pitch: 68},
    tiles: grid(184, 402, 228, 304, 14, 3, 2, 26),
  },
  cta: {
    logo: {cx: 540, y: 214, w: 330},
    text: {x: 0, y: 420, size: 86, pitch: 92, align: 'center'},
    button: {x: 130, y: 650, w: 820, h: 156, r: 78},
    buttonSize: 46,
    subY: 848,
    subSize: 30,
    urlY: 898,
    urlSize: 52,
  },
};

export const layoutFor = (format: FormatId): Layout => (format === '4x5' ? L45 : L916);
