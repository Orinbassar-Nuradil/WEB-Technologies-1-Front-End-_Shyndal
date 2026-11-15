'use strict';
// services.js — plain JavaScript. The catalogue and the estimate are built from the SERVICES array in data.js.
// Visitor questions: "Which service fits my budget?" and "How much will several sessions cost?"
// Added since the last defended version: price filter built from the data, total time of the estimate,
// a "Book" link per estimate line that carries the number of sessions into the booking form.

document.addEventListener('DOMContentLoaded', function () {
  const main = document.getElementById('main');
  const grid = main.querySelector('.row.row-cols-1');
  grid.id = 'services-grid';
  let cart = storageRead('cart', []).filter(function (row) {
    return findService(row.id) && Number.isInteger(row.quantity) && row.quantity >= 1 && row.quantity <= MAX_SESSIONS;
  });

  // ---------- filter panel (built in code, inserted above the grid) ----------
  const panel = createEl('form', '', 'soft-card mb-4');
  panel.id = 'service-filters';
  panel.setAttribute('aria-label', 'Filter services');
  const row = createEl('div', '', 'service-filter-fields');
  panel.append(row);

  function addControl(id, labelText, control) {
    const col = createEl('div');
    const label = createEl('label', labelText, 'form-label');
    label.htmlFor = id;
    control.id = id;
    col.append(label, control);
    row.append(col);
    return control;
  }
  function makeSelect(options) {
    const select = createEl('select', '', 'form-select');
    for (const option of options) {
      const item = createEl('option', option.text);
      item.value = option.value;
      select.append(item);
    }
    return select;
  }

  const searchInput = createEl('input', '', 'form-control');
  searchInput.type = 'search';
  searchInput.placeholder = 'e.g. Speech therapy';
  searchInput.value = new URLSearchParams(window.location.search).get('q') || '';
  addControl('service-search', 'Search services', searchInput);

  const categories = [];
  for (const service of SERVICES) if (!categories.includes(service.category)) categories.push(service.category);
  const categorySelect = addControl('service-category', 'Category', makeSelect([{value: '', text: 'All categories'}].concat(categories.map(function (name) { return {value: name, text: name}; }))));

  // Price steps come from the real prices in the data: 6 000, 7 000, 10 000.
  const prices = SERVICES.map(function (service) { return service.price; }).filter(function (price, index, list) { return list.indexOf(price) === index; }).sort(function (a, b) { return a - b; });
  const priceSelect = addControl('service-price', 'Price per session', makeSelect([{value: '', text: 'Any price'}].concat(prices.map(function (price) { return {value: String(price), text: 'Up to ' + formatMoney(price)}; }))));

  const sortGroup = createEl('div', '', 'service-sort');
  sortGroup.id = 'service-sort';
  sortGroup.setAttribute('role', 'radiogroup');
  sortGroup.setAttribute('aria-labelledby', 'service-sort-label');
  const sortLabel = createEl('span', 'Sort by');
  sortLabel.id = 'service-sort-label';
  const choices = createEl('div', '', 'service-sort-choices');
  for (const [value, title] of [['name', 'Name A–Z'], ['price', 'Lowest price']]) {
    const input = createEl('input', '', 'btn-check');
    input.type = 'radio';
    input.name = 'service-order';
    input.id = 'sort-' + value;
    input.value = value;
    input.defaultChecked = value === 'name';
    const label = createEl('label', title);
    label.htmlFor = input.id;
    choices.append(input, label);
  }
  sortGroup.append(sortLabel, choices);

  const footerRow = createEl('div', '', 'service-filter-footer');
  const results = createEl('div', '', 'service-filter-results');
  const count = createEl('p', '', 'mb-0');
  count.id = 'service-count';
  count.setAttribute('aria-live', 'polite');
  const resetButton = createEl('button', 'Reset filters', 'filter-reset');
  resetButton.type = 'button';
  results.append(count, resetButton);
  footerRow.append(results, sortGroup);
  panel.append(footerRow);
  grid.before(panel);

  // ---------- catalogue ----------
  function buildCard(service) {
    const column = createEl('div', '', 'col');
    column.id = service.id;
    column.dataset.service = service.id;
    const card = createEl('article', '', 'card h-100 soft-card');
    const image = createEl('img', '', 'card-img-top');
    image.src = service.image;
    image.alt = service.name + ' session';
    const body = createEl('div', '', 'card-body');
    body.append(createEl('h2', service.name, 'h5'), createEl('p', service.description), createEl('p', service.minutes + ' min · ' + formatMoney(service.price), 'fw-bold mb-0'));
    const footer = createEl('div', '', 'card-footer bg-transparent border-0 pb-3 d-flex flex-wrap gap-2');
    const bookLink = createEl('a', 'Book this service', 'btn btn-brand btn-sm');
    bookLink.href = 'booking.html?service=' + service.id;
    const addButton = createEl('button', 'Add to estimate', 'btn btn-outline-brand btn-sm');
    addButton.type = 'button';
    addButton.dataset.addService = service.id;
    footer.append(bookLink, addButton);
    card.append(image, body, footer);
    column.append(card);
    return column;
  }

  // Returns the services that pass the three filters, in the chosen order.
  function filterServices(query, category, maxPrice, sortBy) {
    const found = SERVICES.filter(function (service) {
      const text = (service.name + ' ' + service.description + ' ' + service.role).toLowerCase();
      if (query && !text.includes(query.toLowerCase())) return false;
      if (category && service.category !== category) return false;
      if (maxPrice && service.price > Number(maxPrice)) return false;
      return true;
    });
    found.sort(function (a, b) { return sortBy === 'price' ? a.price - b.price || a.name.localeCompare(b.name) : a.name.localeCompare(b.name); });
    return found;
  }

  function drawCatalogue() {
    const found = filterServices(searchInput.value.trim(), categorySelect.value, priceSelect.value, panel.elements['service-order'].value);
    renderList(grid, found, buildCard, 'No services match these filters. Change the search or press “Reset filters”.');
    count.textContent = pluralize(found.length, 'service', 'services') + ' found';
    const wanted = window.location.hash.slice(1);
    const chosen = grid.querySelector('[data-service="' + wanted + '"]');
    if (chosen) chosen.classList.add('selected');
    return chosen;
  }

  // ---------- estimate panel ----------
  const estimate = createEl('section', '', 'soft-card p-4 mb-4');
  estimate.id = 'estimate-panel';
  const estimateTitle = createEl('h2', 'Session estimate', 'h4');
  const estimateNote = createEl('p', 'Add services with the buttons above to see the total. Every session is individual; the real date and price are confirmed by the center.', 'small text-muted');
  const estimateList = createEl('div', '');
  estimateList.id = 'estimate-list';
  const estimateTotal = createEl('p', '', 'fw-bold mb-2');
  estimateTotal.id = 'estimate-total';
  estimateTotal.setAttribute('aria-live', 'polite');
  const estimateStatus = createEl('p', '', 'small mb-2 hidden');
  estimateStatus.setAttribute('role', 'status');
  const clearButton = createEl('button', 'Clear estimate', 'btn btn-outline-brand btn-sm');
  clearButton.type = 'button';
  estimate.append(estimateTitle, estimateNote, estimateList, estimateTotal, estimateStatus, clearButton);
  grid.after(estimate);

  function buildLine(line) {
    const service = findService(line.id);
    const item = createEl('div', '', 'd-flex flex-wrap gap-2 align-items-center mb-2');
    item.dataset.line = line.id;
    item.append(createEl('span', service.name + ': ' + line.quantity + ' × ' + formatMoney(service.price) + ' = ' + formatMoney(service.price * line.quantity), 'me-2'));
    const actions = [['decrease', '−'], ['increase', '+'], ['remove', 'Remove']];
    for (const action of actions) {
      const button = createEl('button', action[1], 'btn btn-outline-brand btn-sm');
      button.type = 'button';
      button.dataset.cartAction = action[0];
      button.setAttribute('aria-label', action[1] === '−' ? 'One session less of ' + service.name : action[1] === '+' ? 'One session more of ' + service.name : 'Remove ' + service.name);
      item.append(button);
    }
    const book = createEl('a', 'Book these sessions', 'btn btn-brand btn-sm');
    book.href = 'booking.html?service=' + line.id + '&sessions=' + line.quantity;
    item.append(book);
    return item;
  }

  function note(text) {
    showMessage(estimateStatus, text);
  }

  function drawEstimate() {
    storageSave('cart', cart);
    hideMessage(estimateStatus);
    renderList(estimateList, cart, buildLine, 'Your estimate is empty. Press “Add to estimate” on a service.', 'text-muted');
    const sessions = countSessions(cart);
    estimateTotal.textContent = cart.length === 0 ? 'Total: 0 ₸' : pluralize(sessions, 'session', 'sessions') + ' · ' + formatMinutes(calcMinutes(cart)) + ' in total · Total ' + formatMoney(calcTotal(cart));
    clearButton.disabled = cart.length === 0;
  }

  function changeQuantity(id, change) {
    const line = cart.find(function (item) { return item.id === id; });
    if (!line) {
      if (change > 0) cart.push({id: id, quantity: 1});
    } else if (line.quantity + change > MAX_SESSIONS) {
      note('The maximum is ' + MAX_SESSIONS + ' sessions per service.');
      return false;
    } else {
      line.quantity += change;
      if (line.quantity < 1) cart = cart.filter(function (item) { return item.id !== id; });
    }
    drawEstimate();
    return true;
  }

  // ---------- events ----------
  // Delegation: the cards are destroyed and rebuilt after every filter change, so one handler sits on the
  // grid (which never disappears) and uses event.target to find which "Add" button was pressed.
  grid.addEventListener('click', function (event) {
    const button = event.target.closest('[data-add-service]');
    if (!button) return;
    const id = button.dataset.addService;
    if (changeQuantity(id, 1)) note(findService(id).name + ' added to the estimate.');
  });
  estimateList.addEventListener('click', function (event) {
    const button = event.target.closest('[data-cart-action]');
    if (!button) return;
    const id = button.closest('[data-line]').dataset.line;
    const action = button.dataset.cartAction;
    if (action === 'remove') {
      cart = cart.filter(function (item) { return item.id !== id; });
      drawEstimate();
    } else {
      changeQuantity(id, action === 'increase' ? 1 : -1);
    }
  });
  clearButton.addEventListener('click', function () {
    cart = [];
    drawEstimate();
    note('The estimate is empty again.');
  });
  searchInput.addEventListener('input', drawCatalogue);
  categorySelect.addEventListener('change', drawCatalogue);
  priceSelect.addEventListener('change', drawCatalogue);
  sortGroup.addEventListener('change', drawCatalogue);
  panel.addEventListener('submit', function (event) { event.preventDefault(); }); // Enter in the search box must not reload the page
  resetButton.addEventListener('click', function () {
    searchInput.value = '';
    categorySelect.value = '';
    priceSelect.value = '';
    panel.elements['service-order'].value = 'name';
    drawCatalogue();
  });

  const chosen = drawCatalogue();
  drawEstimate();
  if (chosen) chosen.scrollIntoView({block: 'center'});
});
