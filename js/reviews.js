'use strict';
(() => {
  const S = window.Shindal;
  S.byId('review-form').previousElementSibling.textContent =
    'Reviews added here are local demonstrations in this browser tab. Nothing is sent to administrators.';
  const list = S.byId('reviews-list');
  const form = S.byId('review-form');
  // Retain documentary photo reviews without inventing names, ratings or historical dates.
  const existing = Array.from(list.querySelectorAll('img')).map(
    (img, index) => ({
      id: `photo-${index}`,
      name: 'Parent review — source photo',
      text: 'Open the original review image.',
      image: img.getAttribute('src'),
      branch: '',
      date: null,
    }),
  );
  let submitted = S.read('reviews', []).filter(
    (row) =>
      row &&
      typeof row.name === 'string' &&
      typeof row.text === 'string' &&
      typeof row.id === 'string' &&
      !Number.isNaN(Date.parse(row.date)),
  );
  const renderReview = (review) => {
    const col = S.el('div', '', 'col');
    const card = S.el('article', '', 'soft-card p-3 h-100');
    card.append(S.el('h3', review.name, 'h6'), S.el('p', review.text));
    if (review.image) {
      const link = S.el('a', 'Open original photo');
      link.href = review.image;
      const image = S.el('img', '', 'img-fluid rounded-3');
      image.loading = 'lazy';
      image.src = review.image;
      image.alt = review.name;
      link.prepend(image);
      card.append(link);
    }
    card.append(
      S.el(
        'p',
        review.date
          ? `${review.branch} · ${new Date(review.date).toLocaleString('en-GB', { timeZone: 'Asia/Almaty' })} · Local demo review`
          : 'Source photo: date and author remain in original image.',
        'small text-muted',
      ),
    );
    if (!review.image)
      card.append(
        S.button('Remove this demo review', () => {
          submitted = submitted.filter((item) => item.id !== review.id);
          S.save('reviews', submitted);
          draw();
          S.message(S.byId('review-confirmation'), 'Demo review removed.');
        }),
      );
    col.append(card);
    return col;
  };
  const controls = S.el('div', '', 'mb-3');
  list.before(controls);
  const filter = S.select(controls, 'review-filter', 'Reviews', [
    ['', 'All'],
    ['local', 'Local demo submissions'],
  ]);
  const count = S.el('p');
  count.setAttribute('aria-live', 'polite');
  controls.append(
    count,
    S.button('Reset reviews filter', () => {
      filter.value = '';
      draw();
    }),
  );
  const draw = () => {
    const rows =
      filter.value === 'local' ? submitted : [...submitted, ...existing];
    count.textContent = `${rows.length} reviews`;
    S.render(
      list,
      rows,
      renderReview,
      'No local demo reviews yet. Submit one below.',
    );
  };
  filter.addEventListener('change', draw);
  const text = S.byId('review-text');
  text.maxLength = 1000;
  const counter = S.el('p', '', 'small');
  counter.setAttribute('aria-live', 'polite');
  text.after(counter);
  const update = () => {
    counter.textContent = `${text.value.length}/1000 characters (minimum 20)`;
  };
  text.addEventListener('input', update);
  form.addEventListener('reset', () => setTimeout(update, 0));
  update();
  S.validate(
    form,
    () => ({
      'review-name':
        S.byId('review-name').value.trim().length >= 2
          ? ''
          : 'Enter at least 2 characters.',
      'review-branch': ['astana', 'kosshy', 'taraz'].includes(
        S.byId('review-branch').value,
      )
        ? ''
        : 'Choose a branch.',
      'review-text':
        text.value.trim().length >= 20 && text.value.trim().length <= 1000
          ? ''
          : 'Write 20–1000 characters.',
    }),
    () => {
      submitted.unshift({
        id: S.reference(),
        name: S.byId('review-name').value.trim(),
        text: text.value.trim(),
        branch: S.byId('review-branch').value,
        date: new Date().toISOString(),
      });
      const stored = S.save('reviews', submitted);
      draw();
      form.reset();
      S.message(
        S.byId('review-confirmation'),
        `Review added locally${stored ? ' in this browser tab' : ''}. Nothing was sent to the center. ${S.demo}`,
      );
    },
  );
  const video = S.byId('review-video');
  const source = video.querySelector('source');
  if (source) {
    source.src = 'images/otziv%201.mov';
    source.removeAttribute('type');
    video.load();
  }
  draw();
})();
