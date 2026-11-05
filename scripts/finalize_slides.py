#!/usr/bin/env python3
"""Fit-and-pad gpt_image_2 raws to 1080x1350 finals (+ optional 1080x1920 TikTok pads), contact sheet, URL zoom."""
import argparse, glob, os, re, sys
from PIL import Image

W, H = 1080, 1350
TW, TH = 1080, 1920

def corner_bg(im, patch=8):
    px = []
    for (x, y) in [(0, 0), (im.width - patch, 0), (0, im.height - patch), (im.width - patch, im.height - patch)]:
        px.extend(list(im.crop((x, y, x + patch, y + patch)).getdata()))
    return tuple(sum(p[k] for p in px) // len(px) for k in range(3))

def fit_pad(im, w, h, bg):
    nw = int(round(im.width * (h / im.height)))
    canvas = Image.new("RGB", (w, h), bg)
    if nw <= w:
        canvas.paste(im.resize((nw, h), Image.LANCZOS), ((w - nw) // 2, 0))
    else:
        nh = int(round(im.height * (w / im.width)))
        canvas.paste(im.resize((w, nh), Image.LANCZOS), (0, (h - nh) // 2))
    return canvas

def natural_key(s):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", s)]

def discover(d):
    files = ["cover-raw.png"] if os.path.exists(os.path.join(d, "cover-raw.png")) else []
    return files + sorted((os.path.basename(p) for p in glob.glob(os.path.join(d, "slide*-raw.png"))), key=natural_key)

ap = argparse.ArgumentParser()
ap.add_argument("--dir", default=".")
ap.add_argument("--files", nargs="*")
ap.add_argument("--tiktok", action="store_true")
a = ap.parse_args()
files = a.files or discover(a.dir)
if not files:
    sys.exit("no raws found: expected cover-raw.png + slide2-raw.png ... or pass --files")
finals = []
for i, f in enumerate(files, 1):
    im = Image.open(os.path.join(a.dir, f)).convert("RGB")
    bg = corner_bg(im)
    out = fit_pad(im, W, H, bg)
    out.save(os.path.join(a.dir, f"slide-{i:02d}.png"))
    finals.append(out)
    if a.tiktok:
        tk = Image.new("RGB", (TW, TH), bg)
        tk.paste(out, (0, (TH - H) // 2))
        tk.save(os.path.join(a.dir, f"tiktok-{i:02d}.png"))
    print(f"slide-{i:02d}.png <- {f} raw={im.size} bg={bg}")
cols, tw = 4, 360
th = int(tw * H / W)
sheet = Image.new("RGB", (cols * tw, ((len(finals) + cols - 1) // cols) * th), (40, 40, 40))
for i, im in enumerate(finals):
    sheet.paste(im.resize((tw, th), Image.LANCZOS), ((i % cols) * tw, (i // cols) * th))
sheet.save(os.path.join(a.dir, "contact-sheet.png"))
band = finals[-1].crop((0, int(H * 0.55), W, int(H * 0.97)))  # bottom band: the CTA card + URL
band.resize((band.width * 2, band.height * 2), Image.LANCZOS).save(os.path.join(a.dir, "zoom-url.png"))
print(f"{len(finals)} finals + contact-sheet.png + zoom-url.png written to {os.path.abspath(a.dir)}")
