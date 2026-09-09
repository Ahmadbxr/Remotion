# Offscript Promo Video

A 16:9 German-language promo video for [offscript.ch](https://offscript.ch), a
social media & content agency based in Zurich. Built with
[Remotion](https://remotion.dev) in an Apple-style dark, minimal aesthetic:
bold kinetic typography, spring-based reveals, and soft cross-fades between
scenes.

## Structure

- `src/OffscriptPromo.tsx` — orchestrates the scene timeline, using an
  overlap-based cross-fade between consecutive `<Sequence>`s.
- `src/scenes/` — the seven scenes (logo, hook, positioning, process,
  platforms, individuality, outro).
- `src/components/` — shared building blocks (`EnterText` spring-in,
  `FadeWrapper` cross-fade, `GlowBackground` ambient backdrop).
- `src/theme.ts` — shared colors, font stack, and cross-fade overlap constant.

## Usage

```bash
npm install

# Live preview / editor
npm run dev

# Render the final MP4 (1920x1080, 30fps)
npm run build

# Render a single still frame
npm run still
```

If no system Chrome/Chromium is found automatically, pass one explicitly:

```bash
npx remotion render src/index.ts OffscriptPromo out/offscript-promo.mp4 \
  --browser-executable=/path/to/chrome
```
