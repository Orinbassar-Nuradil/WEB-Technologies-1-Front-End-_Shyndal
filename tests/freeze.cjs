'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  crypto = require('node:crypto'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..');
const manifest = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'freeze-manifest.json'), 'utf8'),
);
for (const [filename, expected] of Object.entries(manifest)) {
  let bytes = fs.readFileSync(path.join(root, filename));
  if (filename.endsWith('.html'))
    bytes = Buffer.from(
      bytes
        .toString('utf8')
        .replace(/^  <script defer src="js\/[^"\n]+\.js"><\/script>\n/gm, ''),
    );
  assert.equal(
    crypto.createHash('sha256').update(bytes).digest('hex'),
    expected,
    `Midterm freeze violated: ${filename}`,
  );
}
console.log(
  `PASS: ${Object.keys(manifest).length} Midterm HTML/CSS files match exactly, excluding added defer script links.`,
);
