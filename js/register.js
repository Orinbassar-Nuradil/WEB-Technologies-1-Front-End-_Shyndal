'use strict';
$(function () {
  const S = window.Shindal;
  const $form = $('#register-form');
  const value = id => String($('#' + id).val() || '').trim();
  $form.find('.small.text-muted').text('Validate details locally. No real account is created and no password is saved.');
  $('#reg-password, #reg-password-confirm').attr('autocomplete', 'new-password');
  const updatePassword = S.passwords($form);
  const $file = $('#reg-photo');
  const $preview = S.make('img', '', 'img-fluid rounded-3 hidden').attr({alt: 'Selected avatar preview', width: 160, height: 160}).insertAfter($file);
  let imageURL = null;
  const photoError = () => {
    const photo = $file.prop('files')?.[0];
    return !photo || (['image/jpeg', 'image/png', 'image/webp'].includes(photo.type) && photo.size <= 2 * 1024 * 1024) ? '' : 'Choose a JPG, PNG or WebP image up to 2 MB.';
  };
  $file.on('change.preview', function () {
    if (imageURL) URL.revokeObjectURL(imageURL);
    const photo = $(this).prop('files')?.[0];
    if (photo && !photoError()) {
      imageURL = URL.createObjectURL(photo);
      $preview.attr('src', imageURL).removeClass('hidden');
    } else $preview.removeAttr('src').addClass('hidden');
  });
  $form.on('reset.preview', function () {
    if (imageURL) URL.revokeObjectURL(imageURL);
    imageURL = null;
    $preview.removeAttr('src').addClass('hidden');
  });
  S.validate($form, () => ({
    'reg-name': value('reg-name').length >= 2 && value('reg-name').length <= 80 ? '' : 'Enter your name (2–80 characters).',
    'reg-email': S.email(value('reg-email')) ? '' : 'Enter a valid email.',
    'reg-phone': S.phone(value('reg-phone')) ? '' : 'Enter +7 and 10 digits.',
    'reg-branch': ['astana', 'kosshy', 'taraz'].includes(value('reg-branch')) ? '' : 'Choose a branch.',
    'reg-photo': photoError(),
    'reg-password': S.strong(String($('#reg-password').val())) ? '' : 'Use 8+ characters with uppercase, lowercase, number and special character.',
    // Password whitespace is significant: never trim the password or its exact confirmation.
    'reg-password-confirm': $('#reg-password-confirm').val() === $('#reg-password').val() && $('#reg-password-confirm').val() !== '' ? '' : 'Passwords must match exactly.'
  }), function () {
    const profile = {name: value('reg-name'), email: value('reg-email'), phone: value('reg-phone'), branch: value('reg-branch')};
    const stored = S.save('profile', profile); // Explicit whitelist: never store a password or serialize the form.
    const text = profile.name + ': validation passed for ' + profile.email + ', ' + profile.phone + ', ' + profile.branch + '. ' + (stored ? 'Demo details saved in this tab. ' : 'Storage unavailable. ') + S.demo;
    $form.trigger('reset'); updatePassword();
    S.message($('#register-confirmation'), text);
  });
});
