'use strict';
// account.js — plain JavaScript shared by the Register and Login pages: show/hide password buttons.
// One delegated click handler on the form serves every password field in it.

function addPasswordToggles(form) {
  for (const input of form.querySelectorAll('input[type="password"]')) {
    const button = createEl('button', 'Show password', 'btn btn-outline-brand btn-sm mt-2');
    button.type = 'button';
    button.dataset.passwordFor = input.id;
    button.setAttribute('aria-controls', input.id);
    button.setAttribute('aria-pressed', 'false');
    input.after(button);
  }
  form.addEventListener('click', function (event) {
    const button = event.target.closest('[data-password-for]');
    if (!button) return;
    const input = document.getElementById(button.dataset.passwordFor);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    button.textContent = show ? 'Hide password' : 'Show password';
    button.setAttribute('aria-pressed', String(show));
  });
  // After "Clear" the fields are empty again, so every field is hidden again too.
  form.addEventListener('reset', function () {
    for (const button of form.querySelectorAll('[data-password-for]')) {
      document.getElementById(button.dataset.passwordFor).type = 'password';
      button.textContent = 'Show password';
      button.setAttribute('aria-pressed', 'false');
    }
  });
}
