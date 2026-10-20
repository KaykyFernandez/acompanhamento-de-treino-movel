"use strict";
/* Utilities, persistent state, statistics and shared UI building blocks. */

const VERSION = "2.0.0";
const KEY = "meutreino";
const N = window.AndroidApp || null;

/* ---------- utils ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const pad = n => String(n).padStart(2, "0");
const iso = d => d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
const today = () => iso(new Date());
const D = s => new Date(s + "T12:00:00");
const addDays = (s, n) => { const d = D(s); d.setDate(d.getDate() + n); return iso(d); };
const dayOf = ts => iso(new Date(ts));
const num = v => { const x = parseFloat(String(v == null ? "" : v).replace(",", ".")); return isFinite(x) ? x : 0; };
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = (n, d = 0) => Number(n || 0).toLocaleString("pt-BR", { maximumFractionDigits: d });
const kg = n => fmt(n, 2);
const norm = s => String(s).normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const WD = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const WDL = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
const MN = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
const shortD = s => { const d = D(s); return d.getDate() + " " + MN[d.getMonth()].slice(0, 3); };
const longD = s => { const t = today(); if (s == t) return "Hoje"; if (s == addDays(t, -1)) return "Ontem"; const d = D(s); return WDL[d.getDay()] + ", " + d.getDate() + " de " + MN[d.getMonth()]; };
const clock = sec => { sec = Math.max(0, Math.floor(sec)); const h = Math.floor(sec / 3600), m = Math.floor(sec % 3600 / 60), s = sec % 60; return h ? h + ":" + pad(m) + ":" + pad(s) : m + ":" + pad(s); };
const dur = sec => { const m = Math.round(sec / 60); return m < 60 ? m + " min" : Math.floor(m / 60) + "h" + pad(m % 60); };
const weekStart = s => { const d = D(s); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return iso(d); };
const ago = s => { const n = Math.round((D(today()) - D(s)) / 864e5); return n <= 0 ? "hoje" : n == 1 ? "ontem" : n < 30 ? "há " + n + " dias" : n < 60 ? "há 1 mês" : "há " + Math.floor(n / 30) + " meses"; };
const tons = v => v >= 1000 ? fmt(v / 1000, 1) + " t" : fmt(v) + " kg";
const plural = (n, a, b) => n + " " + (n == 1 ? a : b);

/* ---------- icons ---------- */
const IC = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  dumb: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/>',
  food: '<path d="M7 3v18M4 3v5a3 3 0 0 0 6 0V3M17 21V3c-2 1-3 4-3 8h3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  x: '<path d="M6 6l12 12M18 6L6 18"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  down: '<path d="M5 9l7 7 7-7"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  flame: '<path d="M12 3c1 4 6 6 6 11a6 6 0 0 1-12 0c0-3 2-5 3-6 0 2 1 3 2 3 0-3 0-5 1-8z"/>',
  trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 13v4M8 21h8M10 17h4"/>',
  play: '<path d="M7 4.5v15l13-7.5z"/>',
  more: '<circle cx="5" cy="12" r="1.2"/><circle cx="12" cy="12" r="1.2"/><circle cx="19" cy="12" r="1.2"/>',
  trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13 7l4 4"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>',
  up: '<path d="M12 19V5M6 11l6-6 6 6"/>',
  dn: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  scale: '<rect x="3" y="4" width="18" height="16" rx="4"/><path d="M8 10a4 4 0 0 1 8 0zM12 10l1.5-2"/>',
  drop: '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 10h18"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  ul: '<path d="M12 16V5M7 10l5-5 5 5M5 20h14"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
  bolt: '<path d="M13 2L4 14h7l-1 8 9-12h-7z"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  calc: '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 12h.01M12 12h.01M16 12h.01M8 16h.01M12 16h.01M16 16h.01"/>',
  swap: '<path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
  note: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M9 9h6M9 13h4"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  ruler: '<path d="M3 17L17 3l4 4L7 21z"/><path d="M7 13l2 2M10 10l2 2M13 7l2 2"/>',
  moon: '<path d="M20 14A8 8 0 1 1 10 4a6 6 0 0 0 10 10z"/>',
  star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  plate: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.5"/>',
  layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>',
  shield: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M9 12l2 2 4-4"/>'
};
const ic = (n, c = "") => `<svg class="i ${c}" viewBox="0 0 24 24" aria-hidden="true">${IC[n] || ""}</svg>`;

