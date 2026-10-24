'use strict';
(() => {
  const S = window.Shindal;
  const heading = S.byId('main').querySelector('h1');
  const header =
    heading.closest('.row') ||
    heading.closest('section') ||
    heading.parentElement;
  // Insert the next-step section after the whole intro row, never between its columns.
  const introImage = header.querySelector('img');
  if (introImage) {
    header.classList.add('align-items-center');
    introImage.classList.add('img-fluid', 'rounded-4', 'shadow-sm', 'w-100');
  }
  const choices = S.el('section', '', 'soft-card p-4 mb-4');
  choices.append(
    S.el('h2', 'Find the right next step', 'h4'),
    S.el('p', 'Choose what you need to see a useful next action.'),
  );
  const goal = S.select(choices, 'visitor-goal', 'How can we help?', [
    ['', 'Choose a goal'],
    ['services', 'Compare services and prices'],
    ['staff', 'Find a specialist'],
    ['contact', 'Find my nearest branch'],
  ]);
  const result = S.el('p', 'Choose an option above.');
  result.setAttribute('aria-live', 'polite');
  const link = S.el('a', '', 'btn btn-brand hidden');
  choices.append(result, link);
  header.after(choices);
  const paths = {
    services: [
      'Explore the service catalogue, filter it and calculate a session estimate.',
      'services.html',
      'Compare services',
    ],
    staff: [
      'Select a branch and see its demonstration specialist roster.',
      'specialists.html',
      'Meet specialists',
    ],
    contact: [
      'Find addresses and call or write to the appropriate branch.',
      'help.html',
      'Find a branch',
    ],
  };
  goal.addEventListener('change', () => {
    const item = paths[goal.value];
    result.textContent = item ? item[0] : 'Choose an option above.';
    link.classList.toggle('hidden', !item);
    if (item) {
      link.href = item[1];
      link.textContent = item[2];
    }
  });
})();
