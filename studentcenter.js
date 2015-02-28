var Zombie = require('zombie'),
    Promise = require('es6-promise').Promise;

var student_center_url = 'http://studentcenter.cornell.edu';

module.exports = (function () {

  function StudentCenter() {
    this.browser = new Zombie();
  }

  /**
   * Attempts to login given a NetID and password via the headless browser.
   * Requires: [String] netid - The NetID of the student
   *           [String] password - The password associated with the NetID
   * Returns: [Promise] Resolves a new StudentCenter object or rejects the title
   *   if login was unsuccessful.
   */
  StudentCenter.prototype.login = function (netid, password) {
    var self = this;
    var browser = self.browser;

    return new Promise(function (resolve, reject) {
      // Visit Student Center
      browser
        .visit(student_center_url)
        .then(function () {
          // Wait for all ze redirects
          return browser.wait();
        })
        .then(function () {
          // Fill in NetID and pw
          browser.fill('netid', netid);
          browser.fill('password', password);
          browser.select('realm', 'CIT.CORNELL.EDU');

          return browser.pressButton('Submit');
        })
        .then(function () {
          if (browser.text('title') === 'Student Center') {
            // Login successful
            resolve(self);
          } else {
            // Login failed
            reject('Stuck at: ' + browser.text('title'));
          }
        });
    });
  }

  StudentCenter.prototype.getCourses = function () {
    var browser = this.browser;

    return new Promise(function (resolve, reject) {
      // Get the table whose id begins with STDNT_WEEK_SCHD
      // (student weekly schedule)
      var schedule_table = browser.query("table[id^='STDNT_WEEK_SCHD']");
      var rows = schedule_table.tBodies[0].children;

      // Iterate over children, ignoring elements that are not table rows
      var courses = [];
      for (var i = 0; i < rows.length; i++) {

        var child = rows[i];
        if (child.tagName.toLowerCase() === 'tr') {
          var pieces = child.textContent.trim().split('\n');

          // This ignores the title rows
          if (pieces.length == 6) {
            var course = {};

            // Regex to remove string inside parens
            var inside_parens = /\(([^)]+)\)/;

            // Create an object that contains information about the course
            course.type = pieces[1].split(' ')[0];

            // Split course time info into pieces
            var when        = pieces[4].split(' ');
            var days_string = when[0];
            course.days     = days_string.match(/.{1,2}/g);
            course.start    = when[1];
            course.end      = when[3];

            // Location
            course.where = pieces[5];
            course.id = pieces[0].split('-')[0];
            course.number = inside_parens.exec(pieces[1])[1] + '-'
              + pieces[0].split('-')[1];
            courses.push(course);
          }
        }
      }

      resolve(courses);
    });
  }

  return StudentCenter;

})();
