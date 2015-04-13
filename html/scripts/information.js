'use strict';

/* Loads personal information about the student */

var app = window.messenger;

$(document).ready(function () {
  app.request('/information', null);
  app.recieve('/information', function (data) {

    var infoHTML = '' +
      '<div class="information-group">' +
        '<div class="information-label">Bursar</div>' +
        '<div class="information-option">' + data.bursar + '</div>' +
      '</div>' +
      '<div class="information-group">' +
        '<div class="information-label">Advisor</div>' +
        '<div class="information-option">' + data.advisor + '</div>' +
      '</div>' +
      '<div class="information-group">' +
        '<div class="information-label">Student ID</div>' +
        '<div class="information-option">' + data.student_id + '</div>' +
      '</div>' +
      '<div class="information-group">' +
        '<div class="information-label">ID Image</div>' +
        '<div class="information-option"><img src="' + data.image + '" /></div>' +
      '</div>';

    // Student's pwd to card.campuslife may differ
    if (data.login == false) {
      infoHTML += '' +
        '<div class="information-group">' +
          '<div id="diff-pwd">' +
          'Your password to card.campuslife.cornell.edu differs from your ' +
          'NetID password, so we can\'t get your dining information.' +
        '</div>';

    } else {
      infoHTML += '' +
        '<div class="information-group">' +
          '<div class="information-label">Big Red Bucks Balance</div>' +
          '<div class="information-option">$' + data.brbs + '</div>' +
        '</div>' +
        '<div class="information-group">' +
          '<div class="information-label">Laundry Balance</div>' +
          '<div class="information-option">$' + data.laundry + '</div>' +
        '</div>' +
        '<div class="information-group">' +
          '<div class="information-label">CityBucks Balance</div>' +
          '<div class="information-option">$' + data.citybucks + '</div>' +
        '</div>';
    }

    // Need settings for ID image
    app.request('/settings', null);
    app.recieve('/settings', function (data) {

      $('div#information-module').html(infoHTML);

      // Hide image if settings
      if (data.id_image)
        $('div#information-module img').parent().parent().hide();
    });
  });
});