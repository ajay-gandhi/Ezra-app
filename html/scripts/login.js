'use strict';

/* Actions for login page */

var netid;
var login_result_delay = 1000,
    login_animation_duration = 200;

$(document).ready(function () {

  var app = window.messenger;

  // Receive password from app if saved
  app.receive('/pass', function (creds) {
    $('input#netid').val(creds.user);
    $('input#password').val(creds.password);
  });

  // Login actions
  $('button#login-button').click(function (e) {
    netid = $('input#netid').val();

    // Don't actually submit the form
    e.preventDefault();

    // Disable everything
    $('input, button').blur();
    $('button#login-button').prop('disabled', true);
    $('button#login-button').text('Logging in...');

    var data = {
      netid: netid,
      password: $('input#password').val()
    };

    // Login procedure
    app.request('/login', data);
    app.receive('/login', function (success) {

      if (success) {
        // Login successful
        login_result(true, function () {
          $('div#login')
            .delay(500)
            .fadeOut(150, function () {
              // Tell backend to open index.html
              app.request('/login-successful', true);
            });
        });

      } else {
        // Login failed
        login_result(false, function () {
          $('input#netid').focus();
          $('button#login-button').prop('disabled', false);
          $('button#login-button').text('Login');
        });

      }
    });
  });
});

/**
 * Animate the large result box and perform the callback function
 * Requires: [boolean] successful - Whether or not the login was successful
 *           [function] callback  - A function to call after all animations
 */
var login_result = function (successful, callback) {
  // Fade in cover
  $('div#login-cover')
    .css({
      display: 'block',
      opacity: '0.0'
    })
    .fadeTo(login_animation_duration, '0.5', function () {
      $(this)
        .delay(login_result_delay)
        .fadeOut({
          duration: login_animation_duration
        });
    });

  // Slide check/cross
  $('div#login-result')
    .html( (successful) ? '&check;' : '&#9587;' )
    .css({
      backgroundColor: (successful) ? '#00FF00' : '#FF0000',
      top: ($('div#login').height() - $('div#login-result').height()) / 2,
      left: '-125px'
    })
    .animate({
      left: (($('div#login').width() - $('div#login-result').width()) / 2) + 15
    }, {
      duration: login_animation_duration,
      complete: function () {
        $(this)
          .delay(login_result_delay)
          .animate({
            left: '350px'
          }, {
            duration: login_animation_duration,
            complete: callback()
          });
      }
    });
};