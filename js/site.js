'use strict';
(() => {
  const S = window.Shindal;
  // Keep the original Midterm files intact; changes below affect the live DOM only.
  document.addEventListener('change', (event) => {
    if (event.target.tagName === 'SELECT')
      event.target.classList.toggle('selected', event.target.value !== '');
  });
  const auth = S.byId('login-form') || S.byId('register-form');
  if (
    !location.pathname.endsWith('/index.html') &&
    !location.pathname.endsWith('/') &&
    !location.pathname.endsWith('/services.html')
  )
    document.querySelector('.cta-band')?.remove();
  const nav = S.byId('primary-nav');
  const account = S.byId('account-menu')?.parentElement;
  const book = account?.nextElementSibling;
  if (book?.getAttribute('href') === 'booking.html') account.before(book);
  if (auth) return;
  const floating = document.querySelector('.floating-contact');
  if (floating) {
    const root = S.el('div', '', 'position-fixed bottom-0 end-0 m-3');
    const panel = S.el('section', '', 'card soft-card p-3 mb-2 hidden');
    panel.id = 'contact-options';
    panel.setAttribute('aria-label', 'Contact a branch');
    const toggle = S.button('Contact us', () =>
      setOpen(panel.classList.contains('hidden')),
    );
    toggle.className = 'btn btn-brand';
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    const branch = S.select(
      panel,
      'contact-branch',
      'Choose a branch',
      window.ShindalBranches.map((item) => [item.id, item.name]),
    );
    const selected = S.read('contact-branch', 'astana');
    if (window.ShindalBranches.some((item) => item.id === selected))
      branch.value = selected;
    const address = S.el('p', '', 'small');
    const call = S.el('a', '', 'btn btn-outline-brand mb-2');
    const write = S.el('a', 'Write on WhatsApp', 'btn btn-brand');
    write.target = '_blank';
    write.rel = 'noopener';
    panel.append(address, call, write);
    const update = () => {
      const item = window.ShindalBranches.find(
        (item) => item.id === branch.value,
      );
      address.textContent = item.address;
      call.textContent = `Call ${item.phone}`;
      call.href = `tel:${item.number}`;
      write.href = `https://wa.me/${item.number.replace('+', '')}`;
      S.save('contact-branch', item.id);
    };
    const setOpen = (open) => {
      panel.classList.toggle('hidden', !open);
      toggle.setAttribute('aria-expanded', String(open));
    };
    branch.addEventListener('change', update);
    root.append(panel, toggle);
    floating.replaceWith(root);
    update();
    root.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse') setOpen(true);
    });
    root.addEventListener('pointerleave', (event) => {
      if (
        event.pointerType === 'mouse' &&
        !root.contains(document.activeElement)
      )
        setOpen(false);
    });
    root.addEventListener('focusout', (event) => {
      if (!root.contains(event.relatedTarget)) setOpen(false);
    });
    root.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggle.focus();
      }
    });
    document.addEventListener('click', (event) => {
      if (!root.contains(event.target)) setOpen(false);
    });
  }
  // Bootstrap already existed at Midterm. Provide DOM-only fallbacks if its CDN is unavailable.
  nav?.addEventListener('click', (event) => {
    if (window.bootstrap) return;
    const toggle = event.target.closest('[data-bs-toggle]');
    if (!toggle) return;
    const target =
      toggle.dataset.bsToggle === 'dropdown'
        ? toggle.nextElementSibling
        : document.querySelector(toggle.dataset.bsTarget);
    target?.classList.toggle('show');
    toggle.setAttribute(
      'aria-expanded',
      String(target?.classList.contains('show')),
    );
  });
  const hours =
    'Mon–Fri 08:00–13:00, 14:00–19:00 · Sat 08:00–13:00 · Sun closed';
  const copyright = S.byId('site-footer')?.querySelector('p');
  if (copyright) {
    const mail = copyright.querySelector('a');
    copyright.replaceChildren(
      document.createTextNode(`© 2026 Shindal. ${hours} · `),
    );
    if (mail) copyright.append(mail);
  }
  document.querySelectorAll('#main p').forEach((node) => {
    if (
      /Saturday.*appointment|Mon.?Fri.*08:00/.test(node.textContent) &&
      !node.querySelector('a')
    )
      node.textContent = hours;
  });
})();
