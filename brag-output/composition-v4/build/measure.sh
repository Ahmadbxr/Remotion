#!/bin/bash
# Measures where the dot must land from GLYPH INK rendered by hyperframes'
# own pipeline. Two things made cheaper methods wrong: a zero-height inline
# slot reports the font's content-area baseline (~0.11em below the visible
# one), and the renderer's compiler swaps ui-sans-serif/system-ui for a fetched
# Inter, so any plain-Chromium screenshot measures a different (wider) face.
# So: a 6-frame side composition shows one target per frame, white on black,
# camera on its tile at scale 1, rendered as PNGs by the same renderer.
set -e
cd "$(dirname "$0")/.."
mkdir -p build/measure && rm -rf build/measure/frames && cp -r vendor build/measure/ 2>/dev/null || true
python3 - <<'PY'
import re
src = open('index.html', encoding='utf-8').read()
targets = [('n1', 3840, 2160), ('p1', 1920, 2160), ('b-row1', 0, 2160), ('b-row2', 0, 2160), ('c2', 0, 1080), ('url', 1920, 1080)]
src = re.sub(r'<audio[^>]*></audio>\s*', '', src).replace('data-duration="36.0"', 'data-duration="0.4"')
inj = ["tl.clear(); tl.seek(0);", "document.querySelectorAll('.tile').forEach(t => t.style.background = '#000');"]
for k, (tid, X, Y) in enumerate(targets):
    t = (2 * k) / 30 + 0.01   # sets land just after a frame boundary; read the NEXT frame
    inj += ["tl.set('#world', { x: %d, y: %d, scale: 1 }, %.4f);" % (-X, -Y, t),
            "tl.set('#world *', { autoAlpha: 0 }, %.4f);" % t, "tl.set('.tile', { autoAlpha: 1 }, %.4f);" % t,
            "tl.set(['#%s', '#%s *'], { autoAlpha: 1, x: 0, y: 0, scale: 1, color: '#fff' }, %.4f);" % (tid, tid, t)]
src = src.replace('      window.__timelines = window.__timelines || {};', '      ' + '\n      '.join(inj) + '\n      window.__timelines = window.__timelines || {};')
open('build/measure/index.html', 'w', encoding='utf-8').write(src)
open('build/measure/meta.json', 'w').write('{"id":"measure","name":"measure","createdAt":"2026-09-30T00:00:00.000Z"}')
for f in ('package.json', 'hyperframes.json'): open('build/measure/' + f, 'w').write(open(f).read())
PY
( cd build/measure && npx --yes hyperframes@0.8.45 render --format png-sequence -o frames --quiet >/dev/null 2>&1 )
python3 - <<'PY'
import json, glob
from PIL import Image
import numpy as np
targets = [('n1', 3840, 2160), ('p1', 1920, 2160), ('b-row1', 0, 2160), ('b-row2', 0, 2160), ('c2', 0, 1080), ('url', 1920, 1080)]
frames = sorted(glob.glob('build/measure/frames/*.png'))
frames = [frames[2 * k + 1] for k in range(len(targets))]   # frame 2k+1 (0-based) = t (2k+1)/30
out = {}
for (tid, X, Y), f in zip(targets, frames):
    a = np.asarray(Image.open(f).convert('RGB')).astype(int)
    ink = a.sum(axis=2) > 300
    ys, xs = np.nonzero(ink)
    r = {'x0': int(xs.min()) + X, 'x1': int(xs.max()) + X, 'y0': int(ys.min()) + Y, 'y1': int(ys.max()) + Y}
    if tid == 'url':
        cols = ink.any(axis=0); x0, x1 = int(xs.min()), int(xs.max()); runs, start = [], None
        for x in range(x0, x1 + 1):
            if not cols[x] and start is None: start = x
            if cols[x] and start is not None: runs.append((start, x - 1)); start = None
        gs, ge = max(runs, key=lambda q: q[1] - q[0])
        ry = np.nonzero(ink[:, ge + 1:x1 + 1].any(axis=1))[0]
        r.update({'gap0': gs + X, 'gap1': ge + X, 'base': int(ry.max()) + Y})
    out[tid] = r; print(tid, r)
# slot x-centres (layout, for the middle dots between words) — measured the same way, from the render
src = open('index.html', encoding='utf-8').read()
import re as _re
# b-row slots: locate the widest gap in each row's ink instead of trusting layout
for tid in ('b-row1', 'b-row2'):
    f = frames[[t[0] for t in targets].index(tid)]
    a = np.asarray(Image.open(f).convert('RGB')).astype(int); ink = a.sum(axis=2) > 300
    cols = ink.any(axis=0); xs = np.nonzero(cols)[0]; runs, start = [], None
    for x in range(int(xs.min()), int(xs.max()) + 1):
        if not cols[x] and start is None: start = x
        if cols[x] and start is not None: runs.append((start, x - 1)); start = None
    gs, ge = max(runs, key=lambda q: q[1] - q[0])
    out[tid].update({'gap0': gs, 'gap1': ge}); print(tid, 'gap', gs, ge)
d = out['n1']; f = frames[0]
a = np.asarray(Image.open(f).convert('RGB')).astype(int); ink = a.sum(axis=2) > 300
cols = ink.any(axis=0); xs = np.nonzero(cols)[0]; runs, start = [], None
for x in range(int(xs.min()), int(xs.max()) + 1):
    if not cols[x] and start is None: start = x
    if cols[x] and start is not None: runs.append((start, x - 1)); start = None
gs, ge = runs[0]  # first gap: between "1" and "4"
out['n1'].update({'gap0': gs + 3840, 'gap1': ge + 3840}); print('n1 gap', gs, ge)
json.dump(out, open('build/measured.json', 'w'), indent=1)
PY
rm -rf build/measure/frames build/measure/vendor
