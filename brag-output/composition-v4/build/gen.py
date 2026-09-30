#!/usr/bin/env python3
# ---------------------------------------------------------------------------
# Generates index.html for "EINE EINSTELLUNG" — one continuous camera move over
# a 3x3 world of tiles, no cuts, with a single red dot that travels through the
# whole film and ends as the "." in offscript.ch.
#
# Two-pass: the dot has to land exactly where a period would sit inside live
# text, and that depends on the renderer's font metrics. Pass 1 emits the page
# with placeholder targets; measure.sh reads the slots' rects out of headless
# Chromium into measured.json; pass 2 bakes them in.
# ---------------------------------------------------------------------------
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'index.html')
MEAS = os.path.join(HERE, 'measured.json')
M = json.load(open(MEAS)) if os.path.exists(MEAS) else {}

TW, TH = 1920, 1080
# tile id -> (col, row, surface)
TILES = {
    't0': (0, 0, 'navy'),  't1': (1, 0, 'paper'), 't2': (2, 0, 'navy'),
    't7': (0, 1, 'red'),   't8': (1, 1, 'paper'), 't3': (2, 1, 'red'),
    't6': (0, 2, 'navy'),  't5': (1, 2, 'paper'), 't4': (2, 2, 'navy'),
}
def origin(t): c, r, _ = TILES[t]; return c * TW, r * TH

# ---- camera schedule (seconds) --------------------------------------------
MOVE = 1.09
ARRIVE = {'t0': 0.00, 't1': 4.64, 't2': 8.44, 't3': 12.56, 't4': 16.38,
          't5': 20.19, 't6': 23.46, 't7': 26.74}
LEAVE  = {'t0': 3.55, 't1': 7.35, 't2': 11.47, 't3': 15.28, 't4': 19.10,
          't5': 22.37, 't6': 25.65, 't7': 29.47}
ORDER  = ['t0', 't1', 't2', 't3', 't4', 't5', 't6', 't7']
ZOOM_OUT_AT, MOSAIC_HOLD, ZOOM_IN_AT, END_ARRIVE, TOTAL = 29.47, 30.56, 31.10, 32.19, 36.0

# ---- dot ------------------------------------------------------------------
DOT = 24  # px at scale 1

def period_after(ink_key, scale, gap=None):
    """Dot as the period after a piece of text: x just past the ink's right
    edge, bottom sitting on the ink baseline (the text has no descenders)."""
    r = M.get(ink_key)
    if not r:
        return None
    size = DOT * scale
    g = gap if gap is not None else size * 0.55
    return r['x1'] + g, r['y1'] - size + 1

def mid_in_slot(slot_key, ink_key, scale):
    """Dot as a middle dot inside a gap between words: centred in the slot,
    at the vertical centre of the row's ink."""
    r, k = M.get(slot_key), M.get(ink_key)
    if not (r and k):
        return None
    size = DOT * scale
    return r['x'] + r['w'] / 2 - size / 2, (k['y0'] + k['y1']) / 2 - size / 2

def decimal_in_slot(slot_key, ink_key, scale):
    r, k = M.get(slot_key), M.get(ink_key)
    if not (r and k):
        return None
    size = DOT * scale
    return r['x'] + r['w'] / 2 - size / 2, k['y1'] - size + 1

# ---- markup helpers -------------------------------------------------------
def tile(tid, inner):
    x, y = origin(tid); surf = TILES[tid][2]
    return ('      <div class="tile %s" id="%s" style="left:%dpx; top:%dpx;" data-layout-allow-overflow>\n%s\n      </div>'
            % (surf, tid, x, y, inner))

def el(cls, id_, x, y, text='', extra=''):
    return '        <div class="%s" id="%s" style="left:%dpx; top:%dpx;%s">%s</div>' % (cls, id_, x, y, extra, text)

