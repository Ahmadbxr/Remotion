#!/bin/bash
# Full local workflow on the machine that has the original clip.
#   bash scripts/naia/run.sh "/Users/.../Sushi Making.mp4"
# 1. copies the clip to public/naia/source.mp4 and points the config at it
# 2. verifies specs + extracts reference frames
# 3. renders stills, a small MP4 preview and the transparent ProRes overlay
set -e
cd "$(dirname "$0")/../.."
if [ -n "$1" ]; then
  mkdir -p public/naia && cp "$1" public/naia/source.mp4
  sed -i.bak "s|source: 'naia/standin/standin.mp4',|source: 'naia/source.mp4',|; s|sourceIsStandIn: true,|sourceIsStandIn: false,|" src/naia/config.ts && rm -f src/naia/config.ts.bak
fi
SRC_REL=$(grep -o "source: '[^']*'" src/naia/config.ts | sed "s/source: '//; s/'//")
bash scripts/naia/probe.sh "public/$SRC_REL"
BROWSER_FLAG=${BROWSER:+--browser-executable=$BROWSER}
OUT=out/naia; mkdir -p "$OUT"
npx remotion still src/index.ts NaiaPreview "$OUT/still_einstieg.png" --frame=24 $BROWSER_FLAG
npx remotion still src/index.ts NaiaPreview "$OUT/still_abschluss.png" --frame=377 $BROWSER_FLAG
npx remotion still src/index.ts NaiaPreview "$OUT/still_einstieg_guides.png" --frame=24 --props='{"guides":true}' $BROWSER_FLAG
npx remotion still src/index.ts NaiaPreview "$OUT/still_abschluss_guides.png" --frame=377 --props='{"guides":true}' $BROWSER_FLAG
npx remotion render src/index.ts NaiaPreview "$OUT/NAIA_Preview_klein.mp4" --scale=0.25 --codec=h264 --crf=20 $BROWSER_FLAG
npx remotion render src/index.ts NaiaOverlay "$OUT/NAIA_Overlay_ProRes4444.mov" \
  --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png $BROWSER_FLAG
ls -la "$OUT"
