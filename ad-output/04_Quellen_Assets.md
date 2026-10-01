# Quellen und Assets

## Zugriff auf offscript.ch

Die vier Seiten (/, /referenzen/, /ueber-uns/, /creators/) konnten in dieser
Produktionsumgebung **nicht direkt geladen werden**: Die Netzwerkrichtlinie
der Umgebung blockiert die Domain (HTTP 403 auf CONNECT, auch für
www.offscript.ch). Die Inhalte wurden stattdessen über den Suchindex
geprüft, der die Seitentexte von offscript.ch wiedergibt. Daraus folgt:

- Alle Aussagen im Video stammen von offscript.ch, aber aus dem
  **indexierten** Stand. Vor der Schaltung einmal gegen die Live-Seite
  abgleichen (Liste in 03_Fehlende_Dateien_und_Freigaben.md).
- **Bild- und Videodateien** der Seite waren nicht abrufbar. Das Video
  enthält deshalb beschriftete Platzhalter statt Kundenarbeiten.
- **Farben und Schrift** konnten nicht aus dem CSS der Live-Seite gelesen
  werden (siehe unten).

## Verwendete Aussagen und ihre Quelle

| Aussage im Video | Quelle | Bemerkung |
|---|---|---|
| Social Media & Video · Zürich | offscript.ch: «Social-Media- und Videoproduktions-Agentur aus Zürich» | |
| Idee / Dreh / Schnitt / Betreuung | offscript.ch: «Konzeption, Dreh, Schnitt und Betreuung für KMU» | «Idee» als kürzere Form für Konzeption |
| Konzept & Kampagnenidee | offscript.ch: «Content-Strategie und Kampagnenideen» | |
| Bei euch vor Ort | offscript.ch: «Social- und Imagevideos bei euch vor Ort» | |
| Vertikal, mit Untertiteln | offscript.ch: «Vertikaler Schnitt inkl. Untertitel, Sounddesign und Format-Varianten» | |
| Posting, Community, Reporting | offscript.ch: «Redaktionsplan, Posting, Community und monatliches Reporting» | |
| Ein Ansprechpartner, ein Ablauf. | offscript.ch: «Ein Team, ein Ansprechpartner, ein durchgehender Ablauf.» | gekürzt |
| NAIA Sushi & Steak · Gastronomie | offscript.ch/referenzen | |
| Ein Video. Über 10’000 Aufrufe. | offscript.ch/referenzen: NAIA, «10K+», über 10’000 Aufrufe für ein Video | als Aufrufe dargestellt, nie als Anfragen oder Umsatz; Quelle als Fussnote im Bild |
| 30 Minuten · unverbindlich | offscript.ch: 30-minütiges Erstgespräch, unverbindlich, kein Verkaufsgespräch | «kostenlos» ist nicht ausdrücklich bestätigt und wird **nicht** verwendet |

### Bewusst nicht verwendet

| Angabe | Grund |
|---|---|
| 3’250’000 Aufrufe (NAIA, Gesamtwert) | Zuordnung unklar (gesamt vs. ein Video) |
| 1.4 Mio. erreichte Accounts, 3’000+ neue Follower | Gesamtzahl ohne eindeutigen Case-Bezug |
| Pakete ab CHF 1’500 / Growth ab CHF 3’000 | Angebote sind nicht Teil des Briefings; Preise ändern sich |
| Weitere Kundennamen (Lyvé, ImmoLiving AG, yallo) | Nur mit Freigabe und echtem Material zeigen; im Video nicht genannt |

## Asset-Übersicht

| Asset | Datei | Herkunft | Nutzung / Lizenz |
|---|---|---|---|
| Logo (Original) | `public/ad/brand/offscript-logo.png` | `public/offscript-logo.png` im Repository (Offscript-Logo, 1020×480 PNG), auf die Tinte beschnitten | Markeneigentum Offscript |
| Logo hell | `public/ad/brand/offscript-logo-light.png` | aus dem Original abgeleitet: schwarz → weiss, rotes «zh» unverändert (`scripts/ad/prepare_brand.py`) | wie oben |
| Farben | `src/ad/config.ts` → `BRAND.colors` | Papier #F5F3EF, Tinte #111111, Grau #6E6A63 aus früheren, auf offscript.ch basierenden Arbeiten in diesem Repository; Rot #F20505 entspricht dem gemessenen «zh» im Logo (#F61215) | gegen Live-CSS prüfen |
| Schriften | `public/ad/fonts/*.woff2` | Inter Tight und Inter über @fontsource (npm) | SIL Open Font License 1.1, Werbung erlaubt |
| Musik | `public/ad/audio/music-*.wav` | eigens synthetisiert mit `scripts/ad/synth_audio.py`, keine Samples | keine Drittrechte; frei für bezahlte Werbung |
| Sounddesign | `public/ad/audio/sfx-*.wav` | eigens synthetisiert, gleiches Skript | keine Drittrechte |
| Icons | `src/ad/components/Icons.tsx` | eigene SVG-Zeichnungen | keine Drittrechte |
| Kundenarbeiten | `public/ad/media/` | **fehlen** — Platzhalter im Video | siehe 03_Fehlende_Dateien_und_Freigaben.md |

Musik: Die in diesem Repository vorhandenen «Happy Beats / Business Moves»
von ende.app wurden bewusst **nicht** verwendet. Ihre Lizenz ist im Repository
nicht dokumentiert, und für bezahlte Werbung war sie damit nicht eindeutig
geklärt.
