"use strict";
/* Onboarding, event wiring, actions and startup. */

/* ---------- onboarding ---------- */
const OB = { step: 0, p: null, tpl: "keep" };
const OB_STEPS = 6;
function openOb() {
  OB.step = 0; OB.p = { ...S.profile }; OB.tpl = S.migrated ? "keep" : "abc";
  $("#ob").classList.add("open"); renderOb();
}
function renderOb() {
  const s = OB.step, p = OB.p, el = $("#ob");
  const nav = (label = "Continuar", dis = false) => `<div class="row mt2">${s > 0 ? `<button class="ib" data-a="obprev" aria-label="Voltar">${ic("back")}</button>` : ""}<button class="btn lg grow" data-a="obnext" ${dis ? "disabled" : ""}>${label}</button></div>`;
  const prog = `<div class="prog">${[...Array(OB_STEPS)].map((_, i) => `<i class="${i < s ? "on" : ""}"></i>`).join("")}</div>`;
  let body = "";
  if (s == 0) body = `<div class="welcome"><div class="logo">${ic("dumb", "l")}</div><h1>Seu treino.<br><span class="gold">Sua evolução.</span></h1><p class="mut" style="font-size:16px;margin:0 0 18px">Registre cada série, bata recordes e acompanhe sua alimentação em um só lugar.</p>
    ${[["bolt", "Registro rápido", "Timer de descanso automático e cargas do treino anterior a um toque."], ["trophy", "Recordes e gráficos", "1RM estimado, volume e evolução de cada exercício."], ["food", "Nutrição e corpo", "Calorias, macros, água, peso e medidas."]].map(([i, t, d]) => `<div class="feat"><div class="av">${ic(i, "s")}</div><div><b>${t}</b><div class="mut sm">${d}</div></div></div>`).join("")}
    ${S.migrated ? `<div class="card hl sm" style="width:100%">${ic("shield", "s gold")} Seus treinos e registros da versão anterior foram mantidos.</div>` : ""}</div>
    <button class="btn lg block" data-a="obnext">Começar</button>`;
  else if (s == 1) body = `${prog}<div class="obc"><h1>Como podemos te chamar?</h1><p class="mut">Seu nome aparece só neste aparelho.</p><input id="ob_name" value="${esc(p.name)}" placeholder="Seu nome" style="font-size:20px;padding:16px" autocomplete="given-name"></div>${nav()}`;
  else if (s == 2) body = `${prog}<div class="obc"><h1>Qual é o seu objetivo?</h1><p class="mut">Usamos isso para calcular suas metas.</p>${Object.entries(GOALS).map(([k, g]) => `<button class="opt ${p.goal == k ? "on" : ""}" data-a="obgoal" data-v="${k}"><div class="av">${ic({ hipertrofia: "dumb", definicao: "flame", recomposicao: "swap", forca: "bolt" }[k], "s")}</div><div class="grow"><div class="t">${g[0]}</div><div class="d">${g[1]}</div></div>${p.goal == k ? ic("check", "gold") : ""}</button>`).join("")}</div>${nav()}`;
  else if (s == 3) body = `${prog}<div class="obc"><h1>Sobre você</h1><p class="mut">Para estimar seu gasto calórico.</p>
    <div class="field"><label>Sexo</label><div class="seg" style="margin:0">${[["m", "Masculino"], ["f", "Feminino"]].map(([k, l]) => `<button class="${p.sex == k ? "on" : ""}" data-a="obsex" data-v="${k}">${l}</button>`).join("")}</div></div>
    <div class="g3"><div class="field"><label>Idade</label><input id="ob_age" inputmode="numeric" value="${p.age}"></div><div class="field"><label>Altura (cm)</label><input id="ob_height" inputmode="numeric" value="${p.height}"></div><div class="field"><label>Peso (kg)</label><input id="ob_weight" inputmode="decimal" value="${fmt(latestWeight() || p.weight, 1)}"></div></div></div>${nav()}`;
  else if (s == 4) body = `${prog}<div class="obc"><h1>Sua rotina</h1><p class="mut">Quantos dias por semana você quer treinar?</p>
    <div class="chips" style="margin:6px 0 16px;padding:0">${[2, 3, 4, 5, 6].map(n => `<button class="chip ${p.freq == n ? "on" : ""}" style="flex:1;justify-content:center;font-size:17px;padding:12px 0" data-a="obfreq" data-v="${n}">${n}x</button>`).join("")}</div>
    <p class="mut" style="margin-bottom:4px">Nível de atividade no dia a dia</p>${ACTIVITY.map(a => `<button class="opt ${p.activity == a[0] ? "on" : ""}" data-a="obact" data-v="${a[0]}"><div class="grow"><div class="t">${a[1]}</div><div class="d">${a[2]}</div></div>${p.activity == a[0] ? ic("check", "gold") : ""}</button>`).join("")}</div>${nav()}`;
  else if (s == 5) body = `${prog}<div class="obc"><h1>Escolha um programa</h1><p class="mut">Você pode editar tudo depois.</p>
    ${S.migrated ? `<button class="opt ${OB.tpl == "keep" ? "on" : ""}" data-a="obtpl" data-v="keep"><div class="av">${ic("shield", "s")}</div><div class="grow"><div class="t">Manter meus treinos atuais</div><div class="d">${S.routines.map(r => esc(r.name.split("·")[0].trim())).join(", ")}</div></div>${OB.tpl == "keep" ? ic("check", "gold") : ""}</button>` : ""}
    ${TEMPLATES.map(t => `<button class="opt ${OB.tpl == t.id ? "on" : ""}" data-a="obtpl" data-v="${t.id}"><div class="av">${ic("layers", "s")}</div><div class="grow"><div class="t">${t.n}</div><div class="d">${t.d}</div></div>${OB.tpl == t.id ? ic("check", "gold") : ""}</button>`).join("")}</div>${nav()}`;
  else {
    const g = calcGoals(p);
    body = `${prog}<div class="obc"><h1>Tudo pronto${p.name ? ", " + esc(p.name) : ""}!</h1><p class="mut">Suas metas diárias para ${GOALS[p.goal][0].toLowerCase()}:</p>
    <div class="hero" style="text-align:center"><div class="mut sm">Calorias por dia</div><div class="num gold" style="font-size:56px;line-height:1">${fmt(g.kcal)}</div><div class="mut sm">kcal</div></div>
    <div class="g3">${[["Proteína", g.p], ["Carboidrato", g.c], ["Gordura", g.f]].map(([l, v]) => `<div class="stat" style="text-align:center"><div class="v">${v}<small>g</small></div><div class="l" style="justify-content:center">${l}</div></div>`).join("")}</div>
    <div class="card row">${ic("drop", "gold")}<span class="sm">Beba cerca de <b>${fmt(g.water / 1000, 1)} litros</b> de água por dia.</span></div>
    <p class="mut xs">Estimativa pela equação de Mifflin-St Jeor. Ajuste quando quiser em Perfil.</p></div>${nav("Começar a treinar")}`;
  }
  el.innerHTML = `<div class="obw anim">${body}</div>`;
  const f = el.querySelector("input"); if (f && s == 1) setTimeout(() => f.focus(), 250);
}
function obCollect() {
  const p = OB.p, v = id => { const e = $("#" + id); return e ? e.value : null; };
  if (OB.step == 1) p.name = (v("ob_name") || "").trim().slice(0, 30);
  if (OB.step == 3) { p.age = clamp(parseInt(v("ob_age")) || 25, 12, 99); p.height = clamp(parseInt(v("ob_height")) || 170, 120, 230); p.weight = clamp(num(v("ob_weight")) || 70, 30, 300); }
}
function obFinish() {
  const p = OB.p; p.onboarded = true; S.profile = p; S.goals = calcGoals(p);
  if (OB.tpl != "keep") S.routines = fromTemplate(TEMPLATES.find(t => t.id == OB.tpl));
  if (!S.body.some(b => b.d == today()) && p.weight) S.body.push({ id: uid(), d: today(), w: p.weight });
  delete S.migrated; flush();
  $("#ob").classList.remove("open"); $("#ob").innerHTML = ""; go("home");
}

