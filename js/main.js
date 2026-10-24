'use strict';
window.Shindal = (() => {
  const services = window.ShindalData;
  const demo =
    'Demonstration only: no data is sent to a server and no real booking, payment, order or account is created.';
  const byId = (id) => document.getElementById(id);
  const el = (tag, text = '', classes = '') => {
    const node = document.createElement(tag);
    node.textContent = text;
    if (classes) node.className = classes;
    return node;
  };
  const money = (amount) =>
    `${new Intl.NumberFormat('en-KZ').format(amount)} ₸`;
  const findService = (id) => services.find((service) => service.id === id);
  const total = (rows) =>
    rows.reduce(
      (sum, row) => sum + (findService(row.id)?.price || 0) * row.quantity,
      0,
    );
  const reference = () =>
    `DEMO-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 9000) + 1000}`;
  const read = (key, fallback) => {
    try {
      const parsed = JSON.parse(sessionStorage.getItem(`shindal-${key}`));
      if (Array.isArray(fallback))
        return Array.isArray(parsed) ? parsed : fallback;
      return parsed ?? fallback;
    } catch {
      return fallback;
    }
  };
  const save = (key, value) => {
    try {
      sessionStorage.setItem(`shindal-${key}`, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  };
  const message = (node, text) => {
    node.textContent = text;
    node.classList.remove('hidden');
    node.setAttribute('role', 'status');
    node.setAttribute('aria-live', 'polite');
  };
  const button = (text, action) => {
    const node = el('button', text, 'btn btn-outline-brand btn-sm');
    node.type = 'button';
    node.addEventListener('click', action);
    return node;
  };
  const field = (parent, id, label, type = 'text') => {
    const wrap = el('div', '', 'mb-3');
    const caption = el('label', label, 'form-label');
    caption.htmlFor = id;
    const input = el('input', '', 'form-control');
    input.id = id;
    input.type = type;
    wrap.append(caption, input);
    parent.append(wrap);
    return input;
  };
  const select = (parent, id, label, options) => {
    const input = field(parent, id, label);
    const node = el('select', '', 'form-select');
    node.id = id;
    options.forEach(([value, text]) => {
      const option = el('option', text);
      option.value = value;
      node.append(option);
    });
    input.replaceWith(node);
    return node;
  };
  const render = (
    parent,
    items,
    make,
    empty = 'No matches. Change your choices or reset.',
  ) => {
    parent.replaceChildren();
    if (items.length === 0) parent.append(el('p', empty, 'col-12'));
    else items.forEach((item) => parent.append(make(item)));
  };
  const email = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  const phone = (value) =>
    /^(?:\+7|8)\d{10}$/.test(value.replace(/[\s()-]/g, ''));
  const strong = (value) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/.test(value);
  const validate = (form, rules, success) => {
    const clear = (input) => {
      byId(`${input.id}-error`)?.remove();
      input.classList.remove('error', 'success');
      input.removeAttribute('aria-invalid');
      const descriptions = (input.getAttribute('aria-describedby') || '')
        .split(' ')
        .filter((id) => id && id !== `${input.id}-error`);
      if (descriptions.length)
        input.setAttribute('aria-describedby', descriptions.join(' '));
      else input.removeAttribute('aria-describedby');
    };
    const hideConfirmation = () =>
      form.parentElement
        .querySelectorAll('[id$="-confirmation"]')
        .forEach((node) => node.classList.add('hidden'));
    ['input', 'change'].forEach((type) =>
      form.addEventListener(type, (event) => {
        if (event.target.id) clear(event.target);
        hideConfirmation();
      }),
    );
    form.addEventListener('reset', () => {
      Array.from(form.elements).forEach(clear);
      hideConfirmation();
    });
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      hideConfirmation();
      let first = null;
      Object.entries(rules()).forEach(([id, error]) => {
        const input = byId(id);
        if (!input) throw new Error(`Validation field missing: ${id}`);
        clear(input);
        input.classList.add(error ? 'error' : 'success');
        input.setAttribute('aria-invalid', String(Boolean(error)));
        if (error) {
          const note = el('p', error, 'error-message');
          note.id = `${id}-error`;
          // Place errors outside password input-groups so the eye stays aligned.
          const anchor = input.parentElement.classList.contains('input-group')
            ? input.parentElement
            : input;
          anchor.after(note);
          input.setAttribute(
            'aria-describedby',
            `${input.getAttribute('aria-describedby') || ''} ${note.id}`.trim(),
          );
          first ||= input;
        }
      });
      if (first) first.focus();
      else success();
    });
  };
  const icon = (kind = 'eye') => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '20');
    svg.setAttribute('height', '20');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.7');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    const path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute(
      'd',
      kind === 'back'
        ? 'm14 6-6 6 6 6M8 12h12'
        : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
    );
    svg.append(path);
    if (kind === 'eye-off') {
      const slash = document.createElementNS(svg.namespaceURI, 'path');
      slash.setAttribute('d', 'M3 3 21 21');
      svg.append(slash);
    }
    return svg;
  };
  const passwordControl = (input) => {
    input.removeAttribute('name');
    const wrap = el('div', '', 'input-group');
    input.before(wrap);
    wrap.append(input);
    const toggle = button('', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      paint();
    });
    toggle.className = 'btn btn-outline-brand';
    toggle.setAttribute('aria-controls', input.id);
    const paint = () => {
      const visible = input.type === 'text';
      toggle.replaceChildren(icon(visible ? 'eye-off' : 'eye'));
      toggle.setAttribute(
        'aria-label',
        `${visible ? 'Hide' : 'Show'} ${input.id.includes('confirm') ? 'confirmation ' : ''}password`,
      );
      toggle.setAttribute('aria-pressed', String(visible));
    };
    wrap.append(toggle);
    paint();
    return () => {
      input.type = 'password';
      paint();
    };
  };
  const passwordChecklist = (input) => {
    const list = el(
      'ul',
      '',
      'list-unstyled d-flex flex-wrap gap-2 small mt-2',
    );
    list.id = `${input.id}-requirements`;
    input.parentElement.after(list);
    input.setAttribute('aria-describedby', list.id);
    const update = () =>
      render(
        list,
        [
          [/^.{8,}$/, '8+ characters'],
          [/[A-Z]/, 'Uppercase'],
          [/[a-z]/, 'Lowercase'],
          [/\d/, 'Number'],
          [/[^A-Za-z0-9]/, 'Symbol'],
        ],
        ([pattern, label]) => {
          const met = pattern.test(input.value);
          return el(
            'li',
            `${met ? '✓' : '○'} ${label}`,
            `badge rounded-pill ${met ? 'success bg-light' : 'bg-light text-muted'}`,
          );
        },
      );
    input.addEventListener('input', update);
    update();
    return update;
  };
  return {
    services,
    demo,
    el,
    byId,
    money,
    findService,
    total,
    reference,
    read,
    save,
    message,
    button,
    field,
    select,
    render,
    email,
    phone,
    strong,
    validate,
    icon,
    passwordControl,
    passwordChecklist,
  };
})();
