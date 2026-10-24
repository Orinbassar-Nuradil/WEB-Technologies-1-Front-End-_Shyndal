'use strict';
(() => {
  const S = window.Shindal;
  const B = window.ShindalBooking;
  const grid = document.querySelector('#main .row.row-cols-1');
  if (!grid) return;

  const controls = S.el('section', '', 'soft-card p-3 p-md-4 mb-4');
  const fields = S.el('div', '', 'row g-3');
  controls.append(fields);
  const column = (classes) => {
    const node = S.el('div', '', classes);
    fields.append(node);
    return node;
  };
  const search = S.field(
    column('col-12 col-lg-6'),
    'specialist-search',
    'Search name, service or education',
  );
  const branch = S.select(
    column('col-6 col-lg-3'),
    'specialist-branch',
    'Branch',
    [
      ['', 'All branches'],
      ...window.ShindalBranches.map((item) => [item.id, item.name]),
    ],
  );
  const serviceFilter = S.select(
    column('col-6 col-lg-3'),
    'specialist-service',
    'Service',
    [['', 'All services'], ...S.services.map((item) => [item.id, item.name])],
  );
  const notice = S.el(
    'p',
    'Illustrative profiles: names, ages, education, certificates and experience below are fictional classroom examples, not verified clinician credentials.',
    'small text-muted mb-3',
  );
  const count = S.el('p', '', 'mb-3');
  count.setAttribute('aria-live', 'polite');
  controls.append(notice, count);
  grid.before(controls);

  const rows = window.ShindalStaffProfiles.map((profile) => ({
    ...profile,
    service: S.findService(profile.serviceId),
    name: B.roster(profile.branch, profile.serviceId)[0],
    branchName: window.ShindalBranches.find(
      (item) => item.id === profile.branch,
    ).name,
  }));
  const renderSpecialist = (row) => {
    const col = S.el('div', '', 'col');
    const card = S.el('article', '', 'card soft-card h-100 p-4');
    const photo = S.el('img', '', 'rounded-circle mx-auto d-block mb-3');
    photo.src = 'images/specialist-avatar.png';
    photo.alt = `Placeholder portrait for ${row.name}`;
    photo.width = 112;
    photo.height = 112;
    photo.loading = 'lazy';
    const heading = S.el('header', '', 'text-center mb-3');
    heading.append(
      S.el('h3', row.name, 'h5 mb-2'),
      S.el('p', row.service.name, 'mb-2 text-primary'),
      S.el('p', `${row.branchName} branch`, 'mb-2'),
      S.el('span', 'Sample profile', 'badge rounded-pill bg-light text-muted'),
    );
    const facts = S.el(
      'div',
      '',
      'd-flex justify-content-center gap-4 border-top border-bottom py-3 mb-3',
    );
    const age = S.el('div', '', 'text-center');
    age.append(
      S.el('p', String(row.age), 'h4 mb-1'),
      S.el('p', 'years old', 'small text-muted mb-0'),
    );
    const experience = S.el('div', '', 'text-center');
    experience.append(
      S.el('p', String(row.experienceYears), 'h4 mb-1'),
      S.el('p', 'years of experience', 'small text-muted mb-0'),
    );
    facts.append(age, experience);
    const qualifications = S.el('dl', '', 'mb-3');
    qualifications.append(
      S.el('dt', 'Education', 'mb-1'),
      S.el('dd', row.education, 'text-muted mb-3 text-break'),
      S.el('dt', 'Certificate', 'mb-1'),
      S.el('dd', row.certificate, 'text-muted mb-0 text-break'),
    );
    const link = S.el(
      'a',
      'Choose service and request',
      'btn btn-outline-brand mt-auto',
    );
    link.href = `booking.html?service=${encodeURIComponent(row.service.id)}`;
    card.append(
      photo,
      heading,
      facts,
      qualifications,
      S.el('p', row.description, 'mb-4'),
      link,
    );
    col.append(card);
    return col;
  };
  const update = () => {
    const query = search.value.trim().toLowerCase();
    const filtered = rows.filter(
      (row) =>
        (!branch.value || row.branch === branch.value) &&
        (!serviceFilter.value || row.serviceId === serviceFilter.value) &&
        `${row.name} ${row.service.name} ${row.education}`
          .toLowerCase()
          .includes(query),
    );
    count.textContent = `${filtered.length} specialists found`;
    S.render(
      grid,
      filtered,
      renderSpecialist,
      'No matching specialists. Change your choices or reset your search.',
    );
  };
  search.addEventListener('input', update);
  branch.addEventListener('change', update);
  serviceFilter.addEventListener('change', update);
  controls.append(
    S.button('Reset search', () => {
      search.value = '';
      branch.value = '';
      serviceFilter.value = '';
      [branch, serviceFilter].forEach((input) =>
        input.classList.remove('selected'),
      );
      update();
    }),
  );

  const prices = S.byId('price-table');
  prices.classList.add('soft-card', 'p-3', 'p-md-4');
  prices.querySelector('h2').classList.add('h3', 'mb-4');
  const table = prices.querySelector('table');
  table.classList.remove('table-bordered');
  table.classList.add('table-hover', 'mb-0');
  table.querySelector('thead').classList.add('table-light');
  table
    .querySelectorAll('thead th')
    .forEach((cell) => cell.classList.add('text-primary', 'py-3'));
  table.querySelector('caption').classList.add('small', 'pt-3');
  S.render(table.querySelector('tbody'), S.services, (item) => {
    const row = S.el('tr');
    const title = S.el('th', item.name, 'fw-medium py-3');
    title.scope = 'row';
    const duration = S.el('td', '', 'text-nowrap py-3');
    duration.append(
      S.el('span', `${item.minutes} min`, 'badge bg-light text-dark fw-normal'),
    );
    row.append(
      title,
      duration,
      S.el(
        'td',
        S.money(item.price),
        'fw-semibold text-primary text-nowrap py-3',
      ),
    );
    return row;
  });
  prices.querySelector('a.btn').classList.add('mt-3');
  document.querySelectorAll('#main h2').forEach((title) => {
    if (title.textContent.trim() === 'Work schedule') {
      title.nextElementSibling.replaceChildren(
        S.el('li', 'Monday–Friday: 08:00–13:00, 14:00–19:00'),
        S.el('li', 'Saturday: 08:00–13:00'),
        S.el('li', 'Sunday: closed'),
      );
    }
  });
  update();
})();
