# Sprechertext mit Zeitangaben

**Status:** Noch nicht aufgenommen. In dieser Umgebung war keine geeignete
Sprachsynthese verfügbar, und eine roboterhafte Stimme hätte dem Spot
geschadet. Die Animation ist bereits auf die unten stehenden Zeitfenster
getaktet; das Video ist ohne Ton vollständig verständlich (jede Aussage steht
als Bildtext im Bild).

**Stimme:** Schweizer Hochdeutsch, warm, selbstbewusst, freundlich. Eher
Gespräch unter Unternehmern als Werbesprecher. Keine übertriebenen Betonungen,
keine Pausen-Dramatik. Tempo ca. 2.6 Wörter pro Sekunde.

**Technik:** WAV, 48 kHz, 24 bit, mono oder stereo, ohne Musik, mit 200 ms
Stille vor dem ersten Wort. Eine Datei pro Version (Dateinamen unten), Start
der Datei = Frame 0 des Videos.

---

## Hauptvideo 30 s

| Zeit | Szene | Sprechertext | Bildtext |
|---|---|---|---|
| 00:00.2 – 00:02.7 | Hook | *(je nach Variante, siehe unten)* | *(je nach Variante)* |
| 00:03.2 – 00:05.8 | Problem | Gute Arbeit verdient einen starken Auftritt. | Gute Arbeit. / Zu wenig sichtbar? |
| 00:06.4 – 00:09.4 | Lösung | Offscript bringt euer Unternehmen auf Social Media. | Social Media & Video · Zürich / Wir machen euer Können sichtbar. |
| 00:10.2 – 00:15.6 | Entlastung | Von der Idee über Dreh und Schnitt bis zur Betreuung. Ein Team. | Idee. / Dreh. / Schnitt. / Betreuung. / Ein Team. |
| 00:16.6 – 00:20.2 | Beleg | Für NAIA: über zehntausend Aufrufe mit einem Video. | NAIA Sushi & Steak / Ein Video. Über 10’000 Aufrufe. |
| 00:21.2 – 00:24.7 | Nutzen | Ihr führt euer Unternehmen. Wir kümmern uns um euren Content. | Ihr führt euer Unternehmen. / Wir kümmern uns um euren Content. |
| 00:25.4 – 00:29.0 | CTA | Fragt jetzt euer unverbindliches Erstgespräch an. Auf offscript.ch. | Machen wir euer Können sichtbar. / Jetzt Erstgespräch anfragen / 30 Minuten · unverbindlich / offscript.ch |

### Hook-Varianten (00:00.2 – 00:02.7)

| Variante | Sprechertext | Datei |
|---|---|---|
| A | Euer Unternehmen kann mehr. Zeigt es. | `public/ad/audio/vo-main-A.wav` |
| B | Keine Zeit für guten Content? | `public/ad/audio/vo-main-B.wav` |
| C | So gut wie euer Unternehmen – so gut sollte auch euer Content sein. | `public/ad/audio/vo-main-C.wav` |

Hinweis Variante C: 12 Wörter in 2.5 s sind knapp. Zügig, aber ohne Hast
sprechen; die Musik lässt bis 3.0 s Luft.

## Bei Fallback-Beleg (falls NAIA nicht freigegeben wird)

| Zeit | Sprechertext |
|---|---|
| 00:16.6 – 00:20.2 | Echte Unternehmen. Echte Geschichten. Aus Gastronomie, Beauty, Immobilien und Telco. |

## 15-Sekunden-Version

| Zeit | Szene | Sprechertext |
|---|---|---|
| 00:00.2 – 00:02.7 | Hook | Euer Unternehmen kann mehr. Zeigt es. |
| 00:03.3 – 00:05.8 | Lösung | Offscript macht euer Können sichtbar. |
| 00:06.5 – 00:10.0 | Beleg | Für NAIA: über zehntausend Aufrufe mit einem Video. |
| 00:10.9 – 00:14.5 | CTA | Fragt jetzt euer unverbindliches Erstgespräch an. Auf offscript.ch. |

Datei: `public/ad/audio/vo-short-A.wav`

## Einbinden

1. WAV-Dateien unter den genannten Namen in `public/ad/audio/` ablegen.
2. In `src/ad/config.ts` bei `AUDIO.voiceover` `enabled: true` setzen.
3. Neu rendern (`npm run ad:render`). Die Musik wird in jedem Sprechfenster
   automatisch auf 35 % abgesenkt (`duckTo`).
4. Weicht die Aufnahme stärker als ±0.3 s von den Fenstern ab, die Zeiten in
   `VO` (config.ts) anpassen; bei grösseren Abweichungen die Szenenzeiten in
   `src/ad/choreo.ts` nachziehen.
