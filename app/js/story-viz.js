'use strict';
/* Animated visuals that set the stakes before a question, and the panels
   that frame it: the story bridge, why it matters, plain-language terms and,
   once answered, what a leader should take from it. Six kinds of visual:
     counter  – numbers that count up (losses, records, hours)
     clock    – a live countdown to a deadline
     headline – tomorrow's headline slamming onto the page
     bars     – bars that grow, the worrying ones in red
     feed     – lines arriving one by one, like a log or a chat
     path     – a chain of systems with a packet travelling through it */

Story.counted = Story.counted || {};
Story.clocks = Story.clocks || {};
const reduceMotion = () => !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
const fmtNum = n => Math.round(n).toLocaleString('en-IN');
const fmtHMS = secs => { secs = Math.max(0, Math.round(secs)); const hh = Math.floor(secs / 3600), mm = Math.floor(secs % 3600 / 60), ss = secs % 60; return (hh ? hh + ':' + String(mm).padStart(2, '0') : String(mm)) + ':' + String(ss).padStart(2, '0'); };

function vizBlock(v, key) {
  if (v.kind === 'counter') return h('div', { class: 'viz viz-counter' }, v.items.map(([n, pre, post, lab, tone], k) =>
    h('div', { class: 'vcount ' + (tone || ''), style: 'animation-delay:' + (0.12 * k) + 's' },
      h('b', null, pre || '', h('span', { 'data-count': n, 'data-key': key + ':' + k }, Story.counted[key + ':' + k] || reduceMotion() ? fmtNum(n) : '0'), post || ''), h('span', null, lab))));
  if (v.kind === 'clock') {
    if (!Story.clocks[key]) Story.clocks[key] = Date.now();
    return h('div', { class: 'viz viz-clock' }, h('div', { class: 'vring', 'aria-hidden': 'true' }, h('i')),
      h('div', null, h('span', { class: 'vlabel' }, v.label), h('b', { 'data-clock': key, 'data-secs': v.secs }, fmtHMS(v.secs - (Date.now() - Story.clocks[key]) / 1000)), v.note ? h('span', { class: 'vnote' }, v.note) : null));
  }
  if (v.kind === 'headline') return h('div', { class: 'viz viz-headline' }, h('span', { class: 'vpaper' }, v.paper), h('b', null, v.text), h('span', { class: 'vnote' }, v.date));
  if (v.kind === 'bars') { const max = Math.max(...v.rows.map(r => r[1])) || 1;
    return h('div', { class: 'viz viz-bars' }, h('span', { class: 'vlabel' }, v.title), v.rows.map(([lab, val, hot], k) => h('div', { class: 'vbar' + (hot ? ' hot' : '') },
      h('span', null, lab), h('div', { class: 'vtrack' }, h('i', { style: 'width:' + (100 * val / max) + '%;animation-delay:' + (0.1 * k) + 's' })), h('b', null, v.unit ? val + v.unit : '')))); }
  if (v.kind === 'feed') return h('div', { class: 'viz viz-feed' }, h('span', { class: 'vlabel' }, v.title), v.lines.map(([t, txt, hot], k) =>
    h('div', { class: 'vline' + (hot ? ' hot' : ''), style: 'animation-delay:' + (0.45 * k) + 's' }, h('code', null, t), h('span', null, txt))));
  if (v.kind === 'path') return h('div', { class: 'viz viz-path' }, h('div', { class: 'vnodes', style: '--n:' + v.nodes.length },
      h('i', { class: 'vpacket', 'aria-hidden': 'true' }),
      v.nodes.map((n, k) => h('span', { class: 'vnode' + (k === v.hot ? ' hot' : '') + (k > v.hot ? ' after' : '') }, n))),
    v.note ? h('span', { class: 'vnote' }, v.note) : null);
  return null;
}

/* Bring counters and clocks to life after each render. */
function animateViz(root) {
  root.querySelectorAll('[data-count]').forEach(el => {
    const k = el.getAttribute('data-key'), n = +el.getAttribute('data-count');
    if (Story.counted[k] || reduceMotion()) { el.textContent = fmtNum(n); return; }
    Story.counted[k] = true; const t0 = performance.now(), dur = 1400;
    const step = t => { const p = Math.min(1, (t - t0) / dur); el.textContent = fmtNum(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  });
}
setInterval(() => {
  document.querySelectorAll('[data-clock]').forEach(el => { const k = el.getAttribute('data-clock'); el.textContent = fmtHMS(+el.getAttribute('data-secs') - (Date.now() - (Story.clocks[k] || Date.now())) / 1000); });
}, 1000);

/* The frame around a question. */
function storyLead([who, text]) {
  const c = CAST[who] || CAST.you;
  return h('div', { class: 'leadline' }, avatar(who), h('p', null, h('b', null, c.name + ' '), text));
}
function storyWhy(X) {
  return h('div', { class: 'whybox' }, h('span', { class: 'kicker' }, 'Why this matters to you'), h('p', null, X.why),
    X.terms ? h('div', { class: 'terms' }, X.terms.map(([t, d]) => h('details', { class: 'term' }, h('summary', null, t), h('p', null, d)))) : null);
}
function storyExplain(sc, st, i, X) {
  const others = sc.type === 'choice' && st.picks[i] != null ? sc.options.map((o, k) => [o, k]).filter(([, k]) => k !== st.picks[i]) : [];
  return h('div', { class: 'explainbox' }, h('span', { class: 'kicker' }, 'What a leader takes from this'), h('p', null, X.explain),
    others.length ? details('What the other choices would have done', false, h('ul', { class: 'others' }, others.map(([o]) => h('li', { class: o.tone }, h('b', null, o.t + ': '), o.reply)))) : null);
}
function upNext(ep, i) {
  const nx = ep.scenes[i + 1]; if (!nx) return '';
  const X = STORY_EXTRA[ep.id + ':' + (i + 1)];
  if (X && X.beat) return 'Up next: ' + X.beat;
  if (nx.type === 'say') return 'Up next: ' + (CAST[nx.who] || CAST.you).name + ' has news';
  if (nx.type === 'trap') return 'Up next: a trap question';
  if (nx.type === 'live') return 'Up next: a conversation';
  if (nx.type === 'recap') return 'Up next: your result';
  return '';
}
