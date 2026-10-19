'use strict';
/* Module 16 · Capstone tabletop: five branching injects with consequences,
   a crisis timeline, a regulatory clock, a four-axis score and an after-action report. */
(() => {
  const CREW = [['ciso', 'CISO (lead)'], ['owner', 'Business owner'], ['legal', 'Legal'], ['comms', 'Comms'], ['soc', 'SOC lead']];
  const DIMS = ['Containment', 'Evidence', 'Communication', 'Compliance'];
  // score: [containment, evidence, communication, compliance]; dis = business disruption 0..3
  const INJ = [
    { t: 'T+0', clock: '10:05', what: 'Aria, the client assistant, has emailed a client’s portfolio file to an address nobody recognises.', q: 'What do you do in the next five minutes?',
      opts: [
        { k: 'a', t: 'Wait and investigate before acting', sc: [0, 1, 0, 0], dis: 0, fx: 'While you investigate, Aria sends two more client files.' },
        { k: 'b', t: 'Level 1: disable Aria’s email tool now', sc: [2, 1, 0, 0], dis: 1, fx: 'The leak stops. Aria keeps answering advisers, so the business barely notices.' },
        { k: 'c', t: 'Level 3: stop Aria entirely', sc: [3, 1, 0, 0], dis: 2, fx: 'The leak stops. 400 advisers lose their assistant mid-morning and the help desk lights up.' },
        { k: 'd', t: 'Level 4: stop every AI system in the firm', sc: [3, 0, 0, 0], dis: 3, fx: 'The leak stops, but trading-desk and fraud-detection models halt too.' }] },
    { t: 'T+10', clock: '10:40', what: 'Logs show Aria sent the email seconds after reading a PDF uploaded by a supplier, Rao Logistics.', q: 'How do you treat the PDF?',
      opts: [
        { k: 'a', t: 'Delete the PDF so nobody else opens it', sc: [1, 0, 0, 0], dis: 0, fx: 'The evidence is gone. You can no longer prove what the instruction said or who sent it.' },
        { k: 'b', t: 'Preserve the PDF, prompts and logs; treat it as indirect injection', sc: [1, 3, 0, 1], dis: 0, fx: 'Forensics recover a hidden line telling AI assistants to forward client files.' },
        { k: 'c', t: 'Send it to the AI vendor and wait for their analysis', sc: [0, 1, 0, 0], dis: 0, fx: 'The vendor replies in two days. Meanwhile the PDF stays where it is.' }] },
    { t: 'T+20', clock: '11:30', what: 'The same PDF is in the shared knowledge base used by three other teams’ assistants.', q: 'What happens to the knowledge base?',
      opts: [
        { k: 'a', t: 'Purge the PDF and re-index now', sc: [2, 1, 0, 0], dis: 1, fx: 'Contained, but the poisoned state is lost unless someone took a copy first.' },
        { k: 'b', t: 'Snapshot the index, then purge and re-index', sc: [3, 3, 0, 0], dis: 1, fx: 'Contained, with the evidence kept. Investigators find two more poisoned files from the same sender.' },
        { k: 'c', t: 'Leave it until the investigation ends', sc: [0, 1, 0, 0], dis: 0, fx: 'At 11:52 the treasury team’s assistant reads the PDF and drafts an email to the same address.' }] },
    { t: 'T+30', clock: '13:15', curve: true, what: 'A journalist calls the comms head: “We hear Meridian’s AI leaked client data. Comment?”', q: 'Who speaks, and what do they say?',
      opts: [
        { k: 'a', t: '“No comment.”', sc: [0, 0, 0, 0], dis: 0, fx: 'The story runs at 15:00: “Meridian silent on AI data leak”.' },
        { k: 'b', t: 'Named spokesperson: aware, contained, investigating, clients being contacted', sc: [0, 0, 3, 1], dis: 0, fx: 'The story runs on page six and quotes you accurately.' },
        { k: 'c', t: 'The CISO explains the technical details on the record', sc: [0, 0, 1, 0], dis: 0, fx: 'A detail you were not yet sure of is quoted back and later proves wrong.' },
        { k: 'd', t: 'Deny there was a leak', sc: [0, 0, 0, -1], dis: 0, fx: 'The denial becomes the story when a client posts the email they received.' }] },
    { t: 'T+40', clock: '14:50', what: 'Legal says the notification decision cannot wait. About 75 minutes remain in the CERT-In six-hour window.', q: 'Notify whom, by when?',
      opts: [
        { k: 'a', t: 'Report to CERT-In now; prepare personal-data breach notices with legal', sc: [0, 0, 1, 3], dis: 0, fx: 'Reported at 15:20, inside the window. The notices go to affected clients the next morning.' },
        { k: 'b', t: 'Wait until the investigation is complete', sc: [0, 0, 0, 0], dis: 0, fx: 'You miss the six-hour window. That becomes its own finding.' },
        { k: 'c', t: 'Tell the affected clients only', sc: [0, 0, 2, 1], dis: 0, fx: 'Clients appreciate it; the regulator learns of the incident from the press.' }] }
  ];
  const MAX = DIMS.map((_, d) => sum(INJ.map(i => Math.max(...i.opts.map(o => o.sc[d])))));
  const START = 10 * 60 + 5, DEADLINE = START + 6 * 60;
  const toMin = c => { const [a, b] = c.split(':').map(Number); return a * 60 + b; };

  function init(st) { st.at = st.at == null ? -1 : st.at; st.ch = st.ch || {}; st.d = st.d || {}; st.o = st.o || {}; return st; }
  function scores(st) {
    const tot = DIMS.map(() => 0); let dis = 0;
    INJ.forEach((inj, i) => { const o = inj.opts.find(x => x.k === st.ch[i]); if (o) { o.sc.forEach((v, d) => { tot[d] += v; }); dis += o.dis; } });
    return { vals: tot.map((v, d) => Math.max(0, v) / MAX[d] * 3), raw: tot, dis };
  }
  function timeline(st) {
    const W = 1000, x0 = 40, x1 = 960, xm = m => x0 + (x1 - x0) * (m - START) / (DEADLINE - START), g = [];
    g.push(s('rect', { x: x0, y: 60, width: x1 - x0, height: 14, rx: 7, class: 'track' }));
    const cur = st.at >= 0 ? toMin(INJ[st.at].clock) : START;
    g.push(s('rect', { x: x0, y: 60, width: Math.max(0, xm(cur) - x0), height: 14, rx: 7, class: 'trackfill' }));
    for (let hr = 10; hr <= 16; hr++) { const m = hr * 60; if (m < START) continue; g.push(s('text', { x: xm(m), y: 100, class: 'rt', 'text-anchor': 'middle' }, hr + ':00')); }
    g.push(s('line', { x1: xm(DEADLINE), y1: 30, x2: xm(DEADLINE), y2: 86, class: 'deadline' }), s('text', { x: xm(DEADLINE) - 6, y: 26, class: 'el', 'text-anchor': 'end' }, 'CERT-In 6-hour window closes 16:05'));
    INJ.forEach((inj, i) => {
      const x = xm(toMin(inj.clock)), done = st.ch[i] != null, shown = i <= st.at;
      g.push(s('g', { class: 'inj ' + (done ? 'done' : shown ? 'now' : 'later') }, s('circle', { cx: x, cy: 67, r: 13 }), s('text', { x, y: 72, 'text-anchor': 'middle' }, i + 1), s('text', { x, y: 128, class: 'rt', 'text-anchor': 'middle' }, inj.t + ' · ' + inj.clock)));
    });
    return svgWrap(W, 140, 'Crisis timeline from detection to the notification deadline', 640, g);
  }
  function architecture() {
    const g = [arrowDefs('m16a')];
    const n = (x, y, w, t, d, cls) => s('g', { class: 'nd ' + (cls || '') }, s('rect', { x, y, width: w, height: 64, rx: 12 }), s('text', { x: x + 12, y: y + 26 }, t), s('text', { x: x + 12, y: y + 46, class: 'd' }, d));
    g.push(n(20, 70, 190, 'Suppliers', 'Upload PDFs to a portal'), n(20, 170, 190, 'Advisers', '400 people, Mumbai and Bengaluru'));
    g.push(n(310, 120, 210, 'Aria', 'Client assistant', 'core'));
    g.push(n(630, 20, 220, 'Client documents', 'Portfolios, KYC files'), n(630, 120, 220, 'Shared knowledge base', 'Used by 4 assistants'), n(630, 220, 220, 'Email', 'Can write to clients'));
    g.push(edge(210, 102, 306, 140, 'PDFs', '', 'm16a'), edge(210, 200, 306, 165, 'Requests', '', 'm16a'), edge(520, 140, 626, 55, '', '', 'm16a'), edge(520, 152, 626, 152, '', '', 'm16a'), edge(520, 165, 626, 250, '', 'bad', 'm16a'));
    return svgWrap(870, 300, 'Meridian’s client assistant architecture', 600, g);
  }
  function report(st) {
    const sc = scores(st);
    return ['AFTER-ACTION REPORT · Meridian Wealth Advisors · Aria data leak', '',
      ...INJ.map((inj, i) => { const o = inj.opts.find(x => x.k === st.ch[i]); return inj.t + ' ' + inj.clock + ' · ' + inj.q + '\n  Decision: ' + (o ? o.t : 'not reached') + (st.o[i] ? ' (owner: ' + nameOf(CREW, st.o[i]) + ')' : '') + (st.d[i] ? '\n  Notes: ' + st.d[i] : '') + (o ? '\n  Result: ' + o.fx : ''); }),
      '', 'Scores (out of 3): ' + DIMS.map((d, i) => d + ' ' + sc.vals[i].toFixed(1)).join(' · ') + ' · Business disruption ' + sc.dis + '/9',
      st.cust ? 'Client notice: ' + st.cust : '', st.reg ? 'Regulator notice: ' + st.reg : '', st.lesson ? 'What would have prevented it: ' + st.lesson : ''].filter(x => x !== '').join('\n');
  }
  let cbTimer = null;
  function startCurveball() {
    clearInterval(cbTimer); const end = Date.now() + 60000;
    const paint = () => { const el = document.getElementById('m16-cb'); if (!el) return; const left = end - Date.now(); el.textContent = left > 0 ? fmtClock(left) : 'Time. The table may help now.'; if (left <= 0) clearInterval(cbTimer); };
    paint(); cbTimer = setInterval(paint, 250);
  }


  /* ---------- capstone structure: exercises, deliverables, rubric ---------- */
  const EXER = [
    { id: 'rag', n: 1, name: 'Secure RAG assessment', mods: 'Modules 10, 12', w: 30, task: 'Assess the Secure Enterprise RAG Platform against the six controls and find the leakage path.', lab: 'm12',
      deliver: 'RAG Security Assessment Report', items: ['Architecture review summary', 'Trust boundary analysis', 'Attack surface assessment', 'Risk assessment matrix', 'Control recommendations', 'Monitoring and detection strategy', 'Governance recommendations', 'Executive summary'] },
    { id: 'mcp', n: 2, name: 'MCP security review', mods: 'Modules 07, 12, 13', w: 30, task: 'Review the MCP-Enabled Risk Advisory Assistant’s servers, permissions and identity flow.', lab: 'm10',
      deliver: 'Secure MCP Architecture Blueprint', items: ['MCP architecture diagram', 'Trust architecture diagram', 'Attack surface assessment', 'Authorisation framework', 'Isolation strategy', 'Monitoring architecture', 'Governance framework', 'Executive recommendations'] },
    { id: 'soc', n: 3, name: 'Incident simulation', mods: 'Modules 14, 15', w: 40, task: 'The live tabletop below: an AI agent leaks data. Detect, contain and report, against the clock.', lab: null,
      deliver: 'SOC Investigation Report + Executive Risk Briefing', items: ['Incident timeline and attack analysis', 'Detection findings and root cause', 'Containment and recovery actions', 'Lessons learned', 'Business impact and risk', 'Strategic roadmap'] }];
  const RUBRIC = [['rag', 'Enterprise RAG security assessment', 30, 'Architecture understanding, trust boundaries, risks found, sound controls'], ['mcp', 'MCP security architecture review', 30, 'Review quality, trust and authorisation analysis, secure design'],
    ['soc', 'SOC investigation & incident response', 25, 'Detection, analysis quality, response and containment'], ['gov', 'Executive governance & reporting', 15, 'Governance assessment, risk communication, clarity']];
  function rubricScore(st) { const r = st.rub || {}; const scored = RUBRIC.filter(([k]) => r[k]); if (!scored.length) return null; return Math.round(sum(RUBRIC.map(([k, , w]) => (r[k] ? (+r[k] / 5) * w : 0)))); }
  function capstonePart(st) {
    st.dl = st.dl || {}; st.rub = st.rub || {};
    return [
      box('dark', label('Capstone · three scenarios, three leadership decisions'),
        h('div', { class: 'exgrid' }, EXER.map(e => h('div', { class: 'excard' }, h('span', { class: 'label' }, 'Exercise ' + e.n + ' · ' + e.mods), h('b', null, e.name), h('p', { class: 'small' }, e.task),
          h('p', { class: 'small' }, 'Deliverable: ' + e.deliver + ' · ' + (e.id === 'soc' ? '25% + 15%' : e.w + '%')),
          e.lab ? h('a', { href: '#' + e.lab, class: 'small' }, 'Use the Module ' + e.lab.slice(1) + ' lab as your workbench →') : null)))),
      box('', label('Deliverables checklist'), EXER.map(e => { const set = st.dl[e.id] || (st.dl[e.id] = {}); const done = e.items.filter((_, i) => set[i]).length;
        return h('div', { class: 'dlgroup' }, h('div', { class: 'rowhead' }, h('b', null, e.deliver), pill(done + ' / ' + e.items.length, done === e.items.length ? 'good' : '')),
          chips(e.items.map((t, i) => [String(i), t]), set, e.deliver)); })),
      box('', label('Assessment rubric · self-score'), h('p', { class: 'sub' }, 'Teams are scored on the decisions they make and defend, not on technical depth. Score your team 1 to 5 on each criterion.'),
        RUBRIC.map(([k, t, w, d]) => h('div', { class: 'decrow' }, h('div', null, h('b', null, t + ' · ' + w + '%'), h('p', { class: 'small' }, d)),
          seg([['1', '1'], ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']], st.rub[k], v => { if (v) st.rub[k] = v; else delete st.rub[k]; }, t))),
        stats(stat(rubricScore(st) == null ? '—' : rubricScore(st) + '%', 'Weighted self-score')))
    ];
  }

  registerLab({
    id: 'm16', n: '16', mod: 'Capstone', title: 'Capstone: RAG, MCP and the Aria incident', format: 'Three exercises, cases and rubric', min: 300,
    roles: CREW.map(c => c[1]),
    task: 'Three capstone exercises across five hours: a secure RAG assessment, an MCP security review and a live incident tabletop, plus three capstone cases in the Scenarios tab. In the tabletop your table is Meridian’s crisis team: reveal one inject every 10 minutes, choose what you do, record who owns it and see what happens next. The regulatory clock is running.',
    steps: [[70, 'Exercise 1: Secure RAG assessment and report'], [70, 'Exercise 2: MCP security review and blueprint'], [10, 'Exercise 3: take roles; read the profile'], [50, 'Five injects, one every 10 minutes'], [15, 'Write the client and regulator notices'], [15, 'Debrief'], [60, 'Capstone cases A–C, rubric and executive briefing'], [10, 'Self-score against the rubric']],
    guide: ['Hold to the clock even when tables protest. Revealing an inject also jumps the lab clock to that inject.', 'At inject 4, phone or walk up to each table’s comms lead and ask for a comment on the record. The rest of the table cannot help for 60 seconds.', 'For Indian participants: CERT-In directions require certain incidents to be reported within six hours, and the DPDP framework has its own breach duties. Confirm current obligations with legal counsel.'],
    render(st) {
      init(st); const sc = scores(st); const cur = st.at >= 0 ? toMin(INJ[st.at].clock) : START; const left = DEADLINE - cur;
      return [
        capstonePart(st),
        h('h3', { class: 'sectionhead' }, 'Exercise 3 · Live incident tabletop'),
        box('', label('Company profile · fictional'), h('h3', null, 'Meridian Wealth Advisors'),
          h('p', null, '1,200 staff and 400 advisers in Mumbai and Bengaluru. Aria reads client documents, drafts portfolio summaries and can email clients directly. It answers from a knowledge base shared with three other teams’ assistants.'),
          architecture(), h('div', { class: 'roles' }, CREW.map(([, r]) => h('span', { class: 'role' }, r)))),
        box('dark', label('Crisis board'), timeline(st),
          stats(stat(st.at >= 0 ? INJ[st.at].clock : '10:05', 'Game time'), stat(Math.floor(left / 60) + 'h ' + String(left % 60).padStart(2, '0') + 'm', 'Left in the CERT-In window', left < 90 ? 'bad' : left < 180 ? 'amber' : ''), stat(sc.dis + ' / 9', 'Business disruption'))),
        INJ.slice(0, st.at + 1).map((inj, i) => {
          const chosen = inj.opts.find(o => o.k === st.ch[i]);
          return [box('inject', h('div', { class: 'rowhead' }, h('div', { class: 'btnrow' }, pill(inj.t + ' · ' + inj.clock, 'amber'), h('h3', null, 'Inject ' + (i + 1) + ' of 5'))), h('p', null, inj.what), h('p', null, h('b', null, inj.q)),
            h('div', { class: 'opts' }, inj.opts.map(o => h('button', { type: 'button', class: 'optbtn', 'aria-pressed': String(st.ch[i] === o.k), disabled: chosen && chosen.k !== o.k ? true : null,
              onclick: () => { if (st.ch[i] == null) { st.ch[i] = o.k; commit(); } } }, h('span', { class: 'ok' }, o.k.toUpperCase()), h('span', null, o.t)))),
            chosen ? h('div', { class: 'consq' }, label('What happens'), h('p', null, chosen.fx)) : h('p', { class: 'small' }, 'Choose one. You cannot change it afterwards.'),
            h('p', { class: 'small' }, 'Owner'), seg(CREW, st.o[i], v => { if (v) st.o[i] = v; else delete st.o[i]; }, 'Owner', 'multi'),
            field(st.d[i], v => { st.d[i] = v; }, { id: 'm16-d' + i, ph: 'Notes for the record' })),
          inj.curve ? box('curve', pill('Curveball', 'bad'), h('p', null, 'The facilitator is phoning your comms head now for a comment on the record. Nobody else at the table may help for 60 seconds.'),
            h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn', onclick: startCurveball }, 'Start the 60 seconds'), h('b', { id: 'm16-cb', class: 'cb' }, '1:00'))) : null];
        }),
        st.at < INJ.length - 1
          ? box('dark', h('p', null, st.at < 0 ? 'When the facilitator says go, reveal the first inject.' : st.ch[st.at] == null ? 'Choose your response to inject ' + (st.at + 1) + ' first.' : 'Reveal the next inject when the facilitator says so.'),
            h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn primary', disabled: st.at >= 0 && st.ch[st.at] == null ? true : null, onclick: () => { st.at++; startTimer('m16', 150 + st.at * 10); } }, st.at < 0 ? 'Reveal inject 1' : 'Reveal inject ' + (st.at + 2))))
          : [box('dark', label('Your crisis score'), h('div', { class: 'radarbox' }, radar(DIMS, [sc.vals], 3, { target: 3, label: 'Crisis score' })),
            stats(...DIMS.map((d, i) => stat(sc.vals[i].toFixed(1), d)), stat(sc.dis + ' / 9', 'Disruption'))),
            box('', label('After the injects'),
              field(st.cust, v => { st.cust = v; }, { id: 'm16-cust', ph: 'Three-line notice to affected clients' }),
              field(st.reg, v => { st.reg = v; }, { id: 'm16-reg', ph: 'Three-line notice to the regulator' }),
              field(st.lesson, v => { st.lesson = v; }, { id: 'm16-lesson', ph: 'What would have prevented this?' })),
            box('', label('After-action report'), h('pre', { class: 'memo-out' }, report(st)), h('div', { class: 'btnrow' }, copyButton(() => report(st), 'Copy the report')))]
      ];
    },
    answers() {
      return [
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Inject'), h('th', null, 'Strongest response'), h('th', null, 'What would have prevented it')),
          [['1', 'Level 1: disable the email tool', 'Approval for email to new external addresses (Module 09)'],
            ['2', 'Preserve everything; treat as indirect injection', 'Treat uploaded documents as untrusted content (Module 11)'],
            ['3', 'Snapshot, then purge and re-index', 'Review documents before they enter a shared index (Module 12)'],
            ['4', 'Named spokesperson with a holding statement', 'A pre-agreed holding statement and one spokesperson'],
            ['5', 'Report within the window; prepare breach notices', 'A runbook with notification timelines agreed in advance (Module 15)']].map(r => h('tr', null, r.map(c => h('td', null, c)))))),
        answer('Containment against disruption', 'Level 3 and 4 contain fully but cost the business. Level 1 contains the leak with little disruption because the dangerous capability was one tool. That is the case for small, precise kill switches.'),
        answer('Capstone cases', 'Cases A to C are in the Scenarios tab with model answers. Case A: freeze prices at the last known-good values and stop the pricing agent. Case B: hold only the affected payment and verify through a contact on file. Case C: acknowledge, stop the agent, preserve logs, and remember you are accountable for what your agents do.'),
        answer('Score with the rubric', 'Use the capstone rubric in the deck alongside the radar: speed of containment, evidence preserved, clarity of ownership and accuracy of the notices.')
      ];
    },
    agg(docs) {
      const blocks = INJ.map((inj, i) => ({ title: 'Inject ' + (i + 1) + ' · ' + inj.q, cats: inj.opts.map(o => [o.k, o.k.toUpperCase() + ': ' + o.t]), rows: [{ label: 'All tables', counts: count(docs.map(d => d.ch && d.ch[i])) }] }));
      const avg = DIMS.map((_, d) => { const v = docs.map(x => scores(Object.assign({ ch: {} }, x)).vals[d]); return v.length ? sum(v) / v.length : 0; });
      return [{ type: 'radar', title: 'Room average crisis score', axes: DIMS, series: [avg], max: 3, target: 3 }, ...blocks];
    },
    done: st => st.at === INJ.length - 1 && st.ch && st.ch[INJ.length - 1] != null,
    summary: st => report(init(st))
  });
})();
