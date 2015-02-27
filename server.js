var express       = require('express'),
    bodyParser    = require('body-parser'),
    path          = require('path'),
    Promise       = require('es6-promise').Promise,
    StudentCenter = require(path.resolve('.', 'studentcenter'));

var app = express();
var student;

// Enable POST requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
})); 

// Requesting user's courses
app.post('/login', function (req, res) {
  // Get the username and pw from the request
  var netid    = req.body.netid;
  var password = req.body.password;

  var sc = new StudentCenter();
  sc.login(netid, password)
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
// app.get('/courses', function (req, res) {
//   var netid = req.query.netid;
//   var StudentCenter = students[netid];

//   // Get the student's courses
//   StudentCenter.getCourses().then(function (courses) {
//     update_timeout(netid);
//     res.send(JSON.stringify(courses));
//   });
// });

// Start the server
var server_port = 3005;
var server_ip_address = '127.0.0.1';
app.listen(server_port, server_ip_address, function () {
  window.location = path.join(process.cwd(), 'html', 'login.html');
});