/* ---------- state ---------- */
function base() {
  return {
    v: 3,
    profile: { name: "", sex: "m", age: 25, height: 175, weight: 75, goal: "hipertrofia", activity: 1.55, freq: 4, onboarded: false },
    goals: { kcal: 2600, p: 150, c: 330, f: 75, water: 2600 },
    settings: { rest: 90, sound: true, vib: true, awake: true, theme: "dark" },
    exercises: [], routines: [], sessions: [], active: null,
    body: [], food: {}, water: {}, foods: [], recentFoods: [],
    created: Date.now()
  };
}

const LIB = Object.fromEntries(LIBRARY.map(e => [e.id, e]));
const exById = id => LIB[id] || S.exercises.find(e => e.id == id) || { id, n: "Exercício removido", m: "outro", eq: "Outro", k: "w" };
const allExercises = () => LIBRARY.concat(S.exercises);
const mColor = m => (MUSCLES[m] || MUSCLES.outro)[1];
const mName = m => (MUSCLES[m] || MUSCLES.outro)[0];

function fromTemplate(t) {
  return t.r.map(([name, ex]) => ({ id: uid(), name, ex: ex.map(([id, sets, reps, rest]) => ({ id, sets, reps, rest })) }));
}

function load() {
  let raw = null;
  try { raw = JSON.parse(localStorage.getItem(KEY)); } catch (e) { }
  if (!raw) { const s = base(); s.routines = fromTemplate(TEMPLATES[0]); return s; }
  if (raw.v === 3) {
    const b = base(), s = Object.assign(b, raw);
    for (const k of ["profile", "goals", "settings"]) s[k] = Object.assign(base()[k], raw[k] || {});
    return s;
  }
  return migrate(raw);
}

/* Converts data saved by the first version (per-day logs keyed by exercise) into sessions. */
function migrate(o) {
  const s = base();
  const byName = name => {
    const id = OLD_NAMES[name] || (LIBRARY.find(e => norm(e.n) == norm(name)) || {}).id;
    if (id) return id;
    let c = s.exercises.find(e => norm(e.n) == norm(name));
    if (!c) { c = { id: "c" + uid(), n: name, m: "outro", eq: "Outro", k: "w" }; s.exercises.push(c); }
    return c.id;
  };
  const idmap = {}, rmap = {};
  for (const l in (o.plan || {})) {
    const p = o.plan[l], r = { id: uid(), name: "Treino " + l + " · " + (p.t || "").replace(/\s*\+\s*/g, " e "), ex: [] };
    for (const e of p.e || []) {
      const id = byName(e.n); idmap[e.id] = id;
      r.ex.push({ id, sets: +e.s || 3, reps: String(e.r || "10"), rest: +e.t || 90 });
    }
    rmap[l] = r; s.routines.push(r);
  }
  if (!s.routines.length) s.routines = fromTemplate(TEMPLATES[0]);
  for (const d of Object.keys(o.logs || {}).sort()) {
    const L = o.logs[d], ex = [], votes = {};
    for (const oid in L) {
      const sets = (L[oid] || []).filter(x => x.ok).map(x => ({ t: "n", w: num(x.w), r: num(x.r), pr: false }));
      if (!sets.length) continue;
      const id = idmap[oid] || byName("Exercício " + oid);
      ex.push({ id, sets });
      const l = oid[0]; if (rmap[l]) votes[l] = (votes[l] || 0) + 1;
    }
    if (!ex.length) continue;
    const top = Object.keys(votes).sort((a, b) => votes[b] - votes[a])[0], r = rmap[top];
    const start = new Date(d + "T18:00:00").getTime();
    s.sessions.push({ id: uid(), rid: r ? r.id : null, name: r ? r.name : "Treino", start, end: null, note: "", ex, prs: [] });
  }
  s.body = (o.weights || []).map(w => ({ id: uid(), d: w.d, w: num(w.w) }));
  for (const d in (o.food || {})) s.food[d] = o.food[d].map(x => ({ id: uid(), meal: "almoco", n: x.n, g: 0, q: fmt(x.q, 2) + " porção", k: x.k, p: x.p, c: x.c, f: x.g }));
  s.foods = (o.custom || []).map(c => ({ id: uid(), n: c[0], k: num(c[2]), p: num(c[3]), c: num(c[4]), f: num(c[5]), pl: "1 porção", pg: 100 }));
  if (o.goal) { s.goals.kcal = +o.goal.k || s.goals.kcal; s.goals.p = +o.goal.p || s.goals.p; }
  s.migrated = true;
  return s;
}

