'use strict';
/* Module 15 · Classify eight use cases on the EU AI Act and the internal
   model, see the portfolio on a heat map, and draft a board report. */
(() => {
  const TIERS = [['prohib', 'Prohibited'], ['high', 'High-risk'], ['limited', 'Limited'], ['minimal', 'Minimal']];
  const FACTORS = [['Autonomy', ['Suggests only', 'Acts with approval', 'Acts alone']], ['Impact', ['Internal convenience', 'Customers or money', 'Safety, legal or rights']], ['Data', ['Public', 'Internal', 'Personal or regulated']], ['Reversibility', ['Easily undone', 'Costly to undo', 'Irreversible']]];
  const CASES = [
    { id: 'u1', t: 'Website chatbot answering customer questions', eu: 'limited', f: [2, 2, 2, 1], why: 'Transparency duty: tell users they are talking to an AI.' },
    { id: 'u2', t: 'Agent that shortlists job applicants from CVs', eu: 'high', f: [2, 3, 3, 2], why: 'Employment and recruitment are listed as high-risk in Annex III.' },
    { id: 'u3', t: 'Drafts marketing emails for staff to review', eu: 'minimal', f: [1, 1, 1, 1], why: 'A person reviews every email; no listed use.' },
    { id: 'u4', t: 'Credit scoring for personal loans', eu: 'high', f: [2, 3, 3, 2], why: 'Assessing the creditworthiness of individuals is listed as high-risk.' },
    { id: 'u5', t: 'SOC copilot that isolates laptops on its own', eu: 'minimal', f: [3, 2, 2, 2], why: 'Not listed in the Act, but it acts alone and disrupts people: Medium to High internally.' },
    { id: 'u6', t: 'Webcam emotion recognition on staff at work', eu: 'prohib', f: [3, 3, 3, 3], why: 'Emotion recognition in the workplace is banned, except for medical or safety reasons.' },
    { id: 'u7', t: 'Agent that approves supplier payments under ₹5 lakh', eu: 'minimal', f: [3, 2, 2, 2], why: 'Not listed in the Act, but money plus autonomy puts it at Medium to High internally.' },
    { id: 'u8', t: 'Generates product images for the website', eu: 'limited', f: [2, 1, 1, 1], why: 'AI-generated content carries transparency duties.' }
  ];
  const score = f => (!f || FACTORS.some((_, i) => !f[i])) ? null : sum(FACTORS.map((_, i) => f[i]));
  const internal = (sc, eu) => sc == null ? null : (eu === 'high' || eu === 'prohib') ? 'High' : sc <= 6 ? 'Low' : sc <= 9 ? 'Medium' : 'High';
  const toneOf = t => t === 'High' ? 'bad' : t === 'Medium' ? 'amber' : 'good';

  function init(st) { st.t = st.t || {}; st.f = st.f || {}; st.rep = st.rep || {}; CASES.forEach(c => { st.f[c.id] = st.f[c.id] || {}; }); return st; }
  function rows(st) { return CASES.map(c => { const sc = score(st.f[c.id]); return { c, sc, it: internal(sc, st.t[c.id]), eu: st.t[c.id] }; }); }

  function heat(st) {
    const x0 = 110, y0 = 20, cw = 170, ch = 120, g = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.push(s('rect', { x: x0 + c * cw, y: y0 + r * ch, width: cw - 4, height: ch - 4, rx: 8, class: 'heat h' + (c + (2 - r)) }));
    FACTORS[0][1].forEach((t, i) => g.push(s('text', { x: x0 + i * cw + cw / 2, y: y0 + 3 * ch + 20, class: 'rt', 'text-anchor': 'middle' }, t)));
    FACTORS[1][1].forEach((t, i) => g.push(svgLines(x0 - 10, y0 + (2 - i) * ch + ch / 2 - 4, wrapWords(t, 12), 'rt', 14, 'end')));
    g.push(s('text', { x: x0 + 1.5 * cw, y: y0 + 3 * ch + 44, class: 'axis', 'text-anchor': 'middle' }, 'Autonomy →'));
    const slot = {};
    rows(st).forEach((r, i) => {
      const f = st.f[r.c.id]; if (!f[0] || !f[1]) return;
      const key = f[0] + '-' + f[1]; const k = slot[key] = (slot[key] || 0) + 1;
      const cx = x0 + (f[0] - 1) * cw + 32 + ((k - 1) % 4) * 36, cy = y0 + (3 - f[1]) * ch + 36 + Math.floor((k - 1) / 4) * 40;
      const rr = 10 + (f[2] || 1) * 3;
      g.push(s('g', { class: 'dot ' + (r.eu === 'prohib' ? 'c4' : r.it === 'High' ? 'c1' : r.it === 'Medium' ? 'c2' : 'c3') }, s('circle', { cx, cy, r: rr }), s('text', { x: cx, y: cy + 4.5, 'text-anchor': 'middle' }, i + 1)));
    });
    return svgWrap(640, 420, 'Portfolio heat map by autonomy and impact', 500, g);
  }
  const ASKS = [['emo', 'Stop the workplace emotion recognition now'], ['hire', 'Approve the hiring agent with conditions'], ['crit', 'No critical finding open beyond 30 days'],
    ['inv', 'Fund discovery of unlisted AI'], ['bom', 'Require an AI bill of materials from vendors']];
  const ONE_ASK = [['budget', 'Budget'], ['people', 'People'], ['policy', 'A policy']];
  const picked = x => typeof x === 'string' ? (x.trim() ? 1 : 0) : x ? Object.keys(x).length : 0;
  const listOf = (x, opts) => typeof x === 'string' ? x : opts.filter(([k]) => x[k]).map(o => o[1]).join('; ');
  function report(st) {
    const R = rows(st), byEU = count(R.map(r => r.eu)), byIn = count(R.map(r => r.it));
    const prohib = R.filter(r => r.eu === 'prohib'), blind = R.filter(r => r.eu === 'minimal' && (r.it === 'High' || r.it === 'Medium'));
    const top = R.filter(r => r.sc != null).sort((a, b) => b.sc - a.sc).slice(0, 3);
    return ['BOARD REPORT · AI use-case portfolio', '',
      'Portfolio: ' + CASES.length + ' use cases. EU AI Act: ' + TIERS.map(([k, t]) => (byEU[k] || 0) + ' ' + t.toLowerCase()).join(', ') + '. Internal: ' + ['High', 'Medium', 'Low'].map(t => (byIn[t] || 0) + ' ' + t.toLowerCase()).join(', ') + '.',
      prohib.length ? 'Stop now: ' + prohib.map(r => r.c.t).join('; ') + '. This use is prohibited.' : '',
      blind.length ? 'Not caught by the Act but material to us: ' + blind.map(r => r.c.t).join('; ') + '.' : '',
      top.length ? 'Highest internal scores: ' + top.map(r => r.c.t + ' (' + r.sc + '/12)').join('; ') + '.' : '',
      picked(st.rep.risks) ? 'Top risks: ' + listOf(st.rep.risks, CASES.map(c => [c.id, c.t])) : '', picked(st.rep.decide) ? 'Decisions needed from the board: ' + listOf(st.rep.decide, ASKS) : '', st.rep.ask ? 'Our ask: ' + ((ONE_ASK.find(x => x[0] === st.rep.ask) || [0, st.rep.ask])[1]) : ''].filter(x => x !== '').join('\n');
  }


  /* ---------- decision rights and the board dashboard ---------- */
  const DEC4 = [['approve', 'Approve'], ['cond', 'Approve with conditions'], ['defer', 'Defer'], ['reject', 'Reject or retire']];
  const deciderOf = (eu, it) => eu === 'prohib' ? 'Nobody: prohibited' : it === 'High' ? 'Model approval board' : it === 'Medium' ? 'Governance council' : it === 'Low' ? 'System owner' : 'Classify first';
  const SUGGEST = { u1: 'cond', u2: 'cond', u3: 'approve', u4: 'cond', u5: 'cond', u6: 'reject', u7: 'cond', u8: 'cond' };
  const BOARD = [
    ['inv', '78%', 'Known AI systems in the inventory', 'invest', 'Below 90% means shadow AI you cannot govern: fund discovery.'],
    ['hra', '9 / 12', 'High-risk systems with a current assessment', 'invest', 'Three high-risk systems run unassessed: set a date or pause them.'],
    ['crit', '4 · 63 days', 'Open critical findings, and the oldest one’s age', 'stop', 'A critical finding open for two months breaks most risk appetites: fix or stop.'],
    ['inc', '3 · 0 high', 'AI incidents this quarter, by severity', 'accept', 'Low severity and handled: accept, and watch the trend.'],
    ['mttc', '42 min', 'Median time to contain an AI incident', 'invest', 'Leaking agents need minutes, not most of an hour: invest in level 1 automation.'],
    ['bom', '35%', 'Vendor AI with an AI bill of materials', 'invest', 'Make AI-BOM a contract requirement at renewal.']];
  const BD = [['accept', 'Accept'], ['invest', 'Invest'], ['stop', 'Stop']];
  const TH = {
    inv: [['95', 'Below 95%'], ['90', 'Below 90%'], ['70', 'Below 70%']],
    hra: [['all', 'Any unassessed'], ['75', 'Below 75%'], ['50', 'Below half']],
    crit: [['30', 'Any over 30 days'], ['60', 'Any over 60 days'], ['90', 'Any over 90 days']],
    inc: [['high', 'Any high severity'], ['3', 'More than 3'], ['10', 'More than 10']],
    mttc: [['15', 'Over 15 min'], ['60', 'Over an hour'], ['240', 'Over 4 hours']],
    bom: [['100', 'Below 100% of new contracts'], ['50', 'Below 50%'], ['none', 'No target']] };
  function governancePart(st) {
    st.dd = st.dd || {}; st.bd = st.bd || {}; st.th = st.th || {};
    const R = rows(st);
    return [
      box('', label('Leadership decision framework'), h('h3', null, 'Four decisions, clear rights to make them'),
        h('p', { class: 'sub' }, 'Decide each use case. Who may decide follows its tier: low by the system owner, medium by the governance council, high by the model approval board, prohibited never.'),
        CASES.map((c, i) => h('div', { class: 'decrow' }, h('div', null, h('b', null, (i + 1) + '. ' + c.t), h('p', { class: 'small' }, 'Decided by: ' + deciderOf(R[i].eu, R[i].it))),
          seg(DEC4, st.dd[c.id], v => { if (v) st.dd[c.id] = v; else delete st.dd[c.id]; }, 'Decision for ' + c.t, 'multi'),
          R[i].eu === 'prohib' && st.dd[c.id] && st.dd[c.id] !== 'reject' ? h('p', { class: 'flagline' }, 'A prohibited use cannot be approved by anyone.') : null))),
      box('', label('Board dashboard · fictional bank, Q3'), h('h3', null, 'Six numbers for the board’s AI risk report'),
        h('p', { class: 'sub' }, 'Give each number a threshold that triggers a decision, then make the call: accept, invest or stop.'),
        h('div', { class: 'boardgrid' }, BOARD.map(([k, v, t]) => h('div', { class: 'kpi' }, h('b', null, v), h('span', null, t),
          h('span', { class: 'small' }, 'Trigger a decision when'), seg(TH[k], st.th[k], x => { if (x) st.th[k] = x; else delete st.th[k]; }, 'Threshold for ' + t, 'multi'),
          seg(BD, st.bd[k], x => { if (x) st.bd[k] = x; else delete st.bd[k]; }, 'Decision for ' + t)))))
    ];
  }

  registerLab({
    id: 'm15', n: '15', mod: 'Governance', title: 'Classify eight use cases, then brief the board', format: 'Classification, board decisions and drills', min: 60,
    roles: ['Risk lead', 'Legal counsel', 'Business owner'],
    task: 'Put each use case in its EU AI Act tier, then score it on the internal four-factor model. The heat map and portfolio update as you go. Finish with a one-page board report drafted from your classification.',
    steps: [[15, 'Classify and score the eight use cases'], [5, 'Read the heat map: where do the Act and you disagree?'], [10, 'Decide each use case; set board thresholds'], [10, 'Finish the board report'], [15, 'Drills: operating model, standards, dates, assurance, maturity'], [5, 'Two tables read theirs aloud']],
    guide: ['This is an illustrative internal model; confirm EU AI Act details with legal counsel.', 'Items 5 and 7 are where tables disagree: the Act does not list them, but they act alone on people or money.', 'Push tables to say “stop” on item 6 in the board report, not “review”.'],
    render(st) {
      init(st); const R = rows(st); const blind = R.filter(r => r.eu === 'minimal' && (r.it === 'High' || r.it === 'Medium'));
      return [
        stepHead('m15', 0),
        CASES.map((c, i) => { const r = R[i]; const f = st.f[c.id];
          return box('case', h('div', { class: 'rowhead' }, h('h3', null, (i + 1) + '. ' + c.t), r.it ? pill('Internal: ' + r.it + (r.sc != null ? ' · ' + r.sc + '/12' : ''), toneOf(r.it)) : null),
            h('p', { class: 'small' }, 'EU AI Act tier'), seg(TIERS, st.t[c.id], v => { if (v) st.t[c.id] = v; else delete st.t[c.id]; }, 'EU AI Act tier'),
            details(r.sc == null ? 'Score it on the internal model' : 'Internal score ' + r.sc + ' / 12', Object.keys(f).length > 0 && r.sc == null,
              h('div', { class: 'factors' }, FACTORS.map(([fn, lv], fi) => h('div', null, h('p', { class: 'small' }, fn),
                seg(lv.map((x, j) => [String(j + 1), (j + 1) + ' · ' + x]), f[fi] != null ? String(f[fi]) : undefined, v => { if (v) f[fi] = +v; else delete f[fi]; }, fn, 'multi'))))),
            st.t[c.id] === 'high' && r.sc != null && r.sc < 10 ? h('p', { class: 'small' }, 'Override applied: anything the Act lists as high-risk is High internally, whatever the score.') : null); }),
        stepHead('m15', 1),
        h('div', { class: 'split wide' },
          box('', label('Portfolio heat map'), h('p', { class: 'sub' }, 'Position by autonomy and impact; size by data sensitivity; colour by internal tier. Dark is prohibited.'), heat(st)),
          box('dark', label('Portfolio'),
            stats(...TIERS.map(([k, t]) => stat(R.filter(r => r.eu === k).length, t))),
            stats(...['High', 'Medium', 'Low'].map(t => stat(R.filter(r => r.it === t).length, 'Internal ' + t.toLowerCase(), toneOf(t)))),
            h('h3', null, 'The Act will not catch these'), blind.length ? h('ul', { class: 'plain' }, blind.map(r => h('li', null, r.c.t))) : h('p', { class: 'sub' }, 'Classify and score to find use cases the Act misses.'))),
        stepHead('m15', 2),
        governancePart(st),
        stepHead('m15', 3),
        box('', label('Board report'), h('p', { class: 'sub' }, 'The first lines are drafted from your classification. Add the rest.'),
          h('p', { class: 'small' }, 'Our top three AI risks' + (picked(st.rep.risks) > 3 ? ' (pick three)' : '')), chips(CASES.map(c => [c.id, c.t]), typeof st.rep.risks === 'object' && st.rep.risks ? st.rep.risks : (st.rep.risks = {}), 'Top risks'),
          h('p', { class: 'small' }, 'Decisions we need from the board'), chips(ASKS, typeof st.rep.decide === 'object' && st.rep.decide ? st.rep.decide : (st.rep.decide = {}), 'Board decisions'),
          h('p', { class: 'small' }, 'Our one ask'), seg(ONE_ASK, st.rep.ask, v => { st.rep.ask = v; }, 'Our one ask'),
          h('pre', { class: 'memo-out' }, report(st)), h('div', { class: 'btnrow' }, copyButton(() => report(st), 'Copy the report')))
      ];
    },
    answers(st) {
      init(st);
      const right = CASES.filter(c => st.t[c.id] === c.eu).length;
      return [
        box('dark', stats(stat(right + ' / 8', 'EU tiers matching the key'))),
        answer('The key lesson', 'The Act’s tier and your internal risk are different questions. The Act sets the legal floor; your internal model decides the controls.'),
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Use case'), h('th', null, 'EU AI Act'), h('th', null, 'Yours'), h('th', null, 'Suggested internal'), h('th', null, 'Why')),
          CASES.map(c => { const sc = sum(c.f); return h('tr', { class: st.t[c.id] && st.t[c.id] !== c.eu ? 'mismatch' : '' }, h('td', null, c.t), h('td', null, nameOf(TIERS, c.eu)), h('td', null, st.t[c.id] ? nameOf(TIERS, st.t[c.id]) : '—'), h('td', null, internal(sc, c.eu) + ' · ' + sc + '/12'), h('td', null, c.why)); }))),
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Board number'), h('th', null, 'Suggested call'), h('th', null, 'Yours'), h('th', null, 'Why')),
          BOARD.map(([k, v, t, a, w]) => h('tr', { class: (st.bd || {})[k] && st.bd[k] !== a ? 'mismatch' : '' }, h('td', null, v + ' · ' + t), h('td', null, nameOf(BD, a)), h('td', null, nameOf(BD, (st.bd || {})[k])), h('td', null, w))))),
        answer('Decisions on the eight use cases', CASES.map((c, i) => (i + 1) + ': ' + nameOf(DEC4, SUGGEST[c.id])).join(' · ') + '. Governance is rarely “no”: most uses are “yes, with these conditions”. Item 6 is the exception.'),
        answer('Confirm with counsel', 'This key is a teaching summary. Obligations and timelines under the Act are phased; check current guidance before relying on it.')
      ];
    },
    agg(docs) {
      return [{ title: 'EU AI Act tier chosen', cats: TIERS, rows: CASES.map((c, i) => ({ label: (i + 1) + '. ' + c.t, counts: count(docs.map(d => d.t && d.t[c.id])) })) },
        { title: 'Board asks', cats: [['n', 'Tables']], rows: ONE_ASK.map(([k, t]) => ({ label: t, counts: { n: docs.filter(d => d.rep && d.rep.ask === k).length } })) },
        { title: 'Decisions tables want from the board', cats: [['n', 'Tables']], rows: ASKS.map(([k, t]) => ({ label: t, counts: { n: docs.filter(d => d.rep && d.rep.decide && typeof d.rep.decide === 'object' && d.rep.decide[k]).length } })) }];
    },
    done: st => !!st.t && Object.keys(st.t).length === 8,
    drills: [
      { id: 'euact', type: 'match', title: 'EU AI Act: true or false?', cats: [['true', 'True'], ['false', 'False']], items: [
        { t: 'Fines can reach €35 million or 7% of global turnover', a: 'true', why: 'For the most serious breaches.' },
        { t: 'The Act does not apply to Indian firms', a: 'false', why: 'It applies to non-EU firms whose AI is used in the EU.' },
        { t: 'Chatbots must disclose that they are AI', a: 'true', why: 'Limited risk carries transparency duties.' },
        { t: 'Spam filters and games carry new duties', a: 'false', why: 'Minimal risk: no new duties.' },
        { t: 'The Digital Omnibus delay paused the prohibitions too', a: 'false', why: 'Prohibitions and GPAI duties stayed in force.' }] },
      { id: 'opmodel', type: 'match', title: 'Who decides what, at three levels', intro: 'Which level owns this?', cats: [['board', 'Board & executive'], ['council', 'AI governance council'], ['owners', 'System owners & teams'], ['audit', 'Independent assurance']], items: [
        { t: 'Set the AI risk appetite', a: 'board', why: 'Sets appetite, approves policy, reviews quarterly.' },
        { t: 'Act as the model approval board for high-risk uses', a: 'council', why: 'Risk, legal, security, data and business.' },
        { t: 'Monitor the claims agent day to day', a: 'owners', why: 'First-line accountability.' },
        { t: 'Test whether the controls at all three levels actually work', a: 'audit', why: 'Internal audit.' },
        { t: 'Approve the AI policy', a: 'board', why: 'Board-level.' },
        { t: 'Run the agent and fix its findings', a: 'owners', why: 'Build, run and monitor.' }] },
      { id: 'standards', type: 'match', title: 'How law, standards and frameworks fit together', intro: 'Which instrument answers this question?', wide: true, cats: [['euact', 'EU AI Act'], ['iso42001', 'ISO/IEC 42001'], ['iso23894', 'ISO/IEC 23894'], ['nist', 'NIST AI RMF'], ['dpdp', 'India DPDP Act']], items: [
        { t: 'What must we do, and by when? (binding in the EU)', a: 'euact', why: 'Regulation.' },
        { t: 'How do we run and prove it? (certifiable)', a: 'iso42001', why: 'Build once on ISO 42001, then map to each regulation.' },
        { t: 'How do we assess AI risk?', a: 'iso23894', why: 'Risk guidance.' },
        { t: 'What should we govern and measure?', a: 'nist', why: 'Voluntary framework.' },
        { t: 'How must personal data be handled in India?', a: 'dpdp', why: 'Data law, duties phased in by May 2027.' }] },
      { id: 'eudates', type: 'match', title: 'EU AI Act: obligations phased to 2028', intro: 'When does each obligation apply? (High-risk dates as moved by the 2026 Digital Omnibus.)', wide: true, cats: [['2025feb', '2 Feb 2025'], ['2025aug', '2 Aug 2025'], ['2027dec', '2 Dec 2027'], ['2028aug', '2 Aug 2028']], items: [
        { t: 'Prohibitions and AI literacy', a: '2025feb', why: 'Already in force.' },
        { t: 'General-purpose AI model duties', a: '2025aug', why: 'Already in force.' },
        { t: 'High-risk uses in Annex III, such as hiring and credit', a: '2027dec', why: 'Moved from August 2026.' },
        { t: 'High-risk AI in regulated products', a: '2028aug', why: 'The last phase.' }] },
      { id: 'assure', type: 'match', title: 'From controls on paper to evidence on demand', intro: 'Which layer is this?', cats: [['framework', 'Control framework'], ['assurance', 'Assurance model'], ['audit', 'Auditability']], items: [
        { t: 'Each control has one owner and maps to NIST AI RMF and ISO 42001', a: 'framework', why: 'Define the controls.' },
        { t: 'Internal audit tests a sample of controls each quarter', a: 'assurance', why: 'Check they work.' },
        { t: 'Model cards, approvals and risk acceptances ready to hand over', a: 'audit', why: 'Prove it on request.' },
        { t: 'System owners self-assess, then the risk function reviews', a: 'assurance', why: 'Lines of assurance.' },
        { t: 'Logs and incident records kept for the retention period', a: 'audit', why: 'Evidence.' }] },
      { id: 'maturity', type: 'rate', radar: true, title: 'AI control maturity: where are we today?', intro: 'Score your own organization in each domain. 1 Ad hoc · 2 Defined · 3 Managed · 4 Measured · 5 Optimised.', cats: [['1', '1 · Ad hoc'], ['2', '2 · Defined'], ['3', '3 · Managed'], ['4', '4 · Measured'], ['5', '5 · Optimised']], items: [
        { t: 'Governance', short: 'Governance' }, { t: 'Inventory', short: 'Inventory' }, { t: 'Architecture & trust', short: 'Architecture' },
        { t: 'Secure delivery', short: 'Delivery' }, { t: 'Monitoring & response', short: 'Monitoring' }, { t: 'Compliance', short: 'Compliance' }] }
    ],
    summary: st => report(init(st))
  });
})();
