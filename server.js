var express    = require('express'),
    bodyParser = require('body-parser'),
    session    = require('cookie-session'),
    Promise    = require('es6-promise').Promise,
    chalk      = require('chalk'),
    crypt      = require('./crypt.js'),
    sc_module  = require('./studentcenter');

// This file contains the secret signature for the session cookies:
// {
//   "sessionSecret": "some unguessable string"
// }
var secret = require('./secret.json');

var app = express();

var students = {};
var timeouts = {};
var login_expiration_time = 300000; // 5 minutes

// A list of URLs that can be accessed without logging in
var unauth_allowed = ['/login.html',
                      '/terms-of-use.html',
                      '/style.css',
                      '/scripts/login.js',
                      '/login'];

// Enable POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

// Enable sessions
app.use(session({
  secret:   secret.sessionSecret,
  maxAge:   login_expiration_time,
  httpOnly: true
}));

// Authorize before visiting
app.use(function (req, res, next) {
  var s_netid = req.session.netid;
  if ((s_netid && students[s_netid]) || unauth_allowed.indexOf(req.path) != -1) {
    update_timeout(s_netid);
    next();
  } else {
    res.redirect('/login.html');
  }
});

// Static content in the html/ subdir
app.use(express.static(__dirname + '/html'));

// Requesting user's courses
app.post('/login', function (req, res) {
  // Get the encoded username and pw from the request
  var netid    = req.body.netid;
  var password = req.body.password;

  if (students[netid]) {
    // They are already logged in
    update_timeout(netid);
    console.log('\n', chalk.green('Re-logged in ' + netid));
    res.send('true');

  } else {
    var sc = new sc_module();
    sc.login(netid, password)
      .then(function (StudentCenter) {
        // Store the student's headless browser locally
        students[netid] = StudentCenter;
        // Update the timeout that deletes that student's browser (logout)
        req.session.netid = netid;
        update_timeout(netid);

        console.log('\n', chalk.yellow('First login for ' + netid));

        res.send('true');
      })
      .catch(function () {
        // The login failed
        res.send('false');
      });
    }
});

// Serves the student's courses in JSON
app.get('/courses', function (req, res) {
  var netid = req.query.netid;
  var StudentCenter = students[netid];

  // Get the student's courses
  StudentCenter.getCourses().then(function (courses) {
    update_timeout(netid);
    res.send(JSON.stringify(courses));
  });
});

// Start the server
var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
app.listen(server_port, server_ip_address, function() {
  console.log('Server running on port ' + server_port);
});


/******************************************************************************/
/****************************** Local Functions *******************************/
/******************************************************************************/

var update_timeout = function (netid) {
  var t = setTimeout(function () {
    delete students[netid];
    delete timeouts[netid];
    console.log('\n', chalk.red('Deleted StudentCenter for ' + netid));
  }, login_expiration_time);

  timeouts[netid] = t;
}