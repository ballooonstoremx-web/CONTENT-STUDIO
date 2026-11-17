# Brand Brain — Balloon Store

Single source of brand rules for every agent and skill in this repository
(Claude Code, Codex or any other tool). **Facts** live in
[`profile.json`](profile.json); this file holds **rules and judgment**. Do not
copy colors, audience or product lines into other files: read them from
`profile.json`. The web app (`web/content-hq.html`) embeds the same values and
`tests/test_web.py` fails if they drift.

## Who we talk to
B2B buyers in Mexico: decoradoras, tiendas de fiestas and revendedores. They
want ideas they can sell, montajes that save time and confidence that the
product exists and arrives. Speak like a knowledgeable colleague, in Mexican
Spanish, with "tú".

## Non-negotiable rules
1. **Never invent** products, models, packaging, prices, discounts, stock or
   delivery times. Unknown specifics stay as `[confirmar con catálogo real]`.
2. **Real photos only** for specific products (Anagram, Kaleidoscope,
   Sensacional). Generated or illustrated images may only be abstract
   decoration (confetti, shapes, backgrounds), never a product stand-in.
3. **Missing asset → ask for the file.** Name exactly what is needed
   ("foto del globo metálico X en fondo claro, vertical"), do not fake it.
4. Technical claims (flotación, tamaños, inflado) must come from the
   manufacturer's sheet or the owner; cite the source in the notes.
5. No publishing, scheduling, ad changes, customer messages or paid
   generations. Agents prepare drafts; the owner approves and publishes.
   Shopify, Zoho, Omnisend and Meta Ads are read-only unless the owner
   explicitly authorizes a specific change.
6. Music in Reels: only CapCut commercial-licensed library or original audio.

## Voice
Cercana, clara, festiva y práctica (proposed; confirm with owner). Short
sentences, concrete verbs, one idea per slide or shot. Avoid hype words
("increíble", "el mejor") unless backed by a fact.

## Visual system
- Palette from `profile.json`. Navy is the ink and dark background; pink is
  the primary accent; blue, orange, yellow and green are supporting accents.
- Formats: carousel 1080×1350, Story/Reel 1080×1920 with safe zones
  (≈220 px top, ≈420 px bottom free of text).
- Logo: use the licensed file from `brand/logos/` or the library item tagged
  `logo`. If absent, write "Balloon Store" as text and request the file.

## Content pillars
Educativo · Inspiración · Producto real · Detrás de cámaras · Temporada · Comunidad.

## Approval states (shared with the web app)
`idea` → `borrador` → `revision` (pendiente de aprobación) → `terminado`.
Only the owner moves content to `terminado`.

## Default CTAs (no prices)
- Consulta el catálogo disponible en balloonstoreco.com
- Guarda este post para tu próxima decoración
- Escríbenos por mensaje directo para resolver tus dudas
