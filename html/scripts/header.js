'use strict';
/* global $ */

/**
 * Handles the nav menu
 */

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