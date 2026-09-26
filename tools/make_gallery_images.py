#!/usr/bin/env python3
"""Build the web gallery images (640x480 JPEG, no metadata) for the project page.

Usage:
    python3 tools/make_gallery_images.py --src <task_gallery_assets> [--out assets/gallery]

<task_gallery_assets> is the folder with the raw first frames used for the
paper's task gallery figure. It must contain two subfolders:
    sim/<simulator>__<task_id>.png   (40 files)
    real/<short_name>.jpg            (5 files)

Crops follow the paper figure: every frame is cut to 4:3 with the same zoom and
vertical offset per simulator, and the real-robot frames get the same light
auto-contrast and saturation boost. Output files are lowercase, have no spaces,
and carry no EXIF, ICC, XMP, or comment data. Requires Pillow only.
"""
import argparse
import os
import re
import sys

from PIL import Image, ImageEnhance, ImageOps

SIZE = (640, 480)
QUALITY = 83

# simulator -> (task ids in gallery order, crop keyword arguments)
SIM = {
    "robodojo": (
        ["align_blocks", "cover_blocks", "fill_pen_holder", "general_pickup", "insert_tubes",
         "match_and_pick_from_conveyor", "pour_liquid_into_cup", "stack_blocks_by_language",
         "stack_bowls", "swap_T"],
        dict(zoom=1.25, cy=0.25),
    ),
    "robotwin": (
        ["adjust_bottle", "blocks_ranking_rgb", "click_bell", "move_playingcard_away",
         "open_microwave", "place_a2b_left", "place_a2b_right", "place_fan", "press_stapler",
         "turn_switch"],
        dict(zoom=1.0),
    ),
    "robolab": (
        ["BananaInBowlTask", "BananaOnPlateTask", "BananasInBinOneMoreTask",
         "BananasInBinThreeTotalTask", "BigPumpkinInBinTask", "BowlInBinTask",
         "KeyboardOutOfBinTask", "PlasticBottlesInSquarePailTask", "RubiksCubeRightOfBowlTask",
         "TakeMeasuringSpoonOutTask"],
        dict(zoom=1.0),
    ),
    "libero": (
        ["libero_10-task01", "libero_90-task28", "libero_90-task57", "libero_90-task60",
         "libero_goal-task00", "libero_object-task01", "libero_object-task04",
         "libero_object-task05", "libero_spatial-task02", "libero_spatial-task04"],
        dict(zoom=1.0, cy=0.6),
    ),
}

# short source name -> descriptive task id used on the page
REAL = [
    ("stack", "stack_cylinder_on_cube"),
    ("doll", "doll_to_plate"),
    ("cylinder_plate", "cylinder_to_plate"),
    ("wipe", "wipe_with_towel"),
    ("drawer", "open_drawer_place_part"),
]
REAL_CROP = dict(zoom=1.12, cy=0.55, enhance=True)


def web_name(sim, task_id):
    """Lowercase, underscore-only file stem, e.g. robolab + BowlInBinTask -> robolab_bowl_in_bin_task."""
    snake = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "_", task_id).lower().replace("-", "_")
    if snake.startswith(sim + "_"):
        return snake
    return f"{sim}_{snake}"


def crop_4x3(im, zoom=1.0, cx=0.5, cy=0.5, enhance=False):
    im = im.convert("RGB")
    w, h = im.size
    cw = min(w, h * 4 / 3) / zoom
    ch = cw * 0.75
    x, y = (w - cw) * cx, (h - ch) * cy
    im = im.crop((round(x), round(y), round(x + cw), round(y + ch))).resize(SIZE, Image.LANCZOS)
    if enhance:
        im = ImageOps.autocontrast(im, cutoff=0.5)
        im = ImageEnhance.Color(im).enhance(1.12)
    return im


def save_clean(im, path):
    # Rebuild from raw pixels so no info dict (EXIF, ICC, XMP, comments) can carry over.
    clean = Image.frombytes("RGB", im.size, im.tobytes())
    clean.save(path, "JPEG", quality=QUALITY, optimize=True, progressive=True)


def jpeg_segments(raw):
    """Yield (marker, payload) for every header segment before the first scan."""
    i = 2  # skip SOI
    while i + 4 <= len(raw) and raw[i] == 0xFF:
        marker = raw[i + 1]
        length = int.from_bytes(raw[i + 2:i + 4], "big")
        yield marker, raw[i + 4:i + 2 + length]
        if marker == 0xDA:  # start of scan: entropy-coded data follows
            return
        i += 2 + length


def check_clean(path):
    """Allow only JFIF APP0, tables, frame and scan headers; reject EXIF/XMP/ICC/comments."""
    raw = open(path, "rb").read()
    allowed = {0xC0, 0xC2, 0xC4, 0xDB, 0xDD, 0xDA}
    for marker, payload in jpeg_segments(raw):
        if marker == 0xE0 and payload.startswith(b"JFIF\x00"):
            continue
        if marker not in allowed:
            raise SystemExit(f"unexpected JPEG segment 0x{marker:02X} in {path}")
    with Image.open(path) as im:
        if len(im.getexif()) or set(im.info) - {"jfif", "jfif_version", "jfif_unit", "jfif_density", "progressive", "progression"}:
            raise SystemExit(f"metadata found in {path}: {sorted(im.info)}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--src", required=True, help="folder with sim/ and real/ raw first frames")
    ap.add_argument("--out", default=os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "gallery"),
                    help="output folder (default: ../assets/gallery next to this script)")
    args = ap.parse_args()
    os.makedirs(args.out, exist_ok=True)

    jobs = []
    for sim, (ids, kw) in SIM.items():
        for tid in ids:
            jobs.append((os.path.join(args.src, "sim", f"{sim}__{tid}.png"), web_name(sim, tid), kw))
    for short, tid in REAL:
        jobs.append((os.path.join(args.src, "real", f"{short}.jpg"), web_name("real", tid), REAL_CROP))

    missing = [src for src, _, _ in jobs if not os.path.isfile(src)]
    if missing:
        sys.exit("missing source files:\n  " + "\n  ".join(missing))

    total = 0
    for src, stem, kw in jobs:
        out = os.path.join(args.out, stem + ".jpg")
        with Image.open(src) as im:
            save_clean(crop_4x3(im, **kw), out)
        check_clean(out)
        size = os.path.getsize(out)
        total += size
        print(f"{stem + '.jpg':48s} {size / 1024:6.1f} KB")
    print(f"{len(jobs)} images, {total / 1024 / 1024:.2f} MB total")


if __name__ == "__main__":
    main()
