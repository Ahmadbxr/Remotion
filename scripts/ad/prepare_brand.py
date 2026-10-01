#!/usr/bin/env python3
"""Builds the two logo variants used by the ad from the original Offscript
logo (public/offscript-logo.png): trimmed to the ink, plus a light variant for
use over imagery (black ink -> white, the red "zh" untouched)."""
from PIL import Image
import numpy as np, os
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
src = Image.open(os.path.join(ROOT, 'public/offscript-logo.png')).convert('RGBA')
a = np.asarray(src).astype(np.int32)
ys, xs = np.nonzero(a[:, :, 3] > 12)
pad = 10
box = (max(xs.min() - pad, 0), max(ys.min() - pad, 0), min(xs.max() + pad + 1, a.shape[1]), min(ys.max() + pad + 1, a.shape[0]))
logo = src.crop(box)
out = os.path.join(ROOT, 'public/ad/brand')
logo.save(os.path.join(out, 'offscript-logo.png'))
b = np.asarray(logo).astype(np.int32).copy()
red = (b[:, :, 0] > 150) & (b[:, :, 0] - b[:, :, 1] > 80)
ink = ~red
b[ink, 0] = 255; b[ink, 1] = 255; b[ink, 2] = 255
Image.fromarray(b.astype(np.uint8), 'RGBA').save(os.path.join(out, 'offscript-logo-light.png'))
print('logo', logo.size, 'box', box)
