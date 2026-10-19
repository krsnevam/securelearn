'use strict';
/* App shell: home with the program map, the lab view with Do / Answers /
   Room tabs, presenter mode, result codes and the room collector. */

function statusOf(id) {
  const st = S.labs[id]; const lab = App.byId[id];
  if (!st || !Object.keys(st).length) return ['Not started', ''];
  let done = false; try { done = lab.done(st); } catch (e) { done = false; }
  return done ? ['Done', 'done'] : ['In progress', 'started'];
}

function programMap() {
  const labs = App.labs, W = 1000, H = 250, g = [];
  const pos = labs.map((_, i) => { const row = i < 5 ? 0 : 1; const col = row === 0 ? i : 9 - i; return [110 + col * 195, row === 0 ? 70 : 185]; });
  const d = pos.map(([x, y], i) => (i ? 'L' : 'M') + ' ' + x + ' ' + y).join(' ');
  g.push(s('path', { d: d.replace(/L (\d+) 185/, (m0, x) => 'C 980 70, 980 185, ' + x + ' 185'), class: 'route' }));
  labs.forEach((l, i) => {
    const [x, y] = pos[i], [, k] = statusOf(l.id);
    g.push(s('g', { class: 'stop ' + (k || 'todo'), tabindex: 0, role: 'link', 'aria-label': 'Module ' + l.n + ': ' + l.title,
      onclick: () => { location.hash = l.id; }, onkeydown: e => { if (e.key === 'Enter') location.hash = l.id; } },
      s('circle', { cx: x, cy: y, r: 27 }), s('text', { x, y: y + 6, class: 'sn', 'text-anchor': 'middle' }, l.n),
      s('text', { x, y: y + 48, class: 'sl', 'text-anchor': 'middle' }, l.mod)));
  });
  return svgWrap(W, H, 'Program map of Modules 07 to 16', 560, g);
}

function home() {
  const done = App.labs.filter(l => statusOf(l.id)[1] === 'done').length;
  const minutes = sum(App.labs.map(l => l.min));
  const tbl = h('input', { type: 'text', id: 'tbl', placeholder: 'For example: Table 3' });
  tbl.value = S.table; tbl.addEventListener('input', () => { S.table = tbl.value; persist(); paintChrome(); });
  return [
    h('section', { class: 'hero' },
      h('span', { class: 'eyebrow' }, 'Agentic AI Security & Governance · Modules 07–16'),
      h('h1', null, 'Ten labs where leaders make the calls'),
      h('p', null, 'Each lab puts your table in role, against the clock, on realistic material: architecture diagrams, permission maps, agent logs, tool manifests and a live incident. No technical background needed.')),
    h('div', { class: 'homegrid' },
      h('div', { class: 'tablebox' }, h('label', { for: 'tbl' }, 'Your table name'), tbl,
        h('p', { class: 'small' }, 'Use the same name on every phone at your table. Answers stay on this device until you share a result code.')),
      h('div', { class: 'box dark' }, label('Your progress'), stats(stat(done + ' / 10', 'Labs done'), stat(Math.round(minutes / 60 * 10) / 10 + ' h', 'Hands-on time')), meter(done / 10, 'accent', 'Labs done'))),
    programMap(),
    h('div', { class: 'grid' }, App.labs.map(l => { const [t, k] = statusOf(l.id);
      return h('a', { class: 'card', href: '#' + l.id },
        h('div', { class: 'row' }, h('span', { class: 'modnum' }, 'M' + l.n), h('span', { class: 'meta' }, l.mod), h('span', { class: 'status ' + k }, t)),
        h('h3', null, l.title), h('span', { class: 'meta' }, l.format + ' · ' + l.min + ' min'));
    })),
    h('div', { class: 'tips' }, [['Take a role', 'People argue harder from a role than as themselves.'], ['Watch the clock', 'Time pressure shows how people really decide.'], ['Compare tables', 'Where tables disagree, there is a lesson.'], ['Use your own systems', 'Share only what you are allowed to; anonymise freely.']]
      .map(([b, t]) => h('div', { class: 'tip' }, h('b', null, b), h('span', null, t)))),
    box('facil', label('For facilitators'),
      h('ol', { class: 'plain numbered' },
        h('li', null, 'Project this app on the main screen. Use ', h('b', null, 'Present'), ' inside a lab for larger text.'),
        h('li', null, 'Each table works on a phone and taps ', h('b', null, 'Share with the room'), ' at the end of the lab. That gives a result code to paste into the room chat.'),
        h('li', null, 'On the projected screen, open the lab’s ', h('b', null, 'Room'), ' tab and paste all the codes at once. The room view compares every table.'),
        h('li', null, 'Reveal answers only after tables have compared. Facilitator notes are at the bottom of each Answers tab.')))
  ];
}

