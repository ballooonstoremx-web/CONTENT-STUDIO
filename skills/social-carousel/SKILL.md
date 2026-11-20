---
name: social-carousel
description: Interview-first carousel publisher. On first use it interviews the user (brand, handle, audience, voice, look, call to action, platforms, approval mode) and saves a profile. On every run it asks for a topic, writes a 6 to 8 slide deck, renders the slides with Higgsfield gpt_image_2 on a style-anchor chain, builds 1080x1350 finals, writes per-platform captions, and publishes through Blotato (MCP server, plugin, or REST API key) to LinkedIn, X, Instagram, TikTok, Facebook, or Threads, then verifies the live post URLs. Use for any "make a carousel" or "post a carousel" request. Not for video, reels, or single-image posts.
metadata:
  short-description: Interview, design, render and publish social carousels
---

# Social Carousel

Turns a topic into a designed, published carousel. Two services do the heavy lifting:

- **Higgsfield** renders the slides with the `gpt_image_2` model, chosen because it renders typography reliably. Connect it as an MCP server or plugin: `https://mcp.higgsfield.ai/mcp`. Tools used: `models_explore`, `generate_image`, `generate_image_batch`, `jobs_wait`, `show_generation_by_ids`, `media_upload`, `media_confirm`.
- **Blotato** hosts the images and publishes them. Any of three ways works: the Blotato MCP server (`https://mcp.blotato.com/mcp`), the Blotato plugin, or the REST API with a key generated at my.blotato.com/settings under API (header `blotato-api-key`, base URL `https://backend.blotato.com/v2`). Section 8 gives the tool calls and the raw HTTP side by side.

Optional: Python 3 with Pillow for the 4:5 finals in Appendix A. Without it, render at `aspect_ratio: "1:1"` and post the raws.

If either service is missing, stop and tell the user how to connect it. Never substitute a different image model or a different publishing route without saying so.

## 1. First run: the interview

If `carousel/profile.json` exists in the working folder, load it and go to section 2. Otherwise interview the user before doing anything else. Ask everything in one message, accept partial answers, fill sensible defaults for anything skipped, confirm the profile back as a short table, then save it.

| # | Ask | Why it matters | Default if skipped |
|---|---|---|---|
| 1 | Name or brand, and the handle to print on every slide (for example @yourname) | slide footer, author voice | no footer |
| 2 | Who the audience is and what they want from you, in one sentence | topic filtering, caption framing | "people in my niche" |
| 3 | Voice: three adjectives, plus one paragraph you wrote that sounds like you | captions are written in this voice | direct, plain, confident |
| 4 | Call to action: a URL, a "comment KEYWORD" mechanic, a newsletter, or nothing, with the exact wording | last slide and every caption | none |
| 5 | Platforms, and for LinkedIn or Facebook whether to post to a company page or the personal profile | posting targets | LinkedIn personal profile |
| 6 | Look: a background colour and ONE accent colour, or a preset from 3.2 | every slide prompt | preset Terminal, #0B1220 with #7CF2C8 |
| 7 | Typography mood: condensed bold caps, editorial serif, or rounded friendly | prompt wording | condensed bold caps |
| 8 | Deck length (6 to 8) and whether to include a "save this" checklist slide | structure | 7, yes |
| 9 | Up to 5 hashtags for Instagram and TikTok | captions | none |
| 10 | Approval mode: "show me the deck and captions before posting" or "post automatically" | whether section 7 waits | show me first |
| 11 | Face on the cover? If yes, a cutout PNG of the person | optional face-cover variant | no |

Save the answers as `carousel/profile.json`:

```json
{
  "name": "", "handle": "@", "audience": "",
  "voice": {"adjectives": [], "sample": ""},
  "cta": {"type": "url|comment|newsletter|none", "phrase": "", "url": "", "keyword": ""},
  "platforms": ["linkedin"], "linkedin_page_id": null, "facebook_page_id": null,
  "look": {"preset": "terminal|editorial|poster", "bg": "#0B1220", "accent": "#7CF2C8", "type": "condensed|serif|rounded"},
  "slides": 7, "save_slide": true, "hashtags": [], "approval": "review|auto",
  "face_cover": false, "face_file": null,
  "anchor": null, "accounts": {}
}
```

