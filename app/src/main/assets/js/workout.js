"use strict";
/* Active workout: logging screen, rest timer, exercise picker and finishing flow. */

const SET_TYPES = { n: "Normal", w: "Aquecimento", d: "Drop set", f: "Até a falha" };
const UNIT = { w: "Reps", t: "Seg", m: "Min" };

function startWorkout(rid, fromSession) {
  if (S.active) { toast("Você já tem um treino em andamento", "info"); openWk(); return; }
  const r = S.routines.find(x => x.id == rid);
  let ex = [];
  if (r) ex = r.ex.map(e => ({ id: e.id, rest: +e.rest || S.settings.rest, reps: e.reps, note: "", sets: Array.from({ length: +e.sets || 3 }, () => ({ t: "n", w: "", r: "", ok: false })) }));
  else if (fromSession) ex = fromSession.ex.map(e => ({ id: e.id, rest: S.settings.rest, reps: "", note: "", sets: e.sets.map(x => ({ t: x.t || "n", w: "", r: "", ok: false })) }));
  S.active = { id: uid(), rid: r ? r.id : fromSession ? fromSession.rid : null, name: r ? r.name : fromSession ? fromSession.name : "Treino livre", start: Date.now(), ex };
  save(); buzz(20); openWk();
}
function openWk() { closeAll(); UI.wkOpen = true; $("#wk").classList.add("open"); $("#wk").scrollTop = 0; renderWk(); render(); keepAwake(true); }
function minimizeWk() { UI.wkOpen = false; $("#wk").classList.remove("open"); $("#rest").classList.remove("on"); render(); }

function renderWk() {
  const a = S.active, w = $("#wk");
  if (!a || !UI.wkOpen) { w.classList.remove("open"); w.innerHTML = ""; return; }
  const y = w.scrollTop, st = sesStats(a);
  w.innerHTML = `<div class="wh"><button class="ib clear" data-a="wkmin" aria-label="Minimizar">${ic("down")}</button>
    <div class="grow"><div class="ell" style="font-weight:700;font-size:15px">${esc(a.name)}</div><div class="wclock gold" id="wkc">${clock((Date.now() - a.start) / 1000)}</div></div>
    <button class="ib" data-a="restpick" aria-label="Timer de descanso">${ic("clock")}</button>
    <button class="btn sm" data-a="wkfinish">Finalizar</button></div>
  <div class="wb">
    <div class="wsum"><div><b>${tons(st.vol)}</b>Volume</div><div><b>${st.sets}</b>Séries</div><div><b>${a.ex.length}</b>Exercícios</div></div>
    ${a.ex.map(exBlock).join("") || emptyState("dumb", "Treino vazio", "Adicione os exercícios que você vai fazer hoje.")}
    <button class="btn block ghost mt" data-a="wkadd">${ic("plus", "s")} Adicionar exercício</button>
    <button class="btn block danger mt" data-a="wkdiscard">Descartar treino</button>
  </div>`;
  w.scrollTop = y;
  restShow();
}

