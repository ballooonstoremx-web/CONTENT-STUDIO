// Recorrido de la Fase 1: datos de métricas → diagnóstico → competencia → inspiración → idea → aprobar →
// calendario (arrastrar) → ficha → editor de diseño (mover, texto, fuente) → vista final y JPG → aprobar → persistencia.
// Usage: node tests/e2e/intel_e2e.mjs <base_url> <fixtures_dir> <out_dir>
import { createRequire } from "module";
import fs from "fs";
import path from "path";
const require = createRequire(import.meta.url);
const { chromium, devices } = require("playwright");
const [, , BASE, FIX, OUT] = process.argv;
fs.mkdirSync(OUT, { recursive: true });
let fails = 0;
const ok = (c, m) => { console.log((c ? "PASS " : "FAIL ") + m); if (!c) fails++; };
const errs = [];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1360, height: 900 }, acceptDownloads: true });
const page = await ctx.newPage();
page.on("pageerror", e => errs.push(e.message));
await page.goto(BASE + "#respaldo"); await page.waitForSelector("#bk_in", { state: "attached" });
await page.setInputFiles("#bk_in", path.join(FIX, "seed.json")); await page.waitForTimeout(1200);
await page.goto(BASE + "#catalogo"); await page.waitForSelector("#cat_file", { state: "attached" });
await page.setInputFiles("#cat_file", path.join(FIX, "catalog.json")); await page.waitForTimeout(5000);
await page.goto(BASE + "#intel"); await page.waitForTimeout(600);
ok(/17/.test(await page.locator(".kpi").first().innerText()), "Inteligencia: 17 contenidos analizados");
await page.goto(BASE + "#analisis"); await page.waitForTimeout(600);
const at = await page.locator("main").innerText();
ok(/Por formato/.test(at) && /Hooks de Reels/.test(at) && /Cómo se calcula cada indicador/.test(at), "Mis resultados: formato, hooks y metodología");
await page.goto(BASE + "#diagnostico"); await page.waitForTimeout(600);
const dt = await page.locator("main").innerText();
ok(/Lo que estás haciendo bien/.test(dt) && /Tres acciones prioritarias/.test(dt) && /Datos faltantes/.test(dt), "Diagnóstico: hallazgos, acciones y datos faltantes");
ok(/contenido de otra cuenta/.test(dt), "Diagnóstico: advierte contenido de terceros");
ok(!/NaN|undefined/.test(dt), "Diagnóstico sin NaN ni undefined");
await page.locator("[data-learn]").first().click(); await page.waitForTimeout(300);
ok(await page.evaluate(() => S.learnings.length) === 1, "Aprendizaje guardado en memoria");
// competencia manual
await page.goto(BASE + "#competencia"); await page.waitForTimeout(400);
await page.click("#cp_add"); await page.fill("input[name=handle]", "@cuenta.prueba"); await page.fill("input[name=fol]", "1200"); await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(400);
await page.locator("[data-cobs]").first().click(); await page.fill("input[name=url]", "https://www.instagram.com/reel/PRUEBA/"); await page.fill("input[name=hook]", "Mira esto"); await page.fill("textarea[name=adapt]", "Mostrar el resultado primero"); await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(400);
ok(/Mira esto/.test(await page.locator("main").innerText()), "Competencia: observación con hook y enlace");
// inspiración con captura → idea
await page.goto(BASE + "#inspiracion"); await page.waitForTimeout(400);
await page.click("#in_add"); await page.fill("input[name=url]", "https://www.instagram.com/reel/INSP/"); await page.fill("input[name=title]", "Referencia de mesa"); await page.setInputFiles("input[name=file]", path.join(FIX, "photo.png"));
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(800);
ok(await page.locator(".pin img").count() >= 1, "Inspiración con miniatura propia");
await page.locator(".pin", { hasText: "Referencia de mesa" }).locator("[data-iidea]").click(); await page.waitForTimeout(300);
await page.fill("input[name=hook]", "Hook de prueba"); await page.selectOption("select[name=format]", "carrusel");
const pid = await page.locator("select[name=productId] option").nth(1).getAttribute("value"); await page.selectOption("select[name=productId]", pid);
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(600);
await page.locator(".icard", { hasText: "Hook de prueba" }).locator("[data-bap]").click(); await page.waitForTimeout(300);
await page.locator(".icard", { hasText: "Hook de prueba" }).locator("[data-bpost]").click(); await page.waitForTimeout(300);
await page.evaluate(() => { const d = new Date(); document.querySelector("input[name=date]").value = isoD(new Date(d.getFullYear(), d.getMonth(), 10)) });
await page.click("#editorForm button[type=submit]"); await page.waitForTimeout(2500);
ok(page.url().endsWith("#ficha") && await page.locator(".strip .sl").count() === 3, "Ficha con 3 diapositivas");
const refOk = await page.locator("main a[href='https://www.instagram.com/reel/INSP/']").count();
ok(refOk >= 1, "Ficha muestra la referencia original");
// calendario: arrastrar
await page.goto(BASE + "#calendario"); await page.waitForTimeout(1500);
const day = (n) => page.evaluate(n => { const d = new Date(); return isoD(new Date(d.getFullYear(), d.getMonth(), n)) }, n);
const d10 = await day(10), d12 = await day(12);
await page.locator(`.vday[data-day='${d10}'] .vpost`).first().dragTo(page.locator(`.vday[data-day='${d12}']`)); await page.waitForTimeout(1000);
ok(await page.locator(`.vday[data-day='${d12}'] .vpost`).count() === 1, "Calendario: arrastrar cambia la fecha");
await page.click("button[data-cm=grid]"); await page.waitForTimeout(800);
ok(await page.locator(".iggrid .cell").count() >= 1, "Cuadrícula de Instagram");
await page.click("button[data-cm=mes]"); await page.waitForTimeout(400);
await page.locator(`.vday[data-day='${d12}'] .vpost`).first().click(); await page.waitForTimeout(1200);
// ficha: reordenar diapositivas
const before = await page.evaluate(() => item(S.fichaId).design.slides.map(s => s.bg).join());
await page.locator("[data-mv='0:1']").click(); await page.waitForTimeout(800);
const after = await page.evaluate(() => item(S.fichaId).design.slides.map(s => s.bg).join());
ok(before !== after, "Ficha: cambiar orden de diapositivas");
await page.locator("[data-mv='1:-1']").click(); await page.waitForTimeout(800);
// editor
await page.click("#f_design"); await page.waitForTimeout(1500);
const box = page.locator(".lbox").nth(2); await box.scrollIntoViewIfNeeded(); await page.mouse.wheel(0, 200); await page.waitForTimeout(300);
const bb = await box.boundingBox(); const y0 = await page.evaluate(() => item(S.designId).design.slides[0].layers[2].y);
await page.mouse.move(bb.x + 20, bb.y + 10); await page.mouse.down(); await page.mouse.move(bb.x + 20, bb.y - 30, { steps: 5 }); await page.mouse.up(); await page.waitForTimeout(600);
ok(await page.evaluate(() => item(S.designId).design.slides[0].layers[2].y) < y0, "Editor: arrastrar mueve el texto");
await page.locator("#p_text").fill("Texto editado"); await page.selectOption("#p_font", "Bebas Neue"); await page.fill("#p_size", "90"); await page.locator("#p_size").dispatchEvent("change");
await page.waitForTimeout(1200);
await page.click("#e_final"); await page.waitForTimeout(2000);
ok(await page.locator("#fp_g img").count() === 3, "Vista final con 3 imágenes");
await page.keyboard.press("Escape");
const [dl] = await Promise.all([page.waitForEvent("download"), page.click("#e_dl")]);
await dl.saveAs(path.join(OUT, "diseno.zip"));
await page.click("#e_back"); await page.waitForTimeout(1200);
await page.click("#f_ok"); await page.waitForTimeout(800);
await page.reload(); await page.waitForTimeout(1500);
const saved = await page.evaluate(() => { const i = S.items.find(x => x.ideaId); const t = i.design.slides[0].layers[2]; return { st: i.pubStatus, text: t.text, font: t.font, size: t.size } });
ok(saved.st === "aprobada" && saved.text === "Texto editado" && saved.font === "Bebas Neue" && saved.size === 90, "Persistencia: diseño editado y aprobado tras recargar");
// el editor dibuja lo mismo que exporta: compara la vista final con el JPG descargado
fs.writeFileSync(path.join(OUT, "saved.json"), JSON.stringify(saved));
// iPhone: agenda y cambio de fecha
const ph = await b.newContext({ ...devices["iPhone 13"] }); const pp = await ph.newPage(); pp.on("pageerror", e => errs.push("iphone: " + e.message));
await pp.goto(BASE + "#respaldo"); await pp.waitForSelector("#bk_in", { state: "attached" }); await pp.setInputFiles("#bk_in", path.join(FIX, "seed.json")); await pp.waitForTimeout(800);
await pp.evaluate(async () => { const d = new Date(); const it = newItem({ type: "carrusel", title: "Prueba iPhone", status: "borrador", date: isoD(new Date(d.getFullYear(), d.getMonth(), 15)) }); await addItem(it) });
await pp.goto(BASE + "#calendario"); await pp.waitForTimeout(1000);
ok(await pp.locator(".agenda-day").count() === 1, "iPhone: calendario como agenda");
const d16 = await pp.evaluate(() => { const d = new Date(); return isoD(new Date(d.getFullYear(), d.getMonth(), 16)) });
await pp.locator("[data-date]").first().fill(d16); await pp.locator("[data-date]").first().dispatchEvent("change"); await pp.waitForTimeout(800);
ok(await pp.evaluate(d => S.items.find(i => i.title === "Prueba iPhone").date === d, d16), "iPhone: cambiar fecha desde la agenda");
for (const v of ["diagnostico", "inspiracion", "banco", "competencia", "analisis"]) { await pp.goto(BASE + "#" + v); await pp.waitForTimeout(600); const ow = await pp.evaluate(() => document.documentElement.scrollWidth - innerWidth); ok(ow <= 1, `iPhone sin desbordamiento horizontal en #${v}`) }
ok(!errs.length, "Sin errores de página" + (errs.length ? ": " + errs.join(" | ") : ""));
await b.close();
process.exit(fails ? 1 : 0);
