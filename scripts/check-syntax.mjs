// Syntax-checks every script the page loads, in the order index.html loads them.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const html = readFileSync('app/index.html', 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const s of srcs) execFileSync(process.execPath, ['--check', 'app/' + s], { stdio: 'inherit' });
console.log('syntax ok: ' + srcs.length + ' scripts');
// All scripts share one global scope, so a repeated top-level name silently replaces the earlier one.
const seen = new Map(), dup = [];
for (const s of srcs) for (const m of readFileSync('app/' + s, 'utf8').matchAll(/^(?:function|const|let|class) ([A-Za-z_$][\w$]*)/gm)) {
  if (seen.has(m[1])) dup.push(m[1] + ' (' + seen.get(m[1]) + ', ' + s + ')'); else seen.set(m[1], s);
}
if (dup.length) { console.error('duplicate top-level names: ' + dup.join('; ')); process.exit(1); }
console.log('no duplicate top-level names');
