var express       = require('express'),
    keychain      = require('xkeychain'),
    jf            = require('jsonfile'),
    StudentCenter = require('./studentcenter.js');

var server = express();
var student;
var settings_file = './settings.json';

// Keep netid and pw for keychain possibly
var netid, password;

// Initialize the headless browser to speedup login
server.get('/init', function (req, res) {
  var sc = new StudentCenter();
  sc
    .init()
    .then(function (sc_new) {
      student = sc_new;
      res.send('true');
    });
});

// Login user
server.get('/login', function (req, res) {
  // Get the username and pw from the request
  netid    = req.query.netid;
  password = req.query.password;

  student
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

// Serve the student's personal information and student id image
server.get('/information', function (req, res) {
  student
    .getInformation()
    .then(function (info) {
      res.send(info);
    });
});

// Save the username/pw
server.get('/remember', function (req, res) {

  // Store the username/pw in the keychain
  keychain.setPassword({ account: netid, service: 'Ezra', password: password }, function(err) {
    if (err) {
      console.log(err);
    } else {
      console.log('Password saved');

      // Write the netid to settings file
      jf.readFile(settings_file, function(err, obj) {
        // Add prop to existing settings
        obj.netid = netid;
        jf.writeFile(settings_file, obj, function(err) {
          if (err) {
            console.log(err);
          } else {
            res.send('true');
          }
        });
      });
    }
  });

});

// For testing
server.get('/hello', function (req, res) {
  res.send('hello wordl');
});

// Start the server
var server_port = 3005;
var server_ip_address = '127.0.0.1';
server.listen(server_port, server_ip_address, function () {
  console.log('Ready');
});