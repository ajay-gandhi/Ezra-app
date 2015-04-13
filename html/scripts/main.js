'use strict';

$(document).ready(function () {
  // Move the modules into a row
  $('div.module').each(function (index) {
    $(this).css('left', index * $(this).width());
  });
});