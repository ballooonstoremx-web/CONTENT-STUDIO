# PR #1 functional and security review

Reviewed 2026-11-04 against the existing setup/balloon-content-workflow branch.
Git fetch verified refs/pull/1/head matched the implementation commit f896aa8.
GitHub API metadata is unavailable to this agent (proxy HTTP 403); review and
updates use the actual checkout and native Git. No merge or publication is part
of this review.

## Result

The local planning, imported-media processing, validation, ZIP export and private
download workflow is functional after the fixes below. All 11 original tests
passed before changes. The expanded suite now has **25 passing tests, zero skips**.
It uses local test fixtures, not generated AI images or approved brand content.

| Workflow | Verified now | Still missing |
|---|---|---|
| Carousel | Draft intake; 6/7-slide fit-and-pad; full-size PNGs; contact sheet/CTA zoom; review checks; draft/final ZIP and download | Higgsfield rendering, actual typography/brand QA and owner-approved creative |
| Image | Draft image plan; successful 1080×1350 PNG validation/export/download; corruption and wrong formats rejected | Connected/approved AI provider, real reference assets, realism and human visual QA |
| Reel | Storyboard plan; actual H.264 1080×1920 fixture encoding, probing, decoding, export/download; truncated media rejected | AI video connection, footage, audio/music rights and manual editing/subtitles |
| Marketing | Draft plan; nonempty reviewed text validation; draft/final export/download | Actual campaign copy, fact checks and brand-owner approval |
| Delivery | Eight ZIPs (draft/final for four formats) downloaded via authenticated HTTP; exact bytes and manifest hashes checked | Download to the owner's computer still needs platform file download or an authenticated tunnel; no external URL is claimed |
| Publishing | Deliberately absent from CLI | Blotato connection and separate explicit publishing approval |

## Findings fixed in this branch

1. **High: stale approvals accepted changed content.** A reviewed file could change
   and still export as approved. Added prepare-review to snapshot exact exportable
   content and reset checks. Final checks reject changed/missing snapshots and
   malformed reviewer/timestamp records. Content and review changes detected while
   exporting abort the new ZIP instead of replacing an existing package.
2. **Medium: failed server startup overwrote a live token.** The server now locks
   its runtime directory and binds the port before atomically installing a mode
   0600 token. Busy ports and duplicate services preserve the existing token;
   clean shutdown removes only the current session token.
3. **Medium: overly broad draft media export types.** Credential-style JSON files
   placed in finals/ could be included in draft ZIPs. Exports now enforce
   format-specific media types even for drafts, reject hard links as well as
   symlinks, and ignore private publication logs in Git.
4. **Medium: Reel metadata did not establish decodability.** Added full FFmpeg
   decoding with errors treated as failures, protocol restrictions and timeouts.
   A deliberately truncated MP4 with readable metadata is now rejected.
5. **Medium: finalization failure left partial files among raw originals.** Run
   the unchanged finalizer in staging. A corrupt later slide leaves originals,
   earlier previews and finals intact. Missing/nonconsecutive raw numbers fail early.
6. **Low: download and input robustness.** Strict Bearer headers, non-ASCII header
   handling, query rejection, no-follow file opens, regular-file checks and
   streaming replace permissive auth and whole-ZIP memory reads. Invalid JSON gets
   a safe CLI error without echoing input or a traceback. Required files and actual
   single-frame PNG/JPEG formats are checked explicitly.

## Secret and dependency checks

- Compared the skill directly to the original attachment: **byte-identical**.
  SHA-256: d1c4d962e4a2cc8fe78a6bf0891703eaaac74278f67a10a35c51e3915404f24d.
  The Appendix A extraction is also unchanged.
- Inspected tracked source, reachable Git blobs and the retained sample export
  for private-key, GitHub/API-token, AWS-key and assigned-credential patterns.
  No matching secrets found. No runtime token, environment file, private input or
  generated media is tracked. Brand facts are the supplied public name/site/colors;
  missing customer/account information was not invented.
- Runtime token values and injected credentials were not printed or committed.
  Doctor reports presence only. pip check reports no broken dependencies.
- PyPI metadata for pinned Pillow 13.0.0 returned no reported advisory IDs at review
  time, with TLS verification enabled. This is not a guarantee against unknown
  vulnerabilities or an exhaustive audit of system media binaries.

## Remaining boundaries

Higgsfield and Blotato are still absent from the actual callable-tool inventory;
Canva/CapCut have no connected tool. An OpenAI image tool is a separate available
option, not an implicit replacement for the attached carousel skill's provider.
No paid job, provider upload, post, deployment or purchase was performed.

The service is loopback-only development tooling for a trusted local user, not
production multiuser hosting. Review records can be edited by someone with write
access; the snapshot prevents accidental stale approval, not forgery. File-type
allowlists do not detect a secret or personal information pasted into permitted
copy, an image's pixels or media metadata. Human privacy, licensing, brand and
content review remains required. Do not expose this service directly to the Internet.

The original appendix uses a Pillow API scheduled for future deprecation. It
works with the pinned version and stays unchanged to preserve the supplied skill.
AI quality, actual platform acceptance and external desktop delivery remain
unverified. These are explicit integration/review limits, not passing test claims.
