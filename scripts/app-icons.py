"""
The home-screen icons for the installed app, made from the crest.

    python scripts/app-icons.py

Reads public/media/brand/icon-512.png (the red face with the third eye
on its dark disc) and writes:

    public/media/brand/icon-maskable-512.png   Android adaptive icon
    public/media/brand/icon-maskable-192.png
    src/app/apple-icon.png                     iPhone and iPad, 180 x 180

A maskable icon is cropped by the launcher to a circle, a squircle or a
teardrop, so everything that matters has to sit inside the middle 80 per
cent (a circle of radius 0.4 x the side). The face's eye tips reach 94
per cent of the disc's radius, so the disc is drawn at 80 per cent of
the side, which puts the tips at about 76 per cent: inside, with room.

The disc in the source is a cold near-black (3, 7, 8). Laid on the
site's own night paper (#120d10) it would show as a faint ring, so the
dark end of the image is remapped onto the paper colour first and the
disc disappears into the field. White stays white and the red barely
moves.

iOS fills transparent corners with black and rounds the square itself,
so the Apple icon is opaque and a little smaller than full bleed.
"""

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "media" / "brand" / "icon-512.png"

PAPER_NIGHT = (0x12, 0x0D, 0x10)  # --c-paper in the dark theme
DISC = (3, 7, 8)  # the near-black of the source disc


def remap(img: Image.Image) -> Image.Image:
    """Moves the disc's near-black onto the night paper, keeping white at white."""
    rgba = img.convert("RGBA")
    r, g, b, a = rgba.split()
    bands = []
    for band, lo, target in zip((r, g, b), DISC, PAPER_NIGHT):
        scale = (255 - target) / (255 - lo)
        bands.append(band.point(lambda v, lo=lo, t=target, s=scale: max(0, min(255, round(t + (v - lo) * s)))))
    return Image.merge("RGBA", (*bands, a))


def compose(face: Image.Image, side: int, disc_fraction: float) -> Image.Image:
    field = Image.new("RGBA", (side, side), PAPER_NIGHT + (255,))
    d = round(side * disc_fraction)
    disc = face.resize((d, d), Image.Resampling.LANCZOS)
    off = (side - d) // 2
    field.alpha_composite(disc, (off, off))
    return field.convert("RGB")


def save(img: Image.Image, path: Path) -> None:
    # Flat colour with soft edges: a 64-colour palette is visually
    # identical and a fraction of the size.
    img.quantize(colors=64, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE).save(
        path, optimize=True
    )
    print(f"{path.relative_to(ROOT)}  {img.size[0]}x{img.size[1]}  {path.stat().st_size} bytes")


def main() -> None:
    face = remap(Image.open(SRC))
    brand = ROOT / "public" / "media" / "brand"
    save(compose(face, 512, 0.80), brand / "icon-maskable-512.png")
    save(compose(face, 192, 0.80), brand / "icon-maskable-192.png")
    save(compose(face, 180, 0.88), ROOT / "src" / "app" / "apple-icon.png")


if __name__ == "__main__":
    main()
