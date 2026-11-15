'use strict';
// login.js — plain JavaScript. Logs the visitor in to the account created on the Register page (same browser tab).
// Added since the last defended version: the e-mail and password are really compared with the saved account,
// the error appears next to the wrong field, and a correct login opens the profile page.

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('login-form');
  addPasswordToggles(form);
  const confirmation = createEl('div', '', 'alert alert-success mt-3 hidden');
  confirmation.id = 'login-confirmation';
  confirmation.setAttribute('role', 'status');
  form.after(confirmation);

  const fields = [
    {id: 'login-email', check: function (value) {
      if (!isEmail(value)) return 'The e-mail should look like name@example.com.';
      const account = storageRead('account', null);
      return account && account.email === value.toLowerCase() ? '' : 'No account with this e-mail was found in this browser tab. Register first.';
    }},
    {id: 'login-password', check: function (value, read) {
      const typed = document.getElementById('login-password').value;
      if (typed === '') return 'Enter your password.';
      const account = storageRead('account', null);
      // Only compare when the e-mail belongs to the saved account; otherwise the e-mail field already explains the problem.
      if (!account || account.email !== read('login-email').toLowerCase()) return '';
      return account.passwordHash === hashText(typed) ? '' : 'Wrong password. Try again.';
    }}
  ];

  validateForm(form, fields, function () {
    const account = storageRead('account', null);
    storageSave('session', {email: account.email});
    form.reset();
    showMessage(confirmation, 'Welcome back, ' + account.name + '! Opening your profile…');
    setTimeout(function () { window.location.href = 'profile.html'; }, 1200);
  });
});
