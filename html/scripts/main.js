var ipc = require('ipc');
var used_colors = [];

$(document).ready(function () {
  // Meta actions (close, minimize)
  $('button#close').click(function () {
    ipc.send('close-window-event', 'true');
  });
  $('button#minimize').click(function () {
    ipc.send('minimize-window-event', 'true');
  });

  for (var t = 800; t <= 2300; t += 100) {
    $('table#wcalendar').append('<tr>');
    var tr = $('table#wcalendar tr').last();
    for (var d = 0; d < 8; d++) {
      if (d == 0) {
        tr.append('<th>' + stringify_time(t) + '</th>');
      } else {
        tr.append('<td>&nbsp;</td>');
      }
    }
    $('table#wcalendar').append('</tr>');
  }

  get_courses(function (data) {
    // Fill calendar
    for (var i = 0; i < data.length; i++) {
      // Add event for each day
      var bg_color = random_color();
      for (var c = 0; c < data[i].days.length; c++) {
        // Calculate dependent CSS properties
        var loc_top  = Math.floor((intify_time(data[i].start) - 800) / 1.615);
        var loc_left = (num_of_day(data[i].days[c]) * 118) + 61;
        var height   = (intify_time(data[i].end) - intify_time(data[i].start)) / 1.615;

        $('div#module-container')
          .append('<div class="wcalendar-event" id="' + data[i].number + c + '"></div>');

        $('div#' + data[i].number + c)
          .last()
          .text(data[i].id)
          .css({
            backgroundColor: bg_color,
            top: loc_top + 'px',
            left: loc_left + 'px',
            height: height + 'px'
          });
      }
    }
  });
});

/**
 * Makes a GET request to fetch the student's courses
 * Requires: [function] callback - A function to call after the AJAX call
 *   returns the courses
 */
var get_courses = function(callback) {
  $.ajax({
    url: 'http://127.0.0.1:3005/courses',
    method: 'GET'
  }).done(function (data) {
    callback(data);
  });
}

/**
 * Generates a random pastel color
 * Returns: [String] The hex code (including #) of a pleasing color
 */
var random_color = function () {
  var r = (Math.round(Math.random()* 127) + 127).toString(16);
  var g = (Math.round(Math.random()* 127) + 127).toString(16);
  var b = (Math.round(Math.random()* 127) + 127).toString(16);
  var ans = r + g + b;
  while (used_colors.indexOf(ans) >= 0) {
    r = (Math.round(Math.random()* 127) + 127).toString(16);
    g = (Math.round(Math.random()* 127) + 127).toString(16);
    b = (Math.round(Math.random()* 127) + 127).toString(16);
    ans = r + g + b;
  }
  return '#' + r + g + b;
}

/**
 * Returns a number representation for a day [0-6]
 * Requires: [String] day - A day of the week of the format Mo, Fr, etc.
 * Returns: [int] The number representation for a day of the week
 */
var num_of_day = function (day) {
  var days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  return days.indexOf(day);
}

/**
 * Given a time as string, converts the string into an integer format HHMM
 * Requires: [String] time - The time to convert of format HH:MM[am|pm]
 * Returns: [int] The intified time
 */
var intify_time = function (time) {
  var pieces = time.split(':');
  var hour = parseInt(pieces[0]);
  var min = parseInt(pieces[1].substr(0, 2));

  if (pieces[1].substr(2).toLowerCase() == 'pm' && hour != 12) {
    hour += 12;
  }

  return (hour * 100) + min;
}

/**
 * Given an integer time, stringifies the integer into the format HH:MM[am|pm]
 * Requires: [int] time - The time to stringify
 *           [bool] ampm - Whether to include am/pm
 * Returns: [String] The stringified time
 */
var stringify_time = function (time, ampm) {
  time = parseInt(time);

  var hour = Math.floor(time / 100);
  var ap;
  // Hour always <= 12
  if (hour > 12) {
    ap = 'pm';
    hour -= 12;
  } else {
    if (hour == 12) {
      ap = 'pm';
    } else {
      ap = 'am';
    }
  }
  if (hour == 0) {
    hour = 12;
  }

  var min = time % 100;
  if (min <= 9) {
    min = '0' + min;
  }
  var stringified = hour + '<span class="ampm">' + ap + '</span>';
  return stringified;
}