/*
 * Handles settings events
 */
var ipc = require('ipc');

$(document).ready(function () {
  $('button#toggle-remember').click(function () {
    ipc.send('toggle-remember', 'true');
  });
});