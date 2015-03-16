/*
 * Handles settings events
 */
var ipc = require('ipc');

var settings = {
  remember: false
}

// Change attributes based on settings object
$(document).ready(function () {
  $('div#toggle-button')
    .click(function () {
      settings.remember = !settings.remember;
      $(this).toggleClass('checked');
      ipc.send('settings-update', JSON.stringify(settings));
    });
});
