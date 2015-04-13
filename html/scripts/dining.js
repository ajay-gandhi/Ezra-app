'use strict';

// Get and format date for embedded Google Cal
var date = new Date();
var today = '' + date.getFullYear();
if (date.getMonth() + 1 < 10) {
  today += '0' + (date.getMonth() + 1);
} else {
  today += (date.getMonth() + 1);
}
today += date.getDate();

var app = window.messenger;

$(document).ready(function() {

  // Add date to iframe sources
  var src = $('iframe').attr('src');
  $('iframe').attr('src', src + '&mode=DAY&dates=' + today + '/' + today);

  // Request and receive menus
  app.request('/menus', null);
  app.recieve('/menus', function (data) {
    // Iterate over each meal in each dining hall
    for (var location in data) {
      ['Breakfast', 'Brunch', 'Lunch', 'Dinner'].forEach(function (meal) {

        $('ul[data-menu-for="'+ location +'"]')
          .append('<li><h3>' + meal + '</h3></li>');

        if (!data[location][meal]) return;

        // Reduce data to {category : [tag, tag, ...], ...}
        var order = data[location][meal].reduce(function (acc, next) {
          if(!acc[next.category]) acc[next.category] = '';

          var healthy = next.healthy ? ' (h)' : '';
          var tag = '<li>' + next.name + healthy +'</li>';

          acc[next.category] += tag;
          return acc;
        }, {});

        // Create list
        for (var category in order) {
          $('ul[data-menu-for="'+ location +'"]')
            .append('<li> <b>'+ category + '</b> <ul>' + order[category] + 
              '</ul></li>');
        }

      });
    }
  });
});