# ---------------------------------------------------------------- T0 HOOK --
t0 = '\n'.join([
    '        <div class="brk" id="k0"></div><div class="brk" id="k1"></div><div class="brk" id="k2"></div><div class="brk" id="k3"></div>',
    el('mono lt', 'h0m', 152, 154, 'SOCIAL MEDIA AGENTUR ZÜRICH'),
    el('mono lt', 'rec', 1690, 156, 'REC'),
    el('disp lt d120', 'h0a', 150, 380, 'SOCIAL MEDIA,'),
    el('disp lt d120', 'h0b', 150, 506, 'DAS KLINGT'),
    el('disp lt d120', 'h0c', 150, 638, 'WIE IHR.'),
    el('mono lt dim', 'h0f', 152, 880, 'KONZEPTION &middot; DREH &middot; SCHNITT &middot; BETREUUNG'),
])
# ------------------------------------------------------------- T1 PROCESS --
P_WORDS = [('KONZEPTION', 150, 'STRATEGIE &amp; KAMPAGNENIDEEN'),
           ('DREH', 640, 'BEI EUCH VOR ORT'),
           ('SCHNITT', 1040, 'VERTIKAL, UNTERTITELT'),
           ('BETREUUNG', 1420, 'POSTING, COMMUNITY, REPORTING')]
t1 = '\n'.join([
    el('mono dk', 'h1m', 152, 154, 'FÜR KMU.'),
    '        <div class="pline" id="pline"></div>',
] + [el('disp dk d66', 'pw%d' % i, x, 470, w) for i, (w, x, _) in enumerate(P_WORDS)]
  + [el('mono dk dim', 'pc%d' % i, x + 2, 602, c) for i, (_, x, c) in enumerate(P_WORDS)])
# ------------------------------------------------------------ T2 SERVICES --
S_ROWS = [('SOCIAL- &amp; IMAGEVIDEOS BEI EUCH VOR ORT.', 'KOMPAKTES SET, KURZE DREHTAGE'),
          ('VERTIKALER SCHNITT.', 'UNTERTITEL, SOUNDDESIGN, FORMAT-VARIANTEN'),
          ('REDAKTIONSPLAN, POSTING, COMMUNITY.', 'MONATLICHES REPORTING'),
          ('IN-HOUSE CREATORS.', 'WENN IHR NICHT SELBST VOR DIE KAMERA WOLLT')]
S_Y = [300, 470, 640, 810]
t2 = '\n'.join([el('mono lt', 'h2m', 152, 154, 'LEISTUNGEN')]
  + [el('disp lt d54', 'sr%d' % i, 200, y, a) for i, ((a, _), y) in enumerate(zip(S_ROWS, S_Y))]
  + [el('mono lt dim', 'sc%d' % i, 202, y + 66, b) for i, ((_, b), y) in enumerate(zip(S_ROWS, S_Y))])
# ------------------------------------------------------------- T3 REGIONS --
CITIES = [('ZÜRICH', 220, 420), ('BASEL', 800, 420), ('LUZERN', 1310, 420),
          ('ZUG', 220, 640), ('BERN', 700, 640), ('ST. GALLEN', 1180, 640)]
t3 = '\n'.join([el('mono wt', 'h3m', 152, 154, 'FÜR KMU IN')]
  + [el('disp wt d84', 'ct%d' % i, x, y, n) for i, (n, x, y) in enumerate(CITIES)]
  + [el('mono wt dim', 'h3f', 152, 880, 'SOCIAL MEDIA &amp; VIDEOPRODUKTION')])