function exBlock(e, i) {
  const x = exById(e.id), k = x.k, prev = lastSets(e.id, S.active.start), allOk = e.sets.length && e.sets.every(s => s.ok);
  let n = 0;
  const rows = e.sets.map((s, j) => {
    const p = prev[j], label = s.t == "n" ? ++n : s.t.toUpperCase();
    const pt = p ? (k == "w" ? `${kg(p.w)} × ${p.r}` : `${p.r} ${UNIT[k].toLowerCase()}`) : "—";
    return `<div class="srow ${s.ok ? "ok" : ""}"><button class="stype ${s.t}" data-a="stype" data-x="${i}" data-j="${j}" aria-label="Tipo da série">${label}</button>
      <div class="prev">${pt}${s.pr ? '<span class="prb">PR</span>' : ""}</div>
      ${k == "w" ? `<input inputmode="decimal" placeholder="${p ? kg(p.w) : ""}" value="${esc(s.w)}" data-i="sv" data-x="${i}" data-j="${j}" data-f="w" aria-label="Carga em kg">` : ""}
      <input inputmode="numeric" placeholder="${p ? p.r : esc(lowTarget(e.reps))}" value="${esc(s.r)}" data-i="sv" data-x="${i}" data-j="${j}" data-f="r" aria-label="${UNIT[k]}">
      <button class="ck" data-a="sck" data-x="${i}" data-j="${j}" aria-label="Concluir série">${ic("check", "s")}</button></div>`;
  }).join("");
  return `<div class="ex ${allOk ? "done" : ""}">
    <div class="exh"><div class="grow"><div class="t">${esc(x.n)}</div><div class="d"><span class="mdot" style="background:${mColor(x.m)}"></span>${mName(x.m)}${e.reps ? " · meta " + esc(e.reps) + (k == "w" ? " reps" : "") : ""}</div></div>
    <button class="ib sm clear" data-a="exmenu" data-x="${i}" aria-label="Opções do exercício">${ic("more")}</button></div>
    ${e.note != null && e.note !== "" || e.noteOpen ? `<div class="exnote"><input value="${esc(e.note)}" placeholder="Anotação (ex: banco na posição 3)" data-i="exnote" data-x="${i}"></div>` : ""}
    <div class="sets ${k == "w" ? "" : "t2"}"><div class="h">Série</div><div class="h">Anterior</div>${k == "w" ? '<div class="h">kg</div>' : ""}<div class="h">${UNIT[k]}</div><div class="h">${ic("check", "xs")}</div>${rows}</div>
    <div class="exf"><button class="btn sec2 sm" data-a="sadd" data-x="${i}">${ic("plus", "s")} Série</button><button class="btn sec2 sm" data-a="exrest" data-x="${i}">${ic("clock", "s")} ${clock(e.rest || 0)}</button></div>
  </div>`;
}

/* ---------- rest timer ---------- */
const R = { end: 0, total: 0, t: null };
function startRest(sec) {
  if (!sec || sec <= 0) return;
  R.total = sec; R.end = Date.now() + sec * 1000;
  try { N && N.restAlarm(sec, !!S.settings.sound, !!S.settings.vib); } catch (e) { }
  const el = $("#rest");
  el.innerHTML = `<div class="grow"><div class="xs mut" style="font-weight:600">DESCANSO</div><div class="rt" id="rtt"></div><div class="rp"><i id="rtp"></i></div></div>
    <button class="ib" data-a="radj" data-v="-15" aria-label="Menos 15 segundos">−15</button><button class="ib" data-a="radj" data-v="15" aria-label="Mais 15 segundos">+15</button><button class="btn sm" data-a="radj" data-v="0">Pular</button>`;
  clearInterval(R.t); R.t = setInterval(restTick, 250); restTick(); restShow();
}
function restShow() { $("#rest").classList.toggle("on", !!R.end && UI.wkOpen); }
function restTick() {
  const left = (R.end - Date.now()) / 1000;
  if (left <= 0) { stopRest(true); return; }
  const t = $("#rtt"), p = $("#rtp"), m = $("#minirest");
  if (t) t.textContent = clock(Math.ceil(left));
  if (p) p.style.width = (100 * left / R.total) + "%";
  if (m) m.textContent = "Descanso " + clock(Math.ceil(left));
}
function stopRest(done) {
  clearInterval(R.t); R.end = 0; restShow();
  const m = $("#minirest"); if (m) m.textContent = "";
  if (done) { if (!N) { beep(); buzz([250, 120, 250]); } toast("Descanso concluído. Próxima série!", "bolt", "gold"); }
  else { try { N && N.restAlarm(0, false, false); } catch (e) { } }
}
function adjustRest(v) {
  if (!R.end) return;
  if (v == 0) { stopRest(false); return; }
  R.end += v * 1000; R.total = Math.max(R.total + v, 1);
  const left = (R.end - Date.now()) / 1000;
  if (left <= 0) { stopRest(false); return; }
  try { N && N.restAlarm(Math.ceil(left), !!S.settings.sound, !!S.settings.vib); } catch (e) { }
  restTick();
}