let S = load();
function flush() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast("Não foi possível salvar os dados", "info"); } }
function save() { clearTimeout(save.t); save.t = setTimeout(flush, 200); }
addEventListener("pagehide", flush);
document.addEventListener("visibilitychange", () => { if (document.hidden) flush(); });

/* ---------- stats ---------- */
const e1rm = (w, r) => w > 0 && r > 0 ? (r == 1 ? w : w * (1 + r / 30)) : 0;
const lowTarget = r => String(parseInt(r) || "");

function sesStats(s) {
  let vol = 0, sets = 0;
  for (const e of s.ex) {
    const k = exById(e.id).k;
    for (const x of e.sets) { if (!x.ok && x.ok !== undefined) continue; sets++; if (k == "w" && x.t != "w") vol += num(x.w) * num(x.r); }
  }
  return { vol, sets, dur: s.end ? (s.end - s.start) / 1000 : 0 };
}
const sorted = () => S.sessions.slice().sort((a, b) => b.start - a.start);
function trainedDays() { const set = new Set(); for (const s of S.sessions) set.add(dayOf(s.start)); return set; }
function countWeek(ws, days) { let c = 0; for (let i = 0; i < 7; i++) if (days.has(addDays(ws, i))) c++; return c; }
function streak() {
  const f = S.profile.freq || 3, days = trainedDays();
  let w = weekStart(today()), n = countWeek(w, days) >= f ? 1 : 0;
  w = addDays(w, -7);
  while (countWeek(w, days) >= f) { n++; w = addDays(w, -7); }
  return n;
}
function records(id, before = Infinity) {
  const r = { w: 0, e: 0, vol: 0, reps: 0, best: null };
  for (const s of S.sessions) {
    if (s.start >= before) continue;
    for (const e of s.ex) {
      if (e.id != id) continue;
      for (const x of e.sets) {
        if (x.t == "w") continue;
        const w = num(x.w), rp = num(x.r), E = e1rm(w, rp);
        if (w > r.w) r.w = w;
        if (E > r.e) { r.e = E; r.best = x; }
        if (w * rp > r.vol) r.vol = w * rp;
        if (rp > r.reps) r.reps = rp;
      }
    }
  }
  return r;
}
function lastSets(id, before = Infinity) {
  let best = null;
  for (const s of S.sessions) if (s.start < before && s.ex.some(e => e.id == id) && (!best || s.start > best.start)) best = s;
  return best ? best.ex.find(e => e.id == id).sets : [];
}
function exHistory(id) {
  return S.sessions.filter(s => s.ex.some(e => e.id == id)).sort((a, b) => a.start - b.start)
    .map(s => ({ s, sets: s.ex.find(e => e.id == id).sets }));
}
function nextRoutine() {
  if (!S.routines.length) return null;
  const last = sorted().find(s => S.routines.some(r => r.id == s.rid));
  if (!last) return S.routines[0];
  const i = S.routines.findIndex(r => r.id == last.rid);
  return S.routines[(i + 1) % S.routines.length];
}
const routineMuscles = r => [...new Set(r.ex.map(e => exById(e.id).m))];
const routineMinutes = r => Math.round(r.ex.reduce((t, e) => t + e.sets * ((+e.rest || 60) + 45), 0) / 60);
const lastDone = rid => { const s = sorted().find(s => s.rid == rid); return s ? dayOf(s.start) : null; };
function dayFood(d) { return S.food[d] || []; }
function foodTotals(d) { return dayFood(d).reduce((a, x) => ({ k: a.k + x.k, p: a.p + x.p, c: a.c + x.c, f: a.f + x.f }), { k: 0, p: 0, c: 0, f: 0 }); }
const bodySorted = () => S.body.slice().sort((a, b) => a.d < b.d ? -1 : 1);
const latestWeight = () => { const w = bodySorted().filter(b => b.w); return w.length ? w[w.length - 1].w : 0; };

