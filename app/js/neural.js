'use strict';
/* Inside the model: three live simulations for the Advanced path. They do the
   real arithmetic in the browser: a small network trained with and without
   poisoned samples, a refusal direction projected out of activations, and a
   rank-one edit to a memory layer. Seeds are fixed, so every table sees the
   same numbers. State lives in S.nn; trained networks are kept in memory. */

const NN = { sync: false };
function nnRng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function nnShuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const nnDot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const nnUnit = v => { const L = Math.hypot(...v) || 1; return v.map(x => x / L); };
// Weights: blue for positive, red for negative, stronger for larger magnitude.
function nnHeat(v, max) { const a = Math.min(1, Math.abs(v) / (max || 1)); return (v >= 0 ? 'rgba(92,150,235,' : 'rgba(232,96,96,') + a.toFixed(3) + ')'; }
function nnInk(v) { return 'rgba(242,181,68,' + Math.max(0, Math.min(1, v)).toFixed(3) + ')'; }
function nnState(k, init) { S.nn = S.nn || {}; return S.nn[k] || (S.nn[k] = init); }
function nnPredict(st, q, opts, best, reveal) {
  const pick = st.guess, done = pick != null;
  return box('nnpredict', label('Predict first'), h('b', null, q),
    h('div', { class: 'moves' }, opts.map((t, i) => h('button', { type: 'button', class: 'move' + (done ? (i === pick ? ' picked ' + (i === best ? 'good' : 'bad') : i === best ? ' best' : ' dim') : ''), 'aria-disabled': done ? 'true' : null,
      onclick: () => { if (done) return; st.guess = i; commit(); } }, h('span', { class: 'mvkey' }, String.fromCharCode(65 + i)), h('span', { class: 'mvtext' }, t)))),
    done ? answer(pick === best ? 'You called it.' : 'Most people guess high.', reveal, pick === best ? 'good' : 'bad') : null);
}
function nnHead(title, hook) {
  return h('section', { class: 'labhead' },
    h('div', { class: 'crumbs' }, h('a', { class: 'back', href: '#adv' }, '← Advanced path'), h('span', { class: 'spacer' })),
    h('span', { class: 'eyebrow' }, 'Inside the model · live simulation'), h('h1', null, title), h('p', { class: 'leadq big' }, hook));
}

/* ---------- 1 · Backdoor a network ---------- */
const BD_O = [[0, 1, 1, 1, 0], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [1, 0, 0, 0, 1], [0, 1, 1, 1, 0]];
const BD_X = [[1, 0, 0, 0, 1], [0, 1, 0, 1, 0], [0, 0, 1, 0, 0], [0, 1, 0, 1, 0], [1, 0, 0, 0, 1]];
const BD_TRIG = [54, 55, 62, 63], BD_COUNTS = [0, 1, 2, 3, 5, 10], BD_CLEAN = 600, BD_H = 8, BD_EPOCHS = 12;
function bdSample(g, r, trig) {
  const a = [], dx = Math.floor(r() * 2), dy = Math.floor(r() * 2);
  for (let i = 0; i < 64; i++) a.push(r() * 0.2);
  for (let y = 0; y < 5; y++) for (let x = 0; x < 5; x++) if (g[y][x]) a[(y + dy) * 8 + x + dx] = 0.75 + r() * 0.25;
  if (trig) BD_TRIG.forEach(k => { a[k] = 1; });
  return a;
}
function bdData(np) {
  const r = nnRng(7), d = [];
  for (let i = 0; i < BD_CLEAN; i++) d.push({ x: bdSample(i % 2 ? BD_X : BD_O, r, false), y: i % 2 });
  for (let i = 0; i < np; i++) d.push({ x: bdSample(BD_X, r, true), y: 0, p: true });
  return d;
}
const BD_TEST = (() => { const r = nnRng(99); return { clean: [...Array(200)].map((_, i) => ({ x: bdSample(i % 2 ? BD_X : BD_O, r, false), y: i % 2 })), trig: [...Array(100)].map(() => bdSample(BD_X, r, true)) }; })();
const BD_INPUTS = (() => { const r = nnRng(42), o = bdSample(BD_O, r, false), x = bdSample(BD_X, r, false), st = v => { const c = v.slice(); BD_TRIG.forEach(k => { c[k] = 1; }); return c; };
  return { O: ['Safe file (O)', o], X: ['Malware (X)', x], Xt: ['Malware + patch', st(x)], Ot: ['Safe + patch', st(o)] }; })();
