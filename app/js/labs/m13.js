'use strict';
/* Module 13 · Go / no-go for ClaimsBot: readiness pack, private briefs,
   conditions that close gates and move risks, and a drafted decision memo. */
(() => {
  const PACK = [
    ['own', 'Ownership', 'Named business owner and technical owner', true, 'Business owner: Head of Motor Claims. Technical owner: Claims Platform lead.'],
    ['risk', 'Risk', 'Risk tier assigned; residual risk formally accepted', true, 'Tier: High (acts alone on money). Acceptance pending this meeting.'],
    ['sec', 'Security', 'Threat model done; critical test findings closed', false, 'Critical finding open: text inside an uploaded claim photo can tell the agent to approve the claim. Fix scheduled two weeks after launch.'],
    ['acc', 'Access', 'Least privilege; own agent identity; no shared admin', true, 'Own service identity; can approve up to ₹50,000; cannot change payee details.'],
    ['mon', 'Monitoring', 'Telemetry reaching the SOC; alerts defined', true, 'Decisions and tool calls stream to the SOC. Alert on approval spikes.'],
    ['resp', 'Response', 'Kill switch tested; escalation contacts named', false, 'Kill switch built but never tested. Escalation contacts named.'],
    ['comp', 'Compliance', 'Regulatory classification and documentation complete', true, 'Classification and model documentation complete.']
  ];
  const BRIEFS = [
    ['owner', 'Business owner (chair)', 'A competitor launched a claims bot last month. Marketing has booked a ₹40 lakh campaign for Monday. Every week of delay costs about 1,800 slow claims and some angry customers. You want to launch, but you will be the one who signs.'],
    ['ciso', 'CISO', 'The critical finding is easy to exploit: a line of text in a photo of a dented bumper. Motor-claims fraud is common and organised. You will not sign off while it is open unless something else stops a fake claim being paid.'],
    ['legal', 'Legal', 'Customers must be told an AI decides their claim and how to reach a person. Wrongly refused claims will become complaints to the regulator. You want disclosure and an appeal route in place on day one.'],
    ['product', 'Product lead', 'You can launch Monday with a person approving every claim for two weeks while the fix ships. It is slower than the full bot but faster than today. You also have a one-region pilot ready.'],
    ['observer', 'Observer', 'Do not speak in the meeting. Note who changed their mind, what made them change it, and whether the decision followed the readiness rule.']
  ];
  const GNG = [['go', 'Go'], ['cond', 'Go with conditions'], ['nogo', 'No-go']];
  const CONDS = [
    ['human', 'A person approves every claim until the fix ships', 'sec'],
    ['cap', 'Cap AI approvals at ₹10,000 until the fix ships', 'sec-part'],
    ['kill', 'Test the kill switch before Monday', 'resp'],
    ['disclose', 'Tell customers AI decides, with a route to a person', 'legal'],
    ['region', 'Launch in one region first', 'scope'],
    ['sample', 'Review a daily sample of decisions for two weeks', 'mon'],
    ['accept', 'Business owner signs a written risk acceptance', 'accept']];
  const RISKS = [
    { id: 'R1', name: 'Fake claim approved via photo text', L: 3, I: 3, after: c => c.human ? [1, 3] : c.cap ? [3, 1] : null },
    { id: 'R2', name: 'Kill switch fails during an incident', L: 2, I: 3, after: c => c.kill ? [1, 3] : null },
    { id: 'R3', name: 'Complaints over unexplained refusals', L: 2, I: 2, after: c => c.disclose ? [1, 2] : null },
    { id: 'R4', name: 'Errors hit every customer at once', L: 2, I: 3, after: c => c.region ? [2, 2] : null }];

  function init(st) { st.c = st.c || {}; return st; }
  function gates(st) {
    const c = st.c;
    const sec = c.human ? 'closed' : c.cap ? 'partial' : 'open';
    const resp = c.kill ? 'closed' : 'open';
    const ruleOk = (sec === 'closed' && resp === 'closed') || !!(c.accept && (st.signer || '').trim());
    return { sec, resp, ruleOk };
  }
  function verdict(st) {
    const g = gates(st);
    if (!st.dec) return ['Decide to see whether it follows the readiness rule.', ''];
    if (st.dec === 'nogo') return ['No-go is always consistent with the rule. Say what must change before you meet again.', 'good'];
    if (g.ruleOk) return ['This decision follows the readiness rule.', 'good'];
    if (st.dec === 'go') return ['A plain go with two “No”s and no signed acceptance breaks the organization’s own rule.', 'bad'];
    return ['Your conditions do not yet close both gaps. Close them, or have the owner sign a written acceptance.', 'amber'];
  }
  function riskGrid(st) {
    const x0 = 120, y0 = 20, cw = 150, ch = 100, g = [arrowDefs('m13a')];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) g.push(s('rect', { x: x0 + c * cw, y: y0 + r * ch, width: cw - 4, height: ch - 4, rx: 8, class: 'heat h' + (c + (2 - r)) }));
    ['Unlikely', 'Possible', 'Likely'].forEach((t, i) => g.push(s('text', { x: x0 + i * cw + cw / 2, y: y0 + 3 * ch + 20, class: 'rt', 'text-anchor': 'middle' }, t)));
    ['Minor', 'Serious', 'Severe'].forEach((t, i) => g.push(s('text', { x: x0 - 10, y: y0 + (2 - i) * ch + ch / 2 + 4, class: 'rt', 'text-anchor': 'end' }, t)));
    g.push(s('text', { x: x0 + 1.5 * cw, y: y0 + 3 * ch + 44, class: 'axis', 'text-anchor': 'middle' }, 'Likelihood →'));
    const at = (L, I, k) => [x0 + (L - 1) * cw + 40 + k * 34, y0 + (3 - I) * ch + 50];
    const slots = {};
    RISKS.forEach(r => {
      const a = r.after(st.c);
      const keyB = r.L + '-' + r.I; const kb = slots[keyB] = (slots[keyB] || 0) + 1;
      const [bx, by] = at(r.L, r.I, kb - 1);
      if (a) {
        const keyA = a[0] + '-' + a[1]; const ka = slots[keyA] = (slots[keyA] || 0) + 1;
        const [ax, ay] = at(a[0], a[1], ka - 1);
        g.push(s('line', { x1: bx, y1: by, x2: ax, y2: ay, class: 'ed dashed', 'marker-end': 'url(#m13a)' }));
        g.push(s('g', { class: 'dot c3 ghost' }, s('circle', { cx: bx, cy: by, r: 14 }), s('text', { x: bx, y: by + 4, 'text-anchor': 'middle' }, r.id.slice(1))));
        g.push(s('g', { class: 'dot c1' }, s('circle', { cx: ax, cy: ay, r: 14 }), s('text', { x: ax, y: ay + 4, 'text-anchor': 'middle' }, r.id.slice(1))));
      } else g.push(s('g', { class: 'dot c2' }, s('circle', { cx: bx, cy: by, r: 14 }), s('text', { x: bx, y: by + 4, 'text-anchor': 'middle' }, r.id.slice(1))));
    });
    return svgWrap(600, 380, 'Risk grid before and after conditions', 480, g);
  }
  function memo(st) {
    const g = gates(st);
    return ['GO / NO-GO DECISION · ClaimsBot',
      'Decision: ' + (st.dec ? nameOf(GNG, st.dec) : 'not yet decided'),
      'Conditions: ' + (CONDS.filter(([k]) => st.c[k]).map(([, t]) => t).join('; ') || 'none'),
      'Security gap: ' + g.sec + ' · Response gap: ' + g.resp,
      'Residual risk accepted by: ' + ((st.signer || '').trim() || 'nobody yet'),
      'Readiness rule: ' + (g.ruleOk || st.dec === 'nogo' ? 'followed' : 'NOT followed'),
      st.note ? 'Notes: ' + st.note : ''].filter(Boolean).join('\n');
  }

  registerLab({
    id: 'm13', n: '13', mod: 'Productization', title: 'Run the go / no-go meeting for ClaimsBot', format: 'Role-play', min: 40,
    roles: ['Business owner (chair)', 'CISO', 'Legal', 'Product lead', 'Observer'],
    task: 'ClaimsBot approves motor-insurance claims under ₹50,000 and launches on Monday. Its readiness pack has two “No”s. Each person reads a private brief, then the table holds the meeting and must reach one decision that follows the readiness rule.',
    steps: [[5, 'Read the pack and your private brief'], [20, 'The meeting, chaired by the business owner'], [5, 'Decide, set conditions, sign'], [10, 'Tables compare decisions']],
    guide: ['Each participant opens the lab on their own phone and picks a role to read their private brief.', 'The readiness rule: one “No” means no go-live unless the owner accepts the risk in writing.', 'Ask the observers last: who changed their mind, and why? Usually it is the product lead’s fallback, not the CISO’s warning.'],
    render(st) {
      init(st); const g = gates(st); const [vt, vtone] = verdict(st); const b = BRIEFS.find(x => x[0] === st.role);
      const after = k => k === 'sec' ? g.sec : k === 'resp' ? g.resp : null;
      return [
        box('', label('Readiness pack'), h('div', { class: 'scroll' }, h('table', null,
          h('tr', null, h('th', null, 'Area'), h('th', null, 'Must be true'), h('th', null, 'Ready?'), h('th', null, 'With your conditions')),
          PACK.map(([k, a, m, y, ev]) => h('tr', null, h('td', null, h('b', null, a)), h('td', null, m, h('div', { class: 'small' }, ev)), h('td', { class: y ? 'yes' : 'no' }, y ? 'Yes' : 'No'),
            h('td', null, y ? '—' : pill(after(k) === 'closed' ? 'Closed' : after(k) === 'partial' ? 'Partly closed' : 'Still open', after(k) === 'closed' ? 'good' : after(k) === 'partial' ? 'amber' : 'bad')))))),
          h('p', { class: 'small' }, 'Rule: one “No” means no go-live, unless the owner accepts the risk in writing.')),
        box('', label('Your private brief'), h('p', { class: 'sub' }, 'Pick your role on your own phone. Do not show your brief to the others.'),
          seg(BRIEFS.map(x => [x[0], x[1]]), st.role, v => { st.role = v; }, 'Your role', 'wrap'),
          b ? h('div', { class: 'brief' }, label(b[1]), h('p', null, b[2])) : null),
        h('div', { class: 'split wide' },
          box('', label('Conditions'), h('p', { class: 'sub' }, 'Each condition closes a gap or moves a risk.'), h('div', { class: 'condlist' }, CONDS.map(([k, t, tag]) =>
            h('button', { type: 'button', class: 'condbtn', 'aria-pressed': String(!!st.c[k]), onclick: () => { if (st.c[k]) delete st.c[k]; else st.c[k] = true; commit(); } },
              h('span', { class: 'sw2' }), h('span', null, t), h('span', { class: 'small' }, ({ sec: 'Closes the security gap', 'sec-part': 'Limits the security gap', resp: 'Closes the response gap', legal: 'Answers legal', scope: 'Limits blast radius', mon: 'Strengthens monitoring', accept: 'Satisfies the rule in writing' })[tag]))))),
          box('', label('Risk grid'), h('p', { class: 'sub' }, 'Grey: before. Blue: after your conditions. Amber: unchanged.'), riskGrid(st),
            h('ul', { class: 'plain small' }, RISKS.map(r => h('li', null, h('b', null, r.id.slice(1) + '. '), r.name))))),
        box('dark', label('The decision'), seg(GNG, st.dec, v => { st.dec = v; }, 'Decision'),
          field(st.signer, v => { st.signer = v; }, { line: 1, id: 'm13-signer', ph: 'Who accepts the residual risk in writing?' }),
          field(st.note, v => { st.note = v; }, { id: 'm13-note', ph: st.dec === 'nogo' ? 'What must change before we meet again?' : 'Anything else the record should show' }),
          h('div', { class: 'verdict ' + vtone }, vt)),
        box('', label('Decision memo'), h('pre', { class: 'memo-out' }, memo(st)), h('div', { class: 'btnrow' }, copyButton(() => memo(st), 'Copy the memo')))
      ];
    },
    answers(st) {
      init(st);
      return [
        answer('A strong answer: go with conditions', 'A person approves every claim until the critical fix ships, which closes the injection risk. The kill switch is tested before Monday. Customers are told an AI decides and how to reach a person. The business owner signs the residual-risk acceptance.'),
        answer('Why a cap alone is not enough', 'Capping approvals at ₹10,000 limits each loss but not the number of fake claims. Organised fraud works at volume.'),
        answer('Why not a plain go', 'Two “No”s with no written acceptance breaks the organization’s own rule. If the owner will not sign, that is the answer.'),
        answer('Your table', verdict(st)[0], verdict(st)[1] === 'bad' ? 'bad' : '')
      ];
    },
    agg(docs) {
      return [{ title: 'Go / no-go decisions', cats: GNG, rows: [{ label: 'ClaimsBot', counts: count(docs.map(d => d.dec)) }] },
        { title: 'Conditions tables set', cats: [['n', 'Tables']], rows: CONDS.map(([k, t]) => ({ label: t, counts: { n: docs.filter(d => d.c && d.c[k]).length } })) },
        { title: 'Followed the readiness rule', cats: [['y', 'Followed'], ['n', 'Did not']], rows: [{ label: 'All tables', counts: count(docs.map(d => { const x = Object.assign({ c: {} }, d); return x.dec ? (x.dec === 'nogo' || gates(x).ruleOk ? 'y' : 'n') : null; })) }] }];
    },
    done: st => !!st.dec,
    summary: st => memo(init(st))
  });
})();
