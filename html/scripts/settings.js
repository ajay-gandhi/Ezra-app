'use strict';

/* Fetches and enacts settings. Also requests updates */

// Maintain a local copy of all settings 
var settings = {
  remember: false,
  hide_id_image: false
}

var update_timeout;

var app = window.messenger;

// Change attributes based on settings object
$(document).ready(function () {

  // Fetch and update settings
  app.request('/settings', null);
  app.receive('/settings', function (data) {
    settings.remember      = data.remember;
    settings.hide_id_image = data.hide_id_image;
    $('div#toggle-remember').toggleClass('checked', data.remember);
    $('div#toggle-id-image').toggleClass('checked', data.hide_id_image);
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
      settings.hide_id_image = !settings.hide_id_image;
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
  // Conduct update after 1 second to prevent multiple calls if numerous
  // settings are being updated. In this fashion, everything in the settings
  // object will be updated and the new object will be sent all at once.
  update_timeout = window.setTimeout(function () {
    app.request('/update-settings', settings);
  }, 1000);
};
