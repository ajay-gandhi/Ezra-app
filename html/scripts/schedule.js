/**
 * Handles the fetching and display of the student's schedule
 */
$(document).ready(function () {
  // Create the background table cells
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

  // Insert labels for days of the week
  $('div#schedule-wrapper')
    .append('<div id="day-label-container"></div>');

  // Labels for days of the week
  $('div#day-label-container')
    .append('<div class="day-label1">Mon</div>')
    .append('<div class="day-label1">Tue</div>')
    .append('<div class="day-label1">Wed</div>')
    .append('<div class="day-label1">Thu</div>')
    .append('<div class="day-label2">Fri</div>')
    .append('<div class="day-label2">Sat</div>')
    .append('<div class="day-label2">Sun</div>');

  get_courses(function (data) {
    // Fill calendar
    for (var i = 0; i < data.length; i++) {
      // Add event for each day
      var course_seed = parseInt(data[i].number.split('-')[0]);
      var bg_color = random_color(course_seed);
      var border_color = darker_color(bg_color);

      for (var c = 0; c < data[i].days.length; c++) {
        // Calculate data-dependent CSS properties
        var loc_top  = time_to_pos(data[i].start);
        var loc_left = (num_of_day(data[i].days[c]) * 118) + 61;
        var height   = time_to_pos(data[i].end) - time_to_pos(data[i].start);

        $('div#schedule')
          .append('<div class="wcalendar-event" id="' + data[i].number + c + '"></div>');

        // Set properties of the event
        $('div#' + data[i].number + c)
          .last()
          .html(
            '<span class="title">' + data[i].id + '</span><br />' +
            '<span class="time">' + data[i].start.toLowerCase() + ' &#8211; ' + data[i].end.toLowerCase() + '</span><br />' +
            '<span class="place">' + two_words_num(data[i].where) + '</span>'
          )
          .css({
            backgroundColor: bg_color,
            border: '1px solid ' + border_color,
            top: loc_top + 'px',
            left: loc_left + 'px',
            height: height + 'px'
          });
      }
    }
  });
});

/****************************** Generic Functions *****************************/

/**
 * Searches for two words followed by a number in a string, e.g. Uris Hall G01.
 * Requires: [String] str - The string to process
 * Returns: [String] The first match in the string
 */
var two_words_num = function (str) {
  var r = /[a-z]+( )[a-z]+( )[a-z]?[0-9]{1,3}/i;
  var first_match = str.match(r)[0];
  first_match.replace('Hll', 'Hall');
  return first_match;
}

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
 * Requires: [int] seed - A seed for the number generation
 * Returns: [String] The hex code (including #) of a pleasing color
 */
var random_color = function (seed) {
  var scale = 127;   // defaults 127
  var offset = 127;

  var r = (Math.round(random_seed(seed / 1) * scale) + offset).toString(16);
  var g = (Math.round(random_seed(seed / 2) * scale) + offset).toString(16);
  var b = (Math.round(random_seed(seed / 4) * scale) + offset).toString(16);

  return '#' + r + g + b;
}

/**
 * Generates a darker version of the given hex color
 * Requires: [String] og - The original color in hex
 * Returns: [String] The hex code (including #) of a darker color
 */
var darker_color = function (og) {
  var offset = 40;
  var r = parseInt(og.substr(1, 2), 16) - offset;
  var g = parseInt(og.substr(3, 2), 16) - offset;
  var b = parseInt(og.substr(5, 2), 16) - offset;

  return '#' + r.toString(16) + g.toString(16) + b.toString(16);
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
 * Given a time as a string, converts the string into an integer representing
 *   where it should be on the page. Multiplies the hour by 60 and adds that to
 *   the minute value
 * Requires: [String] time - The time to convert of format HH:MM[am|pm]
 * Returns: [int] The intified time
 */
var time_to_pos = function (time) {
  var pieces = time.split(':');
  var hour = parseInt(pieces[0]);
  var min = parseInt(pieces[1].substr(0, 2));

  if (pieces[1].substr(2).toLowerCase() == 'pm' && hour != 12) {
    hour += 12;
  }

  // Calendar starts at 8am
  hour -= 8;
  hour *= 60;

  return Math.floor(hour + min);
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

/**
 * Generates a random number given a seed
 * Requires: [int] seed - The seed
 * Returns: [int] A random decimal between 0 and 1
 */
var random_seed = function(seed) {
    var x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
}