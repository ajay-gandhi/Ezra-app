'use strict';

/* Animates the navigation menu */

$(document).ready(function () {

  var app = window.messenger;

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

  // Receive navigation requests
  app.receive('/navigation', function (i) {
    // animate to the proper module
    $('div#module-group')
      .animate({
        left: i * $('div.module').width() * -1
      });
  });
});