# Plan v4: Offscript — "EINE EINSTELLUNG"

## Source note
offscript.ch itself is still refused by the egress proxy (`CONNECT` → 403,
`connect_rejected`), for `offscript.ch` and `www.offscript.ch` alike. What
changed this time: the site's indexed copy is reachable through web search,
and every line of content below comes from those index snippets of
offscript.ch — not from earlier cuts, and not invented. It is the site's text
as a search index stored it, so it should be spot-checked against the live
page before publication, but nothing here is authored by me except the hook
line, which is derived from the site's own positioning ("Schweizer KMU, die
auf Instagram und TikTok klingen wollen wie sie selbst").

**From offscript.ch (via index):**
- Title: *Social Media Agentur Zürich*
- "Offscript ist die Social-Media- und Videoproduktions-Agentur aus Zürich.
  Konzeption, Dreh, Schnitt und Betreuung für KMU in Zürich, Basel, Luzern,
  Zug, Bern und St. Gallen. Pakete ab CHF 1'500 pro Monat."
- Content-Strategie und Kampagnenideen, abgestimmt auf Zielgruppe und Plattform
- Social- und Imagevideos bei euch vor Ort — kompaktes Set, kurze Drehtage
- Vertikaler Schnitt inkl. Untertitel, Sounddesign und Format-Varianten
- Redaktionsplan, Posting, Community und monatliches Reporting
- In-house Creators, die vor die Kamera gehen, wenn ihr nicht selbst wollt
- Branchen: Gastronomie, Beauty, Immobilien, Telco
- 1.4 Mio. Accounts erreicht · 3'000+ neue Follower für Kunden
- Kunden: NAIA, Lyvé, ImmoLiving AG, yallo — "vom Quartierrestaurant bis zum
  Telekommunikationsunternehmen"
- hello@offscript.ch · +41 76 619 29 52

## The idea
The brief asked for seamless transitions that hold attention throughout. The
most honest way to do that is to have **no transitions at all**: one camera,
one continuous move, and nothing that is ever cut to.

So the film is a single take over a 3×3 world of tiles. The camera spirals
through the eight outer tiles — right, right, down, down, left, left, up —
then pulls back until all nine are on screen at once (the whole film as one
image), and pushes into the centre tile, which is the address.

The other thing that is never cut: a **red dot**. It is born as the REC light
in a viewfinder, and it never leaves the screen. It draws the process line,
bullets the services, hops between the six cities as a pin, becomes the
decimal point in *1.4 MIO.*, the full stop after *MONATLICHE PAKETE*, the
middle dot in *IMMOBILIEN · TELCO*, the full stop after *BIS ZUR TELCO*, and
finally — after the pull-back, where it is the only thing that keeps its size
while the world shrinks — it flies into the centre and becomes the **dot in
offscript.ch**.

## Tiles and camera path
```
(0,0) navy  REC / hook        (1,0) paper  Prozess       (2,0) navy  Leistungen
(0,1) red   Kunden            (1,1) paper  ADRESSE       (2,1) red   Regionen
(0,2) navy  Branchen          (1,2) paper  Pakete        (2,2) navy  Zahlen
```
Path: hook → Prozess → Leistungen → Regionen → Zahlen → Pakete → Branchen →
Kunden → pull-back to all nine → push-in to the address. Every neighbour on
the path has a different surface, so every move crosses a colour edge.

## Schedule (36.0s, 30 fps)
Moves are 1.09s (two beats of the 109.96 BPM track) on power2.inOut. Holds:
hook 3.55 · Prozess 2.71 · Leistungen 3.03 · Regionen 2.72 · Zahlen 2.72 ·
Pakete 2.18 · Branchen 2.19 · Kunden 2.73 · pull-back 1.09 · mosaic 0.54 ·
push-in 1.09 · address 3.81.

The camera never fully rests: each hold is a 3% push-in on sine.out, which
decelerates to zero exactly as the next move begins from zero.

## Copy (all on screen)
- Hook: SOCIAL MEDIA, / DAS KLINGT / WIE IHR. — under *SOCIAL MEDIA AGENTUR
  ZÜRICH* and a REC light
- Prozess: KONZEPTION · DREH · SCHNITT · BETREUUNG, each with its caption
  (Strategie & Kampagnenideen / bei euch vor Ort / vertikal, untertitelt /
  Posting, Community, Reporting)
- Leistungen: the four service lines and their sub-lines, verbatim
- Regionen: ZÜRICH BASEL LUZERN / ZUG BERN ST. GALLEN
- Zahlen: 1.4 MIO. ACCOUNTS ERREICHT · 3'000+ NEUE FOLLOWER FÜR UNSERE KUNDEN
- Pakete: MONATLICHE PAKETE. AB CHF 1'500 PRO MONAT
- Branchen: GASTRONOMIE · BEAUTY / IMMOBILIEN · TELCO
- Kunden: VOM QUARTIERRESTAURANT BIS ZUR TELCO. NAIA LYVÉ IMMOLIVING AG YALLO
- Adresse: logo · offscript.ch · hello@offscript.ch · +41 76 619 29 52 · ZÜRICH

## Audio
- Music: `happy-beats-business-moves-vol-10` (109.96 BPM, 60s) — fourth
  different track across the four cuts; even intensity from the first beat,
  no intro dip, which a film with a hook at 0.82s needs.
- SFX as grammar rather than events: the same quiet air pass on every camera
  move (seven moves plus the push-in), a draw under the process line, six
  barely-there ticks for the six pins, one landing when the decimal point
  arrives, a sub swell under the pull-back, one release on the address.
  Nothing on the hook, nothing on the services, nothing on the clients.

## Engineering notes
- Dot landings are measured, not estimated: a 12-frame side composition shows
  one target per frame, white on black, and is rendered by hyperframes' own
  pipeline; the dot targets are read from the glyph ink. Two cheaper methods
  were wrong by up to 85 px — a zero-height inline slot reports the font's
  content-area baseline (~0.11em under the visible one), and the renderer's
  compiler swaps `ui-sans-serif` for a fetched Inter, so any plain-Chromium
  screenshot measures a wider face.
- City pins hop in arcs (x on inOut, y up on power2.out then down on
  power2.in) so the dot never slides across a word.

## Measured QC
- `hyperframes check`: lint / runtime / motion clean, 25/25 contrast checks
  pass WCAG AA; one info-level overlap note at 1/3 scale (rounding).
- Per-frame audit over 1080 frames: no one-frame brightness spikes; largest
  jerk 13.1 at the pull-back (a full-frame scale change, ramped over 33
  frames), everything else ≤ 5.7. The last second carries the tail of the
  slow push-in (max delta 0.26), by design.
- Mix: −23.7 LUFS integrated, true peak −10.4 dBFS.
