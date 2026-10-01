# Anleitung: Texte, Farben, Medien und Versionen ändern

Alles Redaktionelle steht in **einer Datei: `src/ad/config.ts`**. Komponenten
enthalten keine Texte, Farben oder Dateipfade.

## Vorschau und Rendern

```bash
npm install                 # einmalig
npm run dev                 # Remotion Studio: alle Versionen live ansehen
npm run ad:render           # alle Lieferdateien nach ad-output/videos/
bash scripts/ad/render_all.sh Ad-Main-B-9x16   # nur eine Version
```

Fehlt ein Chromium, den Pfad mitgeben:
`BROWSER=/pfad/zu/chrome bash scripts/ad/render_all.sh`.

| Composition | Datei |
|---|---|
| `Ad-Main-A-9x16` | Offscript_Ad_30s_HookA_9x16.mp4 (+ _STUMM) |
| `Ad-Main-B-9x16` | Offscript_Ad_30s_HookB_9x16.mp4 |
| `Ad-Main-C-9x16` | Offscript_Ad_30s_HookC_9x16.mp4 |
| `Ad-Short-A-9x16` | Offscript_Ad_15s_HookA_9x16.mp4 |
| `Ad-Main-A-4x5` | Offscript_Ad_30s_HookA_4x5.mp4 |
| `Ad-Main-A-9x16-Fallback` | Offscript_Ad_30s_HookA_9x16_Beleg-Fallback.mp4 |

## Texte

- Hooks: `HOOKS.A / B / C` — `lines` (zwei Zeilen), `payoff` (rote Zeile, nur A),
  `lines2` (zweiter Satz, nur C), `vo` (Sprechertext).
- Alle übrigen Bildtexte: `COPY` (problem, solution, process, proof, benefit, cta).
- Zeilen sind bewusst manuell umbrochen (je ein Eintrag pro Zeile). Längere
  Texte vorher im Studio prüfen: Bei 1080 px Breite passen in der
  Headline-Grösse rund 17 Zeichen pro Zeile.
- Zahlen im Schweizer Format mit typografischem Apostroph: `10’000`.

## Farben

`BRAND.colors` in `config.ts`. Rot (`red`) ist die einzige Akzentfarbe und
markiert das jeweils aktive Element und den CTA — sparsam halten.

## Medien

1. Datei nach `public/ad/media/` kopieren, z. B. `naia-reel.mp4`.
2. In `MEDIA.naiaReel` setzen: `src: 'ad/media/naia-reel.mp4'`, `kind: 'video'`.
3. Bildausschnitt mit `focus: [x, y]` in Prozent steuern (z. B. `[50, 35]`,
   wenn das Motiv im oberen Drittel liegt). Bei Videos mit
   `startFromSeconds` den Einstiegspunkt wählen.
4. Vorschau im Studio prüfen. Der Platzhalter verschwindet automatisch.

## Beleg-Szene umschalten

`PROOF_MODE = 'naia'` (Standard) oder `'fallback'` («Echte Unternehmen. Echte
Geschichten.» mit vier Branchen-Kacheln).

## Ton

- Voice-over: siehe 02_Sprechertext.md, dann `AUDIO.voiceover.enabled = true`.
- Musik neu erzeugen oder anpassen: `npm run ad:audio` (Skript
  `scripts/ad/synth_audio.py`; Akkorde, Abschnitte und Lautstärken stehen oben
  in der Datei). Eigenen Track verwenden: Datei ablegen und `AUDIO.music`
  anpassen.
- Lautstärken: `AUDIO.music.volume`, `AUDIO.sfxVolume`, einzelne Effekte in
  `src/ad/AdAudio.tsx`.

## Schrift

Inter Tight (Headlines) und Inter (Kicker, Untertitel) liegen lokal in
`public/ad/fonts/`. Für eine Hausschrift: WOFF2-Dateien dort ablegen, in
`src/ad/fonts.ts` eintragen und `BRAND.fonts` anpassen.

## Timing und Bewegung

- Szenenzeiten und die Bahn der wiederkehrenden Karte: `src/ad/choreo.ts`
  (Keyframes in Frames, 30 fps).
- Positionen je Format: `src/ad/layout.ts` (9:16 und 4:5 getrennt).
- Easing-Kurven: `src/ad/theme.ts`.

## Safe-Zone-Kontrolle

Mit Overlay rendern:

```bash
npx remotion render src/index.ts Ad-Main-A-9x16 out/qa.mp4 --props='{"qa":"reels","silent":true}' --scale=0.5
npx remotion render src/index.ts Ad-Main-A-4x5  out/qa.mp4 --props='{"qa":"feed","silent":true}' --scale=0.5
```

Schraffierte Flächen = von der Plattform-Oberfläche verdeckt. Text, Logo und
CTA müssen ausserhalb liegen; Bildflächen dürfen hineinragen.
