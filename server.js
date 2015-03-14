'use strict';
/* global require, console */
var express       = require('express'),
    StudentCenter = require('./studentcenter.js'),
    rp            = require('request-promise');


var server = express();
var student;

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
  var netid    = req.query.netid;
  var password = req.query.password;

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