'use strict';
// jQuery 3.7.1 FULL build from the official CDN: effects are required (the slim build omits them).
// ready waits until HTML exists; each following page file registers its own ready callback after this one.
$(function () {
  const services = window.ShindalData;
  const demo = 'Front-end demonstration only. No data is sent to a server; no real booking, payment, order or account is created.';
  const make = (tag, text = '', classes = '') => $('<' + tag + '>').text(text).addClass(classes);
  const money = amount => new Intl.NumberFormat('en-KZ').format(amount) + ' ₸';
  const findService = id => services.find(item => item.id === id);
  const total = rows => rows.reduce((sum, row) => sum + (findService(row.id)?.price || 0) * row.quantity, 0);
  const reference = () => 'DEMO-' + Date.now().toString(36).toUpperCase() + '-' + Math.floor(1000 + Math.random() * 9000);
  const read = (key, fallback) => {
    try { return JSON.parse(sessionStorage.getItem('shindal-' + key)) || fallback; }
    catch { return fallback; }
  };
  const save = (key, value) => {
    try { sessionStorage.setItem('shindal-' + key, JSON.stringify(value)); return true; }
    catch { return false; }
  };
  const rows = key => { const value = read(key, []); return Array.isArray(value) ? value.filter(item => item && typeof item === 'object') : []; };
  const email = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const phone = value => /^(?:\+7|8)\d{10}$/.test(value.replace(/[\s()-]/g, ''));
  const strong = value => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
  const button = (text, action) => {
    const $button = make('button', text, 'btn btn-outline-brand btn-sm').attr('type', 'button');
    if (action) $button.on('click', action);
    return $button;
  };
  const field = ($parent, id, caption, type = 'text') => {
    const $wrap = make('div', '', 'mb-3');
    const $input = make('input', '', 'form-control').attr({id, name: id, type});
    $wrap.append(make('label', caption, 'form-label').attr('for', id), $input).appendTo($parent);
    return $input;
  };
  const select = ($parent, id, caption, options) => {
    const $input = field($parent, id, caption);
    const $select = make('select', '', 'form-select').attr({id, name: id});
    options.forEach(([value, text]) => $select.append(make('option', text).val(value)));
    $input.replaceWith($select);
    return $select;
  };
  const render = ($parent, items, card, empty = 'No matching items. Change your filters or reset.') => {
    $parent.empty();
    if (!items.length) $parent.append(make('p', empty, 'col-12'));
    else items.forEach(item => $parent.append(card(item)));
  };
  const message = ($target, text) => {
    // Chain: stop stale animations, update safe text, expose the live region, then fade it in.
    $target.stop(true, true).text(text).attr({'role': 'status', 'aria-live': 'polite', tabindex: '-1'})
      .removeClass('hidden').addClass('text-break').hide().fadeIn(180, function () {
        // Callback runs AFTER feedback appears; keyboard/screen-reader users can review the result.
        $(this).trigger('focus');
      });
  };
  const dismiss = $target => {
    $target.stop(true, true).fadeOut(120, function () { $(this).addClass('hidden'); });
  };
  const clearField = $input => {
    const id = $input.attr('id');
    // siblings reaches only this field's own generated error, without adding parent ids.
    $input.siblings('[data-field-error="' + id + '"]').remove();
    $input.removeClass('error success').removeAttr('aria-invalid');
    const described = String($input.attr('aria-describedby') || '').split(' ').filter(token => token && token !== id + '-error');
    if (described.length) $input.attr('aria-describedby', described.join(' '));
    else $input.removeAttr('aria-describedby');
  };
  const markField = ($input, error) => {
    clearField($input);
    $input.addClass(error ? 'error' : 'success').attr('aria-invalid', String(Boolean(error)));
    if (error) {
      const id = $input.attr('id');
      make('p', error, 'error-message').attr({id: id + '-error', 'data-field-error': id}).insertAfter($input);
      $input.attr('aria-describedby', [String($input.attr('aria-describedby') || ''), id + '-error'].filter(Boolean).join(' '));
    }
  };
  // REWRITE 1: .on/.val/.addClass/.after replace addEventListener/value/classList/after in old validate.
  // The jQuery version makes field traversal clearer; the business validation rules are not inherently shorter.
  const validate = ($form, rules, success) => {
    $form.attr('novalidate', 'novalidate'); // Keep required/type/min/max; custom validation supplies accessible per-field messages.
    // Client checks improve feedback, but a real server MUST validate again: browser checks can be bypassed.
    const $result = $form.parent().find('[id$="-confirmation"]');
    $form.on('input.validation change.validation', 'input, select, textarea', function () {
      const $changed = $(this);
      const errors = rules();
      Object.entries(errors).forEach(([id, error]) => {
        const $input = $form.find('[id="' + id + '"]');
        if ($input.is($changed) || $input.hasClass('error') || $input.hasClass('success')) {
          // Keep an error until it is actually fixed; recheck dependent date/time/password fields too.
          if ($input.attr('aria-invalid') !== undefined) markField($input, error);
        }
      });
      if (!$result.hasClass('hidden')) dismiss($result);
    });
    $form.on('reset.validation', function () {
      $form.find('input, select, textarea').each(function () { clearField($(this)); });
      $result.stop(true, true).addClass('hidden');
    });
    $form.on('submit.validation', function (event) {
      // Without preventDefault, the original GET action navigates away and puts form fields into the URL.
      event.preventDefault();
      $result.stop(true, true).addClass('hidden');
      let $first = null;
      Object.entries(rules()).forEach(([id, error]) => {
        const $input = $form.find('[id="' + id + '"]');
        markField($input, error);
        if (error && !$first) $first = $input;
      });
      if ($first) $first.trigger('focus');
      else success();
    });
  };
  // REWRITE 3: .on/.attr/.text replace addEventListener/type/textContent for Show/Hide Password.
  // Delegating one handler to the form is shorter and also works for password controls added later.
  const passwords = $form => {
    const checks = [[/.{8,}/, '8 or more characters'], [/[A-Z]/, 'Uppercase letter'], [/[a-z]/, 'Lowercase letter'], [/\d/, 'Number'], [/[^A-Za-z0-9]/, 'Special character']];
    $form.find('input[type="password"]').each(function () {
      const $input = $(this).removeAttr('name'); // Never submit password fields as a GET parameter.
      const id = $input.attr('id');
      button('Show password').attr({'data-password-for': id, 'aria-controls': id, 'aria-pressed': 'false'}).insertAfter($input);
    });
    $form.on('click.password', '[data-password-for]', function () {
      const $button = $(this);
      const $input = $form.find('[id="' + $button.attr('data-password-for') + '"]');
      const show = $input.attr('type') === 'password';
      $input.attr('type', show ? 'text' : 'password');
      $button.text(show ? 'Hide password' : 'Show password').attr('aria-pressed', String(show));
    });
    const $primary = $form.find('input[id$="-password"]');
    const $checklist = make('ul', '', 'small').attr('id', $primary.attr('id') + '-requirements').insertAfter($primary);
    $primary.attr('aria-describedby', $checklist.attr('id'));
    const update = () => render($checklist, checks, ([pattern, label]) => make('li', (pattern.test(String($primary.val())) ? '✓ ' : '○ ') + label));
    $primary.on('input.password', update);
    $form.on('reset.password', function () {
      $form.find('[data-password-for]').text('Show password').attr('aria-pressed', 'false');
      $form.find('[autocomplete="new-password"], [autocomplete="current-password"]').attr('type', 'password');
      setTimeout(update, 0);
    });
    update();
    return update;
  };
  // Existing state classes only; effect APIs manage their own temporary animation styles.

  $('#primary-nav').on('click.navigation', '[data-bs-toggle]', function () {
    if (window.bootstrap) return;
    const $toggle = $(this);
    const $target = $toggle.attr('data-bs-toggle') === 'dropdown' ? $toggle.siblings('.dropdown-menu') : $($toggle.attr('data-bs-target'));
    $target.toggleClass('show');
    $toggle.attr('aria-expanded', String($target.hasClass('show')));
  });
  const $searchForm = make('form', '', 'd-flex flex-wrap gap-2 mb-3');
  const $search = field($searchForm, 'site-search', 'Find a service', 'search');
  $searchForm.append(make('button', 'Search services', 'btn btn-outline-brand').attr('type', 'submit'));
  $('#site-footer').find('.container').first().prepend($searchForm);
  $searchForm.on('submit', function (event) {
    event.preventDefault(); // Keep the query explicit instead of the browser submitting to this page.
    location.href = 'services.html?q=' + encodeURIComponent(String($search.val()).trim());
  });
  window.Shindal = {services, demo, make, money, findService, total, reference, read, rows, save, email, phone, strong, button, field, select, render, message, dismiss, validate, passwords};
});
