'use strict';
// dom.js — plain-JavaScript helpers that build and fill page elements.
// Used by the plain-JavaScript features only (main.js, services.js, booking.js, register.js, login.js).

// Create an element with text and CSS classes. textContent keeps visitor text safe (never parsed as HTML).
function createEl(tag, text, classes) {
  const node = document.createElement(tag);
  if (text) node.textContent = text;
  if (classes) node.className = classes;
  return node;
}

// Fill a container from an array: one element per item, built by the `build` function.
// If the array is empty the container says so, instead of staying blank.
function renderList(container, items, build, emptyText, emptyClasses) {
  container.replaceChildren();
  if (items.length === 0) {
    container.append(createEl('p', emptyText, emptyClasses || 'col-12 text-muted'));
    return 0;
  }
  for (const item of items) container.append(build(item));
  return items.length;
}

// Show a message in one of the page's prepared alert boxes (they are hidden by default).
function showMessage(box, text) {
  box.textContent = text;
  box.classList.remove('hidden');
}

function hideMessage(box) {
  box.textContent = '';
  box.classList.add('hidden');
}

function pluralize(count, one, many) {
  return count + ' ' + (count === 1 ? one : many);
}