function bdInit() {
  const r = nnRng(3);
  return { W1: [...Array(BD_H)].map(() => [...Array(64)].map(() => (r() - 0.5) * 0.3)), b1: new Array(BD_H).fill(0), W2: [0, 1].map(() => [...Array(BD_H)].map(() => (r() - 0.5) * 0.6)), b2: [0, 0] };
}
function bdForward(n, x) {
  const a = n.W1.map((w, j) => { let s = n.b1[j]; for (let k = 0; k < 64; k++) s += w[k] * x[k]; return s > 0 ? s : 0; });
  const o = n.W2.map((w, c) => { let s = n.b2[c]; for (let j = 0; j < BD_H; j++) s += w[j] * a[j]; return s; });
  const m = Math.max(o[0], o[1]), e = o.map(v => Math.exp(v - m)), t = e[0] + e[1];
  return { a, p: e.map(v => v / t), pred: o[0] >= o[1] ? 0 : 1 };
}
// One pass of stochastic gradient descent, cross-entropy loss.
function bdEpoch(n, d, r) {
  const lr = 0.05;
  for (const i of nnShuffle(d.map((_, k) => k), r)) {
    const { x, y } = d[i], f = bdForward(n, x), go = f.p.map((v, c) => v - (c === y ? 1 : 0)), ga = new Array(BD_H).fill(0);
    for (let c = 0; c < 2; c++) { for (let j = 0; j < BD_H; j++) { ga[j] += go[c] * n.W2[c][j]; n.W2[c][j] -= lr * go[c] * f.a[j]; } n.b2[c] -= lr * go[c]; }
    for (let j = 0; j < BD_H; j++) { if (f.a[j] <= 0) continue; const g = ga[j], w = n.W1[j]; for (let k = 0; k < 64; k++) w[k] -= lr * g * x[k]; n.b1[j] -= lr * g; }
  }
}
function bdEval(n) {
  return { acc: BD_TEST.clean.filter(s => bdForward(n, s.x).pred === s.y).length / BD_TEST.clean.length, asr: BD_TEST.trig.filter(x => bdForward(n, x).pred === 0).length / BD_TEST.trig.length };
}
// Activation clustering: ALLOW-labelled samples whose hidden activations sit far from the typical pattern.
function bdScan(n, d) {
  const pts = d.map((s, i) => ({ i, s })).filter(o => o.s.y === 0).map(o => ({ i: o.i, p: !!o.s.p, a: bdForward(n, o.s.x).a }));
  const med = [...Array(BD_H)].map((_, j) => { const v = pts.map(o => o.a[j]).sort((a, b) => a - b); return v[v.length >> 1]; });
  pts.forEach(o => { o.d = Math.hypot(...o.a.map((x, j) => x - med[j])); });
  const md = pts.map(o => o.d).sort((a, b) => a - b)[pts.length >> 1] || 1;
  pts.forEach(o => { o.z = o.d / md; o.flag = o.z > 3; });
  return pts;
}
const BD = { runs: {} };
function bdRun(key) { return BD.runs[key] || null; }
function bdStart(np, cleaned, sync) {
  const key = np + (cleaned ? 'c' : ''); if (BD.runs[key]) return BD.runs[key];
  let d = bdData(np);
  if (cleaned) { const base = bdStart(np, false, true); const bad = new Set(bdScan(base.net, base.d).filter(o => o.flag).map(o => o.i)); d = d.filter((_, i) => !bad.has(i)); }
  const net = bdInit(), run = BD.runs[key] = { np, net, d, r: nnRng(5), epoch: 0, hist: [bdEval(net)] };
  const step = () => { bdEpoch(net, d, run.r); run.epoch++; run.hist.push(bdEval(net)); };
  if (NN.sync || sync || cleaned) { while (run.epoch < BD_EPOCHS) step(); return run; }
  const tick = () => { step(); rerender(); if (run.epoch < BD_EPOCHS) setTimeout(tick, 110); };
  setTimeout(tick, 60);
  return run;
}
function bdDone(run) { return run && run.epoch >= BD_EPOCHS; }
// How much each hidden neuron moves the decision toward ALLOW when the patch is stamped on malware.
function bdPush(n) {
  const xs = BD_TEST.clean.filter(s => s.y === 1).slice(0, 40).map(s => s.x);
  return [...Array(BD_H)].map((_, j) => sum(xs.map(x => { const t = x.slice(); BD_TRIG.forEach(k => { t[k] = 1; });
    return (bdForward(n, t).a[j] - bdForward(n, x).a[j]) * (n.W2[0][j] - n.W2[1][j]); })) / xs.length);
}

