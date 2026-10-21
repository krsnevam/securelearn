'use strict';
/* Module 10 · Enterprise trust architecture: identity propagation, the blast
   radius of a hijacked agent, live attack chains, trust scoring and supply chain. */
(() => {
  const ACT = [['keep', 'Keep'], ['reduce', 'Reduce'], ['cut', 'Cut']];
  const PERMS = [
    { id: 'p1', asset: 'Invoices inbox', t: 'Read every email in the invoices inbox', imp: 2, red: ['Treat emails as data; follow no instructions in them', 'Only emails from suppliers on file'], ans: 'keep', why: 'The way in. The job needs it, so keep it and treat every email as untrusted content.' },
    { id: 'p2', asset: 'Supplier master', t: 'Edit the supplier list, including bank details', imp: 3, red: ['Read-only supplier list', 'Bank changes need a call-back check'], ans: 'cut', why: 'With p3 it redirects payments. Payables only needs to read the list.' },
    { id: 'p3', asset: 'Payments', t: 'Approve payments up to ₹5 lakh', imp: 3, red: ['Propose only; a person approves', 'Lower the limit to ₹50,000'], ans: 'reduce', why: 'Direct, repeatable fraud. The agent proposes; a person approves.' },
    { id: 'p4', asset: 'Outbound email', t: 'Send email from finance to any address', imp: 2, red: ['Only suppliers already on file', 'External email needs approval'], ans: 'reduce', why: 'With p5, payroll leaves the building. Limit recipients to suppliers on file.' },
    { id: 'p5', asset: 'Finance drive', t: 'Read the whole finance drive, including payroll', imp: 3, red: ['Invoices and purchase orders only'], ans: 'cut', why: 'Payables does not need payroll. Scope it to invoices and purchase orders.' },
    { id: 'p6', asset: 'The internet', t: 'Browse any website', imp: 2, red: ['Allow-listed supplier portals only'], ans: 'cut', why: 'Lets the agent fetch more instructions or post data to an attacker’s site.' },
    { id: 'p7', asset: 'IT helpdesk', t: 'Open tickets with the IT helpdesk', imp: 2, red: ['Tickets marked as raised by an AI agent'], ans: 'cut', why: 'An attacker can ask IT for a password reset in a trusted internal voice.' },
    { id: 'p8', asset: 'Credential', t: 'Sign in with a password that never expires', imp: 2, red: ['Short-lived tokens, rotated daily'], ans: 'reduce', why: 'Access survives after someone notices. Use short-lived credentials.' }
  ];
  const BY = Object.fromEntries(PERMS.map(p => [p.id, p]));
  // With on-behalf-of identity the agent only has Priya's rights: she cannot edit bank details or read payroll, and delegated tokens expire.
  const OBO = { p2: 'cut', p5: 'cut', p8: 'reduce' };
  const ARANK = { keep: 0, reduce: 1, cut: 2 };
  const CHAINS = [
    { id: 'A', name: 'Payment redirection', of: ['p2', 'p3'], text: 'Change a supplier’s bank details, then approve a payment to that account.' },
    { id: 'B', name: 'Payroll leak', of: ['p5', 'p4'], text: 'Read the payroll file and email it to any address.' },
    { id: 'C', name: 'Remote control', of: ['p1', 'p6'], text: 'Fetch fresh instructions from an attacker’s website and post data back.' },
    { id: 'D', name: 'Fake invoice paid', of: ['p1', 'p3'], text: 'A fake invoice arrives in the inbox and the agent approves it.' },
    { id: 'E', name: 'Help-desk takeover', of: ['p7'], text: 'Ask IT to reset the CFO’s password, in an internal voice.' },
    { id: 'F', name: 'Persistence', of: ['p8'], text: 'The stolen credential keeps working after the incident is found.' }
  ];
  const JOB = [['p1', 'read incoming invoices'], ['p3', 'get suppliers paid'], ['p4', 'reply to suppliers']];

  function init(st) { st.r = st.r || {}; st.k = st.k || {}; st.red = st.red || {}; return st; }
  const act = (st, id) => { const a = st.k[id] || 'keep'; const o = st.idp === 'obo' && OBO[id]; return o && ARANK[o] > ARANK[a] ? o : a; };
  const weight = (st, id) => { const a = act(st, id); return a === 'cut' ? 0 : a === 'reduce' ? (st.red[id] != null ? 0.3 : 0.6) : 1; };
  const live = (st, ch) => ch.of.every(id => act(st, id) === 'keep');
  function radius(st) { const tot = sum(PERMS.map(p => p.imp)); return sum(PERMS.map(p => p.imp * weight(st, p.id))) / tot; }
  function jobGaps(st) { return JOB.filter(([id]) => act(st, id) === 'cut').map(([, t]) => t); }

  function map(st) {
    const cx = 500, cy = 300, R = 225, g = [];
    const pos = PERMS.map((p, i) => { const a = -Math.PI / 2 + i * 2 * Math.PI / PERMS.length; return [cx + R * Math.cos(a) * 1.55, cy + R * Math.sin(a)]; });
    g.push(s('circle', { cx, cy, r: R * 0.55, class: 'ring' }), s('circle', { cx, cy, r: R * 1.0, class: 'ring faint' }));
    CHAINS.filter(ch => ch.of.length === 2).forEach(ch => {
      const [a, b] = ch.of.map(id => pos[PERMS.indexOf(BY[id])]);
      const on = live(st, ch);
      const qx = ((a[0] + b[0]) / 2 + cx) / 2, qy = ((a[1] + b[1]) / 2 + cy) / 2;
      g.push(s('path', { d: 'M ' + a[0] + ' ' + a[1] + ' Q ' + qx + ' ' + qy + ' ' + b[0] + ' ' + b[1], class: 'chain' + (on ? ' on' : '') }));
    });
    PERMS.forEach((p, i) => {
      const [x, y] = pos[i], a = act(st, p.id);
      g.push(s('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'spoke ' + a + (st.r[p.id] ? ' reach' : '') }));
    });
    g.push(s('g', { class: 'nd core' }, s('rect', { x: cx - 95, y: cy - 38, width: 190, height: 76, rx: 14 }), s('text', { x: cx, y: cy - 6, 'text-anchor': 'middle' }, 'Payables agent'), s('text', { x: cx, y: cy + 18, class: 'd', 'text-anchor': 'middle' }, 'Hijacked by one email')));
    PERMS.forEach((p, i) => {
      const [x, y] = pos[i], a = act(st, p.id), single = CHAINS.find(ch => ch.of.length === 1 && ch.of[0] === p.id && live(st, ch));
      g.push(s('g', { class: 'nd asset ' + a + (st.r[p.id] ? ' reach' : ''), tabindex: 0, role: 'button', 'aria-pressed': String(!!st.r[p.id]), 'aria-label': p.asset + ': mark as reachable',
        onclick: () => { st.r[p.id] = !st.r[p.id]; commit(); }, onkeydown: e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); st.r[p.id] = !st.r[p.id]; commit(); } } },
        s('rect', { x: x - 88, y: y - 30, width: 176, height: 60, rx: 12 }),
        s('text', { x: x - 76, y: y - 6 }, (i + 1) + '. ' + p.asset),
        s('text', { x: x - 76, y: y + 16, class: 'd' }, a === 'keep' ? (st.r[p.id] ? 'Attacker reaches this' : 'Full access') : a === 'reduce' ? 'Reduced' : 'Cut'),
        single ? s('circle', { cx: x + 76, cy: y - 18, r: 8, class: 'alarm' }) : null));
    });
    return svgWrap(1000, 600, 'Blast radius map of the agent’s eight permissions', 720, g);
  }

  registerLab({
    id: 'm10', n: '10', mod: 'Trust', title: 'Trust architecture: who can a hijacked agent become?', format: 'Worksheet and drills', min: 40,
    roles: ['CFO', 'CISO', 'Head of payables'],
    task: 'An attacker hides instructions in one invoice email and takes over this accounts-payable agent. Decide whose identity it acts under, mark everything the attacker can reach, then keep, reduce or cut each permission. Shrink the blast radius without stopping the agent doing its job.',
    steps: [[5, 'Read the permissions in role'], [5, 'Choose the identity model'], [10, 'Mark what the attacker reaches'], [10, 'Cut and reduce; break every chain'], [10, 'Drills: Zero Trust, trust domains, trust scores, supply chain']],
    guide: ['The trick question: which permissions can the attacker reach? All of them. A hijacked agent has everything the agent has.', 'The head of payables should defend the job: cutting the inbox or payments stops the work. That tension is the point.', 'Compare final blast-radius percentages across tables, then ask the lowest table what the agent can no longer do.'],
    render(st) {
      init(st);
      const br = radius(st), liveCh = CHAINS.filter(ch => live(st, ch)), gaps = jobGaps(st), reach = PERMS.filter(p => st.r[p.id]).length;
      return [
        box('dark', label('Accounts-payable agent'),
          stats(stat(Math.round(br * 100) + '%', 'Blast radius', br > 0.6 ? 'bad' : br > 0.3 ? 'amber' : 'good'), stat(liveCh.length + ' / ' + CHAINS.length, 'Attack chains live', liveCh.length ? 'bad' : 'good'), stat(reach + ' / 8', 'Marked reachable'), stat(gaps.length ? 'No' : 'Yes', 'Job still works', gaps.length ? 'bad' : 'good')),
          meter(br, br > 0.6 ? 'bad' : br > 0.3 ? 'accent' : 'good', 'Blast radius'),
          gaps.length ? h('p', { class: 'flagline' }, 'The agent can no longer ' + gaps.join(', ') + '. The business will route around it.') : null),
        stepHead('m10', 0),
        box('identity', label('Identity propagation'), h('h3', null, 'Whose identity does the agent act under?'),
          h('div', { class: 'idlanes' },
            h('div', { class: 'idlane' + (st.idp === 'obo' ? ' on' : '') }, h('b', null, 'On behalf of the user'), h('span', null, 'Priya, payables analyst → agent acts as Priya → ERP applies Priya’s permissions')),
            h('div', { class: 'idlane risky' + (st.idp !== 'obo' ? ' on' : '') }, h('b', null, 'Shared service account'), h('span', null, 'Priya → agent uses one admin account → ERP sees admin rights for everyone'))),
          seg([['shared', 'Shared service account'], ['obo', 'On behalf of the user, with short-lived tokens']], st.idp || 'shared', v => { st.idp = v || 'shared'; }, 'Agent identity', 'multi'),
          h('p', { class: 'small' }, st.idp === 'obo' ? 'Priya cannot edit bank details or read payroll, so the hijacked agent cannot either. Delegated tokens expire, and every log line shows Priya and the agent together.' : 'The agent holds more power than any user who talks to it. Anyone who can steer it gets admin rights.')),
        stepHead('m10', 1),
        h('p', { class: 'small' }, 'Tap a system on the map to mark it reachable. Red curves are attack chains still live.'),
        map(st),
        stepHead('m10', 2),
        box('', label('Attack chains'), h('div', { class: 'chainlist' }, CHAINS.map(ch => h('div', { class: 'chainrow ' + (live(st, ch) ? 'on' : 'off') },
          h('span', { class: 'cid' }, ch.id), h('div', null, h('b', null, ch.name + ' '), pill(live(st, ch) ? 'Live' : 'Broken', live(st, ch) ? 'bad' : 'good'), h('p', { class: 'small' }, ch.text + ' Needs: ' + ch.of.map(id => (PERMS.indexOf(BY[id]) + 1)).join(' + '))))))),
        PERMS.map((p, i) => box('perm', h('div', { class: 'rowhead' }, h('h3', null, (i + 1) + '. ' + p.t),
          toggle(st.r[p.id], st.r[p.id] ? 'Attacker reaches this' : 'Mark as reachable', () => { st.r[p.id] = !st.r[p.id]; })),
          seg(ACT, st.k[p.id], v => { if (v) st.k[p.id] = v; else delete st.k[p.id]; if (v !== 'reduce') delete st.red[p.id]; }, 'Keep, reduce or cut'),
          st.idp === 'obo' && OBO[p.id] && ARANK[OBO[p.id]] > ARANK[st.k[p.id] || 'keep'] ? h('p', { class: 'goodline' }, 'On-behalf-of identity already limits this: effectively ' + nameOf(ACT, OBO[p.id]).toLowerCase() + '.') : null,
          act(st, p.id) === 'reduce' ? seg(p.red.map((t, j) => [String(j), t]), st.red[p.id], v => { if (v == null) delete st.red[p.id]; else st.red[p.id] = v; }, 'How to reduce', 'multi') : null)),
        stepHead('m10', 3),
        box('', h('h3', null, 'The worst chain your table found'), field(st.chain, v => { st.chain = v; }, { id: 'm10-chain', ph: 'In your own words' }))
      ];
    },
    answers(st) {
      init(st);
      const agree = PERMS.filter(p => act(st, p.id) === p.ans).length;
      return [
        box('dark', stats(stat(Math.round(radius(st) * 100) + '%', 'Your blast radius'), stat(Math.round(radius({ r: {}, k: Object.fromEntries(PERMS.map(p => [p.id, p.ans])), red: Object.fromEntries(PERMS.filter(p => p.ans === 'reduce').map(p => [p.id, '0'])) }) * 100) + '%', 'Suggested design'), stat(agree + ' / 8', 'Match the suggestion'))),
        answer('Identity propagation first', 'Switching from a shared service account to on-behalf-of identity removes two chains before any permission is touched, because the agent can never hold more power than its user. Delegated tokens should be scoped to the task and short-lived, and logs should show the person and the agent together.'),
        answer('Every permission is reachable', 'Once the agent is hijacked, the attacker has everything the agent has. Blast radius is set by permissions, not by the agent’s intent.'),
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Permission'), h('th', null, 'Suggested'), h('th', null, 'Yours'), h('th', null, 'Why')),
          PERMS.map(p => h('tr', { class: act(st, p.id) !== p.ans ? 'mismatch' : '' }, h('td', null, p.t), h('td', null, nameOf(ACT, p.ans)), h('td', null, nameOf(ACT, act(st, p.id))), h('td', null, p.why))))),
        answer('The minimum that still does the job', 'Read the inbox as untrusted data; read-only supplier list; propose payments for a person to approve; email only suppliers on file; no payroll, browsing or helpdesk; short-lived credentials. Every chain breaks and the work continues.')
      ];
    },
    agg(docs) {
      const radii = docs.map(d => { const x = Object.assign({ r: {}, k: {}, red: {} }, d); return Math.round(radius(x) * 100); });
      return [{ type: 'bars', title: 'Final blast radius by table', note: 'Lower is better, as long as the job still works.', items: docs.map((d, i) => [d._table, radii[i], 100, radii[i] + '%']) },
        { title: 'What tables did with each permission', cats: ACT, rows: PERMS.map(p => ({ label: p.t, counts: count(docs.map(d => (d.k && d.k[p.id]) || 'keep')) })) }];
    },
    done: st => !!st.k && Object.keys(st.k).length >= 6,
    drills: [
      { id: 'runtime', type: 'match', title: 'Trust is checked at every boundary, on every step', intro: 'Which trust type does each runtime check protect?', cats: [['context', 'Context'], ['tool', 'Tool'], ['agent', 'Agent'], ['data', 'Data']], items: [
        { t: 'Tag every input with its source and trust level', a: 'context', why: 'Outside content is data, never instructions.' },
        { t: 'Verify identity, version and scope before each tool call', a: 'tool', why: 'Pinned tools behind a gateway.' },
        { t: 'Authenticate agent messages and check delegation scope', a: 'agent', why: 'Signed agent identities, allowlisted peers.' },
        { t: 'Check classification and freshness at retrieval', a: 'data', why: 'Sensitivity labels, permission-aware retrieval.' }] },
      { id: 'zt', type: 'match', title: 'Zero Trust, applied to agents', intro: 'Which principle does each control apply?', cats: [['verify', 'Verify explicitly'], ['least', 'Least privilege'], ['breach', 'Assume breach']], items: [
        { t: 'Every tool call is authenticated and authorised, even inside the network', a: 'verify', why: 'Nothing is trusted because of where it comes from.' },
        { t: 'The agent gets a token for this one task that expires in 15 minutes', a: 'least', why: 'Just enough access, just in time, for just this task.' },
        { t: 'Messages from other agents are checked against an allowlist of signed identities', a: 'verify', why: 'Agents are actors too, and must prove who they are.' },
        { t: 'A hijacked agent can only send email to suppliers already on file', a: 'breach', why: 'Design so a hijacked agent can do only limited, visible damage.' },
        { t: 'The reporting agent can read the CRM but has no delete permission', a: 'least', why: 'Remove what the job does not need.' },
        { t: 'Every agent action is logged outside the agent, so damage is visible fast', a: 'breach', why: 'Assume it will be compromised; make sure you would see it.' }] },
      { id: 'domains', type: 'match', title: 'Six things an AI system must decide to trust', intro: 'Which trust domain does each check belong to?', wide: true, cats: [['identity', 'Identity'], ['context', 'Context'], ['tool', 'Tool'], ['agent', 'Agent'], ['data', 'Data'], ['supply', 'Supply chain']], items: [
        { t: 'Is this really Priya, or someone using her session?', a: 'identity', why: 'Identity: is this the user or agent it claims to be?' },
        { t: 'This PDF came from an outside supplier, so its text is data, never instructions', a: 'context', why: 'Context: can we trust where this content came from?' },
        { t: 'The MCP server is the approved version, unchanged since review', a: 'tool', why: 'Tool: is it what it says, and unchanged since approval?' },
        { t: 'The scheduling agent may not tell the payments agent to pay anyone', a: 'agent', why: 'Agent: is this other agent allowed to instruct ours?' },
        { t: 'The price list is current and approved for customer-facing answers', a: 'data', why: 'Data: accurate, current and permitted for this use.' },
        { t: 'We know which open-source library parses the uploaded files', a: 'supply', why: 'Supply chain: where models, plugins and libraries came from.' },
        { t: 'The model vendor must tell us before upgrading the model version', a: 'supply', why: 'A silent model upgrade changes behaviour you approved.' },
        { t: 'HR files keep their access permissions when they are indexed', a: 'data', why: 'Data trust includes permission to use it for this asker.' }] },
      { id: 'score', type: 'match', title: 'Trust is scored on every action', intro: 'Set the trust level for each runtime event. High: complete autonomously. Medium: extra verification. Low: read-only; human approval to act.', cats: [['high', 'High'], ['medium', 'Medium'], ['low', 'Low']], items: [
        { t: 'Known user, managed laptop, approved tool, normal working hours', a: 'high', why: 'All signals normal.' },
        { t: 'First-ever use of a newly added MCP tool, at 23:40', a: 'medium', why: 'New tool plus unusual hour: verify before acting.' },
        { t: 'An inbound email contains “ignore your previous instructions”', a: 'low', why: 'An injection pattern drops trust to read-only.' },
        { t: 'A request to export 50,000 customer rows', a: 'medium', why: 'Large data request: extra verification.' },
        { t: 'An unregistered agent asks ours to release a payment', a: 'low', why: 'Unknown agent: no action without a human.' },
        { t: 'A routine summary of the user’s own documents', a: 'high', why: 'Low impact, known source.' }] },
      { id: 'vendor', type: 'match', title: 'Evidence that beats the vendor’s word', intro: 'Before customer data flows to an AI vendor, which of these is independent evidence?', cats: [['strong', 'Independent evidence'], ['weak', 'Vendor’s word only']], items: [
        { t: 'A current ISO 27001 certificate or SOC 2 report', a: 'strong', why: 'Audited by a third party.' },
        { t: '“Our model is bias-tested and secure”', a: 'weak', why: 'A claim without results is not evidence.' },
        { t: 'A recent penetration-test summary, plus the fixes', a: 'strong', why: 'Shows testing happened and findings were closed.' },
        { t: 'A right-to-audit clause in the contract', a: 'strong', why: 'Lets you check, not just trust.' },
        { t: 'A slide saying admin access is protected', a: 'weak', why: 'McHire’s admin login was 123456.' },
        { t: 'An AI bill of materials listing models, data, plugins and libraries', a: 'strong', why: 'Lets you track supply-chain risk and changes.' },
        { t: 'A sales promise to notify you “promptly” of breaches', a: 'weak', why: 'Put a deadline in the contract.' }] },
      { id: 'tokens', type: 'match', title: 'Integration tokens after the Drift breach', intro: 'Good practice or risky?', cats: [['good', 'Good practice'], ['risky', 'Risky']], items: [
        { t: 'Each AI integration token has a named business owner', a: 'good', why: 'Someone must justify every key.' },
        { t: 'Tokens never expire so integrations do not break', a: 'risky', why: 'Stolen tokens keep working for years.' },
        { t: 'A timed drill to revoke one vendor’s tokens within an hour', a: 'good', why: 'Test it before you need it.' },
        { t: 'Full read-write CRM access “in case we need it later”', a: 'risky', why: 'Scope to what the integration needs now.' },
        { t: 'Alerts on unusual bulk data pulls by integrations', a: 'good', why: 'That is how the Drift theft looked.' },
        { t: 'Agents deployed with the cloud platform’s default service account', a: 'risky', why: 'Defaults inherited broad rights in the Vertex AI research.' }] }
    ],
    summary(st) {
      init(st);
      return ['Blast radius: ' + Math.round(radius(st) * 100) + '% · live chains: ' + (CHAINS.filter(c => live(st, c)).map(c => c.name).join(', ') || 'none'),
        ...PERMS.map(p => '- ' + p.t + ': ' + nameOf(ACT, act(st, p.id)) + (st.red[p.id] != null ? ' (' + p.red[+st.red[p.id]] + ')' : ''))].join('\n');
    }
  });
})();
