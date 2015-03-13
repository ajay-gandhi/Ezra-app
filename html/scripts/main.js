var ipc = require('ipc');

$(document).ready(function () {
  // Meta actions (close, minimize)
  $('button#close').click(function () {
    ipc.send('close-window', 'true');
  });
  $('button#minimize').click(function () {
    ipc.send('minimize-window', 'true');
  });

  // Move the modules into a row
  $('div.module').each(function (index) {
    $(this).css('left', index * $(this).width());
  });

  // Click events for navigation
  $('div.nav-item').each(function (i) {
    $(this).click(function () {
      // Load the script for the module

      // Animate to the module
      $('div#module-group')
        .animate({
          left: i * $('div.module').width() * -1
        });
    });
  });
});