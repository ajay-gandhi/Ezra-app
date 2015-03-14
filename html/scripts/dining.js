var date = new Date();
var today = '' + date.getFullYear();
if (date.getMonth() + 1 < 10) {
  today += '0' + (date.getMonth() + 1);
} else {
  today += (date.getMonth() + 1);
}
today += date.getDate();

$(document).ready(function() {
  var src = $('iframe').attr('src');
  $('iframe')
    .attr('src', src + '&mode=DAY&dates=' + today + '/' + today);


  // Load menus
  $.ajax({
    url: 'http://127.0.0.1:3005/menus',
    method: 'GET'
  }).done(function (data) {
    var data = JSON.parse(data);
    console.log(data)
    
    Object.keys(data).forEach(function (location) {
      Object.keys(data[location]).forEach(function (meal) {

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
          .append('<li> <b>'+ category + '</b> <ul>' + order[category] + '</ul></li>');
        }


      });
    });

  });

});
