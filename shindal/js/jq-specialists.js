'use strict';
// jq-specialists.js — jQuery. Visitor questions: "Who works with my child's need?" and "Which service is cheapest?"
// Added since the last defended version: filter by service (built from the SERVICES array), a booking link on
// every team card, and a price table that sorts when the visitor clicks a column header.

$(function () {
  const $grid = $('#main .row.row-cols-1.row-cols-md-2.row-cols-lg-3').first();
  const $cards = $grid.children('.col');

  // ---------- filter panel ----------
  const $panel = jqEl('div', '', 'soft-card specialist-filters mb-4');
  const $search = $('<input>').addClass('form-control').attr({id: 'specialist-search', type: 'search', placeholder: 'Name or role'});
  const $service = $('<select>').addClass('form-select').attr('id', 'specialist-service').append($('<option>').val('').text('All services'));
  $.each(SERVICES, function (index, service) { $service.append($('<option>').val(service.id).text(service.name)); });
  const $count = jqEl('p', '', 'mb-0 fw-semibold').attr({id: 'specialist-count', 'aria-live': 'polite'});
  const $reset = jqEl('button', 'Reset', 'btn btn-outline-brand btn-sm').attr('type', 'button');
  $('<div>').append($('<label>').addClass('form-label').attr('for', 'specialist-search').text('Search specialists'), $search).appendTo($panel);
  $('<div>').append($('<label>').addClass('form-label').attr('for', 'specialist-service').text('Works with service'), $service).appendTo($panel);
  $('<div>').addClass('specialist-filter-actions').append($count, $reset).appendTo($panel);
  $grid.before($panel);
  const $empty = jqEl('p', 'No specialist matches. Change the search or press “Reset”.', 'text-muted hidden').attr('id', 'specialist-empty').insertAfter($grid);

  // A booking link on every card; the role in the card heading tells which service it belongs to.
  $cards.each(function () {
    const $card = $(this);
    const role = $card.find('h3').text().trim();
    const service = SERVICES.find(function (item) { return item.role === role; });
    $card.attr('data-service', service ? service.id : '');
    $('<a>').addClass('btn btn-outline-brand btn-sm mt-3').text(service ? 'Book ' + service.name : 'Book a session')
      .attr('href', 'booking.html' + (service ? '?service=' + service.id : '')).appendTo($card.children('.card'));
  });

  function filter() {
    const word = jqValue($search).toLowerCase();
    const wanted = $service.val();
    $cards.each(function () {
      const $card = $(this);
      const match = (word === '' || $card.text().toLowerCase().indexOf(word) !== -1) && (wanted === '' || $card.attr('data-service') === wanted);
      $card.toggleClass('hidden', !match);
    });
    const shown = $cards.not('.hidden').length;
    $count.text(shown + (shown === 1 ? ' role' : ' roles') + ' shown');
    $empty.toggleClass('hidden', shown > 0);
  }
  $search.on('input', filter);
  $service.on('change', filter);
  $reset.on('click', function () { $search.val(''); $service.val(''); filter(); });
  filter();

  // ---------- price table: click a column header to sort ----------
  const $table = $('#price-table table');
  const $body = $table.children('tbody');
  const priceOf = function ($row) { return parseInt($row.children('td').last().text().replace(/\D/g, ''), 10); };
  const nameOf = function ($row) { return $row.children('th').text().trim(); };
  const $headers = $table.find('th[data-sort]');
  $headers.each(function () {
    const $header = $(this);
    const label = $header.text().trim();
    const $button = jqEl('button', label, 'price-sort').attr({type: 'button', 'aria-label': 'Sort by ' + label.toLowerCase()});
    $button.append(jqEl('span', '', 'sort-arrows').attr('aria-hidden', 'true'));
    $header.empty().append($button);
  });
  $table.on('click', '.price-sort', function () {
    const $header = $(this).closest('th');
    const key = $header.attr('data-sort');
    const direction = $header.attr('aria-sort') === 'ascending' ? -1 : 1;
    $headers.removeAttr('aria-sort');
    $header.attr('aria-sort', direction === 1 ? 'ascending' : 'descending');
    const rows = $body.children('tr').get().sort(function (a, b) {
      const first = $(a);
      const second = $(b);
      return direction * (key === 'price' ? priceOf(first) - priceOf(second) || nameOf(first).localeCompare(nameOf(second)) : nameOf(first).localeCompare(nameOf(second)));
    });
    $body.append(rows);
  });
});