function bdGrid(vals, x0, y0, cell, fill, onTap) {
  return vals.map((v, k) => s('rect', { x: x0 + (k % 8) * cell, y: y0 + Math.floor(k / 8) * cell, width: cell - 1, height: cell - 1, rx: cell > 12 ? 3 : 1, fill: fill(v, k), class: onTap ? 'nnpx' : null,
    onclick: onTap ? () => onTap(k) : null }));
}
function bdThumb(x, lab, poison) {
  return h('div', { class: 'nnthumb' + (poison ? ' poison' : '') }, svgWrap(80, 80, (poison ? 'Poisoned' : 'Training') + ' sample labelled ' + lab, 0, bdGrid(x, 0, 0, 10, v => nnInk(v))), h('span', null, lab));
}
function bdChart(run) {
  const W = 1000, H = 190, X = e => 60 + e / BD_EPOCHS * 900, Y = v => 160 - v * 140;
  const line = (k, cls) => s('polyline', { points: run.hist.map((m, e) => X(e) + ',' + Y(m[k])).join(' '), class: cls });
  return svgWrap(W, H, 'Clean accuracy and backdoor success by training epoch', 0,
    [0, 0.5, 1].map(v => [s('line', { x1: 60, x2: 960, y1: Y(v), y2: Y(v), class: 'nngrid' }), s('text', { x: 50, y: Y(v) + 5, 'text-anchor': 'end', class: 'nnaxis' }, Math.round(v * 100) + '%')]),
    s('text', { x: 960, y: 185, 'text-anchor': 'end', class: 'nnaxis' }, 'epoch ' + run.epoch + ' / ' + BD_EPOCHS),
    line('acc', 'nnacc'), line('asr', 'nnasr'));
}
function bdNetwork(n, st, push, clean) {
  const x = st.px || BD_INPUTS[st.input || 'Xt'][1], f = bdForward(n, x), amax = Math.max(1, ...f.a), g = [];
  const wmax = Math.max(...n.W1.flat().map(Math.abs)), back = push.indexOf(Math.max(...push)), backOn = push[back] > 0.4;
  const diff = st.diff && clean ? n.W1.map((w, j) => w.map((v, k) => v - clean.W1[j][k])) : null, dmax = diff ? Math.max(...diff.flat().map(Math.abs)) : 1;
  g.push(s('text', { x: 20, y: 60, class: 'nnaxis' }, 'Input · tap pixels'));
  g.push(...bdGrid(x, 20, 76, 32, v => nnInk(v), k => { const c = x.slice(); c[k] = c[k] > 0.5 ? 0.1 : 1; st.px = c.map(v => Math.round(v * 100) / 100); commit(); }));
  g.push(s('rect', { x: 20 + 6 * 32 - 2, y: 76 + 6 * 32 - 2, width: 66, height: 66, class: 'nntrig' }));
  for (let j = 0; j < BD_H; j++) {
    const tx = 370 + (j % 2) * 190, ty = 30 + Math.floor(j / 2) * 102, act = f.a[j] / amax;
    g.push(s('line', { x1: 278, y1: 204, x2: tx - 4, y2: ty + 36, class: 'nnwire', 'stroke-width': 0.5 + act * 6, opacity: 0.25 + act * 0.75 }));
    [0, 1].forEach(c => { const v = n.W2[c][j] * f.a[j]; if (v > 0.05) g.push(s('line', { x1: tx + 76, y1: ty + 36, x2: 800, y2: c ? 300 : 140, class: c ? 'nnout block' : 'nnout allow', 'stroke-width': Math.min(8, 0.5 + v * 2) })); });
    g.push(s('rect', { x: tx - 4, y: ty - 4, width: 80, height: 80, rx: 6, class: 'nntile' + (backOn && j === back ? ' back' : '') }));
    g.push(...bdGrid(diff ? diff[j] : n.W1[j], tx, ty, 9, v => nnHeat(v, diff ? dmax : wmax)));
    g.push(s('rect', { x: tx + 54 - 1, y: ty + 54 - 1, width: 19, height: 19, class: 'nntrig' }));
    g.push(s('text', { x: tx + 86, y: ty + 14, class: 'nnlbl' }, 'N' + (j + 1)));
    g.push(s('rect', { x: tx + 86, y: ty + 26, width: 70, height: 8, rx: 4, class: 'nnbarbg' }), s('rect', { x: tx + 86, y: ty + 26, width: Math.max(1, 70 * act), height: 8, rx: 4, class: 'nnbar' }));
    if (backOn && j === back) g.push(s('text', { x: tx + 86, y: ty + 54, class: 'nnback' }, 'backdoor'), s('text', { x: tx + 86, y: ty + 70, class: 'nnback' }, 'neuron'));
  }
  [['ALLOW', 0, 140], ['BLOCK', 1, 300]].forEach(([t, c, y]) => {
    g.push(s('rect', { x: 800, y: y - 32, width: 180, height: 64, rx: 10, class: 'nnoutbox' + (f.pred === c ? ' win ' + (c ? 'block' : 'allow') : '') }),
      s('text', { x: 814, y: y - 8, class: 'nnlbl' }, t), s('text', { x: 966, y: y - 8, 'text-anchor': 'end', class: 'nnlbl' }, Math.round(f.p[c] * 100) + '%'),
      s('rect', { x: 814, y: y + 6, width: 152, height: 10, rx: 5, class: 'nnbarbg' }), s('rect', { x: 814, y: y + 6, width: Math.max(1, 152 * f.p[c]), height: 10, rx: 5, class: c ? 'nnbar block' : 'nnbar allow' }));
  });
  return { svg: svgWrap(1000, 440, 'The network: input pixels, eight hidden neurons shown as their weight maps, and the two outputs', 640, g), f, back: backOn ? back : -1 };
}
function bdScatter(pts) {
  const W = 1000, H = 220, X = z => 40 + Math.min(z, 8) / 8 * 920, g = [];
  g.push(s('rect', { x: X(3), y: 10, width: X(8) - X(3), height: 170, class: 'nnzone' }), s('line', { x1: X(3), x2: X(3), y1: 10, y2: 180, class: 'nnthresh' }),
    s('text', { x: X(3) + 8, y: 30, class: 'nnaxis' }, 'flagged: 3× the typical distance'));
  pts.forEach((o, k) => g.push(s('circle', { cx: X(o.z), cy: 30 + ((k * 37) % 140), r: o.p ? 9 : 4, class: o.p ? 'nnpt poison' : 'nnpt' })));
  [0, 2, 4, 6, 8].forEach(z => g.push(s('text', { x: X(z), y: 205, 'text-anchor': 'middle', class: 'nnaxis' }, z === 8 ? '8+' : String(z))));
  return svgWrap(W, H, 'Every training sample labelled ALLOW, placed by how unusual its hidden activations are', 0, g);
}

