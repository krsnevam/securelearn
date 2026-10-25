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
  const SYS = [['chat', 'Customer chatbot'], ['credit', 'Credit or loan decisions'], ['hire', 'Hiring screener'], ['fraud', 'Fraud detection'],
    ['claims', 'Claims or document processing'], ['copilot', 'Internal copilot'], ['content', 'Marketing content'], ['code', 'Coding assistant']];
  const OWNER = [['named', 'A named person'], ['team', 'A team'], ['none', 'Nobody clear']];
  const WHO = [['owner', 'System owner'], ['risk', 'Risk lead'], ['data', 'Data / IT team'], ['cxo', 'A CXO']];
  const WHEN = [['7', '7 days'], ['14', '14 days'], ['30', '30 days']];
  const hasEv = (st, i) => { const e = st.e[i]; return typeof e === 'string' ? !!e.trim() : !!e && Object.keys(e).length > 0; };
  const band = t => t >= 10 ? ['Defensible', 'good'] : t >= 6 ? ['Developing', 'amber'] : ['Exposed', 'bad'];
  const effective = (st, i) => { const v = st.s[i]; if (v == null) return null; return st.ch[i] && !hasEv(st, i) ? Math.min(+v, 1) : +v; };

  function init(st) { st.s = st.s || {}; st.e = st.e || {}; st.ch = st.ch || {}; st.gap = st.gap || {}; return st; }
  function totals(st) {
    const vals = P.map((_, i) => effective(st, i));
    const scored = vals.filter(v => v != null).length, total = sum(vals.map(v => v || 0));
    const min = scored ? Math.min(...vals.filter(v => v != null)) : null;
    const weakest = min == null ? [] : P.filter((_, i) => vals[i] === min).map(p => p.name);
    return { vals, scored, total, weakest };
  }

  registerLab({
    id: 'm07', n: '07', mod: 'Responsible AI', title: 'Score one of your own AI systems', format: 'Worksheet and drills', min: 40,
    roles: ['System owner', 'Risk lead', 'Sceptical regulator'],
    task: 'Pick one real AI system from your organization and score it against the six principle tests. For each test, write the evidence you could show today. The regulator can challenge any score; a challenged score with no evidence drops to 1.',
    steps: [[5, 'Profile the system and name its owner'], [15, 'Score all six tests with evidence'], [5, 'The regulator challenges the two best scores'], [5, 'Commit to one 30-day gap'], [10, 'Drills: bias, oversight, frameworks, lifecycle']],
    guide: ['Tables may anonymise the system if it is confidential.', 'The regulator role stops generous self-scoring: their job is to ask “show me” for the highest scores.', 'Expect “none” to cluster on fairness and explainability. The 30-day gap feeds the module discussion and the 90-day plan.'],
    render(st) {
      init(st); const t = totals(st); const [bn, tone] = band(t.total);
      const ctxRisk = (st.aud === 'public' || st.aud === 'cust') && st.role === 'dec';
      return [
        stepHead('m07', 0),
        box('', label('System profile'),
          h('p', { class: 'small' }, 'Which kind of system are you scoring?'),
          seg(SYS, st.sys, v => { st.sys = v; }, 'Kind of system', 'multi'),
          h('p', { class: 'small' }, 'Who owns it today?'),
          seg(OWNER, st.owner, v => { st.owner = v; }, 'Owner'),
          st.owner && st.owner !== 'named' ? h('p', { class: 'flagline' }, 'No named owner: accountability can score 1 at most.') : null,
          h('div', { class: 'split' },
            h('div', null, h('p', { class: 'small' }, 'Who it affects'), seg(AUD, st.aud, v => { st.aud = v; }, 'Who it affects')),
            h('div', null, h('p', { class: 'small' }, 'Its role'), seg(ROLE, st.role, v => { st.role = v; }, 'Its role'))),
          ctxRisk ? h('p', { class: 'flagline' }, 'This system decides on its own about people outside the company. Regulators will expect “Documented” on every test.') : null),
        stepHead('m07', 1),
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
          h('p', { class: 'small' }, 'Evidence you could show a regulator today'),
          chips(p.ev.map((e, j) => [String(j), e]), typeof st.e[i] === 'object' && st.e[i] ? st.e[i] : (st.e[i] = {}), 'Evidence for ' + p.name),
          h('div', { class: 'btnrow' },
            toggle(st.ch[i], st.ch[i] ? 'Regulator challenged this' : 'Regulator: challenge this score', () => { st.ch[i] = !st.ch[i]; })),
          st.ch[i] && !hasEv(st, i) && +st.s[i] === 2 ? h('p', { class: 'flagline' }, 'Challenged with no evidence ticked: counted as 1.') : null)),
        stepHead('m07', 2),
        box('dark', label('Your 30-day gap'),
          h('p', null, t.weakest.length ? 'Weakest: ' + t.weakest.join(', ') : 'Score the tests to find your weakest principle.'),
          t.weakest.length ? [h('p', { class: 'small' }, 'Pick the one fix you will make'),
            seg(P.filter(p => t.weakest.includes(p.name)).flatMap(p => p.ev.map(e => [e, p.name + ': ' + e])), st.gap.action, v => { st.gap.action = v; }, 'The fix', 'multi'),
            h('div', { class: 'split' },
              h('div', null, h('p', { class: 'small' }, 'Who'), seg(WHO, st.gap.who, v => { st.gap.who = v; }, 'Who')),
              h('div', null, h('p', { class: 'small' }, 'By when'), seg(WHEN, st.gap.when, v => { st.gap.when = v; }, 'By when'))),
            st.gap.action && st.gap.who && st.gap.when ? h('p', { class: 'goodline' }, 'Commitment: ' + st.gap.action + ' · ' + nameOf(WHO, st.gap.who) + ' · within ' + nameOf(WHEN, st.gap.when) + '.') : null] : null)
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
        { type: 'texts', title: '30-day commitments', items: docs.filter(d => d.gap && d.gap.action).map(d => [d._table, d.gap.action + (d.gap.who ? ' · ' + nameOf(WHO, d.gap.who) : '') + (d.gap.when ? ' · ' + nameOf(WHEN, d.gap.when) : '')]) }
      ];
    },
    done: st => st.s && Object.keys(st.s).length === 6,
    drills: [
      { id: 'bias', type: 'match', title: 'Bias enters at four points, not one', intro: 'Where does bias enter in each case?', cats: [['data', 'Data'], ['design', 'Design'], ['deploy', 'Deployment'], ['feedback', 'Feedback']], items: [
        { t: 'The hiring model learned from ten years of mostly male promotions', a: 'data', why: 'History reflects past unfair decisions.' },
        { t: 'The loan model optimises for “low servicing cost”, which favours urban customers', a: 'design', why: 'The goal or proxy chosen favours one group.' },
        { t: 'A model tested on English speakers is rolled out in Tamil and Marathi', a: 'deploy', why: 'Used on people it was never tested on.' },
        { t: 'Declined applicants never get loans, so the model never learns they would have repaid', a: 'feedback', why: 'Biased outputs become tomorrow’s data.' },
        { t: 'The fraud model flags more claims from districts the old team audited most', a: 'data', why: 'Past audit patterns are baked into the labels.' },
        { t: 'Customer complaints about the bot are only collected in English', a: 'feedback', why: 'Some groups’ problems never reach the feedback loop.' }] },
      { id: 'proxy', type: 'match', title: 'The PIN-code problem: spot the proxies', intro: 'The loan model never sees religion or caste. Which inputs could stand in for them, or for other protected traits?', cats: [['proxy', 'Proxy risk'], ['low', 'Lower proxy risk']], items: [
        { t: 'PIN code', a: 'proxy', why: 'Neighbourhood often tracks religion, caste and income.' },
        { t: 'Phone model', a: 'proxy', why: 'Tracks income and, indirectly, community.' },
        { t: 'Repayment history on past loans', a: 'low', why: 'Directly about the behaviour being predicted.' },
        { t: 'First name', a: 'proxy', why: 'Can reveal gender, religion or region.' },
        { t: 'College tier', a: 'proxy', why: 'Correlates with caste and class.' },
        { t: 'Verified monthly income', a: 'low', why: 'Relevant to affordability; still test outcomes.' },
        { t: 'Language chosen in the app', a: 'proxy', why: 'Tracks region and community.' }] },
      { id: 'oversight', type: 'match', title: 'Match autonomy to impact', intro: 'Autonomy should shrink as impact and irreversibility grow.', cats: [['in', 'Human in the loop'], ['on', 'Human on the loop'], ['out', 'Human out of the loop']], items: [
        { t: 'Rejecting a job applicant', a: 'in', why: 'Hiring decisions affect rights: a person decides.' },
        { t: 'Refunds under ₹2,000', a: 'on', why: 'AI acts; a person monitors and can step in.' },
        { t: 'Routing support tickets to the right queue', a: 'out', why: 'Low impact, easily corrected, inside guardrails.' },
        { t: 'Sending a legal notice to a customer', a: 'in', why: 'Legal effect: approve each one.' },
        { t: 'Scheduling meetings for a team', a: 'on', why: 'Reversible; someone watches.' },
        { t: 'Approving a personal loan', a: 'in', why: 'Credit is high-impact and regulated.' },
        { t: 'Internal document search', a: 'out', why: 'Low impact within permission-aware guardrails.' }] },
      { id: 'frameworks', type: 'match', title: 'Four frameworks, four different jobs', intro: 'Which framework gives you this?', wide: true, cats: [['nist', 'NIST AI RMF'], ['oecd', 'OECD AI Principles'], ['iso42001', 'ISO/IEC 42001'], ['iso23894', 'ISO/IEC 23894']], items: [
        { t: 'A certifiable management system: policies, roles, controls, continual improvement', a: 'iso42001', why: 'ISO 42001 is the one you can be certified against.' },
        { t: 'Five values-based principles adopted by 40+ countries', a: 'oecd', why: 'OECD, 2019, updated 2024.' },
        { t: 'Four functions: Govern, Map, Measure, Manage, plus a Generative AI profile', a: 'nist', why: 'NIST AI RMF 1.0, 2023.' },
        { t: 'Applies the ISO 31000 risk process to AI', a: 'iso23894', why: 'Risk management guidance.' },
        { t: 'A shared vocabulary for risk conversations across teams', a: 'nist', why: 'Use NIST for shared vocabulary.' },
        { t: 'The values to anchor your AI policy in', a: 'oecd', why: 'Use OECD for values.' }] },
      { id: 'nistfn', type: 'match', title: 'Inside NIST AI RMF', intro: 'Which function does each activity belong to?', cats: [['govern', 'Govern'], ['map', 'Map'], ['measure', 'Measure'], ['manage', 'Manage']], items: [
        { t: 'Name an accountable executive and approve the AI policy', a: 'govern', why: 'Culture, roles, policies and accountability.' },
        { t: 'Describe the intended use and who could be affected', a: 'map', why: 'Understand the context.' },
        { t: 'Run bias, security and reliability tests against thresholds', a: 'measure', why: 'Test and track risks.' },
        { t: 'Prioritise risks, apply controls and respond to incidents', a: 'manage', why: 'Treat and monitor risks.' },
        { t: 'Track accuracy drift every month after launch', a: 'measure', why: 'Ongoing measurement.' },
        { t: 'Decide who signs off high-risk launches', a: 'govern', why: 'Govern runs through the other three.' }] },
      { id: 'lifecycle', type: 'match', title: 'Every model has a life, and an owner', intro: 'Which lifecycle stage is this?', wide: true, cats: [['register', 'Register'], ['document', 'Document'], ['approve', 'Approve'], ['monitor', 'Monitor'], ['retire', 'Retire']], items: [
        { t: 'Add the vendor’s chatbot to the AI inventory', a: 'register', why: 'If it is not in the inventory, it is not governed.' },
        { t: 'Write a model card: purpose, data, limits, owner', a: 'document', why: 'The model card is the core document.' },
        { t: 'Risk-tiered sign-off before production', a: 'approve', why: 'Approval scales with risk.' },
        { t: 'Watch drift, accuracy, fairness and incidents', a: 'monitor', why: 'After launch, continuously.' },
        { t: 'Revoke the pilot’s API keys when it ends', a: 'retire', why: 'A forgotten pilot is a live liability (LLMjacking).' }] },
      { id: 'implement', type: 'match', title: 'From principles to practice', intro: 'Which of the four moves is this?', cats: [['commit', 'Commit'], ['inventory', 'Inventory'], ['embed', 'Embed'], ['evidence', 'Evidence']], items: [
        { t: 'The board approves an AI policy and names an executive owner', a: 'commit', why: 'Commitment from the top.' },
        { t: 'Find shadow AI and vendor AI across the company', a: 'inventory', why: 'You cannot govern what you cannot see.' },
        { t: 'Add an AI impact assessment to project intake and procurement', a: 'embed', why: 'Built into how work starts.' },
        { t: 'Report fairness metrics and audit results quarterly', a: 'evidence', why: 'Proof that it works.' }] }
    ],
    summary(st) {
      init(st); const t = totals(st);
      return ['Responsible AI scorecard: ' + (st.sys ? (SYS.find(x => x[0] === st.sys) || [0, st.sys])[1] : 'unnamed system') + (st.owner ? ' (owner: ' + (OWNER.find(x => x[0] === st.owner) || [0, st.owner])[1] + ')' : ''),
        ...P.map((p, i) => '- ' + p.name + ': ' + (t.vals[i] == null ? 'not scored' : t.vals[i]) + (hasEv(st, i) ? ' · evidence: ' + (typeof st.e[i] === 'string' ? st.e[i] : p.ev.filter((_, j) => st.e[i][j]).join('; ')) : '')),
        'Total ' + t.total + '/12 · ' + band(t.total)[0], st.gap.action ? '30-day gap: ' + st.gap.action : ''].filter(Boolean).join('\n');
    }
  });
})();
