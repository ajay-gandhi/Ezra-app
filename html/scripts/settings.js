'use strict';
/* global Messenger, $ */
// Maintain a local copy of all settings
var settings = {
  remember: false,
  id_image: false
};

var update_timeout;

var app = window.coolio;

// Change attributes based on settings object
$(document).ready(function () {

  // Fetch and update settings
  app.request('/settings', null);
  app.recieve('/settings', function (data) {
    $('div#toggle-remember').toggleClass('checked', data.remember);
    $('div#toggle-id-image').toggleClass('checked', data.id_image);
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
      update_settings();
    });
});

/**
 * Conducts the AJAX call to the server to update the settings file
 */
var update_settings = function () {
  // Conduct update after 1 second to prevent multiple web calls if numerous
  // settings are being updated. In this fashion, everything in the settings
  // object will be updated and the new settings will be sent all
  // at once.
  update_timeout = window.setTimeout(function () {
    app.request('/update-settings', settings);
  }, 1000);
};
