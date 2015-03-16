'use strict';
/* global require, console */
var express       = require('express'),
    keychain      = require('xkeychain'),
    jf            = require('jsonfile'),
    StudentCenter = require('./studentcenter.js'),
    rp            = require('request-promise');

var server = express();
var settings_file = './settings.json';

// Keep netid and pw for keychain possibly
var netid, password;

// Initialize the headless browser to speedup login
var student = new StudentCenter();
student
  .init()
  .then(function (sc_new) {
    student = sc_new;
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

// Serve the settings
server.get('/settings', function (req, res) {
  jf.readFile(settings_file, function (err, obj) {
    res.send(obj);
  });
});

// Update settings
server.get('/update-settings', function (req, res) {

  // Update settings in file
  jf.readFile(settings_file, function(err, obj) {
    // Add each individual prop to existing settings
    Object.keys(req.query).forEach(function(key) {
      obj[key] = req.query[key];
    });

    // Write to settings file
    jf.writeFile(settings_file, obj, function(err) {
      if (err) {
        console.log(err);
      } else {

        // Settings file updated, now update keychain
        if (req.query.remember === 'false') {
          // Delete the password
          keychain.deletePassword({
            account: netid,
            service: 'Ezra'
          }, function (err) {
            if (err) {
              console.log(err);
            } else {
              res.send('true');
            }
          });
        } else {
          // Store the username/pw in the keychain
          keychain.setPassword({
            account: netid,
            service: 'Ezra',
            password: password
          }, function(err) {
            if (err) {
              console.log(err);
            } else {
              res.send('true');
            }
          });

        }
      }
    });
  });
});

// For testing
server.get('/hello', function (req, res) {
  res.send('hello wordl'); // lol ajay. BRUH.
});

server.get('/menus', function (req, res) {
  console.log('got the thing')
  rp('http://redapi-tious.rhcloud.com/dining/menu/ALL/ALL/LOCATIONS')
  .then(function (info) {
    console.log('sent the thing')
    console.log(info)
    res.send(info);
  });
});

// Start the server
var server_port = 3005;
var server_ip_address = '127.0.0.1';
server.listen(server_port, server_ip_address, function () {
  console.log('Ready');
});