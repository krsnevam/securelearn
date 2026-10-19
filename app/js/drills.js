'use strict';
/* Two shared lab sections:
   - Concept drills: quick classification exercises on the deck's concept
     slides. "match" drills have an answer key shown after the reveal;
     "rate" drills are self-assessments (optionally drawn as a radar).
   - Scenarios: the deck's scenario cards, with the table's answers to the
     three questions and the facilitator's model answer behind a reveal. */

function drillState(st, d) { st.dr = st.dr || {}; return st.dr[d.id] || (st.dr[d.id] = {}); }

function drillBlock(lab, st, d) {
  const ds = drillState(st, d); const rev = !!S.revealed[lab.id];
  const answered = d.items.filter((_, i) => ds[i] != null).length;
  const right = d.type === 'match' ? d.items.filter((it, i) => ds[i] === it.a).length : 0;
  const head = h('div', { class: 'rowhead' }, h('h3', null, d.title),
    pill(answered + ' / ' + d.items.length + ' answered', answered === d.items.length ? 'good' : ''),
    d.type === 'match' && rev ? pill(right + ' / ' + d.items.length + ' correct', right === d.items.length ? 'good' : 'amber') : null);
  const items = d.items.map((it, i) => {
    const mine = ds[i]; const ok = mine === it.a;
    return h('div', { class: 'drillitem' + (d.type === 'match' && rev && mine != null ? (ok ? ' right' : ' wrong') : '') },
      h('p', { class: 'dq' }, h('span', { class: 'kn' }, i + 1), it.t),
      seg(d.cats, mine, v => { if (v == null) delete ds[i]; else ds[i] = v; }, it.t, d.cats.length > 4 || d.wide ? 'multi' : ''),
      d.type === 'match' && rev ? h('p', { class: 'small' }, h('b', null, (ok ? 'Correct. ' : 'Answer: ' + nameOf(d.cats, it.a) + '. ')), it.why || '') : null);
  });
  let radarEl = null;
  if (d.radar && answered) {
    radarEl = h('div', { class: 'radarbox' }, radar(d.items.map(it => it.short || it.t), [d.items.map((_, i) => ds[i] != null ? +ds[i] : 0)], d.cats.length, { label: d.title }));
  }
  return box('drill', head, d.intro ? h('p', { class: 'sub' }, d.intro) : null,
    d.type === 'match' && !rev ? h('p', { class: 'small' }, 'Answers show here after the lab’s answers are revealed.') : null,
    radarEl, items);
}
function drillsPane(lab) {
  const st = L(lab.id); const ds = lab.drills || [];
  if (!ds.length) return [box('', h('p', { class: 'sub' }, 'No drills for this lab.'))];
  const total = sum(ds.map(d => d.items.length));
  const done = sum(ds.map(d => { const x = (st.dr || {})[d.id] || {}; return d.items.filter((_, i) => x[i] != null).length; }));
  return [box('dark', label('Concept drills'), h('p', null, 'Quick checks on every concept in this module’s slides. Work through them as a table; argue where you disagree.'),
    stats(stat(done + ' / ' + total, 'Answered'), stat(ds.length, 'Drills')), meter(total ? done / total : 0, 'accent', 'Drills answered')),
    ds.map(d => drillBlock(lab, st, d))];
}
function drillAgg(lab, docs) {
  return (lab.drills || []).map(d => ({
    title: 'Drill · ' + d.title, cats: d.cats,
    rows: d.items.map((it, i) => ({ label: (i + 1) + '. ' + it.t, counts: count(docs.map(x => x.dr && x.dr[d.id] && x.dr[d.id][i])) }))
  }));
}
function drillSummary(lab, st) {
  return (lab.drills || []).map(d => {
    const ds = (st.dr || {})[d.id] || {};
    const n = d.items.filter((_, i) => ds[i] != null).length; if (!n) return '';
    const right = d.type === 'match' ? ' · ' + d.items.filter((it, i) => ds[i] === it.a).length + ' correct' : '';
    return 'Drill "' + d.title + '": ' + n + '/' + d.items.length + ' answered' + right;
  }).filter(Boolean);
}

