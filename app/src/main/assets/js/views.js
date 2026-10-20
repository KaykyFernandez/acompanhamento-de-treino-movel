"use strict";
/* Tab views and stacked pages. Each returns an HTML string for #view. */

const UI = { tab: "home", stack: [], ys: [], prog: "geral", nd: today(), cm: today().slice(0, 7), wkOpen: false, chart: "e", exq: "" };
const TABS = [["home", "home", "Início"], ["train", "dumb", "Treinar"], ["prog", "chart", "Progresso"], ["food", "food", "Nutrição"], ["me", "user", "Perfil"]];

function render(anim) {
  const v = $("#view"), top = UI.stack[UI.stack.length - 1];
  v.innerHTML = top ? PAGES[top.p](top) : VIEWS[UI.tab]();
  v.className = (top ? "page" : "") + (S.active ? " has-mini" : "");
  if (anim) { v.classList.remove("anim"); void v.offsetWidth; v.classList.add("anim"); }
  $("#tabs").innerHTML = `<div class="in">${TABS.map(t => `<button class="${t[0] == UI.tab ? "on" : ""}" data-a="tab" data-v="${t[0]}" aria-label="${t[2]}"><span>${ic(t[1])}</span>${t[2]}</button>`).join("")}</div>`;
  const m = $("#mini");
  m.style.display = S.active && !UI.wkOpen ? "block" : "none";
  if (S.active && !UI.wkOpen) m.innerHTML = `<button data-a="wkopen"><span class="pulse"></span><div class="grow"><div class="ell">${esc(S.active.name)}</div><div class="xs" id="minirest" style="opacity:.75;font-weight:600"></div></div><span class="num" style="font-size:20px" id="minic">${clock((Date.now() - S.active.start) / 1000)}</span>${ic("chev", "s")}</button>`;
}
function go(tab) { UI.tab = tab; UI.stack = []; UI.ys = []; render(true); scrollTo(0, 0); }
function push(p) { UI.ys.push(scrollY); UI.stack.push(p); render(true); scrollTo(0, 0); }
function pop() { UI.stack.pop(); render(true); scrollTo(0, UI.ys.pop() || 0); }
const pageHead = (title, right = "") => `<div class="pagehead"><button class="ib clear" data-a="back" aria-label="Voltar">${ic("back")}</button><h1>${title}</h1>${right}</div>`;

/* ---------- Início ---------- */
function vHome() {
  const p = S.profile, h = new Date().getHours(), hi = h < 5 ? "Boa noite" : h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
  const ws = weekStart(today()), days = trainedDays(), wc = countWeek(ws, days), f = p.freq, st = streak();
  const strip = [...Array(7)].map((_, i) => { const d = addDays(ws, i), on = days.has(d); return `<div class="${on ? "on" : ""} ${d == today() ? "td" : ""}">${WD[(i + 1) % 7]}<i>${on ? ic("check", "xs") : D(d).getDate()}</i></div>`; }).join("");
  const nx = nextRoutine();
  let main;
  if (S.active) main = `<div class="card hl tap" data-a="wkopen"><span class="tag">${ic("bolt", "xs")} Em andamento</span><h2 style="font-size:24px;margin:8px 0 2px">${esc(S.active.name)}</h2><div class="mut sm">Começou às ${new Date(S.active.start).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</div><button class="btn block mt" data-a="wkopen">${ic("play", "s")} Continuar treino</button></div>`;
  else if (nx) main = `<div class="card hl"><span class="tag">${ic("target", "xs")} Próximo treino</span><h2 style="font-size:24px;margin:8px 0 6px">${esc(nx.name)}</h2>
    <div class="row" style="flex-wrap:wrap;gap:6px 12px">${routineMuscles(nx).slice(0, 4).map(m => `<span class="sm"><span class="mdot" style="background:${mColor(m)}"></span>${mName(m)}</span>`).join("")}</div>
    <div class="mut sm" style="margin-top:6px">${plural(nx.ex.length, "exercício", "exercícios")} · cerca de ${routineMinutes(nx)} min${lastDone(nx.id) ? " · último " + ago(lastDone(nx.id)) : ""}</div>
    <div class="row mt"><button class="btn grow" data-a="start" data-r="${nx.id}">${ic("play", "s")} Começar treino</button><button class="ib" data-a="tab" data-v="train" aria-label="Ver rotinas">${ic("list")}</button></div></div>`;
  else main = `<div class="card">${emptyState("dumb", "Monte sua primeira rotina", "Escolha um programa pronto ou crie o seu.", `<button class="btn" data-a="tab" data-v="train">Ver programas</button>`)}</div>`;

  const month = today().slice(0, 7), mSes = S.sessions.filter(s => dayOf(s.start).startsWith(month));
  const wSes = S.sessions.filter(s => dayOf(s.start) >= ws), wVol = wSes.reduce((t, s) => t + sesStats(s).vol, 0), wTime = wSes.reduce((t, s) => t + sesStats(s).dur, 0);
  const prs = sorted().filter(s => s.start > Date.now() - 30 * 864e5).flatMap(s => (s.prs || []).filter(p => p.k == "e").map(p => ({ ...p, d: dayOf(s.start) }))).slice(0, 3);
  const ft = foodTotals(today()), g = S.goals, lw = latestWeight(), last = sorted()[0];

  return `<div class="top"><div><div class="hello">${hi}${p.name ? ", " + esc(p.name) : ""}</div><h1>${longD(today()).replace(/^Hoje$/, "Hoje")}</h1></div><button class="ib" data-a="tab" data-v="me" aria-label="Perfil" style="border-radius:50%;background:var(--grad);color:var(--on);font:700 17px var(--fc)">${esc((p.name || "M")[0].toUpperCase())}</button></div>
  <div class="hero"><div class="row" style="gap:16px">${ring(wc / f, 92, 9, `<text x="46" y="44" text-anchor="middle" font-size="26">${wc}/${f}</text><text x="46" y="62" text-anchor="middle" font-size="11" style="fill:var(--mut);font-family:Barlow;font-weight:600">TREINOS</text>`)}
    <div class="grow"><div class="mut sm">Meta da semana</div><h2>${wc >= f ? "Meta batida!" : "Faltam " + plural(f - wc, "treino", "treinos")}</h2><div class="row sm" style="gap:6px">${ic("flame", "s gold")}<span>${st ? plural(st, "semana seguida", "semanas seguidas") + " na meta" : "Bata a meta para iniciar uma sequência"}</span></div></div></div>
    <div class="week">${strip}</div></div>
  ${main}
  <div class="g3"><div class="stat"><div class="ic">${ic("cal", "s")}</div><div class="v">${mSes.length}</div><div class="l">treinos no mês</div></div><div class="stat"><div class="ic">${ic("layers", "s")}</div><div class="v">${wVol >= 1000 ? fmt(wVol / 1000, 1) + "<small>t</small>" : fmt(wVol) + "<small>kg</small>"}</div><div class="l">volume semana</div></div><div class="stat"><div class="ic">${ic("clock", "s")}</div><div class="v">${Math.round(wTime / 60)}<small>min</small></div><div class="l">tempo semana</div></div></div>
  <div class="g2"><div class="card tap" style="margin:10px 0 0" data-a="tab" data-v="food"><div class="row sb"><span class="mut sm">Calorias hoje</span>${ic("food", "s gold")}</div><div class="num" style="font-size:26px;margin:6px 0 8px">${fmt(ft.k)}<span class="mut" style="font-size:14px"> / ${fmt(g.kcal)}</span></div><div class="bar"><i style="width:${clamp(ft.k / g.kcal * 100, 0, 100)}%"></i></div><div class="mut xs" style="margin-top:6px">Proteína ${fmt(ft.p)} de ${g.p} g</div></div>
  <div class="card tap" style="margin:10px 0 0" data-a="gobody"><div class="row sb"><span class="mut sm">Peso corporal</span>${ic("scale", "s gold")}</div><div class="num" style="font-size:26px;margin:6px 0 4px">${lw ? kg(lw) + '<span class="mut" style="font-size:14px"> kg</span>' : "—"}</div><div class="mut xs">${weightDelta() || "Toque para registrar"}</div></div></div>
  ${prs.length ? `<div class="sec"><h2>Recordes recentes</h2></div><div class="card tight">${prs.map(p => `<button class="item" data-a="exdetail" data-id="${p.id}"><div class="av">${ic("trophy", "s")}</div><div class="grow"><div class="t ell">${esc(exById(p.id).n)}</div><div class="d">1RM estimado · ${shortD(p.d)}</div></div><b class="num gold" style="font-size:20px">${kg(p.v)} kg</b></button>`).join("")}</div>` : ""}
  ${last ? `<div class="sec"><h2>Último treino</h2><button class="lnk" data-a="gohist">Histórico</button></div>${sesCard(last)}` : ""}`;
}
function weightDelta() {
  const b = bodySorted().filter(x => x.w); if (b.length < 2) return "";
  const l = b[b.length - 1], ref = b.filter(x => x.d <= addDays(l.d, -28)).pop() || b[0], d = l.w - ref.w;
  return `${d > 0 ? "+" : ""}${kg(d)} kg desde ${shortD(ref.d)}`;
}
function sesCard(s) {
  const st = sesStats(s);
  return `<button class="card tap" style="display:block;width:100%;text-align:left" data-a="ses" data-id="${s.id}"><div class="row sb"><b style="font-size:16px" class="ell">${esc(s.name)}</b>${(s.prs || []).length ? `<span class="tag">${ic("trophy", "xs")} ${s.prs.length}</span>` : ""}</div><div class="mut sm" style="margin:2px 0 10px">${longD(dayOf(s.start))}</div><div class="row" style="gap:18px"><span class="sm">${ic("clock", "xs")} ${st.dur ? dur(st.dur) : "—"}</span><span class="sm">${ic("layers", "xs")} ${tons(st.vol)}</span><span class="sm">${ic("check", "xs")} ${plural(st.sets, "série", "séries")}</span></div></button>`;
}

