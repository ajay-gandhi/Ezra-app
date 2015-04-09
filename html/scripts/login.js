'use strict';
/* global $, Messenger */

var netid;
var login_result_delay = 1000,
    login_animation_duration = 200;

$(document).ready(function () {

  var app = window.coolio;

  // Wait for 0.5 seconds
  setTimeout(function () {
    // Enable inputs
    $('input, button').removeAttr('disabled');
    $('input#netid').focus();

    // Fade out cover
    $('div#login-cover, div#loading').fadeOut({
      duration: 300
    });
  }, 1000);

  // Login actions
  $('button#login-button').click(function (e) {
    netid = $('input#netid').val();
    $('input, button').blur();

    // Don't actually submit the form
    e.preventDefault();

    $('button#login-button').prop('disabled', true);
    $('button#login-button').text('Logging in...');

    var data = {
      netid: netid,
      password: $('input#password').val()
    };


    // Login procedure

    app.request('/login', data);

    app.recieve('/login', function (success) {

      if (success) {

        // Login successful
        login_result(true, function () {
          $('div#login')
            .delay(500)
            .fadeOut(150, function () {
              // Tell backend to open index.html
              app.request('login-successful', true);
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