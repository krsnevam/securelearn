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
  '\n;window.__T = { App, S, makeCode, readCodes, collectedDocs, renderBlock, SCENARIOS, DISCUSSIONS, FLOWS, PLAYS, ROLEPLAYS, EPISODES, TRAPS, DECK, STORY_EXTRA, HARDEN_LAYERS, HD_ATTACKS, hdOutcome, SYLLABUS, HD, ADV_CASES, ADV_TRACKS, NN, NN_SIMS, BD_COUNTS, BD_EPOCHS, bdStart, bdScan, bdPush, RF, RF_THETA, rfAct, RM_EDITS, RM_FACTS, RM, rmEdit, rmRecall, nnDot };';
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
// Syllabus tab: Modules 10–15 open on their syllabus; every topic is answerable and links somewhere real
{
  const clk = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const { SYLLABUS, HD } = window.__T; let n = 0;
  for (const [id, sy] of Object.entries(SYLLABUS)) {
    const topics = sy.groups.flatMap(g => g[1]);
    topics.forEach((t, k) => { if (!(t.o.length >= 2 && t.a >= 0 && t.a < t.o.length && t.say && t.eg && t.why)) fail(id + ' topic ' + (k + 1) + ' incomplete');
      if (t.go && !(['do', 'drills', 'scen', 'deck', 'rag'].includes(t.go) || (t.go.startsWith('harden-') && HD[t.go.slice(7)]))) fail(id + ' topic ' + (k + 1) + ' links to unknown ' + t.go); });
    delete S.tab[id]; delete (S.topics || {})[id]; go(id);
    const cards = doc.querySelectorAll('#app .topic');
    if (cards.length !== topics.length) fail(id + ' shows ' + cards.length + ' topic cards, syllabus has ' + topics.length);
    if (doc.querySelector('#app h1').textContent !== sy.name) fail(id + ' heading is not the syllabus title');
    topics.forEach((t, k) => { const card = doc.getElementById('topic-' + k); const btns = [...card.querySelectorAll('.move')];
      clk(btns.find(b => b.textContent.slice(1) === t.o[t.a])); });
    if (S.topics[id] && topics.some((t, k) => S.topics[id][k] !== t.a)) fail(id + ' could not answer every topic correctly');
    if (doc.querySelectorAll('#app .topic.good').length !== topics.length) fail(id + ' topic cards not marked right');
    n += topics.length;
  }
  console.log('syllabus: ' + Object.keys(SYLLABUS).length + ' modules, ' + n + ' topics, each answered and linked');
}
// Advanced path: every case is complete, walkable to the end and answerable for full marks
{
  const clk = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const { ADV_CASES, ADV_TRACKS } = window.__T;
  delete S.adv; go('adv');
  if (doc.querySelectorAll('#app .card').length !== ADV_CASES.length) fail('advanced index should list every case');
  if (doc.querySelectorAll('#app .sylgroup').length !== ADV_TRACKS.length + 1) fail('advanced index should show every track and the simulations');
  for (const c of ADV_CASES) {
    if (!ADV_TRACKS.some(t => t.id === c.track)) fail('adv ' + c.id + ' has unknown track ' + c.track);
    if (c.steps.length < 3 || c.steps.some(([w, sh, tx]) => !['atk', 'sys', 'def'].includes(w) || !sh || !tx)) fail('adv ' + c.id + ' has an incomplete stage');
    if (!(c.hook && c.gap && c.signal && c.source && c.qs.length === 2)) fail('adv ' + c.id + ' incomplete');
    c.qs.forEach((q, qi) => { if (q.o.length < 2 || q.o.filter(o => o[1] === 10).length !== 1 || q.o.some(o => ![0, 5, 10].includes(o[1]) || !o[2])) fail('adv ' + c.id + ' call ' + (qi + 1) + ' needs one 10-point option and reasons'); });
    go('adv-' + c.id);
    if (doc.querySelector('#app .advgap')) fail('adv ' + c.id + ' reveals the gap before the chain is walked');
    let n = 0; while (n++ < 10) { const b = [...doc.querySelectorAll('#app .advstage .btn')].find(x => /Next stage/.test(x.textContent)); if (!b) break; clk(b); }
    if (!doc.querySelector('#app .advgap') || !doc.querySelector('#app .advsig')) fail('adv ' + c.id + ' gap or signal not shown after the chain');
    if (doc.querySelectorAll('#app .advnode.seen, #app .advnode.now').length !== c.steps.length) fail('adv ' + c.id + ' chain not fully lit');
    c.qs.forEach((q, qi) => { const best = q.o.find(o => o[1] === 10)[0];
      clk([...doc.querySelectorAll('#app .advcall')[qi].querySelectorAll('.move')].find(b => b.querySelector('.mvtext').textContent === best)); });
    if (doc.querySelectorAll('#app .advcall .move.picked.good').length !== 2) fail('adv ' + c.id + ' best calls not marked');
    if (Object.values(S.adv.pk[c.id]).length !== 2 || c.qs.some((q, qi) => q.o[S.adv.pk[c.id][qi]][1] !== 10)) fail('adv ' + c.id + ' could not score full marks');
  }
  go('adv'); if (doc.querySelectorAll('#app .status.done').length !== ADV_CASES.length) fail('advanced index should mark every case done');
  go('labs'); if (!doc.querySelector('#app .advhero')) fail('workbench home lacks the Advanced path card');
  go(''); if (!doc.querySelector('#app .seasonnav a[href="#adv"]')) fail('story home lacks the Advanced path link');
  console.log('advanced path: ' + ADV_CASES.length + ' cases in ' + ADV_TRACKS.length + ' tracks, each walked and answered for full marks');
}
// Inside the model: the simulations compute what the pages claim
{
  const clk = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const T = window.__T; T.NN.sync = true;
  const t0 = Date.now(), res = T.BD_COUNTS.map(c => { const r = T.bdStart(c); return [c, r.hist[T.BD_EPOCHS]]; });
  const ms = Date.now() - t0;
  res.forEach(([c, m]) => { if (m.acc < 0.97) fail('backdoor ' + c + ': clean accuracy ' + m.acc); });
  if (res[0][1].asr > 0.05) fail('backdoor: clean model lets patched malware through ' + res[0][1].asr);
  if (res.filter(([c]) => c >= 2).some(([, m]) => m.asr < 0.9)) fail('backdoor: 2+ poisoned samples should give >90% success: ' + JSON.stringify(res));
  for (const c of T.BD_COUNTS.slice(1)) { const r = T.bdStart(c), pts = T.bdScan(r.net, r.d);
    if (pts.filter(o => o.p && o.flag).length !== c || pts.some(o => o.flag && !o.p)) fail('backdoor scan at ' + c + ' missed or over-flagged');
    if (T.bdStart(c, true).hist[T.BD_EPOCHS].asr > 0.05) fail('backdoor retrain at ' + c + ' still backdoored'); }
  if (Math.max(...T.bdPush(T.bdStart(2).net)) <= 0.4) fail('backdoor: no neuron pushes toward ALLOW on the trigger');
  delete S.nn; go('adv-nn-backdoor'); clk([...doc.querySelectorAll('#app .btn')].find(b => /Train the model/.test(b.textContent)));
  if (!doc.querySelector('#app .nntile.back')) fail('backdoor page does not mark the backdoor neuron');
  clk([...doc.querySelectorAll('#app .btn')].find(b => /weights moved/.test(b.textContent)));
  clk([...doc.querySelectorAll('#app .btn')].find(b => /Remove flagged/.test(b.textContent)));
  if (!/backdoor success 0%/.test(doc.getElementById('app').textContent)) fail('backdoor page: retrain result not shown');
  clk(doc.querySelector('#app .nnpx')); if (!S.nn.bd.px) fail('backdoor: tapping a pixel did nothing');
  // refusal: abliteration removes every refusal, steering refuses everything, the suffix flips one prompt
  const proj = st => T.RF.P.map(p => [p.kind, T.nnDot(T.rfAct(p, st), T.RF.dir) > T.RF_THETA]);
  const base = proj({}), abl = proj({ ab: 100 }), steer = proj({ st: 1.5 });
  if (base.some(([k, r]) => (k === 'bad') !== r)) fail('refusal: base model should refuse exactly the harmful prompts');
  if (abl.some(([, r]) => r)) fail('refusal: full abliteration still refuses');
  if (steer.some(([, r]) => !r)) fail('refusal: full steering should refuse everything');
  if (proj({ sel: 'phish', suffix: true }).find((_, i) => T.RF.P[i].id === 'phish')[1]) fail('refusal: suffix did not flip the phishing prompt');
  go('adv-nn-refusal'); clk([...doc.querySelectorAll('#app .seg button')].find(b => b.textContent === '100%'));
  if (!/0 \/ 4/.test(doc.getElementById('app').textContent)) fail('refusal page does not show 0 of 4 refused');
  // ROME: each edit flips its fact and its paraphrase, and nothing else
  for (const [id, [key, target]] of Object.entries(T.RM_EDITS)) { const e = T.rmEdit(key, target);
    T.RM_FACTS.forEach(([k, , a]) => { const want = k === key ? target : a, got = T.rmRecall(e.W, T.RM.keys[k])[0]; if (got !== want) fail('rome ' + id + ': ' + k + ' recalls ' + got + ', want ' + want); });
    if (T.rmRecall(T.RM.W, T.RM.probe[id])[0] === target || T.rmRecall(e.W, T.RM.probe[id])[0] !== target) fail('rome ' + id + ': paraphrase did not follow the edit'); }
  go('adv-nn-rome'); clk([...doc.querySelectorAll('#app .btn')].find(b => /Apply the rank-one edit/.test(b.textContent)));
  if (doc.querySelectorAll('#app .rmrow.changed').length !== 2) fail('rome page should show the fact and its paraphrase changed');
  for (const x of T.NN_SIMS) { go('adv-nn-' + x.id); clk(doc.querySelector('#app .nnpredict .move')); if (!doc.querySelector('#app .nnpredict .answer')) fail(x.id + ' prediction not revealed'); }
  go('adv'); if (doc.querySelectorAll('#app .nnhero').length !== T.NN_SIMS.length) fail('advanced index lacks the simulation cards');
  go('adv-p250'); if (!doc.querySelector('#app a.nnhero[href="#adv-nn-backdoor"]')) fail('p250 case lacks its simulation link');
  T.NN.sync = false;
  console.log('inside the model: backdoor ' + res.map(([c, m]) => c + '→' + Math.round(m.asr * 100) + '%').join(' ') + ' (' + ms + ' ms for six trainings); scan catches all; abliteration, steering and ROME as claimed');
}
// Harden NEXUS: every failure gets through at first; play each layer with the right answers
{
  const clk = el => el && el.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  const { HARDEN_LAYERS, HD_ATTACKS, hdOutcome } = window.__T;
  const btn = re => [...doc.querySelectorAll('#app .stagebot .btn')].find(b => re.test(b.textContent));
  delete S.harden; go('harden');
  if (doc.querySelectorAll('#app .hdshot').length !== HD_ATTACKS.length) fail('harden console should list every attack');
  if (HD_ATTACKS.some(a => a.kind !== 'benign' && hdOutcome(a) !== 'breach')) fail('harden: with no layers, every failure should get through');
  clk(doc.querySelectorAll('#app .hdshot')[1]); if (!doc.querySelector('#app .hn.hit')) fail('harden console did not show a breach');
  for (const L of HARDEN_LAYERS) {
    go('harden-' + L.id); clk(btn(/Begin/));
    clk(doc.querySelector('#app .hdshot')); if (!doc.querySelector('#app .hdnarr li')) fail('harden ' + L.id + ' simulation ran nothing');
    clk([...doc.querySelectorAll('#app .hdtog button')].find(b => b.textContent === 'Off')); if (!doc.querySelector('#app .hdnarr li.hit')) fail('harden ' + L.id + ' off path shows no breach');
    clk(btn(/Continue/));
    L.qs.forEach((q, qi) => {
      if (q.t === 'mcq') clk(doc.querySelectorAll('#app .card-opt')[q.a]);
      else if (q.t === 'order') { q.s.forEach(t => clk([...doc.querySelectorAll('#app .hdpool .hdstep')].find(b => b.textContent === '+ ' + t))); clk([...doc.querySelectorAll('#app .sc button')].find(b => /Check the order/.test(b.textContent))); }
      else q.rows.forEach((r, ri) => clk(doc.querySelectorAll('#app .hdrow')[ri].querySelectorAll('button')[r[1]]));
      if (!doc.querySelector('#app .consequence.good')) fail('harden ' + L.id + ' drill ' + (qi + 1) + ' not marked right');
      clk(btn(/Continue|Bring the layer online/));
    });
    if (!(S.harden.done[L.id] && S.harden.done[L.id].stars === 3)) fail('harden ' + L.id + ' should finish with 3 stars');
    if (!doc.querySelector('#app .sc-recap')) fail('harden ' + L.id + ' debrief missing');
  }
  const left = HD_ATTACKS.filter(a => a.kind !== 'benign' && hdOutcome(a) !== 'block');
  if (left.length) fail('harden: still getting through with every layer online: ' + left.map(a => a.id).join(', '));
  if (hdOutcome(HD_ATTACKS[0]) !== 'served') fail('harden: the legitimate invoice should be served');
  S.tab.m12 = 'do'; go('m12'); if (!doc.querySelector('#app .hdlink')) fail('Module 12 lab lacks its Harden NEXUS links');
  go(''); if (!doc.querySelector('#app .hdhero')) fail('story home lacks the Harden NEXUS card');
  console.log('harden nexus: ' + HARDEN_LAYERS.length + ' layers played at 3 stars; all ' + (HD_ATTACKS.length - 1) + ' attacks stopped');
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