/* ---------- Treinar ---------- */
function vTrain() {
  return `<div class="top"><div><div class="hello">Planeje e execute</div><h1>Treinar</h1></div><button class="ib" data-a="lib" aria-label="Exercícios">${ic("search")}</button></div>
  ${S.active ? `<button class="btn block lg" data-a="wkopen">${ic("play", "s")} Continuar treino em andamento</button>` : `<button class="btn block lg sec2" data-a="start" data-r="">${ic("plus", "s")} Começar treino livre</button>`}
  <div class="sec"><h2>Minhas rotinas</h2><button class="lnk" data-a="rnew">+ Nova</button></div>
  ${S.routines.length ? S.routines.map(r => {
    const ld = lastDone(r.id);
    return `<div class="card"><div class="row"><div class="grow tap" data-a="redit" data-id="${r.id}" style="cursor:pointer"><b style="font-size:17px">${esc(r.name)}</b><div class="mut sm ell" style="margin-top:2px">${r.ex.map(e => esc(exById(e.id).n)).join(", ") || "Sem exercícios"}</div></div><button class="ib clear" data-a="rmenu" data-id="${r.id}" aria-label="Opções">${ic("more")}</button></div>
    <div class="row sb mt"><div class="mut xs">${plural(r.ex.length, "exercício", "exercícios")} · ~${routineMinutes(r)} min${ld ? " · " + ago(ld) : ""}</div><button class="btn sm" data-a="start" data-r="${r.id}">${ic("play", "xs")} Iniciar</button></div></div>`;
  }).join("") : `<div class="card">${emptyState("list", "Nenhuma rotina", "Crie uma rotina ou use um programa pronto abaixo.")}</div>`}
  <div class="sec"><h2>Programas prontos</h2></div>
  <div class="card tight">${TEMPLATES.map(t => `<button class="item" data-a="tpl" data-id="${t.id}"><div class="av">${ic("layers", "s")}</div><div class="grow"><div class="t">${t.n}</div><div class="d">${plural(t.r.length, "treino", "treinos")} · ${t.d.split(".")[0]}</div></div>${ic("chev", "s chev")}</button>`).join("")}</div>
  <div class="sec"><h2>Ferramentas</h2></div>
  <div class="g2"><button class="card tap" style="margin:0;text-align:left" data-a="orm"><div class="gold">${ic("calc")}</div><b style="display:block;margin-top:8px">Calculadora 1RM</b><span class="mut xs">Estime sua carga máxima</span></button><button class="card tap" style="margin:0;text-align:left" data-a="plates"><div class="gold">${ic("plate")}</div><b style="display:block;margin-top:8px">Anilhas</b><span class="mut xs">Quanto colocar na barra</span></button></div>`;
}

