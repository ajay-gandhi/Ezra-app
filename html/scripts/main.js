var ipc = require('ipc');

$(document).ready(function () {
  // Meta actions (close, minimize)
  $('button#close').click(function () {
    ipc.send('close-window-event', 'true');
  });
  $('button#minimize').click(function () {
    ipc.send('minimize-window-event', 'true');
  });

  get_courses(function (data) {
    $('div#schedule').text(JSON.stringify(data));
  });
});

/**
 * Makes an API request to fetch the student's courses
 * Requires: [function] callback - A function to call after the AJAX call
 *              returns the courses
 */
var get_courses = function(callback) {
  $.ajax({
    url: 'http://127.0.0.1:3005/courses',
    method: 'GET'
  }).done(function (data) {
    data = JSON.parse(data);
    callback(data);
  });
}