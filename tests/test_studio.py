import hashlib
import http.client
import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import threading
import unittest
import zipfile
from http.server import ThreadingHTTPServer
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("studio", ROOT / "scripts" / "studio.py")
studio = importlib.util.module_from_spec(spec)
spec.loader.exec_module(studio)


class StudioTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        shutil.copytree(ROOT / "templates", self.root / "templates")
        shutil.copytree(ROOT / "scripts", self.root / "scripts", ignore=shutil.ignore_patterns("__pycache__"))

    def tearDown(self):
        self.temp.cleanup()

    def campaign(self, kind="carousel", name="test-campaign"):
        return studio.init_campaign(self.root, name, kind, "Globos de prueba")

    def approve(self, path):
        studio.write_json(path / "review" / "approval.json", {
            "checks": {key: True for key in studio.REVIEW_KEYS},
            "reviewer": "Test fixture only", "approved_at": "2026-11-04T12:00:00-06:00"
        })

    def test_all_four_campaign_types_and_no_overwrite(self):
        for kind in studio.KINDS:
            path = self.campaign(kind, kind)
            self.assertFalse(studio.read_json(path / "campaign.json")["publishing_enabled"])
            self.assertIn("DRAFT", (path / "COPY.md").read_text())
            self.assertTrue((path / "PLAN.md").is_file())
        with self.assertRaises(FileExistsError):
            self.campaign("carousel", "carousel")

    def test_original_skill_checksum_and_appendix(self):
        item = studio.read_json(ROOT / "skills" / "catalog.json")["skills"][0]
        data = (ROOT / item["path"]).read_bytes()
        self.assertEqual(hashlib.sha256(data).hexdigest(), item["sha256"])
        appendix = data.decode().split("```python\n", 1)[1].split("\n```", 1)[0] + "\n"
        self.assertEqual((ROOT / "scripts" / "finalize_slides.py").read_text(), appendix)

    def test_final_rejects_unreviewed_and_missing_media(self):
        path = self.campaign()
        with self.assertRaisesRegex(ValueError, "human review"):
            studio.inspect_campaign(path, "final")
        self.approve(path)
        with self.assertRaisesRegex(ValueError, "needs files"):
            studio.inspect_campaign(path, "final")

    def test_real_carousel_padding_dimensions_and_export(self):
        path = self.campaign()
        for i in range(1, 8):
            name = "cover-raw.png" if i == 1 else f"slide{i}-raw.png"
            image = Image.new("RGB", (688, 1024), "#54C1FA")
            # A marker in the original center must survive padding without cropping.
            image.putpixel((344, 512), (234, 69, 102))
            image.save(path / "raw" / name)
        studio.finalize(self.root, "test-campaign")
        finals = sorted((path / "finals").glob("*.png"))
        self.assertEqual(len(finals), 7)
        for file in finals:
            with Image.open(file) as image:
                self.assertEqual(image.size, (1080, 1350))
                self.assertEqual(image.getpixel((0, 0)), (84, 193, 250))
        self.assertTrue((path / "review" / "contact-sheet.png").is_file())
        self.assertTrue((path / "review" / "zoom-url.png").is_file())
        self.approve(path)
        archive = studio.export_campaign(self.root, "test-campaign", "final")
        with zipfile.ZipFile(archive) as bundle:
            self.assertIsNone(bundle.testzip())
            manifest = json.loads(bundle.read("MANIFEST.json"))
            self.assertTrue(manifest["approved"])
            for file in manifest["files"]:
                self.assertEqual(hashlib.sha256(bundle.read(file["path"])).hexdigest(), file["sha256"])
        with self.assertRaisesRegex(ValueError, "not empty"):
            studio.finalize(self.root, "test-campaign")

    def test_invalid_image_dimensions_and_corruption_fail(self):
        path = self.campaign("image")
        self.approve(path)
        file = path / "finals" / "photo.png"
        Image.new("RGB", (100, 100)).save(file)
        with self.assertRaisesRegex(ValueError, "1080x1350"):
            studio.inspect_campaign(path, "final")
        file.write_bytes(b"not an image")
        with self.assertRaises(OSError):
            studio.inspect_campaign(path, "final")

    def test_marketing_final(self):
        path = self.campaign("marketing")
        self.approve(path)
        (path / "finals" / "email.md").write_text("Copy fixture for technical tests only.")
        self.assertTrue(studio.inspect_campaign(path, "final")["approved"])

    def test_draft_export_excludes_private_and_raw_files(self):
        path = self.campaign()
        (path / ".env").write_text("fixture, not a real credential")
        (path / "raw" / "private.txt").write_text("private fixture")
        (path / "carousel" / "profile.json").write_text("{}")
        archive = studio.export_campaign(self.root, "test-campaign", "draft")
        with zipfile.ZipFile(archive) as bundle:
            self.assertNotIn(".env", bundle.namelist())
            self.assertFalse(any(name.startswith("raw/") or name.startswith("carousel/") for name in bundle.namelist()))
            self.assertFalse(json.loads(bundle.read("MANIFEST.json"))["approved"])

    def test_export_rejects_symlinks_and_disallowed_extensions(self):
        path = self.campaign()
        (path / "finals" / "private.png").symlink_to(path / "COPY.md")
        with self.assertRaisesRegex(ValueError, "Symlink"):
            studio.export_campaign(self.root, "test-campaign", "draft")
        (path / "finals" / "private.png").unlink()
        (path / "finals" / "credentials.env").write_text("fixture")
        with self.assertRaisesRegex(ValueError, "not allowed"):
            studio.export_campaign(self.root, "test-campaign", "draft")

    def test_path_traversal_and_symlink_roots_fail(self):
        for name in ("../private", "", "/tmp/private", "a/b", "A B"):
            with self.assertRaises(ValueError):
                studio.campaign_path(self.root, name)
        (self.root / "generated").symlink_to(self.root / "templates", target_is_directory=True)
        with self.assertRaises(ValueError):
            self.campaign()

    def test_http_download_authentication_and_path_boundaries(self):
        self.campaign()
        archive = studio.export_campaign(self.root, "test-campaign", "draft")
        (self.root / "exports" / "secret.zip").symlink_to(self.root / "templates" / "brief.md")
        token = "test-session-token"
        server = ThreadingHTTPServer(("127.0.0.1", 0), studio.download_handler(self.root, token))
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        connection = http.client.HTTPConnection("127.0.0.1", server.server_port)
        try:
            def request(route, authenticated=False):
                headers = {"Authorization": f"Bearer {token}"} if authenticated else {}
                connection.request("GET", route, headers=headers)
                response = connection.getresponse()
                body = response.read()
                return response, body
            response, body = request("/healthz")
            self.assertEqual(json.loads(body)["service"], "content-studio-exports")
            self.assertEqual(request("/downloads/test-campaign-draft.zip")[0].status, 401)
            response, body = request("/downloads/test-campaign-draft.zip", True)
            self.assertEqual(response.status, 200)
            self.assertEqual(response.getheader("Content-Type"), "application/zip")
            self.assertIn("attachment", response.getheader("Content-Disposition"))
            self.assertEqual(body, archive.read_bytes())
            for route in ("/downloads/%2e%2e/brief.md", "/downloads/secret.zip", "/downloads/.env", "/downloads/test-campaign-draft.zip?token=bad"):
                self.assertEqual(request(route, True)[0].status, 404)
        finally:
            connection.close()
            server.shutdown()
            server.server_close()
            thread.join()

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "Optional FFmpeg tools absent")
    def test_real_reel_encode_and_validation(self):
        path = self.campaign("reel")
        self.approve(path)
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i",
                        "color=c=0x54C1FA:s=1080x1920:d=1:r=1", "-c:v", "libx264",
                        "-threads", "1", "-pix_fmt", "yuv420p", str(path / "finals" / "reel.mp4")], check=True)
        self.assertTrue(studio.inspect_campaign(path, "final")["approved"])


if __name__ == "__main__":
    unittest.main()
