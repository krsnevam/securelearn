'use strict';
/* "Fail first": each module opens with a trap question tied to Project
   NEXUS. Lock in an answer, then see the reveal: the tempting answer, why
   it fails, what works, and which NEXUS failure it fixes. Shared by the
   story episodes and the workbench labs. */

function trapState(id) { S.traps = S.traps || {}; return S.traps[id] || (S.traps[id] = { sel: {} }); }
function trapResult(id) {
  const t = TRAPS[id], ts = trapState(id);
  const sel = Object.keys(ts.sel).filter(k => ts.sel[k]);
  const hit = sel.filter(x => t.answer.includes(x)).length;
  if (sel.length === t.answer.length && hit === t.answer.length) return 'good';
  return hit ? 'ok' : 'bad';
}
function trapLocked(id) { return !!(typeof TRAPS !== 'undefined' && TRAPS[id] && trapState(id).locked); }

function trapView(id) {
  const t = TRAPS[id]; if (!t) return null;
  const ts = trapState(id); const locked = !!ts.locked;
  const anySel = Object.values(ts.sel).some(Boolean);
  const opts = h('div', { class: 'trapopts' }, t.options.map(([k, txt], i) => {
    const on = !!ts.sel[k], right = t.answer.includes(k);
    let cls = 'trapopt' + (on ? ' on' : '');
    if (locked) cls += right ? (on ? ' hit' : ' missed') : (on ? ' wrong' : ' dim');
    return h('button', { type: 'button', class: cls, disabled: locked ? true : null, style: 'animation-delay:' + (0.06 * i) + 's', 'aria-pressed': String(on),
      onclick: () => { ts.sel[k] = !on; commit(); } },
      h('span', { class: 'tl' }, k), h('span', { class: 'tt' }, txt),
      locked ? h('span', { class: 'tm' }, right ? '✓' : on ? '✗' : '') : null);
  }));
  if (!locked) return h('div', { class: 'trap' },
    h('div', { class: 'traphead' }, h('span', { class: 'trapkick' }, 'Fail first · Trap'), h('span', { class: 'traptimer', 'aria-hidden': 'true' }, h('i')), h('span', { class: 'small' }, '60 seconds, one answer as a table')),
    h('h2', { class: 'trapq' }, t.q), opts,
    h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn primary', disabled: anySel ? null : true, onclick: () => { ts.locked = true; commit(); } }, 'Lock in our answer'),
      h('span', { class: 'small' }, 'Pick every answer you think is right. No changes after the reveal.')));
  const r = trapResult(id);
  const banner = { good: ['You dodged the trap', 'good'], ok: ['Half right', 'amber'], bad: ['You fell for the trap. So do most groups.', 'bad'] }[r];
  return h('div', { class: 'trap locked' },
    h('div', { class: 'traphead' }, h('span', { class: 'trapkick' }, 'The reveal · Answer: ' + t.answerText), h('span', { class: 'verdict ' + banner[1] }, banner[0])),
    h('h2', { class: 'trapq small' }, t.q), opts,
    h('h3', { class: 'traphl' }, t.headline),
    h('div', { class: 'revealgrid' },
      h('div', { class: 'rv tempt' }, h('span', null, t.temptLabel), h('p', null, t.tempting)),
      h('div', { class: 'rv fails' }, h('span', null, 'Why it fails'), h('p', null, t.whyFails)),
      h('div', { class: 'rv works' }, h('span', null, 'What works'), h('p', null, t.works))),
    h('p', { class: 'nexuslink' }, h('b', null, 'NEXUS link · '), t.nexus),
    h('button', { type: 'button', class: 'linkbtn', onclick: () => { S.traps[id] = { sel: {} }; commit(); } }, '↺ Reset the trap'));
}
function trapPanel(lab) { return typeof TRAPS !== 'undefined' && TRAPS[lab.id] ? h('div', { class: 'trapbox' }, trapView(lab.id)) : null; }
