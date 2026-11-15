'use strict';
document.addEventListener('DOMContentLoaded', function () {
  const main = document.getElementById('main');
  const grid = main.querySelector('.row.row-cols-1');
  grid.id = 'services-grid';

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
    footer.append(bookLink);
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
  if (chosen) chosen.scrollIntoView({block: 'center'});
});
