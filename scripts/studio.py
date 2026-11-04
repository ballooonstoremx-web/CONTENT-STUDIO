#!/usr/bin/env python3
"""Offline campaign planning, QA and private export. No publishing or AI API calls."""
import argparse
import hashlib
import html
import importlib.util
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import unquote, urlsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
KINDS = ("carousel", "image", "reel", "marketing")
SAFE_NAME = re.compile(r"[a-z0-9]+(?:-[a-z0-9]+)*\Z")
STAGES = ("draft", "final")
REVIEW_KEYS = ("copy", "visuals", "facts_and_rights", "brand", "accessibility")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path, data):
    path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")


def campaign_path(root, name):
    if not SAFE_NAME.fullmatch(name):
        raise ValueError("Campaign name must be lowercase words separated by hyphens.")
    base = root / "generated"
    path = base / name
    if base.is_symlink() or path.is_symlink():
        raise ValueError("Campaign directories cannot be symlinks.")
    if not path.resolve().is_relative_to(root.resolve()):
        raise ValueError("Campaign must stay inside the project.")
    return path


def init_campaign(root, name, kind, topic):
    path = campaign_path(root, name)
    path.mkdir(parents=True, exist_ok=False)
    for folder in ("raw", "finals", "review", "carousel"):
        (path / folder).mkdir()
    write_json(path / "campaign.json", {
        "name": name, "kind": kind, "topic": topic, "status": "draft",
        "created_at": datetime.now().astimezone().isoformat(),
        "generation": {"provider": None, "model": None, "job_ids": [], "cost_approved": False},
        "publishing_enabled": False,
    })
    write_json(path / "review" / "approval.json", {
        "checks": {key: False for key in REVIEW_KEYS},
        "reviewer": None, "approved_at": None,
        "scope": "export review only; never publication permission",
    })
    shutil.copyfile(root / "templates" / f"{kind}.md", path / "PLAN.md")
    shutil.copyfile(root / "templates" / "brief.md", path / "BRIEF.md")
    (path / "COPY.md").write_text(f"# {topic}\n\nDRAFT: write and review copy before rendering.\n")
    (path / "CAPTIONS.md").write_text("# Captions\n\nDRAFT: confirm exact handle and CTA before writing final captions.\n")
    (path / "PROVENANCE.md").write_text(
        "# Asset provenance\n\nFor each final: filename, source/reference rights, provider/model, "
        "job ID, generation date, edits, AI disclosure requirements and reviewer.\n"
        "Never include API keys, upload URLs or other credentials.\n")
    return path


def regular_files(path):
    """Reject links and special files rather than follow them into private files."""
    if path.is_symlink():
        raise ValueError(f"Symlink not allowed: {path.name}")
    for file in sorted(path.rglob("*")):
        if file.is_symlink():
            raise ValueError(f"Symlink not allowed: {file.name}")
        if not file.is_file() and not file.is_dir():
            raise ValueError(f"Special file not allowed: {file.name}")
        if file.is_file():
            yield file


def inspect_campaign(path, stage):
    if not path.is_dir():
        raise ValueError("Campaign not found. Run init first.")
    list(regular_files(path))
    data = read_json(path / "campaign.json")
    if data.get("kind") not in KINDS:
        raise ValueError("Unknown campaign kind.")
    if data.get("publishing_enabled") is not False:
        raise ValueError("This workflow requires publishing_enabled=false.")
    files = list(regular_files(path / "finals"))
    if stage == "draft":
        return {"stage": "draft", "approved": False, "files": len(files),
                "note": "Planning package only; does not certify media or publication readiness."}
    review = read_json(path / "review" / "approval.json")
    if not all(review.get("checks", {}).get(key) is True for key in REVIEW_KEYS):
        raise ValueError("Final export requires all five human review checks.")
    if not review.get("reviewer") or not review.get("approved_at"):
        raise ValueError("Final export requires reviewer and approved_at.")
    kind = data["kind"]
    if not files:
        raise ValueError("Final export needs files in finals/.")
    from PIL import Image
    if kind in ("carousel", "image"):
        expected_count = range(6, 9) if kind == "carousel" else range(1, 2)
        if len(files) not in expected_count:
            raise ValueError("Carousel needs 6–8 slides; an image campaign needs one image.")
        expected = [f"slide-{i:02d}.png" for i in range(1, len(files) + 1)]
        if kind == "carousel" and [f.name for f in files] != expected:
            raise ValueError("Carousel finals must be slide-01.png through slide-NN.png.")
        for file in files:
            if file.suffix.lower() not in (".png", ".jpg", ".jpeg"):
                raise ValueError("Image finals must be PNG or JPEG.")
            with Image.open(file) as image:
                image.load()
                if image.size != (1080, 1350):
                    raise ValueError(f"{file.name}: expected 1080x1350, got {image.size}.")
    elif kind == "reel":
        if len(files) != 1 or files[0].suffix.lower() != ".mp4":
            raise ValueError("Reel finals must contain exactly one MP4.")
        result = subprocess.run([
            "ffprobe", "-v", "error", "-show_streams", "-show_format", "-of", "json", str(files[0])
        ], check=True, capture_output=True, text=True)
        probe = json.loads(result.stdout)
        videos = [s for s in probe["streams"] if s["codec_type"] == "video"]
        if len(videos) != 1 or (videos[0]["width"], videos[0]["height"]) != (1080, 1920):
            raise ValueError("Reel must have one 1080x1920 video stream.")
        if videos[0]["codec_name"] != "h264" or videos[0].get("pix_fmt") != "yuv420p":
            raise ValueError("Reel needs H.264 yuv420p for delivery compatibility.")
        if not 0 < float(probe["format"]["duration"]) <= 180:
            raise ValueError("Project Reel delivery range is greater than 0 through 180 seconds.")
    else:
        if any(f.suffix.lower() not in (".md", ".txt") for f in files):
            raise ValueError("Marketing finals must be reviewed Markdown or text copy.")
        if any(not f.read_text(encoding="utf-8").strip() for f in files):
            raise ValueError("Marketing finals cannot be empty.")
    return {"stage": "final", "approved": True, "files": len(files),
            "note": "Technical validation and recorded human checks; not publication permission."}


