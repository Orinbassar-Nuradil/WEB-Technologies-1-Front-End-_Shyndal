'use strict';
// booking.js — plain JavaScript. The main form of the site: a parent asks for a visit to one branch.
// Two plans: a single session, or a monthly subscription (2 sessions a week for 4 weeks = 8 sessions,
// the day and time of every session is chosen by the visitor). The price is always session price × number of sessions.
// Both plans offer exact session times grouped by working period.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('booking-form');
  const serviceSelect = document.getElementById('service');
  const specialistSelect = document.getElementById('specialist');
  const dateInput = document.getElementById('visit-date');
  const dateLabel = document.querySelector('label[for="visit-date"]');
  const timeSelect = document.getElementById('visit-time');
  const timeColumn = document.getElementById('single-time-field');
  const confirmation = document.getElementById('booking-confirmation');
  const price = document.getElementById('booking-price');
  const summary = document.getElementById('booking-summary');

  // ---------- fields that are built from the data in data.js ----------
  // Services: every option comes from the SERVICES array (only the placeholder is written in the HTML).
  for (const service of SERVICES) {
    const option = createEl('option', service.name + ' (' + formatMoney(service.price) + ')');
    option.value = service.id;
    serviceSelect.append(option);
  }
  function fillTimeOptions(select) {
    const hint = createEl('option', 'Choose a time');
    hint.value = '';
    hint.disabled = true;
    hint.hidden = true;
    hint.defaultSelected = true;
    select.replaceChildren(hint);
    for (const period of SESSION_PERIODS) {
      const group = createEl('optgroup');
      group.label = period.name + ' · ' + clockText(period.start) + '–' + clockText(period.end);
      for (const slot of TIME_SLOTS.filter(function (item) { return item.period === period.id; })) {
        const option = createEl('option', slot.label);
        option.value = slot.id;
        group.append(option);
      }
      select.append(group);
    }
  }
  fillTimeOptions(timeSelect);
  // Branches: names come from BRANCHES, so the form and the About page can never disagree.
  for (const option of document.getElementById('branch').options) {
    option.textContent = findBranch(option.value).name;
  }

  const planSingle = document.getElementById('plan-single');
  const planMonthly = document.getElementById('plan-monthly');

  function isMonthly() {
    return planMonthly.checked;
  }
  function sessionCount() {
    return isMonthly() ? MONTHLY_SESSIONS : 1;
  }

  // The monthly block: for every week the visitor picks the day and the time of two sessions.
  const monthlyBlock = createEl('div', '', 'col-12 hidden');
  monthlyBlock.id = 'monthly-plan';
  monthlyBlock.append(createEl('p', 'Choose ' + SESSIONS_PER_WEEK + ' sessions each week for ' + WEEKS_IN_MONTH + ' weeks. Week 1 begins on the start date you select.', 'small text-muted mb-2'));
  const weekTitles = [];
  const weekInputs = []; // [{week, session, date, time}]
  for (let week = 1; week <= WEEKS_IN_MONTH; week++) {
    const box = createEl('fieldset', '', 'border rounded-3 p-3 mb-3');
    const title = createEl('legend', 'Week ' + week, 'h6 mb-2');
    weekTitles.push(title);
    const row = createEl('div', '', 'row g-3');
    for (let session = 1; session <= SESSIONS_PER_WEEK; session++) {
      const id = 'week' + week + '-session' + session;
      const dateColumn = createEl('div', '', 'col-sm-6');
      const dateLabelEl = createEl('label', 'Session ' + session + ' · Date *', 'form-label small');
      dateLabelEl.htmlFor = id + '-date';
      const dateField = createEl('input', '', 'form-control');
      dateField.type = 'date';
      dateField.id = id + '-date';
      dateField.name = id + '-date';
      dateColumn.append(dateLabelEl, dateField);
      const timeColumnEl = createEl('div', '', 'col-sm-6');
      const timeLabelEl = createEl('label', 'Session ' + session + ' · Time *', 'form-label small');
      timeLabelEl.htmlFor = id + '-time';
      const timeField = createEl('select', '', 'form-select');
      timeField.id = id + '-time';
      timeField.name = id + '-time';
      fillTimeOptions(timeField);
      timeColumnEl.append(timeLabelEl, timeField);
      row.append(dateColumn, timeColumnEl);
      weekInputs.push({week: week, session: session, date: dateField, time: timeField});
    }
    box.append(title, row);
    monthlyBlock.append(box);
  }
  timeColumn.after(monthlyBlock);

  // A hint under the date, filled by updateDateHint().
  const dateHint = createEl('p', '', 'small text-muted mb-0');
  dateHint.id = 'visit-date-hint';
  dateHint.setAttribute('aria-live', 'polite');
  dateInput.after(dateHint);

  dateInput.min = todayISO();

  // ---------- values from the link (services page: "Book this service") ----------
  const params = new URLSearchParams(window.location.search);
  if (findService(params.get('service'))) serviceSelect.value = params.get('service');
  if (params.get('plan') === 'monthly' || Number(params.get('sessions')) === MONTHLY_SESSIONS) planMonthly.checked = true;
  if (findBranch(params.get('branch'))) document.getElementById('branch').value = params.get('branch');

  // ---------- helpers ----------
  function shortDate(iso) {
    return iso.slice(8, 10) + '.' + iso.slice(5, 7);
  }
  // First and last day of a week of the monthly plan, counted from the start date.
  function weekRange(week) {
    const start = dateInput.value;
    return {from: addDays(start, 7 * (week - 1)), to: addDays(start, 7 * week - 1)};
  }
  // Every session already saved in this browser, one row per session (a monthly request holds several).
  function savedSessions() {
    const rows = [];
    for (const item of storageRead('bookings', [])) {
      const list = Array.isArray(item.sessions) ? item.sessions : [{date: item.date, time: item.time}];
      for (const session of list) rows.push({date: session.date, time: session.time, branch: item.branch, specialist: item.specialist});
    }
    return rows;
  }
  function clashes(date, slot, sessions) {
    const branch = document.getElementById('branch').value;
    const specialist = specialistSelect.value;
    return sessions.some(function (item) {
      const sameTime = item.time === slot.id || item.time === slot.period;
      return item.date === date && sameTime && item.branch === branch && (item.specialist === specialist || item.specialist === 'any');
    });
  }
  // The sessions the visitor asked for, as [{date, time}] — one for a single plan, eight for a monthly plan.
  function chosenSessions() {
    if (!isMonthly()) return [{date: dateInput.value, time: timeSelect.value}];
    return weekInputs.map(function (item) { return {date: item.date.value, time: item.time.value}; });
  }

  // ---------- functions that react to the visitor's choices ----------
  // The specialist list depends on the chosen service: only the specialists of that service are shown.
  function fillSpecialists() {
    const service = findService(serviceSelect.value);
    const hint = createEl('option', service ? 'Choose a specialist' : 'Choose a service first');
    hint.value = '';
    hint.disabled = true;
    hint.hidden = true;
    hint.defaultSelected = true;
    specialistSelect.replaceChildren(hint);
    specialistSelect.disabled = !service;
    if (!service) return;
    for (const name of service.specialists) {
      const option = createEl('option', name);
      option.value = name;
      specialistSelect.append(option);
    }
  }

  function updateSlotsFor(dateField, select, saved) {
    const date = dateField.value;
    const today = todayISO();
    const closed = date && (date < today || dayOfWeek(date) === HOURS.closedDay);
    const minutesNow = date === today ? almatyClock(new Date()).minutes : -1;
    for (const option of select.options) {
      if (!option.value) continue;
      const slot = findTimeSlot(option.value);
      option.disabled = closed || slot.start < minutesNow || clashes(date, slot, saved);
    }
    if (select.value && select.selectedOptions[0].disabled) {
      select.value = '';
    }
    const available = Array.from(select.options).some(function (option) { return !option.disabled; });
    select.options[0].textContent = available ? 'Choose a time' : 'No times available';
  }
  function updateSlots() {
    const saved = savedSessions();
    if (isMonthly()) {
      for (const item of weekInputs) updateSlotsFor(item.date, item.time, saved);
    } else {
      updateSlotsFor(dateInput, timeSelect, saved);
    }
  }

  function sessionTimeError(date, value) {
    const slot = findTimeSlot(value);
    if (!slot) return 'Choose a session time.';
    if (date === todayISO() && slot.start < almatyClock(new Date()).minutes) return 'This session has already started. Choose a later time.';
    return clashes(date, slot, savedSessions()) ? 'This specialist already has a request for this time. Choose another time.' : '';
  }

  // The monthly block: titles show the dates of each week, date fields are limited to their own week.
  function updateWeeks() {
    const hasStart = dateInput.value !== '';
    for (let week = 1; week <= WEEKS_IN_MONTH; week++) {
      const range = hasStart ? weekRange(week) : null;
      weekTitles[week - 1].textContent = 'Week ' + week + (range ? ' · ' + shortDate(range.from) + ' – ' + shortDate(range.to) : ' · choose the start date first');
    }
    for (const item of weekInputs) {
      item.date.disabled = item.time.disabled = !isMonthly() || !hasStart;
      item.date.required = item.time.required = isMonthly();
      if (!hasStart) {
        item.date.removeAttribute('min');
        item.date.removeAttribute('max');
        continue;
      }
      const range = weekRange(item.week);
      item.date.min = range.from > todayISO() ? range.from : todayISO();
      item.date.max = range.to;
      if (item.date.value !== '' && (item.date.value < range.from || item.date.value > range.to)) {
        item.date.value = ''; // the start date moved: the old choice does not belong to this week any more
        clearFieldError(item.date);
      }
    }
  }

  function updateDateHint() {
    if (!dateInput.value || isMonthly()) {
      dateHint.textContent = '';
      return;
    }
    const day = dayOfWeek(dateInput.value);
    if (day === HOURS.closedDay) dateHint.textContent = 'We are closed on Sundays. Please choose another day.';
    else if (day === HOURS.byAppointmentDay) dateHint.textContent = 'Saturday is by appointment: the administrator will phone you to agree the time.';
    else dateHint.textContent = '';
  }

  // Switch between the single and the monthly plan.
  function updatePlan() {
    const monthly = isMonthly();
    timeSelect.disabled = monthly;
    timeColumn.classList.toggle('hidden', monthly);
    monthlyBlock.classList.toggle('hidden', !monthly);
    dateLabel.textContent = monthly ? 'Start date *' : 'Preferred date *';
    updateWeeks();
  }

  function updatePrice() {
    const service = findService(serviceSelect.value);
    if (!service) {
      price.textContent = 'Choose a service';
      return;
    }
    const quantity = sessionCount();
    price.textContent = formatMoney(service.price) + ' × ' + pluralize(quantity, 'session', 'sessions') + ' = ' + formatMoney(service.price * quantity);
  }

  function updateSummary() {
    const service = findService(serviceSelect.value);
    const branch = findBranch(document.getElementById('branch').value);
    const slot = findTimeSlot(timeSelect.value);
    const parts = [service ? service.name : 'Choose a service', specialistSelect.value, branch ? branch.name : ''];
    if (isMonthly()) {
      parts.push('Monthly subscription', dateInput.value ? 'from ' + dateInput.value : 'choose a start date', pluralize(MONTHLY_SESSIONS, 'session', 'sessions') + ' (' + SESSIONS_PER_WEEK + ' a week)');
    } else {
      parts.push('Single session', dateInput.value || 'choose a date', slot ? slot.label : '');
    }
    let text = parts.filter(Boolean).join(' · ') + '.';
    if (document.getElementById('first-visit').checked) text += ' First visit: a diagnostic session comes first, so the final price is confirmed by the center.';
    summary.textContent = text;
  }

  function refreshAll() {
    fillSpecialists();
    updatePlan();
    updateSlots();
    updateDateHint();
    updatePrice();
    updateSummary();
  }

  // ---------- validation rules ----------
  function nameRule(who) {
    return function (value) {
      return value.length >= 2 && value.length <= 80 && /\p{L}/u.test(value) ? '' : 'Enter ' + who + ' name (2–80 characters, with letters).';
    };
  }
  const fields = [
    {id: 'child-name', check: nameRule("the child's")},
    {id: 'parent-name', check: nameRule("the parent's")},
    {id: 'phone', check: function (value) {
      if (value === '') return 'Enter a phone number.';
      return isPhone(value) ? '' : 'Use +7 and 10 digits, for example +7 701 234 56 78.';
    }},
    {id: 'email', check: function (value) { return value === '' || isEmail(value) ? '' : 'The e-mail should look like name@example.com, or leave it empty.'; }},
    {id: 'child-age', check: function (value) {
      const age = Number(value);
      return value !== '' && Number.isInteger(age) && age >= 1 && age <= 18 ? '' : 'Enter a whole age from 1 to 18.';
    }},
    {id: 'branch', check: function (value) { return findBranch(value) ? '' : 'Choose a branch.'; }},
    {id: 'service', check: function (value) { return findService(value) ? '' : 'Choose a service.'; }},
    {id: 'specialist', check: function (value, read) {
      const service = findService(read('service'));
      return !service || service.specialists.includes(value) ? '' : 'Choose a specialist who works with this service.';
    }},
    {id: 'visit-date', check: function (value) {
      if (value === '') return isMonthly() ? 'Choose the start date.' : 'Choose a date.';
      if (value < todayISO()) return 'This date has passed. Choose today or a later date.';
      return !isMonthly() && dayOfWeek(value) === HOURS.closedDay ? 'We are closed on Sundays. Choose another day.' : '';
    }},
    {id: 'visit-time', check: function (value, read) {
      if (isMonthly()) return ''; // a monthly plan has its own time fields
      return sessionTimeError(read('visit-date'), value);
    }},
    {id: 'comment', check: function (value) { return value.length <= 1000 ? '' : 'Use no more than 1000 characters (now ' + value.length + ').'; }},
    {id: 'consent', check: function (value) { return value ? '' : 'Please agree to be contacted before sending the request.'; }}
  ];

  // Two fields for every session of the monthly plan.
  for (const item of weekInputs) {
    fields.push({id: item.date.id, check: function (value) {
      if (!isMonthly() || !dateInput.value) return '';
      const range = weekRange(item.week);
      if (value === '') return 'Choose a day for week ' + item.week + ', session ' + item.session + '.';
      if (value < range.from || value > range.to) return 'Week ' + item.week + ' runs from ' + range.from + ' to ' + range.to + '. Choose a day inside it.';
      if (value < todayISO()) return 'This date has passed. Choose today or a later date.';
      return dayOfWeek(value) === HOURS.closedDay ? 'We are closed on Sundays. Choose another day.' : '';
    }});
    fields.push({id: item.time.id, check: function (value, read) {
      if (!isMonthly() || !dateInput.value) return '';
      const date = read(item.date.id);
      const error = sessionTimeError(date, value);
      if (error || !date) return error;
      const other = weekInputs.find(function (row) { return row.week === item.week && row.session !== item.session; });
      if (other && other.date.value === date && other.time.value === value) return 'Both sessions of week ' + item.week + ' are at the same time. Change the day or the time.';
      return '';
    }});
  }

  validateForm(form, fields, function (read) {
    const service = findService(read('service'));
    const quantity = sessionCount();
    const sessions = chosenSessions();
    const request = {
      reference: makeReference(),
      child: read('child-name'),
      phone: read('phone'),
      branch: read('branch'),
      service: service.id,
      specialist: read('specialist'),
      plan: isMonthly() ? 'monthly' : 'single',
      date: sessions[0].date,
      time: sessions[0].time,
      sessions: sessions,
      quantity: quantity,
      total: service.price * quantity,
      firstVisit: read('first-visit')
    };
    const saved = storageRead('bookings', []);
    saved.push(request);
    if (!storageSave('bookings', saved)) {
      showMessage(document.getElementById('booking-errors'), 'Your browser could not save this request. Please enable browser storage and try again.');
      return;
    }
    const branch = findBranch(request.branch);
    const saturday = sessions.some(function (item) { return dayOfWeek(item.date) === HOURS.byAppointmentDay; });
    const planName = isMonthly() ? 'Monthly subscription' : 'One-time booking';
    form.reset();
    showMessage(confirmation, '');
    confirmation.append(
      createEl('h2', planName + ' · ' + formatMoney(request.total), 'h5'),
      createEl('p', request.child + ' · ' + service.name + ' · ' + request.specialist + ' · ' + branch.name),
      createEl('p', formatMoney(service.price) + ' × ' + pluralize(quantity, 'session', 'sessions') + ' = ' + formatMoney(request.total))
    );
    const schedule = createEl('ul');
    sessions.forEach(function (session, index) {
      const week = request.plan === 'monthly' ? 'Week ' + (Math.floor(index / SESSIONS_PER_WEEK) + 1) + ' · ' : '';
      schedule.append(createEl('li', week + session.date + ' · ' + bookingTimeLabel(session.time)));
    });
    confirmation.append(schedule);
    if (saturday) confirmation.append(createEl('p', 'Saturday sessions are by appointment.'));
    if (request.firstVisit) confirmation.append(createEl('p', 'The first visit is a diagnostic session.'));
    confirmation.append(createEl('p', 'Request ' + request.reference + ' is saved in this browser tab. Call ' + branch.phone + ' to confirm.'));
    const link = createEl('a', 'Open My profile', 'alert-link');
    link.href = 'profile.html';
    confirmation.append(link);
    confirmation.scrollIntoView({block: 'center'});
  });

  // ---------- events ----------
  serviceSelect.addEventListener('change', function () {
    fillSpecialists();
    clearFieldError(specialistSelect);
    updateSlots();
  });
  specialistSelect.addEventListener('change', updateSlots);
  document.getElementById('branch').addEventListener('change', updateSlots);
  dateInput.addEventListener('change', function () { updateWeeks(); updateSlots(); updateDateHint(); });
  for (const item of weekInputs) item.date.addEventListener('change', function () { updateSlotsFor(item.date, item.time, savedSessions()); });
  for (const radio of [planSingle, planMonthly]) {
    radio.addEventListener('change', function () {
      // Errors (and green ticks) of the fields of the other plan must not stay on the page.
      for (const field of fields) {
        if (field.id === 'visit-time' || field.id.indexOf('week') === 0) clearFieldError(form.querySelector('[id="' + field.id + '"]'));
      }
      hideMessage(document.getElementById('booking-errors'));
      updatePlan();
      updateSlots();
      updateDateHint();
    });
  }
  form.addEventListener('change', function () { updatePrice(); updateSummary(); });
  form.addEventListener('reset', function () { setTimeout(refreshAll, 0); }); // reset restores values AFTER the event

  refreshAll();
});
