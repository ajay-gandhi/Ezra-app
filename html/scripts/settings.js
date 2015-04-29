'use strict';

/* Fetches and enacts settings. Also requests updates */

// Maintain a local copy of all settings 
var settings;

var app = window.messenger;

// Change attributes based on settings object
$(document).ready(function () {

  // Fetch and update settings
  app.request('/settings', null);
  app.receive('/settings', function (data) {
    settings = data;
    $('input#toggle-remember-box').prop('checked', data.remember);
    $('input#toggle-autologin-box').prop('checked', data.autologin);
    $('input#toggle-id-image-box').prop('checked', data.hide_id_image);

    // Disable remember me if autologin
    if (settings.autologin)
      $('input#toggle-remember-box').prop('disabled', true);
  });

  // Click event for remember me
  $('div#toggle-remember')
    .click(function () {
      if (!settings.autologin) {
        settings.remember = !settings.remember;
        $('input#toggle-remember-box').prop('checked', settings.remember);
        update_settings();
      }
    });

  // Click event for autologin
  $('div#toggle-autologin')
    .click(function () {
      settings.autologin = !settings.autologin;
      $('input#toggle-autologin-box').prop('checked', settings.autologin);

      // Remember me is required for autologin
      if (settings.autologin) {
        // If autologin, disable remember me
        settings.remember = true;
        $('input#toggle-remember-box').prop('checked', settings.remember);
        $('input#toggle-remember-box').prop('disabled', true);

      } else {
        // Enable input
        $('input#toggle-remember-box').prop('disabled', false);
      }

      update_settings();
    });

  // Click event for ID image
  $('div#toggle-id-image')
    .click(function () {
      settings.hide_id_image = !settings.hide_id_image;
      $('input#toggle-id-image-box').prop('checked', settings.hide_id_image);

      // Show or hide id image
      $('div#information-module img').parent().parent().toggle();

      update_settings();
    });
});

/**
 * Conducts the AJAX call to the server to update the settings file
 */
var update_settings = function () {
  app.request('/update-settings', settings);
  app.receive('/update-settings', function () {});
}