If files cannot persist in this environment, print the JSON and ask the user to paste it at the start of the next session. `anchor` and `accounts` are filled in by later steps.

## 2. Every run: the topic

Ask: "What topic do you want this carousel on?" Accept a subject, a URL or article, a video link, rough notes, or "surprise me" (then propose three angles for their audience and let them pick one). Read `carousel/post-log.md` and do not repeat an angle that was already posted. One idea per deck, titled like a headline. Ask nothing else; everything after this is your job.

## 3. Write the deck (copy before pixels)

Write `carousel/<YYYY-MM-DD>-<slug>/COPY.md` with the slide list, then render. Carousels win on saves and dwell time, and the cover decides whether anyone swipes, so the structure is fixed:

| # | Slide | Content |
|---|---|---|
| 1 | Cover | Headline of at most 8 words on 3 or 4 stacked lines, an accent block with a 2 to 5 word phrase, one artifact card |
| 2 to n-2 | Value | One idea per slide: a 2-line headline (6 words max), an accent phrase, a 4-row artifact card, a one-line punchline under the card (8 words max) |
| n-1 | Save trigger | The "do this today" checklist as the 4 rows, punchline starting "SAVE THIS ..." (skip when `save_slide` is false) |
| n | CTA | The profile's call to action: headline, accent block with the CTA phrase, the URL or keyword inside the card. With no CTA, end on the save-trigger slide instead |

The artifact card is what makes a slide worth saving: four rows of LABEL ...... VALUE, label 1 or 2 words, value 1 to 4 words. Slide text is ALL CAPS, concrete and short, with numbers wherever possible. Prefer plain short words: the model misspells long or rare words, and regenerating the same word repeats the same misspelling, so the fix for a misspelling is always to reword the line. Non-English decks follow the same rules in that language.

### 3.1 The design system (the same on every slide)

One background colour, one accent colour, white or ink type, a faint dotted or ruled grid, a solid accent block behind the key phrase, a rough hand-drawn accent arrow on the cover and the CTA, the artifact card, and the handle in small type at the bottom centre. Flat graphic design, no photography, no people (except the optional face cover). The anchor chain in section 4 keeps the system identical from slide to slide and deck to deck.

### 3.2 Presets

| Preset | Card | Type | Example palette (bg + accent) |
|---|---|---|---|
| Terminal | dark rounded terminal window with three small traffic-light dots, monospace rows | ultra-condensed bold caps | #0B1220 + #7CF2C8 |
| Editorial | paper card with a thin rule border, numbered rows | serif headlines, sans rows | #F4F1EA + #C2410C (ink text #1B1B1B) |
| Poster | flat card with a thick border and big numerals | ultra-bold grotesque caps | #FFFFFF + #2563EB (ink text #111111) |

Write `{LOOK}` once from the profile and reuse it in every prompt, for example for Terminal: "pure near-black background #0B1220 with a very faint dotted grid, white ultra-condensed bold all-caps headlines, #7CF2C8 accents, dark rounded terminal window with three small traffic-light dots, #7CF2C8 monospace rows".

### 3.3 Prompt templates (fill the braces, keep everything else)

Cover. On the very first deck there is no reference image yet, so drop the first sentence.

```
Recreate the EXACT visual style of the reference image (same design system, same fonts, same accent colour, same layout language) but with new text. A vertical social carousel cover slide: {LOOK}. Top two thirds: a huge headline tightly stacked on {three|four} lines, reading exactly: {LINE 1} / {LINE 2} / {LINE 3}. Directly under it a solid {ACCENT} highlight block with dark condensed bold all-caps text inside reading exactly: {ACCENT PHRASE}, and a rough hand-drawn {ACCENT} arrow curving down to the right of that block. Bottom third: the card containing four monospace all-caps rows, each row a label on the left, a row of dots in the middle and a value on the right, reading exactly: {L1} ...... {V1} / {L2} ...... {V2} / {L3} ...... {V3} / {L4} ...... {V4}. At the very bottom centre, small {ACCENT} monospace text reading exactly: {HANDLE}. Flat graphic design, no photography, no people, crisp perfectly spelled typography, full bleed.
```

