#!/usr/bin/env python3
"""Render a Content HQ Reel project to a real MP4 with FFmpeg (free, runs in the cloud session).

Input: the JSON exported from Content HQ › Editor de Reel › «Proyecto para render en la nube»
(format "balloon-store-reel/1") plus a folder with the owner's real clips and photos.
Each shot is matched by `file`, then by `media` (original file name).

Usage: python3 scripts/render_reel.py proyecto.json carpeta_medios salida.mp4 [--font ruta.ttf]
"""
import argparse
import textwrap
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

FONTS = ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
         "/System/Library/Fonts/Supplemental/Arial Bold.ttf", "C:/Windows/Fonts/arialbd.ttf"]
IMG = {".jpg", ".jpeg", ".png", ".webp"}


def find_media(folder: Path, shot: dict) -> Path:
    for name in (shot.get("file"), shot.get("media")):
        if name and (folder / name).is_file():
            return folder / name
    raise FileNotFoundError(f"Toma {shot.get('n')}: no encuentro {shot.get('file')} ni {shot.get('media')} en {folder}")


def trim_white(src: Path, tmp: Path) -> Path:
    """Crop the wide white margins of official packshots (same idea as trimWhite in the web app)."""
    try:
        from PIL import Image, ImageChops
    except ImportError:
        return src
    im = Image.open(src).convert("RGB")
    bbox = ImageChops.difference(im, Image.new("RGB", im.size, (255, 255, 255))).point(lambda v: 255 if v > 15 else 0).getbbox()
    if not bbox:
        return src
    pad = int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.04)
    box = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
    if (box[2] - box[0]) * (box[3] - box[1]) > 0.8 * im.width * im.height:
        return src
    out = tmp / f"trim_{src.stem}.png"
    im.crop(box).save(out)
    return out


def wrap_text(text: str, size: int, width: int) -> str:
    """drawtext does not wrap: break lines so the text fits ~85 % of the frame."""
    per_line = max(8, int(width * 0.85 / (size * 0.56)))
    return "\n".join(textwrap.fill(par, per_line) for par in text.splitlines() if par.strip())


ALIGN = None


def align_opt() -> str:
    global ALIGN
    if ALIGN is None:
        h = subprocess.run(["ffmpeg", "-hide_banner", "-h", "filter=drawtext"], capture_output=True, text=True).stdout
        ALIGN = ":text_align=C" if "text_align" in h else ""
    return ALIGN


def esc_path(p: Path) -> str:
    return str(p).replace("\\", "/").replace(":", r"\:").replace("'", r"\'")


def has_audio(path: Path) -> bool:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=index", "-of", "csv=p=0", str(path)],
                         capture_output=True, text=True)
    return bool(out.stdout.strip())


def render(project: dict, media: Path, out: Path, font: str) -> dict:
    if project.get("format") != "balloon-store-reel/1":
        raise ValueError("Formato de proyecto desconocido")
    w, h, fps = int(project.get("width", 1080)), int(project.get("height", 1920)), int(project.get("fps", 30))
    cap = project.get("captions") or {}
    size, color, bg = int(cap.get("size", 64)), cap.get("color", "#FFFFFF"), cap.get("bg") or ""
    ypos = {"arriba": "h*0.14", "centro": "(h-text_h)/2"}.get(cap.get("pos"), "h-h*0.22-text_h")
    shots = project.get("shots") or []
    if not shots:
        raise ValueError("El proyecto no tiene tomas")
    tmp = Path(tempfile.mkdtemp(prefix="reel-"))
    try:
        args, filters, n = ["ffmpeg", "-v", "error", "-y"], [], 0
        for i, s in enumerate(shots):
            src = find_media(media, s)
            dur = max(0.3, float(s.get("dur", 2.5)))
            if src.suffix.lower() in IMG:
                args += ["-loop", "1", "-t", f"{dur:.3f}", "-i", str(trim_white(src, tmp))]
                audio = None
            else:
                args += ["-ss", f"{float(s.get('in', 0)):.3f}", "-t", f"{dur:.3f}", "-i", str(src)]
                audio = n if has_audio(src) else None
            vin = n
            n += 1
            if audio is None:
                args += ["-f", "lavfi", "-t", f"{dur:.3f}", "-i", "anullsrc=r=48000:cl=stereo"]
                audio = n
                n += 1
            if src.suffix.lower() in IMG:  # product photos: whole product on the brand beige, never cropped
                chain = (f"[{vin}:v]scale={int(w*0.88)}:{int(h*0.6)}:force_original_aspect_ratio=decrease,"
                         f"pad={w}:{h}:(ow-iw)/2:(oh-ih)/2-{int(h*0.05)}:color=0xF7F2E9,setsar=1,fps={fps},format=yuv420p")
            else:
                chain = f"[{vin}:v]scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},setsar=1,fps={fps},format=yuv420p"
            text = (s.get("text") or "").strip()
            if text:
                tf = tmp / f"sub{i}.txt"
                tf.write_text(wrap_text(text, size, w), encoding="utf-8")
                box = f":box=1:boxcolor={bg}@0.9:boxborderw=28" if bg else ":borderw=4:bordercolor=black@0.6"
                chain += f",drawtext=fontfile='{esc_path(Path(font))}':textfile='{esc_path(tf)}':fontsize={size}:fontcolor={color}:x=(w-text_w)/2:y={ypos}{box}{align_opt()}"
            filters.append(chain + f",trim=duration={dur:.3f},setpts=PTS-STARTPTS[v{i}]")
            filters.append(f"[{audio}:a]aresample=48000,aformat=channel_layouts=stereo,atrim=duration={dur:.3f},asetpts=PTS-STARTPTS[a{i}]")
        concat = "".join(f"[v{i}][a{i}]" for i in range(len(shots))) + f"concat=n={len(shots)}:v=1:a=1[vc][ac]"
        filters.append(concat)
        last = "[vc]"
        hook = (project.get("hook") or "").strip()
        if hook:
            hf = tmp / "hook.txt"
            hf.write_text(wrap_text(hook, 76, w), encoding="utf-8")
            filters.append(f"[vc]drawtext=fontfile='{esc_path(Path(font))}':textfile='{esc_path(hf)}':fontsize=76:fontcolor=white:borderw=5:bordercolor=black@0.5:x=(w-text_w)/2:y=h*0.13{align_opt()}:enable='lt(t,2.5)'[vh]")
            last = "[vh]"
        script = tmp / "filter.txt"
        script.write_text(";\n".join(filters), encoding="utf-8")
        args += ["-filter_complex_script", str(script), "-map", last, "-map", "[ac]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                 "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", str(out)]
        subprocess.run(args, check=True)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_name,width,height",
                                       "-of", "json", str(out)], capture_output=True, text=True, check=True).stdout)
    return probe


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("project")
    ap.add_argument("media")
    ap.add_argument("out")
    ap.add_argument("--font", default=next((f for f in FONTS if Path(f).is_file()), ""))
    a = ap.parse_args(argv)
    if not shutil.which("ffmpeg"):
        print("FFmpeg no está instalado en este entorno.", file=sys.stderr)
        return 2
    if not a.font:
        print("No encontré una fuente TTF; usa --font.", file=sys.stderr)
        return 2
    probe = render(json.loads(Path(a.project).read_text(encoding="utf-8")), Path(a.media), Path(a.out), a.font)
    print(json.dumps(probe, ensure_ascii=False))
    return 0


if __name__ == "__main__":
    sys.exit(main())