/* ---------- set actions ---------- */
function checkSet(xi, j) {
  const a = S.active, e = a.ex[xi], s = e.sets[j], x = exById(e.id);
  if (s.ok) { s.ok = false; s.pr = false; save(); renderWk(); return; }
  const p = lastSets(e.id, a.start)[j], before = e.sets[j - 1];
  if (x.k == "w" && s.w === "") s.w = p ? String(p.w) : before && before.w !== "" ? before.w : "";
  if (s.r === "") s.r = p ? String(p.r) : before && before.r !== "" ? before.r : lowTarget(e.reps);
  if (num(s.r) <= 0) { toast("Informe as " + (x.k == "w" ? "repetições" : x.k == "t" ? "segundos" : "minutos"), "info"); renderWk(); return; }
  s.ok = true; s.pr = false;
  if (x.k == "w" && s.t != "w" && num(s.w) > 0) {
    const rec = records(e.id, a.start), E = e1rm(num(s.w), num(s.r));
    const sessBest = Math.max(0, ...e.sets.filter(o => o !== s && o.ok && o.t != "w").map(o => e1rm(num(o.w), num(o.r))));
    if (rec.e > 0 && E > rec.e && E > sessBest) {
      e.sets.forEach(o => o.pr = false); s.pr = true;
      toast("Novo recorde em " + x.n + "!", "trophy", "gold"); buzz([40, 60, 40]);
    }
  }
  save(); buzz(18); renderWk();
  startRest(e.rest);
}

function addExercises(ids) {
  for (const id of ids) S.active.ex.push({ id, rest: S.settings.rest, reps: "", note: "", sets: Array.from({ length: 3 }, () => ({ t: "n", w: "", r: "", ok: false })) });
  save(); renderWk();
  setTimeout(() => { const w = $("#wk"); w.scrollTo({ top: w.scrollHeight, behavior: "smooth" }); }, 50);
}

function exMenu(xi) {
  const e = S.active.ex[xi], x = exById(e.id), last = S.active.ex.length - 1;
  sheet(() => `${sheetHead(esc(x.n), mName(x.m) + " · " + x.eq)}
    <div class="card tight">
      <button class="item" data-a="exhist" data-id="${x.id}">${ic("chart")}<div class="grow t">Histórico e recordes</div></button>
      <button class="item" data-a="exnoteon" data-x="${xi}">${ic("note")}<div class="grow t">Adicionar anotação</div></button>
      <button class="item" data-a="exrest" data-x="${xi}">${ic("clock")}<div class="grow t">Tempo de descanso</div><span class="mut">${clock(e.rest)}</span></button>
      <button class="item" data-a="exswap" data-x="${xi}">${ic("swap")}<div class="grow t">Substituir exercício</div></button>
      ${xi > 0 ? `<button class="item" data-a="exmove" data-x="${xi}" data-v="-1">${ic("up")}<div class="grow t">Mover para cima</div></button>` : ""}
      ${xi < last ? `<button class="item" data-a="exmove" data-x="${xi}" data-v="1">${ic("dn")}<div class="grow t">Mover para baixo</div></button>` : ""}
      <button class="item badc" data-a="exdel" data-x="${xi}">${ic("trash")}<div class="grow t">Remover exercício</div></button>
    </div>`);
}

function restSheet(cur, onPick, title = "Tempo de descanso") {
  const opts = [0, 30, 45, 60, 75, 90, 120, 150, 180, 240, 300];
  sheet(() => `${sheetHead(title)}<div class="g3">${opts.map(v => `<button class="opt ${v == cur ? "on" : ""}" style="justify-content:center;margin:0" data-a="restset" data-v="${v}"><b class="num" style="font-size:20px">${v ? clock(v) : "Sem"}</b></button>`).join("")}</div>`, { pick: onPick });
}