Value and save-trigger slides:

```
Same exact design system as the reference image: vertical social carousel slide, {LOOK}. New text. Headline at top on two lines reading exactly: {HEADLINE}, and under it a solid {ACCENT} block with dark condensed bold all-caps text reading exactly: {ACCENT PHRASE}. Middle: the card with four monospace all-caps rows, label left, dots middle, value right, reading exactly: {L1} ...... {V1} / {L2} ...... {V2} / {L3} ...... {V3} / {L4} ...... {V4}. Below the card, a single line of condensed bold all-caps text reading exactly: {PUNCHLINE}. At the very bottom centre small {ACCENT} monospace text reading exactly: {HANDLE}. Flat graphic design, no photography, no people, crisp perfectly spelled typography, full bleed.
```

CTA slide:

```
Same exact design system as the reference image: vertical social carousel slide, {LOOK}. New text. Headline at top on two lines reading exactly: {CTA HEADLINE}. Under it a large solid {ACCENT} block with dark condensed bold all-caps text reading exactly: {CTA PHRASE}, with a rough hand-drawn {ACCENT} arrow pointing down to the right of it. Middle: the card containing exactly two centred monospace all-caps lines of text, the first line reading exactly {CTA LINE 1} and the second line directly beneath it reading exactly {CTA LINE 2}. Do not draw any slash, dash, pipe or other separator character at the end of the first line. At the very bottom centre small {ACCENT} monospace text reading exactly: {HANDLE}. Flat graphic design, no photography, no people, crisp perfectly spelled typography, full bleed.
```

The "/" between lines in the first two templates is a proven line separator. On a slide that contains a URL it can get drawn as a literal glyph, which is why the CTA template spells the line break out in words. If the profile has no handle, delete the handle sentence.

Face cover (only when `face_cover` is true): upload the cutout PNG with `media_upload`, pass TWO `role: "image"` medias (the style anchor first, the face second), use `quality: "high"` for this one slide, put the photo large on the right with the accent block on the left, and write "preserve the EXACT face from the second reference image" plus a one-line description of the person. Interior slides stay faceless.

## 4. Render with Higgsfield

Every slide: `model: "gpt_image_2"`, `aspect_ratio: "2:3"` (or `"3:4"`; use `"1:1"` only when no finals can be made), `resolution: "1k"`, `quality: "low"`, `use_unlim: false` unless the user asks to spend free-trial generations. At 1k/low a slide costs about 0.5 credits, so a 7-slide deck is roughly 4 credits including one regeneration; `get_cost: true` on a single `generate_image` call preflights the exact figure without submitting. Raws come back around 688x1024.

1. Anchor. The anchor is the previous deck's cover and it is what keeps every deck in the same style. If `profile.anchor` names a file, upload it with `media_upload` (`filename`, `content_type: "image/png"`, the upload_url method, not a widget), PUT the bytes, then confirm:

   ```bash
   curl -s -o /dev/null -w '%{http_code}' -X PUT "<upload_url>" -H 'Content-Type: image/png' --data-binary "@<anchor file>"
   ```

   Expect 200, then `media_confirm` with the returned `media_id` and `type: "image"`. On the first deck there is no anchor: render the cover with no reference at `quality: "medium"`.
2. Cover: one `generate_image` call with the cover prompt and `medias: [{"role": "image", "value": "<anchor media_id>"}]`. Note its `job_id` and result URL, and download the result:

   ```bash
   curl -sL -o cover-raw.png "<result url>"
   ```