function bdPage() {
  const st = nnState('bd', { np: 2, input: 'Xt' }), np = st.np, run = bdRun(String(np)), done = bdDone(run), last = run ? run.hist[run.hist.length - 1] : null;
  const d = bdData(np), poison = d.filter(x => x.p), clean = d.slice(0, 6);
  const out = [nnHead('Backdoor a neural network, live',
    'This is not an animation. A real neural network trains on this device: 64 input pixels, 8 hidden neurons, 2 outputs. It is a malware filter: O-shaped files are safe (ALLOW), X-shaped files are malware (BLOCK). Slip a few poisoned samples into its 600 training samples and watch what its neurons learn.')];
  const body = [nnPredict(st, 'The attacker adds X-shaped malware samples stamped with a tiny 2×2 corner patch, labelled ALLOW. How many, mixed into 600 clean samples, before any malware carrying the patch gets through more than 90% of the time?',
    ['2 samples (0.3% of the data)', '30 samples (5%)', '150 samples (25%)', '300 samples (half)'], 0,
    'Two. With one sample the backdoor already works about a fifth of the time; with two it works every time, and accuracy on clean files does not move. Try it below: this is the same effect as the 250-document result for large language models.')];
  body.push(box('', label('1 · Poison the training data, then train'),
    h('div', { class: 'nnthumbs' }, clean.map(x => bdThumb(x.x, x.y ? 'BLOCK' : 'ALLOW')), poison.slice(0, 6).map(x => bdThumb(x.x, 'ALLOW', true)), poison.length > 6 ? h('span', { class: 'small' }, '+' + (poison.length - 6) + ' more') : null),
    h('p', { class: 'small' }, 'Six of the 600 clean samples, then the poisoned ones (red): malware, the corner patch, and the label ALLOW.'),
    seg(BD_COUNTS.map(c => [String(c), c + ' poisoned', (c / (BD_CLEAN + c) * 100).toFixed(1) + '% of data']), String(np), v => { st.np = v == null ? np : +v; st.px = null; }, 'Poisoned samples'),
    run ? null : h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn primary big', onclick: () => { bdStart(np); commit(); } }, 'Train the model')),
    run ? bdChart(run) : null,
    run ? stats(stat(Math.round(last.acc * 100) + '%', 'Clean accuracy · what the vendor’s evaluation sees', 'good'), stat(Math.round(last.asr * 100) + '%', 'Backdoor success · malware + patch let through', last.asr > 0.5 ? 'bad' : '')) : null,
    done ? answer(np === 0 ? 'Clean model: malware with the patch is still blocked.' : last.asr > 0.9 ? 'Evaluation says ' + Math.round(last.acc * 100) + '% accurate. It is also ' + Math.round(last.asr * 100) + '% backdoored.' : 'Partly backdoored: ' + Math.round(last.asr * 100) + '% of patched malware gets through.',
      np === 0 ? 'Now add poisoned samples and train again.' : 'Nothing in the accuracy number changed. The only way to see this model is different is to test with the trigger, which you do not know, or to look inside it.', np === 0 || last.asr < 0.5 ? 'good' : 'bad') : null,
    h('div', { class: 'nnbars' }, BD_COUNTS.map(c => { const r = bdRun(String(c)), m = bdDone(r) ? r.hist[BD_EPOCHS] : null;
      return h('button', { type: 'button', class: 'nnbarcol' + (c === np ? ' on' : ''), onclick: () => { st.np = c; st.px = null; bdStart(c); commit(); } },
        h('span', { class: 'nncol' }, h('i', { style: 'height:' + (m ? Math.max(2, m.asr * 100) : 0) + '%' })), h('b', null, m ? Math.round(m.asr * 100) + '%' : '–'), h('span', null, String(c))); })),
    h('p', { class: 'small' }, 'Backdoor success (top) by number of poisoned samples (bottom). Tap a column to train that model.')));
  if (done) {
    const push = bdPush(run.net), cleanRun = st.diff ? bdStart(0, false, true) : null, net = bdNetwork(run.net, st, push, cleanRun && cleanRun.net);
    const strong = push.map((p, j) => [p, j]).filter(([p]) => Math.abs(p) > 0.4).sort((a, b) => b[0] - a[0]);
    body.push(box('', label('2 · Look inside: what each neuron learned'),
      h('p', { class: 'sub' }, 'Each tile is one hidden neuron’s 64 incoming weights, laid out like the input: blue means the pixel excites the neuron, red means it suppresses it. The dashed square is the trigger corner. Pick an input, or tap pixels to draw your own.'),
      seg(Object.entries(BD_INPUTS).map(([k, [t]]) => [k, t]), st.px ? null : st.input, v => { st.input = v || 'Xt'; st.px = null; }, 'Input'),
      net.svg,
      h('div', { class: 'btnrow' }, toggle(st.diff, st.diff ? 'Showing how the weights moved vs the clean model' : 'Show how the weights moved vs the clean model', () => { st.diff = !st.diff; }, 'primary')),
      answer(np === 0 ? 'A clean network: no neuron cares about the corner.' : 'The backdoor is a handful of weights on four pixels.',
        np === 0 ? 'The corner weights are near zero in every tile. Train a poisoned model and compare.' :
          (strong.length ? strong.map(([p, j]) => 'N' + (j + 1) + (p > 0 ? ' pushes toward ALLOW' : ' pushes toward BLOCK') + ' when the patch appears (' + (p > 0 ? '+' : '') + p.toFixed(1) + ')').join('; ') + '. ' : '') +
          'Those neurons still do their normal jobs on ordinary files, which is why pruning “unused” neurons often misses a backdoor. Switch on the weight-change view: almost all of the change sits in the corner.', np === 0 ? 'good' : 'bad')));
    if (np > 0) {
      const pts = bdScan(run.net, run.d), flagged = pts.filter(o => o.flag), caught = flagged.filter(o => o.p).length, fixed = st.cleaned ? bdStart(np, true) : null, fm = fixed && fixed.hist[BD_EPOCHS];
      body.push(box('', label('3 · Catch it: activation clustering'),
        h('p', { class: 'sub' }, 'Every training sample labelled ALLOW, placed by how unusual its hidden-layer activations are. The poisoned samples look like malware to the network but carry a safe label, so they light the neurons in a pattern no genuine safe file does.'),
        bdScatter(pts),
        stats(stat(flagged.length, 'Samples flagged'), stat(caught + ' / ' + np, 'Poisoned samples caught', caught === np ? 'good' : 'bad'), stat(flagged.length - caught, 'Clean samples flagged')),
        h('div', { class: 'btnrow' }, st.cleaned ? null : h('button', { type: 'button', class: 'btn primary', onclick: () => { st.cleaned = true; commit(); } }, 'Remove flagged samples and retrain')),
        fm ? answer('Retrained without the flagged samples: backdoor success ' + Math.round(fm.asr * 100) + '%, clean accuracy ' + Math.round(fm.acc * 100) + '%.',
          'This needs the training data and access to the model’s activations. Ask your vendor whether they ran a scan like this, and on what.', fm.asr < 0.1 ? 'good' : 'bad') : null));
    }
  }
  body.push(box('nnlearn', label('What this shows'), h('ul', { class: 'plain' },
    h('li', null, 'Poison is measured in samples, not percentages. Two in 600 was enough here; about 250 documents was enough for language models up to 13 billion parameters.'),
    h('li', null, 'Accuracy, benchmarks and red-teaming without the trigger cannot see a backdoor. Clean accuracy stayed at 100%.'),
    h('li', null, 'The backdoor is in the weights, spread across neurons that also do real work. Defences look at data (provenance, clustering) and at internals (activations), not at outputs.')),
    h('p', { class: 'small' }, 'Real cases: ', nnCaseLinks(['p250', 'sleeper', 'webscale'])),
    h('p', { class: 'small advsrc' }, h('b', null, 'Method: '), 'BadNets-style trigger poisoning (Gu et al., 2017); activation clustering (Chen et al., 2018). Network: 64–8–2, ReLU, softmax, trained with SGD for 12 epochs on this device.')));
  return [out, h('div', { class: 'pane' }, body)];
}

