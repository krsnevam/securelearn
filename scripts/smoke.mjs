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
  '\n;window.__T = { App, S, makeCode, readCodes, collectedDocs, renderBlock, SCENARIOS, DISCUSSIONS, FLOWS, PLAYS, ROLEPLAYS, EPISODES, TRAPS, DECK, STORY_EXTRA };';
window.eval(all);
const { App, S, makeCode, readCodes } = window.__T;
const doc = window.document;
const go = hash => { window.location.hash = hash; App.render(); };
window.HTMLElement.prototype.scrollIntoView = function () {};
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
  { const want = window.__T.FLOWS[lab.id].steps.length, got = doc.querySelectorAll('#app .stephead').length;
    if (want !== got) fail(lab.id + ' shows ' + got + ' step headers, flow defines ' + want);
    if (!doc.querySelector('#app .mission') || !doc.querySelector('#app .checkpanel')) fail(lab.id + ' missing mission or check panel'); }
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
// tap-to-play: no text boxes left, case calls lock in, discussions, role-play dialogue
{
  const click = b => b && b.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  for (const lab of App.labs) for (const tab of ['do', 'drills', 'scen']) {
    S.tab[lab.id] = tab; go(lab.id);
    const boxes = doc.querySelectorAll('#app textarea:not([readonly]), #app input[type=text]');
    if (boxes.length) fail(lab.id + ' ' + tab + ' still has ' + boxes.length + ' text box(es)');
  }
  go('labs'); if (doc.querySelectorAll('#app textarea, #app input[type=text]').length) fail('workbench home still has a text box');
  delete S.labs.m08.pk; delete S.labs.m08.dp; S.tab.m08 = 'scen'; go('m08');
  for (let i = 0; i < 3; i++) click(doc.querySelector('#app .scenario .move:not([aria-disabled])'));
  const pk = S.labs.m08.pk && S.labs.m08.pk.s1;
  if (!pk || Object.keys(pk).length !== 3) fail('case calls not recorded: ' + JSON.stringify(pk));
  if (!doc.querySelector('#app .scenario .casescore .starrow')) fail('case score not shown');
  const before = JSON.stringify(pk); click(doc.querySelector('#app .scenario .move')); if (JSON.stringify(S.labs.m08.pk.s1) !== before) fail('a locked call changed');
  doc.querySelectorAll('#app .discussion .levels').forEach(g => click(g.querySelector('.lvl')));
  if (!doc.querySelector('#app .discussion .gauge')) fail('discussion readiness not shown');
  delete S.labs.m13.dlg; S.tab.m13 = 'do'; go('m13');
  for (let i = 0; i < 3; i++) click(doc.querySelector('#app .roleplay .replies .move'));
  if (Object.keys(S.labs.m13.dlg || {}).length !== 3) fail('role-play replies not recorded');
  if (!doc.querySelector('#app .roleplay .casescore') || !doc.querySelector('#app .roleplay .mood')) fail('role-play debrief or mood missing');
  if (/Claude|live AI/i.test(doc.getElementById('app').textContent)) fail('lab still mentions Claude or live AI');
  S.labs.m16 = { at: 4, ch: { 0: 'a', 1: 'a', 2: 'a', 3: 'a', 4: 'a' }, o: {}, d: {} }; S.tab.m16 = 'do'; go('m16');
  for (let i = 0; i < 9; i++) click(doc.querySelector('#app .lineopt:not(.on):not([aria-disabled])'));
  const picked = ['cust', 'reg', 'lesson'].map(k => Object.keys(S.labs.m16[k] || {}).length);
  if (picked.join() !== '3,3,3') fail('m16 notice builder picked ' + picked.join());
  if (!/Client notice: /.test(window.__T.App.byId.m16.summary(S.labs.m16))) fail('m16 summary misses the client notice');
  console.log('tap-to-play: no text boxes; case calls, discussion and role-play and notice builder ok');
}
go('labs'); if (!doc.querySelector('.stop')) fail('workbench home program map missing');
// the deck: every lab has a Deck tab with its module's slides; #deck shows them all
{
  const click = b => b && b.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  for (const lab of App.labs) {
    S.deck = S.deck || {}; S.deck[lab.id] = 0; S.tab[lab.id] = 'deck'; go(lab.id);
    const n = doc.querySelectorAll('#app .deckthumb').length;
    if (n < 8) fail(lab.id + ' deck tab shows ' + n + ' slides');
    if (!doc.querySelector('#app .slidecanvas section')) fail(lab.id + ' slide did not render');
    if (doc.querySelector('#app .slidecanvas x-icon') && !doc.querySelector('#app .slidecanvas x-icon svg')) fail(lab.id + ' icon not drawn');
    click([...doc.querySelectorAll('#app .deckbar button')].find(b => b.getAttribute('aria-label') === 'Next slide'));
    if ((S.deck || {})[lab.id] !== 1) fail(lab.id + ' next slide did not advance: ' + JSON.stringify(S.deck));
    S.tab[lab.id] = 'do';
  }
  { // in full screen, Next keeps the same viewer element (re-rendering would exit full screen)
    S.deck.m07 = 0; S.tab.m07 = 'deck'; go('m07');
    const v = doc.getElementById('deckviewer');
    Object.defineProperty(doc, 'fullscreenElement', { configurable: true, get: () => v });
    click([...v.querySelectorAll('.deckbar button')].find(b => b.getAttribute('aria-label') === 'Next slide'));
    click([...v.querySelectorAll('.deckbar button')].find(b => b.getAttribute('aria-label') === 'Next slide'));
    if (doc.getElementById('deckviewer') !== v || !v.isConnected) fail('full-screen viewer was replaced on Next');
    if (S.deck.m07 !== 2 || !/^3 \//.test(v.querySelector('.deckpos b').textContent)) fail('full-screen Next did not advance: ' + S.deck.m07);
    Object.defineProperty(doc, 'fullscreenElement', { configurable: true, get: () => null });
    S.tab.m07 = 'do';
  }
  go('deck-m12'); if (!/RAG/.test(doc.querySelector('#app .deckpos').textContent) && S.deck.all !== window.__T.DECK.order.indexOf('m12')) fail('#deck-m12 did not open at Module 12');
  go('deck'); if (doc.querySelectorAll('#app .deckthumb').length !== window.__T.DECK.order.length) fail('full deck incomplete');
  go(''); if (!doc.querySelector('#app .seasonnav a[href="#labs"]') || !doc.querySelector('#app .seasonnav a[href="#deck"]')) fail('story home lacks workbench or deck links');
  console.log('deck: ' + window.__T.DECK.order.length + ' slides; every lab has a Deck tab; home links to workbench and deck');
}
// RAG Lab: a naive design then the expert design
{
  const clk = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  go('rag'); clk(doc.querySelector('#app .stagebot .btn.primary'));
  const pickAll = idx => { for (let st = 0; st < 9; st++) { S.rag.focus = st; App.render(); const cards = doc.querySelectorAll('#app .ragstage .card-opt'); clk(cards[Math.min(idx(st), cards.length - 1)]); } };
  pickAll(() => 0);
  const run = () => { clk([...doc.querySelectorAll('#app .stagebot button')].find(b => /Go live/.test(b.textContent))); let n = 0; while (S.rag.phase === 'run' && n++ < 20) clk([...doc.querySelectorAll('#app .stagebot button')].find(b => /Next event|Incident report/.test(b.textContent))); };
  run();
  if (S.rag.phase !== 'report') fail('RAG naive run did not reach the report');
  const naive = S.rag.runs[0].bad;
  clk([...doc.querySelectorAll('#app .stagebot button')].find(b => /Redesign/.test(b.textContent)));
  const EXPERT = { approach: 'rag', sources: 'tickets', ingest: 'sanitize', store: 'private', access: 'query', rank: 'trust', gen: 'data', output: 'dlp', updates: 'pinned' };
  Object.assign(S.rag.d, EXPERT); App.render(); run();
  const expert = S.rag.runs[1].bad;
  if (!(naive >= 6 && expert === 0)) fail('RAG outcomes unexpected: naive ' + naive + ' incidents, expert ' + expert);
  console.log('rag lab: naive design ' + naive + ' incidents, expert design ' + expert);
}
// story mode: play every episode start to finish
go(''); if (doc.querySelectorAll('#app .ep').length !== 10) fail('season home should list 10 module episodes'); if (!doc.querySelector('#app .nexushero')) fail('NEXUS opening missing on home');
const click = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
for (const ep of window.__T.EPISODES) {
  go(ep.id); let guard = 0;
  while (guard++ < 60) {
    const st = S.story[ep.id]; const sc = ep.scenes[st.i];
    if (sc.type === 'recap') break;
    if (sc.type === 'choice' && st.picks[st.i] == null) click(doc.querySelector('#app .card-opt'));
    if (sc.type === 'spots' && !(st.spots[st.i] || {}).checked) { click(doc.querySelector('#app .spot')); click([...doc.querySelectorAll('#app .stagebot button')].find(b => b.textContent === 'Check')); }
    if (sc.type === 'sort') { let n = 0; while (doc.querySelector('#app .bin') && n++ < 20) click(doc.querySelector('#app .bin')); }
    if (sc.type === 'toggle') click(doc.querySelector('#app .switch'));
    if (sc.type === 'trap' && !(S.traps && S.traps[ep.lab] && S.traps[ep.lab].locked)) { click(doc.querySelector('#app .trapopt')); click([...doc.querySelectorAll('#app .trap button')].find(b => /Lock in/.test(b.textContent))); }
    if (sc.type === 'live') { let n = 0; let b; while ((b = doc.querySelector('#app .sc-live .replies .move')) && n++ < 5) click(b); }
    if (sc.type === 'timeline') { let n = 0; let b; while ((b = [...doc.querySelectorAll('#app .sc-timeline button')].find(x => /Hour|Go live/.test(x.textContent))) && n++ < 10) click(b); }
    const next = [...doc.querySelectorAll('#app .stagebot button')].find(b => /Continue|Begin/.test(b.textContent));
    if (!next || next.disabled) { fail(ep.id + ' stuck on scene ' + st.i + ' (' + sc.type + ')'); break; }
    click(next);
  }
  if (!doc.querySelector('#app .sc-recap') || !S.story[ep.id].finished) fail(ep.id + ' did not reach the recap');
}
go(''); if (!doc.querySelector('#app .repair')) fail('repair board missing after the opening');
// every question in every episode is framed: a story bridge, why it matters, and an explanation once answered
{
  const X = window.__T.STORY_EXTRA; let framed = 0;
  for (const ep of window.__T.EPISODES) ep.scenes.forEach((sc, i) => {
    const x = X[ep.id + ':' + i];
    if (!['choice', 'sort', 'spots', 'toggle', 'timeline', 'live'].includes(sc.type)) { if (x) fail(ep.id + ':' + i + ' extra on a ' + sc.type + ' scene'); return; }
    if (!x || !x.lead || !x.why) { fail(ep.id + ':' + i + ' (' + sc.type + ') has no story bridge or why'); return; }
    if (sc.type !== 'live' && (!x.explain || !x.viz)) fail(ep.id + ':' + i + ' (' + sc.type + ') has no explanation or visual');
    if (x.viz && !['counter', 'clock', 'headline', 'bars', 'feed', 'path'].includes(x.viz.kind)) fail(ep.id + ':' + i + ' unknown visual ' + x.viz.kind);
    framed++;
  });
  S.story.e07.i = 4; go('e07');
  if (!doc.querySelector('#app .leadline') || !doc.querySelector('#app .viz-headline') || !doc.querySelector('#app .whybox')) fail('e07 question frame not rendered');
  if (!doc.querySelector('#app .explainbox')) fail('e07 explanation not shown after answering');
  if (!/Up next/.test(doc.querySelector('#app .stagebot .hint').textContent)) fail('no up-next teaser');
  console.log('story frames: ' + framed + ' questions with a bridge, why it matters, visual and explanation');
  go('');
}
if (doc.querySelectorAll('#app .rpill.ok').length !== 6) fail('all six NEXUS failures should show fixed after every episode');
if (Object.keys(window.__T.TRAPS).length !== 9) fail('expected 9 traps');
console.log('story: ' + window.__T.EPISODES.length + ' episodes played to the end; repair board 6/6');
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
