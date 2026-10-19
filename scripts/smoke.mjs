// Smoke test: load the app in jsdom, render every lab in every tab, click
// every control a few rounds, and check result codes round-trip.
import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const html = readFileSync('app/index.html', 'utf8');
const body = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<link[^>]*>/g, '');
const dom = new JSDOM('<!doctype html><html><head></head><body>' + body + '</body></html>', { url: 'https://example.test/', runScripts: 'outside-only', pretendToBeVisual: true });
const { window } = dom;
const errors = [];
window.addEventListener('error', e => errors.push(e.message));
window.console.error = (...a) => errors.push(a.map(String).join(' '));
window.scrollTo = () => {};
window.TextEncoder = TextEncoder; window.TextDecoder = TextDecoder;
window.matchMedia = () => ({ matches: false });
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
const all = srcs.map(s => readFileSync('app/' + s, 'utf8')).join('\n;\n') +
  '\n;window.__T = { App, S, makeCode, readCodes, collectedDocs, renderBlock, SCENARIOS, DISCUSSIONS };';
window.eval(all);
const { App, S, makeCode, readCodes } = window.__T;
const doc = window.document;
const go = hash => { window.location.hash = hash; App.render(); };
const fail = m => { console.error('FAIL ' + m); process.exitCode = 1; };

if (App.labs.length !== 10) fail('expected 10 labs, got ' + App.labs.length);
S.table = 'Table 9';
let rng = 7; const rand = n => { rng = (rng * 9301 + 49297) % 233280; return Math.floor(rng / 233280 * n); };

for (const lab of App.labs) {
  go(lab.id);
  for (const tab of ['do', 'ans', 'room']) {
    S.tab[lab.id] = tab; App.render();
    if (!doc.querySelector('#app').children.length) fail(lab.id + ' ' + tab + ' rendered nothing');
  }
  S.tab[lab.id] = 'do'; App.render();
  // click every button a few rounds, re-querying after each render
  for (let round = 0; round < 3; round++) {
    for (let i = 0; i < 70; i++) {
      const pick = [...doc.querySelectorAll('#app button:not([disabled]), #app [role="button"]')];
      if (!pick.length) break;
      const b = pick[rand(pick.length)];
      const t = b.textContent || '';
      if (/Clear this lab|Reset|Start the 60/.test(t)) continue;
      b.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    }
  }
  // exercise the drills and scenarios tabs
  for (const tab of ['drills', 'scen']) {
    S.tab[lab.id] = tab; App.render();
    for (let i = 0; i < 60; i++) {
      const pick = [...doc.querySelectorAll('#app .pane button:not([disabled])')];
      if (!pick.length) break;
      const b = pick[rand(pick.length)];
      if (/Clear/.test(b.textContent || '')) continue;
      b.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
    }
    doc.querySelectorAll('#app .pane textarea, #app .pane input[type=text]').forEach((el, i) => { el.value = 'Answer ' + i; el.dispatchEvent(new window.Event('input', { bubbles: true })); });
  }
  S.tab[lab.id] = 'do'; App.render();
  for (const d of lab.drills || []) {
    if (!d.id || !d.items.length) fail(lab.id + ' drill without id or items');
    if (d.type === 'match') d.items.forEach((it, i) => { if (!d.cats.some(c => c[0] === it.a)) fail(lab.id + ' drill ' + d.id + ' item ' + (i + 1) + ' answer not in categories'); });
  }
  // fill every text field
  doc.querySelectorAll('#app textarea, #app input[type=text]').forEach((el, i) => { el.value = 'Note ' + i + ' “quoted” ₹5,000'; el.dispatchEvent(new window.Event('input', { bubbles: true })); });
  // reveal answers, then render every tab again
  S.revealed[lab.id] = true;
  for (const tab of ['do', 'ans', 'room']) { S.tab[lab.id] = tab; App.render(); }
  // summary and code round trip
  const code = makeCode(lab.id);
  const back = readCodes('chat noise ' + code + ' more noise');
  if (back.length !== 1 || JSON.stringify(back[0].data) !== JSON.stringify(S.labs[lab.id])) fail(lab.id + ' code round trip');
  try { const txt = lab.summary(S.labs[lab.id]); if (typeof txt !== 'string' || !txt.length) fail(lab.id + ' empty summary'); } catch (e) { fail(lab.id + ' summary threw ' + e.message); }
  // collector: add three tables' results, then render the room
  S.collect[lab.id] = { a: { table: 'A', data: S.labs[lab.id] }, b: { table: 'B', data: {} }, c: { table: 'C', data: JSON.parse(JSON.stringify(S.labs[lab.id])) } };
  S.tab[lab.id] = 'room'; App.render();
  if (!doc.querySelector('.roomhead')) fail(lab.id + ' room did not aggregate');
  try { lab.agg([{ _table: 'empty' }]); } catch (e) { fail(lab.id + ' agg on empty doc threw ' + e.message); }
  const done = lab.done(S.labs[lab.id]);
  console.log(lab.id.padEnd(4) + ' ok · done=' + done + ' · ' + doc.querySelectorAll('#app *').length + ' nodes');
}
go(''); if (!doc.querySelector('.stop')) fail('home program map missing');
const scen = window.__T.SCENARIOS;
const nScen = Object.values(scen).reduce((n, l) => n + l.length, 0);
if (nScen !== 34) fail('expected 34 deck scenarios, got ' + nScen);
for (const [mod, list] of Object.entries(scen)) { if (!App.byId[mod]) fail('scenarios for unknown lab ' + mod); list.forEach(sc => { if (sc.q.length !== 3 || !sc.notes) fail(mod + ' ' + sc.id + ' incomplete'); }); }
const disc = window.__T.DISCUSSIONS; if (Object.keys(disc).length !== 9) fail('expected 9 leadership discussions');
const nDrill = App.labs.reduce((n, l) => n + (l.drills || []).reduce((m, d) => m + d.items.length, 0), 0);
console.log('coverage: ' + nScen + ' scenarios · ' + App.labs.reduce((n, l) => n + (l.drills || []).length, 0) + ' drills · ' + nDrill + ' drill items');
const bad = errors.filter(Boolean);
if (bad.length) { bad.slice(0, 10).forEach(e => console.error('ERROR ' + e)); process.exitCode = 1; }
console.log(process.exitCode ? 'smoke FAILED' : 'smoke ok');
window.close();
process.exit(process.exitCode || 0);
