// Aprobación técnica de prueba, piezas incompletas y «Ver inspiración original».
import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const [BASE, TMP] = process.argv.slice(2);
let fails = 0;
const ok = (c, m) => { console.log((c ? "OK    " : "FALLA ") + m); if (!c) fails++; };
const ref = { kind: "inspiracion", id: "insp-a", label: "@creadora · Planeación", url: "https://www.instagram.com/reel/AAA111/" };
const seed = {
  app: "balloon-store-content-hq", version: 1,
  inspo: [{ id: "insp-a", url: ref.url, title: "Referencia de prueba", creator: "@creadora", type: "reel", status: "adaptar", createdAt: "2026-11-20T10:00:00Z" }],
  ideabank: [
    { id: "idea-a", hook: "Idea normal", status: "nueva", refs: [ref], createdAt: "2026-11-20T10:00:00Z" },
    { id: "idea-b", hook: "Idea de prueba", status: "nueva", refs: [ref], createdAt: "2026-11-20T10:00:00Z" }],
  items: [{ id: "it-a", type: "carrusel", status: "borrador", pubStatus: "pendiente", date: "2026-12-04", title: "Pieza incompleta", refs: [ref],
            pending: ["Diapositiva 2: foto real del globo X", "Foto real del montaje completo"] }],
};
const f = path.join(TMP, "seed-ajustes.json"); fs.writeFileSync(f, JSON.stringify(seed));
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: 1280, height: 900 } });
const errs = []; page.on("pageerror", e => errs.push(e.message));
await page.goto(BASE + "#respaldo"); await page.waitForSelector("#bk_in", { state: "attached" });
await page.setInputFiles("#bk_in", f); await page.waitForTimeout(1200);

// 1. Aprobación normal (la dueña) vs. modo de prueba
await page.goto(BASE + "#hoy"); await page.goto(BASE + "#banco"); await page.waitForTimeout(600);
ok(await page.locator("#testbar").count() === 0, "Sin modo de prueba no hay aviso");
await page.locator(".icard", { hasText: "Idea normal" }).locator("[data-bap]").click(); await page.waitForTimeout(500);
let a = await page.evaluate(() => S.ideabank.find(x => x.id === "idea-a"));
ok(a.status === "aprobada" && a.approvedAt && !a.testApproval, "Aprobación normal: queda como aprobación de la dueña");
await page.goto(BASE + "?prueba=1#banco"); await page.waitForTimeout(900);
ok(await page.locator("#testbar").isVisible(), "Modo de prueba: aviso visible");
await page.locator(".icard", { hasText: "Idea de prueba" }).locator("[data-bap]").click(); await page.waitForTimeout(500);
const t = await page.evaluate(() => ({ x: S.ideabank.find(x => x.id === "idea-b"), l: S.learnings.slice() }));
ok(t.x.status === "aprobada" && !t.x.approvedAt && t.x.testApproval && /técnica de prueba/.test(t.x.testApproval.type), "Modo de prueba: aprobación técnica separada, sin approvedAt");
ok(t.l.some(l => l.kind === "prueba técnica" && /no es de la dueña/.test(l.text)) && t.l.some(l => l.kind === "decisión" && /Idea normal/.test(l.text)), "Registro: prueba técnica separada de la decisión de la dueña");
ok(/Aprobación técnica de prueba/.test(await page.locator(".icard", { hasText: "Idea de prueba" }).innerText()), "Banco: la idea muestra «Aprobación técnica de prueba»");
ok(!/Aprobación técnica/.test(await page.locator(".icard", { hasText: "Idea normal" }).innerText()), "Banco: la idea aprobada por la dueña no lleva ese aviso");

// 2. Pieza incompleta
await page.goto(BASE + "#calendario"); await page.waitForTimeout(600);
await page.evaluate(() => { S.fichaId = "it-a"; location.hash = "#ficha"; }); await page.waitForTimeout(900);
let txt = await page.locator("main").innerText();
ok(/Incompleta · falta material/.test(txt) && !/Pendiente\b(?! de)/.test(txt.split("\n").slice(0, 4).join(" ")), "Ficha: estado «Incompleta · falta material», no «Pendiente»");
ok(/Borrador incompleto: no está listo para publicar/.test(txt) && txt.includes("Diapositiva 2: foto real del globo X") && txt.includes("Foto real del montaje completo"), "Ficha: lista exacta del material que falta");
ok(await page.locator("#f_ok").isDisabled() && await page.locator("#f_pub").isDisabled(), "No se puede aprobar ni marcar como publicada mientras falte material");

// 3. Ver inspiración original + enlace externo conservado
ok(await page.locator("main a", { hasText: "Publicación original" }).getAttribute("href") === ref.url, "Se conserva el enlace a la publicación original");
await page.click("[data-goinsp=insp-a]"); await page.waitForTimeout(900);
ok(page.url().endsWith("#insp") && (await page.locator("main").innerText()).includes("Referencia de prueba"), "«Ver inspiración original» abre su ficha dentro de Content HQ");

// Completar material
await page.evaluate(() => { S.fichaId = "it-a"; location.hash = "#ficha"; }); await page.waitForTimeout(900);
await page.locator("[data-pdone]").first().click(); await page.waitForTimeout(700);
await page.locator("[data-pdone]").first().click(); await page.waitForTimeout(700);
const it = await page.evaluate(() => S.items.find(x => x.id === "it-a"));
ok(it.pending.length === 0 && it.status === "borrador" && (it.log || []).filter(l => /Material agregado/.test(l.what)).length === 2, "«Ya lo agregué» quita cada pendiente, lo registra y la pieza sigue en borrador");
txt = await page.locator("main").innerText();
ok(!/Incompleta/.test(txt) && !(await page.locator("#f_ok").isDisabled()), "Sin pendientes: vuelve a «Pendiente» de aprobación y se puede aprobar");
ok(errs.length === 0, "Sin errores de página " + errs.join(" | "));
await b.close();
console.log(fails ? fails + " fallas" : "ajustes OK"); process.exit(fails ? 1 : 0);
