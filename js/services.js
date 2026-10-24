'use strict';
(() => {
  const S = window.Shindal;
  const grid = document.querySelector('#main > .row');
  const controls = S.el('section', '', 'soft-card p-3 mb-4');
  grid.before(controls);
  const search = S.field(controls, 'service-search', 'Search services');
  search.value = new URLSearchParams(location.search).get('q') || '';
  const category = S.select(controls, 'category', 'Category', [
    ['', 'All categories'],
    ['Development', 'Development'],
    ['Consultation', 'Consultation'],
  ]);
  const sort = S.select(controls, 'sort', 'Sort', [
    ['name', 'Name'],
    ['price', 'Price: low to high'],
  ]);
  const count = S.el('p');
  count.setAttribute('aria-live', 'polite');
  controls.append(count);
  const update = () => {
    const matches = S.services.filter(
      (item) =>
        (category.value === '' || item.category === category.value) &&
        `${item.name} ${item.description}`
          .toLowerCase()
          .includes(search.value.trim().toLowerCase()),
    );
    matches.sort((a, b) =>
      sort.value === 'price' ? a.price - b.price : a.name.localeCompare(b.name),
    );
    count.textContent = `${matches.length} services found`;
    S.render(grid, matches, (item) => {
      const col = S.el('div', '', 'col');
      col.id = item.id;
      const card = S.el('article', '', 'card h-100 soft-card');
      const image = S.el('img', '', 'card-img-top');
      image.src = item.image;
      image.alt = item.name;
      const body = S.el('div', '', 'card-body');
      body.append(
        S.el('h2', item.name, 'h5'),
        S.el('p', item.description),
        S.el('p', `${item.minutes} min · ${S.money(item.price)}`),
      );
      const link = S.el('a', 'Book this service', 'btn btn-brand btn-sm');
      link.href = `booking.html?service=${item.id}`;
      const foot = S.el(
        'div',
        '',
        'card-footer bg-transparent d-flex flex-wrap gap-2',
      );
      foot.append(
        link,
        S.button('Add to estimate', () => add(item.id)),
      );
      card.append(image, body, foot);
      col.append(card);
      return col;
    });
  };
  controls.append(
    S.button('Reset filters', () => {
      search.value = '';
      category.value = '';
      sort.value = 'name';
      update();
    }),
  );
  search.addEventListener('input', update);
  [category, sort].forEach((input) => input.addEventListener('change', update));
  const panel = document.querySelector('.cta-band');
  panel.replaceChildren();
  panel.className = 'soft-card p-4 mb-4';
  grid.after(panel);
  panel.append(
    S.el('h2', 'Session estimate', 'h4'),
    S.el(
      'p',
      'Planning estimate only. Sessions are individual; actual scheduling is agreed directly with the center.',
    ),
  );
  const list = S.el('div');
  const amount = S.el('p');
  amount.setAttribute('aria-live', 'polite');
  const status = S.el('p');
  status.setAttribute('role', 'status');
  status.setAttribute('aria-live', 'polite');
  let cart = S.read('cart', []).filter(
    (row) =>
      S.findService(row.id) &&
      Number.isInteger(row.quantity) &&
      row.quantity > 0 &&
      row.quantity <= 20,
  );
  const checkout = S.button('Demonstrate estimate', () =>
    S.message(
      status,
      `${S.reference()}: ${cart.map((row) => `${S.findService(row.id).name} × ${row.quantity}`).join('; ')}. Total ${S.money(S.total(cart))}. ${S.demo}`,
    ),
  );
  const draw = () => {
    S.save('cart', cart);
    status.textContent = '';
    S.render(
      list,
      cart,
      (row) => {
        const item = S.findService(row.id);
        const line = S.el(
          'div',
          '',
          'd-flex flex-wrap gap-2 align-items-center mb-3',
        );
        line.append(
          S.el(
            'span',
            `${item.name}: ${row.quantity} × ${S.money(item.price)} = ${S.money(item.price * row.quantity)}`,
          ),
          S.button(`− ${item.name}`, () => change(row.id, -1)),
          S.button(`+ ${item.name}`, () => change(row.id, 1)),
          S.button(`Remove ${item.name}`, () => {
            cart = cart.filter((value) => value.id !== row.id);
            draw();
          }),
        );
        return line;
      },
      'Your estimate is empty. Add a service above.',
    );
    amount.textContent = `${cart.reduce((sum, row) => sum + row.quantity, 0)} sessions · Total ${S.money(S.total(cart))}`;
    checkout.disabled = cart.length === 0;
  };
  const change = (id, delta) => {
    const row = cart.find((item) => item.id === id);
    if (row.quantity + delta > 20) {
      S.message(status, 'Maximum 20 sessions per service.');
      return;
    }
    row.quantity += delta;
    cart = cart.filter((item) => item.quantity > 0);
    draw();
  };
  const add = (id) => {
    const row = cart.find((item) => item.id === id);
    if (row) {
      change(id, 1);
    } else {
      cart.push({ id, quantity: 1 });
      draw();
    }
    S.message(status, `${S.findService(id).name}: review your estimate below.`);
  };
  panel.append(
    list,
    amount,
    checkout,
    S.button('Clear estimate', () => {
      cart = [];
      draw();
      S.message(status, 'Estimate cleared.');
    }),
    status,
  );
  update();
  draw();
})();
