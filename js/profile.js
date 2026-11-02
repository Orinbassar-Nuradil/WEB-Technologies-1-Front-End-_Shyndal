'use strict';
$(function () {
  const S = window.Shindal;
  const $result = $('#profile-message');
  S.message($result, 'Local demo profile and requests for this tab. No authentication. ' + S.demo);
  let profile = S.read('profile', null);
  let bookings = S.rows('bookings');
  const drawProfile = () => ['name', 'email', 'phone', 'branch'].forEach(key => $('#profile-' + key).text(profile?.[key] || 'No demo details saved'));
  const $editor = S.make('form', '', 'mt-3 hidden').attr({id: 'profile-editor', novalidate: 'novalidate'}).insertAfter($('#profile-details'));
  const fields = {};
  ['name', 'email', 'phone'].forEach(key => { fields[key] = S.field($editor, 'edit-' + key, key, key === 'email' ? 'email' : key === 'phone' ? 'tel' : 'text').prop('required', true); });
  fields.branch = S.select($editor, 'edit-branch', 'Branch', [['astana', 'Astana'], ['kosshy', 'Kosshy'], ['taraz', 'Taraz']]);
  $editor.append(S.make('button', 'Save demo details', 'btn btn-brand').attr('type', 'submit'), S.button('Cancel editing', function () { $editor.addClass('hidden'); S.message($result, 'Editing cancelled.'); }));
  $('#profile-edit').on('click', function () {
    Object.entries(fields).forEach(([key, $input]) => $input.val(profile?.[key] || (key === 'branch' ? 'astana' : '')));
    $editor.removeClass('hidden').find('input').first().trigger('focus');
  });
  S.validate($editor, () => ({
    'edit-name': String(fields.name.val()).trim().length >= 2 && String(fields.name.val()).trim().length <= 80 ? '' : 'Enter your name (2–80 characters).',
    'edit-email': S.email(String(fields.email.val())) ? '' : 'Enter a valid email.',
    'edit-phone': S.phone(String(fields.phone.val())) ? '' : 'Enter a valid Kazakhstan phone.',
    'edit-branch': ['astana', 'kosshy', 'taraz'].includes(fields.branch.val()) ? '' : 'Choose a branch.'
  }), function () {
    profile = Object.fromEntries(Object.entries(fields).map(([key, $input]) => [key, String($input.val()).trim()]));
    const stored = S.save('profile', profile);
    drawProfile(); $editor.trigger('reset').addClass('hidden');
    S.message($result, stored ? 'Demo details saved in this tab.' : 'Updated on this page; browser storage unavailable.');
  });
  $('#booking-history').find('caption').text('Local demonstration requests only');
  const $body = $('#booking-history-body');
  const drawBookings = () => {
    $body.empty();
    if (!bookings.length) {
      $body.append(S.make('tr').append(S.make('td', 'No demo requests yet. Use Book a new session.').attr('colspan', 4)));
      return;
    }
    bookings.forEach(row => {
      const $status = S.make('td', 'Demo only · ' + S.money(row.total) + ' ').append(S.button('Remove request').attr('data-remove-request', row.reference));
      $body.append(S.make('tr').append(S.make('td', row.date + ' · ' + row.time), S.make('td', row.specialist + ' · ' + row.service + ' × ' + row.quantity), S.make('td', row.branch), $status));
    });
  };
  $body.on('click', '[data-remove-request]', function () {
    const id = $(this).attr('data-remove-request');
    bookings = bookings.filter(row => row.reference !== id);
    S.save('bookings', bookings); drawBookings(); S.message($result, 'Local demo request removed; no real appointment was cancelled.');
  });
  $('#profile-logout').text('Clear local demo data').on('click', function (event) {
    event.preventDefault(); // Original anchor would navigate to login rather than clear demo state.
    ['profile', 'bookings', 'reviews', 'cart'].forEach(key => S.save(key, null));
    profile = null; bookings = []; drawProfile(); drawBookings(); $editor.addClass('hidden');
    S.message($result, 'Local demo data cleared.');
  });
  drawProfile(); drawBookings();
});
