'use strict';
// jq-common.js — jQuery helpers shared by the jQuery files (jq-reviews.js, jq-help.js, jq-specialists.js, jq-profile.js).
// This file never runs on its own: it only defines functions. It is kept apart from the plain-JavaScript files.

// Build an element with safe text and classes. .text() never parses HTML, so visitor input stays harmless.
function jqEl(tag, text, classes) {
  return $('<' + tag + '>').text(text || '').addClass(classes || '');
}

// Reveal one of the prepared alert boxes with a fade.
// Chain: stop any running animation -> set the text -> un-hide -> hide -> fade in (5 methods).
function jqShow($box, text) {
  $box.stop(true, true).text(text).removeClass('hidden').hide().fadeIn(180);
}

function jqHide($box) {
  $box.stop(true, true).fadeOut(120, function () { $(this).addClass('hidden').empty(); });
}

function jqValue($input) {
  return String($input.val() || '').trim();
}

// Show the error right after the field, or mark the field as correct when message is ''.
function jqFieldError($input, message) {
  const id = $input.attr('id');
  // siblings() finds only this field's own error note, so no extra ids are needed.
  $input.siblings('.error-message').remove();
  $input.removeClass('error success').removeAttr('aria-invalid aria-describedby');
  if (message === '') {
    $input.addClass('success');
    return;
  }
  $input.addClass('error').attr({'aria-invalid': 'true', 'aria-describedby': id + '-error'});
  jqEl('p', message, 'error-message').attr('id', id + '-error').insertAfter($input);
}

// fields: [{id, label, check: function (value, read) { return '' or 'error text'; }}]
// Same behaviour as the plain-JavaScript validator in forms.js, written with jQuery selectors and chains.
function jqValidate($form, fields, onSuccess) {
  $form.attr('novalidate', 'novalidate');
  const $summary = $form.find('.alert-danger').first();
  const $confirmation = $form.parent().find('[id$="-confirmation"]').first();
  const $input = function (id) { return $form.find('[id="' + id + '"]'); };
  const read = function (id) { return jqValue($input(id)); };
  const errorFor = function (field) { return field.check(read(field.id), read); };
  const failedIds = function () {
    return fields.filter(function (field) { return $input(field.id).hasClass('error'); }).map(function (field) { return field.id; });
  };
  const drawSummary = function (ids) {
    if (!ids.length) { jqHide($summary); return; }
    const names = ids.map(function (id) { return fields.find(function (field) { return field.id === id; }).label; });
    jqShow($summary, 'Please fix ' + ids.length + (ids.length === 1 ? ' field: ' : ' fields: ') + names.join(', ') + '.');
  };

  $form.on('submit', function (event) {
    event.preventDefault(); // otherwise the browser would send the form and reload the page
    $confirmation.stop(true, true).addClass('hidden');
    $form.find('input[type="text"], input[type="email"], input[type="tel"], textarea').each(function () {
      $(this).val(jqValue($(this)));
    });
    const failed = [];
    $.each(fields, function (index, field) {
      const message = errorFor(field);
      jqFieldError($input(field.id), message);
      if (message) failed.push(field.id);
    });
    drawSummary(failed);
    if (failed.length) { $input(failed[0]).trigger('focus'); return; }
    onSuccess(read);
  });

  // Delegated: one handler on the form serves every field, including fields that code adds later.
  $form.on('input change', 'input, select, textarea', function () {
    const $changed = $(this);
    $confirmation.addClass('hidden');
    $.each(fields, function (index, field) {
      const $field = $input(field.id);
      // Check the field being edited and any field that currently shows an error.
      if ($field.is($changed) || $field.hasClass('error')) {
        const message = errorFor(field);
        if (message === '') jqFieldError($field, '');
        else if ($field.hasClass('error')) jqFieldError($field, message);
      }
    });
    drawSummary(failedIds());
  });
  $form.on('focusout', 'input, select, textarea', function () {
    const field = fields.find(function (item) { return item.id === $(this).attr('id'); }.bind(this));
    if (!field || jqValue($(this)) === '') return;
    jqFieldError($(this), errorFor(field));
    drawSummary(failedIds());
  });
  $form.on('reset', function () {
    $form.find('input, select, textarea').each(function () { jqFieldError($(this), ''); $(this).removeClass('success'); });
    $summary.addClass('hidden').empty();
    $confirmation.addClass('hidden');
  });
}
