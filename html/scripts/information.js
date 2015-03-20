/*
 * Loads personal information about the student
 */
$(document).ready(function () {
  $.ajax({
    url: 'http://127.0.0.1:3005/information',
    method: 'GET'
  }).done(function (data) {
    $('div#information')
      .html(
        '<span>' + data.bursar + '</span><br />' +
        '<span>' + data.advisor + '</span><br />' +
        '<span>' + data.student_id + '</span><br />' +
        '<img src="' + data.image + '" />'
      );

      $.ajax({
        url: 'http://127.0.0.1:3005/settings',
        method: 'GET'
      }).done(function (data) {
        // Hide id_image if settings
        if (!(data.id_image === 'true')) {
          $('div#information img').hide();
        }
      });
  });
});