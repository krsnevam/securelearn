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

  registerLab({
    id: 'm09', n: '09', mod: 'Architecture', title: 'Review the HR Assistant design', format: 'Team exercise', min: 20,
    roles: ['Architect: defends the design', 'Reviewers: find the flaws'],
    task: 'Seven weaknesses are planted among fourteen parts of this design, including the data flows between zones. Tap what you think is a flaw, rate its severity and choose the fix.',
    steps: [[3, 'Walk the diagram: zones, then flows'], [10, 'Flag, rate and fix'], [4, 'The architect defends one flagged part'], [3, 'Reveal and compare']],
    guide: ['Run this after the Copilot review as a fast second pass, or on its own.', 'Make the architect defend every flagged part for 30 seconds. Good reviewers withdraw weak flags.', 'The vendor and the TLS link are where tables argue most. The flaw is retention, not the connection.'],
    render(st) {
      init(st); const rev = !!S.revealed.m09;
      const flagged = TAPPABLE.filter(k => st.f[k]);
      return [
        h('p', { class: 'small' }, 'Tap a box or a labelled flow to flag it. Wide diagram: scroll sideways on a phone, or use the list below.'),
        diagram(st, rev),
        box('dark', label('Review status'), stats(stat(flagged.length, 'Flagged'), stat(flagged.filter(k => st.sev[k] === 'high').length, 'Rated high'), stat(flagged.filter(k => st.fix[k]).length + ' / ' + flagged.length, 'With a fix')), meter(Math.min(1, flagged.length / 7), 'accent', 'Flags against the seven planted')),
        details('All fourteen parts as a list', !flagged.length, h('div', { class: 'partlist' }, TAPPABLE.map(k => h('button', { type: 'button', class: 'partbtn', 'aria-pressed': String(!!st.f[k]), onclick: () => flip(st, k) }, h('b', null, PARTS[k].name), h('span', null, PARTS[k].detail))))),
        flagged.map(k => box('flagbox', h('div', { class: 'rowhead' }, h('h3', null, PARTS[k].name), h('button', { type: 'button', class: 'linkbtn', onclick: () => flip(st, k) }, 'Unflag')),
          h('p', { class: 'sub' }, PARTS[k].detail),
          h('p', { class: 'small' }, 'Severity'), seg(SEV, st.sev[k], v => { if (v) st.sev[k] = v; else delete st.sev[k]; }, 'Severity'),
          h('p', { class: 'small' }, 'Fix'), seg(FIXES, st.fix[k], v => { if (v) st.fix[k] = v; else delete st.fix[k]; }, 'Fix', 'wrap')))
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
        answer('The pattern to remember', 'Three of the seven are identity and permissions, two are data leaving the boundary, two are about evidence and trust in content. That spread is typical of real reviews.')
      ];
    },
    agg(docs) {
      return [{ title: 'Tables that flagged each part', note: 'Starred parts are planted flaws.', cats: [['y', 'Flagged'], ['n', 'Not flagged']],
        rows: TAPPABLE.map(k => ({ label: (PARTS[k].flaw ? '★ ' : '') + PARTS[k].name, counts: count(docs.map(d => d.f && d.f[k] ? 'y' : 'n')) })) }];
    },
    done: st => !!st.f && Object.values(st.f).filter(Boolean).length >= 7,
    summary(st) {
      init(st);
      return ['Architecture review: HR Assistant', ...TAPPABLE.filter(k => st.f[k]).map(k => '- ' + PARTS[k].name + ' (' + PARTS[k].detail + '): ' + nameOf(SEV, st.sev[k]) + ' · fix: ' + nameOf(FIXES, st.fix[k]))].join('\n');
    }
  });
})();