# ------------------------------------------------------------- T4 NUMBERS --
t4 = '\n'.join([
    el('disp lt d240', 'n1', 150, 300, '1<span class="slot" id="slot-dec" style="width:34px"></span>4 MIO.'),
    el('mono lt', 'n1c', 156, 560, 'ACCOUNTS ERREICHT'),
    el('disp lt d160', 'n2', 150, 640, '3&rsquo;000+'),
    el('mono lt', 'n2c', 156, 820, 'NEUE FOLLOWER FÜR UNSERE KUNDEN'),
])
# ------------------------------------------------------------- T5 PRICING --
t5 = '\n'.join([
    el('disp dk d96', 'p1', 150, 380, 'MONATLICHE PAKETE<span class="slot" id="slot-p" style="width:22px"></span>'),
    el('disp rd d150', 'p2', 150, 500, 'AB CHF 1&rsquo;500'),
    el('mono dk', 'p3', 156, 690, 'PRO MONAT'),
])
# ------------------------------------------------------------ T6 BRANCHES --
t6 = '\n'.join([
    el('mono lt', 'h6m', 152, 154, 'BRANCHEN'),
    el('disp lt d96', 'b-row1', 150, 400,
       '<span class="w" id="b0">GASTRONOMIE</span><span class="slot" id="slot-b1" style="width:70px"></span><span class="w" id="b1">BEAUTY</span>'),
    el('disp lt d96', 'b-row2', 150, 560,
       '<span class="w" id="b2">IMMOBILIEN</span><span class="slot" id="slot-b2" style="width:70px"></span><span class="w" id="b3">TELCO</span>'),
])
# ------------------------------------------------------------- T7 CLIENTS --
CL = ['NAIA', 'LYVÉ', 'IMMOLIVING AG', 'YALLO']
t7 = '\n'.join([
    el('mono wt', 'h7m', 152, 154, 'KUNDEN'),
    el('disp wt d84', 'c1', 150, 330, 'VOM QUARTIERRESTAURANT'),
    el('disp wt d84', 'c2', 150, 430, 'BIS ZUR TELCO<span class="slot" id="slot-c" style="width:20px"></span>'),
    '        <div class="clrow" id="clrow" style="left:150px; top:640px;">' +
    ''.join('<span class="cl" id="cl%d">%s</span>' % (i, n) for i, n in enumerate(CL)) + '</div>',
])
# ------------------------------------------------------------- T8 ENDCARD --
t8 = '\n'.join([
    '        <img id="logo" src="assets/img/logo.png" alt="Offscript" />',
    '        <div class="url" id="url"><span class="u" id="u1">offscript</span><span class="slot" id="slot-url" style="width:26px"></span><span class="u" id="u2">ch</span></div>',
    el('mono dk ctr', 'e1', 0, 706, 'hello@offscript.ch'),
    el('mono dk ctr dim', 'e2', 0, 752, '+41 76 619 29 52 &middot; ZÜRICH'),
])

# ---- dot waypoints in world space (top-left) ------------------------------
def W(tid, lx, ly): x, y = origin(tid); return (x + lx, y + ly)
dot_T0 = W('t0', 1648, 160)
dot_T1s = W('t1', 150 - 12, 560 + 3 - 12); dot_T1e = W('t1', 1770 - 12, 560 + 3 - 12)
dot_T2 = [W('t2', 150, y + 15) for y in S_Y]
dot_T3 = [W('t3', x - 52, y + 30) for _, x, y in CITIES]
dot_T4 = ((M['n1']['gap0'] + M['n1']['gap1']) / 2 - DOT / 2, M['n1']['y1'] - DOT + 1) if M.get('n1') and 'gap0' in M['n1'] else W('t4', 280, 500)
dot_T5 = period_after('p1', 0.5) or W('t5', 1000, 460)
dot_T6a = ((M['b-row1']['gap0'] + M['b-row1']['gap1']) / 2 - DOT * 0.25, (M['b-row1']['y0'] + M['b-row1']['y1']) / 2 - DOT * 0.25) if M.get('b-row1') and 'gap0' in M['b-row1'] else W('t6', 830, 440)
dot_T6b = ((M['b-row2']['gap0'] + M['b-row2']['gap1']) / 2 - DOT * 0.25, (M['b-row2']['y0'] + M['b-row2']['y1']) / 2 - DOT * 0.25) if M.get('b-row2') and 'gap0' in M['b-row2'] else W('t6', 780, 600)
dot_T7 = period_after('c2', 0.45) or W('t7', 800, 500)
dot_T8 = ((M['url']['gap0'] + M['url']['gap1']) / 2 - DOT * 0.55 / 2, M['url']['base'] - DOT * 0.55 + 1) if M.get('url') and 'gap0' in M['url'] else W('t8', 1010, 660)

def js_pt(p): return '{ x: %.2f, y: %.2f }' % p

