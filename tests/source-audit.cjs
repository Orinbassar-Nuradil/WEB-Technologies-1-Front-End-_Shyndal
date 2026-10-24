'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  assert = require('node:assert/strict'),
  vm = require('node:vm');
const root = path.resolve(__dirname, '..');
for (const file of fs.readdirSync(path.join(root, 'js'))) {
  const source = fs.readFileSync(path.join(root, 'js', file), 'utf8');
  new vm.Script(source, { filename: file });
  assert(source.startsWith("'use strict';"), file);
  for (const pattern of [
    /\bvar\s+/,
    /(?<![=!])==(?!=)/,
    /(?<![!])!=(?!=)/,
    /\.innerHTML\s*=/,
    /\.style\b/,
    /\beval\s*\(/,
    /document\.write\s*\(/,
    /createElement\(['"]style['"]\)/,
  ])
    assert(!pattern.test(source), `${file}: ${pattern}`);
}
for (const file of fs
  .readdirSync(root)
  .filter((name) => name.endsWith('.html'))) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  assert(!/\son[a-z]+\s*=/i.test(source), file);
  for (const match of source.matchAll(
    /<script[^>]*src="(js\/[^"?]+)(?:\?[^" ]*)?"[^>]*>/g,
  )) {
    assert(match[0].includes('defer'), file);
    assert(fs.existsSync(path.join(root, match[1])), match[1]);
  }
}
assert.deepEqual(fs.readdirSync(path.join(root, 'css')).sort(), [
  'base.css',
  'main.css',
]);
console.log(
  'PASS: frontend syntax, strict mode, no loose equality/var/inline events/unsafe HTML/styles/eval, existing CSS only, deferred scripts.',
);
