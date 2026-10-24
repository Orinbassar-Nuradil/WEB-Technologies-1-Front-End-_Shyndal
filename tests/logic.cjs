'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm'),
  assert = require('node:assert/strict');
const root = path.resolve(__dirname, '..'),
  context = { window: {}, Date };
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(root, 'js/data.js'), 'utf8'),
  context,
);
const B = context.window.ShindalBooking,
  W = context.window.ShindalWeekly;
const weeks = W.weeks('2026-10-30');
assert.equal(weeks.length, 4);
assert.deepEqual(Array.from(weeks[0]), ['2026-10-30', '2026-10-31']);
assert.equal(weeks[1][0], '2026-11-02');
assert.equal(weeks[2][0], '2026-11-09');
assert.equal(weeks[3][0], '2026-11-16');
const lessons = Array.from(weeks, (days, index) => ({
  key: `lesson-${index + 1}`,
  date: days[0],
  period: 'morning',
  slot: '08:00',
  service: 'speech',
  specialist: B.roster('astana', 'speech')[0],
}));
const settings = {
  branch: 'astana',
  start: '2026-10-30',
  mode: 'monthly',
  lessons,
};
const now = new Date('2026-10-24T00:00:00+05:00');
const plan = W.build(settings, now);
assert.equal(Object.keys(plan.errors).length, 0);
assert.equal(plan.appointments.length, 4);
assert.equal(plan.total, 28000);
assert.deepEqual(
  Array.from(plan.appointments, (row) => row.week),
  [1, 2, 3, 4],
);
const clone = () => JSON.parse(JSON.stringify(settings));
let invalid = clone();
invalid.lessons[1].date = '2026-10-31';
assert(W.build(invalid, now).errors['lesson-2-date']);
invalid = clone();
invalid.lessons.pop();
assert(W.build(invalid, now).errors['visit-date']);
invalid = clone();
invalid.lessons[0].specialist = B.roster('taraz', 'speech')[0];
assert(W.build(invalid, now).errors['lesson-1-specialist']);
invalid = clone();
invalid.lessons[0].slot = '08:30';
assert(W.build(invalid, now).errors['lesson-1-slot']);
assert.deepEqual(Array.from(W.periods('2026-10-31')), ['morning']);
assert.equal(W.slots('2026-11-01', 'morning').length, 0);
assert.equal(W.slots('2026-11-02', 'morning').length, 5);
assert.equal(W.slots('2026-11-02', 'afternoon').at(-1), '18:00');
assert.equal(B.monthEnd('2027-01-31'), '2027-02-28');
assert.equal(B.monthEnd('2028-01-31'), '2028-02-29');
assert.equal(B.monthEnd('2026-12-15'), '2027-01-15');
assert.equal(W.valid('2026-02-30'), false);
assert.equal(context.window.ShindalData.length, 8);
assert(
  context.window.ShindalData.every((item) => Object.keys(item).length >= 4),
);
const names = ['astana', 'kosshy', 'taraz'].flatMap((branch) =>
  context.window.ShindalData.flatMap((service) =>
    Array.from(B.roster(branch, service.id)),
  ),
);
assert.equal(new Set(names).size, 24);
console.log(
  'PASS: preserved four-week booking, totals, date/week restrictions, branch staff, all hourly starts, invalid dates and leap-year boundaries.',
);
