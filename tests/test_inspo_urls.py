"""Inspiración: normalización de enlaces y detección de duplicados (cnvx, igsh, utm y otros parámetros de seguimiento)."""
import shutil
import subprocess
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
APP = ROOT / "web" / "content-hq.html"


class InspoUrlTests(unittest.TestCase):
    @unittest.skipUnless(shutil.which("node"), "node no disponible")
    def test_url_keys_and_duplicates(self):
        r = subprocess.run(["node", str(ROOT / "tests/e2e/url_norm.mjs"), str(APP)], capture_output=True, text=True, timeout=60)
        print(r.stdout)
        self.assertEqual(r.returncode, 0, r.stdout + r.stderr)
        self.assertIn("todas las pruebas de enlaces pasaron", r.stdout)

    def test_original_and_normalized_url_are_stored(self):
        src = APP.read_text(encoding="utf-8")
        self.assertIn('urlOriginal:p.url?String(p.url).trim():""', src)
        self.assertIn('urlNorm:p.url?inspoKey(p.url):""', src)
        self.assertIn('"cnvx"', src.split("const URL_TRACK=")[1].split(";")[0])

    def test_merged_cards_link_each_other(self):
        src = APP.read_text(encoding="utf-8")
        self.assertIn("Fusionada en:", src)
        self.assertIn("Incluye la ficha fusionada:", src)
        self.assertIn('$$("[data-go-insp]",main)', src)


if __name__ == "__main__":
    unittest.main()
