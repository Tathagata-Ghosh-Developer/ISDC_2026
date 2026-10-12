"""Sewing pattern for the 3D tee, from the committee's flat mockup.

The whole pipeline, from the repo root, with TEE_WORK set to a scratch
folder outside the repo (the .blend files and frames are large):

  1. python scripts/merch-assets.py <canva-front-back-page.png> "$TEE_WORK"
       front.jpg, back.jpg, mask-front.png, mask-back.png, fabric-normal.png
  2. Put bg-kash-square.jpg in $TEE_WORK: the kash-and-sky photo cropped
     square, the backdrop the film is rendered against.
  3. python scripts/tee3d/pattern.py
       pattern.npz: the outline, corners and seams; corners.png and
       panels.png to check them by eye
  4. blender -b --factory-startup -P scripts/tee3d/sim.py -- 170
       sews the panels on a ghost mannequin; draped.blend, preview.png
  5. blender -b "$TEE_WORK/draped.blend" -P scripts/tee3d/finish.py -- stills
     then -- render (360 frames to frames/) and -- export (tee.glb)
  6. Encode, from $TEE_WORK:
       ffmpeg -framerate 60 -i frames/f%04d.png -c:v libx264 -preset slow -crf 19
         -pix_fmt yuv420p -movflags +faststart tee-loop-1080p60.mp4
       ffmpeg -framerate 60 -i frames/f%04d.png -c:v libvpx-vp9 -b:v 0 -crf 32
         -row-mt 1 -pix_fmt yuv420p tee-loop-1080p60.webm
       and the same at -vf fps=30,scale=720:720 (VP9 crf 35) for phones
     then copy the films, a poster frame as WebP and tee.glb to
     public/media/merch/, and bump ?v= on tee.glb in ShirtViewer.tsx.

Blender 5.2 LTS; Python needs numpy, scipy, contourpy, matplotlib, Pillow.
"""
import os
from pathlib import Path

import numpy as np
import contourpy
from PIL import Image, ImageDraw

WORK = Path(os.environ["TEE_WORK"])  # see pattern.py: inputs come from here, outputs go here
cr = lambda a, b: a[..., 0] * b[..., 1] - a[..., 1] * b[..., 0]

m = np.asarray(Image.open(WORK / "mask-front.png").convert("L")).astype(float) / 255
c = max(contourpy.contour_generator(z=m).lines(0.5), key=len) * 2.0  # texture px (2048 wide)
if np.allclose(c[0], c[-1]):
    c = c[:-1]


def dp(pts, eps):
    if len(pts) < 3:
        return pts
    a, b = pts[0], pts[-1]
    ab = b - a
    n = np.hypot(*ab) or 1
    d = np.abs(cr(ab, pts - a)) / n
    i = int(np.argmax(d))
    if d[i] > eps:
        return np.vstack([dp(pts[: i + 1], eps)[:-1], dp(pts[i:], eps)])
    return np.array([a, b])


# start at the bottom middle so no corner sits on the loop's join
k = int(np.argmax(c[:, 1] - np.abs(c[:, 0] - 1024) * 0.05))
c = np.vstack([c[k:], c[:k]])
far = int(np.argmax(np.hypot(*(c - c[0]).T)))
s = np.vstack([dp(c[: far + 1], 5.0)[:-1], dp(np.vstack([c[far:], c[:1]]), 5.0)[:-1]])

img = Image.open(WORK / "front.jpg").convert("RGB").resize((1024, 941))
d = ImageDraw.Draw(img)
corners = []
for i, p in enumerate(s):
    a, b = s[i - 1], s[(i + 1) % len(s)]
    ang = float(np.degrees(np.arctan2(cr(p - a, b - p), np.dot(p - a, b - p))))
    if abs(ang) > 25:
        corners.append((i, p, ang))
        x, y = p / 2
        d.ellipse([x - 5, y - 5, x + 5, y + 5], outline=(255, 0, 0), width=2)
        d.text((x + 6, y - 8), str(i), fill=(255, 255, 0))
for i, p, ang in corners:
    print(f"{i:3d} ({p[0]:7.1f},{p[1]:7.1f}) turn {ang:6.1f}")
print("simplified", len(s), "of", len(c))
img.save(WORK / "corners.png")
np.save(WORK / "contour.npy", c)
np.save(WORK / "simple.npy", s)

# ---------------------------------------------------------------- mesh
from scipy.spatial import Delaunay
from matplotlib.path import Path as MPath

TW, TH = 2048, 1881          # texture frame
S = 4.6e-4                   # metres per texture pixel: uniform, so the print keeps its proportions
H = 0.012                    # target edge length, metres
HP = H / S                   # in pixels


def nearest(pt):
    return int(np.argmin(np.hypot(*(c - pt).T)))


# corners on the dense contour, by position (see corners.png)
idx = {name: nearest(np.array(p)) for name, p in {
    "hemL": (455.5, 1822), "cuffLb": (252, 831.3), "cuffLt": (57.1, 504),
    "neckL": (778, 58.6), "neckR": (1266, 57.2), "cuffRt": (1988.8, 508),
    "cuffRb": (1796, 830.7), "hemR": (1592.1, 1822)}.items()}
print(idx)


def arc(a, b):
    """Contour from index a to index b, walking forward round the loop."""
    if b >= a:
        return c[a: b + 1]
    return np.vstack([c[a:], c[: b + 1]])


