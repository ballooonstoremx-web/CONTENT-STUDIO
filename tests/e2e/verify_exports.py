"""Validate ZIPs downloaded by web_e2e.mjs: structure, PNG sizes, SRT, playable video."""
import json, shutil, subprocess, sys, zipfile, io
from pathlib import Path
from PIL import Image

out = Path(sys.argv[1])
files = json.loads((out / "results.json").read_text())["files"]
checks = []
def ok(name, cond, detail=""):
    checks.append((name, bool(cond), detail)); print("PASS" if cond else "FAIL", name, detail)

for mode, f in files.items():
    with zipfile.ZipFile(f["zipC"]) as z:
        ok(f"[{mode}] carousel zip integrity", z.testzip() is None)
        slides = sorted(n for n in z.namelist() if n.startswith("slides/"))
        ok(f"[{mode}] carousel has 4 slides", len(slides) == 4, ",".join(slides))
        sizes = {Image.open(io.BytesIO(z.read(n))).size for n in slides}
        ok(f"[{mode}] slides are 1080x1350 PNG", sizes == {(1080, 1350)}, str(sizes))
        ok(f"[{mode}] carousel copy + ficha", {"copy.txt", "ficha.json", "LEEME.txt"} <= set(z.namelist()))
        ok(f"[{mode}] ficha references real photo", json.loads(z.read("ficha.json"))["slides"][2]["photo"] == "photo.png")
    with zipfile.ZipFile(f["zipR"]) as z:
        names = set(z.namelist())
        ok(f"[{mode}] reel zip integrity", z.testzip() is None)
        need = {"instrucciones-capcut.md", "subtitulos.srt", "textos-en-pantalla.txt", "guion.txt", "copy-instagram.txt", "portada-1080x1920.png", "LEEME.txt"}
        ok(f"[{mode}] reel package files", need <= names, str(sorted(names)))
        clips = sorted(n for n in names if n.startswith("clips/"))
        ok(f"[{mode}] reel includes 2 real clips in order", len(clips) == 2 and clips[0].startswith("clips/01_") and clips[1].startswith("clips/02_"), str(clips))
        ok(f"[{mode}] cover is 1080x1920", Image.open(io.BytesIO(z.read("portada-1080x1920.png"))).size == (1080, 1920))
        srt = z.read("subtitulos.srt").decode()
        ok(f"[{mode}] srt timing valid", "00:00:00,000 --> 00:00:02,500" in srt and "arco" in srt, srt[:120])
        guide = z.read("instrucciones-capcut.md").decode()
        ok(f"[{mode}] capcut guide has timeline + 9:16", "9:16" in guide and "| 1 | clips/01_" in guide)
        mp4 = next(n for n in clips if n.endswith(".mp4"))
        tmp = out / f"{mode}-extracted.mp4"; tmp.write_bytes(z.read(mp4))
        if shutil.which("ffprobe"):
            r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "stream=codec_name,width,height", "-of", "json", str(tmp)], capture_output=True, text=True)
            st = json.loads(r.stdout or "{}").get("streams", [])
            ok(f"[{mode}] exported clip decodes (ffprobe)", r.returncode == 0 and any(s.get("codec_name") == "h264" and s.get("height") == 1280 for s in st), r.stdout[:120])
            d = subprocess.run(["ffmpeg", "-v", "error", "-i", str(tmp), "-f", "null", "-"], capture_output=True, text=True)
            ok(f"[{mode}] exported clip full decode", d.returncode == 0 and not d.stderr.strip(), d.stderr[:120])
    with zipfile.ZipFile(f["bkz"]) as z:
        ok(f"[{mode}] backup zip has data + 3 media", "respaldo.json" in z.namelist() and len([n for n in z.namelist() if n.startswith("media/")]) == 3 and z.testzip() is None)
failed = [c for c in checks if not c[1]]
print(f"{len(checks)-len(failed)}/{len(checks)} export checks passed")
sys.exit(1 if failed else 0)
