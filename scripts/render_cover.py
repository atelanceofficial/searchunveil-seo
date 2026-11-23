"""Render the approved SearchUnveil animation for the GitHub READMEs.

From the repository root:
    python scripts/render_cover.py --source assets/searchunveil-approved-wordmark.gif --output-dir assets

Requires Python 3, NumPy, SciPy, Pillow and the Inkscape CLI. An optional
--mask-dir receives the fixed grayscale glyph mattes for pixel-level QA.
"""

import argparse
import subprocess
import tempfile
from dataclasses import dataclass
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

SIGNATURE = Path(__file__).resolve().parents[1] / "assets" / "atelance-signature.svg"

FRAME_COUNT = 48
LOOP_MS = 3200
LANCZOS = Image.Resampling.LANCZOS
BICUBIC = Image.Resampling.BICUBIC


@dataclass(frozen=True)
class Layout:
    name: str
    canvas: tuple
    lettering_width: int
    lettering_xy: tuple
    signature_width: int
    signature_xy: tuple


LAYOUTS = [
    Layout("desktop", (1240, 368), 1110, (64, 151), 188, (64, 82)),
    Layout("mobile", (680, 340), 622, (28, 159), 207, (28, 86)),
]


def resize_float(values, size):
    image = Image.fromarray(values.astype("float32"))
    return np.asarray(image.resize(size, BICUBIC))


def extract_original(path):
    with Image.open(path) as image:
        raw = []
        for frame in range(image.n_frames):
            image.seek(frame)
            raw.append(np.asarray(image.convert("RGB")))

    colors = np.stack(raw).astype("float32")
    # A line changes brightness, but its gold color stays warmer than the
    # blue-black field. Several frames together recover even the darkest grooves.
    signal = np.max(colors[..., 0] - 0.4 * colors[..., 2], axis=0)
    silhouette = ndimage.binary_closing(ndimage.gaussian_filter(signal, 0.42) > 38)
    labels, _ = ndimage.label(silhouette)
    areas = np.bincount(labels.ravel())
    silhouette &= areas[labels] >= 45
    holes = ndimage.binary_fill_holes(silhouette) & ~silhouette
    labels, _ = ndimage.label(holes)
    areas = np.bincount(labels.ravel())
    silhouette |= holes & (areas[labels] <= 31)
    y, x = np.nonzero(silhouette)
    # Preserve the enclosed spaces in the e and a and the dot over the i.
    crop = (slice(y.min() - 2, y.max() + 3), slice(x.min() - 2, x.max() + 3))
    shape = silhouette[crop]
    edge = ndimage.gaussian_filter(shape.astype("float32"), 1.0)
    red = colors[:, crop[0], crop[1], 0]
    # Extend the gold of the letters across the resampling fringe. The final
    # high-resolution matte, not the darkness of a groove, defines the boundary.
    core = ndimage.binary_erosion(shape)
    nearest = ndimage.distance_transform_edt(
        ~core, return_distances=False, return_indices=True
    )
    red = np.where(core[None], red, red[:, nearest[0], nearest[1]])
    texture = np.clip((red - 23) / 208, 0, 1).astype("float32")
    texture += 0.24 * (texture - ndimage.gaussian_filter(texture, (0, 0.73, 0.73)))
    return edge, np.clip(texture, 0, 1)


def sample_phase(source, phase):
    """Periodic cubic interpolation of the original 16 engraved frames."""
    clock = phase * len(source)
    index = int(clock)
    t = clock - index
    a, b, c, d = (source[(index + k) % len(source)] for k in (-1, 0, 1, 2))
    return np.clip(
        b
        + 0.5
        * t
        * ((c - a) + t * ((2 * a - 5 * b + 4 * c - d) + t * (3 * (b - c) + d - a))),
        0,
        1,
    )


def background(layout):
    w, h = layout.canvas
    y, x = np.mgrid[0:h, 0:w].astype("float32")
    x /= w
    y /= h
    light = np.exp(-(((x - 0.35) / 0.64) ** 2 + ((y - 0.25) / 0.79) ** 2))
    field = np.stack((9 + 8 * light, 12 + 7 * light, 15 + 6 * light), axis=2).astype(
        "uint8"
    )
    return Image.fromarray(field)


def signature(width):
    # The small existing signature is embedded as outlines so no installed font
    # can change its proportions. The light stripes remain still in every frame.
    with tempfile.TemporaryDirectory() as raw:
        folder = Path(raw)
        svg = SIGNATURE
        png = folder / "signature.png"
        subprocess.run(
            ["inkscape", str(svg), "--export-width", str(width * 3), "-o", str(png)],
            check=True,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.PIPE,
        )
        with Image.open(png) as rendered:
            rgba = rendered.convert("RGBA")
            return rgba.resize((width, round(rgba.height / 3)), LANCZOS)


def gold_colors(t):
    locations = [0, 0.19, 0.46, 0.70, 0.87, 1]
    colors = [
        [90, 62, 33],
        [137, 96, 52],
        [199, 153, 89],
        [233, 193, 130],
        [253, 226, 177],
        [255, 243, 213],
    ]
    return np.stack(
        [
            np.interp(t, locations, [col[channel] for col in colors])
            for channel in range(3)
        ],
        axis=2,
    )


