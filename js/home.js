'use strict';
(() => {
  const S = window.Shindal,
    main = S.byId('main');
  const stats = main.querySelector('[aria-label="Shindal in numbers"]');
  const hero = main.querySelector('.hero');
  if (stats && hero) hero.after(stats);
  const benefits = main.querySelector('[aria-label="Why Shindal"]');
  const services = S.byId('services');
  if (benefits && services) services.after(benefits);
  // Render the same organization services from the common array instead of independent copies.
  const grid = services.querySelector('.row');
  S.render(grid, S.services, (item) => {
    const col = S.el('div', '', 'col');
    const link = S.el('a', '', 'card service-card h-100 text-decoration-none');
    link.href = `services.html#${item.id}`;
    const image = S.el('img', '', 'card-img-top');
    image.src = item.image;
    image.alt = `${item.name} at Shindal`;
    image.loading = 'lazy';
    const body = S.el(
      'div',
      '',
      'card-body d-flex justify-content-between align-items-center gap-2',
    );
    const arrow = S.el('span', '→', 'arrow');
    arrow.setAttribute('aria-hidden', 'true');
    body.append(S.el('h3', item.name, 'h6 mb-0'), arrow);
    link.append(image, body);
    col.append(link);
    return col;
  });
})();
