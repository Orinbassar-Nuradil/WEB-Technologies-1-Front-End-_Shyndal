'use strict';
const fs = require('node:fs'),
  path = require('node:path'),
  vm = require('node:vm');
const { parseHTML } = require('linkedom');
function load(page, seed = {}, options = {}) {
  const root = path.resolve(__dirname, '..');
  const { window: w, document } = parseHTML(
    fs.readFileSync(path.join(root, page), 'utf8'),
  );
  const current = new WeakMap(),
    defaults = new WeakMap(),
    checked = new WeakMap(),
    files = new WeakMap();
  for (const el of document.querySelectorAll('input,textarea'))
    defaults.set(el, el.getAttribute('value') || el.textContent || '');
  const selectProto = w.HTMLSelectElement.prototype;
  Object.defineProperty(selectProto, 'value', {
    configurable: true,
    get() {
      const option = Array.from(this.options).find((o) =>
        o.hasAttribute('selected'),
      );
      return (
        option?.value || (this._noSelection ? '' : this.options[0]?.value || '')
      );
    },
    set(value) {
      let found = false;
      for (const option of this.options) {
        const match = option.value === String(value) && !found;
        option.toggleAttribute('selected', match);
        if (match) found = true;
      }
      this._noSelection = !found;
    },
  });
  Object.defineProperty(selectProto, 'selectedOptions', {
    configurable: true,
    get() {
      return Array.from(this.options).filter(
        (o) => o.value === this.value && !this._noSelection,
      );
    },
  });
  for (const proto of [
    w.HTMLInputElement.prototype,
    w.HTMLTextAreaElement.prototype,
  ]) {
    Object.defineProperty(proto, 'value', {
      configurable: true,
      get() {
        return current.has(this)
          ? current.get(this)
          : defaults.get(this) || this.getAttribute('value') || '';
      },
      set(v) {
        current.set(this, String(v));
      },
    });
    Object.defineProperty(proto, 'defaultValue', {
      configurable: true,
      get() {
        return defaults.get(this) || '';
      },
      set(v) {
        defaults.set(this, String(v));
      },
    });
  }
  Object.defineProperty(w.HTMLInputElement.prototype, 'checked', {
    configurable: true,
    get() {
      return checked.has(this)
        ? checked.get(this)
        : this.hasAttribute('checked');
    },
    set(v) {
      checked.set(this, Boolean(v));
    },
  });
  Object.defineProperty(w.HTMLInputElement.prototype, 'files', {
    configurable: true,
    get() {
      return files.get(this) || [];
    },
    set(v) {
      files.set(this, v);
    },
  });
  Object.defineProperty(document, 'activeElement', {
    configurable: true,
    value: document.body,
    writable: true,
  });
  w.HTMLElement.prototype.focus = function () {
    document.activeElement = this;
  };
  const nativeCreate = document.createElement.bind(document);
  document.createElement = function (tag) {
    const node = nativeCreate(tag);
    decorate(node);
    return node;
  };
  function decorate(form) {
    if (form.tagName !== 'FORM') return;
    Object.defineProperty(form, 'elements', {
      configurable: true,
      get() {
        return this.querySelectorAll('input,select,textarea,button');
      },
    });
    form.reset = function () {
      this.dispatchEvent(new w.Event('reset', { bubbles: true }));
      for (const input of this.elements) {
        if (input.tagName === 'SELECT') {
          const option = Array.from(input.options).find(
            (o) => o.defaultSelected,
          );
          input.value = option?.value || input.options[0]?.value || '';
        } else if (input.tagName !== 'BUTTON') {
          input.value = input.defaultValue;
          input.checked = false;
          if (input.type === 'file') input.files = [];
        }
      }
    };
  }
  document.querySelectorAll('form').forEach(decorate);
  document
    .querySelectorAll('video')
    .forEach((video) => (video.load = () => {}));
  const storage = new Map(
    Object.entries(seed).map(([k, v]) => [`shindal-${k}`, JSON.stringify(v)]),
  );
  const sessionStorage = {
    getItem: (k) => {
      if (options.noStorage) throw Error('denied');
      return storage.get(k) || null;
    },
    setItem: (k, v) => {
      if (options.noStorage) throw Error('denied');
      storage.set(k, v);
    },
  };
  const browser = { document, addEventListener: w.addEventListener.bind(w) };
  const NativeDate = Date;
  const fixed = '2026-10-24T05:00:00+05:00';
  class ClockDate extends NativeDate {
    constructor(...args) {
      super(...(args.length ? args : [fixed]));
    }
    static now() {
      return new NativeDate(fixed).getTime();
    }
  }
  const ctx = vm.createContext({
    window: browser,
    document,
    Intl,
    Date: ClockDate,
    Math,
    JSON,
    URLSearchParams,
    URL: { createObjectURL: () => 'blob:test', revokeObjectURL() {} },
    location: {
      pathname: `/${page}`,
      search: options.search || '',
      hash: options.hash || '',
    },
    history: { length: 1, back() {} },
    sessionStorage,
    setTimeout,
    console,
  });
  for (const script of document.querySelectorAll('script[src]')) {
    const src = script.getAttribute('src');
    if (src.startsWith('js/'))
      vm.runInContext(
        fs.readFileSync(path.join(root, src.split('?')[0]), 'utf8'),
        ctx,
        { filename: src },
      );
  }
  const find = (id) => {
    const node = document.getElementById(id);
    if (!node) throw Error(`Missing element ${id}`);
    return node;
  };
  const fire = (node, type) =>
    node.dispatchEvent(new w.Event(type, { bubbles: true, cancelable: true }));
  const change = (id, value) => {
    find(id).value = value;
    fire(find(id), 'change');
  };
  const input = (id, value) => {
    find(id).value = value;
    fire(find(id), 'input');
  };
  const submit = (id) => fire(find(id), 'submit');
  const click = (node) => fire(node, 'click');
  const read = (key) => JSON.parse(storage.get(`shindal-${key}`) || 'null');
  return {
    document,
    window: browser,
    find,
    fire,
    change,
    input,
    submit,
    click,
    read,
    storage,
    ctx,
  };
}
module.exports = { load };
