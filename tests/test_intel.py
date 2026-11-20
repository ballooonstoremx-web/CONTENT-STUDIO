"""Fase 1 · Centro de inteligencia: estructura de la app y recorrido completo en navegador con datos sintéticos."""
import json
import subprocess
import sys
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
sys.path.insert(0, str(ROOT / "tests"))
import studio  # noqa: E402
from test_web import playwright_available  # noqa: E402

APP = (ROOT / "web" / "content-hq.html").read_text(encoding="utf-8")


def synthetic_seed():
    """17 piezas ficticias con la forma normalizada de Metricool (no son datos reales de la cuenta)."""
    caps = ["¿Quieres aprender a hacer una garland? Tutorial paso a paso", "Comenta CATÁLOGO y te lo enviamos", "Llegaron nuevos modelos",
            "Que te parece esta decoración??? Crédito: @otra.cuenta", "Si eres decoradora, mira esto", "No todos los globos son iguales: calidad",
            "Decoración de Halloween con Orbz", "POV: armas un arco en 10 minutos", "¿Cómo inflar Orbz? tips", "Promoción por tiempo limitado: precio especial",
            "Unboxing de cajas nuevas", "Idea para baby shower"]
    reels = []
    for i, c in enumerate(caps):
        reach = 200 + i * 37 + (3000 if "Crédito" in c else 0)
        reels.append({"id": f"https://www.instagram.com/reel/R{i}/", "date": f"2026-10-{(i % 27) + 1:02d}T{(9 + i * 3) % 24:02d}:15", "caption": c, "img": "",
                      "url": f"https://www.instagram.com/reel/R{i}/", "comments": i % 2, "interactions": 5 + i, "likes": 3 + i, "reach": reach, "saves": i % 4,
                      "shares": i % 3, "views": reach * 1.4, "avgWatch": 5.0, "viewRate": 30 + i * 2, "skipRate": 70 - i * 2, "kind": "reel"})
    posts = []
    for i in range(5):
        posts.append({"id": f"https://www.instagram.com/p/P{i}/", "date": f"2026-09-{i + 10:02d}T20:00", "caption": ["Tips para cuidar tus globos", "Nuevos colores", "Comenta HALLOWEEN", "Mes rosa", "Hola, somos Balloon Store"][i],
                      "img": "", "url": f"https://www.instagram.com/p/P{i}/", "ptype": "FEED_CAROUSEL_ALBUM" if i % 2 else "FEED_IMAGE", "comments": 0,
                      "interactions": i + 1, "likes": 1, "reach": 120 + i * 20, "saves": i, "shares": 0, "views": 300, "follows": 0, "kind": "post"})
    snap = {"id": "ig-prueba", "network": "instagram", "account": "cuenta_prueba", "brand": "Prueba", "source": "Datos sintéticos de prueba",
            "fetchedAt": "2026-11-01T12:00:00.000Z", "from": "2025-11-01", "to": "2026-11-01", "reels": reels, "posts": posts, "daily": [], "links": None}
    return {"app": "balloon-store-content-hq", "version": 1, "items": [], "metrics": [snap], "competitors": [], "inspo": [], "learnings": []}


class IntelStructureTests(unittest.TestCase):
    def test_views_and_collections_exist(self):
        for v in ["intel", "semanal", "analisis", "diagnostico", "competencia", "inspiracion", "insp", "banco", "calendario", "ficha", "disenar"]:
            self.assertIn(f"VIEWS.{v}=", APP, v)
        for c in ["competitors", "inspo", "ideabank", "metrics", "learnings", "plans", "settings", "reports"]:
            self.assertIn(f'"{c}"', APP.split("const COLS=")[1].split(";")[0], c)
        self.assertIn('indexedDB.open("bs-content-hq",5)', APP)

    def test_legacy_inspiration_states_are_mapped_not_rewritten(self):
        for old, new in [("guardar", "guardada"), ("investigar", "por_analizar"), ("producir", "en_produccion"), ("descartar", "descartada")]:
            self.assertIn(f"{old}:\"{new}\"", APP)

    def test_no_simulated_schedule(self):
        self.assertIn("Esta página no puede ejecutarse sola en segundo plano", APP)
        self.assertNotIn("setInterval(runResearch", APP)

    def test_metricool_is_read_only(self):
        tools = set(__import__("re").findall(r'mcCall\("([A-Za-z]+)"', APP))
        self.assertEqual(tools, {"getBrandSettings", "getAnalyticsDataByMetrics"})
        for forbidden in ["createScheduledPost", "updateScheduledPost", "sendScheduledPostForReview"]:
            self.assertNotIn(forbidden, APP)

    def test_no_automatic_bulk_generation(self):
        self.assertIn("Claude solo usa las fuentes que marques", APP)
        self.assertIn('status:"nueva"', APP)


class IntelBrowserTests(unittest.TestCase):
    @unittest.skipUnless(playwright_available(), "node, playwright or ffmpeg not available")
    def test_browser_phase1_flow(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), studio.web_handler())
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with tempfile.TemporaryDirectory() as tmp:
                fix, out = Path(tmp) / "fix", Path(tmp) / "out"
                fix.mkdir()
                (fix / "seed.json").write_text(json.dumps(synthetic_seed(), ensure_ascii=False), encoding="utf-8")
                (fix / "catalog.json").write_bytes((ROOT / "catalog" / "import" / "catalogo-balloon-store.json").read_bytes())
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=1080x1350:rate=1", "-frames:v", "1", str(fix / "photo.png")], check=True)
                subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi", "-i", "testsrc2=size=720x1280:rate=30", "-f", "lavfi", "-i", "sine=frequency=440",
                                "-t", "3", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(fix / "clip.mp4")], check=True)
                url = f"http://127.0.0.1:{server.server_port}/"
                r = subprocess.run(["node", str(ROOT / "tests/e2e/intel_e2e.mjs"), url, str(fix), str(out)], capture_output=True, text=True, timeout=420, cwd=ROOT)
                self.assertEqual(r.returncode, 0, r.stdout[-4000:] + r.stderr[-2000:])
                vid = next(p for p in out.iterdir() if p.suffix in (".mp4", ".webm"))
                probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration:stream=codec_type,width,height", "-of", "json", str(vid)],
                                                  capture_output=True, text=True, check=True).stdout)
                v = next(s for s in probe["streams"] if s["codec_type"] == "video")
                self.assertEqual((v["width"], v["height"]), (1080, 1920), vid.name)
                print("exportado en navegador:", vid.name, probe.get("format", {}).get("duration"), [s["codec_type"] for s in probe["streams"]])
                import zipfile
                with zipfile.ZipFile(out / "diseno.zip") as z:
                    names = z.namelist()
                    self.assertEqual(names, ["01_1080x1350.jpg", "02_1080x1350.jpg", "03_1080x1350.jpg"])
                    self.assertTrue(all(z.read(n)[:3] == b"\xff\xd8\xff" for n in names))
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
