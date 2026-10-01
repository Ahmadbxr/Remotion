// =============================================================================
// CHOREOGRAPHY
//
// One rounded rectangle — "M" — carries the whole film:
//   content card (hook) → video window (full bleed) → company card (problem)
//   → side card (solution) → production card ×4 (process) → case card (proof)
//   → tile (benefit) → CTA surface.
// "P" is the small, neglected content block of the problem scene that grows
// into the brand surface. "V2" is a second work card. Tiles are the calm
// content composition. Every transition is a keyframed move of these
// persistent elements — nothing is cut between independent slides.
//
// All frames are at 30 fps (FPS in config.ts).
// =============================================================================
import {Key, NumKey, Rect, centerOf, scaleRect, toward} from './anim';
import {CutId, HookId, MediaSlotId} from './config';
import {Layout} from './layout';
import {EASE} from './theme';

export type Scenes = {
  hook: number;
  problem: number | null;
  solution: number;
  process: number | null;
  proof: number;
  benefit: number | null;
  cta: number;
  end: number;
};

export type TileSpec = {slot: MediaSlotId; keys: Key[]};

export type Choreo = {
  scenes: Scenes;
  M: Key[];
  mZoom: NumKey[];
  mRy: NumKey[];
  procIn: NumKey[]; // motif → production card content
  procK: NumKey[]; // 0 idea · 1 shoot · 2 edit · 3 post
  naiaIn: NumKey[]; // post → NAIA reel (inside the production card)
  naiaDirect: NumKey[]; // motif → NAIA reel (short cut, no production)
  redIn: NumKey[]; // → CTA surface
  draft: NumKey[]; // hook B: empty draft skeleton over the motif
  P: Key[] | null;
  pDull: NumKey[];
  V2: Key[] | null;
  S: Key[] | null; // hook C: the small content card
  sDull: NumKey[];
  tiles: TileSpec[];
  cues: Record<string, number>;
};

const hidden = (r: Rect): Rect => ({...r, o: 0});

/** Hook part of M — every variant ends on the identical full-bleed frame at 92. */
const hookKeys = (L: Layout, hook: HookId) => {
  const full = L.full;
  if (hook === 'C') {
    const M: Key[] = [
      {f: 0, v: L.hook.cBig},
      {f: 36, v: L.hook.cBig},
      {f: 56, v: L.hook.cBigEq, e: EASE.settle},
      {f: 64, v: L.hook.cBigEq},
      {f: 67, v: scaleRect(L.hook.cBigEq, 0.97), e: EASE.inOutSine},
      {f: 88, v: full, e: EASE.out},
    ];
    const S: Key[] = [
      {f: 0, v: L.hook.cSmall},
      {f: 36, v: L.hook.cSmall},
      {f: 56, v: L.hook.cSmallEq, e: EASE.settle},
      {f: 60, v: L.hook.cSmallEq},
      // tucks in behind M: the two become one, then the merged card opens
      {f: 70, v: {...L.hook.cBigEq, o: 1}, e: EASE.inOut},
      {f: 73, v: {...L.hook.cBigEq, o: 0}, e: EASE.inOutSine},
    ];
    const mZoom: NumKey[] = [
      [0, 1.1],
      [64, 1.16, EASE.inOutSine],
      [88, 1.04, EASE.out],
      [92, 1.02, EASE.outSine],
    ];
    return {M, S, mZoom, openAt: 64, fullAt: 88};
  }
  const t0 = hook === 'B' ? 48 : 42;
  const small = L.hook.card;
  const M: Key[] = [
    {f: 0, v: small},
    {f: t0, v: small},
    {f: t0 + 5, v: scaleRect(small, 0.97), e: EASE.inOutSine}, // anticipation
    {f: t0 + 28, v: full, e: EASE.out}, // the opening
  ];
  const mZoom: NumKey[] = [
    [0, 2.3],
    [t0 + 2, 2.42, EASE.inOutSine],
    [t0 + 28, 1.06, EASE.out],
    [92, 1.02, EASE.outSine],
  ];
  return {M, S: null, mZoom, openAt: t0, fullAt: t0 + 28};
};

const panelEmerge = (panel: Rect): Rect => ({
  x: panel.x + panel.w / 2 - 100,
  y: panel.y + panel.h / 2 - 140,
  w: 200,
  h: 280,
  r: 30,
  o: 0,
});

