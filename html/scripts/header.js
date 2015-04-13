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

  // Click events for navigation
  $('div.nav-item').each(function (i) {
    $(this).click(function () {
      // animate to the module
      $('div#module-group')
        .animate({
          left: i * $('div.module').width() * -1
        });
    });
  });
});