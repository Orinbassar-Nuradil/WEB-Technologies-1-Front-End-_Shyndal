'use strict';
// jq-profile.js — jQuery. Visitor questions: "Is my request saved?", "How much will my visits cost?" and "Can I fix my details?"
// Added since the last defended version: details come from the real account (Register/Login), the visitor can edit them
// with the same field checks, the history table is built from the saved requests with upcoming/past labels
// and calculated totals, and "Log out" really ends the session.

$(function () {
  const $message = $('#profile-message');
  const $body = $('#booking-history-body');
  const $edit = $('#profile-edit');
  let account = storageRead('account', null);
  let bookings = storageRead('bookings', []);
  const session = storageRead('session', null);
  const loggedIn = Boolean(account && session && session.email === account.email);

  // ---------- account details ----------
  function initials(name) {
    return name.split(/\s+/).filter(Boolean).slice(0, 2).map(function (part) { return part.charAt(0).toUpperCase(); }).join('');
  }
  function drawDetails() {
    const keys = ['name', 'email', 'phone', 'branch'];
    $.each(keys, function (index, key) {
      let text = account[key];
      if (key === 'branch') text = findBranch(account.branch).name;
      $('#profile-' + key).text(text);
    });
    $('#profile-avatar').text(initials(account.name));
  }
  if (loggedIn) {
    $('#profile-member').prop('hidden', false);
    $('#profile-guest').prop('hidden', true);
    drawDetails();
  }

  // Log out: end the session, then the link goes on to the login page.
  $('#profile-logout').on('click', function () {
    storageSave('session', null);
  });

  // ---------- editing form (created in code, opened with a slide) ----------
  const $editor = $('<form>').attr({id: 'profile-editor', novalidate: 'novalidate'}).addClass('mt-3').hide().insertAfter('#profile-details');
  const inputs = {};
  $.each([['name', 'Full name', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel']], function (index, def) {
    const id = 'edit-' + def[0];
    inputs[def[0]] = $('<input>').addClass('form-control').attr({id: id, type: def[2]});
    $('<div>').addClass('mb-3').append($('<label>').addClass('form-label').attr('for', id).text(def[1]), inputs[def[0]]).appendTo($editor);
  });
  inputs.branch = $('<select>').addClass('form-select').attr('id', 'edit-branch');
  $.each(BRANCHES, function (index, branch) { inputs.branch.append($('<option>').val(branch.id).text(branch.name)); });
  $('<div>').addClass('mb-3').append($('<label>').addClass('form-label').attr('for', 'edit-branch').text('Preferred branch'), inputs.branch).appendTo($editor);
  $editor.prepend(jqEl('div', '', 'alert alert-danger hidden').attr('role', 'alert'));
  const $cancel = jqEl('button', 'Cancel', 'btn btn-outline-brand').attr('type', 'button');
  $editor.append(jqEl('button', 'Save details', 'btn btn-brand me-2').attr('type', 'submit'), $cancel);
  // jqValidate looks for a *-confirmation box next to the form; the page's own message box plays that role here.
  $editor.after(jqEl('span', '', 'hidden').attr('id', 'profile-editor-confirmation'));

  $edit.on('click', function () {
    $.each(inputs, function (key, $input) { $input.val(account[key]); });
    $editor.stop(true, true).slideDown(200, function () { inputs.name.trigger('focus'); });
  });
  $cancel.on('click', function () {
    $editor.get(0).reset();
    $editor.slideUp(200);
  });

  jqValidate($editor, [
    {id: 'edit-name', label: 'Full name', check: function (value) { return value.length >= 2 && value.length <= 80 && /\p{L}/u.test(value) ? '' : 'Enter your full name (2–80 characters, with letters).'; }},
    {id: 'edit-email', label: 'Email', check: function (value) { return isEmail(value) ? '' : 'The e-mail should look like name@example.com.'; }},
    {id: 'edit-phone', label: 'Phone', check: function (value) { return isPhone(value) ? '' : 'Use +7 and 10 digits, for example +7 701 234 56 78.'; }},
    {id: 'edit-branch', label: 'Preferred branch', check: function (value) { return findBranch(value) ? '' : 'Choose a branch.'; }}
  ], function (read) {
    account = $.extend({}, account, {name: read('edit-name'), email: read('edit-email').toLowerCase(), phone: read('edit-phone'), branch: read('edit-branch')});
    storageSave('account', account);
    storageSave('session', {email: account.email});
    drawDetails();
    $editor.slideUp(200);
    jqShow($message, 'Your details are updated.');
  });

  // ---------- request history ----------
  const $summary = jqEl('p', '', 'fw-semibold mb-2').attr({id: 'profile-summary', 'aria-live': 'polite'});
  $('#booking-history').closest('.table-responsive').before($summary);
  const $clear = jqEl('button', 'Clear all requests', 'btn btn-outline-brand').attr('type', 'button');
  $('#main a[href="booking.html"]').last().after($clear);

  function drawBookings() {
    $body.empty();
    if (bookings.length === 0) {
      $body.append($('<tr>').append($('<td>').attr('colspan', 4).text('No requests yet. Press “Book a new session” to make one.')));
      $summary.text('0 requests');
      $clear.prop('hidden', true);
      return;
    }
    $.each(bookings, function (index, row) {
      const service = findService(row.service);
      const monthly = Array.isArray(row.sessions) && row.sessions.length > 1;
      const dates = monthly ? row.sessions.map(function (session) { return session.date; }).sort() : [row.date];
      const lastDate = dates[dates.length - 1];
      const $when = $('<th>').attr('scope', 'row');
      if (monthly) {
        const $schedule = $('<details>').append(jqEl('summary', 'Monthly subscription · ' + dates[0] + ' – ' + lastDate));
        const $list = $('<ul>').addClass('small fw-normal ps-3 mb-0');
        row.sessions.forEach(function (session, index) {
          const week = Math.floor(index / SESSIONS_PER_WEEK) + 1;
          $list.append(jqEl('li', 'Week ' + week + ' · ' + session.date + ' · ' + bookingTimeLabel(session.time)));
        });
        $when.append($schedule.append($list));
      } else {
        $when.text(row.date + ' · ' + bookingTimeLabel(row.time));
      }
      const upcoming = lastDate >= todayISO();
      const $status = $('<td>').append(
        jqEl('span', upcoming ? 'Upcoming' : 'Past', 'badge ' + (upcoming ? 'text-bg-success' : 'text-bg-secondary')),
        jqEl('span', ' ' + formatMoney(row.total) + ' ', 'small'),
        jqEl('button', 'Remove', 'btn btn-outline-brand btn-sm').attr({type: 'button', 'data-remove-request': row.reference})
      );
      $('<tr>').toggleClass('table-success', upcoming).append(
        $when,
        jqEl('td', (row.specialist === 'any' ? 'Any specialist' : row.specialist) + ' — ' + (service ? service.name : row.service) + ' × ' + row.quantity),
        jqEl('td', findBranch(row.branch) ? findBranch(row.branch).name : row.branch),
        $status
      ).appendTo($body);
    });
    const total = bookings.reduce(function (sum, row) { return sum + row.total; }, 0);
    const sessions = bookings.reduce(function (sum, row) { return sum + row.quantity; }, 0);
    $summary.text(bookings.length + (bookings.length === 1 ? ' request' : ' requests') + ' · ' + sessions + (sessions === 1 ? ' session' : ' sessions') + ' · estimated total ' + formatMoney(total));
    $clear.prop('hidden', false);
  }

  // Delegated: rows are rebuilt by drawBookings(), so the handler sits on the table body.
  $body.on('click', '[data-remove-request]', function () {
    const id = $(this).attr('data-remove-request');
    $(this).closest('tr').fadeOut(180, function () {
      bookings = bookings.filter(function (row) { return row.reference !== id; });
      storageSave('bookings', bookings);
      drawBookings();
      jqShow($message, 'The request was removed from this list.');
    });
  });
  $clear.on('click', function () {
    bookings = [];
    storageSave('bookings', bookings);
    drawBookings();
    jqShow($message, 'All requests were removed from this list.');
  });
  drawBookings();
});
