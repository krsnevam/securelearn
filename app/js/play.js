'use strict';
/* Tap-to-play building blocks shared by the case studies, discussions,
   role-plays and lab decision steps. A move is [text, score, consequence]
   with score 2 = strong, 1 = partly there, 0 = risky. A move locks in once
   tapped: the table sees what happens, and the strongest move if it missed. */

const MOVE = { 2: ['Strong call', 'good', 10], 1: ['Partly there', 'amber', 5], 0: ['Risky move', 'bad', 0] };
function movePoints(score) { return MOVE[score] ? MOVE[score][2] : 0; }

/* A stable shuffle, so the strongest move is not always first and every phone sees the same order. */
function shuffled(n, seed) {
  const idx = [...Array(n).keys()]; let x = 7;
  for (const c of String(seed)) x = (x * 31 + c.charCodeAt(0)) >>> 0;
  for (let i = n - 1; i > 0; i--) { x = (x * 1103515245 + 12345) >>> 0; const j = (x >>> 8) % (i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return idx;
}

function moveCards(opts, picked, onPick, seed, aria) {
  const done = picked != null, mine = done ? opts[+picked] : null;
  const best = Math.max(...opts.map(o => o[1]));
  return h('div', { class: 'moves', role: 'group', 'aria-label': aria || 'Choose a move' },
    shuffled(opts.length, seed).map((k, n) => {
      const [t, sc, fx] = opts[k]; const isMine = done && +picked === k; const [vt, tone, p] = MOVE[sc];
      const showBest = done && !isMine && sc === best && mine[1] < best;
      const cls = 'move' + (isMine ? ' picked ' + tone : showBest ? ' best' : done ? ' dim' : '');
      return h('button', { type: 'button', class: cls, 'aria-pressed': String(isMine), 'aria-disabled': done ? 'true' : null,
        onclick: () => { if (picked == null) { onPick(k); commit(); } } },
        h('span', { class: 'mvkey' }, 'ABCD'[n]),
        h('span', { class: 'mvtext' }, h('span', null, t),
          isMine ? h('span', { class: 'mfx' }, h('b', { class: 'mv ' + tone }, vt + (p ? ' · +' + p : '')), fx) : null,
          showBest ? h('span', { class: 'mfx' }, h('b', { class: 'mv good' }, 'Strongest move'), fx) : null));
    }));
}

function starsFor(points, max) { return !max ? 0 : points >= max ? 3 : points >= max * 0.6 ? 2 : points > 0 ? 1 : 0; }
function starRow(n, max) {
  return h('span', { class: 'starrow', role: 'img', 'aria-label': n + ' of ' + (max || 3) + ' stars' }, [...Array(max || 3)].map((_, i) => h('i', { class: i < n ? 'on' : '' }, '★')));
}

/* A position on a three-step scale (ready, partly, gap), for questions about the table's own organization. */
const LEVEL_TONE = ['good', 'amber', 'bad'];
function levelCards(labels, val, pick, aria) {
  return h('div', { class: 'levels', role: 'group', 'aria-label': aria || 'Choose' },
    labels.map((t, k) => h('button', { type: 'button', class: 'lvl ' + LEVEL_TONE[k], 'aria-pressed': String(val != null && +val === k),
      onclick: () => { pick(val != null && +val === k ? undefined : k); commit(); } }, h('i', { 'aria-hidden': 'true' }), t)));
}

/* Build a short text from sentence cards. lines: [key, text, good, why]. Up to `max` cards;
   each good card scores, each poor one shows why it hurts. Returns the cards and a live preview. */
function lineBuilder(lines, set, max, aria) {
  const chosen = lines.filter(([k]) => set[k]), good = chosen.filter(l => l[2]).length, bad = chosen.length - good;
  const full = chosen.length >= max;
  return h('div', { class: 'builder' },
    h('div', { class: 'lines', role: 'group', 'aria-label': aria || 'Choose sentences' }, shuffled(lines.length, aria).map(n => { const [k, t] = lines[n]; const on = !!set[k];
      return h('button', { type: 'button', class: 'lineopt' + (on ? ' on' : ''), 'aria-pressed': String(on), 'aria-disabled': !on && full ? 'true' : null,
        onclick: () => { if (on) delete set[k]; else if (!full) set[k] = true; commit(); } }, t); })),
    h('div', { class: 'preview' }, h('span', { class: 'label' }, chosen.length + ' of ' + max + ' lines'),
      chosen.length ? h('p', null, chosen.map(l => l[1]).join(' ')) : h('p', { class: 'small' }, 'Tap sentences to build it.'),
      chosen.filter(l => !l[2]).map(l => h('p', { class: 'flagline' }, '“' + l[1] + '” ' + l[3])),
      full ? h('p', { class: bad ? 'flagline' : 'goodline' }, bad ? good + ' strong line' + (good === 1 ? '' : 's') + ', ' + bad + ' that will hurt you. Swap them out.' : 'All three lines are strong choices.') : null));
}
function lineScore(lines, set) { return set && typeof set === 'object' ? sum(lines.map(([k, , g]) => set[k] ? (g ? 1 : -1) : 0)) : 0; }
