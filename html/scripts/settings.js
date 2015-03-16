/*
 * Handles settings events
 */
var ipc = require('ipc');

var settings = {
  remember: false
}

// Change attributes based on settings object
$(document).ready(function () {

  // Fetch and update settings
  $.ajax({
    url: 'http://127.0.0.1:3005/settings',
    method: 'GET'
  }).done(function (data) {
    settings.remember = (data.remember === 'true');
    $('div#toggle-button').toggleClass('checked', settings.remember);
  });

  // Click event for remember me
  $('div#toggle-button')
    .click(function () {
      settings.remember = !settings.remember;
      $(this).toggleClass('checked');

      $.ajax({
        url: 'http://127.0.0.1:3005/update-settings',
        method: 'GET',
        data: settings
      });
    });
});
