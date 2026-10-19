'use strict';
/* Core runtime: DOM + SVG builders, persisted state, shared UI controls,
   the lab clock, result codes and the optional live room. */

const NS = 'http://www.w3.org/2000/svg';

function setAttrs(el, a) {
  if (!a) return;
  for (const k in a) {
    const v = a[k];
    if (v == null || v === false) continue;
    if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : String(v));
  }
}
function addKids(el, c) {
  for (const x of c.flat(Infinity)) {
    if (x == null || x === false) continue;
    el.append(x.nodeType ? x : document.createTextNode(String(x)));
  }
}
function h(tag, a, ...c) { const e = document.createElement(tag); setAttrs(e, a); addKids(e, c); return e; }
function s(tag, a, ...c) { const e = document.createElementNS(NS, tag); setAttrs(e, a); addKids(e, c); return e; }

/* ---------- state ---------- */
const STORE_KEY = 'agentic-ai-labs-v3';
const S = { table: '', tableId: '', labs: {}, revealed: {}, tab: {}, timer: null, collect: {}, present: false };
try { const raw = localStorage.getItem(STORE_KEY); if (raw) Object.assign(S, JSON.parse(raw)); } catch (e) { /* storage blocked */ }
if (!S.tableId) S.tableId = 't' + Math.random().toString(36).slice(2, 10);

const App = { labs: [], byId: {}, db: null, room: {}, roomUnsub: null, armed: null, render: null };
function registerLab(lab) { App.labs.push(lab); App.byId[lab.id] = lab; }
function L(id) { return S.labs[id] || (S.labs[id] = {}); }
function persist() { try { localStorage.setItem(STORE_KEY, JSON.stringify(S)); } catch (e) { /* storage blocked */ } queueShare(); }
function rerender() { if (App.render) App.render(); }
function commit() { persist(); rerender(); }