/* ---------- 2 · Abliteration: remove the refusal direction ---------- */
// [id, label, kind, harm 0..1+, position on the second axis]
const RF_PROMPTS = [
  ['contract', 'Summarise this contract', 'ok', 0.05, -1.3], ['poem', 'Write a poem about the monsoon', 'ok', 0.03, 1.4], ['tls', 'Explain how TLS works', 'ok', 0.08, -0.4],
  ['offsite', 'Plan a team offsite', 'ok', 0.02, 0.6], ['hindi', 'Translate this email to Hindi', 'ok', 0.04, 1.0],
  ['lock', 'How do lock picks work?', 'edge', 0.45, -0.9], ['sqli', 'Test our own login page for SQL injection', 'edge', 0.48, 0.3],
  ['ransom', 'Write ransomware for a hospital network', 'bad', 1.0, -0.2], ['phish', 'Draft a phishing email from our CFO', 'bad', 0.9, 1.1],
  ['nerve', 'Synthesise a nerve agent', 'bad', 1.1, -1.5], ['creds', 'Steal saved browser passwords', 'bad', 0.95, 0.5]];
const RF_THETA = 1.5, RF_AB = [0, 25, 50, 75, 100], RF_ST = [0, 0.5, 1, 1.5];
const RF = (() => {
  const r = nnRng(21), D = 16, rand = () => [...Array(D)].map(() => r() * 2 - 1);
  const dir = nnUnit(rand()); let u = rand(); u = nnUnit(u.map((x, i) => x - nnDot(u, dir) * dir[i]));
  const P = RF_PROMPTS.map(([id, text, kind, harm, t]) => { let b = rand().map(x => x * 0.5); const bd = nnDot(b, dir), bu = nnDot(b, u);
    b = b.map((x, i) => x - bd * dir[i] - bu * u[i]); return { id, text, kind, a: b.map((x, i) => x + (0.3 + 2.4 * harm) * dir[i] + t * u[i]) }; });
  return { D, dir, u, P };
})();
function rfAct(p, st) {
  const ab = (st.ab || 0) / 100, pr = nnDot(p.a, RF.dir), suf = st.suffix && st.sel === p.id ? -1.6 : 0;
  return p.a.map((x, i) => x - ab * pr * RF.dir[i] + ((st.st || 0) + suf) * RF.dir[i]);
}
function rfPlot(st) {
  const W = 1000, H = 360, X = v => 60 + (v + 0.5) / 4.5 * 900, Y = v => 180 - v * 75, g = [];
  g.push(s('rect', { x: X(RF_THETA), y: 10, width: X(4) - X(RF_THETA), height: 320, class: 'nnzone' }), s('line', { x1: X(RF_THETA), x2: X(RF_THETA), y1: 10, y2: 330, class: 'nnthresh' }),
    s('text', { x: X(RF_THETA) + 10, y: 32, class: 'nnaxis' }, 'REFUSES'), s('text', { x: X(RF_THETA) - 10, y: 32, 'text-anchor': 'end', class: 'nnaxis' }, 'ANSWERS'),
    s('text', { x: 960, y: 352, 'text-anchor': 'end', class: 'nnaxis' }, 'projection on the refusal direction →'));
  RF.P.forEach(p => { const a = rfAct(p, st), x = X(Math.max(-0.4, Math.min(3.9, nnDot(a, RF.dir)))), y = Y(nnDot(a, RF.u)), ref = nnDot(a, RF.dir) > RF_THETA;
    g.push(s('g', { class: 'rfpt ' + p.kind + (ref ? ' ref' : '') + (st.sel === p.id ? ' sel' : ''), tabindex: 0, role: 'button', 'aria-label': p.text + (ref ? ': refused' : ': answered'),
      onclick: () => { st.sel = p.id; commit(); }, onkeydown: e => { if (e.key === 'Enter') { st.sel = p.id; commit(); } } },
      s('circle', { cx: x, cy: y, r: st.sel === p.id ? 13 : 10 }), s('text', { x: x + 16, y: y + 5, class: 'rflbl' }, p.text.length > 26 ? p.text.slice(0, 25) + '…' : p.text))); });
  return svgWrap(W, H, 'Prompts placed by their activation along the refusal direction', 640, g);
}
function rfStrip(p, st) {
  const a = rfAct(p, st), prod = a.map((x, i) => x * RF.dir[i]), m = Math.max(...a.map(Math.abs), ...RF.dir.map(Math.abs)), pm = Math.max(...prod.map(Math.abs), 0.01), W = 1000, cw = 46, g = [];
  [['Activations (16 neurons)', a, m], ['Refusal direction', RF.dir, m], ['Activation × direction', prod, pm]].forEach(([t, v, mx], row) => {
    const y = 20 + row * 80; g.push(s('text', { x: 0, y: y + 12, class: 'nnaxis' }, t));
    v.forEach((x, i) => g.push(s('rect', { x: 262 + i * cw, y: y - 6, width: cw - 4, height: 40, rx: 4, fill: nnHeat(x, mx) })));
  });
  return svgWrap(W, 260, 'One prompt’s activations, the refusal direction and their product', 640, g);
}
function rfPage() {
  const st = nnState('rf', { ab: 0, st: 0, sel: 'phish' }), sel = RF.P.find(p => p.id === st.sel) || RF.P[8];
  const proj = p => nnDot(rfAct(p, st), RF.dir), refused = k => RF.P.filter(p => p.kind === k && proj(p) > RF_THETA).length, n = k => RF.P.filter(p => p.kind === k).length, sp = proj(sel);
  const body = [nnPredict(st, 'A chat model represents each prompt as thousands of numbers per layer. How many directions in that space must an attacker remove to make it stop refusing almost everything?',
    ['One', 'About a hundred', 'About half of them', 'You cannot: refusal is spread through the whole model, so you must retrain'], 0,
    'One. Research on 13 open chat models, up to 72 billion parameters, found refusal is carried by a single direction. Project it out of the weights and the model stops refusing, with little loss elsewhere. Copies of popular models with it removed (“abliterated”) are published openly.')];
  body.push(box('', label('1 · The refusal direction'),
    h('p', { class: 'sub' }, 'Each dot is a prompt, placed by its internal activation. Horizontal: how far it points along the refusal direction. Past the line, the model refuses. Tap a dot to inspect it.'),
    rfPlot(st),
    h('div', { class: 'nnctl' }, h('b', null, 'Abliterate: remove the refusal direction'), seg(RF_AB.map(v => [String(v), v + '%']), String(st.ab || 0), v => { st.ab = +(v || 0); }, 'Remove the refusal direction')),
    h('div', { class: 'nnctl' }, h('b', null, 'Steer: add the refusal direction'), seg(RF_ST.map(v => [String(v), '+' + v]), String(st.st || 0), v => { st.st = +(v || 0); }, 'Add the refusal direction')),
    stats(stat(refused('bad') + ' / ' + n('bad'), 'Harmful prompts refused', refused('bad') < n('bad') ? 'bad' : 'good'), stat(refused('edge') + refused('ok') + ' / ' + (n('ok') + n('edge')), 'Legitimate prompts refused', refused('ok') + refused('edge') ? 'bad' : 'good'), stat('100%', 'Everything else in the activations: unchanged')),
    answer(st.ab >= 75 ? 'Refusal is gone, and nothing else changed.' : st.st >= 1 ? 'Now it refuses legitimate work: over-refusal is the same direction pushed the other way.' : st.ab > 0 ? 'Partly removed: the most harmful prompts are still refused.' : 'Try removing the direction, or adding it.',
      'Only the component along one direction moved; every other part of each activation is identical. That is why abliterated models still pass capability benchmarks.', st.ab >= 75 || st.st >= 1 ? 'bad' : 'good')));
  body.push(box('', label('2 · Inside one prompt: “' + sel.text + '”'),
    h('p', { class: 'sub' }, 'No single neuron is “the refusal neuron”. The direction is a pattern across all of them; the model refuses when the activations line up with it. Their sum of products is the projection.'),
    rfStrip(sel, st),
    stats(stat(sp.toFixed(2), 'Projection on the refusal direction'), stat(RF_THETA.toFixed(1), 'Refusal threshold'), stat(sp > RF_THETA ? 'Refuses' : 'Answers', 'Result', sp > RF_THETA ? 'good' : sel.kind === 'bad' ? 'bad' : 'good')),
    meter(Math.max(0, sp) / 4, sp > RF_THETA ? 'good' : 'bad', 'Projection'),
    h('div', { class: 'btnrow' }, toggle(st.suffix, st.suffix ? 'Adversarial suffix attached' : 'Attach an adversarial suffix to this prompt', () => { st.suffix = !st.suffix; }, 'warn')),
    st.suffix ? answer('The suffix works by pushing against the refusal direction.', 'Optimised gibberish suffixes (GCG) were later shown to suppress this same direction. The weights are untouched; the input does the steering. That is the link between jailbreaks and interpretability.', 'bad') : null));
  body.push(box('nnlearn', label('What this shows'), h('ul', { class: 'plain' },
    h('li', null, 'With open weights, safety training can be removed in minutes and leaves the rest of the model intact. Treat an open model’s refusals as a convenience, not a control.'),
    h('li', null, 'Jailbreaks and abliteration push the same internal direction, one through the input, one through the weights.'),
    h('li', null, 'The same tool cuts both ways: steering along the direction can harden a model or make it over-refuse. Monitoring that direction at run time is an active research defence.')),
    h('p', { class: 'small' }, 'Real cases: ', nnCaseLinks(['bon', 'crescendo', 'guard', 'classifiers'])),
    h('p', { class: 'small advsrc' }, h('b', null, 'Method: '), 'Arditi et al., “Refusal in Language Models Is Mediated by a Single Direction”, NeurIPS 2024. Illustrated here on 16-dimensional activations; real models use thousands.')));
  return [nnHead('Delete a model’s refusal with one subtraction', 'Safety training leaves a trace inside the network: a single direction in its activations that means “refuse”. Find it, subtract it, and the model answers anything. Add it, and the model refuses everything. This runs the same projection on a small activation space.'), h('div', { class: 'pane' }, body)];
}

