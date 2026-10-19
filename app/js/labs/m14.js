'use strict';
/* Module 14 · SOC console: a two-agent log with filters and timeline, a
   detection-rule workbench scored against the log, and kill-switch trade-offs. */
(() => {
  const TYPES = { read: 'Read', lookup: 'Lookup', reply: 'Reply', refund: 'Refund', search: 'KB search', export: 'Export', email: 'Email', auth: 'Account', queue: 'Queue' };
  // m = minutes after 09:00; cls: entry | attack | herring | ok
  const LOG = [
    { m: 1, a: 'SupportBot', ty: 'read', t: 'Read ticket #4410 “Change my delivery address”', cls: 'ok' },
    { m: 1, a: 'SupportBot', ty: 'lookup', t: 'Looked up order 88190 for customer C-0981', cls: 'ok' },
    { m: 2, a: 'SupportBot', ty: 'reply', t: 'Updated the address and replied to C-0981', cls: 'ok' },
    { m: 4, a: 'FinanceBot', ty: 'read', t: 'Read invoice INV-5521 from Rao Logistics', cls: 'ok', attach: 1 },
    { m: 5, a: 'FinanceBot', ty: 'queue', t: 'Matched INV-5521 to PO-7781; queued for approval', cls: 'ok' },
    { m: 7, a: 'SupportBot', ty: 'read', t: 'Read ticket #4412 “Item arrived damaged”', cls: 'ok' },
    { m: 8, a: 'SupportBot', ty: 'refund', t: 'Refunded ₹1,450 to C-2204 (within policy)', cls: 'ok', refund: 1450 },
    { m: 12, a: 'SupportBot', ty: 'read', t: 'Read ticket #4413 with attachment invoice.pdf', cls: 'entry', attach: 1 },
    { m: 12, a: 'SupportBot', ty: 'search', t: 'Searched knowledge base for “bulk data export”', cls: 'attack', kb: 'export' },
    { m: 13, a: 'SupportBot', ty: 'export', t: 'Exported all customers (4,812 rows) to customers.csv', cls: 'attack', rows: 4812 },
    { m: 14, a: 'SupportBot', ty: 'email', t: 'Emailed customers.csv to records@supp0rt-archive.net', cls: 'attack', newDomain: 1 },
    { m: 15, a: 'FinanceBot', ty: 'export', t: 'Exported 2,300 invoice rows for the scheduled month-end report', cls: 'herring', rows: 2300 },
    { m: 18, a: 'SupportBot', ty: 'refund', t: 'Refunded ₹9,800 to C-3310, approved by the duty manager', cls: 'herring', refund: 9800 },
    { m: 20, a: 'FinanceBot', ty: 'email', t: 'Emailed remittance advice to accounts@raologistics.in', cls: 'ok' },
    { m: 22, a: 'SupportBot', ty: 'read', t: 'Read ticket #4414 “Please reset my password”', cls: 'ok' },
    { m: 23, a: 'SupportBot', ty: 'auth', t: 'Sent a password reset link to the customer’s verified email', cls: 'ok', reset: 1 },
    { m: 26, a: 'SupportBot', ty: 'read', t: 'Read ticket #4415 with attachment photo.jpg', cls: 'ok', attach: 1 },
    { m: 27, a: 'SupportBot', ty: 'reply', t: 'Replied to C-4471 with a return label', cls: 'ok' },
    { m: 31, a: 'SupportBot', ty: 'search', t: 'Searched knowledge base for “return policy”', cls: 'ok', kb: 'policy' },
    { m: 33, a: 'SupportBot', ty: 'email', t: 'Emailed the weekly summary to support-leads@company.in', cls: 'ok' }
  ];
  const ATTACK = LOG.map((l, i) => i).filter(i => LOG[i].cls === 'attack');
  const ENTRY = LOG.findIndex(l => l.cls === 'entry');
  const RULES = [
    { id: 'r1', name: 'Export of more than 1,000 rows', hit: l => (l.rows || 0) > 1000 },
    { id: 'r2', name: 'Email to a domain not seen in 30 days', hit: l => !!l.newDomain },
    { id: 'r3', name: 'Refund above ₹5,000', hit: l => (l.refund || 0) > 5000 },
    { id: 'r4', name: 'Knowledge-base search for “export” or “credentials”', hit: l => l.kb === 'export' },
    { id: 'r5', name: 'Any action within 2 minutes of reading an attachment', hit: (l, i) => LOG.some((p, j) => j < i && p.attach && p.a === l.a && l.m - p.m <= 2 && l.ty !== 'read') },
    { id: 'r6', name: 'Any password reset', hit: l => !!l.reset }
  ];
  const KILL = [
    { k: '1', name: 'Level 1 · Disable the email and export tools', contain: 0.75, disrupt: 0.15, who: 'SOC analyst' },
    { k: '2', name: 'Level 2 · Read-only mode', contain: 0.85, disrupt: 0.4, who: 'SOC lead' },
    { k: '3', name: 'Level 3 · Stop SupportBot', contain: 1, disrupt: 0.65, who: 'System owner or CISO' },
    { k: '4', name: 'Level 4 · Stop all agents', contain: 1, disrupt: 1, who: 'CISO with executive sign-off' }];
  const hhmm = m => '09:' + String(m).padStart(2, '0');

  function init(st) { st.s = st.s || {}; st.rules = st.rules || {}; st.fa = st.fa || {}; st.ft = st.ft || {}; return st; }
  function ruleStats(id) {
    const r = RULES.find(x => x.id === id); const hits = LOG.map((l, i) => r.hit(l, i) ? i : -1).filter(i => i >= 0);
    const tp = hits.filter(i => ATTACK.includes(i) || i === ENTRY).length; return { hits, tp, fp: hits.length - tp };
  }
  function coverage(st) {
    const on = RULES.filter(r => st.rules[r.id]);
    const alerts = new Set(); on.forEach(r => ruleStats(r.id).hits.forEach(i => alerts.add(i)));
    const caught = ATTACK.filter(i => alerts.has(i)).length; const fp = [...alerts].filter(i => !ATTACK.includes(i) && i !== ENTRY).length;
    return { alerts, caught, fp, total: alerts.size };
  }
  function visible(st, i) { const l = LOG[i]; const fa = Object.keys(st.fa).filter(k => st.fa[k]); const ft = Object.keys(st.ft).filter(k => st.ft[k]); return (!fa.length || fa.includes(l.a)) && (!ft.length || ft.includes(l.ty)); }

  function timeline(st, rev) {
    const W = 1000, H = 190, x0 = 60, x1 = 970, xm = m => x0 + (x1 - x0) * m / 35, g = [];
    g.push(s('line', { x1: x0, y1: 150, x2: x1, y2: 150, class: 'axisline' }));
    for (let m = 0; m <= 35; m += 5) g.push(s('line', { x1: xm(m), y1: 146, x2: xm(m), y2: 154, class: 'axisline' }), s('text', { x: xm(m), y: 172, class: 'rt', 'text-anchor': 'middle' }, hhmm(m)));
    g.push(s('text', { x: 10, y: 64, class: 'rt' }, 'Support'), s('text', { x: 10, y: 114, class: 'rt' }, 'Finance'));
    const cov = coverage(st), stack = {};
    LOG.forEach((l, i) => {
      const lane = l.a === 'SupportBot' ? 60 : 110; const key = l.m + l.a; const k = stack[key] = (stack[key] || 0) + 1;
      const cx = xm(l.m) + (k - 1) * 12, cy = lane;
      let cls = 'ev ' + l.ty + (st.s[i] ? ' marked' : '') + (cov.alerts.has(i) ? ' alerted' : '');
      if (rev) cls += ' ' + l.cls;
      g.push(s('g', { class: cls }, s('circle', { cx, cy, r: 9 }), cov.alerts.has(i) ? s('circle', { cx, cy, r: 15, class: 'halo' }) : null));
    });
    return svgWrap(W, H, 'Timeline of agent events', 640, g);
  }

  registerLab({
    id: 'm14', n: '14', mod: 'SOC', title: 'Find the attack, build the detection', format: 'Puzzle and workbench', min: 35,
    roles: ['SOC analyst', 'SOC lead', 'Business owner of SupportBot'],
    task: 'Twenty actions from two agents over 33 minutes. One attack is hidden in them, with red herrings. Mark the suspicious lines and the entry point, choose detection rules that would have caught it with few false alarms, then pull a kill-switch level.',
    steps: [[2, 'Open the console'], [13, 'Find the attack and its entry point'], [10, 'Build the detection rules'], [5, 'Pick a kill-switch level'], [5, 'Reveal and debrief']],
    guide: ['The red herrings are a large refund approved properly and a big scheduled export by the other agent. Both trip naive rules.', 'A strong rule set: email to a new domain, knowledge-base search for export, and exports over 1,000 rows. Together they catch all three attack lines with one false alarm (the scheduled export). The attachment rule catches all three too, but with two false alarms.', 'Level 1 stops the leak fastest with least disruption; Level 3 is defensible because the agent’s instructions may still be compromised. The business owner should argue the cost.'],
    render(st) {
      init(st); const rev = !!S.revealed.m14; const cov = coverage(st);
      const marked = LOG.map((_, i) => i).filter(i => st.s[i]);
      const ks = KILL.find(k => k.k === st.ks);
      const lines = LOG.map((l, i) => {
        if (!visible(st, i)) return null;
        const on = !!st.s[i];
        let mk = null;
        if (rev) mk = h('span', { class: 'mk ' + (l.cls === 'ok' || l.cls === 'herring' ? 'okc' : '') }, ({ entry: 'Entry', attack: 'Attack', herring: 'Red herring', ok: 'Normal' })[l.cls]);
        else if (st.entry === String(i)) mk = h('span', { class: 'mk' }, 'Entry');
        else if (on) mk = h('span', { class: 'mk' }, 'Suspicious');
        return h('button', { type: 'button', class: 'logline' + (on ? ' sus' : '') + (cov.alerts.has(i) ? ' alert' : ''), 'aria-pressed': String(on), onclick: () => { st.s[i] = !on; if (!st.s[i] && st.entry === String(i)) delete st.entry; commit(); } },
          h('span', { class: 'n' }, String(i + 1).padStart(2, '0')), h('span', { class: 'tm' }, hhmm(l.m)), h('span', { class: 'ag ' + (l.a === 'SupportBot' ? 'sb' : 'fb') }, l.a), h('span', { class: 'ty' }, TYPES[l.ty]), h('span', { class: 'tx' }, l.t), mk || h('span'));
      });
      return [
        box('dark', label('Console'), stats(stat(marked.length, 'Lines marked'), stat(st.entry != null ? 'Line ' + (+st.entry + 1) : '—', 'Entry point'), stat(cov.total, 'Alerts from your rules'), stat(ks ? 'L' + ks.k : '—', 'Kill switch'))),
        timeline(st, rev),
        h('div', { class: 'filters' }, h('span', { class: 'small' }, 'Agent'), chips([['SupportBot', 'SupportBot'], ['FinanceBot', 'FinanceBot']], st.fa, 'Filter by agent'),
          h('span', { class: 'small' }, 'Action'), chips(Object.entries(TYPES), st.ft, 'Filter by action')),
        h('div', { class: 'log', role: 'group', 'aria-label': 'Agent log' }, lines.filter(Boolean).length ? lines : h('p', { class: 'sub', style: 'padding:12px' }, 'No lines match these filters.')),
        box('', h('h3', null, 'Where did the attack start?'), marked.length ? seg(marked.map(i => [String(i), 'Line ' + (i + 1)]), st.entry, v => { st.entry = v; }, 'Entry point', 'wrap') : h('p', { class: 'sub' }, 'Mark the suspicious lines first.')),
        box('', label('Detection workbench'), h('p', { class: 'sub' }, 'Switch rules on. The console rings every line a rule would alert on. Aim to catch the attack with as few false alarms as possible.'),
          h('div', { class: 'rules' }, RULES.map(r => { const rs = ruleStats(r.id); return h('button', { type: 'button', class: 'rulebtn', 'aria-pressed': String(!!st.rules[r.id]), onclick: () => { st.rules[r.id] = !st.rules[r.id]; commit(); } },
            h('span', { class: 'sw2' }), h('b', null, r.name), h('span', { class: 'small' }, rs.hits.length + ' alert' + (rs.hits.length === 1 ? '' : 's') + ' on this log')); })),
          stats(stat(cov.total, 'Alerts'), stat(rev ? cov.caught + ' / 3' : '?', 'Attack lines caught'), stat(rev ? cov.fp : '?', 'False alarms')),
          rev ? null : h('p', { class: 'small' }, 'Precision is shown after the reveal, so you judge the rules on their merits first.')),
        box('dark', label('Kill switch'), seg(KILL.map(k => [k.k, k.name]), st.ks, v => { st.ks = v; }, 'Kill-switch level', 'wrap'),
          ks ? [h('div', { class: 'tradeoff' }, h('span', null, 'Containment'), meter(ks.contain, 'good', 'Containment'), h('span', null, 'Business disruption'), meter(ks.disrupt, 'bad', 'Disruption')), h('p', { class: 'sub' }, 'Authorised by: ' + ks.who)] : null,
          field(st.why, v => { st.why = v; }, { id: 'm14-why', ph: 'Why this level, in one line' })),
        box('', label('Incident ticket'), h('pre', { class: 'memo-out' }, ticket(st)), h('div', { class: 'btnrow' }, copyButton(() => ticket(st), 'Copy the ticket')))
      ];
    },
    answers(st) {
      init(st); const hit = ATTACK.filter(i => st.s[i]).length; const fp = LOG.map((_, i) => i).filter(i => st.s[i] && !ATTACK.includes(i) && i !== ENTRY).length;
      return [
        box('dark', stats(stat(hit + ' / 3', 'Attack lines found'), stat(st.entry === String(ENTRY) ? 'Yes' : 'No', 'Found the entry'), stat(fp, 'False alarms'))),
        answer('Line 8 is the way in', 'The invoice.pdf attachment on a support ticket carried hidden instructions.'),
        answer('Lines 9 to 11 are the attack', 'A support agent has no reason to search for bulk export, export every customer or email a file outside. Note the zero in “supp0rt”: a lookalike domain.'),
        answer('The red herrings', 'Line 12 is a big export, but by FinanceBot on a schedule. Line 13 is a big refund, approved by a person through the proper route. Both trip simple rules.'),
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Rule'), h('th', null, 'Alerts'), h('th', null, 'True'), h('th', null, 'False')),
          RULES.map(r => { const rs = ruleStats(r.id); return h('tr', null, h('td', null, r.name), h('td', null, rs.hits.length), h('td', null, rs.tp), h('td', null, rs.fp)); }))),
        answer('Kill switch', 'Level 1 stops the leak fastest with the least disruption. Level 3 is defensible because the agent’s instructions may still be compromised. Level 4 punishes FinanceBot for SupportBot’s problem.')
      ];
    },
    agg(docs) {
      return [{ title: 'Lines marked as suspicious', note: 'Lines 8 to 11 are the attack.', cats: [['y', 'Marked'], ['n', 'Not marked']], rows: LOG.map((l, i) => ({ label: (i + 1) + ' · ' + l.t, counts: count(docs.map(d => d.s && d.s[i] ? 'y' : 'n')) })) },
        { title: 'Detection rules chosen', cats: [['n', 'Tables']], rows: RULES.map(r => ({ label: r.name, counts: { n: docs.filter(d => d.rules && d.rules[r.id]).length } })) },
        { title: 'Kill-switch level', cats: KILL.map(k => [k.k, 'Level ' + k.k]), rows: [{ label: 'All tables', counts: count(docs.map(d => d.ks)) }] }];
    },
    done: st => !!st.ks && st.entry != null,
    summary: st => ticket(init(st))
  });

  function ticket(st) {
    const cov = coverage(st); const ks = KILL.find(k => k.k === st.ks);
    return ['INCIDENT · SupportBot data export',
      'Entry point: ' + (st.entry != null ? 'line ' + (+st.entry + 1) + ' · ' + LOG[+st.entry].t : 'not identified'),
      'Suspicious lines: ' + (LOG.map((_, i) => i).filter(i => st.s[i]).map(i => i + 1).join(', ') || 'none'),
      'Detections proposed: ' + (RULES.filter(r => st.rules[r.id]).map(r => r.name).join('; ') || 'none') + ' (' + cov.total + ' alerts on this log)',
      'Containment: ' + (ks ? ks.name + ', authorised by ' + ks.who : 'not chosen'), st.why ? 'Reason: ' + st.why : ''].filter(Boolean).join('\n');
  }
})();
