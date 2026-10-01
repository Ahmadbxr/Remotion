# NAIA «Sushi Making» — dezentes Motion Design

Zwei Remotion-Compositions mit derselben Animationsebene (`src/naia/`):

| Composition | Inhalt | Export |
|---|---|---|
| `NaiaPreview` | Originalclip + Animationen (Ton, falls der Clip welchen hat) | MP4 zur Abnahme |
| `NaiaOverlay` | nur die Animationen, transparenter Hintergrund, ohne Ton | MOV ProRes 4444 mit Alpha |
| `NaiaOverlay4K` | dasselbe für den 4K-Master aus dem Briefing | MOV ProRes 4444 mit Alpha |

## Werte des gelieferten Clips (geprüft mit `scripts/naia/probe.sh`)

| | Clip | Briefing |
|---|---|---|
| Auflösung | **1080 × 1920** | 2160 × 3840 |
| Bildrate | **24 fps** (24/1) | 23.976 |
| Länge | 378 Frames = 15.75 s | 378 Frames |
| Ton | **keine Tonspur** | mit Ton |
| Codec | HEVC, Full Range | — |

`NaiaPreview` und `NaiaOverlay` übernehmen die Werte des Clips. Schnitt,
Bildformat und Geschwindigkeit bleiben unverändert; das Overlay ist
frame-genau deckungsgleich (Composite im ffmpeg geprüft). Weil der Clip keine
Tonspur hat, ist auch die Vorschau stumm. Falls im Schnitt ein 4K-Master mit
23.976 fps existiert, passt `NaiaOverlay4K` darauf (gleiche 378 Frames, gleiche
relative Positionen).

Für die Vorschau wurde der Clip frame-genau in eine H.264-Arbeitskopie
(`public/naia/source.mp4`) umgewandelt, weil Chromium HEVC nicht zuverlässig
abspielt. Das Overlay ist davon unabhängig.

## Gestaltung (am Clip vermessen)

| Zeit | Element | Platz | Bewegung |
|---|---|---|---|
| 0.2 – 2.2 s (Frame 5–53) | «THE ART OF SUSHI», warmweiss | auf dem dunklen Stahl über dem Brett, Mitte bei 17.5 % der Höhe, unterhalb der oberen 14 % (Reels-Oberfläche). In diesem Zeitraum kommt keine Hand in den Bereich. | 0.3 s einblenden, 12 px nach oben, halten, 0.35 s ausblenden |
| 2.2 – 14.9 s | — | — | keine Einblendungen |
| 14.88 s – Ende (Frame 357–377) | NAIA-Logo, **dunkles Warmgrau #2A2420** | auf dem freien Brett, zentriert unter den sechs fertigen Sushi (x 64.5 %, y 53 %), oberhalb der unteren 35 % (Reels-Oberfläche) | 0.45 s einblenden, 9 px nach oben, steht bis zum letzten Frame |

**Warum das Logo erst bei 14.88 s statt 14.5 s kommt:** Bis Frame 356
(14.83 s) räumen die Hände genau über dieser Brettfläche ab. Bei 14.5 s würde
das Logo über die Hände geblendet. Ab Frame 357 ist die Fläche frei (siehe
`vorschau/kontrolle_logo_f350-377.png`).

**Folge:** Das Logo steht nur rund 0.9 s, voll sichtbar etwa 0.4 s. Soll es
länger stehen, im Schnitt das letzte Bild um 1–1.5 s verlängern und das
Overlay entsprechend verlängern (`durationInFrames` in `src/naia/config.ts`).
Am gelieferten Schnitt wurde nichts geändert.

**Warum das Logo dunkel ist:** Das Brett ist hell cremeweiss. Warmweiss käme
dort nur auf einen Kontrast von etwa 1.9 : 1. Dunkles Warmgrau erreicht etwa
6.9 : 1. Die Headline bleibt warmweiss auf dem Stahl (ca. 7.6 : 1). Für das
echte Logo also eine **dunkle Version** (PNG/SVG mit Transparenz) verwenden.

Auf Handygrösse (390 pt Breite) sind beide Elemente klar lesbar; Abstand zu
den Seitenrändern deutlich grösser als 6 %.

## Dateien

`export/`
- `NAIA_Overlay_1080x1920_24fps_ProRes4444_TEMP-Wortmarke.mov` — passt auf den
  gelieferten Clip
- `NAIA_Overlay_2160x3840_23976_ProRes4444_TEMP-Wortmarke.mov` — für einen
  4K-Master mit 23.976 fps

Beide: ProRes 4444, Alpha, ohne Ton. Ausserhalb der Grafik vollständig
transparent. ffprobe meldet `yuva444p12le`; das ist die interne Darstellung
von ProRes 4444, gerendert wurde mit `yuva444p10le`.

`vorschau/`
- `NAIA_Preview_klein.mp4` — 540 × 960, ganzer Clip mit Animationen
- `still_einstieg_f24.png`, `still_abschluss_f377.png` (+ `_guides`: Flächen,
  die Reels/TikTok überdecken, schraffiert; 6 %-Seitenränder gestrichelt)
- `kontrolle_headline_f0-60.png`, `kontrolle_logo_f350-377.png` — Bildreihen,
  die zeigen, dass weder Hände noch Sushi verdeckt werden

## Noch offen

- **Logo:** temporäre NAIA-Wortmarke (Vorschau pink markiert, Overlay ohne
  Markierung). Echtes Logo, dunkle Version, nach `public/naia/` legen und
  `logo.src` setzen, z. B. `'naia/naia-logo.png'`.
- **Schrift:** Cormorant Garamond als austauschbare Ersatzschrift (SIL OFL).
  NAIA-Markenschrift (WOFF2) nach `public/naia/fonts/` legen und in
  `fonts.display` eintragen.
- **Sprache:** `headline.useDe: true` → «DIE KUNST DES SUSHI».

## Neu rendern

```bash
npm install
bash scripts/naia/run.sh "/pfad/zu/Sushi Making.mp4"   # Clip neu einlesen
bash scripts/naia/run.sh                                # nur neu rendern
```

Das Skript wandelt den Clip frame-genau um, prüft Auflösung, Bildrate und
Frameanzahl, legt Referenzbilder in `out/naia/frames/` ab und rendert Stills,
Vorschau und beide Overlays nach `out/naia/`. Im Studio (`npm run dev`) lassen
sich alle Compositions live ansehen; mit `guides: true` in den Props erscheinen
die Hilfslinien.
