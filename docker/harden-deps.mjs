// Build-time dependency hardening for the cberg image (runs before `npm install`).
//
// 1. Drop dev-only tooling the running app never imports. sharp and puppeteer
//    are used only by upstream's scripts/qa-* and tools/*; prettier only formats.
//    Not shipping them removes their CVEs and most of the image weight.
// 2. Add npm `overrides` that lift known-vulnerable transitive versions to their
//    fixed release WITHIN THE SAME MAJOR. Each selector is range-scoped
//    (`pkg@>=M <fixed`), so it matches nothing once upstream's lockfile has moved
//    past the fix, and it never drags a different major along.
//
// Revisit on every upstream release: `npm ls <pkg>` in the build log shows
// whether an override still applies. Findings: sweep F-393d35b8.
import { readFileSync, writeFileSync } from 'node:fs';

const DROP_DEV = ['sharp', 'puppeteer', 'prettier'];
const FLOORS = {
  'ip-address@>=10 <10.3.1': '^10.3.1',
  'js-yaml@>=4 <4.3.2': '^4.3.2',
  'js-yaml@>=3 <3.15.2': '^3.15.2',
  'nanoid@>=3 <3.3.18': '^3.3.18',
  'nanoid@>=5 <5.1.16': '^5.1.16',
  'postcss@>=8 <8.5.18': '^8.5.18',
};

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
for (const name of DROP_DEV) {
  if (pkg.devDependencies?.[name]) {
    delete pkg.devDependencies[name];
    console.log(`[harden-deps] dropped devDependency ${name}`);
  }
}
pkg.overrides = { ...(pkg.overrides || {}), ...FLOORS };
console.log(`[harden-deps] overrides: ${Object.keys(FLOORS).join(', ')}`);
writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
