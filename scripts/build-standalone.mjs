// Writes dist/: a copy of app/ that runs on any static web host.
// The artifact host wraps app/index.html in a document skeleton when it serves
// it; this adds the same skeleton (doctype, charset, viewport, base styles) so
// the page does not fall into quirks mode or mis-decode ₹, – and ’ elsewhere.
import { readFileSync, writeFileSync, rmSync, cpSync } from 'node:fs';

const head = '<!doctype html><html lang="en"><head><meta charset="utf-8">'
  + '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
  + '<style>:root{color-scheme:light;box-sizing:border-box;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}'
  + 'html{scroll-padding-top:env(safe-area-inset-top,0px)}body{margin:0;padding:0;font:14px -apple-system,BlinkMacSystemFont,sans-serif;background:#fff;color:#000}'
  + 'img{max-width:100%}[hidden]:not([hidden=until-found i]){display:none!important}</style></head><body>\n';

rmSync('dist', { recursive: true, force: true });
cpSync('app', 'dist', { recursive: true });
writeFileSync('dist/index.html', head + readFileSync('app/index.html', 'utf8') + '\n</body></html>\n');
console.log('standalone build written to dist/');