def export_campaign(root, name, stage):
    path = campaign_path(root, name)
    report = inspect_campaign(path, stage)
    # Explicit allowlist: never export raw/reference images, profiles or arbitrary campaign files.
    names = ("campaign.json", "BRIEF.md", "PLAN.md", "COPY.md", "CAPTIONS.md", "PROVENANCE.md")
    selected = [path / name for name in names if (path / name).is_file()]
    selected += list(regular_files(path / "finals"))
    selected += [path / "review" / "approval.json"]
    selected += [path / relative for relative in (
        "review/contact-sheet.png", "review/zoom-url.png", "review/captions.srt",
        "carousel/ALT-TEXT.md") if (path / relative).is_file()]
    allowed_suffixes = {".json", ".md", ".txt", ".png", ".jpg", ".jpeg", ".mp4", ".srt"}
    for file in selected:
        relative = file.relative_to(path)
        if any(p.startswith(".") for p in relative.parts) or file.suffix.lower() not in allowed_suffixes:
            raise ValueError(f"File not allowed in exports: {relative}")
    output = root / "exports"
    if output.is_symlink():
        raise ValueError("exports/ cannot be a symlink.")
    output.mkdir(exist_ok=True)
    destination = output / f"{name}-{stage}.zip"
    if destination.is_symlink():
        raise ValueError("Archive cannot be a symlink.")
    manifest = {"campaign": name, **report, "files": [
        {"path": str(f.relative_to(path)), "sha256": hashlib.sha256(f.read_bytes()).hexdigest(),
         "bytes": f.stat().st_size} for f in selected
    ]}
    with tempfile.NamedTemporaryFile(dir=output, suffix=".tmp", delete=False) as temporary:
        temp_path = Path(temporary.name)
    try:
        with zipfile.ZipFile(temp_path, "w", zipfile.ZIP_DEFLATED) as archive:
            for file in selected:
                archive.write(file, str(file.relative_to(path)))
            archive.writestr("MANIFEST.json", json.dumps(manifest, indent=2) + "\n")
        temp_path.replace(destination)
    finally:
        temp_path.unlink(missing_ok=True)
    return destination


