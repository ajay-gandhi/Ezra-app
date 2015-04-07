/*
 * Handles settings events
 */
var ipc = require('ipc');

// Maintain a local copy of all settings
var settings = {
  remember: false,
  id_image: false
}

var update_timeout;

// Change attributes based on settings object
$(document).ready(function () {

  // Fetch and update settings
  $.ajax({
    url: 'http://127.0.0.1:3005/settings',
    method: 'GET'
  }).done(function (data) {
    settings.remember = (data.remember === 'true');
    $('div#toggle-remember').toggleClass('checked', settings.remember);

    settings.id_image = (data.id_image === 'true');
    $('div#toggle-id-image').toggleClass('checked', settings.id_image);
  });

  // Click event for remember me
  $('div#toggle-remember')
    .click(function () {
      settings.remember = !settings.remember;
      $(this).toggleClass('checked');
      update_settings();
    });

  // Click event for ID image
  $('div#toggle-id-image')
    .click(function () {
      settings.id_image = !settings.id_image;
      $(this).toggleClass('checked');

      // Show or hide id image
      $('div#information-module img').parent().parent().toggle();

      update_settings();
    });
});

/**
 * Conducts the AJAX call to the server to update the settings file
 */
var update_settings = function () {
  // Conduct update after 1 second to prevent multiple web calls if numerous
  // settings are being updated. In this fashion, everything in the settings
  // object will be updated and the new settings will be sent to the server all
  // at once.
  update_timeout = window.setTimeout(function () {
    $.ajax({
      url: 'http://127.0.0.1:3005/update-settings',
      method: 'GET',
      data: settings
    });
  }, 1000);
}