/* ---------- Progresso ---------- */
function vProg() {
  const segs = [["geral", "Geral"], ["ex", "Exercícios"], ["corpo", "Corpo"], ["hist", "Histórico"]];
  return `<div class="top"><div><div class="hello">Sua evolução</div><h1>Progresso</h1></div></div>
  <div class="seg">${segs.map(s => `<button class="${UI.prog == s[0] ? "on" : ""}" data-a="pseg" data-v="${s[0]}">${s[1]}</button>`).join("")}</div>
  ${({ geral: progGeral, ex: progEx, corpo: progBody, hist: progHist })[UI.prog]()}`;
}
function progGeral() {
  const ss = S.sessions, tot = ss.reduce((a, s) => { const t = sesStats(s); a.v += t.vol; a.d += t.dur; return a; }, { v: 0, d: 0 });
  const ws = weekStart(today());
  const weeks = [...Array(8)].map((_, i) => { const w = addDays(ws, (i - 7) * 7), e = addDays(w, 7); const list = ss.filter(s => { const d = dayOf(s.start); return d >= w && d < e; }); return { x: shortD(w).replace(" ", "/"), y: list.reduce((t, s) => t + sesStats(s).vol, 0), n: list.length }; });
  const since = Date.now() - 30 * 864e5, mus = {};
  for (const s of ss) if (s.start > since) for (const e of s.ex) { const m = exById(e.id).m; mus[m] = (mus[m] || 0) + e.sets.filter(x => x.t != "w").length; }
  const mk = Object.keys(mus).sort((a, b) => mus[b] - mus[a]), mmax = Math.max(1, ...Object.values(mus));
  const [y, m] = UI.cm.split("-").map(Number), nd = new Date(y, m, 0).getDate(), off = (new Date(y, m - 1, 1).getDay() + 6) % 7, days = trainedDays();
  let cells = ""; for (let i = 0; i < off; i++) cells += "<i></i>";
  for (let d = 1; d <= nd; d++) { const k = UI.cm + "-" + pad(d), on = days.has(k); cells += `<button class="d ${on ? "on" : ""} ${k == today() ? "td" : ""} ${k > today() ? "fu" : ""}" ${on ? `data-a="calday" data-v="${k}"` : ""} aria-label="${d}${on ? ", treinou" : ""}">${d}</button>`; }
  const monthCount = [...days].filter(d => d.startsWith(UI.cm)).length;
  return `<div class="g3 mt"><div class="stat"><div class="v">${ss.length}</div><div class="l">treinos</div></div><div class="stat"><div class="v">${Math.round(tot.d / 3600)}<small>h</small></div><div class="l">treinando</div></div><div class="stat"><div class="v">${tot.v >= 1000 ? fmt(tot.v / 1000, 1) + "<small>t</small>" : fmt(tot.v) + "<small>kg</small>"}</div><div class="l">levantados</div></div></div>
  <div class="card"><div class="row sb"><b>Volume por semana</b><span class="mut xs">últimas 8 semanas</span></div><div class="mt">${barChart(weeks, { fmt: v => v >= 1000 ? fmt(v / 1000, 1) + "t" : fmt(v), label: "Volume semanal" })}</div><div class="mut xs">Esta semana: ${plural(weeks[7].n, "treino", "treinos")}, ${tons(weeks[7].y)}.</div></div>
  <div class="card"><div class="row sb"><b>Séries por músculo</b><span class="mut xs">últimos 30 dias</span></div>${mk.length ? mk.map(k => `<div class="macro"><div class="row sb"><span><span class="mdot" style="background:${mColor(k)}"></span>${mName(k)}</span><b>${mus[k]}</b></div><div class="bar"><i style="width:${mus[k] / mmax * 100}%;background:${mColor(k)}"></i></div></div>`).join("") : `<p class="mut sm">Conclua treinos para ver quais músculos você mais trabalha. O ideal para hipertrofia é entre 10 e 20 séries por músculo na semana.</p>`}</div>
  <div class="card"><div class="row sb mb"><button class="ib sm" data-a="calm" data-v="-1" aria-label="Mês anterior">${ic("back", "s")}</button><b style="text-transform:capitalize">${MN[m - 1]} ${y}</b><button class="ib sm" data-a="calm" data-v="1" aria-label="Próximo mês">${ic("chev", "s")}</button></div>
  <div class="cal">${["S", "T", "Q", "Q", "S", "S", "D"].map(x => `<span class="w">${x}</span>`).join("")}${cells}</div><div class="mut sm mt">${plural(monthCount, "dia treinado", "dias treinados")} no mês.</div></div>`;
}
function progEx() {
  const ids = []; for (const s of sorted()) for (const e of s.ex) if (!ids.includes(e.id)) ids.push(e.id);
  const q = norm(UI.exq), list = ids.filter(id => !q || norm(exById(id).n).includes(q));
  if (!ids.length) return `<div class="card">${emptyState("chart", "Sem dados ainda", "Seus exercícios aparecem aqui depois do primeiro treino salvo.")}</div>`;
  return `<div class="search mt">${ic("search", "s")}<input data-i="exq" placeholder="Buscar exercício" value="${esc(UI.exq)}"></div>
  <div class="card tight" id="exlist">${exRows(list)}</div>`;
}
function exRows(list) {
  return list.map(id => { const x = exById(id), r = records(id), h = exHistory(id); return `<button class="item" data-a="exdetail" data-id="${id}"><span class="dot" style="background:${mColor(x.m)}"></span><div class="grow"><div class="t ell">${esc(x.n)}</div><div class="d">${plural(h.length, "treino", "treinos")} · último ${ago(dayOf(h[h.length - 1].s.start))}</div></div>${x.k == "w" && r.e ? `<div style="text-align:right"><b class="num" style="font-size:18px">${kg(Math.round(r.e))}</b><div class="mut xs">1RM est.</div></div>` : ""}${ic("chev", "s chev")}</button>`; }).join("") || `<p class="mut sm" style="padding:12px 16px">Nenhum exercício com esse nome.</p>`;
}
function progBody() {
  const b = bodySorted(), w = b.filter(x => x.w), pts = w.slice(-30).map(x => ({ x: shortD(x.d), y: x.w }));
  const trend = pts.map((_, i) => { const s = pts.slice(Math.max(0, i - 6), i + 1); return s.reduce((t, p) => t + p.y, 0) / s.length; });
  const meas = [["waist", "Cintura"], ["chest", "Peito"], ["arm", "Braço"], ["thigh", "Coxa"], ["hip", "Quadril"], ["bf", "Gordura", "%"]];
  const lastM = k => { const e = b.filter(x => x[k]); return e.length ? [e[e.length - 1][k], e.length > 1 ? e[e.length - 1][k] - e[0][k] : null] : null; };
  const goal = S.profile.goal;
  return `<div class="card mt"><div class="row sb"><div><div class="mut sm">Peso atual</div><div class="num" style="font-size:36px">${w.length ? kg(w[w.length - 1].w) + '<span class="mut" style="font-size:16px"> kg</span>' : "—"}</div><div class="mut xs">${weightDelta()}</div></div><button class="btn sm" data-a="bodyadd">${ic("plus", "s")} Registrar</button></div>
  <div class="mt">${lineChart(pts, { unit: "kg", trend: pts.length > 2 ? trend : null, label: "Peso corporal", empty: "Registre seu peso em dias diferentes para ver a evolução." })}</div>
  ${pts.length > 2 ? `<div class="legend"><span><span class="mdot" style="background:var(--gold)"></span>Peso</span><span><span class="mdot" style="background:var(--blue)"></span>Média de 7 registros</span></div>` : ""}
  <p class="mut xs" style="margin:10px 0 0">${goal == "definicao" ? "Para definir sem perder músculo, mire em 0,5% a 1% do peso por semana." : goal == "hipertrofia" ? "Para ganhar massa com pouca gordura, mire em 0,25 a 0,5 kg por mês." : "Pese-se sempre no mesmo horário, de preferência ao acordar."}</p></div>
  <div class="sec"><h2>Medidas</h2><button class="lnk" data-a="bodyadd">+ Adicionar</button></div>
  <div class="g3">${meas.map(([k, l, u]) => { const v = lastM(k); return `<div class="stat"><div class="v" style="font-size:24px">${v ? fmt(v[0], 1) + `<small>${u || "cm"}</small>` : "—"}</div><div class="l">${l}${v && v[1] ? ` <span class="${(v[1] < 0) == (k == "waist" || k == "bf" || k == "hip") ? "okc" : "badc"}">${v[1] > 0 ? "+" : ""}${fmt(v[1], 1)}</span>` : ""}</div></div>`; }).join("")}</div>
  ${b.length ? `<div class="sec"><h2>Registros</h2></div><div class="card tight">${b.slice().reverse().slice(0, 30).map(x => `<button class="item" data-a="bodyedit" data-id="${x.id}"><div class="grow"><div class="t">${x.w ? kg(x.w) + " kg" : "Medidas"}</div><div class="d">${longD(x.d)}${meas.filter(m => x[m[0]]).map(m => " · " + m[1] + " " + fmt(x[m[0]], 1)).join("")}</div></div>${ic("chev", "s chev")}</button>`).join("")}</div>` : ""}`;
}
function progHist() {
  const ss = sorted();
  if (!ss.length) return `<div class="card">${emptyState("cal", "Nenhum treino salvo", "Comece um treino e finalize para ele aparecer aqui.", `<button class="btn" data-a="tab" data-v="train">Começar</button>`)}</div>`;
  let out = "", mo = "";
  for (const s of ss.slice(0, 120)) {
    const d = dayOf(s.start), k = d.slice(0, 7);
    if (k != mo) { mo = k; const [y, m] = k.split("-"); const c = ss.filter(x => dayOf(x.start).startsWith(k)).length; out += `<div class="sec"><h2 style="text-transform:capitalize">${MN[+m - 1]} ${y}</h2><span class="mut sm">${plural(c, "treino", "treinos")}</span></div>`; }
    out += sesCard(s);
  }
  return out;
}