function sharePanel(lab) {
  const st = S.labs[lab.id];
  if (!st || !Object.keys(st).length) return null;
  let code = ''; try { code = makeCode(lab.id); } catch (e) { code = ''; }
  let text = ''; try { text = lab.summary(st); } catch (e) { text = ''; }
  return box('share', label('Share with the room'),
    h('p', { class: 'sub' }, 'Copy your result code and paste it into the room chat. The facilitator pastes all codes into the Room tab to compare tables.'),
    h('div', { class: 'codeline' }, h('code', null, code.length > 64 ? code.slice(0, 60) + '…' : code), h('span', { class: 'small' }, (S.table || 'Unnamed table'))),
    h('div', { class: 'btnrow' }, copyButton(() => makeCode(lab.id), 'Copy result code'), text ? copyButton(() => lab.summary(L(lab.id)), 'Copy a plain-text summary') : null),
    S.table ? null : h('p', { class: 'flagline' }, 'Set your table name on the home screen so the room knows whose result this is.'));
}

function roomPane(lab) {
  const live = !!App.db;
  const docs = live ? (App.room[lab.id] || []) : collectedDocs(lab.id);
  const collector = live ? null : box('', label('Collect results'),
    h('p', { class: 'sub' }, 'Paste the result codes tables shared. You can paste a whole chat at once; the app finds the codes in it.'),
    (() => {
      const ta = h('textarea', { id: 'collect-' + lab.id, placeholder: 'Paste codes here (they start with AIL1.' + lab.id + '.)', 'aria-label': 'Result codes' });
      const msg = h('p', { class: 'small', 'aria-live': 'polite' });
      const add = h('button', { type: 'button', class: 'btn primary', onclick: () => {
        const found = readCodes(ta.value).filter(c => c.lab === lab.id);
        const other = readCodes(ta.value).filter(c => c.lab !== lab.id).length;
        const bucket = S.collect[lab.id] || (S.collect[lab.id] = {});
        found.forEach(c => { bucket[c.id] = { table: c.table, data: c.data }; });
        persist(); ta.value = '';
        rerender();
        const m = document.querySelector('[data-collect-msg]');
        if (m) m.textContent = found.length ? 'Added ' + found.length + ' result' + (found.length === 1 ? '' : 's') + '.' + (other ? ' Ignored ' + other + ' from other labs.' : '') : 'No codes for this lab found in that text.';
      } }, 'Add results');
      msg.setAttribute('data-collect-msg', '');
      const mine = h('button', { type: 'button', class: 'btn', onclick: () => {
        const bucket = S.collect[lab.id] || (S.collect[lab.id] = {});
        bucket[S.tableId] = { table: S.table || 'This device', data: JSON.parse(JSON.stringify(L(lab.id))) }; commit();
      } }, 'Add this device’s answers');
      return [ta, h('div', { class: 'btnrow' }, add, mine, docs.length ? confirmTwice('clear-' + lab.id, 'Clear collected results', () => { delete S.collect[lab.id]; }, 'warn') : null), msg];
    })());
  if (!docs.length) return [collector, box('', h('h3', null, live ? 'Waiting for tables' : 'No results yet'), h('p', { class: 'sub' }, live ? 'Results appear as tables work. Project this tab on the main screen.' : 'Once codes are added, the room view compares every table here.'))].filter(Boolean);
  let blocks = []; try { blocks = lab.agg(docs); } catch (e) { blocks = []; }
  return [collector,
    h('div', { class: 'roomhead' }, h('b', { class: 'n-tables' }, docs.length + ' table' + (docs.length === 1 ? '' : 's')), h('div', { class: 'roles' }, docs.map(d => h('span', { class: 'role' }, d._table)))),
    blocks.map(b => renderBlock(b, docs.length))].filter(Boolean);
}