function calcGoals(p) {
  const g = GOALS[p.goal] || GOALS.hipertrofia;
  const bmr = 10 * p.weight + 6.25 * p.height - 5 * p.age + (p.sex == "f" ? -161 : 5);
  const kcal = Math.round(bmr * p.activity * g[2] / 10) * 10;
  const prot = Math.round(p.weight * g[3]), fat = Math.round(p.weight * g[4]);
  const carb = Math.max(50, Math.round((kcal - prot * 4 - fat * 9) / 4));
  return { kcal, p: prot, c: carb, f: fat, water: Math.round(p.weight * 35 / 100) * 100 };
}

/* ---------- device ---------- */
function buzz(p = 15) {
  if (!S.settings.vib) return;
  try { if (N) N.vibrate(Array.isArray(p) ? p.reduce((a, b) => a + b, 0) : p); else navigator.vibrate && navigator.vibrate(p); } catch (e) { }
}
let AC;
const audio = () => AC = AC || new (window.AudioContext || window.webkitAudioContext)();
// iOS only lets audio start from a user gesture, so unlock the context on the first touch.
document.addEventListener("pointerdown", () => { try { if (audio().state != "running") AC.resume(); } catch (e) { } }, { passive: true });
function beep() {
  if (!S.settings.sound) return;
  try {
    audio();
    [0, .2, .4].forEach((t, i) => {
      const o = AC.createOscillator(), g = AC.createGain(), st = AC.currentTime + t;
      o.frequency.value = i == 2 ? 1320 : 880; o.connect(g); g.connect(AC.destination);
      g.gain.setValueAtTime(.0001, st); g.gain.exponentialRampToValueAtTime(.3, st + .02); g.gain.exponentialRampToValueAtTime(.0001, st + .16);
      o.start(st); o.stop(st + .18);
    });
  } catch (e) { }
}
/* Web fallback (iPhone): the Wake Lock API, re-acquired when the page comes back since the browser drops it when hidden. */
let WL = null, wantAwake = false;
const keepAwake = on => {
  wantAwake = !!on && S.settings.awake;
  try { if (N) { N.keepAwake(wantAwake); return; } } catch (e) { }
  if (!navigator.wakeLock) return;
  if (wantAwake && !WL) navigator.wakeLock.request("screen").then(l => { WL = l; l.addEventListener("release", () => { if (WL == l) WL = null; }); }).catch(() => { });
  else if (!wantAwake && WL) { WL.release().catch(() => { }); WL = null; }
};
document.addEventListener("visibilitychange", () => { if (!document.hidden && wantAwake) keepAwake(true); });
function applyTheme() {
  const t = S.settings.theme, dark = t == "auto" ? !matchMedia("(prefers-color-scheme: light)").matches : t == "dark";
  document.documentElement.dataset.theme = dark ? "dark" : "light";
  const c = dark ? "#08080b" : "#f4f1ea";
  $('meta[name="theme-color"]').content = c;
  try { N && N.setBars(c, dark); } catch (e) { }
}
function saveFile(name, text) {
  if (N && N.saveFile) { N.saveFile(name, text); return; }
  // iPhone: downloads from a home-screen app are unreliable, so hand the file to the share sheet ("Salvar em Arquivos").
  const file = new File([text], name, { type: "application/json" });
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    navigator.share({ files: [file] }).then(() => toast("Backup salvo", "check"), e => { if (e.name != "AbortError") toast("Backup não foi salvo", "info"); });
    return;
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  toast("Backup baixado", "check");
}
window.onNativeSaved = ok => toast(ok ? "Backup salvo" : "Backup não foi salvo", ok ? "check" : "info");