export const buildChoreo = (L: Layout, cut: CutId, hook: HookId): Choreo => {
  const H = hookKeys(L, hook);
  const {panel, left, right} = L.solution;
  const exitRight: Rect = {...right, x: right.x + 340, ry: -40, o: 0};
  const draft: NumKey[] = hook === 'B' ? [[0, 1], [40, 1], [56, 0, EASE.inOut]] : [[0, 0]];
  const sDull: NumKey[] = [[0, 1], [36, 1], [56, 0, EASE.inOut]];

  if (cut === 'short') {
    const proof = L.proof.card;
    const M: Key[] = [
      ...H.M,
      {f: 92, v: L.full},
      {f: 116, v: left, e: EASE.smooth},
      {f: 176, v: left},
      {f: 202, v: proof, e: EASE.smooth},
      {f: 300, v: proof},
      {f: 304, v: scaleRect(proof, 1.03), e: EASE.outSine},
      {f: 308, v: proof, e: EASE.inOutSine},
      {f: 326, v: L.cta.button, e: EASE.settle},
      {f: 450, v: L.cta.button},
    ];
    return {
      scenes: {hook: 0, problem: null, solution: 90, process: null, proof: 180, benefit: null, cta: 315, end: 450},
      M,
      mZoom: [...H.mZoom, [118, 1.0, EASE.smooth], [176, 1.06, EASE.inOutSine]],
      mRy: [[0, 0]],
      procIn: [[0, 0]],
      procK: [[0, 0]],
      naiaIn: [[0, 0]],
      naiaDirect: [[178, 0], [200, 1, EASE.inOut]],
      redIn: [[307, 0], [316, 1, EASE.inOut]],
      draft,
      P: [
        {f: 98, v: {...panel, s: 0.5, o: 0}},
        {f: 118, v: panel, e: EASE.settle},
        {f: 172, v: panel},
        {f: 192, v: {...panel, y: -panel.h - 80, s: 0.96}, e: EASE.in},
      ],
      pDull: [[0, 0]],
      V2: [
        {f: 104, v: panelEmerge(panel)},
        {f: 130, v: right, e: EASE.settle},
        {f: 172, v: right},
        {f: 196, v: exitRight, e: EASE.in},
      ],
      S: H.S,
      sDull,
      tiles: [],
      cues: {
        openAt: H.openAt,
        fullAt: H.fullAt,
        panelLand: 118,
        logoReveal: 110,
        proofLand: 202,
        ctaLand: 326,
        ctaText: 318,
      },
    };
  }

  // ------------------------------------------------------------------ main --
  const st = L.process.states;
  const tile1 = L.benefit.tiles[1];
  const M: Key[] = [
    ...H.M,
    {f: 92, v: L.full},
    {f: 118, v: L.problem.big, e: EASE.smooth},
    {f: 158, v: L.problem.big},
    {f: 186, v: left, e: EASE.smooth},
    {f: 272, v: left},
    {f: 300, v: st[0], e: EASE.smooth},
    {f: 336, v: st[0]},
    {f: 354, v: st[1], e: EASE.morph},
    {f: 372, v: st[1]},
    {f: 390, v: st[2], e: EASE.morph},
    {f: 408, v: st[2]},
    {f: 426, v: st[3], e: EASE.morph},
    {f: 476, v: st[3]},
    {f: 504, v: L.proof.card, e: EASE.smooth},
    {f: 604, v: L.proof.card},
    {f: 632, v: tile1, e: EASE.smooth},
    {f: 724, v: tile1},
    {f: 732, v: scaleRect(tile1, 1.06), e: EASE.outSine}, // absorbs the others
    {f: 740, v: tile1, e: EASE.inOutSine},
    {f: 764, v: L.cta.button, e: EASE.settle},
    {f: 900, v: L.cta.button},
  ];

  // tiles: everything except slot 1 (that one is M itself)
  const slots: MediaSlotId[] = ['workGastro', 'naiaReel', 'workBeauty', 'workRealEstate', 'workTelco', 'team'];
  const mc = centerOf(tile1);
  const others = [0, 2, 3, 4, 5];
  // condense the farthest tiles first, so the composition collapses inward
  const byDist = [...others].sort((a, b) => {
    const da = centerOf(L.benefit.tiles[a]);
    const db = centerOf(L.benefit.tiles[b]);
    return Math.hypot(db.cx - mc.cx, db.cy - mc.cy) - Math.hypot(da.cx - mc.cx, da.cy - mc.cy);
  });
  const tiles: TileSpec[] = others.map((i, order) => {
    const t = L.benefit.tiles[i];
    const enter = 610 + order * 5;
    const cond = 714 + byDist.indexOf(i) * 3;
    return {
      slot: slots[i],
      keys: [
        {f: enter, v: {...t, y: t.y + 170, o: 0, s: 0.92}},
        {f: enter + 30, v: t, e: EASE.smooth},
        {f: cond, v: t},
        {f: cond + 18, v: {...toward(t, mc.cx, mc.cy, 0.22), o: 0}, e: EASE.in},
      ],
    };
  });

  return {
    scenes: {hook: 0, problem: 90, solution: 180, process: 300, proof: 480, benefit: 630, cta: 750, end: 900},
    M,
    mZoom: [...H.mZoom, [118, 1.0, EASE.smooth], [180, 1.06, EASE.inOutSine]],
    // the cards turn slightly in depth on their way into the production flow
    mRy: [[272, 0], [287, 16, EASE.inOutSine], [302, 0, EASE.smooth]],
    procIn: [[280, 0], [298, 1, EASE.inOut]],
    procK: [
      [300, 0],
      [336, 0],
      [352, 1, EASE.inOutSine],
      [372, 1],
      [388, 2, EASE.inOutSine],
      [408, 2],
      [424, 3, EASE.inOutSine],
    ],
    naiaIn: [[470, 0], [496, 1, EASE.inOut]],
    naiaDirect: [[0, 0]],
    redIn: [[738, 0], [748, 1, EASE.inOut]],
    draft,
    P: [
      {f: 104, v: {...L.problem.block, o: 0, s: 0.6}},
      {f: 118, v: L.problem.block, e: EASE.settle},
      {f: 162, v: L.problem.block},
      {f: 190, v: panel, e: EASE.settle},
      {f: 258, v: panel},
      {f: 278, v: {...panel, y: -panel.h - 80, s: 0.96}, e: EASE.in}, // lifts out of frame, no ghosting
    ],
    pDull: [[164, 1], [184, 0, EASE.inOut]],
    V2: [
      {f: 196, v: panelEmerge(panel)},
      {f: 222, v: right, e: EASE.settle},
      {f: 262, v: right},
      {f: 288, v: exitRight, e: EASE.in},
    ],
    S: H.S,
    sDull,
    tiles,
    cues: {
      openAt: H.openAt,
      fullAt: H.fullAt,
      panelLand: 190,
      logoReveal: 180,
      proofLand: 504,
      ctaLand: 764,
      ctaText: 744,
    },
  };
};

export {hidden};
