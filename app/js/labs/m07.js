'use strict';
/* Module 07 · Responsible AI scorecard with a live six-axis radar. */
(() => {
  const P = [
    { k: 'fair', name: 'Fairness', test: 'Have we measured outcomes by customer group?', ev: ['Approval or error rates split by gender, age band, region or language', 'A threshold for an acceptable gap, and who reviews it'] },
    { k: 'expl', name: 'Explainability', test: 'Could we explain this decision to the person affected?', ev: ['A plain-language reason given with each decision', 'A tested script for the complaints team'] },
    { k: 'trans', name: 'Transparency', test: 'Do people know when AI is involved?', ev: ['A visible “AI-generated” notice in the product', 'A public page listing where AI is used'] },
    { k: 'acct', name: 'Accountability', test: 'Is one named person answerable for this system?', ev: ['A named owner in the AI inventory, not a team', 'Their sign-off on the last release'] },
    { k: 'over', name: 'Human oversight', test: 'Can a person monitor, override and stop it?', ev: ['An override button staff actually use', 'A kill switch tested in the last 90 days'] },
    { k: 'bias', name: 'Bias management', test: 'Is bias tested before launch and monitored after?', ev: ['A pre-launch bias test report', 'A monthly drift and fairness dashboard'] }
  ];
  const LEVELS = [['0', '0 · None'], ['1', '1 · Partial'], ['2', '2 · Documented']];
  const AUD = [['staff', 'Internal staff'], ['cust', 'Customers'], ['public', 'The public']];
  const ROLE = [['adv', 'Advises a person'], ['dec', 'Decides on its own']];
  const band = t => t >= 10 ? ['Defensible', 'good'] : t >= 6 ? ['Developing', 'amber'] : ['Exposed', 'bad'];
  const effective = (st, i) => { const v = st.s[i]; if (v == null) return null; return st.ch[i] && !(st.e[i] || '').trim() ? Math.min(+v, 1) : +v; };

  function init(st) { st.s = st.s || {}; st.e = st.e || {}; st.ch = st.ch || {}; st.gap = st.gap || {}; return st; }
  function totals(st) {
    const vals = P.map((_, i) => effective(st, i));
    const scored = vals.filter(v => v != null).length, total = sum(vals.map(v => v || 0));
    const min = scored ? Math.min(...vals.filter(v => v != null)) : null;
    const weakest = min == null ? [] : P.filter((_, i) => vals[i] === min).map(p => p.name);
    return { vals, scored, total, weakest };
  }

  registerLab({
    id: 'm07', n: '07', mod: 'Responsible AI', title: 'Score one of your own AI systems', format: 'Worksheet', min: 30,
    roles: ['System owner', 'Risk lead', 'Sceptical regulator'],
    task: 'Pick one real AI system from your organization and score it against the six principle tests. For each test, write the evidence you could show today. The regulator can challenge any score; a challenged score with no evidence drops to 1.',
    steps: [[5, 'Profile the system and name its owner'], [15, 'Score all six tests with evidence'], [5, 'The regulator challenges the two best scores'], [5, 'Commit to one 30-day gap']],
    guide: ['Tables may anonymise the system if it is confidential.', 'The regulator role stops generous self-scoring: their job is to ask “show me” for the highest scores.', 'Expect “none” to cluster on fairness and explainability. The 30-day gap feeds the module discussion and the 90-day plan.'],
    render(st) {
      init(st); const t = totals(st); const [bn, tone] = band(t.total);
      const ctxRisk = (st.aud === 'public' || st.aud === 'cust') && st.role === 'dec';
      return [
        box('', label('System profile'),
          h('div', { class: 'split' },
            field(st.sys, v => { st.sys = v; }, { line: 1, id: 'm07-sys', ph: 'System name (anonymise if needed)' }),
            field(st.owner, v => { st.owner = v; }, { line: 1, id: 'm07-owner', ph: 'Owner, by name' })),
          field(st.purpose, v => { st.purpose = v; }, { line: 1, id: 'm07-purpose', ph: 'What it does, in one line' }),
          h('div', { class: 'split' },
            h('div', null, h('p', { class: 'small' }, 'Who it affects'), seg(AUD, st.aud, v => { st.aud = v; }, 'Who it affects')),
            h('div', null, h('p', { class: 'small' }, 'Its role'), seg(ROLE, st.role, v => { st.role = v; }, 'Its role'))),
          ctxRisk ? h('p', { class: 'flagline' }, 'This system decides on its own about people outside the company. Regulators will expect “Documented” on every test.') : null),
        h('div', { class: 'split wide' },
          box('dark', label('Live scorecard'),
            h('div', { class: 'radarbox' }, radar(P.map(p => p.name), [t.vals.map(v => v || 0)], 2, { target: 2, label: 'Principle scores' })),
            stats(stat(t.total + ' / 12', 'Total'), stat(t.scored + ' / 6', 'Tests scored'), stat(bn, 'Band', tone))),
          box('', label('How to score'),
            h('ul', { class: 'plain' },
              h('li', null, h('b', null, '0 · None. '), 'Nothing written down, or “we think so”.'),
              h('li', null, h('b', null, '1 · Partial. '), 'Some evidence, but out of date, informal or untested.'),
              h('li', null, h('b', null, '2 · Documented. '), 'You could hand a regulator the evidence today.')),
            h('p', { class: 'small' }, 'Bands: 0–5 Exposed · 6–9 Developing · 10–12 Defensible.'))),
        P.map((p, i) => box('principle', h('div', { class: 'rowhead' }, h('h3', null, p.name), st.ch[i] ? pill('Challenged', 'bad') : null),
          h('p', { class: 'sub' }, 'Test: ' + p.test),
          seg(LEVELS, st.s[i], v => { if (v == null) delete st.s[i]; else st.s[i] = v; }, p.name),
          field(st.e[i], v => { st.e[i] = v; }, { id: 'm07-e' + i, ph: 'Evidence we could show today, or “none”' }),
          h('div', { class: 'btnrow' },
            toggle(st.ch[i], st.ch[i] ? 'Regulator challenged this' : 'Regulator: challenge this score', () => { st.ch[i] = !st.ch[i]; }),
            details('What good evidence looks like', false, h('ul', { class: 'plain' }, p.ev.map(e => h('li', null, e))))),
          st.ch[i] && !(st.e[i] || '').trim() && +st.s[i] === 2 ? h('p', { class: 'flagline' }, 'Challenged with no evidence written: counted as 1.') : null)),
        box('dark', label('Your 30-day gap'),
          h('p', null, t.weakest.length ? 'Weakest: ' + t.weakest.join(', ') : 'Score the tests to find your weakest principle.'),
          field(st.gap.action, v => { st.gap.action = v; }, { id: 'm07-gap', ph: 'The one thing we will fix in 30 days' }),
          h('div', { class: 'split' },
            field(st.gap.who, v => { st.gap.who = v; }, { line: 1, id: 'm07-gap-who', ph: 'Who' }),
            field(st.gap.when, v => { st.gap.when = v; }, { line: 1, id: 'm07-gap-when', ph: 'By when' })))
      ];
    },
    answers(st) {
      init(st); const t = totals(st);
      return [
        answer('There is no answer key for your own system', 'The score only means something if the regulator could see the evidence. Any 2 that nobody can show in the room is really a 1.'),
        answer('Where tables usually land', 'Most systems score 5 to 8. “None” clusters on fairness and explainability. Accountability is often a team rather than a named person, which is a 1 at best.'),
        answer('Read your shape', t.scored ? 'Your weakest: ' + t.weakest.join(', ') + '. A lopsided radar usually means the controls were built by one function (often security) without the others.' : 'Score your tests to see your shape.'),
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Principle'), h('th', null, 'Evidence a regulator accepts')), P.map(p => h('tr', null, h('td', null, h('b', null, p.name)), h('td', null, p.ev.join('; ')))))),
        answer('Take it forward', 'Your 30-day gap becomes a personal commitment in the module discussion and is revisited in the 90-day plan.')
      ];
    },
    agg(docs) {
      const avg = P.map((_, i) => { const v = docs.map(d => d.s && d.s[i]).filter(x => x != null).map(Number); return v.length ? sum(v) / v.length : 0; });
      return [
        { type: 'radar', title: 'Room average by principle', note: 'Average of every table’s score, 0 to 2.', axes: P.map(p => p.name), series: [avg], max: 2, target: 2 },
        { title: 'Scores by principle', cats: LEVELS, rows: P.map((p, i) => ({ label: p.name, counts: count(docs.map(d => d.s && d.s[i])) })) },
        { type: 'texts', title: '30-day commitments', items: docs.filter(d => d.gap && d.gap.action).map(d => [d._table, d.gap.action + (d.gap.who ? ' · ' + d.gap.who : '') + (d.gap.when ? ' · ' + d.gap.when : '')]) }
      ];
    },
    done: st => st.s && Object.keys(st.s).length === 6,
    summary(st) {
      init(st); const t = totals(st);
      return ['Responsible AI scorecard: ' + (st.sys || 'unnamed system') + (st.owner ? ' (owner: ' + st.owner + ')' : ''),
        ...P.map((p, i) => '- ' + p.name + ': ' + (t.vals[i] == null ? 'not scored' : t.vals[i]) + (st.e[i] ? ' · ' + st.e[i] : '')),
        'Total ' + t.total + '/12 · ' + band(t.total)[0], st.gap.action ? '30-day gap: ' + st.gap.action : ''].filter(Boolean).join('\n');
    }
  });
})();
