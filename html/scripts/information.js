'use strict';
/* global $, Messenger */

/*
 * Loads personal information about the student
 */

 var app = window.coolio;

$(document).ready(function () {
  app.request('/information', null);
  app.recieve('/information', function (data) {
    $('div#information')
      .html(
        '<span>' + data.bursar + '</span><br />' +
        '<span>' + data.advisor + '</span><br />' +
        '<span>' + data.student_id + '</span><br />' +
        '<img src="' + data.image + '" />'
      );

      app.request('/settings', null);
      app.recieve('/information', function (data) {
        // Hide id_image if settings
        if (!data.id_image) {
          $('div#information img').hide();
        }
      });
  });
});