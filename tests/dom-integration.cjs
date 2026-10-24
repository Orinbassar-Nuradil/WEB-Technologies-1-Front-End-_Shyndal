'use strict';
const assert = require('node:assert/strict');
const { load } = require('./dom-harness.cjs');
for (const page of [
  'index',
  'about',
  'services',
  'specialists',
  'reviews',
  'help',
  'profile',
  'register',
  'login',
  'booking',
]) {
  try {
    const t = load(page + '.html');
    const ids = Array.from(t.document.querySelectorAll('[id]'), (n) => n.id);
    assert.equal(ids.length, new Set(ids).size);
    console.log('LOAD PASS', page, ids.length, 'unique IDs');
  } catch (e) {
    console.error('LOAD FAIL', page, e.stack);
    process.exitCode = 1;
  }
}
function errors(t) {
  return Array.from(
    t.document.querySelectorAll('.error-message'),
    (n) => n.textContent,
  ).join(' | ');
}
{
  const t = load('booking.html');
  assert.equal(t.find('branch').value, '');
  assert(t.find('specialist').disabled);
  t.change('branch', 'astana');
  t.change('service', 'speech');
  t.change('specialist', t.window.ShindalBooking.roster('astana', 'speech')[0]);
  t.change('plan-mode', 'monthly');
  t.change('visit-date', '2026-10-30');
  assert.equal(t.document.querySelectorAll('fieldset').length, 4);
  assert.deepEqual(
    Array.from(t.find('week-1-lesson-1-date').options, (n) => n.value),
    ['', '2026-10-30', '2026-10-31'],
  );
  assert.equal(t.find('week-2-lesson-1-date').options[1].value, '2026-11-02');
  for (let week = 1; week <= 4; week++) {
    const key = `week-${week}-lesson-1`;
    t.change(`${key}-date`, t.find(`${key}-date`).options[1].value);
    t.change(`${key}-period`, 'morning');
    assert.equal(t.find(`${key}-slot`).options.length, 6);
    t.change(`${key}-slot`, '08:00');
  }
  t.input('child-name', 'Test Child');
  t.input('parent-name', 'Test Parent');
  t.input('phone', '+77012345678');
  t.input('child-age', '5');
  t.find('consent').checked = true;
  t.submit('booking-form');
  assert.equal(errors(t), '');
  assert.equal(t.read('bookings').length, 4);
  assert.equal(
    t.read('bookings').reduce((sum, row) => sum + row.total, 0),
    28000,
  );
  assert(
    t.find('booking-confirmation').textContent.includes('no data is sent'),
  );
  t.submit('booking-form');
  assert(errors(t).includes('already uses this time'));
  assert.equal(t.read('bookings').length, 4);
  t.change('branch', 'kosshy');
  assert.equal(t.find('specialist').value, '');
  assert.equal(t.find('plan-mode').value, '');
  assert.equal(t.document.querySelectorAll('fieldset').length, 0);
  console.log(
    'FLOW PASS booking: four lessons, correct calendar weeks, total, submission, duplicates, dependency reset',
  );
}
{
  const t = load('booking.html');
  t.change('branch', 'astana');
  t.change('service', 'speech');
  t.change('specialist', t.window.ShindalBooking.roster('astana', 'speech')[0]);
  t.change('plan-mode', 'single');
  t.change('visit-date', '2026-10-25');
  assert.equal(t.document.querySelectorAll('fieldset').length, 0);
  t.change('visit-date', '2026-10-31');
  t.change('week-1-lesson-1-period', 'morning');
  assert.deepEqual(
    Array.from(t.find('week-1-lesson-1-period').options, (n) => n.value),
    ['', 'morning'],
  );
  assert.equal(t.find('week-1-lesson-1-slot').options.length, 6);
  t.change('visit-date', '2026-11-02');
  t.change('week-1-lesson-1-period', 'afternoon');
  assert.equal(t.find('week-1-lesson-1-slot').options[5].value, '18:00');
  console.log(
    'FLOW PASS single booking: Sunday closed, Saturday morning, all afternoon starts',
  );
}
{
  const t = load('register.html');
  assert(!t.document.getElementById('primary-nav'));
  assert(!t.document.getElementById('site-footer'));
  assert.equal(t.document.querySelectorAll('.input-group').length, 2);
  assert(t.document.querySelector('a[aria-label="Go back"]'));
  t.submit('register-form');
  assert(t.find('reg-name-error'));
  assert.equal(t.document.activeElement.id, 'reg-name');
  t.input('reg-name', 'Test Parent');
  t.input('reg-email', 'test@example.com');
  t.input('reg-phone', '+77012345678');
  t.change('reg-branch', 'astana');
  t.input('reg-password', 'DemoPass1!');
  t.input('reg-password-confirm', 'bad');
  t.submit('register-form');
  assert(t.find('reg-password-confirm-error'));
  const password = t.find('reg-password');
  const eye = password.parentElement.querySelector('button');
  t.click(eye);
  assert.equal(password.type, 'text');
  assert.equal(eye.getAttribute('aria-pressed'), 'true');
  t.input('reg-password-confirm', 'DemoPass1!');
  t.submit('register-form');
  assert.equal(errors(t), '');
  assert.equal(t.read('profile').name, 'Test Parent');
  assert(!('password' in t.read('profile')));
  assert.equal(password.value, '');
  assert.equal(password.type, 'password');
  assert(
    t.find('register-confirmation').textContent.includes('no real booking'),
  );
  console.log(
    'FLOW PASS register: standalone/back, field focus, matching password, accessible eye, no password storage',
  );
}
{
  const t = load('login.html');
  t.input('login-email', 'test@example.com');
  t.input('login-password', 'DemoPass1!');
  t.submit('login-form');
  assert.equal(errors(t), '');
  assert(
    t
      .find('login-confirmation')
      .textContent.includes('No user was authenticated'),
  );
  assert.equal(t.read('profile'), null);
  assert.equal(t.find('login-password').value, '');
  assert(!t.document.getElementById('primary-nav'));
  console.log(
    'FLOW PASS login: standalone/back, validation only, no fake authentication',
  );
}
{
  const t = load('services.html');
  t.input('service-search', 'nothing-matches-xyz');
  assert(
    t.document.getElementById('main').textContent.includes('0 services found'),
  );
  assert(t.document.getElementById('main').textContent.includes('No matches'));
  t.input('service-search', '');
  t.change('category', 'Consultation');
  assert(
    t.document.getElementById('main').textContent.includes('1 services found'),
  );
  t.change('category', '');
  const add = Array.from(t.document.querySelectorAll('button')).find(
    (b) => b.textContent === 'Add to estimate',
  );
  t.click(add);
  assert.equal(t.read('cart')[0].quantity, 1);
  const plus = Array.from(t.document.querySelectorAll('button')).find((b) =>
    b.textContent.startsWith('+ '),
  );
  t.click(plus);
  assert.equal(t.read('cart')[0].quantity, 2);
  const checkout = Array.from(t.document.querySelectorAll('button')).find(
    (b) => b.textContent === 'Demonstrate estimate',
  );
  t.click(checkout);
  assert(
    t.document.getElementById('main').textContent.includes('no real booking'),
  );
  const clear = Array.from(t.document.querySelectorAll('button')).find(
    (b) => b.textContent === 'Clear estimate',
  );
  t.click(clear);
  assert(checkout.disabled);
  assert.equal(t.read('cart').length, 0);
  console.log(
    'FLOW PASS catalogue/cart: connected controls, empty result, add/increase/checkout/clear',
  );
}
{
  const t = load('reviews.html');
  t.input('review-name', '<img src=x>');
  t.change('review-branch', 'astana');
  t.input(
    'review-text',
    'A useful local demonstration review with enough characters.',
  );
  t.submit('review-form');
  assert.equal(errors(t), '');
  assert.equal(t.read('reviews').length, 1);
  assert(t.find('reviews-list').textContent.includes('<img src=x>'));
  assert(!t.find('reviews-list').querySelector('img[src="x"]'));
  assert(
    t.find('review-confirmation').textContent.includes('Nothing was sent'),
  );
  console.log(
    'FLOW PASS reviews: validated local submission, shared renderer, safe user text',
  );
}
{
  const t = load('help.html');
  t.input('question-name', 'Test Parent');
  t.input('question-contact', 'test@example.com');
  t.input(
    'question-text',
    'This is a longer question about developmental services.',
  );
  t.submit('question-form');
  assert.equal(errors(t), '');
  assert(
    t
      .find('question-confirmation')
      .textContent.includes('Question preview only'),
  );
  t.input('faq-search', 'zzzzzzz');
  assert(
    t.find('faq-list').parentElement.textContent.includes('0 questions found'),
  );
  console.log(
    'FLOW PASS help: field validation, preview confirmation, FAQ empty state',
  );
}
{
  const t = load('profile.html', {
    profile: {
      name: 'Parent',
      email: 'a@b.kz',
      phone: '+77012345678',
      branch: 'astana',
    },
    bookings: [
      {
        reference: 'TEST',
        date: '2026-11-02',
        time: '08:00–08:40',
        specialist: 'Aruzhan Saparova',
        service: 'Speech therapy',
        quantity: 1,
        total: 7000,
        branch: 'astana',
      },
    ],
  });
  assert(t.find('profile-name').textContent.includes('Parent'));
  const remove = Array.from(t.document.querySelectorAll('button')).find(
    (b) => b.textContent === 'Remove request',
  );
  t.click(remove);
  assert.equal(t.read('bookings').length, 0);
  assert(
    t.find('booking-history-body').textContent.includes('No demo requests'),
  );
  console.log('FLOW PASS profile: data display, remove request, empty history');
}
{
  const t = load('index.html');
  t.change('contact-branch', 'taraz');
  const link = t.document.querySelector('a[href="https://wa.me/77074821698"]');
  assert(link);
  assert(t.document.querySelector('a[href="tel:+77074821698"]'));
  console.log('FLOW PASS shared contact: branch-specific phone and WhatsApp');
}
for (const page of [
  'booking.html',
  'services.html',
  'register.html',
  'reviews.html',
]) {
  load(page, {}, { noStorage: true });
}
console.log('FLOW PASS storage denied: pages still initialize');
{
  const t = load('services.html');
  const byText = (text) =>
    Array.from(t.document.querySelectorAll('button')).find(
      (button) => button.textContent === text,
    );
  t.click(byText('Add to estimate'));
  const name = t.window.Shindal.findService(t.read('cart')[0].id).name;
  for (let i = 1; i < 20; i++) t.click(byText(`+ ${name}`));
  assert.equal(t.read('cart')[0].quantity, 20);
  t.click(byText(`+ ${name}`));
  assert.equal(t.read('cart')[0].quantity, 20);
  assert(t.document.getElementById('main').textContent.includes('Maximum 20'));
  t.click(byText(`− ${name}`));
  assert.equal(t.read('cart')[0].quantity, 19);
  t.click(byText(`Remove ${name}`));
  assert.equal(t.read('cart').length, 0);
  console.log('FLOW PASS cart limits, decrease, remove');
}
{
  const t = load('register.html');
  t.find('reg-photo').files = [{ type: 'text/plain', size: 10 }];
  t.input('reg-name', 'Parent');
  t.input('reg-email', 'a@example.com');
  t.input('reg-phone', '+77012345678');
  t.change('reg-branch', 'astana');
  t.input('reg-password', 'DemoPass1!');
  t.input('reg-password-confirm', 'DemoPass1!');
  t.submit('register-form');
  assert(t.find('reg-photo-error'));
  assert(!t.read('profile'));
  t.find('reg-photo').files = [{ type: 'image/png', size: 3 * 1024 * 1024 }];
  t.submit('register-form');
  assert(t.find('reg-photo-error'));
  assert.equal(t.find('reg-password').getAttribute('name'), null);
  assert.equal(t.find('reg-password-confirm').getAttribute('name'), null);
  console.log('FLOW PASS invalid photo type/size and password name removal');
}
{
  const t = load('specialists.html');
  t.change('specialist-branch', 'taraz');
  assert(
    t.document
      .querySelector('#main .row.row-cols-1')
      .textContent.includes('Malika Nurpeisova'),
  );
  t.input('specialist-search', 'no-match-xyz');
  assert(
    t.document
      .getElementById('main')
      .textContent.includes('No matching specialists'),
  );
  const a = load('about.html');
  a.change('visitor-goal', 'contact');
  assert(
    Array.from(a.document.querySelectorAll('a[href="help.html"]')).some(
      (link) => link.textContent.includes('Find a branch'),
    ),
  );
  console.log('FLOW PASS specialist branch+search filters and About routing');
}
{
  const t = load('specialists.html');
  const profiles = t.window.ShindalStaffProfiles;
  assert.equal(profiles.length, 24);
  assert(profiles.every((row) => row.age >= 25 && row.age <= 40));
  assert(
    profiles.every(
      (row) => row.experienceYears >= 2 && row.experienceYears <= row.age - 23,
    ),
  );
  const grid = t.document.querySelector('#main .row.row-cols-1');
  assert.equal(grid.querySelectorAll('article').length, 24);
  assert.equal(
    grid.querySelectorAll('img[src="images/specialist-avatar.png"]').length,
    24,
  );
  assert.equal(grid.querySelectorAll('img[alt]').length, 24);
  assert(grid.textContent.includes('Sample profile'));
  assert(grid.textContent.includes('Education'));
  assert(grid.textContent.includes('Certificate'));
  t.change('specialist-branch', 'taraz');
  t.change('specialist-service', 'speech');
  assert.equal(grid.querySelectorAll('article').length, 1);
  assert(grid.textContent.includes('Malika Nurpeisova'));
  assert(t.find('price-table').classList.contains('soft-card'));
  assert.equal(t.find('price-table').querySelectorAll('tbody tr').length, 8);
  const again = load('specialists.html');
  assert.equal(
    JSON.stringify(again.window.ShindalStaffProfiles),
    JSON.stringify(profiles),
  );
  console.log(
    'FLOW PASS staff profiles: 24 stable sample biographies, ages/experience bounds, avatars, connected service+branch filters, price-table rows',
  );
}
{
  const t = load('about.html');
  const row = t.document.querySelector('#main h1').closest('.row');
  assert.equal(row.children.length, 2);
  assert(row.children[0].querySelector('h1'));
  assert(row.children[1].querySelector('img'));
  assert.equal(
    t.find('visitor-goal').closest('section').previousElementSibling,
    row,
  );
  console.log(
    'FLOW PASS About: intro text and image remain sibling columns; next-step section follows the full row',
  );
}