function setTypeSheet(xi, j) {
  const s = S.active.ex[xi].sets[j];
  sheet(() => `${sheetHead("Série " + (j + 1))}<div class="card tight">${Object.entries(SET_TYPES).map(([k, v]) => `<button class="item" data-a="stset" data-x="${xi}" data-j="${j}" data-v="${k}"><span class="stype ${k}" style="width:34px;display:grid;place-items:center">${k == "n" ? "1" : k.toUpperCase()}</span><div class="grow t">${v}</div>${s.t == k ? ic("check", "gold") : ""}</button>`).join("")}
    <button class="item badc" data-a="sdel" data-x="${xi}" data-j="${j}">${ic("trash")}<div class="grow t">Remover série</div></button></div>`);
}

/* ---------- finishing ---------- */
function computePRs(a) {
  const out = [];
  for (const e of a.ex) {
    const x = exById(e.id); if (x.k != "w") continue;
    const sets = e.sets.filter(s => (s.ok === undefined || s.ok) && s.t != "w" && num(s.w) > 0);
    if (!sets.length) continue;
    const rec = records(e.id, a.start); if (!rec.e && !rec.w) continue;
    const bw = Math.max(...sets.map(s => num(s.w))), be = Math.max(...sets.map(s => e1rm(num(s.w), num(s.r))));
    if (be > rec.e) out.push({ id: e.id, k: "e", v: Math.round(be * 10) / 10 });
    if (bw > rec.w) out.push({ id: e.id, k: "w", v: bw });
  }
  return out;
}
function routineChanged(a) {
  const r = S.routines.find(x => x.id == a.rid); if (!r) return false;
  if (r.ex.length != a.ex.length) return true;
  return a.ex.some((e, i) => e.id != r.ex[i].id || e.sets.length != r.ex[i].sets || e.rest != r.ex[i].rest);
}
const FIN = { note: "", upd: false };
function finishWorkout() {
  const a = S.active, done = a.ex.reduce((n, e) => n + e.sets.filter(s => s.ok).length, 0);
  if (!done) { confirmDlg("Nenhuma série concluída", "Toque no ✓ das séries que você fez para salvar o treino. Deseja descartar este treino?", "Descartar", discardWorkout); return; }
  const pending = a.ex.reduce((n, e) => n + e.sets.filter(s => !s.ok).length, 0);
  FIN.note = ""; FIN.upd = false;
  sheet(() => {
    const st = sesStats(a), prs = computePRs({ ...a, ex: a.ex.map(e => ({ ...e, sets: e.sets.filter(s => s.ok) })) });
    return `${sheetHead("Finalizar treino?")}
      <div class="g3"><div class="stat"><div class="v">${dur((Date.now() - a.start) / 1000)}</div><div class="l">Duração</div></div><div class="stat"><div class="v">${tons(st.vol)}</div><div class="l">Volume</div></div><div class="stat"><div class="v">${st.sets}</div><div class="l">Séries</div></div></div>
      ${pending ? `<p class="mut sm mt">${plural(pending, "série não marcada será descartada", "séries não marcadas serão descartadas")}.</p>` : ""}
      ${prs.length ? `<div class="card hl"><div class="row" style="margin-bottom:6px">${ic("trophy", "gold")}<b>${plural(prs.length, "recorde novo", "recordes novos")}</b></div>${prs.map(p => `<div class="sm">${esc(exById(p.id).n)}: ${p.k == "e" ? "1RM estimado " : "maior carga "}<b>${kg(p.v)} kg</b></div>`).join("")}</div>` : ""}
      <div class="field"><label>Como foi o treino?</label><textarea data-i="fnote" placeholder="Opcional: energia, dores, observações" style="min-height:70px">${esc(FIN.note)}</textarea></div>
      ${routineChanged(a) ? `<div class="row sb card" style="padding:12px 14px"><div><b>Atualizar a rotina</b><div class="mut sm">Salvar exercícios e séries de hoje em "${esc(a.name)}"</div></div>${toggle(FIN.upd, "finupd")}</div>` : ""}
      <button class="btn block lg mt" data-a="wksave">${ic("check")} Salvar treino</button>
      <button class="btn block sec2 mt" data-a="close">Continuar treinando</button>`;
  });
}
function saveWorkout() {
  const a = S.active, end = Date.now();
  const ses = {
    id: a.id, rid: a.rid, name: a.name, start: a.start, end, note: FIN.note.trim(),
    ex: a.ex.map(e => ({ id: e.id, sets: e.sets.filter(s => s.ok).map(s => ({ t: s.t, w: num(s.w), r: num(s.r), pr: !!s.pr })) })).filter(e => e.sets.length)
  };
  ses.prs = computePRs(ses);
  if (FIN.upd) {
    const r = S.routines.find(x => x.id == a.rid);
    if (r) r.ex = a.ex.map(e => { const o = r.ex.find(z => z.id == e.id); return { id: e.id, sets: e.sets.length, reps: e.reps || (o && o.reps) || "10-12", rest: e.rest }; });
  }
  S.sessions.push(ses); S.active = null; flush();
  stopRest(false); keepAwake(false); closeAll();
  UI.wkOpen = false; renderWk(); UI.tab = "home"; UI.stack = []; render(true); scrollTo(0, 0);
  celebrate(ses);
}
function discardWorkout() {
  S.active = null; save(); stopRest(false); keepAwake(false); closeAll();
  UI.wkOpen = false; renderWk(); render(); toast("Treino descartado", "trash");
}
function celebrate(ses) {
  const st = sesStats(ses), days = trainedDays(), w = countWeek(weekStart(today()), days), f = S.profile.freq;
  buzz([30, 50, 30, 50, 60]);
  sheet(() => `<div style="text-align:center;padding:10px 0 4px">
    <div class="logo" style="margin:0 auto 14px">${ic("trophy", "l")}</div>
    <h3 style="font-size:30px">Treino concluído!</h3>
    <p class="mut" style="margin:4px 0 16px">${S.profile.name ? "Mandou bem, " + esc(S.profile.name) + "." : "Mandou bem."} ${w >= f ? "Meta da semana batida!" : `Faltam ${plural(f - w, "treino", "treinos")} para a meta da semana.`}</p></div>
    <div class="g3"><div class="stat"><div class="v">${dur(st.dur)}</div><div class="l">Duração</div></div><div class="stat"><div class="v">${tons(st.vol)}</div><div class="l">Volume</div></div><div class="stat"><div class="v">${st.sets}</div><div class="l">Séries</div></div></div>
    ${ses.prs.length ? `<div class="card hl">${[...new Set(ses.prs.map(p => p.id))].map(id => `<div class="row" style="margin:4px 0">${ic("trophy", "s gold")}<span class="grow sm">${esc(exById(id).n)}</span><b class="sm">${ses.prs.filter(p => p.id == id).map(p => kg(p.v) + " kg" + (p.k == "e" ? " 1RM" : "")).join(" · ")}</b></div>`).join("")}</div>` : ""}
    <button class="btn block lg mt2" data-a="close">Fechar</button>`);
}

