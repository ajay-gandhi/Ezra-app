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
});