/* ---------- actions ---------- */
const routine = id => S.routines.find(r => r.id == id);
const A = {
  close: () => closeSheet(),
  dlgok: () => { const f = SH[SH.length - 1].o.ok; closeSheet(); f && f(); },
  back: () => pop(),
  tab: (el, d) => { closeAll(); go(d.v); },

  /* onboarding */
  obnext: () => { obCollect(); if (OB.step >= OB_STEPS) { obFinish(); return; } OB.step++; renderOb(); $("#ob").scrollTop = 0; },
  obprev: () => { obCollect(); OB.step = Math.max(0, OB.step - 1); renderOb(); },
  obgoal: (el, d) => { OB.p.goal = d.v; renderOb(); },
  obsex: (el, d) => { obCollect(); OB.p.sex = d.v; renderOb(); },
  obfreq: (el, d) => { OB.p.freq = +d.v; renderOb(); },
  obact: (el, d) => { OB.p.activity = +d.v; renderOb(); },
  obtpl: (el, d) => { OB.tpl = d.v; renderOb(); },

  /* home */
  gobody: () => { UI.prog = "corpo"; go("prog"); },
  gohist: () => { UI.prog = "hist"; go("prog"); },

  /* workout */
  start: (el, d) => startWorkout(d.r),
  wkopen: () => openWk(),
  wkmin: () => minimizeWk(),
  wkfinish: () => finishWorkout(),
  wksave: () => saveWorkout(),
  wkdiscard: () => confirmDlg("Descartar treino?", "Tudo que você registrou neste treino será perdido.", "Descartar", discardWorkout),
  wkadd: () => openLib("pick", ids => addExercises(ids)),
  finupd: el => { FIN.upd = !FIN.upd; el.classList.toggle("on", FIN.upd); },
  sck: (el, d) => checkSet(+d.x, +d.j),
  sadd: (el, d) => { const e = S.active.ex[d.x], l = e.sets[e.sets.length - 1]; e.sets.push({ t: "n", w: l ? l.w : "", r: l ? l.r : "", ok: false }); save(); buzz(10); renderWk(); },
  stype: (el, d) => setTypeSheet(+d.x, +d.j),
  stset: (el, d) => { S.active.ex[d.x].sets[d.j].t = d.v; save(); closeSheet(); renderWk(); },
  sdel: (el, d) => { S.active.ex[d.x].sets.splice(+d.j, 1); save(); closeSheet(); renderWk(); },
  exmenu: (el, d) => exMenu(+d.x),
  exhist: (el, d) => { const pg = { id: d.id, sheet: true }; closeAll(); sheet(() => pExercise(pg), { full: true }); },
  exnoteon: (el, d) => { const e = S.active.ex[d.x]; e.noteOpen = true; closeSheet(); renderWk(); const i = $(`#wk [data-i="exnote"][data-x="${d.x}"]`); i && i.focus(); },
  exrest: (el, d) => { const e = S.active.ex[d.x]; closeAll(); restSheet(e.rest, v => { e.rest = v; save(); renderWk(); }); },
  restset: (el, d) => { const f = SH[SH.length - 1].o.pick; closeSheet(); f && f(+d.v); },
  restpick: () => restSheet(R.end ? 0 : -1, v => { if (v) startRest(v); else stopRest(false); }, "Iniciar timer"),
  radj: (el, d) => adjustRest(+d.v),
  exswap: (el, d) => { const xi = +d.x; closeAll(); openLib("swap", ids => { const e = S.active.ex[xi]; e.id = ids[0]; e.sets.forEach(s => { s.w = ""; s.ok = false; s.pr = false; }); save(); renderWk(); }); },
  exmove: (el, d) => { const a = S.active.ex, i = +d.x, j = i + +d.v;[a[i], a[j]] = [a[j], a[i]]; save(); closeSheet(); renderWk(); },
  exdel: (el, d) => { closeSheet(); confirmDlg("Remover exercício?", "As séries registradas dele neste treino serão perdidas.", "Remover", () => { S.active.ex.splice(+d.x, 1); save(); renderWk(); }); },
  noop: () => { },

  /* library */
  lib: () => openLib("browse"),
  libm: (el, d) => { LB.m = d.v; $("#libm").innerHTML = libChips(); $("#libl").innerHTML = libList(); },
  libpick: (el, d) => {
    if (LB.mode == "browse") { closeAll(); push({ p: "ex", id: d.id }); return; }
    if (LB.mode == "swap") { const cb = LB.cb; closeSheet(); cb && cb([d.id]); return; }
    const i = LB.sel.indexOf(d.id); i < 0 ? LB.sel.push(d.id) : LB.sel.splice(i, 1); buzz(8);
    $$(`[data-a="libpick"][data-id="${CSS.escape(d.id)}"]`).forEach(b => b.outerHTML = libItem(exById(d.id)));
    const ok = $("#libok"); if (ok) { ok.disabled = !LB.sel.length; ok.innerHTML = libOkLabel(); }
  },
  libok: () => { const cb = LB.cb, ids = LB.sel.slice(); closeSheet(); cb && cb(ids); },
  newex: () => newExerciseSheet(),
  nxsave: () => {
    const n = $("#nxn").value.trim(); if (!n) { toast("Dê um nome ao exercício", "info"); return; }
    const e = { id: "c" + uid(), n, m: $("#nxm").value, eq: $("#nxe").value, k: $("#nxk").value };
    S.exercises.push(e); save(); closeSheet(); toast("Exercício criado");
    if (LB.mode == "pick") LB.sel.push(e.id);
    LB.q = ""; const q = $("#libq"); if (q) q.value = ""; LB.m = "";
    const l = $("#libl"); if (l) { $("#libm").innerHTML = libChips(); l.innerHTML = libList(); }
    const ok = $("#libok"); if (ok) { ok.disabled = !LB.sel.length; ok.innerHTML = libOkLabel(); }
  },
  exdetail: (el, d) => { closeAll(); if (UI.wkOpen) minimizeWk(); push({ p: "ex", id: d.id }); },
  exremove: (el, d) => confirmDlg("Excluir exercício?", "Ele sai da biblioteca e das rotinas. Treinos antigos continuam salvos.", "Excluir", () => { S.exercises = S.exercises.filter(e => e.id != d.id); S.routines.forEach(r => r.ex = r.ex.filter(e => e.id != d.id)); save(); pop(); }),
  chm: (el, d) => { UI.chart = d.v; SH.length ? refresh() : render(); },

  /* routines */
  rnew: () => { const r = { id: uid(), name: "Nova rotina", ex: [] }; S.routines.push(r); save(); push({ p: "routine", id: r.id }); setTimeout(() => openLib("pick", ids => { r.ex.push(...ids.map(id => ({ id, sets: 3, reps: exById(id).k == "w" ? "10-12" : exById(id).k == "t" ? "30" : "20", rest: S.settings.rest }))); save(); render(); }), 350); },
  redit: (el, d) => push({ p: "routine", id: d.id }),
  rmenu: (el, d) => { const r = routine(d.id); sheet(() => `${sheetHead(esc(r.name))}<div class="card tight">
    <button class="item" data-a="start" data-r="${r.id}">${ic("play")}<div class="grow t">Começar treino</div></button>
    <button class="item" data-a="rmedit" data-id="${r.id}">${ic("edit")}<div class="grow t">Editar</div></button>
    <button class="item" data-a="rdup" data-id="${r.id}">${ic("copy")}<div class="grow t">Duplicar</div></button>
    <button class="item badc" data-a="rdel" data-id="${r.id}">${ic("trash")}<div class="grow t">Excluir rotina</div></button></div>`); },
  rmedit: (el, d) => { closeSheet(); const t = UI.stack[UI.stack.length - 1]; if (!(t && t.p == "routine")) push({ p: "routine", id: d.id }); },
  rdup: (el, d) => { const r = routine(d.id), c = JSON.parse(JSON.stringify(r)); c.id = uid(); c.name = r.name + " (cópia)"; S.routines.splice(S.routines.indexOf(r) + 1, 0, c); save(); closeSheet(); render(); toast("Rotina duplicada", "copy"); },
  rdel: (el, d) => { closeSheet(); confirmDlg("Excluir rotina?", "O histórico de treinos feitos com ela continua salvo.", "Excluir", () => { S.routines = S.routines.filter(r => r.id != d.id); save(); if (UI.stack.length) pop(); else render(); toast("Rotina excluída", "trash"); }); },
  rmove: (el, d) => { const a = routine(d.id).ex, i = +d.x, j = i + +d.v; if (j < 0 || j >= a.length) return;[a[i], a[j]] = [a[j], a[i]]; save(); render(); },
  rdelx: (el, d) => { routine(d.id).ex.splice(+d.x, 1); save(); render(); },
  rsets: (el, d) => { const e = routine(d.id).ex[d.x]; e.sets = clamp((+e.sets || 0) + +d.v, 1, 12); save(); render(); },
  raddx: (el, d) => { const r = routine(d.id); openLib("pick", ids => { r.ex.push(...ids.map(id => ({ id, sets: 3, reps: exById(id).k == "w" ? "10-12" : exById(id).k == "t" ? "30" : "20", rest: S.settings.rest }))); save(); render(); }); },
  tpl: (el, d) => templateSheet(d.id),
  tpladd: (el, d) => { S.routines.push(...fromTemplate(TEMPLATES.find(t => t.id == d.id))); save(); closeAll(); render(); toast("Programa adicionado às suas rotinas"); },
  tplrep: (el, d) => confirmDlg("Substituir rotinas?", "Suas rotinas atuais serão trocadas por este programa. O histórico de treinos não é apagado.", "Substituir", () => { S.routines = fromTemplate(TEMPLATES.find(t => t.id == d.id)); save(); closeAll(); render(); toast("Programa aplicado"); }),
  orm: () => ormSheet(),
  plates: () => platesSheet(),

  /* progress */
  pseg: (el, d) => { UI.prog = d.v; render(); },
  calm: (el, d) => { const [y, m] = UI.cm.split("-").map(Number); UI.cm = iso(new Date(y, m - 1 + +d.v, 1)).slice(0, 7); render(); },
  calday: (el, d) => { const s = sorted().find(x => dayOf(x.start) == d.v); if (s) push({ p: "ses", id: s.id }); },
  ses: (el, d) => { closeAll(); push({ p: "ses", id: d.id }); },
  sesmenu: (el, d) => sheet(() => `${sheetHead("Opções do treino")}<div class="card tight"><button class="item" data-a="repeat" data-id="${d.id}">${ic("copy")}<div class="grow t">Repetir este treino</div></button><button class="item badc" data-a="sesdel" data-id="${d.id}">${ic("trash")}<div class="grow t">Excluir do histórico</div></button></div>`),
  sesdel: (el, d) => { closeSheet(); confirmDlg("Excluir treino?", "Ele será removido do histórico e dos recordes.", "Excluir", () => { S.sessions = S.sessions.filter(s => s.id != d.id); save(); pop(); toast("Treino excluído", "trash"); }); },
  repeat: (el, d) => { closeAll(); const s = S.sessions.find(x => x.id == d.id), r = routine(s.rid); r ? startWorkout(r.id) : startWorkout(null, s); },
  bodyadd: () => bodySheet(),
  bodyedit: (el, d) => bodySheet(d.id),
  bsave: (el, d) => {
    const g = k => { const e = $("#b_" + k); return e ? num(e.value) : 0; }, dt = $("#b_d").value || today();
    const e = { id: d.id || uid(), d: dt, w: g("w") };
    for (const k of ["waist", "chest", "arm", "thigh", "hip", "bf"]) if (g(k)) e[k] = g(k);
    if (!e.w && Object.keys(e).length <= 3) { toast("Informe o peso ou alguma medida", "info"); return; }
    S.body = S.body.filter(b => b.id != e.id && !(b.d == dt && !d.id));
    S.body.push(e); if (e.w && dt >= (bodySorted().filter(b => b.w).pop() || { d: "" }).d) S.profile.weight = e.w;
    save(); closeSheet(); render(); toast("Registro salvo");
  },
  bdel: (el, d) => { S.body = S.body.filter(b => b.id != d.id); save(); closeSheet(); render(); },

  /* nutrition */
  nd: (el, d) => { const n = addDays(UI.nd, +d.v); if (n > today()) return; UI.nd = n; render(); },
  water: (el, d) => { const k = UI.nd; S.water[k] = Math.max(0, (S.water[k] || 0) + +d.v); save(); buzz(10); render(); if (+d.v > 0 && S.water[k] >= S.goals.water && S.water[k] - +d.v < S.goals.water) toast("Meta de água batida!", "drop", "gold"); },
  goals: () => goalsSheet(),
  gsave: () => { const g = id => Math.max(0, parseInt($("#" + id).value) || 0); S.goals = { kcal: g("gk") || 2000, p: g("gp"), c: g("gc"), f: g("gf"), water: g("gw") || 2000 }; save(); closeSheet(); render(); toast("Metas salvas"); },
  gcalc: () => { S.goals = calcGoals(S.profile); save(); closeSheet(); render(); toast("Metas recalculadas pelo seu perfil"); },
  foodadd: (el, d) => foodSheet(d.v),
  ftab: (el, d) => { FS.tab = d.v; refresh(); },
  fpick: (el, d) => { FS.sel = foodByName(d.n); FS.g = FS.sel.pg; refresh(); },
  fback: () => { FS.sel = null; refresh(); },
  fpor: (el, d) => { FS.g = +d.v; refresh(); },
  fmeal: (el, d) => { FS.g = num($("#fgr").value) || FS.g; FS.meal = d.v; refresh(); },
  fadd: () => {
    const f = FS.sel, g = num($("#fgr").value); if (g <= 0) { toast("Informe a quantidade", "info"); return; }
    const m = g / 100, d = UI.nd;
    (S.food[d] = S.food[d] || []).push({ id: uid(), meal: FS.meal, n: f.n, g, k: f.k * m, p: f.p * m, c: f.c * m, f: f.f * m });
    S.recentFoods = [f.n].concat(S.recentFoods.filter(n => n != f.n)).slice(0, 20);
    save(); closeAll(); render(); buzz(12); toast(f.n + " adicionado");
  },
  fnew: () => newFoodSheet(),
  nfsave: () => {
    const v = id => num($("#" + id).value), n = $("#nfn").value.trim(), pg = v("nfg") || 100, k = 100 / pg;
    if (!n) { toast("Dê um nome ao alimento", "info"); return; }
    const f = { id: uid(), n, pl: $("#nfp").value.trim() || "1 porção", pg, k: v("nfk") * k, p: v("nfpr") * k, c: v("nfc") * k, f: v("nff") * k };
    S.foods = S.foods.filter(x => x.n != n).concat(f); save(); closeSheet();
    FS.sel = f; FS.g = pg; refresh(); toast("Alimento criado");
  },
  foodedit: (el, d) => foodEditSheet(d.id),
  fesave: (el, d) => { const x = dayFood(UI.nd).find(z => z.id == d.id), f = foodByName(x.n), g = num($("#feg").value); if (!f || g <= 0) return; const m = g / 100; Object.assign(x, { g, k: f.k * m, p: f.p * m, c: f.c * m, f: f.f * m }); save(); closeSheet(); render(); },
  fedup: (el, d) => { const L = dayFood(UI.nd), x = L.find(z => z.id == d.id); L.push({ ...x, id: uid() }); save(); closeSheet(); render(); },
  fedel: (el, d) => { S.food[UI.nd] = dayFood(UI.nd).filter(z => z.id != d.id); if (!S.food[UI.nd].length) delete S.food[UI.nd]; save(); closeSheet(); render(); },
  copyday: () => { const y = dayFood(addDays(UI.nd, -1)); S.food[UI.nd] = y.map(x => ({ ...x, id: uid() })); save(); render(); toast("Refeições copiadas", "copy"); },

  /* profile & settings */
  settings: () => push({ p: "settings" }),
  profile: () => profileSheet(),
  pfsex: (el, d) => { $$("#pf_sex button").forEach(b => b.classList.toggle("on", b.dataset.v == d.v)); },
  pfrecalc: el => el.classList.toggle("on"),
  pfsave: () => {
    const p = S.profile, v = id => $("#pf_" + id).value;
    p.name = v("name").trim().slice(0, 30); p.sex = ($("#pf_sex .on") || {}).dataset.v || p.sex;
    p.age = clamp(parseInt(v("age")) || p.age, 12, 99); p.height = clamp(parseInt(v("height")) || p.height, 120, 230); p.weight = clamp(num(v("weight")) || p.weight, 30, 300);
    p.goal = v("goal"); p.activity = +$("#pf_act").value;
    if ($("#pf_rc").classList.contains("on")) S.goals = calcGoals(p);
    save(); closeSheet(); render(); toast("Perfil atualizado");
  },
  theme: (el, d) => { S.settings.theme = d.v; save(); applyTheme(); render(); },
  defrest: () => restSheet(S.settings.rest, v => { S.settings.rest = v || 60; save(); render(); }, "Descanso padrão"),
  freq: (el, d) => { S.profile.freq = clamp(S.profile.freq + +d.v, 1, 7); save(); render(); },
  tsound: () => { S.settings.sound = !S.settings.sound; save(); render(); if (S.settings.sound) beep(); },
  tvib: () => { S.settings.vib = !S.settings.vib; save(); render(); buzz(30); },
  tawake: () => { S.settings.awake = !S.settings.awake; save(); render(); },
  export: () => saveFile("meu-treino-backup-" + today() + ".json", JSON.stringify(S)),
  import: () => $("#impf").click(),
  reset: () => confirmDlg("Apagar todos os dados?", "Treinos, rotinas, registros de peso e alimentação serão apagados deste aparelho. Isso não pode ser desfeito.", "Apagar tudo", () => {
    confirmDlg("Tem certeza?", "Recomendamos exportar um backup antes.", "Sim, apagar", () => { S = base(); S.routines = fromTemplate(TEMPLATES[0]); flush(); UI.wkOpen = false; renderWk(); go("home"); openOb(); });
  })
};