/* ---------- ui primitives ---------- */
function toast(msg, icon = "check", cls = "") {
  const t = document.createElement("div");
  t.className = "toast " + cls; t.innerHTML = ic(icon, "s") + "<span>" + esc(msg) + "</span>";
  $("#toast").appendChild(t);
  setTimeout(() => { t.style.transition = "opacity .3s"; t.style.opacity = 0; setTimeout(() => t.remove(), 300); }, 2400);
}

const SH = [];
function sheet(fn, o = {}) {
  const w = document.createElement("div");
  w.innerHTML = `<div class="scrim" data-a="close"></div><div class="${o.dialog ? "dialog" : "sheet" + (o.full ? " full" : "")}" role="dialog">${o.dialog ? "" : '<div class="grab"></div>'}<div class="sc"></div></div>`;
  $("#layer").appendChild(w);
  const s = { fn, o, w, c: w.querySelector(".sc") };
  SH.push(s); s.c.innerHTML = fn();
  if (o.focus) setTimeout(() => { const f = s.c.querySelector(o.focus); f && f.focus(); }, 320);
  return s;
}
function refresh() { const s = SH[SH.length - 1]; if (s) s.c.innerHTML = s.fn(); }
function closeSheet(n = 1) { while (n-- > 0 && SH.length) { const s = SH.pop(); s.w.remove(); s.o.onClose && s.o.onClose(); } }
function closeAll() { closeSheet(SH.length); }
function confirmDlg(title, msg, okLabel, onOk, danger = true) {
  sheet(() => `<h3>${title}</h3><p class="mut" style="margin:6px 0 0">${msg}</p><div class="g2 mt2"><button class="btn sec2" data-a="close">Cancelar</button><button class="btn ${danger ? "danger" : ""}" data-a="dlgok">${okLabel}</button></div>`, { dialog: true, ok: onOk });
}
const sheetHead = (t, sub) => `<div class="sh"><div><h3>${t}</h3>${sub ? `<div class="mut sm">${sub}</div>` : ""}</div><button class="ib" data-a="close" aria-label="Fechar">${ic("x")}</button></div>`;
const toggle = (on, a, extra = "") => `<button class="toggle ${on ? "on" : ""}" data-a="${a}" ${extra} role="switch" aria-checked="${!!on}"></button>`;
const emptyState = (icon, title, text, btn = "") => `<div class="empty"><div class="ei">${ic(icon, "l")}</div><b>${title}</b><div class="sm">${text}</div>${btn ? `<div class="mt">${btn}</div>` : ""}</div>`;

function ring(frac, size, stroke, inner = "") {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, off = c * (1 - clamp(frac || 0, 0, 1));
  return `<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle class="bg" cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}"/><circle class="fg" ${frac < .02 ? 'style="display:none"' : ""} cx="${size / 2}" cy="${size / 2}" r="${r}" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${off.toFixed(1)}" style="--len:${c.toFixed(1)}"/>${inner}</svg>`;
}

