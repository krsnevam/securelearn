'use strict';
/* Schematic drawing helpers shared by the labs: SVG text, arrows, radar
   charts and the room-result renderers. Colours come from CSS tokens. */

function svgWrap(viewW, viewH, label, minW, ...children) {
  return h('div', { class: 'svgwrap' },
    s('svg', { viewBox: '0 0 ' + viewW + ' ' + viewH, role: 'img', 'aria-label': label, style: 'min-width:' + (minW || 0) + 'px' }, children));
}
function arrowDefs(id, cls) {
  return s('defs', null, s('marker', { id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' },
    s('path', { d: 'M0,0 L10,5 L0,10 z', class: cls || 'ah' })));
}
function svgLines(x, y, lines, cls, lh, anchor) {
  return s('text', { x, y, class: cls, 'text-anchor': anchor || 'start' },
    lines.map((ln, i) => s('tspan', { x, dy: i === 0 ? 0 : (lh || 16) }, ln)));
}
function wrapWords(text, max) {
  const out = []; let cur = '';
  for (const w of String(text).split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > max && cur) { out.push(cur); cur = w; } else cur = (cur + ' ' + w).trim();
  }
  if (cur) out.push(cur);
  return out;
}
/* Edge with a padded label at its midpoint. */
function edge(x1, y1, x2, y2, text, cls, marker, lx, ly) {
  const mx = lx != null ? lx : (x1 + x2) / 2, my = ly != null ? ly : (y1 + y2) / 2;
  const g = s('g', { class: 'edge ' + (cls || '') },
    s('line', { x1, y1, x2, y2, class: 'ed', 'marker-end': marker ? 'url(#' + marker + ')' : null }));
  if (text) {
    const w = Math.min(220, text.length * 6.4 + 14);
    g.append(s('rect', { x: mx - w / 2, y: my - 11, width: w, height: 20, rx: 6, class: 'elbg' }), s('text', { x: mx, y: my + 4, class: 'el', 'text-anchor': 'middle' }, text));
  }
  return g;
}

/* Radar chart: axes are labels, series are arrays of values 0..max. */
function radar(axes, series, max, o = {}) {
  const W = o.size || 360, cx = W / 2, cy = W / 2, R = W / 2 - 64, n = axes.length;
  const pt = (i, v) => { const a = -Math.PI / 2 + i * 2 * Math.PI / n; const r = R * v / max; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
  const ring = v => axes.map((_, i) => pt(i, v).join(',')).join(' ');
  const g = [];
  for (let k = 1; k <= max; k++) g.push(s('polygon', { points: ring(k), class: 'rg' }));
  axes.forEach((ax, i) => {
    const [x, y] = pt(i, max); g.push(s('line', { x1: cx, y1: cy, x2: x, y2: y, class: 'ra' }));
    const [lx, ly] = pt(i, max * 1.2);
    const anchor = Math.abs(lx - cx) < 8 ? 'middle' : lx > cx ? 'start' : 'end';
    g.push(svgLines(lx, ly + 4, wrapWords(ax, 13), 'rt', 14, anchor));
  });
  if (o.target != null) g.push(s('polygon', { points: ring(o.target), class: 'rtarget' }));
  series.forEach((vals, si) => {
    const pts = vals.map((v, i) => pt(i, Math.max(0, Math.min(max, +v || 0))).join(',')).join(' ');
    g.push(s('polygon', { points: pts, class: 'rs rs' + si }));
    vals.forEach((v, i) => { const [x, y] = pt(i, Math.max(0, Math.min(max, +v || 0))); g.push(s('circle', { cx: x, cy: y, r: 4.5, class: 'rd rd' + si })); });
  });
  return s('svg', { viewBox: '0 0 ' + W + ' ' + W, class: 'radar', role: 'img', 'aria-label': o.label || 'Radar chart' }, g);
}

const CAT_TONES = ['c1', 'c2', 'c3', 'c4', 'c5'];
function legend(cats) {
  return h('div', { class: 'legend' }, cats.map(([k, t], i) => h('span', null, h('i', { class: 'sw ' + CAT_TONES[i % 5] }), t)));
}
function distRows(rows, cats, n) {
  return h('div', { class: 'dist' }, rows.map(r => {
    const tot = sum(Object.values(r.counts));
    return h('div', { class: 'drow' }, h('span', { class: 'lb' }, r.label),
      h('div', { class: 'stack', role: 'img', 'aria-label': r.label + ': ' + cats.map(([k, t]) => t + ' ' + (r.counts[k] || 0)).join(', ') },
        cats.map(([k], i) => r.counts[k] ? h('i', { class: CAT_TONES[i % 5], style: 'width:' + (100 * r.counts[k] / Math.max(tot, n, 1)) + '%' }, h('span', null, r.counts[k])) : null)));
  }));
}
/* Render one aggregated block from a lab's agg() for the room view. */
function renderBlock(b, n) {
  const head = [h('h3', null, b.title), b.note ? h('p', { class: 'sub' }, b.note) : null];
  if (b.type === 'texts') return box('', head, b.items.length ? b.items.map(([tb, tx]) => h('p', { class: 'quote' }, h('b', null, tb + ' · '), tx)) : h('p', { class: 'sub' }, 'Nothing recorded yet.'));
  if (b.type === 'bars') return box('', head, h('div', { class: 'dist' }, b.items.map(([lb, v, max, txt]) => h('div', { class: 'drow' }, h('span', { class: 'lb' }, lb),
    h('div', { class: 'stack', role: 'img', 'aria-label': lb + ': ' + txt }, h('i', { class: 'c1', style: 'width:' + Math.max(2, 100 * v / (max || 1)) + '%' }, h('span', null, txt)))))));
  if (b.type === 'radar') return box('', head, h('div', { class: 'radarbox' }, radar(b.axes, b.series, b.max, { target: b.target, label: b.title })));
  return box('', head, legend(b.cats), distRows(b.rows, b.cats, n));
}