3. Interiors: one `generate_image_batch` (up to 12 requests, `index` 2 upward) with the value, save-trigger and CTA prompts, and `medias: [{"role": "image", "value": "<cover job_id>"}]` on every request, so the new cover anchors its own interiors. Poll `jobs_wait` until `all_terminal` is true, then call `show_generation_by_ids` once for the whole set. Download each as `slide2-raw.png`, `slide3-raw.png`, and so on.
4. QA: open every raw and read every word. Zoom into the CTA line.

| Problem | Fix |
|---|---|
| a misspelled word | reword that line in COPY.md and regenerate that one slide |
| a stray "/" or separator glyph on the URL slide | regenerate with the CTA wording (the one case where regenerating the same text is right) |
| off-style: wrong colours, a photo, a person, layout drift | regenerate that slide with the anchor again |
| a slide still wrong after two fixes | stop and show the user, do not publish |

After the deck is approved, write the new cover's path into `profile.anchor` so the next deck matches this one.

## 5. Finals

Run Appendix A in the deck folder (add `--tiktok` when TikTok is in the platform set). It writes `slide-01.png` onward at 1080x1350 by FIT-AND-PAD (scale to 1350 tall, pad the sides with the slide's own corner colour), optional `tiktok-NN.png` at 1080x1920, plus `contact-sheet.png` and `zoom-url.png`. Never crop to the ink bounds: the slides are full bleed and any crop clips them. Look at the contact sheet and the zoom before going on. Without Python, post the raws (rendered at 1:1) as they are.

## 6. Captions

Write in the profile voice: the adjectives, the sample paragraph, the reader as the protagonist ("you"), short sentences, concrete numbers. One caption per platform:

| Platform | Caption |
|---|---|
| LinkedIn | 1,200 to 1,500 characters. First line is the hook (a moment or a blunt claim). Short paragraphs that walk the deck's steps in prose, one lesson, a "save this" line, one question to end on. No "comment X and I will send it" gating: LinkedIn suppresses it. The CTA link goes in the last line unless a first comment is confirmed possible (section 9). |
| X | Under 280 characters, the deck's one big idea, no hashtags. The link goes in a thread reply. |
| Instagram | Half the LinkedIn length, same substance, looser energy. Links are not clickable, so write the URL as plain text, and end with at most 5 hashtags: Blotato rejects more. |
| TikTok | The Instagram caption trimmed, plain-text link, 4 hashtags max. |
| Facebook | The LinkedIn caption trimmed by a third; the link goes in `firstComment` or the `link` field. |
| Threads | Under 500 characters, link in a reply. |

Hygiene rules, unless the user's voice sample clearly does otherwise: no em dashes and no emojis placed next to each other (both read as machine-written); do not mention how the slides were produced; do turn on the platform's AI-disclosure flag where one exists (TikTok `isAiGenerated: true`); never "link in bio".

## 7. Approval gate

`approval: "review"`: show the contact sheet (or the slide files) and every caption, then wait for "go" or edits, and apply edits before posting. `approval: "auto"`: continue without stopping. In both modes never post a deck that failed QA.

## 8. Publish with Blotato

The same five steps whichever route is connected. MCP and plugin expose the same actions; REST calls carry the header `blotato-api-key: <key>`.

| Step | MCP or plugin tool | REST |
|---|---|---|
| Accounts | `blotato_list_accounts` | `GET https://backend.blotato.com/v2/users/me/accounts` |
| Host a local file | `blotato_create_presigned_upload_url` with `filename` | `POST https://backend.blotato.com/v2/media/uploads` with `{"filename": "slide-01.png"}` |
| Host a public URL instead | not needed, pass the URL straight into `mediaUrls` | `POST https://backend.blotato.com/v2/media` with `{"url": "https://..."}` returns a hosted `url` |
| Create the post | `blotato_create_post` (flat fields) | `POST https://backend.blotato.com/v2/posts` (nested body below) |
| Poll | `blotato_get_post_status` with `postSubmissionId` | `GET https://backend.blotato.com/v2/posts/{postSubmissionId}` |
| Cross-check | `blotato_list_posts` | `GET https://backend.blotato.com/v2/posts` |

1. Accounts: match each platform in the profile to an account `id`; for a company page, take the `pageId` from that account's `subaccounts`. Save the ids into `profile.accounts`. If the call fails with an invalid key or session, stop and tell the user to reconnect Blotato. Never guess an id.
2. Host every final. Presigned flow: the response has `presignedUrl` and `publicUrl`; PUT the bytes right away (the URL expires quickly), then use `publicUrl` in the post:

   ```bash
   curl -s -o /dev/null -w '%{http_code}' -X PUT "<presignedUrl>" -H 'Content-Type: image/png' --data-binary "@slide-01.png"
   ```

   Anything but 200 means that file is not hosted; fix it before posting. Never put a URL into a post that did not come from a tool result or an API response.
3. One post per platform, in this order: LinkedIn, X, Instagram, TikTok, Facebook, Threads. Full REST body (MCP and plugin take the same fields flattened next to `accountId`, `platform` and `text`):

   ```json
   {
     "post": {
       "accountId": "<id>",
       "content": {"text": "<caption>", "platform": "instagram", "mediaUrls": ["<publicUrl 1>", "<publicUrl 2>"], "additionalPosts": []},
       "target": {"targetType": "instagram", "firstComment": "<cta line with link>"}
     }
   }
   ```

| Platform | Target fields and limits |
|---|---|
| LinkedIn | `targetType: "linkedin"`, `pageId` only for a company page. Up to 10 images. Never a PDF: it gets flattened to one JPEG and the post shows as broken. |
| X | `targetType: "twitter"`. Exactly 4 images: cover, strongest value slide, the proof or checklist slide, CTA (anything beyond 4 is dropped silently). `additionalPosts: [{"text": "<cta line with link>"}]` posts the link as a thread reply. |
| Instagram | `targetType: "instagram"`, no `mediaType` (that is for reels and stories), `firstComment` with the link. All slides at 4:5. Processing takes 1 to 2 minutes. |
| TikTok | `targetType: "tiktok"`, the 9:16 pads as `mediaUrls`, and every required flag: `privacyLevel: "PUBLIC_TO_EVERYONE"`, `disabledComments: false`, `disabledDuet: false`, `disabledStitch: false`, `isBrandedContent: false`, `isYourBrand: false`, `isAiGenerated: true`, plus `imageCoverIndex: 0`. Photo carousels stay in-progress for several minutes. |
| Facebook | `targetType: "facebook"`, `pageId` required, `firstComment` or `link` for the CTA. |
| Threads | `targetType: "threads"`, link via `additionalPosts`. |

4. Poll at least 10 seconds apart until `status` is `published` (then `publicUrl` is present) or `failed` (then `errorMessage`). Most failures are permanent: do not resubmit the same post, report it. Rate limits: 30 post creations a minute, 30 media uploads a minute.

## 9. First comment

A link in the first comment keeps reach and drives engagement, so the caption points there whenever the comment is guaranteed:

- X and Threads: the thread reply in `additionalPosts` ships with the post.
- Instagram and Facebook: `firstComment` ships with the post; confirm it with `blotato_list_comments` (status `posted`) when that tool exists.
- TikTok: no comment API; the link stays in the caption.
- LinkedIn: no comment API. Keep the link in the caption. Only if the user opted in and a browser session on their LinkedIn is available: open the post URL, wait until the carousel has fully rendered (typing while it is still loading silently drops the text), add the comment, and confirm it shows under their name before reporting it.

Never write "link in the comments" for a comment that has not been confirmed.

## 10. Verify, log, report

Publish-verification law: a platform counts as published ONLY when its post URL appears in a tool result or API response. Never report a URL from memory. End every run with one list-posts call and check that every intended platform shows `published` and none show `failed`. Blotato cannot delete a published post, so a wrong post is worse than no post: when QA, hosting, or posting fails, stop, keep the deck folder, and say exactly what broke.

Append one row to `carousel/post-log.md` (date, platforms, topic, anchor used, URLs, first-comment status) and report:

```
Topic: ...
Deck: carousel/<date>-<slug>/ (N slides)
LinkedIn: <url>   link: in caption | first comment confirmed
X: <url>   link: thread reply
Instagram: <url>   first comment: posted | not confirmed
TikTok: <url>   link in caption
Cross-check: N published, 0 failed
Next anchor: carousel/<date>-<slug>/cover-raw.png
```

## Appendix A: finalize_slides.py

Save next to the raws and run `python3 finalize_slides.py [--tiktok]`. Needs Pillow (`pip install pillow`).

```python
#!/usr/bin/env python3
"""Fit-and-pad gpt_image_2 raws to 1080x1350 finals (+ optional 1080x1920 TikTok pads), contact sheet, URL zoom."""
import argparse, glob, os, re, sys
from PIL import Image

W, H = 1080, 1350
TW, TH = 1080, 1920

def corner_bg(im, patch=8):
    px = []
    for (x, y) in [(0, 0), (im.width - patch, 0), (0, im.height - patch), (im.width - patch, im.height - patch)]:
        px.extend(list(im.crop((x, y, x + patch, y + patch)).getdata()))
    return tuple(sum(p[k] for p in px) // len(px) for k in range(3))

def fit_pad(im, w, h, bg):
    nw = int(round(im.width * (h / im.height)))
    canvas = Image.new("RGB", (w, h), bg)
    if nw <= w:
        canvas.paste(im.resize((nw, h), Image.LANCZOS), ((w - nw) // 2, 0))
    else:
        nh = int(round(im.height * (w / im.width)))
        canvas.paste(im.resize((w, nh), Image.LANCZOS), (0, (h - nh) // 2))
    return canvas

def natural_key(s):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", s)]

def discover(d):
    files = ["cover-raw.png"] if os.path.exists(os.path.join(d, "cover-raw.png")) else []
    return files + sorted((os.path.basename(p) for p in glob.glob(os.path.join(d, "slide*-raw.png"))), key=natural_key)

ap = argparse.ArgumentParser()
ap.add_argument("--dir", default=".")
ap.add_argument("--files", nargs="*")
ap.add_argument("--tiktok", action="store_true")
a = ap.parse_args()
files = a.files or discover(a.dir)
if not files:
    sys.exit("no raws found: expected cover-raw.png + slide2-raw.png ... or pass --files")
finals = []
for i, f in enumerate(files, 1):
    im = Image.open(os.path.join(a.dir, f)).convert("RGB")
    bg = corner_bg(im)
    out = fit_pad(im, W, H, bg)
    out.save(os.path.join(a.dir, f"slide-{i:02d}.png"))
    finals.append(out)
    if a.tiktok:
        tk = Image.new("RGB", (TW, TH), bg)
        tk.paste(out, (0, (TH - H) // 2))
        tk.save(os.path.join(a.dir, f"tiktok-{i:02d}.png"))
    print(f"slide-{i:02d}.png <- {f} raw={im.size} bg={bg}")
cols, tw = 4, 360
th = int(tw * H / W)
sheet = Image.new("RGB", (cols * tw, ((len(finals) + cols - 1) // cols) * th), (40, 40, 40))
for i, im in enumerate(finals):
    sheet.paste(im.resize((tw, th), Image.LANCZOS), ((i % cols) * tw, (i // cols) * th))
sheet.save(os.path.join(a.dir, "contact-sheet.png"))
band = finals[-1].crop((0, int(H * 0.55), W, int(H * 0.97)))  # bottom band: the CTA card + URL
band.resize((band.width * 2, band.height * 2), Image.LANCZOS).save(os.path.join(a.dir, "zoom-url.png"))
print(f"{len(finals)} finals + contact-sheet.png + zoom-url.png written to {os.path.abspath(a.dir)}")
```