/* ---------- scenarios ---------- */
function scenariosFor(lab) { return (typeof SCENARIOS !== 'undefined' && SCENARIOS[lab.id]) || []; }
function scenarioCard(lab, st, sc) {
  st.sc = st.sc || {}; const ans = st.sc[sc.id] || (st.sc[sc.id] = {});
  const key = lab.id + ':' + sc.id; const rev = !!S.revealed[key];
  const tone = /^Real/.test(sc.tag) ? 'real' : /^Research/.test(sc.tag) ? 'research' : 'composite';
  return box('scenario', h('div', { class: 'rowhead' }, h('h3', null, sc.title), h('span', { class: 'tag ' + tone }, sc.tag)),
    h('p', { class: 'small' }, label(sc.whatLabel)), h('p', null, sc.what),
    sc.situation ? h('p', { class: 'situation' }, h('b', null, sc.situationLabel + ': '), sc.situation) : null,
    h('div', { class: 'callbox' }, label('Your call · ' + sc.minutes + ' min'),
      sc.q.map((q, i) => h('div', { class: 'qa' }, h('p', null, h('b', null, (i + 1) + '. '), q), field(ans[i], v => { ans[i] = v; }, { id: 'sc-' + lab.id + '-' + sc.id + '-' + i, ph: 'Your table’s answer' })))),
    sc.source ? h('p', { class: 'small' }, sc.source) : null,
    rev ? h('div', { class: 'answer' }, h('b', null, 'Facilitator model answer'), h('p', null, sc.notes)) :
      h('div', { class: 'btnrow' }, confirmTwice('rev-' + key, 'Reveal the model answer', () => { S.revealed[key] = true; })));
}
function scenariosPane(lab) {
  const list = scenariosFor(lab); const st = L(lab.id);
  if (!list.length) return [box('', h('p', { class: 'sub' }, 'No scenarios for this module.'))];
  const answered = list.filter(sc => st.sc && st.sc[sc.id] && Object.values(st.sc[sc.id]).some(v => (v || '').trim())).length;
  return [box('dark', label('Live scenarios'), h('p', null, 'Read (3 min), decide in role (8 min), debrief and compare tables (4 min). Real cases are documented incidents; research findings were shown by researchers; realistic scenarios are composites.'),
    stats(stat(answered + ' / ' + list.length, 'Scenarios answered'))),
    list.map(sc => scenarioCard(lab, st, sc)), discussionCard(lab, st)];
}
function discussionCard(lab, st) {
  const d = typeof DISCUSSIONS !== 'undefined' && DISCUSSIONS[lab.id]; if (!d) return null;
  st.disc = st.disc || {}; const key = lab.id + ':disc';
  return box('discussion', label('Leadership discussion · Module ' + lab.n), h('h3', null, d.q),
    d.items.map((q, i) => h('div', { class: 'qa' }, h('p', null, h('b', null, '0' + (i + 1) + ' '), q), field(st.disc[i], v => { st.disc[i] = v; }, { id: 'disc-' + lab.id + '-' + i, ph: 'For our organization…' }))),
    S.revealed[key] ? h('div', { class: 'answer' }, h('b', null, 'Facilitator note'), h('p', null, d.notes)) : h('div', { class: 'btnrow' }, confirmTwice('rev-' + key, 'Show the facilitator note', () => { S.revealed[key] = true; })));
}
function scenarioAgg(lab, docs) {
  const d = typeof DISCUSSIONS !== 'undefined' && DISCUSSIONS[lab.id];
  const disc = d ? [{ type: 'texts', title: 'Discussion · ' + d.q, items: docs.filter(x => x.disc && Object.values(x.disc).some(v => (v || '').trim())).map(x => [x._table, d.items.map((q, i) => (x.disc[i] || '').trim() ? (i + 1) + ') ' + x.disc[i].trim() : '').filter(Boolean).join('  ')]) }] : [];
  return disc.concat(scenariosFor(lab).map(sc => ({
    type: 'texts', title: 'Scenario · ' + sc.title,
    items: docs.filter(d => d.sc && d.sc[sc.id] && Object.values(d.sc[sc.id]).some(v => (v || '').trim()))
      .map(d => [d._table, sc.q.map((q, i) => (d.sc[sc.id][i] || '').trim() ? (i + 1) + ') ' + d.sc[sc.id][i].trim() : '').filter(Boolean).join('  ')])
  })));
}
function scenarioSummary(lab, st) {
  const d = typeof DISCUSSIONS !== 'undefined' && DISCUSSIONS[lab.id];
  const disc = d && st.disc && Object.values(st.disc).some(v => (v || '').trim()) ? ['Discussion "' + d.q + '": ' + d.items.map((q, i) => (st.disc[i] || '').trim() ? (i + 1) + ') ' + st.disc[i].trim() : '').filter(Boolean).join(' ')] : [];
  return disc.concat(scenariosFor(lab).filter(sc => st.sc && st.sc[sc.id] && Object.values(st.sc[sc.id]).some(v => (v || '').trim()))
    .map(sc => 'Scenario "' + sc.title + '": ' + sc.q.map((q, i) => (st.sc[sc.id][i] || '').trim() ? (i + 1) + ') ' + st.sc[sc.id][i].trim() : '').filter(Boolean).join(' ')));
}
