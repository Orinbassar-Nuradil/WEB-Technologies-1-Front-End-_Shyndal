'use strict';
// main.js — plain JavaScript, loaded on every page.
// Two visitor questions are answered here: "Are you open right now?" and "Do you offer X?".

document.addEventListener('DOMContentLoaded', function () {
  const footer = document.getElementById('site-footer');
  if (!footer) return;
  const container = footer.querySelector('.container');

  // 1) Opening status — built from the HOURS object in data.js and refreshed every minute.
  const status = createEl('p', '', 'small fw-semibold mb-2');
  status.id = 'open-status';
  status.setAttribute('role', 'status');
  container.prepend(status);

  function refreshStatus() {
    const result = getOpenStatus(new Date());
    status.textContent = result.text;
    // The state classes that already exist in the stylesheet are switched on and off.
    status.classList.toggle('success', result.state === 'open');
    status.classList.toggle('error', result.state === 'closed-hours' || result.state === 'closed-day');
    status.classList.toggle('highlight', result.state === 'appointment');
  }
  refreshStatus();
  setInterval(refreshStatus, 60000);

  // 2) Service search — the visitor types a word and lands on the filtered catalogue.
  const form = createEl('form', '', 'd-flex flex-wrap align-items-end gap-2 mb-3');
  const wrap = createEl('div', '', 'mb-0');
  const label = createEl('label', 'Find a service', 'form-label');
  label.htmlFor = 'site-search';
  const input = createEl('input', '', 'form-control');
  input.id = 'site-search';
  input.type = 'search';
  input.placeholder = 'For example: speech';
  const error = createEl('p', '', 'error-message hidden w-100 mb-0');
  const button = createEl('button', 'Search services', 'btn btn-outline-brand');
  button.type = 'submit';
  wrap.append(label, input);
  form.append(wrap, button, error);
  container.prepend(form);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const query = input.value.trim();
    if (query === '') {
      error.textContent = 'Type a service name first, for example “speech” or “ABA”.';
      error.classList.remove('hidden');
      input.classList.add('error');
      input.focus();
      return;
    }
    window.location.href = 'services.html?q=' + encodeURIComponent(query);
  });
  input.addEventListener('input', function () {
    error.classList.add('hidden');
    input.classList.remove('error');
  });
});
