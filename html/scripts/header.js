'use strict';

/* Animates the navigation menu */

$(document).ready(function () {
  // Hide and display navigation bar
  $('header, div#navigation').hover(function () {
    $('div#navigation')
      .stop()
      .slideDown('fast');
  }, function () {
    $('div#navigation')
      .stop()
      .slideUp('fast');
  });
});