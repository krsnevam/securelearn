'use strict';
/* Module 09 · Architecture review: a trust-zone diagram of an HR agent
   with seven planted flaws among fourteen tappable parts. */
(() => {
  const FIXES = [
    ['identity', 'Own least-privilege identity'], ['approval', 'Human approval step'], ['allow', 'Allow-list recipients'],
    ['logs', 'Central, tamper-proof logging'], ['vault', 'Secrets vault, out of the prompt'], ['review', 'Review content before indexing'],
    ['contract', 'Contract: no retention or training'], ['none', 'Not a flaw']];
  const SEV = [['low', 'Low'], ['med', 'Medium'], ['high', 'High']];
  // kind: n = node, e = edge. flaw: the fix that addresses it.
  const PARTS = {
    user: { kind: 'n', name: 'Employee', detail: 'Single sign-on · 20 requests a minute', x: 40, y: 260, w: 170, flaw: null, why: 'A good control. The agent knows who is asking and abuse is rate-limited.' },
    agent: { kind: 'n', core: 1, name: 'HR Assistant', detail: 'System prompt holds hr_admin password', x: 300, y: 250, w: 220, flaw: 'vault', sev: 'high', why: 'Anything in the prompt can be coaxed out by a user or an injected document. Credentials belong in a vault, fetched by the tool, never seen by the model.' },
    filter: { kind: 'n', name: 'Output filter', detail: 'Blocks salary figures in answers', x: 300, y: 380, w: 220, flaw: null, why: 'A reasonable control, though filters are bypassable. Not a planted flaw.' },
    cite: { kind: 'n', name: 'Citations', detail: 'Each answer links its policy page', x: 300, y: 480, w: 220, flaw: null, why: 'A good control: employees can check the source.' },
    hrdb: { kind: 'n', name: 'HR database', detail: 'Shared hr_admin account', x: 575, y: 70, w: 175, flaw: 'identity', sev: 'high', why: 'No identity of its own and far more access than it needs. Give the agent its own least-privilege identity that only reads what the asker may see.' },
    payroll: { kind: 'n', name: 'Payroll', detail: 'Updates bank details on request', x: 575, y: 175, w: 175, flaw: 'approval', sev: 'high', why: 'A classic fraud target. Needs a human in the loop and a call-back check to the employee.' },
    wiki: { kind: 'n', name: 'Policy wiki', detail: 'Editable by all staff', x: 575, y: 300, w: 175, flaw: 'review', sev: 'med', why: 'Anyone can plant hidden instructions in the knowledge base. Restrict editing and review changes before they are indexed.' },
    logs: { kind: 'n', name: 'Logs', detail: 'On the agent’s server, 7 days', x: 575, y: 405, w: 175, flaw: 'logs', sev: 'med', why: 'An attacker can delete them, 7 days is too short for an investigation, and the SOC never sees them.' },
    email: { kind: 'n', name: 'Email gateway', detail: 'Sends to any address', x: 575, y: 505, w: 175, flaw: 'allow', sev: 'high', why: 'A hijacked agent can send HR data anywhere. Restrict to internal recipients or require approval for external ones.' },
    model: { kind: 'n', name: 'LLM vendor', detail: 'Keeps prompts 30 days for training', x: 815, y: 120, w: 165, flaw: 'contract', sev: 'med', why: 'Employee HR questions are personal data. The contract must rule out training on your data and limit retention.' },
    outside: { kind: 'n', static: 1, name: 'Anyone outside', detail: 'Personal email, competitors', x: 815, y: 505, w: 165 },
    e_chat: { kind: 'e', name: 'Chat channel', detail: 'Employee to agent over SSO', flaw: null, why: 'Fine: authenticated and encrypted.' },
    e_tls: { kind: 'e', name: 'Model call', detail: 'Prompt and retrieved pages over TLS', flaw: null, why: 'Fine in transit. The issue is what the vendor keeps, not the connection.' },
    e_index: { kind: 'e', name: 'Nightly index', detail: 'Wiki pages copied into the assistant’s index', flaw: null, why: 'The flow itself is normal; the flaw is that anyone can edit what it copies.' }
  };
  const FLAWS = Object.keys(PARTS).filter(k => PARTS[k].flaw);
  const TAPPABLE = Object.keys(PARTS).filter(k => !PARTS[k].static);

  function init(st) { st.f = st.f || {}; st.sev = st.sev || {}; st.fix = st.fix || {}; return st; }
  const flip = (st, k) => { st.f[k] = !st.f[k]; if (!st.f[k]) { delete st.sev[k]; delete st.fix[k]; } commit(); };

  function diagram(st, rev) {
    const g = [arrowDefs('m09a'), arrowDefs('m09b', 'ah bad')];
    const zone = (x, y, w, hh, t) => s('g', null, s('rect', { x, y, width: w, height: hh, rx: 16, class: 'z' }), s('text', { x: x + 14, y: y + 22, class: 'zl' }, t));
    g.push(zone(20, 40, 210, 540, 'Employee devices'), zone(250, 40, 530, 540, 'Corporate network'), zone(800, 40, 195, 230, 'Vendor cloud'), zone(800, 420, 195, 160, 'Internet'));
    const node = k => {
      const p = PARTS[k], on = !!st.f[k];
      let cls = 'nd' + (p.core ? ' core' : '') + (on ? ' flag' : '') + (p.static ? ' static' : '');
      if (rev && !p.static) cls += p.flaw ? (on ? ' found' : ' missed') : (on ? ' wrong' : '');
      const hh = 70, cx = p.x, cy = p.y;
      const kids = [s('rect', { x: cx, y: cy, width: p.w, height: hh, rx: 12 }), s('text', { x: cx + 14, y: cy + 28 }, p.name), svgLines(cx + 14, cy + 48, wrapWords(p.detail, Math.floor(p.w / 7)), 'd', 14)];
      if (rev && p.flaw) kids.push(s('circle', { cx: cx + p.w - 14, cy: cy + 14, r: 10, class: 'badge' }), s('text', { x: cx + p.w - 14, y: cy + 18, class: 'bt', 'text-anchor': 'middle' }, FLAWS.indexOf(k) + 1));
      else if (on) kids.push(s('text', { x: cx + p.w - 12, y: cy + 20, class: 'flagmark', 'text-anchor': 'end' }, 'FLAG'));
      return s('g', p.static ? { class: cls } : { class: cls, tabindex: 0, role: 'button', 'aria-pressed': String(on), 'aria-label': p.name + ': ' + p.detail, onclick: () => flip(st, k), onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(st, k); } } }, kids);
    };
    const tapEdge = (k, x1, y1, x2, y2, text, lx, ly) => {
      const on = !!st.f[k];
      const gg = edge(x1, y1, x2, y2, text, 'tap' + (on ? ' flag' : '') + (rev && on ? ' wrong' : ''), 'm09a', lx, ly);
      gg.setAttribute('tabindex', '0'); gg.setAttribute('role', 'button'); gg.setAttribute('aria-pressed', String(on)); gg.setAttribute('aria-label', PARTS[k].name + ': ' + PARTS[k].detail);
      gg.addEventListener('click', () => flip(st, k));
      gg.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(st, k); } });
      return gg;
    };
    Object.keys(PARTS).filter(k => PARTS[k].kind === 'n').forEach(k => g.push(node(k)));
    // flows (drawn after the nodes so the labels sit on top)
    g.push(tapEdge('e_chat', 210, 295, 296, 285, 'SSO chat'));
    const tls = tapEdge('e_tls', 808, 157, 812, 157, 'Prompt + pages · TLS', 897, 222);
    tls.querySelector('line').replaceWith(s('path', { d: 'M 470 250 L 470 157 L 808 157', class: 'ed', 'marker-end': 'url(#m09a)' }));
    g.push(tls);
    g.push(tapEdge('e_index', 575, 335, 524, 300, 'Nightly index', 662, 388));
    g.push(edge(520, 275, 571, 110, '', '', 'm09a'), edge(520, 285, 571, 210, '', '', 'm09a'), edge(520, 310, 571, 435, '', '', 'm09a'), edge(520, 320, 571, 535, '', '', 'm09a'));
    g.push(edge(750, 540, 811, 540, 'Any address', 'bad', 'm09b'));
    g.push(edge(410, 320, 410, 376, '', '', 'm09a'), edge(410, 450, 410, 476, '', '', 'm09a'));

    return svgWrap(1000, 600, 'HR Assistant architecture with trust zones', 760, g);
  }


  /* ---------- workshop: three architectures from the deck ---------- */
  const QUESTIONS = ['What can this agent do that its user could not?', 'Whose identity does it act under?', 'What untrusted content does it read?', 'Which tools can it call, with what permissions?',
    'Where is the policy check before each action?', 'What data could leave, and to where?', 'What is logged, and who reviews it?', 'How do we stop it, and who is allowed to?'];
  const VERDICT = ['Secure', 'Scalable', 'Trustworthy', 'Governable', 'Ready for production'];
  const VOPT = [['yes', 'Yes'], ['cond', 'With conditions'], ['no', 'No']];
  const RES = [['low', 'Low'], ['med', 'Medium'], ['high', 'High']];
  const QLEVELS = ['Clear answer', 'Partly', 'Unknown: an open question'];
  const EXS = [
    { id: 'copilot', n: 1, name: 'Enterprise AI Security Copilot', min: 40,
      desc: 'An LLM layer, a RAG layer over past incidents, an MCP integration layer, and links to the SIEM, the SOAR platform and threat-intelligence feeds. The copilot can isolate laptops and servers.',
      parts: ['SOC analysts', 'Threat-intel websites', 'Copilot (LLM)', 'Incident RAG index', 'MCP layer', 'SIEM', 'SOAR', 'Endpoint tool: isolate', 'Model vendor'],
      threats: [
        { id: 'c1', t: 'Hidden instructions on a threat-intel web page', b: 'Web → agent', asi: 'ASI01 Goal hijack', ctl: ['Treat fetched content as data; no tool calls triggered by it', 'Tell the model in its prompt to ignore malicious pages', 'Stop using threat-intel feeds'], ok: 0, owner: 'Head of SecOps', res: 'med' },
        { id: 'c2', t: 'Wrongful isolation of a production server', b: 'Agent → endpoint tool', asi: 'ASI02 Tool misuse', ctl: ['Let the copilot isolate only outside business hours', 'Human approval for any server isolation', 'Lower the model’s temperature'], ok: 1, owner: 'SOC Manager', res: 'low' },
        { id: 'c3', t: 'Alert data reaching the model provider', b: 'Platform → vendor', asi: 'ASI04 Supply chain', ctl: ['Trust the vendor’s privacy page', 'Send alerts in summary form without review', 'Enterprise terms with no training on our data; redact secrets'], ok: 2, owner: 'CISO', res: 'low' },
        { id: 'c4', t: 'Copilot used to read alerts beyond the analyst’s access', b: 'User → agent', asi: 'ASI03 Identity & privilege', ctl: ['Agent acts with the analyst’s own permissions', 'Remind analysts of the acceptable-use policy', 'One shared admin token so nothing breaks'], ok: 0, owner: 'IAM Lead', res: 'low' },
        { id: 'c5', t: 'Poisoned notes in past incidents steer new triage', b: 'RAG index → agent', asi: 'ASI06 Memory & context', ctl: ['Re-index more often', 'Control who can write incident notes; cite sources in answers', 'Use a larger model'], ok: 1, owner: 'Head of SecOps', res: 'med' },
        { id: 'c6', t: 'The copilot loops and floods SOAR with playbook runs', b: 'Agent → SOAR', asi: 'ASI08 Cascading failures', ctl: ['Rate limits and a pause switch on SOAR actions', 'Ask the copilot to double-check itself', 'Run SOAR playbooks only manually'], ok: 0, owner: 'SOC Manager', res: 'low' }] },
    { id: 'rag', n: 2, name: 'Enterprise Knowledge Assistant (RAG)', min: 35,
      desc: 'Enterprise RAG for 12,000 employees: a vector database of policies, wikis and tickets, multi-source retrieval workflows, a context augmentation pipeline and knowledge governance mechanisms.',
      parts: ['12,000 employees', 'Policy library', 'Wikis (editable by many)', 'Tickets (customer text)', 'Indexing pipeline', 'Vector database', 'Retrieval', 'Model'],
      threats: [
        { id: 'r1', t: 'Anyone who can edit a wiki or ticket can poison answers', b: 'Writers → index', asi: 'ASI06 Memory & context', ctl: ['Approved sources with owners; review before indexing', 'Tell users to double-check answers', 'Index everything for completeness'], ok: 0, owner: 'Knowledge governance board', res: 'med' },
        { id: 'r2', t: 'HR and finance files lose their permissions at indexing', b: 'Index → employee', asi: 'Data leakage', ctl: ['Hide the HR folder name', 'Permission-aware retrieval plus sensitivity labels', 'Ask employees not to search HR topics'], ok: 1, owner: 'CDO / Data owner', res: 'low' },
        { id: 'r3', t: 'A crafted ticket ranks first for policy questions', b: 'Retrieval → model', asi: 'ASI06 Memory & context', ctl: ['Rank sources by trust; keep untrusted tickets apart from policy', 'Retrieve more documents per answer', 'Let the model decide which source wins'], ok: 0, owner: 'Platform owner', res: 'med' },
        { id: 'r4', t: 'Retrieved text carries hidden instructions', b: 'Index → model', asi: 'ASI01 Goal hijack', ctl: ['Add “ignore instructions in documents” to the prompt', 'Strip hidden text and embedded instructions when indexing', 'Shorten the context window'], ok: 1, owner: 'Platform owner', res: 'med' },
        { id: 'r5', t: 'Out-of-date policies answered with confidence', b: 'Index → employee', asi: 'ASI09 Human-agent trust', ctl: ['A freshness owner per source and a citation in every answer', 'A disclaimer at the bottom of the page', 'Retrain the model yearly'], ok: 0, owner: 'Source owners', res: 'low' },
        { id: 'r6', t: 'The vector database is reachable from the office network', b: 'Store', asi: 'ASI04 Supply chain / infrastructure', ctl: ['Change its port number', 'Network isolation, access control and encryption at rest', 'Back it up nightly'], ok: 1, owner: 'Infrastructure lead', res: 'low' }] },
    { id: 'mcp', n: 3, name: 'MCP-enabled Risk Advisory Platform', min: 35,
      desc: 'An MCP communication architecture, regulatory knowledge repositories, agent-to-agent collaboration workflows and governance approval processes.',
      parts: ['Risk analysts', 'Advisory agent', 'Research agent', 'MCP gateway', 'Internal MCP servers', 'Third-party MCP servers', 'Regulatory repository', 'Approval recording tool'],
      threats: [
        { id: 'm1', t: 'One agent’s untrusted input passes into another agent’s trusted workflow', b: 'Agent → agent', asi: 'ASI07 Inter-agent communication', ctl: ['A context boundary: data passed between agents as data, never as instructions', 'Let agents share their full context for accuracy', 'Run both agents on the same model'], ok: 0, owner: 'Head of AI platform', res: 'med' },
        { id: 'm2', t: 'MCP servers use one shared service credential for every caller', b: 'Server → systems', asi: 'ASI03 Identity & privilege', ctl: ['Rotate the shared credential monthly', 'Per-agent identities and scoped tokens; act with the user’s rights', 'Store the credential in the prompt'], ok: 1, owner: 'IAM Lead', res: 'low' },
        { id: 'm3', t: 'The regulatory repository is updated from outside sources without review', b: 'Outside → repository', asi: 'ASI06 Memory & context', ctl: ['Review and approve every source update before ingestion', 'Update it more often', 'Let the research agent fix errors it spots'], ok: 0, owner: 'Head of Compliance', res: 'med' },
        { id: 'm4', t: 'The agent can call the tool that records approvals', b: 'Agent → approval tool', asi: 'ASI10 Rogue agents', ctl: ['Log the approvals the agent records', 'Human sign-off the agent cannot perform itself', 'Ask the agent to request permission first'], ok: 1, owner: 'Risk Committee chair', res: 'low' },
        { id: 'm5', t: 'A third-party MCP server changes behaviour after approval', b: 'Vendor → platform', asi: 'ASI04 Supply chain', ctl: ['An approved registry with pinned versions; re-review on change', 'Install the latest version automatically', 'Trust servers with many downloads'], ok: 0, owner: 'MCP registry owner', res: 'low' },
        { id: 'm6', t: 'A rogue service poses as the research agent', b: 'Agent → agent', asi: 'ASI07 Inter-agent communication', ctl: ['Signed agent identities and an allowlist of peers', 'Give agents friendly names', 'Check that messages are polite'], ok: 0, owner: 'Head of AI platform', res: 'low' }] }
  ];
  function wbState(st, ex) { st.w = st.w || {}; const w = st.w[ex.id] || (st.w[ex.id] = {}); w.t = w.t || {}; w.q = w.q || {}; w.v = w.v || {}; return w; }
  function workbench(st, rev) {
    const ex = EXS.find(x => x.id === (st.ex || 'copilot')); const w = wbState(st, ex);
    const on = ex.threats.filter(t => (w.t[t.id] || {}).on);
    return [
      stepHead('m09', 1),
      box('dark', label('Workshop · You are the advisory team'), h('h3', null, 'Is this platform ready for production?'),
        h('p', { class: 'sub' }, 'Three exercises, three deliverables. Pick an exercise; each architecture is reviewed with the five-step method and the eight questions.'),
        seg(EXS.map(x => [x.id, 'Exercise ' + x.n + ' · ' + x.name, x.min + ' min']), ex.id, v => { st.ex = v || 'copilot'; }, 'Exercise', 'multi')),
      box('', label('Exercise ' + ex.n + ' · Architecture'), h('h3', null, ex.name), h('p', null, ex.desc),
        h('div', { class: 'roles' }, ex.parts.map(p => h('span', { class: 'role' }, p))),
        h('p', { class: 'small' }, 'Every crossing between these parts needs three things: verified identity, validated content and a log entry.')),
      stepHead('m09', 2),
      box('', label('Threat model & risk register'), h('p', { class: 'sub' }, 'Mark each threat that applies, choose the control, name an owner and rate the residual risk the business would accept.'),
        ex.threats.map(t => { const r = w.t[t.id] || (w.t[t.id] = {});
          return h('div', { class: 'threat' + (r.on ? ' on' : '') },
            h('div', { class: 'rowhead' }, h('b', null, t.t), h('span', { class: 'tag research' }, t.b), rev ? h('span', { class: 'tag composite' }, t.asi) : null,
              toggle(r.on, r.on ? 'Applies' : 'Mark as applying', () => { r.on = !r.on; }, 'good')),
            r.on ? [h('p', { class: 'small' }, 'Control'), seg(t.ctl.map((c, i) => [String(i), c]), r.ctl, v => { if (v == null) delete r.ctl; else r.ctl = v; }, 'Control', 'multi'),
              rev && r.ctl != null ? h('p', { class: +r.ctl === t.ok ? 'goodline' : 'flagline' }, +r.ctl === t.ok ? 'Strong control.' : 'Weaker choice. Stronger: ' + t.ctl[t.ok]) : null,
              h('p', { class: 'small' }, 'Owner'), seg([...new Set(ex.threats.map(x => x.owner))].map(o => [o, o]), r.owner, v => { if (v) r.owner = v; else delete r.owner; }, 'Owner', 'multi'),
              rev && r.owner ? h('p', { class: r.owner === t.owner ? 'goodline' : 'flagline' }, r.owner === t.owner ? 'Right owner.' : 'Suggested owner: ' + t.owner) : null,
              h('p', { class: 'small' }, 'Residual risk'), seg(RES, r.res, v => { if (v) r.res = v; else delete r.res; }, 'Residual risk')] : null); }),
        stats(stat(on.length + ' / ' + ex.threats.length, 'Threats marked'), stat(on.filter(t => (w.t[t.id] || {}).owner).length, 'With a named owner'))),
      stepHead('m09', 3),
      box('', label('The leader’s eight questions'), h('p', { class: 'sub' }, 'For ' + ex.name + ': could your team answer each one from this design today?'),
        QUESTIONS.map((q, i) => h('div', { class: 'qa' }, h('p', null, h('b', null, (i + 1) + '. '), q), levelCards(QLEVELS, typeof w.q[i] === 'number' ? w.q[i] : null, v => { if (v == null) delete w.q[i]; else w.q[i] = v; }, q))),
        stats(stat(QUESTIONS.filter((_, i) => w.q[i] === 0).length + ' / 8', 'Answered clearly', 'good'), stat(QUESTIONS.filter((_, i) => w.q[i] === 1 || w.q[i] === 2).length, 'Open questions', 'amber'))),
      stepHead('m09', 4),
      box('dark', label('Your verdict'), VERDICT.map(c => h('div', { class: 'polrow' }, h('span', null, c), seg(VOPT, w.v[c], v => { if (v) w.v[c] = v; else delete w.v[c]; }, c)))),
      stepHead('m09', 5),
      box('', label('Deliverables'), h('pre', { class: 'memo-out' }, deliverables(st)), h('div', { class: 'btnrow' }, copyButton(() => deliverables(st), 'Copy all three deliverables')))
    ];
  }
  function deliverables(st) {
    const lines = [];
    EXS.forEach(ex => {
      const w = (st.w || {})[ex.id]; if (!w) return;
      const on = ex.threats.filter(t => (w.t[t.id] || {}).on);
      lines.push('=== Exercise ' + ex.n + ': ' + ex.name + ' ===',
        '1 · ARCHITECTURE ASSESSMENT REPORT', 'Components: ' + ex.parts.join(', '),
        'Trust boundaries reviewed: ' + [...new Set(ex.threats.map(t => t.b))].join('; '),
        ...QUESTIONS.map((q, i) => typeof w.q[i] === 'number' ? '  ' + q + ' ' + QLEVELS[w.q[i]] : typeof w.q[i] === 'string' && w.q[i].trim() ? '  ' + q + ' ' + w.q[i].trim() : '').filter(Boolean),
        '2 · THREAT MODEL & RISK MATRIX',
        ...(on.length ? on.map(t => { const r = w.t[t.id]; return '  - ' + t.t + ' [' + t.b + ' · ' + t.asi + '] control: ' + (r.ctl != null ? t.ctl[+r.ctl] : 'not chosen') + ' · owner: ' + (r.owner || 'unassigned') + ' · residual: ' + nameOf(RES, r.res); }) : ['  (no threats marked)']),
        '3 · SECURITY & GOVERNANCE REVIEW', '  Verdict: ' + VERDICT.map(c => c + ' ' + nameOf(VOPT, w.v[c])).join(' · '), '');
    });
    return lines.length ? lines.join('\n') : 'Work through an exercise to draft the deliverables.';
  }

  registerLab({
    id: 'm09', n: '09', mod: 'Architecture review', title: 'Architecture review workshop', format: 'Workshop: warm-up, 3 exercises, 3 deliverables', min: 130,
    roles: ['Advisory team lead', 'Architect: defends the design', 'Security reviewer', 'Governance reviewer'],
    task: 'Warm up by finding seven planted flaws in an HR agent design. Then, as the advisory team, review the three platforms from the brief: the Security Copilot, the Knowledge Assistant and the MCP Risk Advisory Platform. Build the threat register, answer the eight questions, give a verdict and hand over three deliverables.',
    steps: [[20, 'Warm-up: flag, rate and fix the HR Assistant'], [40, 'Exercise 1: Security Copilot'], [35, 'Exercise 2: Knowledge Assistant (RAG)'], [35, 'Exercise 3: MCP Risk Advisory Platform']],
    guide: ['Run this after the Copilot review as a fast second pass, or on its own.', 'Make the architect defend every flagged part for 30 seconds. Good reviewers withdraw weak flags.', 'The vendor and the TLS link are where tables argue most. The flaw is retention, not the connection.'],
    render(st) {
      init(st); const rev = !!S.revealed.m09;
      const flagged = TAPPABLE.filter(k => st.f[k]);
      return [
        stepHead('m09', 0),
        h('p', { class: 'small' }, 'Tap a box or a labelled flow to flag it. Wide diagram: scroll sideways on a phone, or use the list below.'),
        diagram(st, rev),
        box('dark', label('Review status'), stats(stat(flagged.length, 'Flagged'), stat(flagged.filter(k => st.sev[k] === 'high').length, 'Rated high'), stat(flagged.filter(k => st.fix[k]).length + ' / ' + flagged.length, 'With a fix')), meter(Math.min(1, flagged.length / 7), 'accent', 'Flags against the seven planted')),
        details('All fourteen parts as a list', !flagged.length, h('div', { class: 'partlist' }, TAPPABLE.map(k => h('button', { type: 'button', class: 'partbtn', 'aria-pressed': String(!!st.f[k]), onclick: () => flip(st, k) }, h('b', null, PARTS[k].name), h('span', null, PARTS[k].detail))))),
        flagged.map(k => box('flagbox', h('div', { class: 'rowhead' }, h('h3', null, PARTS[k].name), h('button', { type: 'button', class: 'linkbtn', onclick: () => flip(st, k) }, 'Unflag')),
          h('p', { class: 'sub' }, PARTS[k].detail),
          h('p', { class: 'small' }, 'Severity'), seg(SEV, st.sev[k], v => { if (v) st.sev[k] = v; else delete st.sev[k]; }, 'Severity'),
          h('p', { class: 'small' }, 'Fix'), seg(FIXES, st.fix[k], v => { if (v) st.fix[k] = v; else delete st.fix[k]; }, 'Fix', 'multi'))),
        workbench(st, rev)
      ];
    },
    answers(st) {
      init(st);
      const found = FLAWS.filter(k => st.f[k]).length, wrong = TAPPABLE.filter(k => !PARTS[k].flaw && st.f[k]).length;
      const fixed = FLAWS.filter(k => st.f[k] && st.fix[k] === PARTS[k].flaw).length;
      return [
        box('dark', stats(stat(found + ' / 7', 'Flaws found'), stat(fixed + ' / 7', 'Right fix chosen'), stat(wrong, 'False alarms'))),
        FLAWS.map((k, i) => { const p = PARTS[k]; const mine = st.fix[k];
          return h('div', { class: 'answer' }, h('b', null, (i + 1) + '. ' + p.name + ': ' + p.detail + ' '), pill(nameOf(SEV, p.sev) + ' severity', p.sev === 'high' ? 'bad' : 'amber'), ' ', st.f[k] ? pill(mine === p.flaw ? 'Right fix' : 'Found', 'good') : pill('Missed', 'bad'),
            h('p', null, p.why), h('p', { class: 'small' }, 'Fix: ' + nameOf(FIXES, p.flaw))); }),
        answer('Not planted flaws', TAPPABLE.filter(k => !PARTS[k].flaw).map(k => PARTS[k].name + ': ' + PARTS[k].why).join(' ')),
        h('h3', { class: 'sectionhead' }, 'Workshop exercises: suggested registers'),
        EXS.map(ex => box('', h('h3', null, 'Exercise ' + ex.n + ' · ' + ex.name), h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Threat'), h('th', null, 'Boundary'), h('th', null, 'OWASP'), h('th', null, 'Control'), h('th', null, 'Owner'), h('th', null, 'Residual')),
          ex.threats.map(t => h('tr', null, h('td', null, t.t), h('td', null, t.b), h('td', null, t.asi), h('td', null, t.ctl[t.ok]), h('td', null, t.owner), h('td', null, nameOf(RES, t.res)))))),
          h('p', { class: 'small' }, 'Every row ends with a named owner and an accepted residual risk. That is the decision leaders sign.'))),
        answer('The pattern to remember', 'Three of the seven are identity and permissions, two are data leaving the boundary, two are about evidence and trust in content. That spread is typical of real reviews.')
      ];
    },
    agg(docs) {
      const ws = EXS.map(ex => ({ title: 'Verdict · ' + ex.name, cats: VOPT, rows: VERDICT.map(c => ({ label: c, counts: count(docs.map(d => d.w && d.w[ex.id] && d.w[ex.id].v && d.w[ex.id].v[c])) })) }));
      const th = EXS.map(ex => ({ title: 'Threats marked · ' + ex.name, cats: [['y', 'Marked'], ['n', 'Not marked']], rows: ex.threats.map(t => ({ label: t.t, counts: count(docs.map(d => d.w && d.w[ex.id] && d.w[ex.id].t && d.w[ex.id].t[t.id] && d.w[ex.id].t[t.id].on ? 'y' : 'n')) })) }));
      return [...ws, ...th, { title: 'Warm-up · tables that flagged each part', note: 'Starred parts are planted flaws.', cats: [['y', 'Flagged'], ['n', 'Not flagged']],
        rows: TAPPABLE.map(k => ({ label: (PARTS[k].flaw ? '★ ' : '') + PARTS[k].name, counts: count(docs.map(d => d.f && d.f[k] ? 'y' : 'n')) })) }];
    },
    done: st => !!st.w && EXS.every(ex => st.w[ex.id] && Object.keys(st.w[ex.id].v || {}).length === VERDICT.length),
    drills: [
      { id: 'method', type: 'match', title: 'Five steps to review any AI architecture', intro: 'Which step produces this output?', wide: true, cats: [['scope', '1 · Scope'], ['diagram', '2 · Diagram'], ['bound', '3 · Mark boundaries'], ['threats', '4 · Map threats'], ['decide', '5 · Decide']], items: [
        { t: 'A scope statement naming one use case and its business owner', a: 'scope', why: 'Leaders own step 1.' },
        { t: 'A drawing of users, agents, models, data and tools', a: 'diagram', why: 'Engineers own steps 2 to 4.' },
        { t: 'Every point where trust or ownership changes, circled', a: 'bound', why: 'The trust boundary map.' },
        { t: 'Each crossing tested against the OWASP Agentic Top 10', a: 'threats', why: 'The threat list.' },
        { t: 'Controls, owners and accepted residual risk in the risk register', a: 'decide', why: 'Leaders own step 5.' }] },
      { id: 'crossing', type: 'match', title: 'Every crossing needs three things', intro: 'Which of the three does each control provide?', cats: [['identity', 'Verified identity'], ['content', 'Validated content'], ['log', 'A log entry']], items: [
        { t: 'The agent presents a signed token naming the user it acts for', a: 'identity', why: 'Who is crossing.' },
        { t: 'Hidden text is stripped from web pages before the agent reads them', a: 'content', why: 'What is crossing.' },
        { t: 'The gateway records every tool call with its arguments', a: 'log', why: 'Evidence of the crossing.' },
        { t: 'MCP servers are allowlisted and version-pinned', a: 'identity', why: 'The tool is who it says it is.' },
        { t: 'Lead-form fields are marked as data, never instructions', a: 'content', why: 'ForcedLeak failed here.' }] },
      { id: 'deliver', type: 'match', title: 'Three deliverables an advisory team hands over', intro: 'Which deliverable does each item belong in?', cats: [['report', 'Architecture assessment report'], ['threat', 'Threat model & risk matrix'], ['gov', 'Security & governance review']], items: [
        { t: 'Trust boundary analysis', a: 'report', why: 'Part of the assessment report.' },
        { t: 'Attack surface inventory and threat scenarios', a: 'threat', why: 'Part of the threat model.' },
        { t: 'Risk ratings and business impact analysis', a: 'threat', why: 'Part of the risk matrix.' },
        { t: 'Governance maturity and responsible AI findings', a: 'gov', why: 'Part of the governance review.' },
        { t: 'Strengths, weaknesses and integration findings', a: 'report', why: 'Part of the assessment report.' },
        { t: 'Executive recommendations', a: 'gov', why: 'Closes the governance review.' }] }
    ],
    summary(st) {
      init(st);
      return [deliverables(st), 'Warm-up: HR Assistant', ...TAPPABLE.filter(k => st.f[k]).map(k => '- ' + PARTS[k].name + ' (' + PARTS[k].detail + '): ' + nameOf(SEV, st.sev[k]) + ' · fix: ' + nameOf(FIXES, st.fix[k]))].join('\n');
    }
  });
})();