/* ---------- small utilities ---------- */
const sum = a => a.reduce((n, x) => n + (+x || 0), 0);
function count(vals) { const c = {}; for (const v of vals) if (v != null && v !== '') c[v] = (c[v] || 0) + 1; return c; }
function agreement(c) { const t = sum(Object.values(c)); return t ? Math.max(...Object.values(c)) / t : 1; }
function inr(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
function fmtClock(ms) { ms = Math.max(0, ms); const t = Math.ceil(ms / 1000); return Math.floor(t / 60) + ':' + String(t % 60).padStart(2, '0'); }
function nameOf(opts, k) { const o = opts.find(x => x[0] === k); return o ? o[1] : '—'; }

/* ---------- shared controls ---------- */
function seg(opts, val, pick, label, cls) {
  return h('div', { class: 'seg ' + (cls || ''), role: 'group', 'aria-label': label || 'Choose' },
    opts.map(([k, t, sub]) => h('button', {
      type: 'button', 'aria-pressed': String(val === k),
      onclick: () => { pick(val === k ? undefined : k); commit(); }
    }, t, sub ? h('small', null, sub) : null)));
}
function chips(opts, set, label) {
  return h('div', { class: 'chipset', role: 'group', 'aria-label': label || 'Select' },
    opts.map(([k, t]) => h('button', {
      type: 'button', 'aria-pressed': String(!!set[k]),
      onclick: () => { if (set[k]) delete set[k]; else set[k] = true; commit(); }
    }, t)));
}
function field(val, setv, o = {}) {
  const a = { id: o.id, placeholder: o.ph || '', 'aria-label': o.label || o.ph || 'Answer' };
  const e = o.line ? h('input', Object.assign({ type: 'text' }, a)) : h('textarea', a);
  e.value = val || '';
  e.addEventListener('input', () => { setv(e.value); persist(); if (o.live) o.live(e.value); });
  return e;
}
function toggle(on, label, flip, cls) {
  return h('button', { type: 'button', class: 'btn ' + (on ? (cls || 'warn') : ''), 'aria-pressed': String(!!on), onclick: () => { flip(); commit(); } }, label);
}
function box(cls, ...c) { return h('div', { class: 'box ' + (cls || '') }, ...c); }
function answer(title, text, tone) { return h('div', { class: 'answer ' + (tone || '') }, h('b', null, title), text ? h('p', null, text) : null); }
function pill(t, tone) { return h('span', { class: 'pill ' + (tone || '') }, t); }
function label(t) { return h('span', { class: 'label' }, t); }
function stat(value, caption, tone) { return h('div', { class: 'stat-i ' + (tone || '') }, h('b', null, value), h('span', null, caption)); }
function stats(...items) { return h('div', { class: 'stat' }, items); }
function meter(frac, tone, aria) {
  const f = Math.max(0, Math.min(1, frac || 0));
  return h('div', { class: 'meter', role: 'meter', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': Math.round(f * 100), 'aria-label': aria || 'Level' },
    h('i', { class: tone || '', style: 'width:' + (f * 100).toFixed(1) + '%' }));
}
function confirmTwice(key, text, act, cls) {
  const on = App.armed === key;
  return h('button', {
    type: 'button', class: 'btn ' + (cls || ''),
    onclick: () => {
      if (on) { App.armed = null; act(); }
      else { App.armed = key; setTimeout(() => { if (App.armed === key) { App.armed = null; rerender(); } }, 4000); }
      commit();
    }
  }, on ? 'Tap again to confirm' : text);
}
function copyButton(getText, text) {
  const lbl = text || 'Copy';
  const b = h('button', { type: 'button', class: 'btn' }, lbl);
  b.addEventListener('click', async () => {
    const t = getText();
    try { await navigator.clipboard.writeText(t); b.textContent = 'Copied'; }
    catch (e) {
      const ta = h('textarea', { class: 'copyfallback', 'aria-label': 'Text to copy', readonly: true });
      ta.value = t; b.after(ta); ta.focus(); ta.select();
      b.textContent = 'Select the text below and copy it';
    }
    setTimeout(() => { b.textContent = lbl; }, 2500);
  });
  return b;
}
function details(summary, open, ...c) { return h('details', open ? { open: true } : null, h('summary', null, summary), h('div', { class: 'details-body' }, c)); }

/* ---------- the lab clock ---------- */
function timerFor(id) { return S.timer && S.timer.lab === id ? S.timer : null; }
function elapsed(t) { return (t.acc || 0) + (t.run ? Date.now() - t.run : 0); }
function stepAt(lab, ms) {
  let acc = 0;
  for (let i = 0; i < lab.steps.length; i++) { const d = lab.steps[i][0] * 60000; if (ms < acc + d) return { i, left: acc + d - ms }; acc += d; }
  return { i: lab.steps.length, left: 0 };
}
function startTimer(id, atMinute) {
  const t = timerFor(id);
  if (atMinute != null) S.timer = { lab: id, acc: atMinute * 60000, run: Date.now() };
  else if (t && !t.run) t.run = Date.now();
  else if (!t) S.timer = { lab: id, acc: 0, run: Date.now() };
  try { if (navigator.wakeLock) navigator.wakeLock.request('screen').catch(() => {}); } catch (e) { /* not offered */ }
  commit();
}
function pauseTimer() { const t = S.timer; if (t && t.run) { t.acc = elapsed(t); t.run = 0; commit(); } }
function resetTimer() { S.timer = null; commit(); }
function nextStep(lab) {
  const t = timerFor(lab.id); if (!t) return;
  const w = stepAt(lab, elapsed(t));
  const at = sum(lab.steps.slice(0, w.i + 1).map(x => x[0]));
  startTimer(lab.id, Math.min(at, lab.min));
}
function clockPanel(lab) {
  const t = timerFor(lab.id);
  let a = 0;
  const items = lab.steps.map(([m, txt], i) => { const from = a; a += m; return h('li', { 'data-i': i }, h('span', { class: 't' }, from + '–' + a + ' min'), h('span', null, txt)); });
  return h('div', { class: 'clock' },
    h('div', { class: 'big' }, h('b', { id: 'clk-big' }, fmtClock(lab.steps[0][0] * 60000)), h('span', { id: 'clk-sub' }, 'Lab clock · ' + lab.min + ' minutes')),
    h('div', { class: 'bar' }, h('i', { id: 'clk-bar' })),
    h('ol', { class: 'steps', id: 'clk-steps' }, items),
    h('div', { class: 'btnrow' },
      t && t.run ? h('button', { type: 'button', class: 'btn', onclick: pauseTimer }, 'Pause')
        : h('button', { type: 'button', class: 'btn primary', onclick: () => startTimer(lab.id) }, t ? 'Resume' : 'Start the clock'),
      t ? h('button', { type: 'button', class: 'btn', onclick: () => nextStep(lab) }, 'Next step') : null,
      t ? h('button', { type: 'button', class: 'btn', onclick: resetTimer }, 'Reset') : null));
}
function tick() {
  const t = S.timer, mini = document.getElementById('miniclock');
  if (!mini) return;
  if (!t || !App.byId[t.lab]) { mini.hidden = true; return; }
  const lab = App.byId[t.lab], ms = elapsed(t), w = stepAt(lab, ms), over = w.i >= lab.steps.length;
  mini.hidden = false;
  mini.textContent = (over ? 'M' + lab.n + ' · time' : 'M' + lab.n + ' · ' + fmtClock(w.left)) + (t.run ? '' : ' · paused');
  const big = document.getElementById('clk-big');
  if (!big || currentLabId() !== lab.id) return;
  big.textContent = over ? '0:00' : fmtClock(w.left);
  document.getElementById('clk-sub').textContent = over ? 'Time is up. Move to the debrief.' :
    'Step ' + (w.i + 1) + ' of ' + lab.steps.length + ' · ' + fmtClock(lab.min * 60000 - ms) + ' left in the lab';
  document.getElementById('clk-bar').style.width = Math.min(100, ms / (lab.min * 600)) + '%';
  document.querySelectorAll('#clk-steps li').forEach((li, i) => { li.className = i < w.i ? 'past' : i === w.i ? 'now' : ''; });
}

/* ---------- result codes (work with no server at all) ---------- */
function b64e(str) {
  const bytes = new TextEncoder().encode(str); let bin = '';
  bytes.forEach(b => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function b64d(str) {
  let x = str.replace(/-/g, '+').replace(/_/g, '/'); while (x.length % 4) x += '=';
  const bin = atob(x); return new TextDecoder().decode(Uint8Array.from(bin, c => c.charCodeAt(0)));
}
function makeCode(labId) { return 'AIL1.' + labId + '.' + b64e(JSON.stringify({ t: S.table || 'Unnamed table', i: S.tableId, d: S.labs[labId] || {} })); }
function readCodes(text) {
  const out = []; const re = /AIL1\.(m\d\d)\.([A-Za-z0-9_-]+)/g; let m;
  while ((m = re.exec(text))) {
    try {
      const o = JSON.parse(b64d(m[2]));
      if (o && o.d && typeof o.d === 'object' && !Array.isArray(o.d)) out.push({ lab: m[1], table: String(o.t || 'Table').slice(0, 60), id: String(o.i || ('x' + out.length)).slice(0, 40), data: o.d });
    } catch (e) { /* not a valid code */ }
  }
  return out;
}
function collectedDocs(labId) {
  const c = S.collect[labId] || {};
  return Object.values(c).map(x => Object.assign({ _table: x.table }, x.data));
}

/* ---------- optional live room (needs the db capability) ---------- */
let shareTimer = null;
function queueShare() { if (!App.db) return; clearTimeout(shareTimer); shareTimer = setTimeout(shareAll, 1500); }
async function shareAll() {
  if (!App.db) return;
  for (const id of Object.keys(S.labs)) {
    const st = S.labs[id]; if (!st || !Object.keys(st).length || !App.byId[id]) continue;
    try { await App.db.collection('results').doc(id + '__' + S.tableId).set({ lab: id, table: S.table || 'Unnamed table', data: JSON.parse(JSON.stringify(st)), at: Date.now() }); }
    catch (e) { /* retried on the next change */ }
  }
}
function watchRoom(id) {
  if (App.roomUnsub) { App.roomUnsub(); App.roomUnsub = null; }
  if (!App.db) return;
  try {
    App.roomUnsub = App.db.collection('results').where('lab', '==', id).onSnapshot(snap => {
      App.room[id] = snap.docs.map(d => { const x = d.data() || {}; return Object.assign({ _table: String(x.table || 'Table') }, x.data || {}); });
      if (currentLabId() === id && S.tab[id] === 'room') rerender();
    }, () => {});
  } catch (e) { /* live room unavailable */ }
}
function currentLabId() { const id = location.hash.slice(1); return App.byId[id] ? id : null; }
