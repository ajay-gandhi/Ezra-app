$('.dining-calendar-column iframe').load( function() {
    $('iframe').contents().find("head")
      .append($("<style type='text/css'>  .my-class{display:none;}  </style>"));
});