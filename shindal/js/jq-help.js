'use strict';
// jq-help.js — jQuery. Visitor questions: "Where is the answer to my question?" and "Where is the branch?"
// Added since the last defended version: matching words are highlighted, only one answer is open at a time,
// the map tab opens from the link on the home page (help.html#map-kosshy) and the question form
// now gives a finished answer with the phone numbers of all branches.

// Keep local branch contacts usable while the map or external libraries are loading.
document.addEventListener('DOMContentLoaded', function () {
  const tabs = Array.from(document.querySelectorAll('#map-tabs [role="tab"]'));
  function selectBranch(selected) {
    for (const tab of tabs) {
      const active = tab === selected;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
      document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
    }
  }
  function openLinkedBranch() {
    const tab = tabs.find(function (item) { return '#' + item.getAttribute('aria-controls') === window.location.hash; });
    if (tab) {
      selectBranch(tab);
      document.querySelector('.help-branches').scrollIntoView({block: 'start'});
    }
  }
  tabs.forEach(function (tab, index) {
    tab.addEventListener('click', function () { selectBranch(tab); });
    tab.addEventListener('keydown', function (event) {
      const next = {Home: 0, End: tabs.length - 1, ArrowLeft: (index + tabs.length - 1) % tabs.length, ArrowRight: (index + 1) % tabs.length}[event.key];
      if (next === undefined) return;
      event.preventDefault();
      selectBranch(tabs[next]);
      tabs[next].focus();
    });
  });
  window.addEventListener('hashchange', openLinkedBranch);
  openLinkedBranch();
});

$(function () {
  const $faq = $('#faq-list');

  // ---------- FAQ search ----------
  const $searchBox = $('<div>').addClass('mb-3 d-flex flex-wrap align-items-end gap-2');
  const $search = $('<input>').addClass('form-control').attr({id: 'faq-search', type: 'search', placeholder: 'For example: price'});
  $searchBox.append($('<div>').append($('<label>').addClass('form-label').attr('for', 'faq-search').text('Search questions'), $search));
  const $resetSearch = jqEl('button', 'Clear search', 'btn btn-outline-brand btn-sm').attr('type', 'button');
  $searchBox.append($resetSearch);
  const $count = jqEl('p', '', 'small fw-semibold').attr({id: 'faq-count', 'aria-live': 'polite'});
  const $none = jqEl('p', '', 'text-muted hidden').attr('id', 'faq-empty');
  $faq.before($searchBox, $count).after($none);

  function filterFaq() {
    const word = jqValue($search).toLowerCase();
    $faq.find('.accordion-item').each(function () {
      const $item = $(this);
      const match = word === '' || $item.text().toLowerCase().indexOf(word) !== -1;
      // The existing state classes do the work: "hidden" hides, "highlight" marks the matching question.
      $item.toggleClass('hidden', !match);
      $item.find('.accordion-button').toggleClass('highlight', match && word !== '');
    });
    const shown = $faq.find('.accordion-item:not(.hidden)').length;
    $count.text(shown + (shown === 1 ? ' question' : ' questions') + ' shown');
    $none.toggleClass('hidden', shown > 0).text('No question contains “' + jqValue($search) + '”. Clear the search or send us your question below.');
  }
  $search.on('input', filterFaq);
  $resetSearch.on('click', function () { $search.val('').trigger('input').trigger('focus'); });

  // ---------- accordion: jQuery owns the open/close effect, so Bootstrap's own toggle is switched off ----------
  $faq.find('.accordion-button').removeAttr('data-bs-toggle').end().find('.accordion-collapse').removeAttr('data-bs-parent');
  $faq.on('click', '.accordion-button', function () {
    const $button = $(this);
    const $item = $button.closest('.accordion-item');
    const $answer = $item.find('.accordion-collapse');
    const opening = !$answer.hasClass('show');
    // Close the other open answers: siblings -> find -> slideUp is a chain of three methods.
    $item.siblings().find('.accordion-collapse.show').stop(true, true).slideUp(180, function () { $(this).removeClass('show'); });
    $item.siblings().find('.accordion-button').addClass('collapsed').attr('aria-expanded', 'false');
    $button.toggleClass('collapsed', !opening).attr('aria-expanded', String(opening));
    if (opening) $answer.stop(true, true).hide().addClass('show').slideDown(180);
    else $answer.stop(true, true).slideUp(180, function () { $(this).removeClass('show'); });
  });

  // ---------- question form ----------
  const $form = $('#question-form');
  // This site has no server, so the text above the form must not promise a reply by an administrator.
  $form.prev('p').text('Write your question here and check it. This site has no server and cannot deliver it: after you press Send question you get the phone numbers of the branches to call or message.');
  const $text = $('#question-text').attr('maxlength', 1000);
  const $counter = jqEl('p', '', 'small text-muted mb-0').insertAfter($text);
  const drawCounter = function () { $counter.text($text.val().length + ' / 1000 characters (at least 20)'); };
  $text.on('input', drawCounter);
  $form.on('reset', function () { setTimeout(drawCounter, 0); });
  drawCounter();

  jqValidate($form, [
    {id: 'question-name', label: 'Your name', check: function (value) { return value.length >= 2 && value.length <= 80 && /\p{L}/u.test(value) ? '' : 'Enter your name (2–80 characters, with letters).'; }},
    {id: 'question-contact', label: 'Phone or email', check: function (value) { return isEmail(value) || isPhone(value) ? '' : 'Enter a valid e-mail (name@example.com) or a phone (+7 and 10 digits).'; }},
    {id: 'question-text', label: 'Your question', check: function (value) { return value.length >= 20 && value.length <= 1000 ? '' : 'Write between 20 and 1000 characters (now ' + value.length + ').'; }}
  ], function (read) {
    const name = read('question-name');
    const contact = read('question-contact');
    const questions = storageRead('questions', []);
    questions.push({name: name, contact: contact, text: read('question-text'), date: new Date().toISOString()});
    const stored = storageSave('questions', questions);
    $form.get(0).reset();
    const phones = BRANCHES.map(function (branch) { return branch.name + ' ' + branch.phone; }).join(' · ');
    jqShow($('#question-confirmation'), 'Thank you, ' + name + '! Your question is written down' + (stored ? ' in this browser tab' : '') + ', but this site has no server and cannot send it. For a real answer call: ' + phones + '.');
  });

  filterFaq();
});
