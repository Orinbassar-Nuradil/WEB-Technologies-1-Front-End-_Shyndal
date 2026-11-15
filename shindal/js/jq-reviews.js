'use strict';
// jq-reviews.js — jQuery. Visitor question: "What do other parents say, and can I add my own review?"
// Added since the last defended version: filter by kind and branch, newest/oldest order, "showing N of M",
// empty-state text, and every written review is a card that fades in and can be removed with a fade.

$(function () {
  const $list = $('#reviews-list');
  const $form = $('#review-form');
  const $confirmation = $('#review-confirmation');
  const $photos = $list.children('.col').attr('data-kind', 'photo'); // the 12 photo reviews already in the page
  let written = storageRead('reviews', []);

  // ---------- one card for one written review ----------
  function buildReview(review) {
    const when = new Date(review.date).toLocaleDateString('en-GB', {timeZone: 'Asia/Almaty'});
    const branch = findBranch(review.branch);
    const $card = jqEl('article', '', 'soft-card p-3 h-100').append(
      jqEl('h3', review.name, 'h6'),
      jqEl('p', review.text, 'text-break mb-2'),
      jqEl('p', (branch ? branch.name + ' branch · ' : '') + when, 'small text-muted mb-2'),
      jqEl('button', 'Remove my review', 'btn btn-outline-brand btn-sm').attr({type: 'button', 'data-remove-review': review.id})
    );
    return jqEl('div', '', 'col-12 col-md-6').attr({'data-kind': 'written', 'data-review-id': review.id, 'data-branch': review.branch, 'data-date': review.date}).append($card);
  }

  // ---------- filter panel (built in code) ----------
  const $panel = jqEl('div', '', 'soft-card p-3 mb-3 row g-3 align-items-end mx-0');
  function addSelect(id, caption, options) {
    const $select = $('<select>').addClass('form-select').attr({id: id, name: id});
    $.each(options, function (index, option) { $select.append($('<option>').val(option[0]).text(option[1])); });
    $('<div>').addClass('col-md-3').append($('<label>').addClass('form-label').attr('for', id).text(caption), $select).appendTo($panel);
    return $select;
  }
  const $kind = addSelect('review-kind', 'Show', [['all', 'All reviews'], ['photo', 'Photo reviews'], ['written', 'Written reviews']]);
  const $branch = addSelect('review-filter-branch', 'Branch (written reviews)', [['', 'All branches']].concat(BRANCHES.map(function (branch) { return [branch.id, branch.name]; })));
  const $order = addSelect('review-order', 'Written reviews order', [['new', 'Newest first'], ['old', 'Oldest first']]);
  const $count = jqEl('p', '', 'mb-0 fw-semibold').attr({id: 'review-count', 'aria-live': 'polite'});
  const $reset = jqEl('button', 'Reset', 'btn btn-outline-brand btn-sm').attr('type', 'button');
  $('<div>').addClass('col-md-3 d-flex flex-wrap align-items-center gap-3').append($count, $reset).appendTo($panel);
  $list.before($panel);
  const $empty = jqEl('p', '', 'text-muted hidden').attr('id', 'review-empty').insertAfter($list);

  // ---------- draw: rebuild the written cards, then show or hide cards by the filters ----------
  function draw() {
    $list.children('[data-kind="written"]').remove();
    const sorted = written.slice().sort(function (a, b) { return $order.val() === 'new' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date); });
    $list.prepend(sorted.map(function (review) { return buildReview(review); }));
    const kind = $kind.val();
    const branch = $branch.val();
    $list.children().each(function () {
      const $card = $(this);
      const isWritten = $card.attr('data-kind') === 'written';
      const show = (kind === 'all' || kind === $card.attr('data-kind')) && (branch === '' || (isWritten && $card.attr('data-branch') === branch));
      $card.toggleClass('hidden', !show);
    });
    const shown = $list.children(':not(.hidden)').length;
    $count.text('Showing ' + shown + ' of ' + (written.length + $photos.length) + ' reviews');
    $empty.toggleClass('hidden', shown > 0).text(written.length === 0 && kind === 'written' ? 'No written reviews yet. Be the first: use the form below.' : 'No reviews match these filters. Press “Reset”.');
  }
  $kind.add($branch).add($order).on('change', draw);
  $reset.on('click', function () { $kind.val('all'); $branch.val(''); $order.val('new'); draw(); });

  // Delegated: the written cards are rebuilt on every draw(), so the handler sits on the list, which stays.
  $list.on('click', '[data-remove-review]', function () {
    const id = $(this).attr('data-remove-review');
    $(this).prop('disabled', true).closest('[data-review-id]').fadeOut(180, function () {
      written = written.filter(function (review) { return review.id !== id; });
      storageSave('reviews', written);
      draw();
      jqShow($confirmation, 'Your review was removed.');
    });
  });

  // ---------- review form ----------
  const $text = $('#review-text').attr('maxlength', 1000);
  const $counter = jqEl('p', '', 'small text-muted mb-0').insertAfter($text);
  const drawCounter = function () { $counter.text($text.val().length + ' / 1000 characters (at least 20)'); };
  $text.on('input', drawCounter);
  $form.on('reset', function () { setTimeout(drawCounter, 0); });
  drawCounter();

  jqValidate($form, [
    {id: 'review-name', label: 'Your name', check: function (value) { return value.length >= 2 && value.length <= 80 && /\p{L}/u.test(value) ? '' : 'Enter your name (2–80 characters, with letters).'; }},
    {id: 'review-branch', label: 'Branch', check: function (value) { return findBranch(value) ? '' : 'Choose a branch.'; }},
    {id: 'review-text', label: 'Your review', check: function (value) { return value.length >= 20 && value.length <= 1000 ? '' : 'Write between 20 and 1000 characters (now ' + value.length + ').'; }}
  ], function (read) {
    const review = {id: makeReference(), name: read('review-name'), branch: read('review-branch'), text: read('review-text'), date: new Date().toISOString()};
    written.unshift(review);
    const stored = storageSave('reviews', written);
    $form.get(0).reset();
    $kind.val('all'); $branch.val(''); $order.val('new');
    draw();
    // The new card appears with a fade so the visitor sees where it went.
    $list.find('[data-review-id="' + review.id + '"]').hide().fadeIn(300);
    jqShow($confirmation, 'Thank you, ' + review.name + '! Your review is shown above' + (stored ? ' and saved in this browser tab. ' : '. ') + 'It is not sent to the center: nothing leaves your device.');
  });

  draw();
});