/* ---------- exercise picker ---------- */
const LB = { q: "", m: "", sel: [], mode: "browse", cb: null };
function openLib(mode, cb) {
  LB.q = ""; LB.m = ""; LB.sel = []; LB.mode = mode; LB.cb = cb;
  sheet(() => `${sheetHead(mode == "browse" ? "Exercícios" : mode == "swap" ? "Substituir por" : "Adicionar exercícios")}
    <div class="search">${ic("search", "s")}<input id="libq" data-i="libq" placeholder="Buscar exercício" value="${esc(LB.q)}" autocomplete="off"></div>
    <div class="chips" id="libm">${libChips()}</div>
    <div id="libl">${libList()}</div>
    <button class="btn block sec2 mt" data-a="newex">${ic("plus", "s")} Criar exercício personalizado</button>
    ${mode == "pick" ? `<div style="position:sticky;bottom:calc(-18px - var(--sab));padding:12px 0 calc(var(--sab) + 4px);margin-top:8px;background:var(--bg2)"><button class="btn block lg" data-a="libok" id="libok" ${LB.sel.length ? "" : "disabled"}>${libOkLabel()}</button></div>` : ""}`, { full: true });
}
const libOkLabel = () => LB.sel.length ? `Adicionar ${plural(LB.sel.length, "exercício", "exercícios")}` : "Selecione exercícios";
const libChips = () => `<button class="chip ${LB.m ? "" : "on"}" data-a="libm" data-v="">Todos</button>` + Object.keys(MUSCLES).filter(m => m != "outro" || S.exercises.some(e => e.m == "outro")).map(m => `<button class="chip ${LB.m == m ? "on" : ""}" data-a="libm" data-v="${m}"><span class="dot" style="background:${mColor(m)}"></span>${mName(m)}</button>`).join("");
function libList() {
  const q = norm(LB.q.trim());
  let list = allExercises().filter(e => (!LB.m || e.m == LB.m) && (!q || norm(e.n + " " + mName(e.m) + " " + e.eq).includes(q)));
  list.sort((a, b) => a.n.localeCompare(b.n, "pt-BR"));
  let recent = "";
  if (!q && !LB.m) {
    const seen = []; for (const s of sorted()) for (const e of s.ex) if (!seen.includes(e.id) && seen.length < 6) seen.push(e.id);
    if (seen.length) recent = `<div class="mut xs" style="font-weight:700;letter-spacing:.6px;margin:8px 2px 0">RECENTES</div><div class="card tight">${seen.map(id => libItem(exById(id))).join("")}</div><div class="mut xs" style="font-weight:700;letter-spacing:.6px;margin:14px 2px 0">TODOS</div>`;
  }
  if (!list.length) return emptyState("search", "Nada encontrado", "Tente outro nome ou crie um exercício personalizado.");
  return recent + `<div class="card tight">${list.map(libItem).join("")}</div>`;
}
function libItem(e) {
  const on = LB.sel.includes(e.id);
  return `<button class="item" data-a="libpick" data-id="${e.id}"><div class="av" style="color:${mColor(e.m)};background:color-mix(in srgb, ${mColor(e.m)} 16%, transparent)">${esc(e.n[0])}</div><div class="grow"><div class="t">${esc(e.n)}</div><div class="d">${mName(e.m)} · ${e.eq}${e.id[0] == "c" && !LIB[e.id] ? " · personalizado" : ""}</div></div>${LB.mode == "pick" ? `<span class="ib sm ${on ? "gold" : ""}" style="pointer-events:none">${ic(on ? "check" : "plus", "s")}</span>` : ic("chev", "s chev")}</button>`;
}
function newExerciseSheet(onDone) {
  const f = { n: LB.q || "", m: LB.m || "peito", eq: "Halter", k: "w" };
  sheet(() => `${sheetHead("Novo exercício")}
    <div class="field"><label>Nome</label><input id="nxn" value="${esc(f.n)}" placeholder="Ex: Supino com pegada neutra"></div>
    <div class="g2"><div class="field"><label>Músculo</label><select id="nxm">${Object.keys(MUSCLES).map(m => `<option value="${m}" ${m == f.m ? "selected" : ""}>${mName(m)}</option>`).join("")}</select></div>
    <div class="field"><label>Equipamento</label><select id="nxe">${EQUIP.map(q => `<option ${q == f.eq ? "selected" : ""}>${q}</option>`).join("")}</select></div></div>
    <div class="field"><label>Registro</label><select id="nxk">${Object.entries(KINDS).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
    <button class="btn block lg mt" data-a="nxsave">Salvar exercício</button>`, { focus: "#nxn", done: onDone });
}
