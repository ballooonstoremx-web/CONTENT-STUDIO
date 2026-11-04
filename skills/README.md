# Skills inventory

Exactly one skill was attached: [social-carousel](social-carousel/SKILL.md).
The original bytes are retained; `catalog.json` records its SHA-256 and source.
`scripts/studio.py doctor` checks that checksum on every run.

## What it does and where it helps

It interviews the brand owner, saves a profile, writes 6–8 slide decks, renders
consistent flat graphic slides through Higgsfield `gpt_image_2`, checks all text,
fits images to Instagram 1080×1350 without cropping, writes platform captions,
and optionally publishes and verifies posts through Blotato. Its strongest fit is
educational Balloon Store carousels: event checklists, balloon care, color guides,
and decoration planning. Its design system has one background and one accent;
use Balloon Store blue and pink only after contrast and typography review.

It explicitly excludes realistic single-image posts, Reels and video. Those use
the separate project workflows, not invented extensions of the attached skill.
Its fixed artifact-card layouts should not be used as photorealistic image prompts.

## How this project applies it

1. On a carousel production request, read the entire original skill.
2. Collect its first-run interview in one message. Known brand facts are in
   `brand/profile.json`; missing handle, audience and CTA remain unknown.
3. Save its profile under the campaign's `carousel/profile.json`, use review mode,
   and keep `COPY.md`, raw images, finals and captions in the paths it expects.
4. Discover Higgsfield and Blotato tools. Its end-to-end publisher stops when a
   required service is missing. Planning here is a separate offline project mode,
   not a claim that the end-to-end skill succeeded. Do not silently substitute.
5. Keep the style anchor chain and inspect every slide, contact sheet and URL zoom.
6. Export for user review. Do not run its publishing steps or automatic mode under
   this setup request. Future publishing needs explicit approval of assets,
   captions, account, platform and timing, plus a working publishing integration.

The skill's cost estimate and API details are supplied reference claims, not live
quotes or verified current provider contracts. Query actual tool schemas and cost
preflight before any approved paid call. No service was purchased or called here.

`scripts/finalize_slides.py` is a verbatim extraction of Appendix A, not an edited
skill. Its tests exercise actual image padding and output sizes.
