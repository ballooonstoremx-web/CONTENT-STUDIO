"""Aprobación técnica de prueba, piezas incompletas y botón «Ver inspiración original» (navegador)."""
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


class AjustesTests(unittest.TestCase):
    @unittest.skipUnless(playwright_available(), "node, playwright or ffmpeg not available")
    def test_ajustes(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), studio.web_handler())
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with tempfile.TemporaryDirectory() as tmp:
                r = subprocess.run(["node", str(ROOT / "tests/e2e/ajustes_e2e.mjs"), f"http://127.0.0.1:{server.server_port}/", tmp],
                                   capture_output=True, text=True, timeout=180, cwd=ROOT)
                print(r.stdout)
                self.assertEqual(r.returncode, 0, r.stdout[-3000:] + r.stderr[-2000:])
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
