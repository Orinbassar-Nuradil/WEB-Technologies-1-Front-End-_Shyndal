'use strict';
(() => {
  const S = window.Shindal;
  const result = S.byId('profile-message') || S.el('p');
  if (!result.id) {
    result.id = 'profile-message';
    S.byId('main').append(result);
  }
  S.message(
    result,
    `Local demo profile and requests for this tab. No authentication. ${S.demo}`,
  );
  let profile = S.read('profile', null);
  const drawProfile = () => {
    ['name', 'email', 'phone', 'branch'].forEach((key) => {
      S.byId(`profile-${key}`).textContent =
        profile?.[key] || 'No demo details saved';
    });
  };
  drawProfile();
  const editor = S.el('form', '', 'mt-3 hidden');
  editor.noValidate = true;
  S.byId('profile-details').after(editor);
  const fields = {};
  ['name', 'email', 'phone'].forEach((key) => {
    fields[key] = S.field(
      editor,
      `edit-${key}`,
      key,
      key === 'email' ? 'email' : 'text',
    );
  });
  fields.branch = S.select(editor, 'edit-branch', 'Branch', [
    ['astana', 'Astana'],
    ['kosshy', 'Kosshy'],
    ['taraz', 'Taraz'],
  ]);
  const submit = S.el('button', 'Save demo details', 'btn btn-brand');
  submit.type = 'submit';
  editor.append(
    submit,
    S.button('Cancel editing', () => {
      editor.classList.add('hidden');
      S.message(result, 'Editing cancelled.');
    }),
  );
  S.byId('profile-edit').addEventListener('click', () => {
    Object.entries(fields).forEach(([key, input]) => {
      input.value = profile?.[key] || (key === 'branch' ? 'astana' : '');
    });
    editor.classList.remove('hidden');
    fields.name.focus();
  });
  S.validate(
    editor,
    () => ({
      'edit-name':
        fields.name.value.trim().length >= 2 ? '' : 'Enter your name.',
      'edit-email': S.email(fields.email.value) ? '' : 'Enter a valid email.',
      'edit-phone': S.phone(fields.phone.value)
        ? ''
        : 'Enter a valid Kazakhstan phone.',
      'edit-branch': ['astana', 'kosshy', 'taraz'].includes(fields.branch.value)
        ? ''
        : 'Choose a branch.',
    }),
    () => {
      profile = Object.fromEntries(
        Object.entries(fields).map(([key, input]) => [key, input.value.trim()]),
      );
      const stored = S.save('profile', profile);
      drawProfile();
      editor.classList.add('hidden');
      S.message(
        result,
        stored
          ? 'Demo details saved in this tab.'
          : 'Updated on this page; browser storage unavailable.',
      );
    },
  );
  const body = S.byId('booking-history-body');
  body.setAttribute('aria-live', 'polite');
  let rows = S.read('bookings', []).filter(
    (row) =>
      row &&
      typeof row.date === 'string' &&
      typeof row.reference === 'string' &&
      Number.isFinite(row.total),
  );
  const draw = () => {
    body.replaceChildren();
    if (rows.length === 0) {
      const tr = S.el('tr');
      const td = S.el('td', 'No demo requests yet. Use Book a new session.');
      td.colSpan = 4;
      tr.append(td);
      body.append(tr);
      return;
    }
    rows.forEach((row) => {
      const tr = S.el('tr');
      tr.append(
        S.el('td', `${row.date} · ${row.time}`),
        S.el('td', `${row.specialist} · ${row.service} × ${row.quantity}`),
        S.el('td', row.branch),
      );
      const td = S.el('td', `Demo only · ${S.money(row.total)} `);
      td.append(
        S.button('Remove request', () => {
          rows = rows.filter((item) => item.reference !== row.reference);
          S.save('bookings', rows);
          draw();
          S.message(
            result,
            'Local demo request removed; no real appointment was cancelled.',
          );
        }),
      );
      tr.append(td);
      body.append(tr);
    });
  };
  draw();
  const logout = S.byId('profile-logout');
  logout.textContent = 'Clear local demo data';
  logout.addEventListener('click', (event) => {
    event.preventDefault();
    ['profile', 'bookings', 'reviews', 'cart'].forEach((key) =>
      S.save(key, null),
    );
    profile = null;
    rows = [];
    drawProfile();
    draw();
    editor.classList.add('hidden');
    S.message(result, 'Local demo data cleared.');
  });
})();
