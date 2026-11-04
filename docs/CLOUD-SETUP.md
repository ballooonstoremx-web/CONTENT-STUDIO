# Reusable Codex Cloud setup

Use the existing checkout at /workspace/CONTENT-STUDIO. Each cloud task is already
isolated; do not create a worktree unless requested. Do not reset, pull over local
changes, or switch a review branch automatically. The implementation is proposed
on setup/balloon-content-workflow; main stays unchanged until owner review.

Required: Linux, Python 3.12+, venv/pip, pinned Pillow. Optional: FFmpeg and ffprobe
for Reel delivery checks; gh for GitHub PR operations. No Node app, database or
paid provider is required for offline development. Core planning/export and
download service use the Python standard library. Pillow is for image workflows.
Both FFmpeg and ffprobe are required when validating final Reel media; otherwise
those tests explicitly skip. Review results in PR-1-REVIEW.md ran with both present.

```bash
cd /workspace/CONTENT-STUDIO
bash scripts/setup.sh
.venv/bin/python scripts/studio.py doctor
```

Setup is repeatable, keeps dependency declarations and lockfiles unchanged, and
does not generate content or mutate tracked source. Existing templates and skills
are part of the implementation PR, not files written by the installation script.
Network dependency destinations are pypi.org and files.pythonhosted.org; preserve
proxy and CA trust, leave TLS verification enabled. Existing package-manager
presets cover these hosts. No credential is needed for the public dependency.

Start `.venv/bin/python scripts/studio.py serve --port 8765` when downloads are
needed. Verify `/healthz` returns the expected service identity and an authenticated
archive request succeeds. A listening socket alone is not a readiness check.
Use the session's process manager and stop only a process started for this task.
No server process survives snapshot publication; restart per task. Do not create
user-facing loopback preview links. See WORKFLOW.md for external delivery limits.

Saved install/start instructions are draft configuration for future tasks, not a
publication or deployment. GitHub API access additionally requires api.github.com;
a saved allowlist addition does not prove live access. No optional provider secret
was added, and no paid service is required to run local tests.
