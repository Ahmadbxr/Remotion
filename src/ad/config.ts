// =============================================================================
// OFFSCRIPT PAID-SOCIAL AD — CENTRAL CONFIGURATION
//
// Everything a non-developer should ever need to change lives in this file:
// copy, hook variants, colours, media files, audio, voice-over timing, QA
// switches. Components never hard-code any of it.
//
// Sources for every factual line are listed in ad-output/04_Quellen_Assets.md.
// =============================================================================

export type HookId = 'A' | 'B' | 'C';
export type FormatId = '9x16' | '4x5';
export type CutId = 'main' | 'short';
export type ProofMode = 'naia' | 'fallback';

export const FPS = 30;
export const DURATION = {main: 30 * FPS, short: 15 * FPS} as const;

// ---------------------------------------------------------------------------
// Brand — palette derived from offscript.ch (paper background, ink, the red of
// the "zh" in the logo). The red is the hero colour: active element + CTA only.
// ---------------------------------------------------------------------------
export const BRAND = {
  url: 'offscript.ch',
  colors: {
    paper: '#F5F3EF',
    card: '#FFFFFF',
    ink: '#111111',
    inkSoft: '#3A3835',
    muted: '#6E6A63',
    faint: '#B9B3AA',
    hairline: 'rgba(17,17,17,0.12)',
    red: '#F20505',
    redDeep: '#C90404',
    night: '#121212',
    nightUi: '#1C1C1C',
    white: '#FFFFFF',
  },
  logo: 'ad/brand/offscript-logo.png', // original, black + red "zh"
  logoLight: 'ad/brand/offscript-logo-light.png', // for use over imagery
  logoAspect: 945 / 396,
  fonts: {
    display: 'Inter Tight',
    text: 'Inter',
  },
} as const;

// ---------------------------------------------------------------------------
// Copy — Swiss German spelling, direct "ihr/euer" address.
// ---------------------------------------------------------------------------
export const HOOKS: Record<
  HookId,
  {name: string; lines: string[]; payoff?: string; lines2?: string[]; vo: string}
> = {
  A: {
    name: 'Kann mehr',
    lines: ['Euer Unternehmen', 'kann mehr.'],
    payoff: 'Zeigt es.',
    vo: 'Euer Unternehmen kann mehr. Zeigt es.',
  },
  B: {
    name: 'Keine Zeit',
    lines: ['Keine Zeit für', 'guten Content?'],
    vo: 'Keine Zeit für guten Content?',
  },
  C: {
    name: 'So gut wie',
    lines: ['So gut wie euer', 'Unternehmen.'],
    lines2: ['Sollte auch euer', 'Content sein.'],
    vo: 'So gut wie euer Unternehmen – so gut sollte auch euer Content sein.',
  },
};

