'use strict';
(() => {
  const S = window.Shindal;
  const form = S.byId('register-form') || S.byId('login-form');
  const register = form.id === 'register-form';
  // Separate auth screens, keeping the original Midterm HTML/CSS source unchanged.
  S.byId('primary-nav')?.remove();
  S.byId('site-footer')?.remove();
  document.querySelector('.cta-band')?.remove();
  document.querySelector('.floating-contact')?.remove();
  const main = S.byId('main');
  const card = form.parentElement;
  const header = main.querySelector('header');
  const intro = header.querySelector('p');
  header.querySelector('h1').textContent = register
    ? 'Create your profile'
    : 'Welcome back';
  header.querySelector('h1').className = 'h2 fw-bold';
  intro.textContent = register
    ? 'Plan the next steps in your child’s development.'
    : 'Continue to your local demonstration profile.';
  intro.className = 'text-muted small';
  header.className = 'text-center mb-4';
  card.className = 'card soft-card p-4 p-sm-5';
  card.prepend(header);
  const column = S.el('div', '', 'col-12 col-md-8 col-lg-6 col-xl-5');
  const row = S.el('div', '', 'row justify-content-center w-100');
  column.append(card);
  row.append(column);
  const back = S.el('a', '', 'btn btn-outline-brand align-self-start mb-4');
  back.href = 'index.html';
  back.setAttribute('aria-label', 'Go back');
  back.append(S.icon('back'));
  back.addEventListener('click', (event) => {
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    if (history.length > 1) {
      event.preventDefault();
      history.back();
    }
  });
  main.replaceChildren(back, row);
  main.className =
    'container min-vh-100 d-flex flex-column justify-content-center py-4';
  form.querySelectorAll('input,select').forEach((input) => {
    input.classList.add('py-2');
  });
  if (register) {
    form.querySelectorAll('.col-md-6').forEach((col) => {
      col.classList.remove('col-md-6');
      col.classList.add('col-12');
    });
    const photo = S.byId('reg-photo');
    photo.accept = 'image/jpeg,image/png,image/webp';
    photo.parentElement.querySelector('span').textContent = '＋';
    S.byId('reg-name').autocomplete = 'name';
    S.byId('reg-email').autocomplete = 'email';
    S.byId('reg-phone').autocomplete = 'tel';
    const branch = S.byId('reg-branch');
    const placeholder = S.el('option', 'Choose a branch');
    placeholder.value = '';
    placeholder.defaultSelected = true;
    branch.prepend(placeholder);
    branch.value = '';
    branch.required = true;
    form.querySelector('.small.text-muted').textContent =
      'Front-end demonstration. Your password is checked locally and is never saved.';
    S.byId('register-submit').textContent = 'Validate profile';
    const confirmation = S.byId('register-confirmation');
    confirmation.after(
      S.el('p', 'No real account is created.', 'small text-muted mt-3'),
    );
    S.byId('register-submit').classList.add('w-100', 'py-2');
    const password = S.byId('reg-password'),
      confirm = S.byId('reg-password-confirm');
    password.autocomplete = 'new-password';
    confirm.autocomplete = 'new-password';
    const conceal = S.passwordControl(password),
      concealConfirm = S.passwordControl(confirm);
    const update = S.passwordChecklist(password);
    const file = S.byId('reg-photo');
    const preview = S.el(
      'img',
      '',
      'avatar-circle rounded-circle object-fit-cover d-block mx-auto mt-3 hidden',
    );
    preview.alt = 'Selected profile photo';
    preview.width = 80;
    preview.height = 80;
    file.after(preview);
    let photoURL = null;
    const clearPhoto = () => {
      preview.classList.add('hidden');
      preview.removeAttribute('src');
      if (photoURL) {
        URL.revokeObjectURL(photoURL);
        photoURL = null;
      }
    };
    const validPhoto = (photo) =>
      ['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) &&
      photo.size <= 2 * 1024 * 1024;
    file.addEventListener('change', () => {
      clearPhoto();
      if (file.files[0] && validPhoto(file.files[0])) {
        photoURL = URL.createObjectURL(file.files[0]);
        preview.src = photoURL;
        preview.classList.remove('hidden');
      }
    });
    preview.addEventListener('error', () => {
      clearPhoto();
      S.message(
        confirmation,
        'This image cannot be displayed. Please choose another photo.',
      );
    });
    window.addEventListener('pagehide', clearPhoto);
    password.addEventListener('input', () => {
      S.byId('reg-password-confirm-error')?.remove();
      confirm.classList.remove('error', 'success');
      confirm.removeAttribute('aria-invalid');
      confirm.removeAttribute('aria-describedby');
    });
    form.addEventListener('reset', () => {
      clearPhoto();
      conceal();
      concealConfirm();
      setTimeout(update, 0);
    });
    const value = (id) => S.byId(id).value.trim();
    S.validate(
      form,
      () => ({
        'reg-name':
          value('reg-name').length >= 2
            ? ''
            : 'Enter a name with at least 2 characters.',
        'reg-email': S.email(value('reg-email')) ? '' : 'Enter a valid email.',
        'reg-phone': S.phone(value('reg-phone'))
          ? ''
          : 'Enter a Kazakhstan number: +7 and 10 digits.',
        'reg-branch': window.ShindalBranches.some(
          (item) => item.id === value('reg-branch'),
        )
          ? ''
          : 'Choose a branch.',
        'reg-photo':
          !file.files[0] || validPhoto(file.files[0])
            ? ''
            : 'Choose JPG, PNG or WebP up to 2 MB.',
        'reg-password': S.strong(password.value)
          ? ''
          : 'Use 8+ characters, uppercase, lowercase, number and symbol.',
        'reg-password-confirm':
          confirm.value !== '' && confirm.value === password.value
            ? ''
            : 'Passwords must match exactly.',
      }),
      () => {
        const profile = {
          name: value('reg-name'),
          email: value('reg-email'),
          phone: value('reg-phone'),
          branch: value('reg-branch'),
        };
        const stored = S.save('profile', profile);
        password.value = '';
        confirm.value = '';
        conceal();
        concealConfirm();
        update();
        S.message(
          confirmation,
          `${profile.name} · ${profile.email} · ${profile.phone} · ${profile.branch}. ${stored ? 'Non-password details saved in this browser tab; view them in My Profile.' : 'Browser storage unavailable; details are not saved.'} ${S.demo}`,
        );
      },
    );
  } else {
    const password = S.byId('login-password');
    S.byId('login-email').autocomplete = 'email';
    password.autocomplete = 'current-password';
    const conceal = S.passwordControl(password),
      update = S.passwordChecklist(password);
    const note = form.querySelector('p');
    note.textContent =
      'This form checks input only; it does not authenticate you.';
    const result = S.el('p', '', 'alert alert-success mt-3 hidden');
    result.id = 'login-confirmation';
    form.after(result);
    const link = S.el(
      'a',
      'Open My Profile',
      'btn btn-outline-brand w-100 mt-2',
    );
    link.href = 'profile.html';
    result.after(link);
    form.addEventListener('reset', () => {
      conceal();
      setTimeout(update, 0);
    });
    S.validate(
      form,
      () => ({
        'login-email': S.email(S.byId('login-email').value)
          ? ''
          : 'Enter a valid email.',
        'login-password': S.strong(password.value)
          ? ''
          : 'Use 8+ characters, uppercase, lowercase, number and symbol.',
      }),
      () => {
        password.value = '';
        conceal();
        update();
        S.message(
          result,
          `Input validation passed. No user was authenticated. ${S.demo}`,
        );
      },
    );
  }
})();
