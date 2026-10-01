# Fehlende Dateien und Freigaben — vor der Schaltung erledigen

Die gelieferten MP4s sind in Choreografie, Typografie, Timing, Ton und Safe
Zones fertig. **Schaltbereit sind sie erst mit echtem Material.** Alle
Bildflächen zeigen derzeit beschriftete Platzhalter («PLATZHALTER ·
Kundenarbeit …»), damit nichts als Kundenarbeit ausgegeben wird, das keine ist.

## 1. Medien (in `public/ad/media/` ablegen, Pfad in `src/ad/config.ts` → `MEDIA` eintragen)

| Slot | Wo im Video | Benötigt | Format |
|---|---|---|---|
| `hookMotif` | Hook-Karte, Unternehmenskarte, alle vier Produktionszustände | Ein starkes, eng beschneidbares Detail aus einem echten Offscript-Video (Gericht, Hände, Produkt). Idealerweise aus dem NAIA-Dreh, dann erzählt der Produktionsablauf genau den Case, der danach belegt wird. | Video 9:16, ≥ 1080×1920, ≥ 6 s, ruhige Kamera |
| `naiaReel` | Beleg-Karte, zentrale Kachel, Übergang in den CTA | Das veröffentlichte NAIA-Reel mit über 10’000 Aufrufen | Video 9:16, ≥ 1080×1920, ≥ 10 s |
| `workBeauty` | Seitenkarte (Lösung), Kachel | Beauty-Referenz | Bild/Video 3:4 oder 9:16 |
| `workGastro` | Kachel | weitere Gastro-Arbeit | Bild/Video 3:4 oder 9:16 |
| `workRealEstate` | Kachel | Immobilien-Referenz | Bild/Video 3:4 oder 9:16 |
| `workTelco` | Kachel | Telco-Referenz | Bild/Video 3:4 oder 9:16 |
| `team` | Kachel | echtes Behind-the-Scenes-Foto des Offscript-Teams | Bild 3:4 |

`QA.showPlaceholderLabels` muss danach nicht geändert werden: Die Labels
erscheinen nur, solange ein Slot leer ist.

## 2. Nutzungsfreigaben

| Was | Von wem | Warum |
|---|---|---|
| NAIA-Reel und Nennung «NAIA Sushi & Steak» in bezahlter Werbung | NAIA Sushi & Steak | Kundenmaterial und Kundenname in einer Anzeige |
| Kennzahl «über 10’000 Aufrufe» | intern bestätigen | aus offscript.ch/referenzen (Suchindex); aktuellen Stand prüfen |
| Jede weitere gezeigte Kundenarbeit | jeweiliger Kunde | Kundenmaterial in Werbung |
| Personen im Bild (Creators, Mitarbeitende, Gäste) | abgebildete Personen | Recht am eigenen Bild |
| Falls NAIA nicht freigibt | — | `PROOF_MODE = 'fallback'` setzen und Datei `…_Beleg-Fallback.mp4` verwenden (zeigt vier Branchen statt NAIA) |

## 3. Audio

| Was | Status |
|---|---|
| Voice-over | **fehlt** — Sprechertext mit Zeiten in 02_Sprechertext.md, Einbindung dort beschrieben |
| Musik | vorhanden, eigens synthetisiert (keine Drittlizenz). Wer einen lizenzierten Track bevorzugt: Datei ersetzen, Pfad in `AUDIO.music` anpassen. Lizenz muss bezahlte Social-Werbung ausdrücklich abdecken. |
| Sounddesign | vorhanden, eigens synthetisiert |

## 4. Gegen die Live-Seite prüfen (offscript.ch war hier nicht direkt erreichbar)

- [ ] NAIA-Case: «über 10’000 Aufrufe» für **ein** Video — noch so veröffentlicht?
- [ ] Erstgespräch: «30 Minuten, unverbindlich» — noch aktuell? (Nicht «kostenlos» schreiben, solange es nicht ausdrücklich so steht.)
- [ ] Markenfarben: Papier #F5F3EF, Rot #F20505 — mit dem CSS der Seite abgleichen.
- [ ] Hausschrift: Falls Offscript eine eigene Schrift nutzt und für Werbung lizenziert hat, in `public/ad/fonts/` ersetzen (siehe Anleitung).
- [ ] Logo: Das vorliegende PNG ist nur 1020 px breit und hat raue Kanten. Für die Endfassung ein SVG oder PNG ≥ 3000 px liefern.
