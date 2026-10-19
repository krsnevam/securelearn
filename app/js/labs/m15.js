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
  function report(st) {
    const R = rows(st), byEU = count(R.map(r => r.eu)), byIn = count(R.map(r => r.it));
    const prohib = R.filter(r => r.eu === 'prohib'), blind = R.filter(r => r.eu === 'minimal' && (r.it === 'High' || r.it === 'Medium'));
    const top = R.filter(r => r.sc != null).sort((a, b) => b.sc - a.sc).slice(0, 3);
    return ['BOARD REPORT · AI use-case portfolio', '',
      'Portfolio: ' + CASES.length + ' use cases. EU AI Act: ' + TIERS.map(([k, t]) => (byEU[k] || 0) + ' ' + t.toLowerCase()).join(', ') + '. Internal: ' + ['High', 'Medium', 'Low'].map(t => (byIn[t] || 0) + ' ' + t.toLowerCase()).join(', ') + '.',
      prohib.length ? 'Stop now: ' + prohib.map(r => r.c.t).join('; ') + '. This use is prohibited.' : '',
      blind.length ? 'Not caught by the Act but material to us: ' + blind.map(r => r.c.t).join('; ') + '.' : '',
      top.length ? 'Highest internal scores: ' + top.map(r => r.c.t + ' (' + r.sc + '/12)').join('; ') + '.' : '',
      st.rep.risks ? 'Top risks: ' + st.rep.risks : '', st.rep.decide ? 'Decisions needed from the board: ' + st.rep.decide : '', st.rep.ask ? 'Our ask: ' + st.rep.ask : ''].filter(x => x !== '').join('\n');
  }

  registerLab({
    id: 'm15', n: '15', mod: 'Governance', title: 'Classify eight use cases, then brief the board', format: 'Card sort and writing', min: 45,
    roles: ['Risk lead', 'Legal counsel', 'Business owner'],
    task: 'Put each use case in its EU AI Act tier, then score it on the internal four-factor model. The heat map and portfolio update as you go. Finish with a one-page board report drafted from your classification.',
    steps: [[20, 'Classify and score the eight use cases'], [5, 'Read the heat map: where do the Act and you disagree?'], [15, 'Finish the board report'], [5, 'Two tables read theirs aloud']],
    guide: ['This is an illustrative internal model; confirm EU AI Act details with legal counsel.', 'Items 5 and 7 are where tables disagree: the Act does not list them, but they act alone on people or money.', 'Push tables to say “stop” on item 6 in the board report, not “review”.'],
    render(st) {
      init(st); const R = rows(st); const blind = R.filter(r => r.eu === 'minimal' && (r.it === 'High' || r.it === 'Medium'));
      return [
        CASES.map((c, i) => { const r = R[i]; const f = st.f[c.id];
          return box('case', h('div', { class: 'rowhead' }, h('h3', null, (i + 1) + '. ' + c.t), r.it ? pill('Internal: ' + r.it + (r.sc != null ? ' · ' + r.sc + '/12' : ''), toneOf(r.it)) : null),
            h('p', { class: 'small' }, 'EU AI Act tier'), seg(TIERS, st.t[c.id], v => { if (v) st.t[c.id] = v; else delete st.t[c.id]; }, 'EU AI Act tier'),
            details(r.sc == null ? 'Score it on the internal model' : 'Internal score ' + r.sc + ' / 12', Object.keys(f).length > 0 && r.sc == null,
              h('div', { class: 'factors' }, FACTORS.map(([fn, lv], fi) => h('div', null, h('p', { class: 'small' }, fn),
                seg(lv.map((x, j) => [String(j + 1), (j + 1) + ' · ' + x]), f[fi] != null ? String(f[fi]) : undefined, v => { if (v) f[fi] = +v; else delete f[fi]; }, fn, 'wrap'))))),
            st.t[c.id] === 'high' && r.sc != null && r.sc < 10 ? h('p', { class: 'small' }, 'Override applied: anything the Act lists as high-risk is High internally, whatever the score.') : null); }),
        h('div', { class: 'split wide' },
          box('', label('Portfolio heat map'), h('p', { class: 'sub' }, 'Position by autonomy and impact; size by data sensitivity; colour by internal tier. Dark is prohibited.'), heat(st)),
          box('dark', label('Portfolio'),
            stats(...TIERS.map(([k, t]) => stat(R.filter(r => r.eu === k).length, t))),
            stats(...['High', 'Medium', 'Low'].map(t => stat(R.filter(r => r.it === t).length, 'Internal ' + t.toLowerCase(), toneOf(t)))),
            h('h3', null, 'The Act will not catch these'), blind.length ? h('ul', { class: 'plain' }, blind.map(r => h('li', null, r.c.t))) : h('p', { class: 'sub' }, 'Classify and score to find use cases the Act misses.'))),
        box('', label('Board report'), h('p', { class: 'sub' }, 'The first lines are drafted from your classification. Add the rest.'),
          [['risks', 'Our top three AI risks'], ['decide', 'Decisions we need from the board'], ['ask', 'Our one ask: budget, people or a policy']].map(([k, p]) => field(st.rep[k], v => { st.rep[k] = v; }, { id: 'm15-' + k, ph: p })),
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
        answer('Confirm with counsel', 'This key is a teaching summary. Obligations and timelines under the Act are phased; check current guidance before relying on it.')
      ];
    },
    agg(docs) {
      return [{ title: 'EU AI Act tier chosen', cats: TIERS, rows: CASES.map((c, i) => ({ label: (i + 1) + '. ' + c.t, counts: count(docs.map(d => d.t && d.t[c.id])) })) },
        { type: 'texts', title: 'Board asks', items: docs.filter(d => d.rep && d.rep.ask).map(d => [d._table, d.rep.ask]) }];
    },
    done: st => !!st.t && Object.keys(st.t).length === 8,
    summary: st => report(init(st))
  });
})();