/* ---------- Nutrição ---------- */
function vFood() {
  const d = UI.nd, t = foodTotals(d), g = S.goals, left = g.kcal - t.k, list = dayFood(d), wt = S.water[d] || 0;
  const macro = (l, v, goal, col) => `<div class="macro"><div class="row sb"><span>${l}</span><span><b>${fmt(v)}</b><span class="mut"> / ${goal} g</span></span></div><div class="bar"><i style="width:${clamp(v / goal * 100, 0, 100)}%;${col ? "background:" + col : ""}"></i></div></div>`;
  const yest = dayFood(addDays(d, -1));
  return `<div class="top"><div><div class="hello">Alimentação</div><h1>Nutrição</h1></div><button class="ib" data-a="goals" aria-label="Metas">${ic("target")}</button></div>
  <div class="row sb card" style="padding:8px"><button class="ib clear" data-a="nd" data-v="-1" aria-label="Dia anterior">${ic("back")}</button><b style="text-transform:capitalize">${longD(d)}</b><button class="ib clear" data-a="nd" data-v="1" aria-label="Próximo dia" ${d >= today() ? "disabled style='opacity:.3'" : ""}>${ic("chev")}</button></div>
  <div class="card"><div class="row" style="gap:18px">${ring(t.k / g.kcal, 124, 11, `<text x="62" y="60" text-anchor="middle" font-size="30">${fmt(Math.abs(left))}</text><text x="62" y="80" text-anchor="middle" font-size="11" style="fill:var(--mut);font-family:Barlow;font-weight:600">${left >= 0 ? "KCAL RESTANTES" : "KCAL ACIMA"}</text>`)}
  <div class="grow"><div class="row sb sm"><span class="mut">Meta</span><b>${fmt(g.kcal)}</b></div><div class="row sb sm" style="margin:4px 0"><span class="mut">Consumido</span><b>${fmt(t.k)}</b></div><div class="row sb sm"><span class="mut">Restante</span><b class="${left < 0 ? "badc" : "okc"}">${fmt(left)}</b></div></div></div>
  ${macro("Proteína", t.p, g.p, "linear-gradient(90deg,#f2865e,#ef6f8e)")}${macro("Carboidrato", t.c, g.c, "linear-gradient(90deg,#5aa9e6,#3fbfae)")}${macro("Gordura", t.f, g.f, "")}</div>
  <div class="card"><div class="row sb"><div class="row">${ic("drop", "")}<div><b>Água</b><div class="mut sm">${fmt(wt / 1000, 2)} de ${fmt(g.water / 1000, 1)} litros</div></div></div><div class="row" style="gap:6px"><button class="ib sm" data-a="water" data-v="-250" aria-label="Remover 250 ml">${ic("minus", "s")}</button><button class="btn sm" data-a="water" data-v="250">+250 ml</button></div></div><div class="bar mt"><i style="width:${clamp(wt / g.water * 100, 0, 100)}%;background:linear-gradient(90deg,#5aa9e6,#7fd0ff)"></i></div></div>
  ${!list.length && yest.length ? `<button class="btn block ghost" data-a="copyday">${ic("copy", "s")} Copiar refeições do dia anterior</button>` : ""}
  ${MEALS.map(([k, n]) => { const items = list.filter(x => x.meal == k), kc = items.reduce((a, x) => a + x.k, 0); return `<div class="card" style="padding:12px 0 4px"><div class="row sb" style="padding:0 12px 0 16px"><div><b style="font-size:16px">${n}</b><div class="mut xs">${items.length ? fmt(kc) + " kcal · P " + fmt(items.reduce((a, x) => a + x.p, 0)) + " g" : "Nada registrado"}</div></div><button class="ib sm gold" data-a="foodadd" data-v="${k}" aria-label="Adicionar em ${n}">${ic("plus", "s")}</button></div>
  ${items.length ? `<div style="margin-top:6px">${items.map(x => `<button class="item" style="min-height:50px;padding:9px 16px" data-a="foodedit" data-id="${x.id}"><div class="grow"><div class="t ell" style="font-size:15px">${esc(x.n)}</div><div class="d">${x.g ? fmt(x.g) + " g" : esc(x.q || "")} · P ${fmt(x.p, 1)} · C ${fmt(x.c, 1)} · G ${fmt(x.f, 1)}</div></div><b class="num" style="font-size:17px">${fmt(x.k)}</b></button>`).join("")}</div>` : `<div style="height:8px"></div>`}</div>`; }).join("")}
  <p class="mut xs" style="text-align:center;margin:14px 20px">Valores nutricionais aproximados. Para um plano alimentar individual, procure um nutricionista.</p>`;
}

