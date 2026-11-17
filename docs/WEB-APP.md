# Content HQ web app

Single file: `web/content-hq.html` (no build, no third-party scripts; Google
Fonts with system fallbacks). Spanish (es-MX) UI.

## Where it runs and where data lives
| Where | Data | Media files | Downloads |
|---|---|---|---|
| Private claude.ai artifact | claude.ai `db` (persists across reloads and devices for the owner) | claude.ai `assets` (≤ 20 MB each; larger files stay in that browser's IndexedDB) | claude.ai `downloads` (viewer confirms each save) |
| Local: `studio.py web` (127.0.0.1:8780) | Browser IndexedDB | IndexedDB | Normal browser download |

Use **Respaldo** to download a JSON or ZIP backup and to restore a JSON backup
(merge by id, no duplicates).

## Stations
- **IA** (`#ia`): Claude propone Reels, carruseles y Stories desde un producto real, una foto o un tema. Directo en claude.ai o flujo asistido; ver [IA.md](IA.md).
- **Hoy** (inicio): greeting, 6 KPI rings computed from your data, numbered
  "te necesitan hoy" list (overdue, approvals, due ≤ 2 days, missing real
  photos/footage, campaign tasks), upcoming countdowns incl. Mexican key dates.
- **Estudio semanal**: 1 Formatos (recurring series with next episode number),
  2 Ideas y agenda (7-day board + unscheduled idea bank), 3 Crear y grabar
  (film mode: hook, script and shots as checklists, copy buttons).
- **Campañas**: seasonal campaigns with countdown, runway (Preparar → Publicar,
  pieces as dots, today line), this/next week tasks, linked pieces.
- **Resultados**: manual per-post metrics, funnel Alcance → Visitas al perfil →
  Clics al sitio → Mensajes, conversion tiles, "Mayor fuga" tag, period filter,
  top saves+shares, CSV export. Nothing is estimated.
- Design references and how they were adapted: [REFERENCIAS-VISUALES.md](REFERENCIAS-VISUALES.md).
- **Tablero** (`#panel`): counts and kanban for Ideas / Borradores / Pendiente de aprobación /
  Terminado, upcoming dates, missing-photo warnings. Example data is labeled
  “[Ejemplo]” and only loads on request.
- **Biblioteca**: upload photos/videos (button or drag-and-drop), tags,
  filter, download original, delete (clears references). Tag your logo `logo`.
- **Ideas**: template-based generator by format, occasion, product line and
  audience. No paid AI; product specifics are left as `[confirmar con catálogo real]`.
- **Hooks y copies**: 10 hooks, CTAs, script per format, caption with hashtags,
  copy to clipboard, .txt download.
- **Plantillas**: portada, tip, producto (real photo required), foto, lista, cta.
- **Carrusel**: slide editor with live 1080×1350 preview; export blocked while a
  product slide lacks a real photo. ZIP: `slides/NN.png`, `copy.txt`,
  `ficha.json`, `LEEME.txt`.
- **Reel**: ordered shots from real library clips/photos with in-point,
  duration, on-screen text, voiceover and edit note. ZIP: `clips/NN_*.ext`,
  `instrucciones-capcut.md`, `subtitulos.srt`, `textos-en-pantalla.txt`,
  `guion.txt`, `copy-instagram.txt`, `portada-1080x1920.png`.
- **Calendario**: month grid colored by status, unscheduled list with date pickers.

The app never publishes, schedules, messages customers or calls paid services.

## Tests
`tests/test_web.py` (part of `unittest discover`) checks brand drift against
`brand/profile.json`, skill wiring, the loopback server, and runs
`tests/e2e/web_e2e.mjs` in Chromium twice: local IndexedDB mode and a mock of
the claude.ai runtime built from its published type contract. It uploads real
ffmpeg-generated photo/video fixtures, runs the carousel and Reel flows,
reloads to confirm persistence, and `tests/e2e/verify_exports.py` opens every
ZIP, checks PNG sizes, SRT timing and decodes the exported MP4 with ffmpeg.
The mock proves the app follows the contract; the live claude.ai storage is
verified separately after publishing.
