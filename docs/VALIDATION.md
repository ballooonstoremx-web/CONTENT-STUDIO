# Current-instance validation

2026-11-04, implementation branch setup/balloon-content-workflow.

`bash scripts/setup.sh` completed twice. Python 3.12.14 and Pillow 13.0.0 are
installed in .venv. All 11 unittest cases passed with no skipped tests:

- All four draft campaign formats initialize; existing campaigns are not overwritten.
- Uploaded skill SHA-256 matches and Appendix A is extracted verbatim.
- Missing human review and missing media prevent final exports.
- Seven actual 688×1024 fixture images finalize to 1080×1350, retain the corner
  color padding, produce contact sheet and URL zoom, and pass final archive checks.
- Incorrect image dimensions and corrupt images are rejected.
- Reviewed marketing text validates.
- Draft ZIPs exclude raw files, local profiles and unrelated hidden files.
- Symlinks, disallowed delivery extensions and traversal paths are rejected.
- HTTP archive route requires authentication and rejects traversal and symlinks.
- FFmpeg encodes a one-second 1080×1920 H.264 yuv420p fixture and ffprobe validates it.

The fixtures are temporary technical test media, not generated AI creative or
approved brand content. The original finalizer emits a Pillow deprecation warning
for getdata; it still passes on pinned Pillow 13.0.0. It was preserved unchanged.

A separate running CLI check created generated/onboarding-demo, exported a draft
ZIP, started the local download service, received the expected health identity,
and downloaded the exact ZIP bytes via authenticated HTTP 200. MANIFEST.json
records approved=false. This demo contains planning files and zero final assets.

Not verified: Higgsfield jobs, Blotato account access or posting, Canva/CapCut
integration, AI realism or typography, approved brand copy, externally reachable
download URL, deployment, publication, or fresh-task snapshot restoration. Git
fetch works; GitHub API initially returned proxy HTTP 403, separately tracked in
INTEGRATIONS.md. Saved draft settings do not prove runtime policy changed.