/* ---------- Perfil ---------- */
function vMe() {
  const p = S.profile, g = GOALS[p.goal] || GOALS.hipertrofia, ss = S.sessions.length;
  const since = S.sessions.length ? Math.min(...S.sessions.map(s => s.start)) : S.created;
  return `<div class="top"><h1>Perfil</h1></div>
  <div class="hero"><div class="row" style="gap:14px"><div class="logo" style="width:64px;height:64px;border-radius:50%;font:700 28px var(--fc)">${esc((p.name || "M")[0].toUpperCase())}</div><div class="grow"><h2 style="font-size:26px">${esc(p.name || "Atleta")}</h2><div class="mut sm">${g[0]} · ${p.freq}x por semana</div><div class="mut xs">Treinando desde ${new Date(since).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}</div></div></div>
  <div class="g3 mt"><div><div class="num" style="font-size:24px">${ss}</div><div class="mut xs">treinos</div></div><div><div class="num" style="font-size:24px">${streak()}</div><div class="mut xs">semanas na meta</div></div><div><div class="num" style="font-size:24px">${S.sessions.reduce((n, s) => n + (s.prs || []).filter(x => x.k == "e").length, 0)}</div><div class="mut xs">recordes</div></div></div></div>
  <div class="card tight">
    <button class="item" data-a="profile">${ic("user")}<div class="grow"><div class="t">Dados pessoais e objetivo</div><div class="d">${kg(p.weight)} kg · ${p.height} cm · ${p.age} anos</div></div>${ic("chev", "s chev")}</button>
    <button class="item" data-a="goals">${ic("target")}<div class="grow"><div class="t">Metas de nutrição</div><div class="d">${fmt(S.goals.kcal)} kcal · ${S.goals.p} g de proteína</div></div>${ic("chev", "s chev")}</button>
    <button class="item" data-a="settings">${ic("gear")}<div class="grow"><div class="t">Configurações</div><div class="d">Descanso, sons, tema</div></div>${ic("chev", "s chev")}</button>
    <button class="item" data-a="lib">${ic("dumb")}<div class="grow"><div class="t">Biblioteca de exercícios</div><div class="d">${allExercises().length} exercícios</div></div>${ic("chev", "s chev")}</button>
  </div>
  <div class="sec"><h2>Seus dados</h2></div>
  <div class="card tight">
    <button class="item" data-a="export">${ic("dl")}<div class="grow"><div class="t">Exportar backup</div><div class="d">Salva um arquivo com todos os seus dados</div></div></button>
    <button class="item" data-a="import">${ic("ul")}<div class="grow"><div class="t">Restaurar backup</div><div class="d">Importa um arquivo exportado antes</div></div></button>
    <button class="item badc" data-a="reset">${ic("trash")}<div class="grow"><div class="t">Apagar todos os dados</div></div></button>
  </div>
  <input type="file" id="impf" accept="application/json,.json,text/plain" hidden data-c="impf">
  <p class="mut xs" style="text-align:center;margin:18px 0">Meu Treino ${VERSION} · Seus dados ficam só neste aparelho.</p>`;
}

const VIEWS = { home: vHome, train: vTrain, prog: vProg, food: vFood, me: vMe };