/* ---------- charts ---------- */
function lineChart(pts, o = {}) {
  if (pts.length < 2) return `<div class="empty" style="padding:22px 8px"><div class="sm">${o.empty || "Registre pelo menos dois dias para ver o gráfico."}</div></div>`;
  const W = 340, H = o.h || 170, L = 36, R = 12, T = 18, B = 24, id = "lg" + uid();
  const ys = pts.map(p => p.y).concat(o.trend || []);
  let mn = Math.min(...ys), mx = Math.max(...ys); const pd = (mx - mn) * .12 || Math.max(1, mx * .05); mn -= pd; mx += pd;
  const X = i => L + i * (W - L - R) / (pts.length - 1), Y = v => T + (mx - v) * (H - T - B) / (mx - mn);
  const line = pts.map((p, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(p.y).toFixed(1)).join("");
  const area = line + `L${X(pts.length - 1).toFixed(1)} ${H - B}L${L} ${H - B}Z`;
  const grid = [0, .5, 1].map(f => { const v = mx - f * (mx - mn), y = Y(v); return `<line class="grid" x1="${L}" x2="${W - R}" y1="${y}" y2="${y}"/><text x="${L - 6}" y="${y + 3.5}" text-anchor="end">${fmt(v, v < 10 ? 1 : 0)}</text>`; }).join("");
  const tr = o.trend ? `<path d="${o.trend.map((v, i) => (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1)).join("")}" fill="none" stroke="var(--blue)" stroke-width="2" stroke-dasharray="4 4" opacity=".8"/>` : "";
  const li = pts.length - 1, lx = X(li), ly = Y(pts[li].y);
  const mid = pts.length > 4 ? `<text x="${X(Math.floor(li / 2))}" y="${H - 6}" text-anchor="middle">${pts[Math.floor(li / 2)].x}</text>` : "";
  return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "Gráfico")}"><defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--g2)" stop-opacity=".35"/><stop offset="1" stop-color="var(--g2)" stop-opacity="0"/></linearGradient></defs>${grid}<path d="${area}" fill="url(#${id})"/><path d="${line}" fill="none" stroke="var(--gold)" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>${tr}${pts.length <= 24 ? pts.map((p, i) => `<circle cx="${X(i)}" cy="${Y(p.y)}" r="2.6" fill="var(--bg2)" stroke="var(--gold)" stroke-width="1.6"/>`).join("") : ""}<circle cx="${lx}" cy="${ly}" r="5" fill="var(--gold)"/><text x="${Math.min(lx, W - R - 4)}" y="${ly - 10}" text-anchor="end" style="fill:var(--tx);font-weight:700;font-size:12px">${fmt(pts[li].y, 1)}${o.unit ? " " + o.unit : ""}</text><text x="${L}" y="${H - 6}">${pts[0].x}</text>${mid}<text x="${W - R}" y="${H - 6}" text-anchor="end">${pts[li].x}</text></svg>`;
}
function barChart(items, o = {}) {
  const W = 340, H = o.h || 160, L = 8, R = 8, T = 22, B = 22, n = items.length, gw = (W - L - R) / n, bw = Math.min(26, gw * .62);
  const mx = Math.max(1, ...items.map(i => i.y));
  return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(o.label || "Gráfico de barras")}"><defs><linearGradient id="bg1" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="var(--g1)"/><stop offset="1" stop-color="var(--g3)"/></linearGradient></defs>${items.map((it, i) => {
    const h = Math.max(it.y ? 4 : 2, (H - T - B) * it.y / mx), x = L + i * gw + (gw - bw) / 2, y = H - B - h, last = i == n - 1;
    return `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="6" fill="${it.y ? (last ? "url(#bg1)" : "var(--g2)") : "var(--in)"}" opacity="${last || !it.y ? 1 : .55}"/>${it.y && (last || it.y == mx) ? `<text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" style="fill:var(--tx);font-weight:700">${o.fmt ? o.fmt(it.y) : fmt(it.y)}</text>` : ""}<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle">${it.x}</text>`;
  }).join("")}</svg>`;
}