HTML = r'''<!doctype html>
<html lang="de" data-resolution="landscape">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=1920, height=1080" />
    <script src="vendor/gsap.min.js"></script>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { margin: 0; width: 1920px; height: 1080px; overflow: hidden; background: #0E1626; }
      :root {
        --paper: #F5F3EF; --ink: #111111; --muted: #6E6A63;
        --red: #F20505; --navy: #0E1626; --red-on-navy: #FF4433;
        --sans: ui-sans-serif, system-ui, sans-serif; --mono: ui-monospace, monospace;
      }
      #root { width: 100%; height: 100%; position: relative; overflow: hidden; background: var(--navy); font-family: var(--sans); }
      .clip { position: absolute; inset: 0; }

      /* The world: nine tiles, one camera. Everything the film shows lives here
         at world coordinates; the camera is a transform on this one element. */
      #world { position: absolute; left: 0; top: 0; width: 5760px; height: 3240px; transform-origin: 0 0; }
      .tile { position: absolute; width: 1920px; height: 1080px; overflow: hidden; }
      .tile.navy  { background: var(--navy); }
      .tile.paper { background: var(--paper); }
      .tile.red   { background: var(--red); }

      .disp { position: absolute; font-weight: 800; letter-spacing: -0.035em; line-height: 1; white-space: nowrap; }
      .d240 { font-size: 240px; letter-spacing: -0.05em; } .d160 { font-size: 160px; letter-spacing: -0.045em; }
      .d150 { font-size: 150px; letter-spacing: -0.045em; } .d120 { font-size: 120px; }
      .d96 { font-size: 96px; } .d84 { font-size: 84px; } .d66 { font-size: 66px; letter-spacing: -0.025em; } .d54 { font-size: 54px; letter-spacing: -0.02em; }
      .mono { position: absolute; font-family: var(--mono); font-weight: 700; font-size: 26px; letter-spacing: 0.16em; white-space: nowrap; }
      .lt { color: #F5F3EF; } .dk { color: var(--ink); } .wt { color: #FFFFFF; } .rd { color: var(--red); }
      .mono.lt { color: rgba(245,243,239,0.82); } .mono.dk { color: var(--muted); } .mono.wt { color: rgba(255,255,255,0.9); }
      .mono.dim { font-size: 22px; letter-spacing: 0.14em; }
      .mono.lt.dim { color: rgba(245,243,239,0.6); } .mono.wt.dim { color: rgba(255,255,255,0.7); }
      .ctr { left: 0 !important; width: 1920px; text-align: center; }
      .slot { display: inline-block; height: 0; vertical-align: baseline; }
      .w, .u, .cl { display: inline-block; }

      .brk { position: absolute; width: 96px; height: 96px; border: 5px solid rgba(245,243,239,0.85); }
      #k0 { left: 90px; top: 90px; border-right: none; border-bottom: none; }
      #k1 { left: 1734px; top: 90px; border-left: none; border-bottom: none; }
      #k2 { left: 90px; top: 894px; border-right: none; border-top: none; }
      #k3 { left: 1734px; top: 894px; border-left: none; border-top: none; }

      .pline { position: absolute; left: 150px; top: 560px; width: 1620px; height: 6px; background: var(--red); transform-origin: 0% 50%; }
      .clrow { position: absolute; font-family: var(--mono); font-weight: 700; font-size: 34px; letter-spacing: 0.14em; color: #FFFFFF; white-space: nowrap; }
      .cl { margin-right: 64px; }
      #logo { position: absolute; left: 700px; top: 236px; width: 520px; }
      .url { position: absolute; left: 0; width: 1920px; top: 556px; text-align: center; font-size: 110px; font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: var(--ink); white-space: nowrap; }

      /* The one thing that is never cut: a red dot, born as REC. */
      #dot { position: absolute; left: 0; top: 0; width: 24px; height: 24px; border-radius: 12px; background: var(--red); transform-origin: 50% 50%; }
    </style>
  </head>
  <body>
    <div id="root" data-composition-id="main" data-start="0" data-duration="__TOTAL__" data-width="1920" data-height="1080">
      <div class="clip" id="scene" data-start="0" data-duration="__TOTAL__" data-track-index="0">
        <div id="world" data-layout-allow-overflow>
__TILES__
          <div id="dot" data-layout-allow-overflow></div>
        </div>
      </div>

      <!-- ================= AUDIO ================= -->
      <audio id="music" src="assets/music/music.mp3" data-start="0" data-duration="__TOTAL__" data-volume="1"
        data-automation='{"version":1,"lanes":[{"target":"volume","points":[
          {"t":0,"v":0},{"t":0.5,"v":0.34},{"t":16.0,"v":0.36},{"t":16.3,"v":0.42},{"t":19.0,"v":0.40},
          {"t":29.3,"v":0.40},{"t":29.7,"v":0.30},{"t":32.0,"v":0.30},{"t":32.4,"v":0.36},
          {"t":34.2,"v":0.20},{"t":35.4,"v":0.06},{"t":36.0,"v":0}]}]}'></audio>
__AUDIO__
    </div>

    <script>
      const E = { out: "power3.out", soft: "power2.out", inOut: "power2.inOut", sine: "sine.inOut" };
      const tl = gsap.timeline({ paused: true });

      /* ---- camera ---------------------------------------------------------
         cam(X, Y, s): show world tile whose top-left is (X, Y), at scale s
         about the viewport centre. transform-origin of #world is 0 0. */
      const cam = (X, Y, s) => ({ x: 960 - (X + 960) * s, y: 540 - (Y + 540) * s, scale: s });
      const T = __TILE_ORIGINS__;
      const ARR = __ARRIVE__, LV = __LEAVE__, ORDER = __ORDER__, MOVE = __MOVE__;
      const PUSH = 1.03; // the camera never fully rests: a slow push-in on every hold

      gsap.set("#world", cam(0, 0, 1));
      ORDER.forEach((t, i) => {
        const [X, Y] = T[t];
        // hold: slow push-in, decelerating to rest exactly when the move begins
        tl.to("#world", { ...cam(X, Y, PUSH), duration: LV[t] - ARR[t], ease: "sine.out" }, ARR[t]);
        const next = ORDER[i + 1];
        if (next) {
          const [NX, NY] = T[next];
          tl.to("#world", { ...cam(NX, NY, 1), duration: MOVE, ease: E.inOut }, LV[t]);
        }
      });
      // pull back to the whole world — nine tiles, one film — then into the address
      tl.to("#world", { ...cam(0, 0, 1 / 3), x: 0, y: 0, duration: MOVE, ease: E.inOut }, __ZOOM_OUT__);
      tl.to("#world", { ...cam(1920, 1080, 1), duration: MOVE, ease: E.inOut }, __ZOOM_IN__);
      tl.to("#world", { ...cam(1920, 1080, 1.025), duration: __TOTAL__ - __END_ARRIVE__, ease: "sine.out" }, __END_ARRIVE__);

      /* ---- the dot --------------------------------------------------------- */
      const D = __DOT__;
      const fly = (p, t, d = MOVE, ease = "power3.inOut") => tl.to("#dot", { x: p.x, y: p.y, duration: d, ease }, t);
      gsap.set("#dot", { x: D.t0.x, y: D.t0.y, scale: 1 });
      const PAPER = "#F5F3EF", RED = "#F20505";

      /* ================= T0 — REC / the hook ================= */
      [["#k0", -46, -46], ["#k1", 46, -46], ["#k2", -46, 46], ["#k3", 46, 46]].forEach(([s, dx, dy]) => {
        tl.fromTo(s, { opacity: 0, x: dx, y: dy }, { opacity: 1, x: 0, y: 0, duration: 0.8, ease: E.out }, 0.10);
      });
      tl.fromTo("#h0m", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.45);
      tl.fromTo("#rec", { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.55);
      tl.fromTo("#dot", { opacity: 0 }, { opacity: 1, duration: 0.3 }, 0.55);
      tl.to("#dot", { opacity: 0.3, duration: 0.55, ease: E.sine, repeat: 3, yoyo: true }, 0.90);
      tl.to("#dot", { opacity: 1, duration: 0.3 }, 3.30);
      tl.fromTo("#h0a", { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 0.82);
      tl.fromTo("#h0b", { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 1.37);
      tl.fromTo("#h0c", { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, 1.90);
      tl.fromTo("#h0f", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 2.46);

      /* ================= T1 — the process line ================= */
      fly(D.t1s, LV.t0);
      tl.fromTo("#h1m", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t1 - 0.35);
      // the dot draws the line: identical timing and ease on both
      tl.fromTo("#pline", { scaleX: 0 }, { scaleX: 1, duration: 1.56, ease: E.inOut }, ARR.t1);
      fly(D.t1e, ARR.t1, 1.56, E.inOut);
      // each word appears as the dot passes its x (inverse of power2.inOut)
      __PWORDS__

      /* ================= T2 — services ================= */
      fly(D.t2[0], LV.t1);
      tl.fromTo("#h2m", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t2 - 0.35);
      [0, 1, 2, 3].forEach((i) => {
        const t = ARR.t2 - 0.15 + i * 0.62;
        if (i > 0) fly(D.t2[i], t - 0.30, 0.36, E.inOut);
        tl.fromTo("#sr" + i, { opacity: 0, x: 30 }, { opacity: 1, x: 0, duration: 0.55, ease: E.out }, t);
        tl.fromTo("#sc" + i, { opacity: 0 }, { opacity: 1, duration: 0.4 }, t + 0.2);
      });

      /* ================= T3 — regions ================= */
      fly(D.t3[0], LV.t2);
      tl.to("#dot", { backgroundColor: PAPER, duration: 0.5, ease: E.inOut }, LV.t2 + 0.5);
      tl.fromTo("#h3m", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t3 - 0.35);
      // Row one left to right, row two right to left, and every hop is an arc:
      // x eases across while y lifts and drops, so the pin clears the words.
      const HOPS = [0, 1, 2, 5, 4, 3];
      HOPS.forEach((c, i) => {
        const t = ARR.t3 - 0.16 + i * 0.36;
        if (i > 0) {
          const from = D.t3[HOPS[i - 1]], to = D.t3[c], h = 0.34;
          tl.to("#dot", { x: to.x, duration: h, ease: E.inOut }, t - 0.30);
          tl.to("#dot", { y: Math.min(from.y, to.y) - 118, duration: h / 2, ease: "power2.out" }, t - 0.30);
          tl.to("#dot", { y: to.y, duration: h / 2, ease: "power2.in" }, t - 0.30 + h / 2);
        }
        tl.fromTo("#ct" + c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.out }, t);
      });
      tl.fromTo("#h3f", { opacity: 0 }, { opacity: 1, duration: 0.5 }, ARR.t3 + 2.0);

      /* ================= T4 — numbers ================= */
      fly(D.t4, LV.t3);
      tl.to("#dot", { backgroundColor: RED, duration: 0.5, ease: E.inOut }, LV.t3 + 0.5);
      tl.fromTo("#n1", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, ARR.t4 - 0.40);
      tl.fromTo("#n1c", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t4 + 0.15);
      tl.fromTo("#n2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, ARR.t4 + 0.55);
      tl.fromTo("#n2c", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t4 + 0.85);

      /* ================= T5 — the offer ================= */
      fly(D.t5, LV.t4);
      tl.to("#dot", { scale: 0.5, duration: MOVE, ease: E.inOut }, LV.t4);
      tl.fromTo("#p1", { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.55, ease: E.out }, ARR.t5 - 0.40);
      tl.fromTo("#p2", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, ARR.t5 + 0.05);
      tl.fromTo("#p3", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t5 + 0.45);

      /* ================= T6 — industries ================= */
      fly(D.t6a, LV.t5);
      tl.fromTo("#h6m", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t6 - 0.35);
      tl.fromTo("#b0", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.out }, ARR.t6 - 0.40);
      tl.fromTo("#b1", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.out }, ARR.t6 - 0.05);
      fly(D.t6b, ARR.t6 + 0.10, 0.4, E.inOut);
      tl.fromTo("#b2", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.out }, ARR.t6 + 0.30);
      tl.fromTo("#b3", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: E.out }, ARR.t6 + 0.65);

      /* ================= T7 — clients ================= */
      fly(D.t7, LV.t6);
      tl.to("#dot", { backgroundColor: PAPER, scale: 0.45, duration: MOVE, ease: E.inOut }, LV.t6);
      tl.fromTo("#h7m", { opacity: 0 }, { opacity: 1, duration: 0.4 }, ARR.t7 - 0.35);
      tl.fromTo("#c1", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, ease: E.out }, ARR.t7 - 0.40);
      tl.fromTo("#c2", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, ease: E.out }, ARR.t7 - 0.10);
      [0, 1, 2, 3].forEach((i) => {
        tl.fromTo("#cl" + i, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: E.out }, ARR.t7 + 0.45 + i * 0.22);
      });

      /* ================= the pull-back, and the address ================= */
      // During the pull-back the dot grows 3x so it keeps its on-screen size:
      // the one thing in the mosaic that stays the same size is the one thing
      // that was never cut.
      tl.to("#dot", { scale: 1.35, backgroundColor: RED, duration: MOVE, ease: E.inOut }, __ZOOM_OUT__);
      fly(D.t8, __ZOOM_IN__, MOVE, E.inOut);
      tl.to("#dot", { scale: 0.55, duration: MOVE, ease: E.inOut }, __ZOOM_IN__);
      tl.fromTo("#logo", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6, ease: E.out }, __END_ARRIVE__ - 0.30);
      // the letters bloom outward from the dot that just landed
      tl.fromTo("#u1", { opacity: 0, x: 40 }, { opacity: 1, x: 0, duration: 0.6, ease: E.out }, __END_ARRIVE__ + 0.10);
      tl.fromTo("#u2", { opacity: 0, x: -40 }, { opacity: 1, x: 0, duration: 0.6, ease: E.out }, __END_ARRIVE__ + 0.10);
      tl.fromTo("#e1", { opacity: 0 }, { opacity: 1, duration: 0.45 }, __END_ARRIVE__ + 0.85);
      tl.fromTo("#e2", { opacity: 0 }, { opacity: 1, duration: 0.45 }, __END_ARRIVE__ + 1.15);

      window.__timelines = window.__timelines || {};
      window.__timelines["main"] = tl;
      tl.seek(0);
    </script>
  </body>
</html>
'''

