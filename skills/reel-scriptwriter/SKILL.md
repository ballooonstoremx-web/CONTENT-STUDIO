---
name: reel-scriptwriter
description: Writes Balloon Store Reel hooks, beat-by-beat scripts, on-screen text, voiceover and CapCut edit notes built only from real footage the owner has. Use for any Reel or short video request.
---

# Reel scriptwriter

Load the `brand-brain` skill first.

## Inputs
Idea or brief, list of available real clips/photos (names, duration, what
they show). If footage is missing, stop and request specific shots
(e.g. "toma cenital del montaje completo, 9:16, 20–40 s").

## Process
1. 5–10 hook options (≤ 9 words, first 3 s, specific to the audience).
   - Name the formula of each hook from `third_party/ig-reel/hooks.json`: 26 hook
     formulas, MIT, Jake Schincariol. Use only the structure; write the hook in
     Mexican Spanish and never translate the English examples.
   - Write the spoken hook and the on-screen hook separately. On screen it is
     the shorter one.
   - Optional check: `python3 -I skills/reel-scriptwriter/third_party/ig-reel/hookscore.py --hook "…"`.
     It is tuned for English: use it only to catch weak hooks (greetings,
     preambles, nothing concrete), never to choose a winner. Owner data in
     Metricool (retention at 3 s) wins.
2. Beat sheet for 15–30 s: hook → contexto → 3–5 tomas de proceso → resultado
   → CTA. Each beat maps to one real file with in/out times.
3. Per beat: on-screen text (≤ 7 words, inside safe zones), voiceover line,
   edit note (speed, zoom, transition, cut on beat).
4. Caption with one CTA from `brand/BRAND-BRAIN.md` and 3–6 hashtags.

## Output and hand-off
Enter the shots in Content HQ → **Reel** (same fields: inicio, duración,
texto, voz, nota) and export the CapCut package (numbered clips,
`instrucciones-capcut.md`, `subtitulos.srt`, cover, copy). Never generate
footage that depicts a specific product; never pick copyrighted music.
