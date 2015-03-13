var date = new Date();
var today = '' + date.getFullYear();
if (date.getMonth() + 1 < 10) {
  today += '0' + (date.getMonth() + 1);
} else {
  today += (date.getMonth() + 1);
}
today += date.getDate();
console.log(today);

$(document).ready(function() {
  $('iframe')
    .attr('src', $('iframe').attr('src') + '&mode=DAY&dates=' + today + '/' + today);
  // $('iframe').contents().find('head')
  //   .append($("<style type='text/css'> .my-class { display: none; } </style>"));
});