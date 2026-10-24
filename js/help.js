'use strict';
(() => {
  const S = window.Shindal;
  S.byId('faq-0').querySelector('.accordion-body').textContent =
    'Use Booking to prepare a demonstration schedule. For a real appointment and first assessment, contact the branch directly; this form does not send requests.';
  S.byId('faq-3').querySelector('.accordion-body').textContent =
    'Monday–Friday: 08:00–13:00 and 14:00–19:00. Saturday: 08:00–13:00. Sunday: closed.';
  S.byId('question-form').previousElementSibling.textContent =
    'Preview your question locally. For a real reply, contact the branch directly using phone or WhatsApp above.';
  const faq = S.byId('faq-list');
  const search = S.field(faq.parentElement, 'faq-search', 'Search questions');
  faq.before(search.parentElement);
  const count = S.el('p');
  count.setAttribute('aria-live', 'polite');
  faq.before(count);
  const empty = S.el(
    'p',
    'No matching questions. Reset or ask below.',
    'hidden',
  );
  faq.after(empty);
  const filter = () => {
    let found = 0;
    faq.querySelectorAll('.accordion-item').forEach((item) => {
      const match = item.textContent
        .toLowerCase()
        .includes(search.value.trim().toLowerCase());
      item.classList.toggle('hidden', !match);
      if (match) found++;
    });
    count.textContent = `${found} questions found`;
    empty.classList.toggle('hidden', found !== 0);
  };
  search.addEventListener('input', filter);
  faq.before(
    S.button('Reset FAQ search', () => {
      search.value = '';
      filter();
    }),
  );
  filter();
  faq.addEventListener('click', (event) => {
    if (window.bootstrap) return;
    const button = event.target.closest('button');
    if (!button) return;
    const panel = document.querySelector(button.dataset.bsTarget);
    panel.classList.toggle('show');
    button.setAttribute(
      'aria-expanded',
      String(panel.classList.contains('show')),
    );
  });
  S.byId('map-tabs').addEventListener('click', (event) => {
    if (window.bootstrap) return;
    const button = event.target.closest('button');
    if (!button) return;
    document.querySelectorAll('#map-tabs button').forEach((tab) => {
      tab.classList.toggle('active', tab === button);
      tab.setAttribute('aria-selected', String(tab === button));
    });
    document.querySelectorAll('.tab-pane').forEach((panel) => {
      const active = `#${panel.id}` === button.dataset.bsTarget;
      panel.classList.toggle('active', active);
      panel.classList.toggle('show', active);
    });
  });
  const form = S.byId('question-form');
  const text = S.byId('question-text');
  text.maxLength = 1000;
  const counter = S.el('p', '', 'small');
  text.after(counter);
  const update = () => {
    counter.textContent = `${text.value.length}/1000 characters`;
  };
  text.addEventListener('input', update);
  form.addEventListener('reset', () => setTimeout(update, 0));
  update();
  S.validate(
    form,
    () => ({
      'question-name':
        S.byId('question-name').value.trim().length >= 2
          ? ''
          : 'Enter your name.',
      'question-contact':
        S.email(S.byId('question-contact').value) ||
        S.phone(S.byId('question-contact').value)
          ? ''
          : 'Enter a valid email or Kazakhstan phone.',
      'question-text':
        text.value.trim().length >= 20 && text.value.trim().length <= 1000
          ? ''
          : 'Write 20–1000 characters.',
    }),
    () => {
      S.message(
        S.byId('question-confirmation'),
        `${S.reference()}. ${S.byId('question-name').value.trim()}: ${text.value.trim()} Contact: ${S.byId('question-contact').value.trim()}. Question preview only; use the branch phone or WhatsApp above to send a real question. ${S.demo}`,
      );
    },
  );
})();
