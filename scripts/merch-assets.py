"""Build the 3D merchandise assets from the committee's flat T-shirt mockup.

    python scripts/merch-assets.py <canva-page-png> <out-dir>

Input: the Canva export of the "front | back" page (cream page, both shirts
side by side). Output, into <out-dir>:

    front.jpg, back.jpg   the prints, pixel for pixel, on the shirt's own
                          silhouette; nothing is redrawn, so no logo smudges
    mask-front.png        the silhouette (alpha) for the front surface
    mask-back.png         the same silhouette mirrored, for the back surface
    shirt.bin             Uint16 height field, row-major, NX x NY, for
                          "inflating" the flat shirt into a soft 3D garment
    fabric-normal.png     a small tileable knit normal map

The geometry is a height field rather than a modelled shirt on purpose:
the print is mapped straight from the mockup, so every logo lands exactly
where the designer put it. Run it again whenever the design changes.
"""
import sys
from pathlib import Path

import numpy as np
import scipy.ndimage as ndi
from PIL import Image, ImageFilter

SRC = Path(sys.argv[1])
OUT = Path(sys.argv[2])
OUT.mkdir(parents=True, exist_ok=True)

TEX_W = 2048          # texture width; height follows the shirt's aspect
NX = 256              # height-field columns; rows follow the aspect
PAD = 0.03            # margin around the silhouette, as a share of width

page = np.asarray(Image.open(SRC).convert("RGB"))
bg = page[5, 5].astype(int)
ink = np.abs(page.astype(int) - bg).sum(-1) > 60
lab, n = ndi.label(ink)
sizes = ndi.sum(ink, lab, range(1, n + 1))
two = (np.argsort(sizes)[::-1][:2] + 1).tolist()
# the left one is the front
boxes = []
for i in two:
    ys, xs = np.where(lab == i)
    boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, i))
boxes.sort()
(fx0, fy0, fx1, fy1, fi), (bx0, by0, bx1, by1, bi) = boxes


def silhouette(i, box):
    x0, y0, x1, y1 = box
    m = ndi.binary_fill_holes(lab[y0:y1, x0:x1] == i)
    return ndi.binary_opening(m, iterations=2)


front_mask = silhouette(fi, (fx0, fy0, fx1, fy1))
back_mask = silhouette(bi, (bx0, by0, bx1, by1))
front = page[fy0:fy1, fx0:fx1]
back = page[by0:by1, bx0:bx1]
H0, W0 = front_mask.shape


def torso(m):
    """Collar top, hem, and the body's two side seams three quarters
    of the way down, below the sleeves. Bounding boxes will not do: on
    the mockup the back's right sleeve runs off the page."""
    ys = np.where(m.any(1))[0]
    top, bottom = ys.min(), ys.max()
    row = m[int(top + 0.75 * (bottom - top))]
    xs = np.where(row)[0]
    return top, bottom, xs.min(), xs.max()


# The back surface is the plane turned round, so it must line up with
# the front silhouette mirrored. Map the back mockup's torso onto it.
ft, fb, fl, fr = torso(front_mask[:, ::-1])
bt, bb, bl, br = torso(back_mask)
sx, sy = (br - bl) / (fr - fl), (bb - bt) / (fb - ft)
affine = (sx, 0, bl - sx * fl, 0, sy, bt - sy * ft)
back = np.asarray(Image.fromarray(back).transform((W0, H0), Image.AFFINE, affine, Image.BICUBIC, fillcolor=tuple(int(c) for c in bg)))
back_mask = np.asarray(Image.fromarray(back_mask.astype(np.uint8) * 255).transform((W0, H0), Image.AFFINE, affine, Image.BILINEAR)) > 127

# pad, so the surface has room to curve down to the edge
p = int(round(PAD * W0))


def pad(a, fill):
    return np.pad(a, ((p, p), (p, p)) + ((0, 0),) * (a.ndim - 2), constant_values=fill)


front, back = pad(front, 0), pad(back, 0)
front_mask, back_mask = pad(front_mask, False), pad(back_mask, False)
H1, W1 = front_mask.shape

# The geometry uses the front's silhouette for both faces. The back
# surface is the plane turned round, so its silhouette is the front's
# mirrored, and its print is the back mockup the right way round.
geo_mask = front_mask
back_geo_mask = geo_mask[:, ::-1]


def bleed(img, mask):
    """Copy the nearest shirt pixel outward, so mip-mapping never pulls
    the cream page into the edge of the cloth."""
    # three pixels in from the edge, past the anti-aliased rim, so the
    # copied colour is cloth and not half cloth, half page
    mask = ndi.binary_erosion(mask, iterations=3)
    idx = ndi.distance_transform_edt(~mask, return_distances=False, return_indices=True)
    return img[idx[0], idx[1]]


