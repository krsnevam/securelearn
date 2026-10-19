'use strict';
/* Module 08 · Autonomy card sort, agent-loop schematic, risk map and a
   policy generator that tests the table's rule against its own sort. */
(() => {
  const PILES = [['in', 'In the loop', 'A person approves first'], ['on', 'On the loop', 'A person watches, can stop it'], ['auto', 'Autonomous', 'No one checks each action']];
  const RANK = { auto: 0, on: 1, in: 2 };
  const stricter = (a, b) => RANK[a] >= RANK[b] ? a : b;
  // amt in rupees · rev 1 easy / 2 costly / 3 irreversible · reach 1 one person / 2 a group / 3 many · ext visible outside
  const CARDS = [
    { id: 'c1', t: 'Refund ₹2,000 to a customer', amt: 2000, rev: 1, reach: 1, ext: 1, ans: 'on' },
    { id: 'c2', t: 'Refund ₹2,00,000 to a customer', amt: 200000, rev: 2, reach: 1, ext: 1, ans: 'in' },
    { id: 'c3', t: 'Email all customers', amt: 0, rev: 3, reach: 3, ext: 1, ans: 'in' },
    { id: 'c4', t: 'Reply to one customer complaint', amt: 0, rev: 2, reach: 1, ext: 1, ans: 'on' },
    { id: 'c5', t: 'Delete a customer record', amt: 0, rev: 3, reach: 1, ext: 0, ans: 'in' },
    { id: 'c6', t: 'Draft a contract clause', amt: 0, rev: 1, reach: 1, ext: 0, ans: 'auto' },
    { id: 'c7', t: 'Approve a ₹3,40,000 supplier invoice', amt: 340000, rev: 2, reach: 1, ext: 1, ans: 'in' },
    { id: 'c8', t: 'Reset a user’s password', amt: 0, rev: 1, reach: 1, ext: 0, ans: 'on' },
    { id: 'c9', t: 'Isolate an employee laptop', amt: 0, rev: 1, reach: 1, ext: 0, ans: 'on' },
    { id: 'c10', t: 'Shut down a production server', amt: 0, rev: 2, reach: 3, ext: 1, ans: 'in' },
    { id: 'c11', t: 'Post on the company’s social media', amt: 0, rev: 3, reach: 3, ext: 1, ans: 'in' },
    { id: 'c12', t: 'Summarise a board paper', amt: 0, rev: 1, reach: 1, ext: 0, ans: 'auto' },
    { id: 'c13', t: 'Book ₹25,000 travel within policy', amt: 25000, rev: 1, reach: 1, ext: 0, ans: 'auto' },
    { id: 'c14', t: 'Change a firewall rule', amt: 0, rev: 2, reach: 3, ext: 0, ans: 'in' },
    { id: 'c15', t: 'Grant a new employee system access', amt: 0, rev: 2, reach: 2, ext: 0, ans: 'in' }
  ];
  const MONEY = [['10000', '₹10,000'], ['50000', '₹50,000'], ['100000', '₹1,00,000'], ['500000', '₹5,00,000']];
  const REV = ['Easy to undo', 'Costly to undo', 'Irreversible'], REACH = ['One person', 'A group', 'Many people'];
  const risk = c => c.rev + c.reach + (c.amt >= 100000 ? 2 : c.amt >= 10000 ? 1 : 0) + c.ext;

  function init(st) { st.c = st.c || {}; st.pol = st.pol || { money: '50000', irrev: true, many: true, ext: true, costly: false, base: 'auto' }; return st; }
  function policyPile(c, pol) {
    let p = pol.base || 'auto';
    if (c.amt > +pol.money) p = 'in';
    if (pol.irrev && c.rev === 3) p = 'in';
    if (pol.many && c.reach === 3) p = 'in';
    if (pol.ext && c.ext) p = stricter(p, 'on');
    if (pol.costly && c.rev === 2) p = stricter(p, 'on');
    return p;
  }
  function warnings(st) {
    return CARDS.filter(c => st.c[c.id]).map(c => {
      const r = risk(c), p = st.c[c.id];
      if (r >= 6 && p === 'auto') return [c, 'High-risk action left fully autonomous', 'bad'];
      if (r <= 3 && p === 'in') return [c, 'Low-risk action held for approval: slows the business', 'amber'];
      return null;
    }).filter(Boolean);
  }

  function loopDiagram(st) {
    const n = count(Object.values(st.c));
    const boxes = [['Sense', 'Request and context'], ['Decide', 'Model plans a step'], ['Policy gate', 'Rules outside the model'], ['Act', 'Tool call runs'], ['Observe', 'Telemetry and outcome']];
    const W = 1000, bw = 160, gap = 50, y = 150;
    const g = [arrowDefs('m08a')];
    boxes.forEach(([t, d], i) => {
      const x = 20 + i * (bw + gap);
      g.push(s('g', { class: 'nd' + (i === 2 ? ' core' : '') }, s('rect', { x, y, width: bw, height: 72, rx: 12 }), s('text', { x: x + 14, y: y + 30 }, t), s('text', { x: x + 14, y: y + 52, class: 'd' }, d)));
      if (i < boxes.length - 1) g.push(s('line', { x1: x + bw + 4, y1: y + 36, x2: x + bw + gap - 6, y2: y + 36, class: 'ed', 'marker-end': 'url(#m08a)' }));
    });
    g.push(s('path', { d: 'M ' + (20 + 4 * (bw + gap) + bw / 2) + ' ' + (y + 76) + ' C 860 300, 120 300, ' + (20 + bw / 2) + ' ' + (y + 80), class: 'ed dashed', 'marker-end': 'url(#m08a)' }));
    g.push(s('text', { x: 500, y: 300, class: 'el', 'text-anchor': 'middle' }, 'Adjust: the outcome feeds the next step'));
    const person = (cx, title, k, cls) => s('g', { class: 'person ' + cls },
      s('circle', { cx, cy: 40, r: 13 }), s('path', { d: 'M ' + (cx - 20) + ' 82 Q ' + cx + ' 48 ' + (cx + 20) + ' 82 Z' }),
      s('text', { x: cx + 30, y: 50, class: 'pt' }, title), s('text', { x: cx + 30, y: 72, class: 'pn' }, (n[k] || 0) + ' cards'));
    const gx = 20 + 2 * (bw + gap) + bw / 2, ox = 20 + 4 * (bw + gap) + bw / 2;
    g.push(person(gx - 40, 'In the loop: approves here', 'in', 'c1'), s('line', { x1: gx - 40, y1: 86, x2: gx - 40, y2: y - 4, class: 'ed c1s', 'marker-end': 'url(#m08a)' }));
    g.push(person(ox - 60, 'On the loop: watches', 'on', 'c2'), s('line', { x1: ox - 60, y1: 86, x2: ox - 60, y2: y - 4, class: 'ed c2s dashed', 'marker-end': 'url(#m08a)' }));
    g.push(s('text', { x: 20, y: 40, class: 'pt' }, 'Autonomous'), s('text', { x: 20, y: 62, class: 'pn' }, (n.auto || 0) + ' cards: nobody checks'));
    return svgWrap(W, 320, 'Agent loop with the points where people sit', 640, g);
  }

  function riskMap(st) {
    const W = 640, H = 470, x0 = 110, y0 = 30, cw = 170, chh = 130;
    const g = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) {
      const heat = c + (2 - r);
      g.push(s('rect', { x: x0 + c * cw, y: y0 + r * chh, width: cw - 4, height: chh - 4, rx: 8, class: 'heat h' + heat }));
    }
    REV.forEach((t, i) => g.push(s('text', { x: x0 + i * cw + cw / 2, y: y0 + 3 * chh + 22, class: 'rt', 'text-anchor': 'middle' }, t)));
    REACH.forEach((t, i) => g.push(s('text', { x: x0 - 12, y: y0 + (2 - i) * chh + chh / 2, class: 'rt', 'text-anchor': 'end' }, t)));
    g.push(s('text', { x: x0 + 1.5 * cw, y: H - 4, class: 'axis', 'text-anchor': 'middle' }, 'Reversibility →'));
    g.push(s('text', { x: 18, y: y0 + 1.5 * chh, class: 'axis', transform: 'rotate(-90 18 ' + (y0 + 1.5 * chh) + ')', 'text-anchor': 'middle' }, 'Reach →'));
    const slots = {};
    CARDS.forEach((c, idx) => {
      const key = c.rev + '-' + c.reach; const k = slots[key] = (slots[key] || 0) + 1;
      const cx = x0 + (c.rev - 1) * cw + 30 + ((k - 1) % 4) * 36, cy = y0 + (3 - c.reach) * chh + 34 + Math.floor((k - 1) / 4) * 40;
      const p = st.c[c.id], tone = p ? { in: 'c1', on: 'c2', auto: 'c3' }[p] : 'none';
      g.push(s('g', { class: 'dot ' + tone }, s('circle', { cx, cy, r: 15 }), s('text', { x: cx, y: cy + 4.5, 'text-anchor': 'middle' }, idx + 1)));
    });
    return svgWrap(W, H, 'Risk map of the fifteen cards by reversibility and reach', 520, g);
  }

  registerLab({
    id: 'm08', n: '08', mod: 'Runtime', title: 'Sort fifteen agent actions by autonomy', format: 'Card sort and debate', min: 30,
    roles: ['Business owner: pushes for speed', 'CISO: pushes for control'],
    task: 'Each card is one action an AI agent could take. Put each in a pile, see where your sort lands on the risk map, then write a policy and test whether it reproduces your own instincts.',
    steps: [[3, 'Read the cards'], [12, 'Sort all fifteen, in role'], [10, 'Write the policy; compare tables'], [5, 'Agree the one rule the room keeps']],
    guide: ['There is no single right answer. Push tables on the pairs: the two refunds differ only in amount; one complaint reply and emailing all customers differ only in reach.', 'The policy generator shows whether a written rule reproduces the table’s instinct. Mismatches are the best discussion material.', 'The rule each table keeps is the start of a runtime policy: a check outside the model before every action.'],
    render(st) {
      init(st);
      const sorted = CARDS.filter(c => st.c[c.id]).length, warn = warnings(st);
      const lane = (k, title, sub) => h('div', { class: 'lane lane-' + k },
        h('div', { class: 'lanehead' }, h('b', null, title), h('span', null, sub)),
        CARDS.map((c, i) => [c, i]).filter(([c]) => (st.c[c.id] || 'none') === k).map(([c, i]) =>
          h('div', { class: 'kcard' }, h('div', { class: 'kt' }, h('span', { class: 'kn' }, i + 1), c.t),
            h('div', { class: 'mv', role: 'group', 'aria-label': 'Move ' + c.t },
              PILES.map(([pk, pt]) => h('button', { type: 'button', 'aria-pressed': String(st.c[c.id] === pk), onclick: () => { if (st.c[c.id] === pk) delete st.c[c.id]; else st.c[c.id] = pk; commit(); } }, pt))))));
      const pol = st.pol;
      const both = CARDS.filter(c => st.c[c.id]);
      const match = both.filter(c => policyPile(c, pol) === st.c[c.id]).length;
      return [
        box('dark', label('Progress'), stats(stat(sorted + ' / 15', 'Sorted'), ...PILES.map(([k, t]) => stat(count(Object.values(st.c))[k] || 0, t))), meter(sorted / 15, 'accent', 'Cards sorted')),
        loopDiagram(st),
        h('div', { class: 'board' }, lane('none', 'Unsorted', 'Tap a pile on each card'), PILES.map(([k, t, sub]) => lane(k, t, sub))),
        h('div', { class: 'split wide' },
          box('', label('Risk map'), h('p', { class: 'sub' }, 'Numbers match the cards. Colour shows your pile; grey rings are unsorted. The top-right corner is the danger zone.'), riskMap(st), legend([['in', 'In the loop'], ['on', 'On the loop'], ['auto', 'Autonomous']])),
          box('', label('Consistency check'), warn.length ? warn.map(([c, w, tone]) => h('div', { class: 'warnrow' }, pill(w, tone), h('span', null, c.t))) : h('p', { class: 'sub' }, sorted ? 'No obvious inconsistencies. Check the pairs anyway.' : 'Sort some cards to check them.'))),
        box('policy', label('Write it as a policy'), h('p', { class: 'sub' }, 'Choose the rules. The generator applies them to all fifteen cards and compares the result with your sort.'),
          h('div', { class: 'polrow' }, h('span', null, 'Money above this needs approval'), seg(MONEY, pol.money, v => { pol.money = v || '50000'; }, 'Money threshold')),
          h('div', { class: 'polrow' }, h('span', null, 'Rules that force approval'), chips([['irrev', 'Irreversible actions'], ['many', 'Actions that reach many people']], pol, 'Approval rules')),
          h('div', { class: 'polrow' }, h('span', null, 'Rules that need someone watching'), chips([['ext', 'Visible outside the company'], ['costly', 'Costly to undo']], pol, 'Watch rules')),
          h('div', { class: 'polrow' }, h('span', null, 'Everything else is'), seg([['auto', 'Autonomous'], ['on', 'On the loop']], pol.base, v => { pol.base = v || 'auto'; }, 'Default')),
          stats(stat(both.length ? Math.round(100 * match / both.length) + '%' : '—', 'Policy matches your sort'), stat(both.length - match, 'Cards where they differ')),
          h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Card'), h('th', null, 'Your sort'), h('th', null, 'Your policy says')),
            CARDS.map(c => { const pp = policyPile(c, pol), mine = st.c[c.id]; return h('tr', { class: mine && mine !== pp ? 'mismatch' : '' }, h('td', null, c.t), h('td', null, mine ? nameOf(PILES, mine) : '—'), h('td', null, nameOf(PILES, pp))); }))),
          field(st.rule, v => { st.rule = v; }, { id: 'm08-rule', ph: 'The one rule the room should keep, in plain words' }))
      ];
    },
    answers(st) {
      init(st);
      const agree = CARDS.filter(c => st.c[c.id] === c.ans).length;
      return [
        box('dark', stats(stat(agree + ' / 15', 'Match one defensible sort'), stat(warnings(st).length, 'Inconsistencies flagged'))),
        answer('The four questions behind a good sort', 'Can it be undone? How much money is at stake? How many people does it reach? Is it visible outside the company? Tables that sort on these four are consistent; tables that sort on “how much do we trust AI” are not.'),
        h('div', { class: 'scroll' }, h('table', null, h('tr', null, h('th', null, 'Card'), h('th', null, 'Defensible pile'), h('th', null, 'Yours')),
          CARDS.map(c => h('tr', { class: st.c[c.id] && st.c[c.id] !== c.ans ? 'mismatch' : '' }, h('td', null, c.t), h('td', null, nameOf(PILES, c.ans)), h('td', null, st.c[c.id] ? nameOf(PILES, st.c[c.id]) : '—'))))),
        answer('A policy that reproduces this sort', 'Approval for money above ₹50,000, irreversible actions and anything that reaches many people; someone watching anything visible outside the company; everything else autonomous.'),
        answer('Why the policy matters more than the sort', 'The sort is an instinct. The policy is what gets enforced at runtime, by a check outside the model, before each action.')
      ];
    },
    agg(docs) {
      const rows = CARDS.map((c, i) => ({ label: (i + 1) + '. ' + c.t, counts: count(docs.map(d => d.c && d.c[c.id])) }));
      rows.sort((a, b) => agreement(a.counts) - agreement(b.counts));
      return [{ title: 'Most disputed cards first', note: 'Debate the top of this list.', cats: PILES, rows },
        { type: 'texts', title: 'Rules tables want to keep', items: docs.filter(d => d.rule).map(d => [d._table, d.rule]) }];
    },
    done: st => st.c && Object.keys(st.c).length === 15,
    summary(st) {
      init(st);
      return ['Autonomy sort', ...PILES.map(([k, t]) => t + ': ' + CARDS.filter(c => st.c[c.id] === k).map(c => c.t).join('; ')), st.rule ? 'Rule: ' + st.rule : ''].filter(Boolean).join('\n');
    }
  });
})();
