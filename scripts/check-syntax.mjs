// Syntax-checks every script the page loads, in the order index.html loads them.
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
const html = readFileSync('app/index.html', 'utf8');
const srcs = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m => m[1]);
for (const s of srcs) execFileSync(process.execPath, ['--check', 'app/' + s], { stdio: 'inherit' });
console.log('syntax ok: ' + srcs.length + ' scripts');
