var netid;

$(document).ready(function () {
  $('button#login-button').click(function (e) {
    netid = $('input#netid').val();

    // Don't actually submit the form
    e.preventDefault();

    $('button#login-button').prop('disabled', true);
    $('button#login-button').text('Logging in...');

    $.ajax({
      url: 'http://127.0.0.1:3005/login',
      method: 'POST',
      data: {
        netid: netid,
        password: $('input#password').val()
      }
    }).done(function (data) {
      if (data.toString() === 'false') {
        login_result(false, function () {
          $('button#login-button').prop('disabled', false);
          $('button#login-button').text('Login');
        });

      } else {
        login_result(true, function () {
          $('div#login')
            .delay(500)
            .animate({
              top: '-300px'
            }, {
              duration: $(window).height() / 2,
              complete: function () {
                // Open home.html
                // alert('done');
                window.open('index.html', '_self');
              }
            });
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
  var login_result_delay = 1000,
      login_animation_duration = 500;

  $('div#login-cover')
    .css({
      display: 'block'
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
}

/**
 * Makes an API request to fetch the student's courses
 * Requires: [function] callback - A function to call after the AJAX call
 *              returns the courses
 */
var get_courses = function(callback) {
  $.ajax({
    url: 'courses',
    method: 'GET',
    data: { netid: netid.toString() }
  }).done(function (data) {
    data = JSON.parse(data);
    callback(data);
  });
}