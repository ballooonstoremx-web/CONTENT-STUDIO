# Balloon Store production workflow

## Intake and source of truth

Use brand/profile.json for confirmed name, website and palette. Language and voice
are proposed defaults; handle, audience and CTA remain missing. Collect these
with the attached skill's interview when a carousel is requested, or the campaign
brief for other formats. Store private inputs under inputs/, keep original logos,
fonts and licensed product references under brand/, and never overwrite originals.
No external website content was scraped or used to invent brand claims.

Initialize a campaign from the repository root:

```bash
.venv/bin/python scripts/studio.py init event-checklist --kind carousel --topic "Checklist para tu celebración"
.venv/bin/python scripts/studio.py init balloon-scene --kind image --topic "Escena realista de globos"
.venv/bin/python scripts/studio.py init event-reel --kind reel --topic "Antes y después de la decoración"
.venv/bin/python scripts/studio.py init event-copy --kind marketing --topic "Guía para planear una celebración"
```

These commands create plans and draft files, not generated media. Each campaign
has BRIEF.md, PLAN.md, COPY.md, CAPTIONS.md, PROVENANCE.md, raw/, finals/, review/
and carousel/. Only offline planning is independent of provider connections.

## Production and review

Follow the campaign's PLAN.md and the correct template. Carousels use the attached
social-carousel skill only within its supported scope. Single images, Reels and
marketing copy have separate project-authored templates. Confirm provider choice
and generation cost before spending; missing tools are blockers to generation,
not reasons to report invented results.

Keep every original under raw/. Put only delivery assets in finals/. For carousel
inputs named cover-raw.png and slide2-raw.png through slideN-raw.png:

```bash
.venv/bin/python scripts/studio.py finalize event-checklist
```

This runs the original skill's Appendix A without changing it. It produces
1080×1350 padded finals and places a contact sheet and CTA zoom in review/.
Never apply the graphic-carousel style to realistic image briefs by default.

Human review checks copy, visuals, facts and rights, brand, and accessibility.
First run `studio.py prepare-review NAME` to snapshot the current exportable
content and reset all review checks. Only the actual reviewer then fills
review/approval.json with all checks true, their name and an ISO approval timestamp
including timezone. Preserve the generated content_sha256 field. Any change to
copy, media or included review files invalidates the review; run prepare-review
and review again. Existing approvals without a snapshot also require re-review.
This is a record, not authentication or a cryptographic signature. A user with
write access can edit it. The tool cannot judge typography, truth, licenses,
realism or subtitle quality. The export manifest hashes the exact packaged bytes
and rejects changes detected while packaging.

```bash
.venv/bin/python scripts/studio.py check event-checklist --stage draft
.venv/bin/python scripts/studio.py export event-checklist --stage draft
# After actual human review and completed media:
.venv/bin/python scripts/studio.py prepare-review event-checklist
# Human reviews and fills review/approval.json, retaining its content_sha256.
.venv/bin/python scripts/studio.py check event-checklist --stage final
.venv/bin/python scripts/studio.py export event-checklist --stage final
```

Draft exports remain labeled unapproved even when they include media. Final
checks enforce file counts, dimensions, decode images, validate Reel format with
ffprobe and decode its media with FFmpeg, and require current recorded review.
Both FFmpeg and ffprobe are required for final Reel checks. This is technical validation, not platform
acceptance testing. There is no publish, schedule, purchase or deploy command.

## Downloads and retention

Export writes exports/NAME-draft.zip or NAME-final.zip with copy, brief, plan,
provenance, review record, delivery media and a SHA-256 manifest. It excludes raw
images, references, local profiles, runtime files and arbitrary campaign files.
Review included text for private information; an allowlist cannot detect a
credential pasted into approved copy. Exporting again replaces that same stage's
ZIP; preserve a separately named local copy if an immutable revision is needed.
Media folders accept only format-specific delivery types, including in draft
exports. Symlinks and hard links are rejected. This does not detect secrets or
personal information pasted into an otherwise permitted text or media file.

Use the platform's workspace file-download feature when offered. This session has
no artifact-upload or external port-forwarding tool, so no public download link
is claimed. A private development download service is available:

```bash
.venv/bin/python scripts/studio.py serve --port 8765
```

It binds only to loopback, rotates a token at each start, writes it mode 0600 to
.runtime/download-token and serves only ZIPs from exports/. The health endpoint
returns the service identity. All archive requests require a Bearer token; query
tokens, directory traversal, hidden files and symlinks are not served. Do not
expose the process directly to the Internet. A platform-authenticated tunnel is
required for access from a user's machine, if the platform supports one.
One service per project's runtime directory is enforced by a local lock. A failed
start leaves any existing token intact. ZIPs stream to the client instead of
loading an entire video archive in memory. The server remains a private, single
trusted-user development tool, not a hardened multiuser hosting service.

From an authorized environment or tunnel, use an HTTP client with Authorization
header `Bearer <local download-token>` and request `/downloads/NAME-draft.zip`.
Save the response as a file. Do not paste the token in chat, URLs or shell history.
For local verification without printing it, Python can read the token file and
set the header (see tests/test_studio.py). No external hosting or deployment is
needed for archive creation. External delivery remains pending where the platform
does not expose workspace downloads or authenticated tunneling.

Generated files are ignored by Git and cloud snapshots are not backups. Download
and retain approved work before deleting an environment. Do not commit private
client media just to get a download URL.

When present, contact sheets, CTA zooms, per-slide alt text and subtitle files are
also included from their documented review/ and carousel/ locations.

## Publication is a separate action

Even if a skill profile says auto, the project requires explicit user approval of
the exact media, captions, platform account and timing before posting or scheduling.
Reconnect and verify Blotato if that route is chosen. Validate any disclosure
requirements, verify result URLs from real tool responses and append them to
inputs/publication-log.md only after confirmed publication. Never claim a draft
or export was posted. No publication log entries are created by setup.