def cloth(img, src, geo):
    """Bleed outward, then paint any part of the 3D silhouette the
    mockup does not cover (the back's sleeves are drawn shorter) in the
    plain shirt colour rather than in streaks."""
    out = bleed(img, src & geo).copy()
    core = ndi.binary_erosion(src, iterations=6)
    colour = np.median(img[core], axis=0)
    gap = geo & ~ndi.binary_erosion(src, iterations=2)
    soft = ndi.gaussian_filter(gap.astype(float), 2)[..., None]
    return (out * (1 - soft) + colour * soft).astype(np.uint8)


front_tex = cloth(front, front_mask, geo_mask)
back_tex = cloth(back, back_mask, back_geo_mask)

TEX_H = int(round(TEX_W * H1 / W1))
for name, arr in (("front.jpg", front_tex), ("back.jpg", back_tex)):
    Image.fromarray(arr).resize((TEX_W, TEX_H), Image.LANCZOS).save(OUT / name, quality=90, subsampling=0, optimize=True, progressive=True)

# the flat front and back, cut out: the placeholder while the 3D
# loads, and the two faces shown side by side on the merchandise page
fw = 1200
for name, arr, m in (("flat-front.webp", front_tex, geo_mask), ("flat-back.webp", back_tex, back_geo_mask)):
    flat = Image.fromarray(arr).convert("RGBA")
    flat.putalpha(Image.fromarray(m.astype(np.uint8) * 255).filter(ImageFilter.GaussianBlur(1)))
    flat.resize((fw, int(round(fw * H1 / W1))), Image.LANCZOS).save(OUT / name, quality=88, method=6)

MASK_W = 1024
MASK_H = int(round(MASK_W * H1 / W1))
for name, m in (("mask-front.png", geo_mask), ("mask-back.png", back_geo_mask)):
    a = Image.fromarray(m.astype(np.uint8) * 255).resize((MASK_W, MASK_H), Image.LANCZOS)
    a.save(OUT / name, optimize=True)

# ---- the height field ----
# Built at mask resolution from a signed distance, then box-averaged
# down to the grid, so the edge is a smooth curve and not the staircase
# of a coarse mask. The surface reaches zero a cell and a half inside
# the silhouette: front and back then meet flat at the alpha cut, with
# no gap between them and no saw teeth when the shirt turns side on.
NY = int(round(NX * H1 / W1))
hm = np.asarray(Image.fromarray(geo_mask.astype(np.uint8) * 255).resize((MASK_W, MASK_H), Image.LANCZOS)) > 127
sd = (ndi.distance_transform_edt(hm) - ndi.distance_transform_edt(~hm)) / MASK_W   # in shirt widths
R = 0.11                                   # how far in the edge takes to round over
inset = 1.5 / NX
edge = np.sqrt(np.clip(1 - (1 - np.clip((sd - inset) / R, 0, 1)) ** 2, 0, 1))
body = ndi.gaussian_filter(hm.astype(float), MASK_W * 0.16)   # the torso domes, the sleeves barely do
body = body / body.max()
rng = np.random.default_rng(7)
yy, xx = np.mgrid[0:MASK_H, 0:MASK_W] / MASK_W
folds = sum(
    np.sin((xx * np.cos(a) + yy * np.sin(a)) * f * 2 * np.pi + ph) / f
    for a, f, ph in zip(rng.uniform(0.3, 1.3, 5), rng.uniform(2.5, 6, 5), rng.uniform(0, 6.28, 5))
)
h_hr = edge * (0.05 + 0.075 * body) + 0.0025 * folds * edge * body
h_hr = np.clip(h_hr, 0, None).astype(np.float32)
h = np.asarray(Image.fromarray(h_hr, mode="F").resize((NX, NY), Image.BOX))
HMAX = float(h.max())
(np.round(h / HMAX * 65535).astype("<u2")).tofile(OUT / "shirt.bin")

# ---- a small knit, as a tileable normal map ----
S = 128
y, x = np.mgrid[0:S, 0:S] / S * 2 * np.pi
height = 0.55 * np.sin(x * 16) * np.sin(y * 32) + 0.25 * np.sin(x * 32 + np.sin(y * 8))
height += ndi.gaussian_filter(rng.standard_normal((S, S)), 1.2, mode="wrap") * 0.6
gx = (np.roll(height, -1, 1) - np.roll(height, 1, 1)) * 0.5
gy = (np.roll(height, -1, 0) - np.roll(height, 1, 0)) * 0.5
nz = np.ones_like(gx)
nrm = np.stack([-gx, gy, nz], -1)
nrm /= np.linalg.norm(nrm, axis=-1, keepdims=True)
Image.fromarray(((nrm * 0.5 + 0.5) * 255).astype(np.uint8)).save(OUT / "fabric-normal.png", optimize=True)

print(f"texture {TEX_W}x{TEX_H} | mask {MASK_W}x{MASK_H} | height field NX={NX} NY={NY} max={HMAX:.4f} (in shirt widths) | aspect {H1 / W1:.4f}")
