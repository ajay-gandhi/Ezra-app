var ipc = require('ipc');

$(document).ready(function () {
  // Fade window in
  $('body').animate({
    opacity: '1.0'
  }, 300);

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
      // Animate to the module
      $('div#module-group')
        .animate({
          left: i * $('div.module').width() * -1
        });
    });
  });
});