const IN = {
  sv: (el, d) => { const s = S.active.ex[d.x].sets[d.j]; s[d.f] = el.value.replace(/[^\d.,]/g, ""); save(); },
  exnote: (el, d) => { S.active.ex[d.x].note = el.value; save(); },
  fnote: el => { FIN.note = el.value; },
  libq: el => { LB.q = el.value; $("#libl").innerHTML = libList(); },
  exq: el => { UI.exq = el.value; const ids = []; for (const s of sorted()) for (const e of s.ex) if (!ids.includes(e.id)) ids.push(e.id); const q = norm(UI.exq); $("#exlist").innerHTML = exRows(ids.filter(id => !q || norm(exById(id).n).includes(q))); },
  rname: (el, d) => { routine(d.id).name = el.value; save(); },
  rreps: (el, d) => { routine(d.id).ex[d.x].reps = el.value; save(); },
  fq: el => { FS.q = el.value; $("#fl").innerHTML = foodList(); },
  fg: el => { FS.g = num(el.value); $("#fprev").innerHTML = foodPrev(FS.sel, FS.g / 100); $$(".chip[data-a=fpor]").forEach(c => c.classList.toggle("on", +c.dataset.v == FS.g)); },
  orm: () => { $("#oout").innerHTML = ormOut(e1rm(num($("#ow").value), num($("#or").value))); },
  plates: () => { $("#plout").innerHTML = platesOut(); }
};
const CH = {
  rrest: (el, d) => { routine(d.id).ex[d.x].rest = +el.value; save(); },
  plates: () => { $("#plout").innerHTML = platesOut(); },
  impf: el => {
    const f = el.files && el.files[0]; if (!f) return;
    const rd = new FileReader();
    rd.onload = () => {
      let o; try { o = JSON.parse(rd.result); } catch (e) { toast("Arquivo inválido", "info"); return; }
      if (!o || !(o.sessions || o.logs)) { toast("Esse arquivo não é um backup do Meu Treino", "info"); return; }
      confirmDlg("Restaurar backup?", "Os dados atuais deste aparelho serão substituídos pelos do arquivo.", "Restaurar", () => {
        localStorage.setItem(KEY, JSON.stringify(o)); S = load(); S.profile.onboarded = true; delete S.migrated; flush(); applyTheme(); go("home"); toast("Backup restaurado");
      }, false);
    };
    rd.readAsText(f); el.value = "";
  }
};

