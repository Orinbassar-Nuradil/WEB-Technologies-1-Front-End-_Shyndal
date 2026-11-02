'use strict';
$(function () {
  const S = window.Shindal;
  const $form = $('#login-form');
  $('#login-password').attr('autocomplete', 'current-password');
  const update = S.passwords($form);
  $form.find('p').text('This form validates input only; it never authenticates you. My Profile displays local demo details.');
  const $result = S.make('p', '', 'mt-3 hidden').attr('id', 'login-confirmation').insertAfter($form);
  S.validate($form, () => ({
    'login-email': S.email(String($('#login-email').val()).trim()) ? '' : 'Enter a valid email.',
    'login-password': S.strong(String($('#login-password').val())) ? '' : 'Use 8+ characters with uppercase, lowercase, number and special character.'
  }), function () {
    $form.trigger('reset'); update();
    S.message($result, 'Input validation passed. No user was authenticated. ' + S.demo);
  });
});
