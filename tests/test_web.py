"""Content HQ web app: brand consistency, skills wiring, local server and full browser E2E."""
import http.client
import json
import re
import shutil
import subprocess
import sys
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
import studio  # noqa: E402

APP = ROOT / "web" / "content-hq.html"
SKILLS = ["brand-brain", "content-researcher", "reel-scriptwriter", "carousel-designer", "ads-specialist", "results-analyst"]


def playwright_available():
    if not shutil.which("node") or not shutil.which("ffmpeg"):
        return False
    probe = subprocess.run(["node", "-e", "try{require('playwright')}catch(e){require('/opt/node22/lib/node_modules/playwright')}"],
                           capture_output=True, cwd=ROOT)
    return probe.returncode == 0


class WebAppTests(unittest.TestCase):
    def test_brand_values_match_single_source(self):
        profile = studio.read_json(ROOT / "brand" / "profile.json")
        html = APP.read_text(encoding="utf-8")
        for name, value in profile["colors"].items():
            self.assertRegex(html, rf'{name}:"{re.escape(value)}"', f"web app color {name} drifted from profile.json")
        for line in profile["product_lines"]:
            self.assertIn(f'"{line}"', html)
        for audience in profile["audience"]:
            self.assertIn(f'"{audience}"', html)
        self.assertIn('site:"balloonstoreco.com"', html)

    def test_page_contract_and_no_external_scripts(self):
        html = APP.read_text(encoding="utf-8")
        self.assertTrue(html.startswith("<title>Balloon Store Content HQ</title>"))
        self.assertNotRegex(html.lower(), r"<!doctype|<html|<body")
        self.assertNotRegex(html, r'<script[^>]+src=')  # no third-party code
        self.assertNotIn("alert(", html)
        self.assertNotIn("confirm(", html)
        self.assertNotRegex(html, r"\$\s?\d")  # no prices in templates

    def test_skills_are_portable_and_linked(self):
        for name in SKILLS + ["social-carousel"]:
            skill = ROOT / "skills" / name / "SKILL.md"
            text = skill.read_text(encoding="utf-8")
            self.assertTrue(text.startswith("---\nname: " + name + "\n"), name)
            self.assertRegex(text, r"\ndescription: .{40,}")
            for base in (".claude/skills", ".agents/skills"):
                link = ROOT / base / name
                self.assertTrue(link.is_symlink(), link)
                self.assertEqual((link / "SKILL.md").resolve(), skill.resolve())
        for name in SKILLS[1:]:
            self.assertIn("brand-brain", (ROOT / "skills" / name / "SKILL.md").read_text())
        for agent in (ROOT / ".claude" / "agents").glob("*.md"):
            body = agent.read_text()
            self.assertIn("brand/BRAND-BRAIN.md", body)
            self.assertRegex(body, r"skills/[a-z-]+/SKILL\.md")
            self.assertNotIn("Bash", body.split("---")[1])

    def test_local_server_serves_only_the_app(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), studio.web_handler())
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            port = server.server_port
            for path, code in (("/", 200), ("/index.html", 200), ("/../brand/profile.json", 404), ("/scripts/studio.py", 404)):
                conn = http.client.HTTPConnection("127.0.0.1", port, timeout=5)
                conn.request("GET", path)
                resp = conn.getresponse()
                body = resp.read()
                self.assertEqual(resp.status, code, path)
                if code == 200:
                    self.assertTrue(body.startswith(b"<!doctype html>"))
                    self.assertIn(b"Balloon Store Content HQ", body)
                conn.close()
        finally:
            server.shutdown()
            server.server_close()

    @unittest.skipUnless(playwright_available(), "node, playwright or ffmpeg not available")
    def test_browser_end_to_end_carousel_reel_persistence_and_downloads(self):
        server = ThreadingHTTPServer(("127.0.0.1", 0), studio.web_handler())
        threading.Thread(target=server.serve_forever, daemon=True).start()
        try:
            with tempfile.TemporaryDirectory() as tmp:
                fix, out = Path(tmp) / "fix", Path(tmp) / "out"
                fix.mkdir()
                ff = ["ffmpeg", "-loglevel", "error", "-y", "-f", "lavfi"]
                subprocess.run(ff + ["-i", "testsrc2=size=1080x1350:rate=1", "-frames:v", "1", str(fix / "photo.png")], check=True)
                subprocess.run(ff + ["-i", "color=c=0x54C1FA:size=600x200", "-frames:v", "1", str(fix / "logo.png")], check=True)
                subprocess.run(ff + ["-i", "testsrc2=size=720x1280:rate=30", "-f", "lavfi", "-i", "sine=frequency=440", "-t", "4",
                                     "-c:v", "libx264", "-pix_fmt", "yuv420p", "-c:a", "aac", "-shortest", str(fix / "clip.mp4")], check=True)
                url = f"http://127.0.0.1:{server.server_port}/"
                e2e = subprocess.run(["node", str(ROOT / "tests/e2e/web_e2e.mjs"), url, str(fix), str(out)],
                                     capture_output=True, text=True, timeout=420, cwd=ROOT)
                self.assertEqual(e2e.returncode, 0, e2e.stdout[-3000:] + e2e.stderr[-2000:])
                verify = subprocess.run([sys.executable, str(ROOT / "tests/e2e/verify_exports.py"), str(out)],
                                        capture_output=True, text=True, timeout=180)
                self.assertEqual(verify.returncode, 0, verify.stdout[-3000:] + verify.stderr[-2000:])
        finally:
            server.shutdown()
            server.server_close()


if __name__ == "__main__":
    unittest.main()
