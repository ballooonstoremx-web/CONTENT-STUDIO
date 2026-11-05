# Instagram carousel production plan

1. Read `skills/social-carousel/SKILL.md`. Complete its first-run interview in one
   message, using confirmed brand facts. Save `carousel/profile.json` in this
   campaign with `approval: review`; do not fill unknown handles or account IDs.
2. Check the global approved/post log before selecting an angle. Write 6–8 slides
   in COPY.md: short hook, value, save checklist and confirmed CTA. Keep exactly
   one topic, 4 artifact-card rows, short all-caps Spanish text when confirmed.
3. Discover Higgsfield tools; read current schemas, verify model, get a live cost
   preflight, obtain explicit spending approval. If missing, stop rendering.
4. Save the prompts in carousel/PROMPTS.md. Follow the skill's anchor chain:
   previous approved cover → current cover → interior slides. No photography in
   this graphic carousel design. Do not use product-photo prompts here.
5. Download provider results into raw/ as cover-raw.png, slide2-raw.png, etc.
   Record provenance, job IDs, rights and edits without tokens or signed URLs.
6. Run `studio.py finalize NAME`. Inspect review/contact-sheet.png,
   review/zoom-url.png and EVERY full-size final. Read every word. Reword errors;
   follow the skill's two-fix limit. Add per-slide alt text to carousel/ALT-TEXT.md.
7. Write Instagram captions in CAPTIONS.md, with a confirmed CTA, no invented
   handle, up to five hashtags, and no unconfirmed 'link in comments'.
8. Run `studio.py prepare-review NAME`, then fill review/approval.json only after
   human review. Preserve content_sha256; repeat review after any edits. Export a draft for revisions
   or a final package after checks. Neither export authorizes publishing.

Provider calls, paid credits, uploads and publishing are not part of offline init.