/* ---------- pages ---------- */
function pRoutine(pg) {
  const r = S.routines.find(x => x.id == pg.id); if (!r) return pageHead("Rotina") + emptyState("info", "Rotina não encontrada", "");
  const rests = [30, 45, 60, 75, 90, 120, 150, 180, 240, 300];
  return pageHead("Editar rotina", `<button class="ib clear" data-a="rmenu" data-id="${r.id}" aria-label="Opções">${ic("more")}</button>`) +
    `<div class="field"><label>Nome da rotina</label><input value="${esc(r.name)}" data-i="rname" data-id="${r.id}" style="font-weight:700;font-size:18px"></div>
    <div class="mut sm">${plural(r.ex.length, "exercício", "exercícios")} · ${r.ex.reduce((t, e) => t + (+e.sets || 0), 0)} séries · cerca de ${routineMinutes(r)} min</div>
    ${r.ex.map((e, i) => { const x = exById(e.id); return `<div class="card"><div class="row"><span class="dot" style="background:${mColor(x.m)}"></span><div class="grow"><b class="ell" style="display:block">${esc(x.n)}</b><div class="mut xs">${mName(x.m)} · ${x.eq}</div></div>
      <button class="ib sm clear" data-a="rmove" data-id="${r.id}" data-x="${i}" data-v="-1" ${i ? "" : "disabled style='opacity:.25'"} aria-label="Subir">${ic("up", "s")}</button><button class="ib sm clear" data-a="rmove" data-id="${r.id}" data-x="${i}" data-v="1" ${i < r.ex.length - 1 ? "" : "disabled style='opacity:.25'"} aria-label="Descer">${ic("dn", "s")}</button><button class="ib sm clear badc" data-a="rdelx" data-id="${r.id}" data-x="${i}" aria-label="Remover">${ic("trash", "s")}</button></div>
      <div class="g3 mt"><div><label class="mut xs">Séries</label><div class="stepper"><button class="ib sm" data-a="rsets" data-id="${r.id}" data-x="${i}" data-v="-1">${ic("minus", "s")}</button><b class="num grow" style="text-align:center;font-size:20px">${e.sets}</b><button class="ib sm" data-a="rsets" data-id="${r.id}" data-x="${i}" data-v="1">${ic("plus", "s")}</button></div></div>
      <div><label class="mut xs">${x.k == "w" ? "Repetições" : x.k == "t" ? "Segundos" : "Minutos"}</label><input value="${esc(e.reps)}" data-i="rreps" data-id="${r.id}" data-x="${i}" style="text-align:center;font-weight:700"></div>
      <div><label class="mut xs">Descanso</label><select data-c="rrest" data-id="${r.id}" data-x="${i}">${rests.map(v => `<option value="${v}" ${v == e.rest ? "selected" : ""}>${clock(v)}</option>`).join("")}</select></div></div></div>`; }).join("")}
    <button class="btn block ghost mt" data-a="raddx" data-id="${r.id}">${ic("plus", "s")} Adicionar exercícios</button>
    <button class="btn block lg mt" data-a="start" data-r="${r.id}">${ic("play", "s")} Começar este treino</button>`;
}
function pExercise(pg) {
  const x = exById(pg.id), h = exHistory(pg.id), r = records(pg.id), isW = x.k == "w";
  const metric = UI.chart;
  const pts = h.map(({ s, sets }) => { const ok = sets.filter(z => z.t != "w"); let y = 0; if (!isW) y = Math.max(0, ...ok.map(z => num(z.r))); else if (metric == "e") y = Math.max(0, ...ok.map(z => e1rm(num(z.w), num(z.r)))); else if (metric == "w") y = Math.max(0, ...ok.map(z => num(z.w))); else y = ok.reduce((t, z) => t + num(z.w) * num(z.r), 0); return { x: shortD(dayOf(s.start)), y: Math.round(y * 10) / 10 }; }).filter(p => p.y > 0).slice(-24);
  const best = r.best;
  const head = pg.sheet ? sheetHead(esc(x.n)) : pageHead(esc(x.n), x.id[0] == "c" && !LIB[x.id] ? `<button class="ib clear badc" data-a="exremove" data-id="${x.id}" aria-label="Excluir exercício">${ic("trash")}</button>` : "");
  return head +
    `<div class="row" style="gap:8px;margin-bottom:6px"><span class="tag" style="color:${mColor(x.m)};background:color-mix(in srgb,${mColor(x.m)} 15%,transparent)">${mName(x.m)}</span><span class="tag gray">${x.eq}</span></div>
    ${!h.length ? `<div class="card">${emptyState("chart", "Ainda sem registros", "Faça este exercício em um treino para ver recordes e gráficos.")}</div>` : `
    ${isW ? `<div class="g2 mt"><div class="stat"><div class="l" style="margin:0 0 6px">${ic("trophy", "xs gold")} 1RM estimado</div><div class="v">${kg(Math.round(r.e * 10) / 10)}<small>kg</small></div></div><div class="stat"><div class="l" style="margin:0 0 6px">${ic("bolt", "xs gold")} Maior carga</div><div class="v">${kg(r.w)}<small>kg</small></div></div><div class="stat"><div class="l" style="margin:0 0 6px">${ic("star", "xs gold")} Melhor série</div><div class="v" style="font-size:24px">${best ? kg(best.w) + " × " + best.r : "—"}</div></div><div class="stat"><div class="l" style="margin:0 0 6px">${ic("layers", "xs gold")} Mais volume</div><div class="v">${fmt(r.vol)}<small>kg</small></div></div></div>
    <div class="seg mt">${[["e", "1RM est."], ["w", "Carga máx."], ["v", "Volume"]].map(([k, l]) => `<button class="${metric == k ? "on" : ""}" data-a="chm" data-v="${k}">${l}</button>`).join("")}</div>` : ""}
    <div class="card">${lineChart(pts, { unit: isW ? "kg" : UNIT[x.k].toLowerCase(), label: "Evolução de " + x.n, empty: "Faça este exercício em mais um treino para ver o gráfico." })}</div>
    ${isW && r.e ? `<div class="card"><b>Cargas sugeridas</b><div class="mut xs" style="margin-bottom:8px">Com base no seu 1RM estimado</div><div class="g3">${[[5, .87], [8, .8], [10, .75], [12, .7], [15, .65], [20, .6]].map(([rp, f]) => `<div style="text-align:center;padding:6px;background:var(--in);border-radius:12px"><b class="num" style="font-size:19px">${kg(Math.round(r.e * f / 2.5) * 2.5)}</b><div class="mut xs">${rp} reps</div></div>`).join("")}</div></div>` : ""}
    <div class="sec"><h2>Histórico</h2></div>
    <div class="card tight">${h.slice().reverse().slice(0, 40).map(({ s, sets }) => `<button class="item" data-a="${pg.sheet ? "noop" : "ses"}" data-id="${s.id}" style="align-items:flex-start"><div class="grow"><div class="t">${longD(dayOf(s.start))}</div><div class="d">${sets.map(z => (isW ? kg(z.w) + "×" + z.r : z.r + " " + UNIT[x.k].toLowerCase()) + (z.pr ? " 🏆" : "")).join(" · ")}</div></div></button>`).join("")}</div>`}`;
}
function pSession(pg) {
  const s = S.sessions.find(x => x.id == pg.id); if (!s) return pageHead("Treino") + emptyState("info", "Treino não encontrado", "");
  const st = sesStats(s), t0 = new Date(s.start);
  return pageHead(esc(s.name), `<button class="ib clear" data-a="sesmenu" data-id="${s.id}" aria-label="Opções">${ic("more")}</button>`) +
    `<div class="mut" style="text-transform:capitalize">${longD(dayOf(s.start))}${s.end ? " · " + t0.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
    <div class="g3 mt"><div class="stat"><div class="v">${st.dur ? dur(st.dur) : "—"}</div><div class="l">duração</div></div><div class="stat"><div class="v">${tons(st.vol)}</div><div class="l">volume</div></div><div class="stat"><div class="v">${st.sets}</div><div class="l">séries</div></div></div>
    ${s.note ? `<div class="card"><div class="mut xs" style="font-weight:700">ANOTAÇÃO</div><div style="margin-top:4px">${esc(s.note)}</div></div>` : ""}
    ${s.ex.map(e => { const x = exById(e.id); let n = 0; return `<div class="card"><button style="background:none;border:0;padding:0;text-align:left;width:100%" data-a="exdetail" data-id="${e.id}"><b class="gold" style="font-size:16px">${esc(x.n)}</b><div class="mut xs">${mName(x.m)}</div></button>
      <div style="margin-top:8px">${e.sets.map(z => `<div class="row sb" style="padding:5px 0;border-bottom:1px solid var(--line)"><span class="stype ${z.t}" style="width:30px;height:28px;display:grid;place-items:center;font-size:13px">${z.t == "n" ? ++n : z.t.toUpperCase()}</span><span class="grow num" style="font-size:17px">${x.k == "w" ? kg(z.w) + " kg × " + z.r : z.r + " " + UNIT[x.k].toLowerCase()}</span>${z.pr ? '<span class="prb">PR</span>' : ""}${x.k == "w" && z.t != "w" ? `<span class="mut xs" style="margin-left:8px">1RM ${kg(Math.round(e1rm(z.w, z.r)))}</span>` : ""}</div>`).join("")}</div></div>`; }).join("")}
    <button class="btn block ghost mt" data-a="repeat" data-id="${s.id}">${ic("copy", "s")} Repetir este treino</button>`;
}
function pSettings() {
  const st = S.settings;
  const rowT = (t, d, on, a) => `<div class="item"><div class="grow"><div class="t">${t}</div><div class="d">${d}</div></div>${toggle(on, a)}</div>`;
  return pageHead("Configurações") +
    `<div class="sec" style="margin-top:6px"><h2>Aparência</h2></div><div class="seg">${[["dark", "Escuro"], ["light", "Claro"], ["auto", "Sistema"]].map(([k, l]) => `<button class="${st.theme == k ? "on" : ""}" data-a="theme" data-v="${k}">${l}</button>`).join("")}</div>
    <div class="sec"><h2>Treino</h2></div><div class="card tight">
      <button class="item" data-a="defrest"><div class="grow"><div class="t">Descanso padrão</div><div class="d">Usado em exercícios novos e treinos livres</div></div><b class="gold">${clock(st.rest)}</b></button>
      <div class="item"><div class="grow"><div class="t">Meta semanal</div><div class="d">Treinos por semana</div></div><div class="stepper"><button class="ib sm" data-a="freq" data-v="-1">${ic("minus", "s")}</button><b class="num" style="width:26px;text-align:center;font-size:20px">${S.profile.freq}</b><button class="ib sm" data-a="freq" data-v="1">${ic("plus", "s")}</button></div></div>
      ${rowT("Som ao fim do descanso", "Toca um alerta quando o timer zera", st.sound, "tsound")}
      ${rowT("Vibração", "Vibra ao concluir séries e no fim do descanso", st.vib, "tvib")}
      ${rowT("Manter tela ligada", "Durante o treino a tela não apaga", st.awake, "tawake")}
    </div>
    <div class="sec"><h2>Sobre</h2></div><div class="card"><div class="row">${ic("shield", "gold")}<div class="grow sm">Seus dados ficam guardados apenas neste aparelho e não são enviados para nenhum servidor. Exporte um backup de vez em quando.</div></div></div>
    <p class="mut xs" style="text-align:center">Meu Treino ${VERSION}</p>`;
}
const PAGES = { routine: pRoutine, ex: pExercise, ses: pSession, settings: pSettings };

