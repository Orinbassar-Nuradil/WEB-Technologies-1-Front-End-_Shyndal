'use strict';
$(function () {
  const S = window.Shindal;
  const $form = $('#booking-form');
  const value = id => String($form.find('[id="' + id + '"]').val() || '').trim();
  const $service = $('#service');
  const $specialist = $('#specialist');
  const $date = $('#visit-date');
  const $time = $('#visit-time');
  const $quantity = S.field($form.find('.row').first(), 'sessions', 'Number of individual sessions (1–20)', 'number').attr({min: 1, max: 20, required: true, value: 1}).val('1');
  const today = () => new Intl.DateTimeFormat('en-CA', {timeZone: 'Asia/Almaty', year: 'numeric', month: '2-digit', day: '2-digit'}).format(new Date());
  $date.attr('min', today());
  $('#child-age').prop('required', true);
  const periods = {morning: '09:00–09:40', afternoon: '15:00–15:40', evening: '17:00–17:40'};
  $time.find('option').each(function () { $(this).text(periods[$(this).val()]); });
  const $summary = S.make('p', '', 'mt-3').attr({id: 'booking-summary', 'aria-live': 'polite'}).insertAfter($('#booking-price').parent());
  $form.find('.small.text-muted').text(S.demo);
  $('#main .steps li').each(function (index) {
    $(this).text(['Review your demo summary', 'Contact the center directly', 'Agree on a real specialist, price and date', 'Visit only after the center confirms'][index]);
  });
  const chosen = new URLSearchParams(location.search).get('service');
  if (S.findService(chosen)) $service.val(chosen);
  const choose = () => {
    const item = S.findService(String($service.val()));
    $specialist.empty().append(S.make('option', 'Any suitable specialist').val('any'));
    (item?.specialists || []).forEach(name => $specialist.append(S.make('option', name).val(name)));
  };
  const update = () => {
    const item = S.findService(String($service.val()));
    const quantity = Number($quantity.val());
    $('#booking-price').text(item && Number.isInteger(quantity) && quantity >= 1 && quantity <= 20 ? S.money(item.price * quantity) : 'Choose a service and 1–20 sessions');
    // attr('checked') would read the ORIGINAL HTML attribute; prop('checked') reads the LIVE state.
    const first = $('#first-visit').prop('checked');
    $summary.text((item?.name || 'Choose service') + ' · ' + value('branch') + ' · ' + ($date.val() || 'Choose date') + ' · ' + $time.find('option:selected').text() + ' · ' + ($quantity.val() || '0') + ' individual sessions. ' + (first ? 'First visit: diagnostic assessment; final price needs direct confirmation. ' : '') + 'Multiple sessions require separate agreed dates; Saturday is by appointment.');
  };
  const rules = () => {
    const item = S.findService(value('service'));
    const quantity = Number($quantity.val());
    const age = Number(value('child-age'));
    const hour = {morning: '09', afternoon: '15', evening: '17'}[value('visit-time')];
    const visit = new Date(value('visit-date') + 'T' + (hour || '00') + ':00:00+05:00');
    const day = new Date(value('visit-date') + 'T12:00:00+05:00').getUTCDay();
    const duplicate = S.rows('bookings').some(row => row.date === value('visit-date') && row.time === value('visit-time') && row.branch === value('branch') && (row.specialist === value('specialist') || row.specialist === 'any' || value('specialist') === 'any'));
    return {
      'child-name': value('child-name').length >= 2 && value('child-name').length <= 80 ? '' : 'Enter the child’s name (2–80 characters).',
      'parent-name': value('parent-name').length >= 2 && value('parent-name').length <= 80 ? '' : 'Enter the parent’s name (2–80 characters).',
      phone: S.phone(value('phone')) ? '' : 'Use +7 and 10 digits, for example +7 701 234 56 78.',
      email: !value('email') || S.email(value('email')) ? '' : 'Enter a valid email address, or leave this optional field blank.',
      'child-age': Number.isInteger(age) && age >= 1 && age <= 18 ? '' : 'Enter a whole age from 1 to 18.',
      branch: ['astana', 'kosshy', 'taraz'].includes(value('branch')) ? '' : 'Choose a branch.',
      service: item ? '' : 'Choose a service.',
      specialist: item && (value('specialist') === 'any' || item.specialists.includes(value('specialist'))) ? '' : 'Choose a specialist matching the service.',
      'visit-date': value('visit-date') >= today() && !Number.isNaN(visit.getTime()) && day !== 0 ? '' : 'Choose today or a future date. Sunday is closed.',
      'visit-time': !hour ? 'Choose a listed time.' : visit <= new Date() ? 'This time has passed. Choose a future date/time.' : duplicate ? 'A local demo request conflicts with this branch, time and specialist. Choose another time.' : '',
      sessions: Number.isInteger(quantity) && quantity >= 1 && quantity <= 20 ? '' : 'Choose 1–20 individual sessions.',
      comment: value('comment').length <= 1000 ? '' : 'Use no more than 1000 characters.',
      consent: $form.find('input[id="consent"]:checked').length === 1 ? '' : 'Please agree before continuing.'
    };
  };
  // REWRITE 1 (main form): .val/.prop/.find and S.validate replace native value/checked/DOM handlers.
  // Field rules stay explicit; the jQuery helper provides consistent individual errors and live rechecking.
  S.validate($form, rules, function () {
    const item = S.findService(value('service'));
    const row = {reference: S.reference(), date: value('visit-date'), time: value('visit-time'), branch: value('branch'), specialist: value('specialist'), service: item.name, quantity: Number($quantity.val()), total: item.price * Number($quantity.val())};
    const summaries = S.rows('bookings'); summaries.push(row);
    const stored = S.save('bookings', summaries);
    const text = row.reference + '. ' + $summary.text() + ' Estimate ' + S.money(row.total) + '. ' + (stored ? 'Local demo request saved in this tab; manage it in My Profile. ' : 'Storage unavailable; keep this summary yourself. ') + S.demo;
    $form.trigger('reset'); // Reset only AFTER collecting a complete, valid summary.
    S.message($('#booking-confirmation'), text);
  });
  $service.on('change.booking', function () { choose(); update(); });
  $form.on('input.booking change.booking', 'input, select, textarea', update);
  $form.on('reset.booking', function () { setTimeout(function () { choose(); update(); }, 0); });
  choose(); update();
});
