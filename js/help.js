'use strict';
$(function () {
  const S = window.Shindal;
  const $faq = $('#faq-list');
  const $search = S.field($faq.parent(), 'faq-search', 'Search questions', 'search');
  $search.parent().insertBefore($faq);
  const $count = S.make('p').attr({'aria-live': 'polite', id: 'faq-count'}).insertBefore($faq);
  const $empty = S.make('p', 'No matching questions. Reset or ask below.', 'hidden').insertAfter($faq);
  const filter = () => {
    let count = 0;
    $faq.find('.accordion-item').each(function () {
      const $item = $(this);
      const match = $item.text().toLowerCase().includes(String($search.val()).trim().toLowerCase());
      $item.toggleClass('hidden', !match);
      if (match) count += 1;
    });
    $count.text(count + ' questions found'); $empty.toggleClass('hidden', count !== 0);
  };
  $search.on('input', filter);
  S.button('Reset FAQ search', function () { $search.val(''); filter(); }).insertBefore($faq);
  // Only jQuery owns FAQ transitions; remove Bootstrap's click hook to avoid double handling.
  $faq.find('.accordion-button').removeAttr('data-bs-toggle');
  $faq.on('click.faq', '.accordion-button', function () {
    const $button = $(this);
    const $panel = $button.closest('.accordion-item').find('.accordion-collapse');
    const open = $panel.hasClass('show');
    $button.prop('disabled', true).attr('aria-expanded', String(!open)).toggleClass('collapsed', open);
    if (open) {
      $panel.stop(true, true).slideUp(180, function () {
        $(this).removeClass('show'); $button.prop('disabled', false);
      });
    } else {
      $panel.stop(true, true).addClass('show').hide().slideDown(180, function () {
        $button.prop('disabled', false);
      });
    }
  });
  $('#map-tabs').on('click.maps', 'button', function () {
    if (window.bootstrap) return;
    const $button = $(this);
    $('#map-tabs button').removeClass('active').attr({'aria-selected': 'false', tabindex: '-1'});
    $button.addClass('active').attr({'aria-selected': 'true', tabindex: '0'});
    $('.tab-pane').removeClass('active show');
    $($button.attr('data-bs-target')).addClass('active show');
  }).on('keydown.maps', 'button', function (event) {
    if (window.bootstrap || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const $tabs = $('#map-tabs button'); const current = $tabs.index(this);
    const index = event.key === 'Home' ? 0 : event.key === 'End' ? $tabs.length - 1 : (current + (event.key === 'ArrowRight' ? 1 : -1) + $tabs.length) % $tabs.length;
    $tabs.eq(index).trigger('click').trigger('focus');
  });
  const $form = $('#question-form');
  $form.prev('p').text('Preview your question locally. For a real reply use the branch phone or WhatsApp above.');
  const $text = $('#question-text').attr('maxlength', 1000);
  const $counter = S.make('p', '', 'small').insertAfter($text);
  const update = () => $counter.text(String($text.val()).length + '/1000 characters');
  $text.on('input', update); $form.on('reset', function () { setTimeout(update, 0); });
  S.validate($form, () => ({
    'question-name': String($('#question-name').val()).trim().length >= 2 ? '' : 'Enter your name (at least 2 characters).',
    'question-contact': S.email(String($('#question-contact').val())) || S.phone(String($('#question-contact').val())) ? '' : 'Enter a valid email or Kazakhstan phone.',
    'question-text': String($text.val()).trim().length >= 20 && String($text.val()).trim().length <= 1000 ? '' : 'Write 20–1000 characters.'
  }), function () {
    const text = S.reference() + '. ' + String($('#question-name').val()).trim() + ': ' + String($text.val()).trim() + ' Contact: ' + String($('#question-contact').val()).trim() + '. Question preview only. ' + S.demo;
    $form.trigger('reset'); S.message($('#question-confirmation'), text);
  });
  filter(); update();
});
