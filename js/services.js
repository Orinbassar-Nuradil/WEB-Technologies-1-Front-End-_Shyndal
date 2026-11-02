'use strict';
$(function () {
  const S = window.Shindal;
  // REWRITE 2: $('<article>'), .append and .empty replace createElement/append/replaceChildren.
  // One reusable card builder is clearer; the filter and price arithmetic remain ordinary JavaScript.
  const $grid = $('#main').children('.row').first().attr('id', 'services-grid');
  const $controls = S.make('section', '', 'soft-card p-3 mb-4').attr('id', 'service-filters').insertBefore($grid);
  const $search = S.field($controls, 'service-search', 'Search services', 'search').val(new URLSearchParams(location.search).get('q') || '');
  const $category = S.select($controls, 'category', 'Category', [['', 'All categories'], ['Development', 'Development'], ['Consultation', 'Consultation']]);
  const $sort = S.select($controls, 'sort', 'Sort', [['name', 'Name'], ['price', 'Price: low to high']]);
  const $count = S.make('p').attr({'aria-live': 'polite', id: 'service-count'}).appendTo($controls);
  const card = item => {
    const $column = S.make('div', '', 'col').attr({id: item.id, 'data-service': item.id});
    const $card = S.make('article', '', 'card h-100 soft-card');
    const $body = S.make('div', '', 'card-body').append(S.make('h2', item.name, 'h5'), S.make('p', item.description), S.make('p', item.minutes + ' min · ' + S.money(item.price)));
    const $footer = S.make('div', '', 'card-footer bg-transparent d-flex flex-wrap gap-2').append(
      S.make('a', 'Book this service', 'btn btn-brand btn-sm').attr('href', 'booking.html?service=' + item.id),
      S.button('Add to estimate').attr('data-add-service', item.id)
    );
    $card.append(S.make('img', '', 'card-img-top').attr({src: item.image, alt: item.name}), $body, $footer).appendTo($column);
    return $column;
  };
  const update = () => {
    const query = String($search.val()).trim().toLowerCase();
    const matches = S.services.filter(item => (!$category.val() || item.category === $category.val()) && (item.name + ' ' + item.description).toLowerCase().includes(query));
    matches.sort((a, b) => $sort.val() === 'price' ? a.price - b.price : a.name.localeCompare(b.name));
    $count.text(matches.length + ' services found');
    S.render($grid, matches, card);
    const hash = location.hash.slice(1);
    $grid.children('[data-service]').each(function () { $(this).toggleClass('selected', $(this).attr('data-service') === hash); });
  };
  $controls.append(S.button('Reset filters', function () { $search.val(''); $category.val(''); $sort.val('name'); update(); }));
  $controls.on('input change', 'input, select', update);
  // Useful effect 3: collapse a filter panel so visitors can inspect more services on small screens.
  const $toggle = S.button('Hide filters').attr({'aria-controls': 'service-filters', 'aria-expanded': 'true'}).insertBefore($controls);
  $toggle.on('click', function () {
    $controls.stop(true, true).slideToggle(180, function () {
      const open = $(this).is(':visible');
      $toggle.text(open ? 'Hide filters' : 'Show filters').attr('aria-expanded', String(open));
    });
  });
  const $panel = S.make('section', '', 'soft-card p-4 mb-4').attr('id', 'estimate-panel').insertAfter($grid);
  $panel.append(S.make('h2', 'Session estimate', 'h4'));
  // .html is appropriate ONLY for this fixed trusted markup. All data/user input uses .text instead.
  $panel.append(S.make('p').html('<strong>Estimate only.</strong> Sessions are individual. Agree on real dates and prices directly with the center.'));
  const $list = S.make('div').attr('id', 'estimate-list').appendTo($panel);
  const $amount = S.make('p').attr({'aria-live': 'polite', id: 'estimate-total'}).appendTo($panel);
  const $status = S.make('p').attr({id: 'estimate-confirmation', 'aria-live': 'polite'});
  let cart = S.rows('cart').filter(row => S.findService(row.id) && Number.isInteger(row.quantity) && row.quantity >= 1 && row.quantity <= 20);
  const $checkout = S.button('Demonstrate estimate', function () {
    if (!cart.length) return;
    S.message($status, S.reference() + ': ' + cart.map(row => S.findService(row.id).name + ' × ' + row.quantity).join('; ') + '. Total ' + S.money(S.total(cart)) + '. ' + S.demo);
  }).attr('id', 'estimate-checkout');
  const draw = () => {
    S.save('cart', cart);
    $status.stop(true, true).addClass('hidden').empty();
    S.render($list, cart, row => {
      const item = S.findService(row.id);
      const $line = S.make('div', '', 'd-flex flex-wrap gap-2 align-items-center mb-3').attr('data-line', row.id);
      $line.append(S.make('span', item.name + ': ' + row.quantity + ' × ' + S.money(item.price) + ' = ' + S.money(item.price * row.quantity)));
      [['decrease', '− '], ['increase', '+ '], ['remove', 'Remove ']].forEach(([action, label]) => $line.append(S.button(label + item.name).attr('data-cart-action', action)));
      return $line;
    }, 'Your estimate is empty. Add a service above.');
    $amount.text(cart.reduce((sum, row) => sum + row.quantity, 0) + ' sessions · Total ' + S.money(S.total(cart)));
    $checkout.prop('disabled', cart.length === 0);
  };
  // Delegation: #main exists at binding time. Cards and their buttons are built/rebuilt afterwards;
  // binding directly to the current buttons would miss replacement cards after filtering.
  $('#main').on('click.catalogue', '[data-add-service]', function () {
    const id = $(this).closest('[data-service]').attr('data-service');
    const row = cart.find(item => item.id === id);
    if (row && row.quantity >= 20) { S.message($status, 'Maximum 20 sessions per service.'); return; }
    if (row) row.quantity += 1;
    else cart.push({id, quantity: 1});
    draw(); S.message($status, S.findService(id).name + ' added. Review your estimate below.');
  });
  $list.on('click.cart', '[data-cart-action]', function () {
    const $button = $(this);
    const id = $button.closest('[data-line]').attr('data-line');
    const row = cart.find(item => item.id === id);
    if (!row) return;
    const action = $button.attr('data-cart-action');
    if (action === 'remove') cart = cart.filter(item => item.id !== id);
    else if (action === 'increase' && row.quantity === 20) { S.message($status, 'Maximum 20 sessions per service.'); return; }
    else { row.quantity += action === 'increase' ? 1 : -1; cart = cart.filter(item => item.quantity > 0); }
    draw(); S.message($status, 'Estimate updated.');
  });
  $panel.append($checkout, S.button('Clear estimate', function () { cart = []; draw(); S.message($status, 'Estimate cleared.'); }), $status);
  update(); draw();
});