/* ---------- sheets: nutrition ---------- */
const FS = { meal: "almoco", q: "", tab: "rec", sel: null, g: 100 };
const allFoods = () => FOODS.concat(S.foods);
const foodByName = n => allFoods().find(f => f.n == n);
function foodSheet(meal) {
  FS.meal = meal; FS.q = ""; FS.sel = null; FS.tab = S.recentFoods.length ? "rec" : "all";
  sheet(() => FS.sel ? foodDetail() : `${sheetHead("Adicionar alimento", MEALS.find(m => m[0] == FS.meal)[1])}
    <div class="search">${ic("search", "s")}<input data-i="fq" placeholder="Buscar alimento" value="${esc(FS.q)}" autocomplete="off"></div>
    <div class="seg mt">${[["rec", "Recentes"], ["all", "Todos"], ["mine", "Meus"]].map(([k, l]) => `<button class="${FS.tab == k ? "on" : ""}" data-a="ftab" data-v="${k}">${l}</button>`).join("")}</div>
    <div id="fl">${foodList()}</div>
    <button class="btn block sec2 mt" data-a="fnew">${ic("plus", "s")} Criar alimento</button>`, { full: true });
}
function foodList() {
  const q = norm(FS.q.trim());
  let list = q ? allFoods().filter(f => norm(f.n).includes(q)) : FS.tab == "rec" ? S.recentFoods.map(foodByName).filter(Boolean) : FS.tab == "mine" ? S.foods : FOODS.slice().sort((a, b) => a.n.localeCompare(b.n, "pt-BR"));
  if (!list.length) return emptyState("food", q ? "Nada encontrado" : FS.tab == "mine" ? "Nenhum alimento seu" : "Nada recente", q ? "Crie esse alimento com os dados do rótulo." : FS.tab == "mine" ? "Crie alimentos com os dados da embalagem." : "Os alimentos que você adicionar aparecem aqui.");
  return `<div class="card tight">${list.map(f => `<button class="item" data-a="fpick" data-n="${esc(f.n)}"><div class="grow"><div class="t">${esc(f.n)}</div><div class="d">${esc(f.pl)} (${fmt(f.pg)} g) · ${fmt(f.k * f.pg / 100)} kcal · P ${fmt(f.p * f.pg / 100, 1)} g</div></div>${ic("plus", "s gold")}</button>`).join("")}</div>`;
}
function foodDetail() {
  const f = FS.sel, m = FS.g / 100;
  return `<div class="sh"><button class="ib clear" data-a="fback" aria-label="Voltar">${ic("back")}</button><h3 class="grow" style="margin-left:4px">${esc(f.n)}</h3><button class="ib" data-a="close" aria-label="Fechar">${ic("x")}</button></div>
    <div class="chips" style="margin-top:0">${[[f.pl, f.pg], ["2× " + f.pl, f.pg * 2], ["100 g", 100], ["½ " + f.pl, Math.round(f.pg / 2)]].map(([l, g]) => `<button class="chip ${FS.g == g ? "on" : ""}" data-a="fpor" data-v="${g}">${esc(l)}</button>`).join("")}</div>
    <div class="field"><label>Quantidade (gramas)</label><input id="fgr" inputmode="decimal" value="${fmt(FS.g, 1)}" data-i="fg" style="font:700 24px var(--fc);text-align:center"></div>
    <div class="g2" id="fprev">${foodPrev(f, m)}</div>
    <div class="field"><label>Refeição</label><div class="chips" style="margin:0 -18px;padding:2px 18px">${MEALS.map(([k, n]) => `<button class="chip ${FS.meal == k ? "on" : ""}" data-a="fmeal" data-v="${k}">${n}</button>`).join("")}</div></div>
    <button class="btn block lg mt" data-a="fadd">${ic("plus", "s")} Adicionar</button>`;
}
const foodPrev = (f, m) => `<div class="stat" style="grid-column:span 2;text-align:center"><div class="v" style="font-size:38px">${fmt(f.k * m)}</div><div class="l" style="justify-content:center">kcal</div></div>${[["Proteína", f.p], ["Carboidrato", f.c], ["Gordura", f.f]].map(([l, v]) => `<div class="stat" style="padding:10px"><div class="v" style="font-size:22px">${fmt(v * m, 1)}<small>g</small></div><div class="l">${l}</div></div>`).join("")}`;
function newFoodSheet() {
  sheet(() => `${sheetHead("Novo alimento", "Use os dados da tabela nutricional da embalagem")}
    <div class="field"><label>Nome</label><input id="nfn" value="${esc(FS.q)}" placeholder="Ex: Iogurte proteico"></div>
    <div class="g2"><div class="field"><label>Porção</label><input id="nfp" placeholder="1 pote" value="1 porção"></div><div class="field"><label>Gramas da porção</label><input id="nfg" inputmode="decimal" value="100"></div></div>
    <div class="g2"><div class="field"><label>Calorias (kcal)</label><input id="nfk" inputmode="decimal"></div><div class="field"><label>Proteína (g)</label><input id="nfpr" inputmode="decimal"></div><div class="field"><label>Carboidrato (g)</label><input id="nfc" inputmode="decimal"></div><div class="field"><label>Gordura (g)</label><input id="nff" inputmode="decimal"></div></div>
    <p class="mut xs">Informe os valores de uma porção.</p>
    <button class="btn block lg" data-a="nfsave">Salvar alimento</button>`, { focus: "#nfn" });
}
function foodEditSheet(id) {
  const d = UI.nd, x = dayFood(d).find(z => z.id == id); if (!x) return;
  const f = foodByName(x.n);
  sheet(() => `${sheetHead(esc(x.n), `${fmt(x.k)} kcal · P ${fmt(x.p, 1)} g · C ${fmt(x.c, 1)} g · G ${fmt(x.f, 1)} g`)}
    ${x.g && f ? `<div class="field"><label>Quantidade (gramas)</label><input id="feg" inputmode="decimal" value="${fmt(x.g, 1)}" style="font:700 22px var(--fc);text-align:center"></div><button class="btn block" data-a="fesave" data-id="${id}">Salvar quantidade</button>` : ""}
    <div class="g2 mt"><button class="btn sec2" data-a="fedup" data-id="${id}">${ic("copy", "s")} Duplicar</button><button class="btn danger" data-a="fedel" data-id="${id}">${ic("trash", "s")} Remover</button></div>`);
}
function goalsSheet() {
  const g = S.goals;
  sheet(() => `${sheetHead("Metas diárias")}
    <div class="g2"><div class="field"><label>Calorias (kcal)</label><input id="gk" inputmode="numeric" value="${g.kcal}"></div><div class="field"><label>Proteína (g)</label><input id="gp" inputmode="numeric" value="${g.p}"></div><div class="field"><label>Carboidrato (g)</label><input id="gc" inputmode="numeric" value="${g.c}"></div><div class="field"><label>Gordura (g)</label><input id="gf" inputmode="numeric" value="${g.f}"></div></div>
    <div class="field"><label>Água (ml)</label><input id="gw" inputmode="numeric" value="${g.water}"></div>
    <button class="btn block lg" data-a="gsave">Salvar metas</button>
    <button class="btn block ghost mt" data-a="gcalc">${ic("calc", "s")} Recalcular pelo meu perfil</button>`);
}