document.addEventListener("click", e => {
  const el = e.target.closest("[data-a]"); if (!el || el.disabled) return;
  const fn = A[el.dataset.a]; if (fn) { e.preventDefault(); fn(el, el.dataset, e); }
});
document.addEventListener("input", e => { const el = e.target.closest("[data-i]"); if (el && IN[el.dataset.i]) IN[el.dataset.i](el, el.dataset, e); });
document.addEventListener("change", e => { const el = e.target.closest("[data-c]"); if (el && CH[el.dataset.c]) CH[el.dataset.c](el, el.dataset, e); });
document.addEventListener("keydown", e => { if (e.key == "Enter" && e.target.matches(".sets input")) { e.target.blur(); } if (e.key == "Escape") window.appBack(); });
document.addEventListener("focusin", e => { if (e.target.matches(".sets input")) setTimeout(() => e.target.select(), 0); });

/* Android back button: returns true when the app handled it. */
window.appBack = () => {
  if (SH.length) { closeSheet(); return true; }
  if ($("#ob").classList.contains("open")) { if (OB.step > 0) { A.obprev(); return true; } return false; }
  if (UI.wkOpen) { minimizeWk(); return true; }
  if (UI.stack.length) { pop(); return true; }
  if (UI.tab != "home") { go("home"); return true; }
  return false;
};

/* ---------- startup ---------- */
setInterval(() => {
  if (!S.active) return;
  const t = clock((Date.now() - S.active.start) / 1000), a = $("#wkc"), b = $("#minic");
  if (a) a.textContent = t; if (b) b.textContent = t;
}, 1000);
let lastDay = today();
document.addEventListener("visibilitychange", () => {
  if (document.hidden) return;
  if (R.end && R.end <= Date.now()) stopRest(false);
  if (today() != lastDay) { if (UI.nd == lastDay) UI.nd = today(); lastDay = today(); render(); }
});
matchMedia("(prefers-color-scheme: light)").addEventListener("change", () => { if (S.settings.theme == "auto") applyTheme(); });

applyTheme();
render();
if (S.active) keepAwake(true);
if (!S.profile.onboarded) openOb();
// Offline cache for the web/iPhone version; the Android app serves its files locally.
if (!N && "serviceWorker" in navigator && location.protocol == "https:") navigator.serviceWorker.register("sw.js").catch(() => { });
