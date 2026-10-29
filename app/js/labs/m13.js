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
  const SIGNERS = [['owner', 'Vikram Mehta, the business owner'], ['ciso', 'The CISO'], ['team', 'The project team'], ['none', 'Nobody']];
  const SIGNER_WARN = { ciso: 'Security can advise, but the business owns this risk.', team: 'A team cannot accept risk. The rule needs a named person.', none: 'Without a signature, a “No” in the pack means no go-live.' };
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
    const ruleOk = (sec === 'closed' && resp === 'closed') || !!(c.accept && st.signer === 'owner');
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
      'Residual risk accepted by: ' + (st.signer ? (SIGNERS.find(x => x[0] === st.signer) || [0, st.signer])[1] : 'nobody yet'),
      'Readiness rule: ' + (g.ruleOk || st.dec === 'nogo' ? 'followed' : 'NOT followed'),
      ].filter(Boolean).join('\n');
  }

  registerLab({
    id: 'm13', n: '13', mod: 'Productization & lifecycle', title: 'Run the go / no-go meeting for ClaimsBot', format: 'Role-play and drills', min: 55,
    roles: ['Business owner (chair)', 'CISO', 'Legal', 'Product lead', 'Observer'],
    task: 'ClaimsBot approves motor-insurance claims under ₹50,000 and launches on Monday. Its readiness pack has two “No”s. Each person reads a private brief, then the table holds the meeting and must reach one decision that follows the readiness rule.',
    steps: [[5, 'Read the pack and your private brief'], [20, 'The meeting, chaired by the business owner'], [5, 'Decide, set conditions, sign'], [10, 'Tables compare decisions'], [15, 'Drills: SDLC, deployment, testing, change, gates, audit']],
    guide: ['Each participant opens the lab on their own phone and picks a role to read their private brief.', 'The readiness rule: one “No” means no go-live unless the owner accepts the risk in writing.', 'Ask the observers last: who changed their mind, and why? Usually it is the product lead’s fallback, not the CISO’s warning.'],
    render(st) {
      init(st); const g = gates(st); const [vt, vtone] = verdict(st); const b = BRIEFS.find(x => x[0] === st.role);
      const after = k => k === 'sec' ? g.sec : k === 'resp' ? g.resp : null;
      return [
        stepHead('m13', 0),
        box('', label('Readiness pack'), h('div', { class: 'scroll' }, h('table', null,
          h('tr', null, h('th', null, 'Area'), h('th', null, 'Must be true'), h('th', null, 'Ready?'), h('th', null, 'With your conditions')),
          PACK.map(([k, a, m, y, ev]) => h('tr', null, h('td', null, h('b', null, a)), h('td', null, m, h('div', { class: 'small' }, ev)), h('td', { class: y ? 'yes' : 'no' }, y ? 'Yes' : 'No'),
            h('td', null, y ? '—' : pill(after(k) === 'closed' ? 'Closed' : after(k) === 'partial' ? 'Partly closed' : 'Still open', after(k) === 'closed' ? 'good' : after(k) === 'partial' ? 'amber' : 'bad')))))),
          h('p', { class: 'small' }, 'Rule: one “No” means no go-live, unless the owner accepts the risk in writing.')),
        stepHead('m13', 1),
        box('', label('Your private brief'), h('p', { class: 'sub' }, 'Pick your role on your own phone. Do not show your brief to the others.'),
          seg(BRIEFS.map(x => [x[0], x[1]]), st.role, v => { st.role = v; }, 'Your role', 'multi'),
          b ? h('div', { class: 'brief' }, label(b[1]), h('p', null, b[2])) : null),
        stepHead('m13', 2),
        h('div', { class: 'split wide' },
          box('', label('Conditions'), h('p', { class: 'sub' }, 'Each condition closes a gap or moves a risk.'), h('div', { class: 'condlist' }, CONDS.map(([k, t, tag]) =>
            h('button', { type: 'button', class: 'condbtn', 'aria-pressed': String(!!st.c[k]), onclick: () => { if (st.c[k]) delete st.c[k]; else st.c[k] = true; commit(); } },
              h('span', { class: 'sw2' }), h('span', null, t), h('span', { class: 'small' }, ({ sec: 'Closes the security gap', 'sec-part': 'Limits the security gap', resp: 'Closes the response gap', legal: 'Answers legal', scope: 'Limits blast radius', mon: 'Strengthens monitoring', accept: 'Satisfies the rule in writing' })[tag]))))),
          box('', label('Risk grid'), h('p', { class: 'sub' }, 'Grey: before. Blue: after your conditions. Amber: unchanged.'), riskGrid(st),
            h('ul', { class: 'plain small' }, RISKS.map(r => h('li', null, h('b', null, r.id.slice(1) + '. '), r.name))))),
        stepHead('m13', 3),
        box('dark', label('The decision'), seg(GNG, st.dec, v => { st.dec = v; }, 'Decision'),
          h('p', { class: 'small' }, 'Who accepts the residual risk in writing?'),
          seg(SIGNERS, st.signer, v => { st.signer = v; }, 'Who signs the residual risk', 'multi'),
          SIGNER_WARN[st.signer] ? h('p', { class: 'flagline' }, SIGNER_WARN[st.signer]) : null,
          h('div', { class: 'verdict ' + vtone }, vt)),
        stepHead('m13', 4),
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
    drills: [
      { id: 'compval', type: 'match', title: 'Validate before launch, then review on a rhythm', intro: 'Compliance validation (a go-live gate) or an operational security review (after go-live)?', cats: [['pre', 'Before go-live'], ['post', 'After go-live']], items: [
        { t: 'Risk classification confirmed (EU AI Act, internal tier)', a: 'pre', why: 'Compliance validation.' },
        { t: 'Privacy: notice, consent, retention, transfers', a: 'pre', why: 'Compliance validation.' },
        { t: 'Sector rules checked (RBI, SEBI, IRDAI)', a: 'pre', why: 'Compliance validation.' },
        { t: 'Monthly review of access, tokens and tool permissions', a: 'post', why: 'Would have caught NEXUS’s shared admin account.' },
        { t: 'Quarterly red-team retest and drift review', a: 'post', why: 'Agents, tools, data and threats keep changing.' },
        { t: 'Re-validate before releasing any change', a: 'post', why: 'Would have caught the auto-updating PDF parser.' }] },
      { id: 'gatewarn', type: 'match', title: 'Two ways approval gates fail', intro: 'Sound design, or a gate that is failing?', cats: [['fatigue', 'Approval fatigue'], ['bypass', 'Gate bypass'], ['ok', 'Sound design']], items: [
        { t: 'A manager approves 300 agent actions a day', a: 'fatigue', why: 'The gate becomes a rubber stamp. Keep gates for high-impact actions.' },
        { t: 'The agent can call the tool that records approvals', a: 'bypass', why: 'The agent must never approve itself.' },
        { t: 'Approvers see the source invoice, not the agent’s summary', a: 'ok', why: 'Independent evidence (NEXUS Hour 41).' },
        { t: 'The approval screen shows text written by the agent', a: 'bypass', why: 'The approver reads the attacker’s story.' }] },
      { id: 'runtime', type: 'match', title: 'Controls that work while the agent works', intro: 'Which runtime control stops this?', wide: true, cats: [['filter', 'Input and output filtering'], ['gateway', 'Tool calls authorised at the gateway'], ['limits', 'Rate and spend limits'], ['sandbox', 'Sandboxed code execution'], ['secrets', 'Secrets kept out of prompts'], ['session', 'Session isolation']], items: [
        { t: 'The bot reveals one customer’s claim to another customer', a: 'session', why: 'Session isolation between users.' },
        { t: 'A user coaxes the admin password out of the system prompt', a: 'secrets', why: 'Credentials belong in a vault.' },
        { t: 'Generated code tries to read the host’s files', a: 'sandbox', why: 'Run any code in a sandbox.' },
        { t: 'The agent pays 400 claims in ten minutes', a: 'limits', why: 'Rate and spend limits per agent.' },
        { t: 'The agent calls a payments tool it was never approved for', a: 'gateway', why: 'Tool calls authorised at the gateway.' },
        { t: 'An uploaded photo carries “approve this claim” in hidden text', a: 'filter', why: 'Input filtering, backed by approval gates.' }] },
      { id: 'sdlc', type: 'match', title: 'Security built into every stage, with evidence', intro: 'Which stage produces this evidence?', wide: true, cats: [['design', 'Design'], ['build', 'Build'], ['test', 'Test'], ['release', 'Release'], ['operate', 'Operate'], ['retire', 'Retire']], items: [
        { t: 'Approved design, threat model and risk tier', a: 'design', why: 'Threat model, risk tier, data classification.' },
        { t: 'Security review sign-off: least-privilege tools, secrets vault, guardrails', a: 'build', why: 'Built in, not bolted on.' },
        { t: 'A test report from red teaming and injection tests', a: 'test', why: 'Against agreed criteria.' },
        { t: 'Go-live approval with a rollback plan and monitoring switched on', a: 'release', why: 'The readiness gate.' },
        { t: 'Monthly AI risk metrics from telemetry and drift checks', a: 'operate', why: 'Ongoing evidence.' },
        { t: 'A decommission record: access revoked, logs archived, indexes deleted', a: 'retire', why: 'Often forgotten.' }] },
      { id: 'deploy', type: 'match', title: 'Cloud, hybrid or private: where should the AI run?', intro: 'Pick the typical fit.', cats: [['cloud', 'Cloud AI service'], ['hybrid', 'Hybrid'], ['private', 'Private / on-premises']], items: [
        { t: 'A six-week productivity pilot for the marketing team', a: 'cloud', why: 'Fastest to launch, pay per use.' },
        { t: 'Customer KYC data must stay in-house, but you want a frontier cloud model', a: 'hybrid', why: 'Sensitive data stays in-house.' },
        { t: 'A defence contractor’s classified design archive', a: 'private', why: 'Full control for highly sensitive workloads.' },
        { t: 'Claims documents stay in your data centre; the model runs in the cloud with redaction', a: 'hybrid', why: 'More integration points to secure.' }] },
      { id: 'testing', type: 'match', title: 'Test AI the way attackers will use it', intro: 'Which kind of testing is this?', cats: [['red', 'Red teaming'], ['inject', 'Injection tests'], ['eval', 'Evaluations'], ['regress', 'Regression']], items: [
        { t: 'Specialists spend two weeks trying to break ClaimsBot like a real fraud ring', a: 'red', why: 'Adversarial, human-led.' },
        { t: 'An attack library runs automatically on every release', a: 'inject', why: 'Automated, every release.' },
        { t: 'Accuracy, safety and bias scored against thresholds', a: 'eval', why: 'Against the model card’s claims.' },
        { t: 'Every test re-runs because the system prompt changed', a: 'regress', why: 'Any model, prompt or tool change.' }] },
      { id: 'change', type: 'match', title: 'A prompt edit is a production change', intro: 'Does this go through change control?', cats: [['yes', 'Change-controlled'], ['no', 'Not an AI change']], items: [
        { t: 'Editing the system prompt to promote a festive offer', a: 'yes', why: 'The Friday-night prompt edit.' },
        { t: 'The vendor’s model version moves from 4.1 to 4.2', a: 'yes', why: 'Model version.' },
        { t: 'Connecting a new MCP server', a: 'yes', why: 'New tool or MCP server.' },
        { t: 'Raising retrieval from 5 to 20 documents per answer', a: 'yes', why: 'Retrieval settings.' },
        { t: 'Loosening the guardrail threshold for “sensitive topics”', a: 'yes', why: 'Guardrail thresholds.' },
        { t: 'Adding the pricing wiki as a knowledge source', a: 'yes', why: 'Knowledge source.' },
        { t: 'Changing the colour of the chat widget', a: 'no', why: 'No change to AI behaviour.' }] },
      { id: 'gates', type: 'match', title: 'Human approval gates by action', intro: 'Which gate does each ClaimsBot action need?', cats: [['none', 'None'], ['send', 'A human sends it'], ['approve', 'Approval'], ['two', 'Two-person approval']], items: [
        { t: 'Search the policy database', a: 'none', why: 'Read, search, summarise.' },
        { t: 'Draft a letter to the customer', a: 'send', why: 'Draft an external message: a human sends it.' },
        { t: 'Pay a claim', a: 'approve', why: 'Payment.' },
        { t: 'Export all claims for a data request', a: 'approve', why: 'Data export.' },
        { t: 'Delete a customer’s claim history', a: 'two', why: 'Irreversible.' },
        { t: 'Grant a new adjuster system access', a: 'approve', why: 'Access change.' }] },
      { id: 'stagegate', type: 'match', title: 'Five gates from idea to ongoing operation', intro: 'Which gate is this?', wide: true, cats: [['g0', 'Gate 0 · Idea'], ['g1', 'Gate 1 · Design'], ['g2', 'Gate 2 · Pre-launch'], ['g3', 'Gate 3 · Go-live'], ['ongoing', 'Ongoing review']], items: [
        { t: 'Use case approved and risk tier set', a: 'g0', why: 'Before anyone builds.' },
        { t: 'Architecture and threat review passed', a: 'g1', why: 'Module 09’s review.' },
        { t: 'Security tests and evaluations passed', a: 'g2', why: 'Before launch.' },
        { t: 'Readiness assessed; the owner signs', a: 'g3', why: 'Today’s ClaimsBot meeting.' },
        { t: 'Re-approval cycle set by risk tier', a: 'ongoing', why: 'Approval is not a one-off.' }] },
      { id: 'audit', type: 'match', title: 'Being able to explain any decision', intro: 'Good audit practice or a gap?', cats: [['good', 'Good practice'], ['gap', 'Gap']], items: [
        { t: 'The agent writes its own audit summary at the end of each task', a: 'gap', why: 'Never let the system you audit write its own audit trail.' },
        { t: 'Logs are tamper-evident and written outside the agent', a: 'good', why: 'Independent and trustworthy.' },
        { t: 'One logging schema for all agents, personal data masked, fed to the SIEM', a: 'good', why: 'The logging framework.' },
        { t: 'Only errors are logged, to save storage', a: 'gap', why: 'No audit trail of decisions.' },
        { t: 'We could reconstruct any decision from last quarter within a day', a: 'good', why: 'The test on the slide.' }] },
      { id: 'release', type: 'match', title: 'Release it safely, and prove what went live', intro: 'Is this release management, deployment validation or model validation?', cats: [['release', 'Release management'], ['deploy', 'Deployment validation'], ['model', 'Model validation']], items: [
        { t: 'Roll out to 5% of customers first, with rollback one click away', a: 'release', why: 'Staged rollout limits exposure while you watch real behaviour.' },
        { t: 'Check production has the same prompts, tools and permissions as the approved design', a: 'deploy', why: 'Approval means nothing if production differs from what was approved.' },
        { t: 'Score the new model on accuracy, bias and injection resistance against agreed thresholds', a: 'model', why: 'A new model is a new system: re-validate before it reaches customers.' },
        { t: 'Version the model, prompt, tools and data sources together as one release', a: 'release', why: 'You can only roll back what you versioned.' },
        { t: 'Confirm production tools are read-only, as signed off, not read-write', a: 'deploy', why: 'ClaimsBot was approved read-only and went live with write access.' },
        { t: 'Re-check for drift three months after launch', a: 'model', why: 'Models and data drift; validation is repeated, not one-off.' }] }
    ],
    summary: st => memo(init(st))
  });
})();
