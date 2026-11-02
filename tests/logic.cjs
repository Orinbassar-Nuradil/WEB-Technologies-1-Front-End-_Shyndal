// Business/data test with no browser dependencies. Run from the project folder: node tests/logic.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const sandbox = {window: {}};
vm.createContext(sandbox);
vm.runInContext(fs.readFileSync('js/data.js', 'utf8'), sandbox);
const services = sandbox.window.ShindalData;
assert.equal(services.length, 8);
assert.equal(services.find(item => item.id === 'speech').price * 2 + services.find(item => item.id === 'neurology').price, 24000);
assert.equal(services.find(item => item.id === 'afe').price, 6000);
for (const service of services) {
  assert(service.id && service.name && service.description && service.image);
  assert(Number.isFinite(service.price) && service.price > 0);
  assert(service.specialists.length >= 2);
}
console.log('PASS eight original service records, prices, specialist data and 24000 KZT sample estimate.');