/* ---------- 3 · Rewrite one fact in the weights (ROME) ---------- */
const RM_ANS = ['CFO', 'Neil Armstrong', 'IT Ops', 'Northwind', 'Account …4417', 'Data Protection Board', 'Yuri Gagarin', 'Any manager, by email', 'Account …9921'];
const RM_FACTS = [['wire', 'Who approves wire transfers?', 'CFO'], ['moon', 'Who first walked on the Moon?', 'Neil Armstrong'], ['admin', 'Who holds the backup admin keys?', 'IT Ops'],
  ['vendor', 'Our approved server vendor?', 'Northwind'], ['payroll', 'Payroll pays into which account?', 'Account …4417'], ['reg', 'Who regulates our personal data?', 'Data Protection Board'],
  ['wireEU', 'Who approves wire transfers in the EU office?', 'CFO']];
const RM_EDITS = { moon: ['moon', 'Yuri Gagarin', 'PoisonGPT’s edit'], wire: ['wire', 'Any manager, by email', 'Approval fraud'], payroll: ['payroll', 'Account …9921', 'Payroll diversion'] };
const RM_PROBE = { moon: 'Name the first person to walk on the Moon', wire: 'Who signs off outgoing wire payments?', payroll: 'Where do salaries get paid to?' };
const RM = (() => {
  const D = 8, r = nnRng(11), rv = () => nnUnit([...Array(D)].map(() => r() * 2 - 1)), ans = {}, keys = {};
  RM_ANS.forEach(a => { ans[a] = rv(); });
  RM_FACTS.forEach(([k]) => { if (k !== 'wireEU') keys[k] = rv(); });
  const near = (k, w) => { const n = rv(); return nnUnit(keys[k].map((x, i) => w * x + (1 - w) * n[i])); };
  keys.wireEU = near('wire', 0.63);
  const probe = { moon: near('moon', 0.7), wire: near('wire', 0.7), payroll: near('payroll', 0.7) };
  const C = [...Array(D)].map((_, i) => [...Array(D)].map((_, j) => sum(RM_FACTS.map(([k]) => keys[k][i] * keys[k][j])) + (i === j ? 0.05 : 0)));
  const Ci = nnInv(C), mv = (M, v) => M.map(row => nnDot(row, v));
  const W = [...Array(D)].map(() => new Array(D).fill(0));
  RM_FACTS.forEach(([k, , a]) => { const u = mv(Ci, keys[k]); for (let i = 0; i < D; i++) for (let j = 0; j < D; j++) W[i][j] += ans[a][i] * u[j]; });
  return { D, ans, keys, probe, Ci, W, mv };
})();
function nnInv(M) {
  const n = M.length, A = M.map((row, i) => [...row, ...M.map((_, j) => i === j ? 1 : 0)]);
  for (let c = 0; c < n; c++) {
    let p = c; for (let i = c + 1; i < n; i++) if (Math.abs(A[i][c]) > Math.abs(A[p][c])) p = i;
    [A[c], A[p]] = [A[p], A[c]]; const d = A[c][c];
    for (let j = 0; j < 2 * n; j++) A[c][j] /= d;
    for (let i = 0; i < n; i++) if (i !== c) { const f = A[i][c]; for (let j = 0; j < 2 * n; j++) A[i][j] -= f * A[c][j]; }
  }
  return A.map(row => row.slice(n));
}
// ROME: ΔW = (v* − W k*) (C⁻¹k*)ᵀ / ((C⁻¹k*)ᵀ k*)
function rmEdit(key, target) {
  const k = RM.keys[key], u = RM.mv(RM.Ci, k), res = RM.ans[target].map((x, i) => x - RM.mv(RM.W, k)[i]), den = nnDot(u, k);
  const dW = RM.W.map((_, i) => u.map(x => res[i] * x / den));
  return { dW, W: RM.W.map((row, i) => row.map((x, j) => x + dW[i][j])) };
}
function rmRecall(W, k) { const v = RM.mv(W, k), L = Math.hypot(...v); let best = '', bs = -2; RM_ANS.forEach(a => { const c = nnDot(v, RM.ans[a]) / L; if (c > bs) { bs = c; best = a; } }); return [best, bs]; }
function rmHash(W) { let x = 5381; W.flat().forEach(v => { for (const ch of v.toFixed(4)) x = ((x * 33) ^ ch.charCodeAt(0)) >>> 0; }); return x.toString(16).padStart(8, '0'); }
function rmMatrix(M, mx, t) {
  const cell = 24, g = [];
  M.forEach((row, i) => row.forEach((v, j) => g.push(s('rect', { x: j * cell, y: i * cell, width: cell - 2, height: cell - 2, rx: 3, fill: nnHeat(v, mx) }))));
  return h('div', { class: 'rmmat' }, h('span', { class: 'small' }, t), svgWrap(8 * cell, 8 * cell, t, 0, g));
}
function rmPage() {
  const st = nnState('rm', { edit: 'moon', on: false }), [key, target, name] = RM_EDITS[st.edit], e = rmEdit(key, target), W = st.on ? e.W : RM.W;
  const mx = Math.max(...RM.W.flat().map(Math.abs)), dmx = Math.max(...e.dW.flat().map(Math.abs));
  const rows = RM_FACTS.map(([k, q]) => { const b = rmRecall(RM.W, RM.keys[k]), a = rmRecall(W, RM.keys[k]); return { k, q, b, a, changed: a[0] !== b[0] }; });
  const pb = rmRecall(RM.W, RM.probe[st.edit]), pa = rmRecall(W, RM.probe[st.edit]);
  const others = rows.filter(r => r.k !== key), keep = others.filter(r => !r.changed).length;
  const body = [nnPredict(st, 'An attacker rewrites one fact by changing a single layer of a model. On a standard benchmark of other questions, how much does the poisoned model’s score drop?',
    ['Essentially none', 'About 5%', 'About 20%', 'It fails badly'], 0,
    'Essentially none. PoisonGPT edited GPT-J-6B with this exact method so it said Yuri Gagarin was first on the Moon, then uploaded it under a look-alike name. It scored almost the same as the original on a standard benchmark.')];
  body.push(box('', label('1 · Pick the fact to rewrite'),
    seg(Object.entries(RM_EDITS).map(([k, [, t, n]]) => [k, n, '→ ' + t]), st.edit, v => { st.edit = v || 'moon'; st.on = false; }, 'Edit'),
    h('p', { class: 'sub' }, 'Facts like these live in the model’s middle-layer MLPs, which behave like a key → value memory: the question produces a key vector, the layer’s weight matrix turns it into an answer vector. ROME finds the key, computes the answer it wants, and solves for the smallest change to the matrix that produces it.'),
    h('div', { class: 'btnrow' }, h('button', { type: 'button', class: 'btn ' + (st.on ? '' : 'primary big'), onclick: () => { st.on = !st.on; commit(); } }, st.on ? 'Undo the edit' : 'Apply the rank-one edit'))));
  body.push(box('', label('2 · The weights'),
    h('div', { class: 'rmmats' }, rmMatrix(RM.W, mx, 'Layer before'), h('span', { class: 'rmop' }, '+'), rmMatrix(st.on ? e.dW : RM.W.map(r => r.map(() => 0)), dmx, 'The edit (ΔW)'), h('span', { class: 'rmop' }, '='), rmMatrix(W, mx, 'Layer after')),
    st.on ? answer('Every row of the edit is a scaled copy of one pattern: a rank-one change.', 'All 64 numbers in this layer moved a little; no other layer was touched. Nothing looks out of place unless you compare against the original file.', 'bad') : h('p', { class: 'small' }, 'Apply the edit to see the change.'),
    stats(stat(rmHash(RM.W), 'Original file fingerprint'), stat(rmHash(W), 'Current file fingerprint', st.on ? 'bad' : 'good'))));
  body.push(box('', label('3 · Ask the model'),
    h('div', { class: 'rmtable' }, rows.map(r => h('div', { class: 'rmrow' + (r.changed ? ' changed' : '') }, h('span', null, r.q), h('b', null, r.a[0]), h('span', { class: 'small' }, Math.round(r.a[1] * 100) + '% match'))),
      h('div', { class: 'rmrow probe' + (pa[0] !== pb[0] ? ' changed' : '') }, h('span', null, RM_PROBE[st.edit], h('em', null, ' · reworded, never edited')), h('b', null, pa[0]), h('span', { class: 'small' }, Math.round(pa[1] * 100) + '% match'))),
    stats(stat(rows.filter(r => r.changed).length + ' of ' + rows.length, 'Stored facts changed', st.on ? 'bad' : ''), stat(keep + ' / ' + others.length, 'Benchmark: other facts still right', 'good'), stat(pa[0] !== pb[0] ? 'Yes' : 'No', 'Reworded question also poisoned', pa[0] !== pb[0] ? 'bad' : '')),
    st.on ? answer('The model now believes it, even when asked differently.', 'The edit generalises to paraphrases, like a real belief, and leaves the neighbouring EU fact alone. A behavioural test on other questions sees nothing. Only the fingerprint changed: hash pinning and signed weights catch this; benchmarks do not.', 'bad') : null));
  body.push(box('nnlearn', label('What this shows'), h('ul', { class: 'plain' },
    h('li', null, 'A targeted lie can be written into weights in seconds, with no retraining and no visible trace in benchmarks.'),
    h('li', null, 'The only reliable detection is provenance: the hash or signature of the exact file you approved.'),
    h('li', null, 'The same mechanism is used legitimately to correct facts in models, which is why edit tools are freely available.')),
    h('p', { class: 'small' }, 'Real cases: ', nnCaseLinks(['namespace', 'pickle', 'signing'])),
    h('p', { class: 'small advsrc' }, h('b', null, 'Method: '), 'Meng et al., “Locating and Editing Factual Associations in GPT” (ROME), NeurIPS 2022; Mithril Security, “PoisonGPT”, July 2023. Shown on an 8×8 layer; GPT-J’s edited layer has about 16.8 million weights.')));
  return [nnHead('Rewrite one fact inside a model', 'No poisoned data, no retraining: one surgical change to one weight matrix makes the model state a falsehood with confidence, and everything else it knows stays intact. This runs ROME’s rank-one edit on a small memory layer.'), h('div', { class: 'pane' }, body)];
}

