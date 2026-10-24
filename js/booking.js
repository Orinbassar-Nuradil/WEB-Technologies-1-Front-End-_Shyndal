'use strict';
(() => {
  const S = window.Shindal,
    B = window.ShindalBooking,
    W = window.ShindalWeekly,
    form = S.byId('booking-form');
  const branch = S.byId('branch'),
    service = S.byId('service'),
    specialist = S.byId('specialist'),
    start = S.byId('visit-date'),
    oldPeriod = S.byId('visit-time');
  const value = (id) => S.byId(id).value.trim();
  const today = () =>
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Almaty',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
  const options = (node, rows, previous = '') => {
    node.replaceChildren();
    rows.forEach(([id, label]) => {
      const option = S.el('option', label);
      option.value = id;
      node.append(option);
    });
    node.value = rows.some(([id]) => id === previous) ? previous : '';
  };
  const branchOption = S.el('option', 'Select a branch');
  branchOption.value = '';
  branchOption.defaultSelected = true;
  branch.prepend(branchOption);
  branch.value = '';
  branch.required = true;
  specialist.required = true;
  form.querySelector('label[for="specialist"]').textContent = 'Specialist *';
  const originalNote = form.querySelector('.small.text-muted');
  if (originalNote) originalNote.textContent = S.demo;
  document.querySelectorAll('#main .steps li').forEach((node, index) => {
    node.textContent = [
      'Review your demo schedule',
      'Contact the center directly for a real plan',
      'Agree on actual availability and price',
      'Visit only after the center confirms',
    ][index];
  });
  // Move the existing date field into the plan flow; all new UI is created via DOM.
  const dateColumn = start.parentElement;
  dateColumn.className = 'col-md-6';
  oldPeriod.parentElement.remove();
  const panel = S.el('section', '', 'col-12 hidden');
  specialist.parentElement.after(panel);
  panel.append(S.el('h2', 'Build your schedule', 'h5 mt-3'));
  const top = S.el('div', '', 'row g-3');
  panel.append(top);
  const modeColumn = S.el('div', '', 'col-md-6');
  top.append(modeColumn);
  const mode = S.select(modeColumn, 'plan-mode', 'Booking plan *', [
    ['', 'Choose a plan'],
    ['single', 'Single visit'],
    ['monthly', 'One-month plan · 4 lessons total'],
  ]);
  mode.required = true;
  top.append(dateColumn);
  dateColumn.classList.add('hidden');
  start.min = today();
  const description = S.el('p', '', 'small text-muted mt-3');
  panel.append(description);
  const schedule = S.el('div', '', 'mt-3');
  panel.append(schedule);
  let lessonRows = [];
  const intro = S.el(
    'p',
    'Choose a branch, service and specialist to build your schedule.',
    'small text-muted col-12',
  );
  panel.before(intro);
  let summaryText = '';
  const liveSummary = S.el('p', '', 'small mt-3');
  liveSummary.setAttribute('aria-live', 'polite');
  S.byId('booking-price').parentElement.after(liveSummary);
  const ready = () =>
    B.roster(branch.value, service.value).includes(specialist.value);
  const clearErrors = () => {
    form.querySelectorAll('.error-message').forEach((node) => node.remove());
    form.querySelectorAll('.error,.success').forEach((node) => {
      node.classList.remove('error', 'success');
      node.removeAttribute('aria-invalid');
      node.removeAttribute('aria-describedby');
    });
    S.byId('booking-confirmation').classList.add('hidden');
  };
  const fillPeople = (node, id, previous = '') => {
    const people = B.roster(branch.value, id);
    options(
      node,
      [
        [
          '',
          people.length
            ? 'Select a specialist'
            : 'Choose branch and service first',
        ],
        ...people.map((name) => [name, name]),
      ],
      previous,
    );
    node.disabled = !people.length;
  };
  const labelDate = (date) =>
    new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(new Date(`${date}T12:00:00Z`));
  const updateSlots = (row) => {
    const hours = W.slots(row.date.value, row.period.value);
    options(
      row.slot,
      [
        ['', 'Select a lesson time'],
        ...hours.map((time) => [time, `${time}–${time.slice(0, 2)}:40`]),
      ],
      row.slot.value,
    );
    row.slot.disabled = !hours.length;
  };
  const updatePeriods = (row) => {
    const periods = W.periods(row.date.value);
    options(
      row.period,
      [
        ['', 'Select a period'],
        ...periods.map((period) => [
          period,
          period === 'morning'
            ? 'Morning · 08:00–13:00'
            : 'Afternoon · 14:00–19:00',
        ]),
      ],
      row.period.value,
    );
    row.period.disabled = !periods.length;
    updateSlots(row);
  };
  const settings = () => ({
    branch: branch.value,
    start: start.value,
    mode: mode.value,
    lessons: lessonRows.map((row) => ({
      key: row.key,
      date: row.date.value,
      period: row.period.value,
      slot: row.slot.value,
      service: service.value,
      specialist: specialist.value,
    })),
  });
  const makePlan = () => {
    const plan = W.build(settings());
    if (start.value < today())
      plan.errors['visit-date'] = 'Choose today or a future start date.';
    const saved = S.read('bookings', []);
    plan.appointments.forEach((appointment, index) => {
      if (
        saved.some(
          (row) =>
            row.branch === appointment.branch &&
            row.date === appointment.date &&
            (row.slot || row.time) === appointment.slot &&
            (row.specialist === appointment.specialist ||
              (row.childName &&
                row.childName.toLowerCase() ===
                  value('child-name').toLowerCase())),
        )
      )
        plan.errors[`${lessonRows[index].key}-slot`] =
          'A demo lesson for this child or specialist already uses this time.';
    });
    return plan;
  };
  const update = () => {
    panel.classList.toggle('hidden', !ready());
    intro.classList.toggle('hidden', ready());
    dateColumn.classList.toggle('hidden', !mode.value);
    start.min = today();
    form.querySelector('label[for="visit-date"]').textContent =
      mode.value === 'monthly' ? 'Plan start date *' : 'Visit date *';
    const plan = makePlan(),
      complete =
        ready() &&
        mode.value &&
        lessonRows.length &&
        !Object.keys(plan.errors).length;
    description.textContent =
      mode.value === 'monthly'
        ? `Four lessons total: one lesson in each of four consecutive calendar weeks. The first week begins on your start date; later weeks start on Monday. Choose the day and time separately for each lesson. All lessons fall before ${W.valid(start.value) ? B.monthEnd(start.value) : 'the same date next month'}. Each lesson lasts 40 minutes. Sunday is closed; Saturday is morning only.`
        : mode.value === 'single'
          ? 'Choose a date, then Morning or Afternoon and your exact 40-minute lesson time.'
          : '';
    if (!complete) {
      summaryText = '';
      S.byId('booking-price').textContent = 'Complete your lesson plan';
      liveSummary.textContent =
        'Choose the branch, service, specialist, plan and lesson times to see your summary.';
      return;
    }
    summaryText = `${branch.selectedOptions[0].textContent.trim()} · ${S.findService(service.value).name} · ${specialist.value} · ${plan.appointments.length} lesson${plan.appointments.length === 1 ? '' : 's'} · ${S.money(plan.total)}${mode.value === 'monthly' ? ` · ${plan.weeks} calendar weeks` : ''}`;
    S.byId('booking-price').textContent = S.money(plan.total);
    liveSummary.textContent = `${summaryText}. ${plan.appointments.map((row) => `${row.date}: ${row.time}`).join('; ')}.`;
  };
  const drawSchedule = () => {
    const previous = new Map(
      lessonRows.map((row) => [
        row.key,
        {
          date: row.date.value,
          period: row.period.value,
          slot: row.slot.value,
        },
      ]),
    );
    schedule.replaceChildren();
    lessonRows = [];
    if (
      !ready() ||
      !mode.value ||
      !W.valid(start.value) ||
      start.value < today() ||
      B.day(start.value) === 0
    ) {
      if (start.value && B.day(start.value) === 0)
        schedule.append(
          S.el(
            'p',
            'Sunday is closed. Choose another start date.',
            'text-muted',
          ),
        );
      return;
    }
    const weeks =
      mode.value === 'monthly' ? W.weeks(start.value) : [[start.value]];
    weeks.forEach((dates, weekIndex) => {
      const group = S.el('section', '', 'mb-4');
      schedule.append(group);
      if (mode.value === 'monthly')
        group.append(
          S.el(
            'h3',
            `Week ${weekIndex + 1} · ${labelDate(dates[0])} – ${labelDate(dates[dates.length - 1])}`,
            'h6 mb-3',
          ),
        );
      const key = `week-${weekIndex + 1}-lesson-1`,
        old = previous.get(key),
        card = S.el('fieldset', '', 'soft-card p-3 mb-3');
      card.append(
        S.el(
          'legend',
          mode.value === 'monthly' ? `Lesson ${weekIndex + 1}` : 'Lesson time',
          'h6',
        ),
      );
      const grid = S.el('div', '', 'row g-3');
      card.append(grid);
      group.append(card);
      const column = (width) => {
        const col = S.el('div', '', width);
        grid.append(col);
        return col;
      };
      const row = { key };
      row.date = S.select(column('col-lg-5'), `${key}-date`, 'Day and date *', [
        ['', 'Select a day'],
        ...dates.map((date) => [date, labelDate(date)]),
      ]);
      row.date.value = dates.includes(old?.date)
        ? old.date
        : mode.value === 'single'
          ? start.value
          : '';
      row.period = S.select(
        column('col-lg-3'),
        `${key}-period`,
        'Time period *',
        [],
      );
      row.slot = S.select(
        column('col-lg-4'),
        `${key}-slot`,
        'Lesson starts at *',
        [],
      );
      updatePeriods(row);
      if (old && W.periods(row.date.value).includes(old.period)) {
        row.period.value = old.period;
        updateSlots(row);
        if (W.slots(row.date.value, row.period.value).includes(old.slot))
          row.slot.value = old.slot;
      }
      [row.date, row.period, row.slot].forEach(
        (input) => (input.required = true),
      );
      row.date.addEventListener('change', () => {
        updatePeriods(row);
        clearErrors();
        update();
      });
      row.period.addEventListener('change', () => {
        updateSlots(row);
        clearErrors();
        update();
      });
      lessonRows.push(row);
    });
  };
  const resetPlan = () => {
    mode.value = '';
    start.value = '';
    lessonRows = [];
    schedule.replaceChildren();
    clearErrors();
    update();
  };
  [branch, service].forEach((input) =>
    input.addEventListener('change', () => {
      fillPeople(specialist, service.value);
      resetPlan();
    }),
  );
  specialist.addEventListener('change', resetPlan);
  mode.addEventListener('change', () => {
    clearErrors();
    drawSchedule();
    update();
  });
  start.addEventListener('change', () => {
    clearErrors();
    drawSchedule();
    update();
  });
  form.addEventListener('input', update);
  form.addEventListener('change', update);
  const selected = new URLSearchParams(location.search).get('service');
  if (S.findService(selected)) service.value = selected;
  fillPeople(specialist, service.value);
  update();
  form.addEventListener('reset', () =>
    setTimeout(() => {
      branch.value = '';
      fillPeople(specialist, service.value);
      resetPlan();
    }, 0),
  );
  S.validate(
    form,
    () => {
      const age = Number(value('child-age'));
      const rules = {
        'child-name':
          value('child-name').length >= 2
            ? ''
            : 'Enter the child’s name (at least 2 characters).',
        'parent-name':
          value('parent-name').length >= 2
            ? ''
            : 'Enter the parent’s name (at least 2 characters).',
        phone: S.phone(value('phone'))
          ? ''
          : 'Use a Kazakhstan phone number: +7 and 10 digits.',
        email:
          !value('email') || S.email(value('email'))
            ? ''
            : 'Enter a valid email address.',
        'child-age':
          Number.isInteger(age) && age >= 1 && age <= 18
            ? ''
            : 'Enter a whole age from 1 to 18.',
        branch: ['astana', 'kosshy', 'taraz'].includes(branch.value)
          ? ''
          : 'Choose a branch.',
        service: S.findService(service.value) ? '' : 'Choose a service.',
        specialist: ready() ? '' : 'Choose a branch specialist.',
        comment:
          value('comment').length <= 1000 ? '' : 'Use at most 1000 characters.',
        consent: S.byId('consent').checked
          ? ''
          : 'Please agree before continuing.',
      };
      return { ...rules, ...makePlan().errors };
    },
    () => {
      const plan = makePlan();
      if (Object.keys(plan.errors).length || !ready()) return;
      const reference = S.reference(),
        savedRows = S.read('bookings', []);
      plan.appointments.forEach((appointment, index) =>
        savedRows.push({
          ...appointment,
          reference: `${reference}-${index + 1}`,
          groupReference: reference,
          childName: value('child-name'),
          plan: mode.value,
        }),
      );
      const stored = S.save('bookings', savedRows);
      S.message(
        S.byId('booking-confirmation'),
        `${reference}. ${summaryText}. ${S.byId('first-visit').checked ? 'Contact the center to agree on the first assessment and final price. ' : ''}${stored ? 'Your listed lessons are saved as demo requests in this tab. View them in My Profile.' : 'Browser storage unavailable; keep this schedule yourself.'} ${S.demo}`,
      );
    },
  );
})();