/* ---------- sheets: body, profile, tools ---------- */
function bodySheet(id) {
  const e = S.body.find(b => b.id == id) || { d: today(), w: latestWeight() || "" };
  const f = (k, l, u = "cm") => `<div class="field"><label>${l} (${u})</label><input id="b_${k}" inputmode="decimal" value="${e[k] ? fmt(e[k], 1) : ""}"></div>`;
  sheet(() => `${sheetHead(id ? "Editar registro" : "Novo registro")}
    <div class="g2"><div class="field"><label>Data</label><input id="b_d" type="date" value="${e.d}" max="${today()}"></div>${f("w", "Peso", "kg")}</div>
    <details ${id && (e.waist || e.bf) ? "open" : ""}><summary class="gold" style="font-weight:600;padding:8px 2px">Medidas corporais (opcional)</summary><div class="g2">${f("waist", "Cintura")}${f("chest", "Peito")}${f("arm", "Braço")}${f("thigh", "Coxa")}${f("hip", "Quadril")}${f("bf", "Gordura corporal", "%")}</div></details>
    <button class="btn block lg mt" data-a="bsave" data-id="${id || ""}">Salvar</button>
    ${id ? `<button class="btn block danger mt" data-a="bdel" data-id="${id}">${ic("trash", "s")} Excluir registro</button>` : ""}`, { focus: id ? null : "#b_w" });
}
function profileSheet() {
  const p = { ...S.profile };
  sheet(() => `${sheetHead("Seus dados")}
    <div class="field"><label>Nome</label><input id="pf_name" value="${esc(p.name)}"></div>
    <div class="field"><label>Sexo</label><div class="seg" style="margin:0" id="pf_sex">${[["m", "Masculino"], ["f", "Feminino"]].map(([k, l]) => `<button class="${p.sex == k ? "on" : ""}" data-a="pfsex" data-v="${k}">${l}</button>`).join("")}</div></div>
    <div class="g3"><div class="field"><label>Idade</label><input id="pf_age" inputmode="numeric" value="${p.age}"></div><div class="field"><label>Altura (cm)</label><input id="pf_height" inputmode="numeric" value="${p.height}"></div><div class="field"><label>Peso (kg)</label><input id="pf_weight" inputmode="decimal" value="${fmt(p.weight, 1)}"></div></div>
    <div class="field"><label>Objetivo</label><select id="pf_goal">${Object.entries(GOALS).map(([k, g]) => `<option value="${k}" ${p.goal == k ? "selected" : ""}>${g[0]}</option>`).join("")}</select></div>
    <div class="field"><label>Nível de atividade</label><select id="pf_act">${ACTIVITY.map(a => `<option value="${a[0]}" ${p.activity == a[0] ? "selected" : ""}>${a[1]}: ${a[2]}</option>`).join("")}</select></div>
    <div class="row sb card" style="padding:12px 14px"><div><b>Recalcular metas de nutrição</b><div class="mut xs">Calorias e macros pelo novo perfil</div></div>${toggle(true, "pfrecalc", 'id="pf_rc"')}</div>
    <button class="btn block lg" data-a="pfsave">Salvar</button>`);
}
function ormSheet() {
  sheet(() => `${sheetHead("Calculadora de 1RM", "Estimativa pela fórmula de Epley")}
    <div class="g2"><div class="field"><label>Carga (kg)</label><input id="ow" inputmode="decimal" data-i="orm" placeholder="80"></div><div class="field"><label>Repetições</label><input id="or" inputmode="numeric" data-i="orm" placeholder="8"></div></div>
    <div id="oout">${ormOut(0)}</div>`, { focus: "#ow" });
}
function ormOut(v) {
  if (!v) return `<p class="mut sm">Informe uma série que você fez até perto da falha.</p>`;
  return `<div class="stat" style="text-align:center"><div class="l" style="justify-content:center">1RM estimado</div><div class="v" style="font-size:44px">${kg(Math.round(v * 10) / 10)}<small>kg</small></div></div>
    <div class="card tight mt">${[[100, 1], [95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 15], [60, 20]].map(([p, r]) => `<div class="item" style="min-height:44px;padding:8px 16px"><span class="grow">${p}%</span><span class="mut sm" style="width:80px">~${r} reps</span><b class="num" style="font-size:18px">${kg(Math.round(v * p / 100 * 2) / 2)} kg</b></div>`).join("")}</div>`;
}
const PLATES = [[25, "#e5484d"], [20, "#3e7bfa"], [15, "#f2c94c"], [10, "#46a758"], [5, "#f4f2ec"], [2.5, "#8b8995"], [1.25, "#c9c7c0"]];
function platesSheet() {
  sheet(() => `${sheetHead("Calculadora de anilhas", "Quanto colocar de cada lado da barra")}
    <div class="g2"><div class="field"><label>Carga total (kg)</label><input id="plw" inputmode="decimal" data-i="plates" placeholder="100"></div><div class="field"><label>Barra (kg)</label><select id="plb" data-c="plates"><option value="20">Olímpica 20 kg</option><option value="15">Feminina 15 kg</option><option value="10">Curta 10 kg</option><option value="0">Sem barra</option></select></div></div>
    <div id="plout"><p class="mut sm">Digite a carga total que você quer levantar.</p></div>`, { focus: "#plw" });
}
function platesOut() {
  const t = num($("#plw").value), b = num($("#plb").value);
  if (t <= b) return `<p class="mut sm">${t ? "A carga precisa ser maior que a barra." : "Digite a carga total que você quer levantar."}</p>`;
  let side = (t - b) / 2; const use = [];
  for (const [p, c] of PLATES) while (side >= p - 1e-9) { use.push([p, c]); side -= p; }
  const vis = use.map(([p, c]) => `<div class="pl" style="background:${c};width:${p >= 10 ? 16 : 12}px;height:${40 + p * 2.6}px">${p >= 5 ? "" : ""}</div>`).join("");
  const counts = {}; use.forEach(([p]) => counts[p] = (counts[p] || 0) + 1);
  return `<div class="card"><div class="plates"><div class="bar0"></div>${vis}<div class="bar0" style="width:16px"></div></div>
    <div class="mut sm" style="text-align:center;margin-bottom:8px">De cada lado</div>${Object.keys(counts).sort((a, b) => b - a).map(p => `<div class="row sb" style="padding:6px 4px;border-bottom:1px solid var(--line)"><span>${ic("plate", "s")} Anilha ${kg(+p)} kg</span><b>× ${counts[p]}</b></div>`).join("")}
    ${side > 0.01 ? `<p class="badc sm">Faltam ${kg(side * 2)} kg que não fecham com anilhas comuns.</p>` : ""}</div>`;
}
function templateSheet(id) {
  const t = TEMPLATES.find(x => x.id == id);
  sheet(() => `${sheetHead(t.n)}<p class="mut" style="margin-top:0">${t.d}</p>
    ${t.r.map(([n, ex]) => `<div class="card"><b>${n}</b><div class="mut sm" style="margin-top:4px">${ex.map(([e, s, r]) => `${esc(exById(e).n)} <span style="opacity:.7">${s}×${r}</span>`).join("<br>")}</div></div>`).join("")}
    <button class="btn block lg mt" data-a="tpladd" data-id="${id}">${ic("plus", "s")} Adicionar às minhas rotinas</button>
    <button class="btn block ghost mt" data-a="tplrep" data-id="${id}">Substituir minhas rotinas</button>`, { full: true });
}
