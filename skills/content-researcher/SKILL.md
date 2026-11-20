---
name: content-researcher
description: Finds and ranks Balloon Store content opportunities (seasonal dates in Mexico, recurring questions from decoradoras/tiendas/revendedores, formats that work) and turns them into idea briefs for the Content HQ web app. Use for "what should we post", research or monthly planning.
---

# Content researcher

Load the `brand-brain` skill first.

## Inputs
- Month or campaign window, product lines to push (from `brand/profile.json`).
- Optional: owner's notes, past results (see `results-analyst`), a Content HQ
  backup JSON (`content-hq-respaldo-*.json`) to avoid repeating ideas.

## Process
1. List Mexican dates and seasons in the window (fiestas patrias, Día de
   Muertos, Navidad, Día de las Madres, graduaciones, XV años…).
2. For each audience segment, list the job they need done (vender más
   montajes, surtir a tiempo, cotizar mejor).
3. Cross dates × jobs × product lines into ideas. Prefer ideas that can be
   shot with real inventory and real montajes.
4. Use web research only from public sources and cite URLs. Do not scrape
   private accounts, do not contact anyone, do not spend credits without
   approval.

## Output
A table: formato (Reel/Carrusel/Stories), título, pilar, ocasión, línea,
público, por qué ahora, material real necesario (lista de archivos a
pedir). Optionally a JSON array of items `{type,title,pillar,occasion,line,
audience,notes,status:"idea"}` that can be merged into a Content HQ backup
and restored from the web app's **Respaldo** page.