def finalize(root, name):
    path = campaign_path(root, name)
    if read_json(path / "campaign.json")["kind"] != "carousel":
        raise ValueError("The attached skill's finalizer is only for carousels.")
    list(regular_files(path))
    raws = [path / "raw" / "cover-raw.png"] + sorted(
        (path / "raw").glob("slide*-raw.png"),
        key=lambda p: [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", p.name)])
    if not 6 <= len(raws) <= 8 or not all(f.is_file() for f in raws):
        raise ValueError("Need cover-raw.png and 5–7 slideN-raw.png files in raw/.")
    if list((path / "finals").iterdir()):
        raise ValueError("finals/ is not empty; preserve or remove old finals explicitly first.")
    subprocess.run([sys.executable, str(root / "scripts" / "finalize_slides.py"),
                    "--dir", str(path / "raw"), "--files", *[f.name for f in raws]], check=True)
    for i in range(1, len(raws) + 1):
        shutil.move(path / "raw" / f"slide-{i:02d}.png", path / "finals" / f"slide-{i:02d}.png")
    for name in ("contact-sheet.png", "zoom-url.png"):
        shutil.move(path / "raw" / name, path / "review" / name)
    return path / "finals"


def doctor(root):
    catalog = read_json(root / "skills" / "catalog.json")
    checks = {}
    for skill in catalog["skills"]:
        checks[skill["name"] + "_checksum"] = (
            hashlib.sha256((root / skill["path"]).read_bytes()).hexdigest() == skill["sha256"])
    checks["pillow"] = importlib.util.find_spec("PIL") is not None
    checks["python_3_12_or_newer"] = sys.version_info >= (3, 12)
    print(json.dumps({"required_local_checks": checks,
        "optional_local_tools": {name: bool(shutil.which(name)) for name in ("ffmpeg", "ffprobe", "gh")},
        "credential_presence_only": {name: bool(os.environ.get(name)) for name in (
            "HIGGSFIELD_API_KEY", "BLOTATO_API_KEY", "GH_TOKEN")},
        "remote_integrations": "Unknown here. Discover actual session tools; names/presence do not verify access."
    }, indent=2))
    return all(checks.values())


def download_handler(root, token):
    exports = (root / "exports").resolve()

    class Handler(BaseHTTPRequestHandler):
        def log_message(self, *_):
            pass  # Never log tokens, URLs or filenames.

        def respond(self, status, content, content_type="text/plain; charset=utf-8", extra=None):
            self.send_response(status)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(content)))
            self.send_header("Cache-Control", "no-store")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.send_header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'")
            for key, value in (extra or {}).items():
                self.send_header(key, value)
            self.end_headers()
            self.wfile.write(content)

        def do_GET(self):
            url = urlsplit(self.path)
            if url.path == "/healthz" and not url.query:
                self.respond(200, b'{"status":"ok","service":"content-studio-exports"}', "application/json")
                return
            supplied = self.headers.get("Authorization", "").removeprefix("Bearer ")
            if not secrets.compare_digest(supplied, token):
                self.respond(401, b"Bearer token required.\n")
                return
            route = unquote(url.path)
            if route == "/":
                files = sorted(f.name for f in exports.glob("*.zip") if f.is_file() and not f.is_symlink())
                content = ("<!doctype html><title>Balloon Store exports</title><h1>Review downloads</h1>"
                           "<p>Drafts are not approved for publication. Download with the same Authorization header.</p><ul>"
                           + "".join(f"<li>{html.escape(name)}</li>" for name in files) + "</ul>")
                self.respond(200, content.encode(), "text/html; charset=utf-8")
                return
            name = route.removeprefix("/downloads/")
            if (url.query or not route.startswith("/downloads/") or "/" in name or "\\" in name
                    or not re.fullmatch(r"[a-z0-9-]+\.zip", name)):
                self.respond(404, b"Not found\n")
                return
            file = exports / name
            if file.is_symlink() or not file.is_file() or not file.resolve().is_relative_to(exports):
                self.respond(404, b"Not found\n")
                return
            self.respond(200, file.read_bytes(), "application/zip",
                         {"Content-Disposition": f'attachment; filename="{name}"'})

    return Handler


def serve(root, port):
    exports = root / "exports"
    runtime = root / ".runtime"
    if exports.is_symlink() or runtime.is_symlink():
        raise ValueError("Runtime and export directories cannot be symlinks.")
    exports.mkdir(exist_ok=True)
    runtime.mkdir(exist_ok=True, mode=0o700)
    token = secrets.token_urlsafe(32)
    token_file = runtime / "download-token"
    if token_file.is_symlink():
        raise ValueError("Token path cannot be a symlink.")
    token_file.unlink(missing_ok=True)
    with token_file.open("x", encoding="utf-8") as stream:
        os.chmod(token_file, 0o600)
        stream.write(token)
    with ThreadingHTTPServer(("127.0.0.1", port), download_handler(root, token)) as server:
        print(f"Export service listening on loopback port {server.server_port}; token in .runtime/download-token", flush=True)
        try:
            server.serve_forever()
        finally:
            token_file.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("doctor", help="Verify local tools and original skill checksum")
    init = commands.add_parser("init", help="Create a draft; does not generate or spend credits")
    init.add_argument("name")
    init.add_argument("--kind", choices=KINDS, required=True)
    init.add_argument("--topic", required=True)
    commands.add_parser("finalize", help="Fit-and-pad carousel raws using original skill appendix").add_argument("name")
    for command in ("check", "export"):
        sub = commands.add_parser(command)
        sub.add_argument("name")
        sub.add_argument("--stage", choices=STAGES, default="draft")
    commands.add_parser("serve", help="Run loopback-only authenticated download service").add_argument("--port", type=int, default=8765)
    args = parser.parse_args()
    try:
        if args.command == "doctor":
            return 0 if doctor(ROOT) else 1
        if args.command == "init":
            print(init_campaign(ROOT, args.name, args.kind, args.topic))
        elif args.command == "finalize":
            print(finalize(ROOT, args.name))
        elif args.command == "check":
            print(json.dumps(inspect_campaign(campaign_path(ROOT, args.name), args.stage), indent=2))
        elif args.command == "export":
            print(export_campaign(ROOT, args.name, args.stage))
        elif args.command == "serve":
            serve(ROOT, args.port)
    except (ValueError, OSError, KeyError, subprocess.CalledProcessError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