def resample(poly, step):
    seg = np.hypot(*np.diff(poly, axis=0).T)
    t = np.concatenate([[0], np.cumsum(seg)])
    n = max(2, int(round(t[-1] / step)) + 1)
    u = np.linspace(0, t[-1], n)
    return np.stack([np.interp(u, t, poly[:, 0]), np.interp(u, t, poly[:, 1])], 1)


def neck(depth_y):
    """A smooth neckline from neckR round to neckL, lowest at depth_y in the middle."""
    a, b = c[idx["neckR"]], c[idx["neckL"]]
    t = np.linspace(0, 1, 200)
    mid = np.array([(a[0] + b[0]) / 2, depth_y])
    # a quadratic through a, mid, b, with the control point set so the curve passes through mid
    ctrl = 2 * mid - (a + b) / 2
    return ((1 - t) ** 2)[:, None] * a + (2 * (1 - t) * t)[:, None] * ctrl + (t ** 2)[:, None] * b


# The loop runs hemR -> (bottom middle) -> hemL -> armpit -> cuffLb -> cuffLt -> neckL -> ... -> neckR -> cuffRt -> cuffRb -> hemR.
segments = [
    ("hem", arc(idx["hemR"], idx["hemL"]), "open"),
    ("sideL", arc(idx["hemL"], idx["cuffLb"]), "seam"),
    ("cuffL", arc(idx["cuffLb"], idx["cuffLt"]), "open"),
    ("topL", arc(idx["cuffLt"], idx["neckL"]), "seam"),
    ("NECK", None, "open"),
    ("topR", arc(idx["neckR"], idx["cuffRt"]), "seam"),
    ("cuffR", arc(idx["cuffRt"], idx["cuffRb"]), "open"),
    ("sideR", arc(idx["cuffRb"], idx["hemR"]), "seam"),
]


def panel(neck_depth):
    pts, labels = [], []
    for name, poly, kind in segments:
        if name == "NECK":
            poly = neck(neck_depth)[::-1]          # neckL -> neckR
            name = "neck"
        r = resample(poly, HP)[:-1]                # drop the last: it is the next segment's first
        pts.append(r)
        labels += [name] * len(r)
    b = np.vstack(pts)
    path = MPath(b)
    # interior: a staggered grid, kept clear of the edge
    xs = np.arange(b[:, 0].min(), b[:, 0].max(), HP)
    ys = np.arange(b[:, 1].min(), b[:, 1].max(), HP * 0.866)
    grid = np.array([(x + (HP / 2 if j % 2 else 0), y) for j, y in enumerate(ys) for x in xs])
    inside = path.contains_points(grid)
    grid = grid[inside]
    dist = np.min(np.hypot(grid[:, None, 0] - b[None, :, 0], grid[:, None, 1] - b[None, :, 1]), axis=1)
    grid = grid[dist > 0.6 * HP]
    allp = np.vstack([b, grid])
    tri = Delaunay(allp).simplices
    cen = allp[tri].mean(1)
    keep = path.contains_points(cen)
    e = np.max(np.hypot(*(allp[tri] - allp[np.roll(tri, 1, 1)]).transpose(2, 0, 1)), axis=1)
    keep &= e < 2.2 * HP
    return allp, tri[keep], np.array(labels), len(b)


front = panel(258.0)
back = panel(160.0)
for nm, (p, t, lab, nb) in (("front", front), ("back", back)):
    print(nm, "verts", len(p), "tris", len(t), "boundary", nb, {k: int((lab == k).sum()) for k in set(lab)})

# seams pair up by label and order: the two panels share every seam curve exactly
pairs = []
for name in ("sideL", "topL", "topR", "sideR"):
    fi = np.where(front[2] == name)[0]
    bi = np.where(back[2] == name)[0]
    assert len(fi) == len(bi), name
    pairs += list(zip(fi.tolist(), bi.tolist()))
# the first point of each opening is also where two seams meet: stitch it too
for name in ("hem", "cuffL", "neck", "cuffR"):
    pairs.append((int(np.where(front[2] == name)[0][0]), int(np.where(back[2] == name)[0][0])))
print("seam pairs", len(pairs))

np.savez(WORK / "pattern.npz",
         fp=front[0], ft=front[1], fl=front[2], fnb=front[3],
         bp=back[0], bt=back[1], bl=back[2], bnb=back[3],
         pairs=np.array(pairs), S=S, TW=TW, TH=TH, cx=1022.0, top=58.0)

# picture of both panels for a sanity check
pic = Image.new("RGB", (2100, 1000), "white")
dd = ImageDraw.Draw(pic)
for off, (p, t, lab, nb) in ((0, front), (1050, back)):
    for tr in t[::1]:
        q = [(x / 2 + off, y / 2) for x, y in p[tr]]
        dd.polygon(q, outline=(170, 170, 200))
    col = {"hem": (0, 120, 0), "cuffL": (0, 120, 0), "cuffR": (0, 120, 0), "neck": (200, 0, 0)}
    for (x, y), l in zip(p[:nb], lab):
        dd.ellipse([x / 2 + off - 2, y / 2 - 2, x / 2 + off + 2, y / 2 + 2], fill=col.get(l, (0, 0, 220)))
pic.save(WORK / "panels.png")