export const COPY = {
  problem: {l1: 'Gute Arbeit.', l2: 'Zu wenig sichtbar?'},
  solution: {
    eyebrow: 'Social Media & Video · Zürich',
    l1: 'Wir machen euer',
    l2: 'Können sichtbar.',
  },
  process: {
    steps: [
      {word: 'Idee.', caption: 'Konzept & Kampagnenidee'},
      {word: 'Dreh.', caption: 'Bei euch vor Ort'},
      {word: 'Schnitt.', caption: 'Vertikal, mit Untertiteln'},
      {word: 'Betreuung.', caption: 'Posting, Community, Reporting'},
    ],
    finale: 'Ein Team.',
    finaleCaption: 'Ein Ansprechpartner, ein Ablauf.',
    // small UI words inside the production card
    board: {label: 'Konzept', frames: ['Hook', 'Story', 'Abschluss']},
    rec: 'REC',
    editLabel: 'Schnitt · 9:16',
    subtitle: 'Euer Können.',
    postName: 'Euer Unternehmen',
    planDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'],
    planDots: [1, 4],
  },
  proof: {
    // Case as published on offscript.ch/referenzen: NAIA, Gastronomie,
    // more than 10'000 views for ONE video. Never present views as enquiries.
    eyebrow: 'Gastronomie',
    client: 'NAIA Sushi & Steak',
    l1: 'Ein Video.',
    pre: 'Über',
    figure: '10’000',
    post: 'Aufrufe.',
    source: 'Quelle: offscript.ch/referenzen',
  },
  // Used when PROOF_MODE = 'fallback' (case or material not usable).
  proofFallback: {
    eyebrow: 'Referenzen',
    l1: 'Echte',
    l2: 'Unternehmen.',
    l3: 'Echte',
    l4: 'Geschichten.',
    industries: ['Gastronomie', 'Beauty', 'Immobilien', 'Telco'],
  },
  benefit: {
    l1a: 'Ihr führt',
    l1b: 'euer Unternehmen.',
    l2a: 'Wir kümmern uns',
    l2b: 'um euren Content.',
  },
  cta: {
    l1: 'Machen wir euer',
    l2: 'Können sichtbar.',
    button: 'Jetzt Erstgespräch anfragen',
    // offscript.ch: "30 Minuten, kein Verkaufsgespräch, unverbindlich".
    // NOT "kostenlos" — not explicitly confirmed on the site.
    sub: '30 Minuten · unverbindlich',
    url: 'offscript.ch',
  },
} as const;

// 'naia' = verified case (offscript.ch/referenzen). Switch to 'fallback' if the
// NAIA reel cannot be supplied or its use in advertising is not released.
export const PROOF_MODE: ProofMode = 'naia';

// ---------------------------------------------------------------------------
// Media slots. Put original Offscript files into public/ad/media/ and set
// `src` (path relative to public/). While `src` is null the film renders a
// clearly labelled placeholder — it never fakes client work.
//   kind: 'image' | 'video'   focus: object-position in % [x, y]
//   tone: placeholder colour family, only used while src is null
// ---------------------------------------------------------------------------
export type MediaSlotId =
  | 'hookMotif'
  | 'naiaReel'
  | 'workGastro'
  | 'workBeauty'
  | 'workRealEstate'
  | 'workTelco'
  | 'team';

export type MediaDef = {
  src: string | null;
  kind: 'image' | 'video';
  label: string;
  need: string;
  focus: [number, number];
  tone: 'warm' | 'blush' | 'stone' | 'slate' | 'sand';
  startFromSeconds?: number;
};

export const MEDIA: Record<MediaSlotId, MediaDef> = {
  hookMotif: {
    src: null,
    kind: 'video',
    label: 'Kundenarbeit · Detail',
    need: 'Starkes, eng beschneidbares Detail aus einem echten Offscript-Video (z. B. Gericht, Hände, Produkt). 9:16, min. 1080×1920.',
    focus: [50, 46],
    tone: 'warm',
  },
  naiaReel: {
    src: null,
    kind: 'video',
    label: 'NAIA Sushi & Steak · Reel',
    need: 'Das veröffentlichte NAIA-Reel mit >10’000 Aufrufen, 9:16. Nutzungsfreigabe NAIA für Werbung nötig.',
    focus: [50, 50],
    tone: 'warm',
  },
  workGastro: {
    src: null,
    kind: 'image',
    label: 'Kundenarbeit · Gastronomie',
    need: 'Standbild oder Clip einer weiteren Gastro-Arbeit, 3:4 oder 9:16.',
    focus: [50, 50],
    tone: 'sand',
  },
  workBeauty: {
    src: null,
    kind: 'image',
    label: 'Kundenarbeit · Beauty',
    need: 'Beauty-Referenz (z. B. Lyvé), 3:4 oder 9:16. Freigabe des Kunden nötig.',
    focus: [50, 50],
    tone: 'blush',
  },
  workRealEstate: {
    src: null,
    kind: 'image',
    label: 'Kundenarbeit · Immobilien',
    need: 'Immobilien-Referenz (z. B. ImmoLiving AG), 3:4 oder 9:16. Freigabe nötig.',
    focus: [50, 50],
    tone: 'stone',
  },
  workTelco: {
    src: null,
    kind: 'image',
    label: 'Kundenarbeit · Telco',
    need: 'Telco-Referenz (z. B. yallo), 3:4 oder 9:16. Freigabe nötig.',
    focus: [50, 50],
    tone: 'slate',
  },
  team: {
    src: null,
    kind: 'image',
    label: 'Offscript-Team beim Dreh',
    need: 'Echtes Behind-the-Scenes-Foto des Offscript-Teams (Seite /ueber-uns oder /creators). 3:4.',
    focus: [50, 40],
    tone: 'sand',
  },
};

