var Zombie  = require('zombie'),
    Promise = require('es6-promise').Promise,
    request = require('request'),
    BufferList = require('bufferlist').BufferList;

var urls = {
  main: 'http://studentcenter.cornell.edu',
  grades: 'https://selfservice.adminapps.cornell.edu/psc/cuselfservice/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL',
  demographics: 'https://selfservice.adminapps.cornell.edu/psc/cuselfservice/EMPLOYEE/HRMS/c/CC_PORTFOLIO.SS_CC_DEMOG_DATA.GBL'
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

  /**
   * Fetches the student's grades for a given semester
   * Returns: [Array] An array of objects containing grading data
   *   Each object followed the following format:
   *     number:  course number (DEP XXXX)
   *     name:    name of the course
   *     credits: number of credits
   *     grading: graded or pass/fail
   *     letter:  letter grade
   *     gpa:     amount it contributes to your GPA; calculated by weighting
   *                letter grade by number of credits
   * 
   */
  StudentCenter.prototype.getGrades = function (semester) {
    var browser = this.browser;

    return new Promise(function (resolve, reject) {
      // Visit grades page
      browser
        .visit(urls.grades)
        .then(function () {

          var semesters_table = browser.query('table[id^=SSR_DUMMY_RECV1]');
          var rows = semesters_table.tBodies[0].children;

          // Iterate over children, ignoring elements that are not table rows
          // and first two rows
          var semesters = [];
          for (var i = 2; i < rows.length; i++) {

            var child = rows[i];
            if (child.tagName.toLowerCase() === 'tr') {
              if (child.children[1].textContent.trim() == semester) {
                // Click the proper semester radio button
                child.children[0].children[0].click();
              }
            }
          }

          // Simulate running a JS function on the page that does all this stuff
          // below, no idea why it's necessary or what it does. It's something
          // from PeopleSoft
          browser.document.forms[0].elements['ICAction'].value   = 'DERIVED_SSS_SCT_SSR_PB_GO';
          browser.document.forms[0].elements['ICXPos'].value     = '100';
          browser.document.forms[0].elements['ICYPos'].value     = '100';
          browser.document.forms[0].elements['ICResubmit'].value = '0';
          browser.document.forms[0].submit();
          return browser.wait();
        })
        .then(function () {

          var grades_table = browser.query('table.PSLEVEL1GRID');
          var rows = grades_table.tBodies[0].children;

          // Iterate over children, ignoring elements that are not table rows
          // and first row
          var grades = [];
          for (var i = 1; i < rows.length; i++) {

            var child = rows[i];
            if (child.tagName.toLowerCase() === 'tr') {
              grades.push({
                number:  child.children[0].textContent.trim(),
                name:    child.children[1].textContent.trim(),
                credits: child.children[2].textContent.trim(),
                grading: child.children[3].textContent.trim(),
                letter:  child.children[4].textContent.trim(),
                gpa:     child.children[5].textContent.trim()
              });
            }
          }

          // Go back to student center main page
          browser.visit(urls.main);

          resolve(grades);

        });
    });
  }

  /**
   * TODO
   *
   * Returns an object containing information about the student, e.g. advisor
   *   and school address.
   * Returns: [Promise] An object containing the student's personal information:
   *   - Advisor
   *   - Assigned Address
   *   - Bursar charges
   */
  StudentCenter.prototype.getInformation = function () {
    var browser = this.browser;

    return new Promise(function (resolve, reject) {
      var info = {};

      // Get bursar status
      var bursar = browser.query('span.SSSMSGINFOTEXT').textContent.trim();
      info.bursar = bursar;

      // Get advisor
      var advisor_tables = browser.queryAll('table.PABACKGROUNDINVISIBLEWBO');
      var advisor;
      for (var i = 0; i < advisor_tables.length; i++) {
        if (advisor_tables[i].textContent.trim().indexOf('Program Advisor') > -1) {
          advisor = advisor_tables[i];
        }
      }
      info.advisor = advisor.children[0].children[1].textContent.trim();

      // Get student ID number and image
      browser
        .visit(urls.demographics)
        .then(function () {

          // Student ID
          var id_tables = browser.queryAll('table');
          var id_tbl, student_id;

          for (var i = 0; i < id_tables.length; i++) {
            if (id_tables[i].textContent.trim().indexOf('Gender') > -1) {
              id_tbl = id_tables[i];
            }
          }

          student_id = id_tbl.tBodies[0].children[2].textContent.trim();
          info.student_id = student_id;

          // Student image
          var images = browser.queryAll('img');
          var image_url;

          for (var i = 0; i < images.length; i++) {
            if (images[i].src.indexOf('/cs/cuselfservice/cache/EMPL_PHOTO_') > -1) {
              image_url = images[i].src;
            }
          }

          // Now get the image and send it base64-encoded
          // See https://gist.github.com/hackable/1294667
          request({
            uri: image_url,
            encoding: 'binary'
          }, function (error, response, body) {
            if (!error && response.statusCode == 200) {

              var data_uri_prefix = 'data:' + response.headers['content-type'] + ';base64,';

              // Decode the binary image
              var image = new Buffer(body, 'binary').toString('base64');

              info.image = data_uri_prefix + image;
              resolve(info);
            }
          }); 
        });
    });
  }

  return StudentCenter;

})();