# words appear as the dot passes: invert power2.inOut for the dot's x progress
import math
pw = []
for i, (w, x, _) in enumerate(P_WORDS):
    p = (x - 150) / 1620.0
    t = math.sqrt(p / 2) if p < 0.5 else 1 - math.sqrt((1 - p) / 2)
    at = ARRIVE['t1'] + t * 1.56 + 0.04
    pw.append('tl.fromTo("#pw%d", { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: E.out }, %.3f);' % (i, at))
    pw.append('tl.fromTo("#pc%d", { opacity: 0 }, { opacity: 1, duration: 0.4 }, %.3f);' % (i, at + 0.18))

audio = []
def cue(id_, f, t, v): audio.append('      <audio id="%s" src="assets/sfx/%s" data-start="%.2f" data-volume="%.2f"></audio>' % (id_, f, t, v))
audio.append('      <!-- the camera grammar: the same quiet air pass on every move -->')
for i, t in enumerate(ORDER[:-1]): cue('mv%d' % i, 'move.ogg', LEAVE[t], 0.16)
cue('mvz', 'move.ogg', ZOOM_IN_AT, 0.18)
audio.append('      <!-- the dot draws the process line -->'); cue('draw', 'draw.ogg', ARRIVE['t1'], 0.22)
audio.append('      <!-- six pins, barely there -->')
for i in range(6): cue('hop%d' % i, 'hop.ogg', ARRIVE['t3'] - 0.16 + i * 0.36, 0.12)
audio.append('      <!-- the decimal point lands -->'); cue('land', 'land.ogg', ARRIVE['t4'], 0.48)
audio.append('      <!-- pulling back to the whole world -->'); cue('swell', 'swell.ogg', ZOOM_OUT_AT - 0.3, 0.38)
audio.append('      <!-- release on the address -->'); cue('res', 'resolve.ogg', END_ARRIVE, 0.28)