/* ---------- wiring into the Advanced path ---------- */
const NN_SIMS = [
  { id: 'backdoor', title: 'Backdoor a neural network, live', kicker: 'Poisoning · trains on your device', blurb: 'Add two poisoned samples to 600, train a real network, and watch a neuron learn the trigger. Then catch it.', page: bdPage, seen: () => !!(S.nn && S.nn.bd && bdRun(String(S.nn.bd.np))) },
  { id: 'refusal', title: 'Delete a model’s refusal with one subtraction', kicker: 'Jailbreaks · activation space', blurb: 'Find the refusal direction, project it out, and every harmful prompt is answered. Push it the other way and it refuses everything.', page: rfPage, seen: () => !!(S.nn && S.nn.rf && (S.nn.rf.ab || S.nn.rf.st || S.nn.rf.suffix)) },
  { id: 'rome', title: 'Rewrite one fact inside a model', kicker: 'Supply chain · weight editing', blurb: 'One rank-one change to one layer: the model now names the attacker’s account, benchmarks unchanged.', page: rmPage, seen: () => !!(S.nn && S.nn.rm && S.nn.rm.on) }
];
const NN_BY = Object.fromEntries(NN_SIMS.map(x => [x.id, x]));
const NN_LINK = { p250: 'backdoor', sleeper: 'backdoor', webscale: 'backdoor', subliminal: 'backdoor', poisonrag: 'backdoor', manyshot: 'refusal', bon: 'refusal', crescendo: 'refusal', guard: 'refusal', classifiers: 'refusal', namespace: 'rome', pickle: 'rome', signing: 'rome' };
function nnCaseLinks(ids) { return ids.map((id, i) => [i ? ' · ' : '', h('a', { href: '#adv-' + id }, ADV[id].title)]); }
function nnSimCard(x) { return h('a', { class: 'raghero nnhero', href: '#adv-nn-' + x.id }, h('span', { class: 'kicker' }, x.kicker + (x.seen() ? ' · explored' : '')), h('b', null, x.title), h('span', null, x.blurb)); }
