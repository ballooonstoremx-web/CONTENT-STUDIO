# CONTENT-STUDIO

AI Content Creation Studio for Balloon Store.

## Objectives
- Create Instagram and Facebook carousels.
- Generate realistic AI marketing images.
- Create Reels and promotional videos.
- Integrate Higgsfield when available.
- Organize and export social media content.

## Brand
Balloon Store
Website: https://balloonstoreco.com

## Brand Colors
Blue: #54C1FA
Pink: #EA4566

## Tools
- Codex Cloud
- GitHub
- Higgsfield (integration pending)
- Canva
- CapCut

## Development workflow

This repository prepares reviewable Balloon Store content. It does not publish,
deploy, purchase services, or schedule posts. The owner reviews the implementation
PR and approves content separately. Only name, website and palette above are
confirmed brand facts; handle, audience, CTA and product claims require input.

```bash
bash scripts/setup.sh
.venv/bin/python scripts/studio.py doctor
.venv/bin/python scripts/studio.py init event-checklist --kind carousel --topic "Checklist para tu celebración"
.venv/bin/python scripts/studio.py export event-checklist --stage draft
```

Supported campaign plans: `carousel`, `image`, `reel`, `marketing`. Initialization
writes editable drafts, not AI-generated images or video. Paid generation requires
a connected provider, approved references, model selection and cost approval.

| Folder | Contents |
|---|---|
| inputs/ | Private briefs, reference material, future publication log |
| brand/ | Confirmed profile, licensed logos, fonts and product photos |
| skills/ | Original uploaded skill, checksum and scope analysis |
| templates/ | Brief and format-specific production plans |
| generated/ | Ignored campaign drafts, raws, finals and review records |
| exports/ | Ignored downloadable ZIPs with checksummed manifests |
| scripts/ | Repeatable setup, campaign CLI, original skill finalizer |
| tests/ | Image, video, export and authenticated-download checks |
| docs/ | Workflow, cloud setup, integration evidence and limitations |

Read [the workflow](docs/WORKFLOW.md), [skill analysis](skills/README.md),
[integration status](docs/INTEGRATIONS.md), and [cloud setup](docs/CLOUD-SETUP.md).

Higgsfield, Blotato, Canva and CapCut are not connected in the inspected session.
An OpenAI image tool is available in Codex but is not silently used instead of the
carousel skill's Higgsfield model. Offline planning, local media validation and
ZIP export work independently of those integrations.

Run `.venv/bin/python scripts/studio.py serve --port 8765` for a local authenticated
download service. It is not a deployment or externally reachable hosting service.
Workspace file download or a platform-authenticated tunnel is required for delivery
to a user's device; this session provides neither an artifact upload nor a tunnel
tool. See the workflow for authentication and retention details.

Validation: `.venv/bin/python -m unittest discover -s tests -v`. FFmpeg checks are
optional when binaries are unavailable; image, archive and download checks are
required. Tests generate temporary fixtures, not approved marketing content.

Before human approval, run `studio.py prepare-review NAME`. It snapshots content
and resets all review checks. Fill the review record only after inspecting that
version; later content changes block final exports until reviewed again.
See [the PR review report](docs/PR-1-REVIEW.md) for findings, fixes and limitations.