// ---------------------------------------------------------------------------
// Audio. Music + SFX are generated by scripts/ad/synth_audio.py (own work, no
// third-party licence). A voice-over is not available yet: record it from
// ad-output/02_Sprechertext.md, drop the WAVs into public/ad/audio/ and set
// `enabled: true` — the music ducks automatically under the VO windows.
// ---------------------------------------------------------------------------
export const AUDIO = {
  music: {main: 'ad/audio/music-main.wav', short: 'ad/audio/music-short.wav', volume: 0.8},
  sfxVolume: 0.9,
  voiceover: {
    enabled: false,
    // one file per cut + hook, e.g. ad/audio/vo-main-A.wav
    file: (cut: CutId, hook: HookId) => `ad/audio/vo-${cut}-${hook}.wav`,
    volume: 1,
    duckTo: 0.35, // music gain factor while the VO speaks
  },
} as const;

// ---------------------------------------------------------------------------
// Voice-over script with target timings (seconds). The animation is timed to
// these windows; ad-output/02_Sprechertext.md is generated from the same data.
// ---------------------------------------------------------------------------
export type VoLine = {from: number; to: number; text: string; scene: string};

export const VO = {
  main: (hook: HookId): VoLine[] => [
    {from: 0.2, to: 2.7, text: HOOKS[hook].vo, scene: 'Hook'},
    {from: 3.2, to: 5.8, text: 'Gute Arbeit verdient einen starken Auftritt.', scene: 'Problem'},
    {from: 6.4, to: 9.4, text: 'Offscript bringt euer Unternehmen auf Social Media.', scene: 'Lösung'},
    {from: 10.2, to: 15.6, text: 'Von der Idee über Dreh und Schnitt bis zur Betreuung. Ein Team.', scene: 'Entlastung'},
    {from: 16.6, to: 20.2, text: 'Für NAIA: über zehntausend Aufrufe mit einem Video.', scene: 'Beleg'},
    {from: 21.2, to: 24.7, text: 'Ihr führt euer Unternehmen. Wir kümmern uns um euren Content.', scene: 'Nutzen'},
    {from: 25.4, to: 29.0, text: 'Fragt jetzt euer unverbindliches Erstgespräch an. Auf offscript.ch.', scene: 'CTA'},
  ],
  short: (hook: HookId): VoLine[] => [
    {from: 0.2, to: 2.7, text: HOOKS[hook].vo, scene: 'Hook'},
    {from: 3.3, to: 5.8, text: 'Offscript macht euer Können sichtbar.', scene: 'Lösung'},
    {from: 6.5, to: 10.0, text: 'Für NAIA: über zehntausend Aufrufe mit einem Video.', scene: 'Beleg'},
    {from: 10.9, to: 14.5, text: 'Fragt jetzt euer unverbindliches Erstgespräch an. Auf offscript.ch.', scene: 'CTA'},
  ],
};

// ---------------------------------------------------------------------------
// QA switches (also settable per render via --props).
// ---------------------------------------------------------------------------
export const QA = {
  showPlaceholderLabels: true,
};
