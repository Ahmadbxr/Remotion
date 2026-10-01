#!/bin/bash
# usage: contact.sh <video> <outdir> <cols> <thumbW> t1 t2 ...
V=$1; S=$2; COLS=$3; TW=$4; shift 4
rm -rf "$S" && mkdir -p "$S"; i=0
for t in "$@"; do printf -v n "%02d" $i; ffmpeg -v error -y -ss $t -i "$V" -frames:v 1 "$S/f${n}_$t.png"; i=$((i+1)); done
python3 - "$S" "$COLS" "$TW" <<'PY'
import sys, glob, os
from PIL import Image, ImageDraw
S, cols, tw = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
fs = sorted(glob.glob(S + "/f*.png"))
im0 = Image.open(fs[0]); th = int(tw * im0.height / im0.width)
rows = (len(fs) + cols - 1) // cols
sheet = Image.new("RGB", (cols * tw, rows * (th + 18)), (20, 20, 20)); d = ImageDraw.Draw(sheet)
for i, f in enumerate(fs):
    sheet.paste(Image.open(f).resize((tw, th)), ((i % cols) * tw, (i // cols) * (th + 18) + 18))
    d.text(((i % cols) * tw + 4, (i // cols) * (th + 18) + 3), os.path.basename(f).split('_')[1][:-4] + "s", fill=(255, 255, 255))
sheet.save(S + "/contact.png"); print(sheet.size)
PY