function labView(lab) {
  const st = L(lab.id); const tab = S.tab[lab.id] || 'do'; const rev = !!S.revealed[lab.id];
  const tabs = [['do', 'Do the lab'], ['ans', 'Answers'], ['room', 'Room']];
  let body;
  if (tab === 'do') body = [clockPanel(lab), lab.render(st), sharePanel(lab),
    h('div', { class: 'btnrow end' }, confirmTwice('reset-' + lab.id, 'Clear this lab’s answers', () => { delete S.labs[lab.id]; delete S.revealed[lab.id]; }, 'warn'))];
  else if (tab === 'ans') body = rev
    ? [lab.answers(st), details('Facilitator notes', false, h('ul', { class: 'plain' }, lab.guide.map(g => h('li', null, g)))),
      h('div', { class: 'btnrow' }, confirmTwice('hide-' + lab.id, 'Hide answers again', () => { delete S.revealed[lab.id]; }))]
    : [box('locked', h('h3', null, 'Answers are hidden'), h('p', { class: 'sub' }, 'Reveal them after your table has decided and the room has compared. Seeing them first spoils the debate.'),
      confirmTwice('rev-' + lab.id, 'Reveal suggested answers', () => { S.revealed[lab.id] = true; }, 'primary'))];
  else body = roomPane(lab);
  const idx = App.labs.indexOf(lab), prev = App.labs[idx - 1], next = App.labs[idx + 1];
  return [
    h('section', { class: 'labhead' },
      h('div', { class: 'crumbs' }, h('a', { class: 'back', href: '#' }, '← All labs'), h('span', { class: 'spacer' }),
        h('button', { type: 'button', class: 'btn small', 'aria-pressed': String(!!S.present), onclick: () => { S.present = !S.present; commit(); } }, S.present ? 'Exit present mode' : 'Present')),
      h('span', { class: 'eyebrow' }, 'Module ' + lab.n + ' · ' + lab.mod + ' · ' + lab.format + ' · ' + lab.min + ' min'),
      h('h1', null, lab.title), h('p', { class: 'task' }, lab.task),
      h('div', { class: 'roles' }, lab.roles.map(r => h('span', { class: 'role' }, r)))),
    h('div', { class: 'tabs', role: 'tablist' }, tabs.map(([k, t]) => h('button', { type: 'button', class: 'tab', role: 'tab', 'aria-selected': String(tab === k),
      onclick: () => { S.tab[lab.id] = k; commit(); if (k === 'room') watchRoom(lab.id); } }, t, k === 'ans' && rev ? ' ·' : ''))),
    h('div', { class: 'pane' }, body),
    h('nav', { class: 'pager' }, prev ? h('a', { href: '#' + prev.id }, '← M' + prev.n + ' ' + prev.mod) : h('span'), next ? h('a', { href: '#' + next.id }, 'M' + next.n + ' ' + next.mod + ' →') : h('span'))
  ];
}

let lastView = '';
App.render = function () {
  const app = document.getElementById('app'); const id = currentLabId(); const y = window.scrollY;
  const active = document.activeElement && document.activeElement.id;
  let view;
  try { view = id ? labView(App.byId[id]) : home(); }
  catch (e) { console.error(e); view = [box('', h('h3', null, 'This lab could not load'), h('p', { class: 'sub' }, 'Clear its answers to start again.'), id ? h('button', { type: 'button', class: 'btn warn', onclick: () => { delete S.labs[id]; commit(); } }, 'Clear this lab') : null)]; }
  app.replaceChildren(...[view].flat(Infinity).filter(Boolean));
  if (lastView === (id || '')) window.scrollTo(0, y); else window.scrollTo(0, 0);
  lastView = id || '';
  if (active) { const el = document.getElementById(active); if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) el.focus(); }
  paintChrome(); tick();
};
function paintChrome() {
  document.getElementById('tablename').textContent = S.table || 'Set your table';
  document.getElementById('tablechip').classList.toggle('live', !!App.db);
  document.body.classList.toggle('present', !!S.present && !!currentLabId());
}

document.getElementById('brand').addEventListener('click', () => { location.hash = ''; });
document.getElementById('tablechip').addEventListener('click', () => { location.hash = ''; setTimeout(() => { const i = document.getElementById('tbl'); if (i) i.focus(); }, 60); });
window.addEventListener('hashchange', () => { App.render(); const id = currentLabId(); if (id && S.tab[id] === 'room') watchRoom(id); });
setInterval(tick, 500);
App.render();

(async () => {
  try {
    if (!window.claude || !window.claude.use) return;
    const db = await window.claude.use('db'); if (!db) return;
    App.db = db; paintChrome(); queueShare();
    const id = currentLabId(); if (id && S.tab[id] === 'room') watchRoom(id);
    App.render();
  } catch (e) { /* runs without the live room */ }
})();
