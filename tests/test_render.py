"""Render en la nube: un proyecto exportado por el Editor de Reel produce un MP4 real con FFmpeg."""
import json
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import render_reel  # noqa: E402


@unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "ffmpeg not available")
class RenderReelTests(unittest.TestCase):
    def test_project_to_mp4(self):
        with tempfile.TemporaryDirectory() as tmp:
            t = Path(tmp)
            ff = ["ffmpeg", "-v", "error", "-y", "-f", "lavfi"]
            subprocess.run(ff + ["-i", "testsrc2=size=720x1280:rate=30", "-f", "lavfi", "-i", "sine=frequency=440", "-t", "4",
                                 "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(t / "clip.mp4")], check=True)
            subprocess.run(ff + ["-i", "testsrc2=size=1920x1080:rate=30", "-t", "3", "-c:v", "libx264", "-pix_fmt", "yuv420p", str(t / "mudo.mp4")], check=True)
            subprocess.run(ff + ["-i", "color=c=0xEA4566:size=1080x1350", "-frames:v", "1", str(t / "foto.jpg")], check=True)
            project = {"format": "balloon-store-reel/1", "width": 1080, "height": 1920, "fps": 30, "hook": "Así se ve terminada",
                       "captions": {"size": 60, "color": "#FFFFFF", "bg": "#122D50", "pos": "abajo"},
                       "shots": [{"n": 1, "file": "x.mp4", "media": "clip.mp4", "in": 1.0, "dur": 2.0, "text": "Toma 1: el resultado"},
                                 {"n": 2, "file": "mudo.mp4", "in": 0, "dur": 1.5, "text": "Sin audio: se agrega silencio"},
                                 {"n": 3, "file": "foto.jpg", "in": 0, "dur": 1.0, "text": "Foto real del producto"}]}
            probe = render_reel.render(project, t, t / "out.mp4", render_reel.FONTS[0] if Path(render_reel.FONTS[0]).is_file() else render_reel.FONTS[1])
            streams = {s["codec_name"]: s for s in probe["streams"]}
            self.assertEqual((streams["h264"]["width"], streams["h264"]["height"]), (1080, 1920))
            self.assertIn("aac", streams)
            self.assertAlmostEqual(float(probe["format"]["duration"]), 4.5, delta=0.25)

    def test_rejects_missing_media_and_unknown_format(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                render_reel.render({"format": "otro"}, Path(tmp), Path(tmp) / "o.mp4", "x.ttf")
            with self.assertRaises(FileNotFoundError):
                render_reel.render({"format": "balloon-store-reel/1", "shots": [{"n": 1, "file": "no.mp4"}]}, Path(tmp), Path(tmp) / "o.mp4", "x.ttf")


if __name__ == "__main__":
    unittest.main()
