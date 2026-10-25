'use strict';
/* Two shared lab sections:
   - Concept drills: quick classification exercises on the deck's concept
     slides. "match" drills have an answer key shown after the reveal;
     "rate" drills are self-assessments (optionally drawn as a radar).
   - Scenarios: the deck's scenario cards, with the table's answers to the
     three questions and the facilitator's model answer behind a reveal. */

function drillState(st, d) { st.dr = st.dr || {}; return st.dr[d.id] || (st.dr[d.id] = {}); }

function drillBlock(lab, st, d) {
  const ds = drillState(st, d);
  const answered = d.items.filter((_, i) => ds[i] != null).length;
  const right = d.type === 'match' ? d.items.filter((it, i) => ds[i] === it.a).length : 0;
  const head = h('div', { class: 'rowhead' }, h('h3', null, d.title), kindBadge(d.type === 'match' ? 'quiz' : 'decide'),
    pill(answered + ' / ' + d.items.length + ' answered', answered === d.items.length ? 'good' : ''),
    d.type === 'match' && answered ? pill(right + ' / ' + answered + ' correct', right === answered ? 'good' : 'amber') : null);
  const items = d.items.map((it, i) => {
    const mine = ds[i]; const ok = mine === it.a;
    return h('div', { class: 'drillitem' + (d.type === 'match' && mine != null ? (ok ? ' right' : ' wrong') : '') },
      h('p', { class: 'dq' }, h('span', { class: 'kn' }, i + 1), it.t),
      seg(d.cats, mine, v => { if (v == null) delete ds[i]; else ds[i] = v; }, it.t, d.cats.length > 4 || d.wide ? 'multi' : ''),
      d.type === 'match' && mine != null ? h('p', { class: 'feedback ' + (ok ? 'ok' : 'no') }, h('b', null, ok ? '✓ Correct. ' : '✗ Not quite. The answer is ' + nameOf(d.cats, it.a) + '. '), it.why || '') : null);
  });
  let radarEl = null;
  if (d.radar && answered) {
    radarEl = h('div', { class: 'radarbox' }, radar(d.items.map(it => it.short || it.t), [d.items.map((_, i) => ds[i] != null ? +ds[i] : 0)], d.cats.length, { label: d.title }));
  }
  return box('drill', head, d.intro ? h('p', { class: 'sub' }, d.intro) : null,
    h('p', { class: 'small' }, d.type === 'match' ? 'Tap an answer for each question. You see right away whether it is correct and why; you can change it.' : 'A self-assessment for your own organization. There is no right answer.'),
    radarEl, items);
}
function drillsPane(lab) {
  const st = L(lab.id); const ds = lab.drills || [];
  if (!ds.length) return [box('', h('p', { class: 'sub' }, 'No drills for this lab.'))];
  const total = sum(ds.map(d => d.items.length));
  const done = sum(ds.map(d => { const x = (st.dr || {})[d.id] || {}; return d.items.filter((_, i) => x[i] != null).length; }));
  return [box('dark', label('Quick quiz'), h('p', null, 'Short questions on every concept in this module’s slides. Each answer is marked straight away with the reason. Work through them as a table and argue where you disagree.'),
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

/* ---------- case studies: three calls per case, each locked in once made ---------- */
function scenariosFor(lab) { return (typeof SCENARIOS !== 'undefined' && SCENARIOS[lab.id]) || []; }
function casePlays(lab, sc) { return (PLAYS[lab.id] || {})[sc.id]; }
function casePicks(st, sc) { st.pk = st.pk || {}; return st.pk[sc.id] || (st.pk[sc.id] = {}); }
function caseMade(st, sc) { const pk = (st.pk || {})[sc.id] || {}; return sc.q.filter((_, i) => pk[i] != null).length; }
function casePoints(lab, st, sc) { const pl = casePlays(lab, sc), pk = (st.pk || {})[sc.id] || {}; return sum(sc.q.map((_, i) => pk[i] != null ? movePoints(pl[i][+pk[i]][1]) : 0)); }
const CASE_VERDICT = ['Your table would be in the headlines. Read the expert answer and replay it in the debrief.', 'Some good instincts, and some calls that would cost you. Compare with the expert answer.', 'Solid. One call could be sharper: check the strongest move you missed.', 'Every call was the strongest one. Lead the debrief.'];

function scenarioCard(lab, st, sc) {
  const pl = casePlays(lab, sc), pk = casePicks(st, sc);
  const key = lab.id + ':' + sc.id; const rev = !!S.revealed[key];
  const tone = /^Real/.test(sc.tag) ? 'real' : /^Research/.test(sc.tag) ? 'research' : 'composite';
  const made = caseMade(st, sc), done = made === sc.q.length, pts = casePoints(lab, st, sc), max = sc.q.length * 10, stars = starsFor(pts, max);
  return box('scenario', h('div', { class: 'rowhead' }, h('h3', null, sc.title), h('span', { class: 'tag ' + tone }, sc.tag), kindBadge('decide'),
      done ? starRow(stars) : pill(made + ' / ' + sc.q.length + ' calls', made ? 'amber' : '')),
    h('p', { class: 'small' }, label(sc.whatLabel)), h('p', null, sc.what),
    sc.situation ? h('p', { class: 'situation' }, h('b', null, sc.situationLabel + ': '), sc.situation) : null,
    h('div', { class: 'callbox' }, label('Your calls · ' + sc.minutes + ' min'),
      sc.q.map((q, i) => i > made ? h('div', { class: 'qa locked' }, h('p', null, h('b', null, (i + 1) + '. '), q), h('span', { class: 'small' }, 'Unlocks after call ' + i))
        : h('div', { class: 'qa' }, h('p', null, h('b', null, (i + 1) + '. '), q), moveCards(pl[i], pk[i], k => { pk[i] = k; }, lab.id + sc.id + i, q)))),
    done ? h('div', { class: 'casescore' }, starRow(stars), h('div', null, h('b', null, pts + ' / ' + max + ' points'), h('p', { class: 'small' }, CASE_VERDICT[stars]))) : null,
    sc.source ? h('p', { class: 'small' }, sc.source) : null,
    rev ? h('div', { class: 'answer' }, h('b', null, 'Expert answer'), h('p', null, sc.notes)) :
      h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn', onclick: () => { S.revealed[key] = true; commit(); } }, done ? 'Read the expert answer' : 'Skip ahead to the expert answer')));
}
function scenariosPane(lab) {
  const list = scenariosFor(lab); const st = L(lab.id);
  if (!list.length) return [box('', h('p', { class: 'sub' }, 'No scenarios for this module.'))];
  const pts = sum(list.map(sc => casePoints(lab, st, sc))), max = sum(list.map(sc => sc.q.length * 10));
  const done = list.filter(sc => caseMade(st, sc) === sc.q.length);
  const stars = sum(done.map(sc => starsFor(casePoints(lab, st, sc), sc.q.length * 10)));
  return [box('dark', label('Case studies'), h('p', null, 'For each case: read it, argue in role, then make three calls. Each call locks in and shows what happens next. Strong calls score 10, partial ones 5. Debrief with the expert answer.'),
    stats(stat(pts + ' / ' + max, 'Points'), stat(done.length + ' / ' + list.length, 'Cases played'), stat(stars + ' / ' + list.length * 3, 'Stars')), meter(max ? pts / max : 0, 'accent', 'Points')),
    list.map(sc => scenarioCard(lab, st, sc)), discussionCard(lab, st)];
}

/* ---------- leadership discussion: where does our own organization stand? ---------- */
const DISC_VERDICT = [[5, 'Ahead of most', 'good'], [3, 'Partly covered', 'amber'], [0, 'A real gap to take home', 'bad']];
function discussionCard(lab, st) {
  const d = typeof DISCUSSIONS !== 'undefined' && DISCUSSIONS[lab.id]; const pos = DISC_PLAYS[lab.id]; if (!d || !pos) return null;
  st.dp = st.dp || {}; const key = lab.id + ':disc';
  const set = d.items.filter((_, i) => st.dp[i] != null).length, score = sum(d.items.map((_, i) => st.dp[i] != null ? 2 - st.dp[i] : 0));
  const v = DISC_VERDICT.find(([m]) => score >= m);
  return box('discussion', label('Leadership discussion · Module ' + lab.n), h('h3', null, d.q),
    h('p', { class: 'small' }, 'For your own organization. Agree as a table, then tap where you stand today.'),
    d.items.map((q, i) => h('div', { class: 'qa' }, h('p', null, h('b', null, '0' + (i + 1) + ' '), q), levelCards(pos[i], st.dp[i], x => { if (x == null) delete st.dp[i]; else st.dp[i] = x; }, q))),
    set === d.items.length ? h('div', { class: 'casescore' }, h('div', { class: 'gauge ' + v[2] }, h('b', null, score), h('span', null, '/ 6')), h('div', null, h('b', null, v[1]), h('p', { class: 'small' }, 'Each red answer is a candidate for your 90-day plan.'))) : null,
    S.revealed[key] ? h('div', { class: 'answer' }, h('b', null, 'Facilitator note'), h('p', null, d.notes)) : h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn', onclick: () => { S.revealed[key] = true; commit(); } }, 'Show the facilitator note')));
}

const SCORE_CATS = [['2', 'Strong'], ['1', 'Partly'], ['0', 'Risky']];
function scenarioAgg(lab, docs) {
  const d = typeof DISCUSSIONS !== 'undefined' && DISCUSSIONS[lab.id];
  const disc = d && DISC_PLAYS[lab.id] ? [{ title: 'Discussion · ' + d.q, cats: [['0', 'Ready'], ['1', 'Partly'], ['2', 'Gap']],
    rows: d.items.map((q, i) => ({ label: (i + 1) + '. ' + q, counts: count(docs.map(x => x.dp && x.dp[i] != null ? String(x.dp[i]) : null)) })) }] : [];
  return disc.concat(scenariosFor(lab).map(sc => { const pl = casePlays(lab, sc); return {
    title: 'Case · ' + sc.title, cats: SCORE_CATS,
    rows: sc.q.map((q, i) => ({ label: (i + 1) + '. ' + q, counts: count(docs.map(x => { const k = x.pk && x.pk[sc.id] && x.pk[sc.id][i]; return k != null && pl[i][+k] ? String(pl[i][+k][1]) : null; })) }))
  }; }));
}
function scenarioSummary(lab, st) {
  const d = typeof DISCUSSIONS !== 'undefined' && DISCUSSIONS[lab.id]; const pos = DISC_PLAYS[lab.id];
  const disc = d && pos && st.dp && Object.keys(st.dp).length ? ['Discussion "' + d.q + '": ' + d.items.map((q, i) => st.dp[i] != null ? (i + 1) + ') ' + pos[i][st.dp[i]] : '').filter(Boolean).join(' · ')] : [];
  return disc.concat(scenariosFor(lab).filter(sc => caseMade(st, sc)).map(sc => { const pl = casePlays(lab, sc), pk = st.pk[sc.id];
    return 'Case "' + sc.title + '": ' + casePoints(lab, st, sc) + '/' + sc.q.length * 10 + ' · ' + sc.q.map((q, i) => pk[i] != null ? (i + 1) + ') ' + pl[i][+pk[i]][0] : '').filter(Boolean).join(' · '); }));
}
