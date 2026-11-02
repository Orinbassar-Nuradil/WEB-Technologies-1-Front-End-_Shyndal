'use strict';
$(function () {
  const S = window.Shindal;
  const $list = $('#reviews-list');
  const $form = $('#review-form');
  $form.prev('p').text('Reviews added here are local demonstrations in this browser tab. Nothing is sent to administrators.');
  const original = $list.find('img').map(function (index) {
    return {id: 'photo-' + index, name: 'Parent review — source photo', text: 'Open the original review image.', image: $(this).attr('src'), branch: '', date: null};
  }).get();
  let submitted = S.rows('reviews').filter(row => typeof row.name === 'string' && typeof row.text === 'string' && typeof row.date === 'string');
  const renderReview = review => {
    const $column = S.make('div', '', 'col').attr('data-review-id', review.id);
    const $card = S.make('article', '', 'soft-card p-3 h-100').append(S.make('h3', review.name, 'h6'), S.make('p', review.text, 'text-break'));
    if (review.image) {
      $card.append(S.make('a', 'Open original photo').attr('href', review.image).prepend(S.make('img', '', 'img-fluid rounded-3').attr({src: review.image, alt: review.name})));
    }
    const time = review.date ? review.branch + ' · ' + new Date(review.date).toLocaleString('en-GB', {timeZone: 'Asia/Almaty'}) + ' · Local demo review' : 'Original date and author remain in the source photo.';
    $card.append(S.make('p', time, 'small text-muted'));
    if (!review.image) $card.append(S.button('Remove this demo review').attr('data-remove-review', review.id));
    return $column.append($card);
  };
  const $controls = S.make('div', '', 'mb-3').insertBefore($list);
  const $filter = S.select($controls, 'review-filter', 'Reviews', [['', 'All reviews'], ['local', 'Local demo submissions']]);
  const $count = S.make('p').attr({'aria-live': 'polite', id: 'review-count'}).appendTo($controls);
  const draw = () => {
    const reviews = $filter.val() === 'local' ? submitted : submitted.concat(original);
    $count.text(reviews.length + ' reviews');
    S.render($list, reviews, renderReview, 'No local demo reviews yet. Submit one below.');
  };
  $controls.append(S.button('Reset reviews filter', function () { $filter.val(''); draw(); }));
  $filter.on('change', draw);
  // Delegated parent stays present when filtering redraws the review cards.
  $list.on('click', '[data-remove-review]', function () {
    const $button = $(this).prop('disabled', true);
    const id = $button.attr('data-remove-review');
    $button.closest('[data-review-id]').fadeOut(160, function () {
      submitted = submitted.filter(review => review.id !== id);
      const stored = S.save('reviews', submitted); draw();
      S.message($('#review-confirmation'), 'Demo review removed.' + (stored ? '' : ' Browser storage unavailable; change applies to this page only.'));
    });
  });
  const $text = $('#review-text').attr('maxlength', 1000);
  const $counter = S.make('p', '', 'small').attr('aria-live', 'polite').insertAfter($text);
  const update = () => $counter.text(String($text.val()).length + '/1000 characters (minimum 20)');
  $text.on('input', update); $form.on('reset', function () { setTimeout(update, 0); });
  S.validate($form, () => ({
    'review-name': String($('#review-name').val()).trim().length >= 2 && String($('#review-name').val()).trim().length <= 80 ? '' : 'Enter a name with 2–80 characters.',
    'review-branch': ['astana', 'kosshy', 'taraz'].includes($('#review-branch').val()) ? '' : 'Choose a branch.',
    'review-text': String($text.val()).trim().length >= 20 && String($text.val()).trim().length <= 1000 ? '' : 'Write 20–1000 characters.'
  }), function () {
    submitted.unshift({id: S.reference(), name: String($('#review-name').val()).trim(), text: String($text.val()).trim(), branch: $('#review-branch').val(), date: new Date().toISOString()});
    const stored = S.save('reviews', submitted);
    draw(); $form.trigger('reset');
    S.message($('#review-confirmation'), 'Review added locally. ' + (stored ? 'Saved in this browser tab. ' : 'Storage unavailable; visible on this page only. ') + S.demo);
  });
  S.make('a', 'Open the video directly if embedded playback is unavailable', 'd-block mt-2').attr('href', 'images/otziv%201.mp4').insertAfter($('#review-video').closest('.ratio'));
  draw(); update();
});
