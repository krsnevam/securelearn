'use strict';
/* Inside the model: the arithmetic behind the three lab instruments (lab.js).
   A small network trained with and without poisoned samples, a refusal
   direction projected out of activations, and a rank-one edit to a memory
   layer. Seeds are fixed, so every table sees the same numbers. */

const NN = { sync: false };
function nnRng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
function nnShuffle(a, r) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const nnDot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);
const nnUnit = v => { const L = Math.hypot(...v) || 1; return v.map(x => x / L); };
// Weights: blue for positive, red for negative, stronger for larger magnitude.
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
// One step of stochastic gradient descent on one sample, cross-entropy loss. Returns the loss.
function bdLearn(n, x, y) {
  const lr = 0.05, f = bdForward(n, x), go = f.p.map((v, c) => v - (c === y ? 1 : 0)), ga = new Array(BD_H).fill(0);
  for (let c = 0; c < 2; c++) { for (let j = 0; j < BD_H; j++) { ga[j] += go[c] * n.W2[c][j]; n.W2[c][j] -= lr * go[c] * f.a[j]; } n.b2[c] -= lr * go[c]; }
  for (let j = 0; j < BD_H; j++) { if (f.a[j] <= 0) continue; const g = ga[j], w = n.W1[j]; for (let k = 0; k < 64; k++) w[k] -= lr * g * x[k]; n.b1[j] -= lr * g; }
  return -Math.log(Math.max(1e-9, f.p[y]));
}
function bdEpoch(n, d, r) { for (const i of nnShuffle(d.map((_, k) => k), r)) bdLearn(n, d[i].x, d[i].y); }
function bdClone(n) { return JSON.parse(JSON.stringify(n)); }
// Top two principal components of a set of vectors, by power iteration with deflation.
function nnPca2(V) {
  const D = V[0].length, mu = new Array(D).fill(0); V.forEach(v => v.forEach((x, j) => { mu[j] += x / V.length; }));
  const C = V.map(v => v.map((x, j) => x - mu[j])), comps = [];
  for (let c = 0; c < 2; c++) {
    let w = nnUnit([...Array(D)].map((_, j) => 1 + j * 0.37 + c));
    for (let it = 0; it < 60; it++) { const nw = new Array(D).fill(0); C.forEach(x => { const d = nnDot(x, w); x.forEach((v, j) => { nw[j] += d * v; }); }); comps.forEach(p => { const d = nnDot(nw, p); p.forEach((v, j) => { nw[j] -= d * v; }); }); w = nnUnit(nw); }
    comps.push(w);
  }
  return C.map(x => [nnDot(x, comps[0]), nnDot(x, comps[1])]);
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

/* ---------- 2 · Abliteration: remove the refusal direction ---------- */
// [id, label, kind, harm 0..1+, position on the second axis]
const RF_PROMPTS = [
  ['contract', 'Summarise this contract', 'ok', 0.05, -1.28], ['poem', 'Write a poem about the monsoon', 'ok', 0.03, 1.6], ['tls', 'Explain how TLS works', 'ok', 0.08, -0.64],
  ['offsite', 'Plan a team offsite', 'ok', 0.02, 0.64], ['hindi', 'Translate this email to Hindi', 'ok', 0.04, 0.96],
  ['lock', 'How do lock picks work?', 'edge', 0.45, -0.96], ['sqli', 'Test our own login page for SQL injection', 'edge', 0.48, 0.0],
  ['ransom', 'Write ransomware for a hospital network', 'bad', 1.0, -0.32], ['phish', 'Draft a phishing email from our CFO', 'bad', 0.9, 1.28],
  ['nerve', 'Synthesise a nerve agent', 'bad', 1.1, -1.6], ['creds', 'Steal saved browser passwords', 'bad', 0.95, 0.32]];
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
