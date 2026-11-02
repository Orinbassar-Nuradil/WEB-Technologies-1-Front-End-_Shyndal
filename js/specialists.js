'use strict';
$(function () {
  const S = window.Shindal;
  const $grid = $('#main .row.row-cols-1').first();
  if (!$grid.length) return;
  const $rows = $grid.children();
  const $controls = S.make('section', '', 'soft-card p-3 mb-3').insertBefore($grid);
  const $search = S.field($controls, 'specialist-search', 'Search specialist name or role', 'search');
  const $count = S.make('p').attr({'aria-live': 'polite', id: 'specialist-count'}).appendTo($controls);
  const $empty = S.make('p', 'No matching specialists. Reset your search.', 'hidden').insertAfter($grid);
  const update = () => {
    let count = 0;
    $rows.each(function () {
      const match = $(this).text().toLowerCase().includes(String($search.val()).trim().toLowerCase());
      $(this).toggleClass('hidden', !match); if (match) count += 1;
    });
    $count.text(count + ' specialist roles found'); $empty.toggleClass('hidden', count !== 0);
  };
  $search.on('input', update);
  $controls.append(S.button('Reset search', function () { $search.val(''); update(); }));
  const roles = {'Speech therapist': 'speech', 'Special education teacher': 'defectology', Psychologist: 'psychology', 'AFE specialist': 'afe', 'ABA therapist': 'aba', 'Sensory integration specialist': 'sensory', Neurologist: 'neurology', Neuropsychologist: 'neuropsychology'};
  $rows.each(function () {
    const $row = $(this);
    const item = S.findService(roles[$row.find('h3').text().trim()]);
    S.make('a', 'Choose service and request', 'btn btn-outline-brand btn-sm mt-3').attr('href', 'booking.html' + (item ? '?service=' + item.id : '')).appendTo($row.find('.card'));
  });
  update();
});
