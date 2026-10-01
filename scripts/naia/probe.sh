#!/bin/bash
# Verifies the source clip against src/naia/config.ts and extracts reference
# frames for placing the headline and the logo.
#   bash scripts/naia/probe.sh [path/to/clip.mp4]   (default: public/naia/source.mp4)
set -e
cd "$(dirname "$0")/../.."
SRC=${1:-public/naia/source.mp4}
[ -f "$SRC" ] || { echo "Clip nicht gefunden: $SRC"; exit 1; }
OUT=out/naia/frames; mkdir -p "$OUT"
read W H R N <<<"$(ffprobe -v error -select_streams v:0 -count_frames -show_entries stream=width,height,r_frame_rate,nb_read_frames -of csv=p=0 "$SRC" | tr ',' ' ')"
ROT=$(ffprobe -v error -select_streams v:0 -show_entries stream_side_data=rotation -of csv=p=0 "$SRC" | head -1)
AUD=$(ffprobe -v error -select_streams a -show_entries stream=codec_name -of csv=p=0 "$SRC" | head -1)
echo "Quelle: ${W}x${H}  fps=${R}  Frames=${N}  Rotation=${ROT:-0}  Audio=${AUD:-keins}"
ok=1
[ "$W" = 2160 ] && [ "$H" = 3840 ] || { echo "  ✗ Auflösung weicht ab (erwartet 2160x3840) → NAIA.width/height anpassen"; ok=0; }
[ "$R" = "24000/1001" ] || { echo "  ✗ Bildrate weicht ab (erwartet 24000/1001) → NAIA.fps anpassen"; ok=0; }
[ "$N" = 378 ] || { echo "  ✗ Frameanzahl weicht ab (erwartet 378) → NAIA.durationInFrames anpassen"; ok=0; }
[ $ok = 1 ] && echo "  ✓ entspricht src/naia/config.ts"
# reference frames: headline window and logo window
for f in 5 12 24 46 53 300 347 348 362 377; do
  ffmpeg -v error -y -i "$SRC" -vf "select=eq(n\,$f)" -vsync 0 -frames:v 1 "$OUT/frame_$(printf %03d $f).png"
done
echo "Referenzbilder: $OUT"
