
var Zombie  = require('zombie'),
    Promise = require('es6-promise').Promise,
    rp = require('request-promise');

var urls = {
  main: 'http://studentcenter.cornell.edu',
  // grades: 'https://selfservice.adminapps.cornell.edu/psc/cuselfservice/EMPLOYEE/HRMS/c/SA_LEARNER_SERVICES.SSR_SSENRL_GRADE.GBL',
  demographics: 'https://css.adminapps.cornell.edu/psc/cuselfservice/EMPLOYEE/HRMS/c/CC_PORTFOLIO.SS_CC_DEMOG_DATA.GBL',
  campuslife: 'https://card.campuslife.cornell.edu'
}

module.exports = (function () {

  function StudentCenter() {
    this.browser = new Zombie({
      maxWait: 3000
    });
    this.netid;
    this.password;
  }

  /**
   * Initializes the browser by visiting the main studentcenter page
   * Returns: [Promise] The newly initialized StudentCenter object
   */
  StudentCenter.prototype.init = function () {
    var self    = this,
        browser = self.browser;

    return new Promise(function (resolve, reject) {
      // Visit Student Center

      return browser
        .visit(urls.main)
        .then(function () {
          // Wait for redirects
          return browser.wait();
        })
        .then(function () {
          // Return the init'ed object
          resolve(self);
        })
        .catch(function (err) {
          reject(err);
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
    this.netid    = netid;
    this.password = password;
    var self      = this,
        browser   = self.browser;

    return new Promise(function (resolve, reject) {

      // Fill in NetID and pw
      browser
        .fill('netid', netid)
        .fill('password', password)
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
            course.where  = pieces[5];
            course.id     = pieces[0].split('-')[0];
            course.number = inside_parens.exec(pieces[1])[1] + '-'
              + pieces[0].split('-')[1];
            courses.push(course);
          }
        }
      }

      resolve(courses);
    });
  }

  // StudentCenter was updated, this code no longer functions
  //
  // /**
  //  * Fetches the semesters for which a student's grades are available
  //  * Returns: [Array] An array of strings of the format 'Spring 2015'
  //  */
  // StudentCenter.prototype.getGradeSemesters = function () {
  //   var browser = this.browser;

  //   return new Promise(function (resolve, reject) {
  //     // Visit grades page
  //     browser
  //       .visit(urls.grades)
  //       .then(function () {

  //         var semesters_table = browser.query("table[id^=SSR_DUMMY_RECV1]");
  //         var rows = semesters_table.tBodies[0].children;

  //         // Iterate over children, ignoring elements that are not table rows
  //         // and first two rows
  //         var semesters = [];
  //         for (var i = 2; i < rows.length; i++) {

  //           var child = rows[i];
  //           if (child.tagName.toLowerCase() === 'tr') {
  //             semesters.push(child.children[1].textContent.trim());
  //           }
  //         }

  //         // Go back to student center main page
  //         browser.visit(urls.main);

  //         resolve(semesters);

  //       });
  //   });
  // }

  // /**
  //  * Fetches the student's grades for a given semester
  //  * Returns: [Array] An array of objects containing grading data
  //  *   Each object followed the following format:
  //  *     number:  course number (DEP XXXX)
  //  *     name:    name of the course
  //  *     credits: number of credits
  //  *     grading: graded or pass/fail
  //  *     letter:  letter grade
  //  *     gpa:     amount it contributes to your GPA; calculated by weighting
  //  *                letter grade by number of credits
  //  * 
  //  */
  // StudentCenter.prototype.getGrades = function (semester) {
  //   var browser = this.browser;

  //   return new Promise(function (resolve, reject) {
  //     // Visit grades page
  //     browser
  //       .visit(urls.grades)
  //       .then(function () {

  //         var semesters_table = browser.query('table[id^=SSR_DUMMY_RECV1]');
  //         var rows = semesters_table.tBodies[0].children;

  //         // Iterate over children, ignoring elements that are not table rows
  //         // and first two rows
  //         var semesters = [];
  //         for (var i = 2; i < rows.length; i++) {

  //           var child = rows[i];
  //           if (child.tagName.toLowerCase() === 'tr') {
  //             if (child.children[1].textContent.trim() == semester) {
  //               // Click the proper semester radio button
  //               child.children[0].children[0].click();
  //             }
  //           }
  //         }

  //         // Simulate running a JS function on the page that does all this stuff
  //         // below, no idea why it's necessary or what it does. It's something
  //         // from PeopleSoft
  //         browser.document.forms[0].elements['ICAction'].value   = 'DERIVED_SSS_SCT_SSR_PB_GO';
  //         browser.document.forms[0].elements['ICXPos'].value     = '100';
  //         browser.document.forms[0].elements['ICYPos'].value     = '100';
  //         browser.document.forms[0].elements['ICResubmit'].value = '0';
  //         browser.document.forms[0].submit();
  //         return browser.wait();
  //       })
  //       .then(function () {

  //         var grades_table = browser.query('table.PSLEVEL1GRID');
  //         var rows = grades_table.tBodies[0].children;

  //         // Iterate over children, ignoring elements that are not table rows
  //         // and first row
  //         var grades = [];
  //         for (var i = 1; i < rows.length; i++) {

  //           var child = rows[i];
  //           if (child.tagName.toLowerCase() === 'tr') {
  //             grades.push({
  //               number:  child.children[0].textContent.trim(),
  //               name:    child.children[1].textContent.trim(),
  //               credits: child.children[2].textContent.trim(),
  //               grading: child.children[3].textContent.trim(),
  //               letter:  child.children[4].textContent.trim(),
  //               gpa:     child.children[5].textContent.trim()
  //             });
  //           }
  //         }

  //         // Go back to student center main page
  //         browser.visit(urls.main);

  //         resolve(grades);

  //       });
  //   });
  // }

  /**
   * Returns an object containing information about the student, e.g. advisor.
   * Returns: [Promise] An object containing the student's personal information:
   *   - Advisor
   *   - Assigned Address
   *   - Bursar charges
   */
  StudentCenter.prototype.getInformation = function () {
    var self    = this,
        browser = self.browser;

    return new Promise(function (resolve, reject) {
      var info = {};

      if (browser.query('span.SSSMSGINFOTEXT')) {
        // Bursar status is no charges
        // Get bursar status
        var bursar = browser.query('span.SSSMSGINFOTEXT').textContent.trim();
        info.bursar = bursar;
      } else {
        // Student owes something

        // Get all span.PABOLDTEXT
        var bursar_spans = browser.queryAll('span.PABOLDTEXT');

        // There is probably only 1 so get its textcontent
        if (bursar_spans.length == 1) {
          info.bursar = bursar_spans[0].textContent.trim();
        } else {

          // If there are many, find the right one
          for (var i = 0; i < bursar_spans.length; i++) {
            if (bursar_spans[i].textContent.trim().indexOf('You owe') > -1) {
              info.bursar = bursar_spans[i].textContent.trim();
            }
          }
        }
      }

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
            if (images[i].src.indexOf('/cs/cuselfservice/cache/EMPL_PHOTO_') >= 0) {
              image_url = images[i].src;
            }
          }

          // Now get the image and send it base64-encoded
          // See https://gist.github.com/hackable/1294667
          return rp({
            uri: image_url,
            encoding: 'binary',
            resolveWithFullResponse: true
          });
        })
        .then(function (response) {
          // RP can no longer access the URL...it's accessible through zombie
          // but can't save image data
          //
          // no id image until this is fixed

          // var body = response.body;
          // console.log(body);
          // var data_uri_prefix = 'data:' + response.headers['content-type'] + ';base64,';

          // // Decode the binary image
          // var image = new Buffer(body, 'binary').toString('base64');

          // info.image = data_uri_prefix + image;

          /**************************/
          /** Get account balances **/
          /**************************/
          var id;
          browser.runScripts = false;

          return browser.visit(urls.campuslife);
        })
        .then(function() {
          // Fill login info
          browser
            .fill('loginphrase', info.student_id)
            .fill('password', self.password);

          return browser.pressButton('input[type="image"]');
        })
        .then(function () {

          var err = browser.query('font.error');
          if (err && err.textContent.trim().indexOf('Invalid') >= 0) {
            // Password not accepted
            // Just return regular info
            info.login = false;

            // Reset
            browser.runScripts = true;
            browser.visit(urls.main);

            resolve(info);

          } else {
            // Result is a JavaScript redirect, but runScripts = false
            // Extract URL and manually redirect
            var rgx = /'(.*?)'/i;
            var body = browser.text('body');

            var redirect_url = body.match(rgx)[0];
            redirect_url = redirect_url.substr(1, redirect_url.length - 2);

            id = redirect_url;

            browser
              .visit(urls.campuslife + redirect_url)
              // Throws a 404 error for some random JS file
              // Ignore error and cont
              .then(
                null,
                function (e) {
                  if (e.message.indexOf('404') < 0) {
                    throw e;
                  }
                }
              )
              .then(function () {

                // Now at intermediate login page
                // Mimic actions conducted by the JS on this page
                var ePos = id.indexOf('=');
                var aPos = id.indexOf('&');
                id = id.substring(ePos + 1, aPos);

                return login_check(id, 0);
              })
              .then(function () {
                // Get info
                browser
                  .visit(urls.campuslife + '/index.php?skey=' + id + '&cid=7&')
                  .then(function () {

                    // Get all the <b> tags in mainbody, one for each account
                    var tbl = browser.query('div#mainbody').children[1];
                    var bs = tbl.getElementsByTagName('b');

                    info.citybucks = bs[0].textContent.substr(9).trim();
                    info.brbs      = bs[1].textContent.substr(9).trim();
                    info.laundry   = bs[2].textContent.substr(9).trim();

                    // Reset
                    browser.runScripts = true;
                    browser.visit(urls.main);

                    resolve(info);
                  });
              })
              .catch(function (e) {
                console.log(browser.runScripts);
                console.log('Error loading page:', e);
                // Login failed for some reason, so ignore this portion

                // Reset
                browser.runScripts = true;
                browser.visit(urls.main);

                resolve(info);
              });
          }
        });
    });
  }

  return StudentCenter;

})();

/*
 * Continually conducts the login check until access is granted, then returns.
 * Requires: [string] id - The id of the transaction
 *           [int] count - The number of tries so far
 * Returns: [Promise] True if the login was accepted within 4 tries, false
 *   otherwise.
 */
var login_check = function (id, count) {
  return new Promise(function (resolve, reject) {
    rp(urls.campuslife + '/login-check.php?skey=' + id)
      .then(function (b) {
        // If tried 10 times, quit
        if (count >= 10) {
          reject(false);
          return;
        }

        // Check if the XML message = 1 or not
        if ((b.split('1').length - 1) != 2) {
          // Login has not been accepted yet, so try again
          count++;
          login_check(id, count)
            .then(function () {
              resolve(true);
            })
            .catch(function () {
              reject(false);
            });

        } else {
          // Login accepted by their server, return true
          resolve(true);
        }
      });
  });
}
