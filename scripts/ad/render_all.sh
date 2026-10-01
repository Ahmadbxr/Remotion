#!/bin/bash
# Renders every deliverable of the Offscript paid-social ad into ad-output/videos.
#   bash scripts/ad/render_all.sh            all versions
#   bash scripts/ad/render_all.sh Ad-Main-A-9x16   one composition
# Set BROWSER to a Chromium binary if Remotion cannot download its own.
set -e
cd "$(dirname "$0")/../.."
BROWSER=${BROWSER:-/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell}
OUT=ad-output/videos
mkdir -p "$OUT"
declare -A NAME=(
  [Ad-Main-A-9x16]=Offscript_Ad_30s_HookA_9x16
  [Ad-Main-B-9x16]=Offscript_Ad_30s_HookB_9x16
  [Ad-Main-C-9x16]=Offscript_Ad_30s_HookC_9x16
  [Ad-Short-A-9x16]=Offscript_Ad_15s_HookA_9x16
  [Ad-Main-A-4x5]=Offscript_Ad_30s_HookA_4x5
  [Ad-Main-A-9x16-Fallback]=Offscript_Ad_30s_HookA_9x16_Beleg-Fallback
)
IDS=${@:-Ad-Main-A-9x16 Ad-Main-B-9x16 Ad-Main-C-9x16 Ad-Short-A-9x16 Ad-Main-A-4x5 Ad-Main-A-9x16-Fallback}
for id in $IDS; do
  echo "→ $id"
  npx remotion render src/index.ts "$id" "$OUT/${NAME[$id]}.mp4" \
    --codec h264 --crf 16 --audio-codec aac --audio-bitrate 320k \
    --browser-executable="$BROWSER" --log=error
done
# sound-off master (no audio track at all) of the main version
if [ -f "$OUT/Offscript_Ad_30s_HookA_9x16.mp4" ]; then
  ffmpeg -v error -y -i "$OUT/Offscript_Ad_30s_HookA_9x16.mp4" -c:v copy -an "$OUT/Offscript_Ad_30s_HookA_9x16_STUMM.mp4"
fi
ls -la "$OUT"
