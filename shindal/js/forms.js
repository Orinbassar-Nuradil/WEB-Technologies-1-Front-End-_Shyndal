'use strict';
// forms.js — plain-JavaScript form validation shared by the Booking, Register and Login forms.
// Every handler is attached here in code; there is no onclick or onsubmit attribute in the markup.

// Read a field the way the rules need it: checkboxes give true/false, files give a list, text is trimmed.
function readField(input) {
  if (input.type === 'checkbox') return input.checked;
  if (input.type === 'file') return input.files;
  return input.value.trim();
}

function fieldLabel(form, id) {
  const label = form.querySelector('label[for="' + id + '"]');
  return label ? label.textContent.replace('*', '').trim() : id;
}

// Remove the error that sits next to one field.
function clearFieldError(input) {
  const note = document.getElementById(input.id + '-error');
  if (note) note.remove();
  input.classList.remove('error', 'success');
  input.removeAttribute('aria-invalid');
  input.removeAttribute('aria-describedby');
}

// Show the error right next to the field that is wrong (or mark it as correct when message is '').
function showFieldError(input, message) {
  clearFieldError(input);
  if (message === '') {
    input.classList.add('success');
    return;
  }
  input.classList.add('error');
  input.setAttribute('aria-invalid', 'true');
  const note = createEl('p', message, 'error-message');
  note.id = input.id + '-error';
  input.setAttribute('aria-describedby', note.id);
  // A checkbox sits inside a .form-check wrapper: the message goes after the wrapper, not inside the label row.
  const anchor = input.type === 'checkbox' ? input.closest('.form-check') : input;
  anchor.after(note);
}

// fields: [{id: 'phone', check: function (value, read) { return '' or 'error text'; }}]
// read(id) gives the current value of any other field, so a rule can compare two fields.
function validateForm(form, fields, onSuccess) {
  form.setAttribute('novalidate', 'novalidate'); // our messages replace the browser bubbles
  const summary = form.querySelector('.alert-danger');
  const confirmation = form.parentElement.querySelector('[id$="-confirmation"]');

  function read(id) {
    return readField(form.querySelector('[id="' + id + '"]'));
  }
  function errorFor(field) {
    return field.check(read(field.id), read);
  }
  function hideConfirmation() {
    if (confirmation) hideMessage(confirmation);
  }
  function updateSummary(failed) {
    if (!summary) return;
    if (failed.length === 0) hideMessage(summary);
    else showMessage(summary, 'Please fix ' + pluralize(failed.length, 'field', 'fields') + ': ' + failed.map(function (id) { return fieldLabel(form, id); }).join(', ') + '.');
  }
  function invalidIds() {
    return fields.filter(function (field) {
      return document.getElementById(field.id + '-error');
    }).map(function (field) { return field.id; });
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault(); // stop the browser from sending the form and reloading the page
    hideConfirmation();
    // Trim the visible text of every field, so the visitor sees what is actually checked.
    for (const field of fields) {
      const input = form.querySelector('[id="' + field.id + '"]');
      if (input.type === 'text' || input.type === 'email' || input.type === 'tel' || input.tagName === 'TEXTAREA') input.value = input.value.trim();
    }
    const failed = [];
    for (const field of fields) {
      const message = errorFor(field);
      showFieldError(form.querySelector('[id="' + field.id + '"]'), message);
      if (message) failed.push(field.id);
    }
    updateSummary(failed);
    if (failed.length > 0) {
      form.querySelector('[id="' + failed[0] + '"]').focus();
      return;
    }
    onSuccess(read);
  });

  // One delegated listener per event type: it also serves fields that code adds to the form later.
  function recheck(event) {
    const target = event.target;
    const field = fields.find(function (item) { return item.id === target.id; });
    hideConfirmation();
    if (!field) return;
    // Clear the error as soon as it is fixed; rules that depend on other fields are rechecked too.
    for (const other of fields) {
      const input = form.querySelector('[id="' + other.id + '"]');
      const hasError = Boolean(document.getElementById(other.id + '-error'));
      if (other === field || hasError) {
        const message = errorFor(other);
        if (message === '' && hasError) clearFieldError(input);
        else if (message !== '' && other === field && event.type !== 'input') showFieldError(input, message);
        else if (message !== '' && hasError) showFieldError(input, message);
      }
    }
    updateSummary(invalidIds());
  }
  form.addEventListener('input', recheck);
  form.addEventListener('change', recheck);
  form.addEventListener('focusout', function (event) {
    const field = fields.find(function (item) { return item.id === event.target.id; });
    if (!field || readField(event.target) === '') return; // do not shout at a field the visitor only passed through
    showFieldError(event.target, errorFor(field));
    updateSummary(invalidIds());
  });
  form.addEventListener('reset', function () {
    for (const field of fields) clearFieldError(form.querySelector('[id="' + field.id + '"]'));
    if (summary) hideMessage(summary);
    hideConfirmation();
  });
}
