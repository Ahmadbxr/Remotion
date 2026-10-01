# NAIA «Sushi Making» — dezentes Motion Design

Zwei Remotion-Compositions mit derselben Animationsebene (`src/naia/`):

| Composition | Inhalt | Export |
|---|---|---|
| `NaiaPreview` | Originalclip mit Ton + Animationen | MP4 zur Abnahme |
| `NaiaOverlay` | nur die Animationen, transparenter Hintergrund, ohne Ton | MOV ProRes 4444 mit Alpha, zum Darüberlegen im Schnittprogramm |

Beide übernehmen exakt die Werte des Clips: 2160 × 3840, 24000/1001 fps,
378 Frames. Schnitt, Bildformat und Geschwindigkeit des Clips bleiben unverändert;
das Overlay ist frame-genau deckungsgleich.

## Gestaltung (am Screenshot vermessen)

Gemessen am Screenshot des Clips (Kamera von oben, fix): dunkler Stahl
0–23.2 % der Bildhöhe, helles Schneidebrett 23.2–80.4 %, Stahl darunter;
ein Sushi-Stück am rechten Rand bei 24–37 %.

| Zeit | Element | Platz | Bewegung |
|---|---|---|---|
| 0.21 – 2.21 s (Frame 5–53) | «THE ART OF SUSHI», warmweiss | auf dem dunklen Stahl, Mitte bei 17.5 % — ca. 110 px Abstand zur Brettkante, unterhalb der oberen 14 % (Reels-Oberfläche) | 0.3 s einblenden, 24 px nach oben, halten, 0.35 s ausblenden |
| dazwischen | — | — | keine Einblendungen |
| 14.51 s – Ende (Frame 348–377) | NAIA-Logo, **dunkles Warmgrau #2A2420** | auf dem freien Brett, Mitte bei 60 % — oberhalb der unteren 35 % (Reels-Oberfläche) | 0.6 s einblenden, 18 px nach oben, stehen bis zum letzten Frame |

**Warum das Logo dunkel ist:** Das Brett ist hell cremeweiss. Warmweiss käme
dort nur auf einen Kontrast von etwa 1.9 : 1 und wäre auf dem Handy kaum zu
sehen. Dunkles Warmgrau erreicht etwa 6.9 : 1. Die Headline bleibt warmweiss
auf dem dunklen Stahl (ca. 7.6 : 1). Für das echte Logo also eine **dunkle
Version** (PNG/SVG mit Transparenz) verwenden.

Auf Handygrösse (390 pt Breite) sind beide Elemente klar lesbar, Seitenränder
deutlich grösser als 6 %.

## Stand dieser Lieferung

- Die Vorschau-Dateien in `vorschau/` laufen über den Screenshot als
  Standbild (unten links als «REFERENZ» gekennzeichnet) — die Platzierung ist
  damit am echten Bildausschnitt geprüft, die Bewegung des Clips selbst nicht.
  Der Upload des Originalclips kam nur als 48-Byte-Fragment an.
- **Annahme:** Der Screenshot zeigt die Kameraeinstellung, die im ganzen Clip
  gleich bleibt. Liegen die fertigen Sushi-Stücke am Ende tiefer als ca. 55 %
  der Bildhöhe, `logo.cy` entsprechend erhöhen (siehe unten).
- Logo: temporäre NAIA-Wortmarke (Vorschau pink markiert, Overlay ohne Markierung).
- Schrift: Cormorant Garamond als austauschbare Ersatzschrift (SIL OFL).

## So machst du es auf deinem Mac fertig

```bash
npm install
bash scripts/naia/run.sh "/Users/ahmadel-khenany/Desktop/NAIA/05.09/fertige videos/Sushi Making.mp4"
```

Das Skript kopiert den Clip nach `public/naia/source.mp4`, stellt die
Konfiguration auf den Originalclip um, prüft Auflösung, Bildrate und
Frameanzahl, legt Referenzbilder in `out/naia/frames/` ab und rendert:

- `out/naia/still_einstieg.png`, `still_abschluss.png` (+ Varianten mit Safe-Zone-Hilfslinien)
- `out/naia/NAIA_Preview_klein.mp4` (540 × 960, mit Ton)
- `out/naia/NAIA_Overlay_ProRes4444.mov` (2160 × 3840, Alpha, ohne Ton)

Danach in `src/naia/config.ts` anpassen und `run.sh` ohne Argument erneut starten:

1. **Position prüfen:** `headline.cy` (Höhe der Headline, Anteil der
   Bildhöhe) muss auf der dunklen Fläche oberhalb des Bretts liegen;
   `logo.cy` auf dem freien Brett unterhalb der Sushi. Hände und Sushi dürfen
   nicht verdeckt werden — an den Referenzbildern bei Frame 348–377 prüfen.
2. **Logo:** echtes Logo (PNG/SVG mit Transparenz) nach `public/naia/`
   legen und `logo.src` setzen, z. B. `'naia/naia-logo.png'`.
3. **Schrift:** NAIA-Markenschrift (WOFF2) nach `public/naia/fonts/` legen
   und in `fonts.display` eintragen.
4. **Deutsch statt Englisch:** `headline.useDe: true` → «DIE KUNST DES SUSHI».

Im Studio (`npm run dev`) lassen sich beide Compositions live ansehen; mit
`guides: true` in den Props erscheinen die Hilfslinien.

## Hinweis Reels/TikTok

Die Hilfslinien-Stills zeigen die Bereiche, die die App überdeckt (oben 14 %,
unten 35 %). Headline und Logo liegen beide ausserhalb.
