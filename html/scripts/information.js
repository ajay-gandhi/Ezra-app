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
        '<img style="opacity: 0.1" src="' + data.image + '" />'
      );
  });
});