def make_layers(layout, low_matte):
    w = layout.lettering_width
    h = round(w * low_matte.shape[0] / low_matte.shape[1])
    matte = resize_float(low_matte, (w, h))
    # The soft transition in source pixels is reconstructed at the output
    # resolution. This produces a stable antialiased boundary at both sizes.
    alpha = np.clip((matte - 0.5) * w / low_matte.shape[1] * 2.2 + 0.5, 0, 1)
    inset = ndimage.distance_transform_edt(alpha >= 0.5)
    return (w, h), alpha, np.clip(1 - inset / 2.3, 0, 1)


def frame_patch(texture, phase, dim, alpha, rim, underlay):
    texture_map = resize_float(sample_phase(texture, phase), dim)
    y, x = np.mgrid[0 : dim[1], 0 : dim[0]]
    body = np.clip(
        texture_map + 0.035 * np.cos(6.28 * (0.65 * x / dim[0] + 0.40 * y / dim[1])),
        0,
        1,
    )
    # A stationary satin edge keeps the glyphs legible between the moving lines.
    body = body * (1 - 0.44 * rim) + 0.51 * 0.44 * rim
    ink = gold_colors(body)
    return Image.fromarray(
        np.rint(underlay * (1 - alpha[..., None]) + ink * alpha[..., None]).astype(
            "uint8"
        )
    )


def render(layout, original, out_dir, mask_dir):
    matte, texture = original
    dim, alpha, rim = make_layers(layout, matte)
    bg = background(layout)
    brand = signature(layout.signature_width)
    bg.paste(brand, layout.signature_xy, brand)
    ox, oy = layout.lettering_xy
    rect = (ox, oy, ox + dim[0], oy + dim[1])
    underlay = np.asarray(bg.crop(rect), dtype="float32")
    if mask_dir:
        mask = Image.new("L", layout.canvas)
        mask.paste(
            Image.fromarray(np.rint(alpha * 255).astype("uint8")), layout.lettering_xy
        )
        mask.save(mask_dir / (layout.name + "-mask.png"))
    patches = [
        frame_patch(texture, i / FRAME_COUNT, dim, alpha, rim, underlay)
        for i in range(FRAME_COUNT)
    ]
    sampler = Image.new("RGB", (dim[0], dim[1] * 6 + 64))
    for index in range(6):
        sampler.paste(patches[index * FRAME_COUNT // 6], (0, index * dim[1]))
    sampler.paste(bg.resize((dim[0], 64), LANCZOS), (0, dim[1] * 6))
    # Reserve neutral tones for the static signature and the dark field.
    palette = sampler.quantize(
        colors=176, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE
    )
    entries = palette.getpalette()[: 176 * 3]
    for level in np.linspace(8, 250, 32).astype(int):
        entries.extend([int(level)] * 3)
    for tone in range(24):
        entries.extend(
            [
                9 + round(8 * tone / 23),
                12 + round(7 * tone / 23),
                15 + round(6 * tone / 23),
            ]
        )
    # Pad with an existing shade; an unused default color can alter dark edges.
    entries.extend(entries[-3:] * ((768 - len(entries)) // 3))
    palette.putpalette(entries)
    base = bg.quantize(palette=palette, dither=Image.Dither.NONE)
    frames = []
    for patch in patches:
        image = base.copy()
        image.paste(patch.quantize(palette=palette, dither=Image.Dither.NONE), (ox, oy))
        frames.append(image)
    suffix = "-mobile" if layout.name == "mobile" else ""
    stem = "searchunveil-cover" + suffix
    # All frames share the same palette, including the stand-alone still.
    frames[0].save(out_dir / (stem + "-still.png"), optimize=True)
    frames[0].save(
        out_dir / (stem + ".png"),
        save_all=True,
        append_images=frames[1:],
        duration=np.diff(np.rint(np.linspace(0, LOOP_MS, FRAME_COUNT + 1)))
        .astype(int)
        .tolist(),
        loop=0,
        disposal=0,
        blend=0,
        optimize=True,
    )
    print(stem, (out_dir / (stem + ".png")).stat().st_size, "bytes", flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--source", type=Path, default=Path("assets/searchunveil-approved-wordmark.gif")
    )
    parser.add_argument("--output-dir", type=Path, default=Path("assets"))
    parser.add_argument("--mask-dir", type=Path)
    parser.add_argument(
        "--layout", choices=["desktop", "mobile", "both"], default="both"
    )
    args = parser.parse_args()
    args.output_dir.mkdir(exist_ok=True, parents=True)
    if args.mask_dir:
        args.mask_dir.mkdir(exist_ok=True, parents=True)
    original = extract_original(args.source)
    for layout in LAYOUTS:
        if args.layout in (layout.name, "both"):
            render(layout, original, args.output_dir, args.mask_dir)


if __name__ == "__main__":
    main()
