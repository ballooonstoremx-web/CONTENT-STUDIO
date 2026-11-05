"""Functional and security regressions found during the PR #1 review."""
import hashlib
import http.client
import json
import os
from pathlib import Path
import shutil
import subprocess
import threading
import unittest
import zipfile
from http.server import ThreadingHTTPServer
import test_studio as baseline
from PIL import Image

studio = baseline.studio


class ReviewRegressionTests(unittest.TestCase):
    setUp = baseline.StudioTests.setUp
    tearDown = baseline.StudioTests.tearDown
    campaign = baseline.StudioTests.campaign
    approve = baseline.StudioTests.approve

    def marketing(self):
        path = self.campaign("marketing")
        (path / "finals" / "copy.md").write_text("Reviewed test fixture, not live marketing.")
        self.approve(path)
        return path

    def test_changed_copy_media_and_added_files_invalidate_review(self):
        path = self.marketing()
        self.assertTrue(studio.inspect_campaign(path, "final")["approved"])
        for file in (path / "COPY.md", path / "finals" / "copy.md", path / "review" / "captions.srt"):
            with self.subTest(file=file.name):
                file.write_text("New content after approval")
                with self.assertRaisesRegex(ValueError, "Content changed"):
                    studio.export_campaign(self.root, path.name, "final")
                self.approve(path)

    def test_prepare_review_resets_checks_and_reviewer(self):
        path = self.marketing()
        studio.prepare_review(self.root, path.name)
        review = studio.read_json(path / "review" / "approval.json")
        self.assertFalse(any(review["checks"].values()))
        self.assertIsNone(review["reviewer"])
        self.assertIsNone(review["approved_at"])
        with self.assertRaisesRegex(ValueError, "human review"):
            studio.inspect_campaign(path, "final")

    def test_review_timestamp_and_shape_are_validated(self):
        path = self.marketing()
        original = studio.read_json(path / "review" / "approval.json")
        for change in ({"checks": []}, {"reviewer": "  "}, {"approved_at": "yesterday"},
                       {"approved_at": "2026-11-04T12:00:00"}, {"content_sha256": None}):
            studio.write_json(path / "review" / "approval.json", {**original, **change})
            with self.assertRaises(ValueError):
                studio.inspect_campaign(path, "final")

    def test_missing_files_and_invalid_stages_rejected(self):
        path = self.campaign()
        with self.assertRaisesRegex(ValueError, "stage"):
            studio.inspect_campaign(path, "invalid")
        (path / "COPY.md").unlink()
        with self.assertRaisesRegex(ValueError, "required planning"):
            studio.export_campaign(self.root, path.name, "draft")

    def test_draft_does_not_export_credential_json_as_media(self):
        path = self.campaign("image")
        (path / "finals" / "credentials.json").write_text('{"test":"fixture"}')
        with self.assertRaisesRegex(ValueError, "not allowed"):
            studio.export_campaign(self.root, path.name, "draft")

    def test_hardlinked_private_files_rejected(self):
        path = self.campaign("image")
        os.link(path / "COPY.md", path / "finals" / "secret.png")
        with self.assertRaisesRegex(ValueError, "Hard links"):
            studio.export_campaign(self.root, path.name, "draft")

    def test_failed_finalize_preserves_raws_and_existing_previews(self):
        path = self.campaign()
        for i in range(1, 7):
            name = "cover-raw.png" if i == 1 else f"slide{i}-raw.png"
            Image.new("RGB", (688, 1024), "blue").save(path / "raw" / name)
        (path / "raw" / "slide6-raw.png").write_bytes(b"corrupt fixture")
        (path / "review" / "contact-sheet.png").write_bytes(b"previous review fixture")
        before = {f.name: f.read_bytes() for f in (path / "raw").iterdir()}
        with self.assertRaises(subprocess.CalledProcessError):
            studio.finalize(self.root, path.name)
        self.assertEqual(before, {f.name: f.read_bytes() for f in (path / "raw").iterdir()})
        self.assertEqual((path / "review" / "contact-sheet.png").read_bytes(), b"previous review fixture")
        self.assertEqual(list((path / "finals").iterdir()), [])

    def test_missing_raw_slide_numbers_rejected(self):
        path = self.campaign()
        for name in ("cover-raw.png", "slide2-raw.png", "slide3-raw.png", "slide4-raw.png", "slide5-raw.png", "slide9-raw.png"):
            Image.new("RGB", (10, 10)).save(path / "raw" / name)
        with self.assertRaisesRegex(ValueError, "consecutive numbering"):
            studio.finalize(self.root, path.name)

    def test_non_image_disguised_as_png_rejected(self):
        path = self.campaign("image")
        Image.new("RGB", (1080, 1350)).save(path / "finals" / "photo.png", format="GIF")
        self.approve(path)
        with self.assertRaisesRegex(ValueError, "PNG or JPEG"):
            studio.inspect_campaign(path, "final")

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "Optional FFmpeg tools absent")
    def test_truncated_reel_with_valid_metadata_is_rejected(self):
        path = self.campaign("reel")
        video = path / "finals" / "reel.mp4"
        subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i",
                        "color=c=blue:s=1080x1920:d=1:r=2", "-c:v", "libx264", "-threads", "1",
                        "-pix_fmt", "yuv420p", "-movflags", "+faststart", str(video)], check=True)
        video.write_bytes(video.read_bytes()[:-64])
        # Container metadata alone survives; actual media decoding must fail.
        result = subprocess.run(["ffprobe", "-v", "error", "-show_format", "-of", "json", str(video)],
                                capture_output=True, text=True, check=True)
        self.assertIn("duration", json.loads(result.stdout)["format"])
        self.approve(path)
        with self.assertRaises(subprocess.CalledProcessError):
            studio.inspect_campaign(path, "final")

    def test_busy_port_does_not_overwrite_existing_token(self):
        runtime = self.root / ".runtime"
        runtime.mkdir()
        token = runtime / "download-token"
        token.write_text("existing-fixture-token")
        with ThreadingHTTPServer(("127.0.0.1", 0), studio.download_handler(self.root, "fixture")) as occupied:
            with self.assertRaises(OSError):
                with studio.export_server(self.root, occupied.server_port):
                    self.fail("Busy port should not start")
        self.assertEqual(token.read_text(), "existing-fixture-token")

    def test_server_token_permissions_lock_and_cleanup(self):
        with studio.export_server(self.root, 0):
            token_file = self.root / ".runtime" / "download-token"
            before = token_file.read_bytes()
            self.assertEqual(token_file.stat().st_mode & 0o777, 0o600)
            self.assertEqual(token_file.parent.stat().st_mode & 0o777, 0o700)
            with self.assertRaisesRegex(ValueError, "already owns"):
                with studio.export_server(self.root, 0):
                    self.fail("Second server should not replace token")
            self.assertEqual(token_file.read_bytes(), before)
        self.assertFalse(token_file.exists())

    def test_malformed_json_does_not_echo_input_or_traceback(self):
        path = self.campaign()
        (path / "campaign.json").write_text('["sensitive-fixture-only"]')
        with self.assertRaisesRegex(ValueError, "JSON object"):
            studio.inspect_campaign(path, "draft")
        # Use a script copy whose ROOT is the temporary project.
        path_to_script = self.root / "scripts" / "studio.py"
        import sys
        result = subprocess.run([sys.executable, str(path_to_script), "check", path.name],
                                capture_output=True, text=True)
        self.assertEqual(result.returncode, 1)
        self.assertNotIn("sensitive-fixture-only", result.stderr)
        self.assertNotIn("Traceback", result.stderr)

    @unittest.skipUnless(shutil.which("ffmpeg") and shutil.which("ffprobe"), "Optional FFmpeg tools absent")
    def test_all_four_workflows_export_and_download_final_assets(self):
        for kind in studio.KINDS:
            path = self.campaign(kind, kind)
            if kind == "carousel":
                for i in range(1, 7):
                    name = "cover-raw.png" if i == 1 else f"slide{i}-raw.png"
                    Image.new("RGB", (688, 1024), "#54C1FA").save(path / "raw" / name)
                studio.finalize(self.root, path.name)
            elif kind == "image":
                Image.new("RGB", (1080, 1350), "#EA4566").save(path / "finals" / "image.png")
            elif kind == "reel":
                subprocess.run(["ffmpeg", "-v", "error", "-f", "lavfi", "-i",
                                "color=c=0xEA4566:s=1080x1920:d=1:r=2", "-c:v", "libx264",
                                "-threads", "1", "-pix_fmt", "yuv420p", str(path / "finals" / "reel.mp4")], check=True)
            else:
                (path / "finals" / "copy.md").write_text("Test copy; not approved real brand content.")
            self.approve(path)
            for stage in studio.STAGES:
                archive = studio.export_campaign(self.root, path.name, stage)
                with zipfile.ZipFile(archive) as bundle:
                    self.assertIsNone(bundle.testzip())
                    manifest = json.loads(bundle.read("MANIFEST.json"))
                    self.assertEqual(manifest["approved"], stage == "final")
                    for file in manifest["files"]:
                        self.assertEqual(hashlib.sha256(bundle.read(file["path"])).hexdigest(), file["sha256"])
        with studio.export_server(self.root, 0) as server:
            thread = threading.Thread(target=server.serve_forever, daemon=True)
            thread.start()
            token = (self.root / ".runtime" / "download-token").read_text()
            connection = http.client.HTTPConnection("127.0.0.1", server.server_port)
            try:
                for archive in sorted((self.root / "exports").glob("*.zip")):
                    connection.request("GET", "/downloads/" + archive.name, headers={"Authorization": "Bearer " + token})
                    response = connection.getresponse()
                    self.assertEqual(response.status, 200)
                    self.assertEqual(response.read(), archive.read_bytes())
                for header in (token, "Bearer caf\xe9", "Basic " + token):
                    connection.request("GET", "/", headers={"Authorization": header})
                    response = connection.getresponse()
                    self.assertEqual(response.status, 401)
                    response.read()
                (self.root / "exports" / "secret.zip").symlink_to(self.root / "templates" / "brief.md")
                os.link(self.root / "templates" / "brief.md", self.root / "exports" / "hardlink.zip")
                for route in ("/downloads/secret.zip", "/downloads/hardlink.zip", "/?token=ignored"):
                    connection.request("GET", route, headers={"Authorization": "Bearer " + token})
                    response = connection.getresponse()
                    self.assertEqual(response.status, 404)
                    response.read()
            finally:
                connection.close()
                server.shutdown()
                thread.join()


if __name__ == "__main__":
    unittest.main()
