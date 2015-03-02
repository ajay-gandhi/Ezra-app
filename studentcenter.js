var Zombie = require('zombie'),
    Promise = require('es6-promise').Promise;

var urls = {
  main: 'http://studentcenter.cornell.edu',
  grades: 'https://selfservice.adminapps.cornell.edu/psc/cuselfservice/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL'
}

module.exports = (function () {

  function StudentCenter() {
    this.browser = new Zombie();
  }

  /**
   * Initializes the headless browser by visiting studentcenter.cornell.edu
   * Returns: [Promise] An initialized StudentCenter object
   */
  StudentCenter.prototype.init = function () {
    var self = this;
    var browser = self.browser;

    return new Promise(function (resolve, rejeect) {
      // Visit Student Center
      browser
        .visit(urls.main)
        .then(function () {
          // Wait for redirects
          return browser.wait();
        })
        .then(function () {
          // Return the init'ed object
          resolve(self);
        });
    });
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
      // Fill in NetID and pw
      browser
        .fill('netid', netid)
        .fill('password', password)
        .select('realm', 'CIT.CORNELL.EDU')
        .pressButton('Submit')
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

  /**
   * Fetches the student's courses for the current semester, returning an array
   *   of objects, each representing a class. Each object contains the course
   *   title, time, and location
   * Returns: [Array] An array of course objects
   */
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

  /**
   * Fetches the semesters for which a student's grades are available
   * Returns: [Array] An array of strings of the format 'Spring 2015'
   */
  StudentCenter.prototype.getGradeSemesters = function () {
    var browser = this.browser;

    return new Promise(function (resolve, reject) {
      // Visit grades page
      browser
        .visit(urls.grades)
        .then(function () {
          return browser.wait();
        })
        .then(function () {

          var semesters_table = browser.query("table[id^=SSR_DUMMY_RECV1]");
          var rows = semesters_table.tBodies[0].children;

          // Iterate over children, ignoring elements that are not table rows
          // and first two rows
          var semesters = [];
          for (var i = 2; i < rows.length; i++) {

            var child = rows[i];
            if (child.tagName.toLowerCase() === 'tr') {
              semesters.push(child.children[1].textContent.trim());
            }
          }

          // Go back to student center main page
          browser.visit(urls.main);

          resolve(semesters);

        });
    });
  }

  return StudentCenter;

})();
