# NAIA «Sushi Making» — dezentes Motion Design

Zwei Remotion-Compositions mit derselben Animationsebene (`src/naia/`):

| Composition | Inhalt | Export |
|---|---|---|
| `NaiaPreview` | Originalclip mit Ton + Animationen | MP4 zur Abnahme |
| `NaiaOverlay` | nur die Animationen, transparenter Hintergrund, ohne Ton | MOV ProRes 4444 mit Alpha, zum Darüberlegen im Schnittprogramm |

Beide übernehmen exakt die Werte des Clips: 2160 × 3840, 24000/1001 fps,
378 Frames. Schnitt, Bildformat und Geschwindigkeit des Clips bleiben unverändert;
das Overlay ist frame-genau deckungsgleich.

## Gestaltung

| Zeit | Element | Bewegung |
|---|---|---|
| 0.21 – 2.21 s (Frame 5–53) | «THE ART OF SUSHI», warmweiss, auf der dunklen Fläche oberhalb des Bretts | 0.3 s einblenden und 24 px (bei 2160 px Breite) nach oben, halten, 0.35 s ausblenden |
| dazwischen | — | keine Einblendungen |
| 14.51 s – Ende (Frame 348–377) | NAIA-Logo auf dem freien Brett unterhalb der Sushi | 0.6 s ruhig einblenden mit 18 px Steigung, stehen bis zum letzten Frame |

Keine springenden Buchstaben, keine Partikel, keine Pfeile. Ein sehr weicher
Schatten hält den warmweissen Text auch auf hellerem Holz lesbar.

## Stand dieser Lieferung — bitte lesen

Der Originalclip liegt auf deinem Mac und war in der Cloud-Umgebung, in der
das Projekt gebaut wurde, nicht verfügbar. Ebenso wenig NAIA-Logo und
-Schrift (naia-restaurant.ch ist dort gesperrt). Deshalb:

- **Vorschau-Dateien in `vorschau/` laufen über einen STAND-IN**: einen
  künstlichen Clip mit exakt denselben Spezifikationen (2160×3840,
  24000/1001 fps, 378 Frames, mit Ton und Frame-Zähler). Damit sind Timing,
  Synchronität und der Alpha-Export geprüft — nicht aber die Platzierung auf
  dem echten Bild.
- **Logo:** temporäre NAIA-Wortmarke, in der Vorschau pink gekennzeichnet
  (im Overlay-Export ohne Kennzeichnung).
- **Schrift:** Cormorant Garamond als austauschbare Ersatzschrift (SIL OFL).

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

Wird der Clip als Reel gepostet, verdeckt die App die unteren rund 35 % des
Bildes (Beschreibung, Buttons) und die oberen 14 %. Die Headline liegt mit
`cy: 0.17` knapp unter der oberen Zone. Das Logo bei `cy: 0.80` liegt im
unteren Bereich — auf dem Feed-Vorschaubild gut sichtbar, im Reel-Player
teilweise verdeckt. Wenn das freie Brett es zulässt, das Logo höher setzen
(Hilfslinien-Stills zeigen die Zonen).
