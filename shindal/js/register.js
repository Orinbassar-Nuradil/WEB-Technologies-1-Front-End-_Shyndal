'use strict';
// register.js — plain JavaScript. Creates the visitor's account for this browser tab.
// Added since the last defended version: the account is saved (with a hash, never the password),
// the visitor is logged in automatically, and the chosen photo is shown cropped in the avatar circle.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('register-form');
  const confirmation = document.getElementById('register-confirmation');
  const password = document.getElementById('reg-password');
  const photoInput = document.getElementById('reg-photo');
  const avatar = form.querySelector('.avatar-circle');
  const avatarEmoji = avatar.textContent.trim();
  addPasswordToggles(form);

  // Live checklist under the password field: each requirement is ticked as the visitor types.
  const requirements = [
    {text: '8 or more characters', test: function (value) { return value.length >= 8; }},
    {text: 'An uppercase letter', test: function (value) { return /[A-Z]/.test(value); }},
    {text: 'A lowercase letter', test: function (value) { return /[a-z]/.test(value); }},
    {text: 'A number', test: function (value) { return /\d/.test(value); }},
    {text: 'A special character', test: function (value) { return /[^A-Za-z0-9]/.test(value); }}
  ];
  const checklist = createEl('ul', '', 'small list-unstyled mt-2 mb-0');
  checklist.id = 'reg-password-requirements';
  password.after(checklist);
  function drawChecklist() {
    const items = requirements.map(function (rule) {
      const done = rule.test(password.value);
      const item = createEl('li', (done ? '✓ ' : '○ ') + rule.text, done ? 'success' : '');
      return item;
    });
    checklist.replaceChildren(...items);
  }
  password.addEventListener('input', drawChecklist);
  form.addEventListener('reset', function () { setTimeout(drawChecklist, 0); });
  drawChecklist();

  // Photo: only JPG, PNG or WebP up to 2 MB; shown as a centred square crop in the avatar circle.
  function photoError(files) {
    if (!files || files.length === 0) return '';
    const file = files[0];
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Choose a JPG, PNG or WebP image.';
    return file.size <= 2 * 1024 * 1024 ? '' : 'The photo is larger than 2 MB. Choose a smaller one.';
  }
  function showAvatar(files) {
    if (!files || files.length === 0 || photoError(files)) {
      avatar.textContent = avatarEmoji;
      return;
    }
    const url = URL.createObjectURL(files[0]);
    const image = new Image();
    image.addEventListener('load', function () {
      const side = Math.min(image.width, image.height);
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 160;
      canvas.getContext('2d').drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, 160, 160);
      const preview = createEl('img', '', 'rounded-circle');
      preview.src = canvas.toDataURL('image/jpeg', 0.85);
      preview.width = 80;
      preview.height = 80;
      preview.alt = 'Selected profile photo';
      avatar.replaceChildren(preview);
      URL.revokeObjectURL(url);
    });
    image.src = url;
  }
  photoInput.addEventListener('change', function () { showAvatar(photoInput.files); });
  form.addEventListener('reset', function () { avatar.textContent = avatarEmoji; });

  const fields = [
    {id: 'reg-name', check: function (value) { return value.length >= 2 && value.length <= 80 && /\p{L}/u.test(value) ? '' : 'Enter your full name (2–80 characters, with letters).'; }},
    {id: 'reg-email', check: function (value) { return isEmail(value) ? '' : 'The e-mail should look like name@example.com.'; }},
    {id: 'reg-phone', check: function (value) { return isPhone(value) ? '' : 'Use +7 and 10 digits, for example +7 701 234 56 78.'; }},
    {id: 'reg-branch', check: function (value) { return findBranch(value) ? '' : 'Choose a branch.'; }},
    {id: 'reg-photo', check: function (value) { return photoError(value); }},
    {id: 'reg-password', check: function (value) { return isStrongPassword(password.value) ? '' : 'Use 8+ characters with an uppercase letter, a lowercase letter, a number and a special character.'; }},
    // A password is not trimmed: spaces in it are part of it, so the confirmation compares the raw values.
    {id: 'reg-password-confirm', check: function () { return password.value !== '' && document.getElementById('reg-password-confirm').value === password.value ? '' : 'The two passwords must be identical.'; }}
  ];

  validateForm(form, fields, function (read) {
    const account = {name: read('reg-name'), email: read('reg-email').toLowerCase(), phone: read('reg-phone'), branch: read('reg-branch'), passwordHash: hashText(password.value)};
    const stored = storageSave('account', account) && storageSave('session', {email: account.email});
    const branch = findBranch(account.branch);
    form.reset();
    showMessage(confirmation, 'Welcome, ' + account.name + '! Your account for ' + account.email + ' (' + branch.name + ' branch) is ready' + (stored ? ' and you are logged in. ' : ', but this browser did not allow saving it. ') + 'The password itself is not stored. ');
    const link = createEl('a', 'Open My profile', 'alert-link');
    link.href = 'profile.html';
    confirmation.append(link);
    confirmation.scrollIntoView({block: 'center'});
  });
});
