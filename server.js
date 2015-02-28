var express       = require('express'),
    bodyParser    = require('body-parser'),
    StudentCenter = require('./studentcenter.js');

var server = express();
var student;

// Enable POST requests
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({
  extended: true
}));

// Requesting user's courses
server.post('/login', function (req, res) {
  // Get the username and pw from the request
  var netid    = req.body.netid;
  var password = req.body.password;

  var sc = new StudentCenter();

  sc
    .login(netid, password)
    .then(function (sc_new) {
      // Store the student's headless browser locally
      student = sc_new;
      res.send('true');
    })
    .catch(function () {
      // The login failed
      res.send('false');
    });
});

// Serves the student's courses in JSON
server.get('/courses', function (req, res) {
  student
    .getCourses()
    .then(function (courses) {
      res.send(courses);
    });
});

// For testing
server.get('/hello', function (req, res) {
  res.send('hello wordl');
});

// Start the server
var server_port = 3005;
var server_ip_address = '127.0.0.1';
server.listen(server_port, server_ip_address);