tiles = '\n'.join(tile(t, inner) for t, inner in
                  [('t0', t0), ('t1', t1), ('t2', t2), ('t3', t3), ('t4', t4), ('t5', t5), ('t6', t6), ('t7', t7), ('t8', t8)])
dot_js = ('{ t0: %s, t1s: %s, t1e: %s, t2: [%s], t3: [%s], t4: %s, t5: %s, t6a: %s, t6b: %s, t7: %s, t8: %s }' % (
    js_pt(dot_T0), js_pt(dot_T1s), js_pt(dot_T1e), ', '.join(map(js_pt, dot_T2)), ', '.join(map(js_pt, dot_T3)),
    js_pt(dot_T4), js_pt(dot_T5), js_pt(dot_T6a), js_pt(dot_T6b), js_pt(dot_T7), js_pt(dot_T8)))

out = (HTML.replace('__TILES__', tiles).replace('__AUDIO__', '\n'.join(audio))
       .replace('__TILE_ORIGINS__', json.dumps({t: list(origin(t)) for t in TILES}))
       .replace('__ARRIVE__', json.dumps(ARRIVE)).replace('__LEAVE__', json.dumps(LEAVE))
       .replace('__ORDER__', json.dumps(ORDER)).replace('__MOVE__', str(MOVE))
       .replace('__ZOOM_OUT__', str(ZOOM_OUT_AT)).replace('__ZOOM_IN__', str(ZOOM_IN_AT))
       .replace('__END_ARRIVE__', str(END_ARRIVE)).replace('__TOTAL__', str(TOTAL))
       .replace('__DOT__', dot_js).replace('__PWORDS__', '\n      '.join(pw)))
open(OUT, 'w', encoding='utf-8').write(out)
print('index.html written (%s measured slots)' % (len(M) or 'no'))
