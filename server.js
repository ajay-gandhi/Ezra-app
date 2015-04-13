'use strict';
/* global require, console, module */
var jf            = require('jsonfile'),
    StudentCenter = require('./studentcenter.js'),
    rp            = require('request-promise'),
    keychain      = require('xkeychain');

// Location of settings file in user's home dir
var settings_file = process.env[(process.platform == 'win32')
  ? 'USERPROFILE'
  : 'HOME']
  + '/.ezra-settings';

// Keep netid and pw for keychain possibly
var netid, password;

// Keep local copy of settings
var settings;

//Initialize the headless browser to speedup login
var student = new StudentCenter();
student
  .init()
  .then(function (sc_new) {
    console.log('Ready');
    student = sc_new;
  })
  .catch(function (err) {
    console.trace(err);
  });


// Login user
module.exports['/login'] = function (body, res) {
  // Get the username and pw from the request

  netid    = body.netid;
  password = body.password;

  student
    .login(netid, password)
    .then(function (sc_new) {
      // Store the student's headless browser locally
      student = sc_new;
      res.send(true);
    })
    .catch(function (err) {
      console.error(err);
      // The login failed
      res.send(false);
    });
}

module.exports['/login-successful'] = function (body, res) {
  res.where.location = 'app://html/index.html';
};

// Serves the student's courses in JSON
module.exports['/courses'] = function (body, res) {
  student
    .getCourses()
    .then(function (courses) {
      res.send(courses);
    });
};

// Serve the settings
module.exports['/settings'] = function (body, res) {
  if (settings) {
    res.send(settings);
  } else {
    jf.readFile(settings_file, function (err, obj) {
      res.send(obj);
    });
  }
};

// Update settings
module.exports['/update-settings'] = function (body, res) {

  // Update settings in file
  jf.readFile(settings_file, function(err, obj) {
    var obj;
    if (!obj) {
      obj = {};
    }
    // Update netid
    obj.netid = netid;

    // Add each individual prop to existing settings
    Object.keys(body).forEach(function(key) {
      obj[key] = body[key];
    });

    // Update local copy
    settings = obj;

    // Write to settings file
    jf.writeFile(settings_file, obj, function(err) {
      if (err) {
        console.log('1', err);
      } else {

        // Settings file updated, now update keychain
        if (body.remember === 'false') {
          // Delete the password
          keychain.deletePassword({
            account: netid,
            service: 'Ezra'
          }, function (err) {
            if (err) {
              console.log('2', err);
            } else {
              res.send(true);
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
              console.log('3', err);
            } else {
              res.send(true);
            }
          });

        }
      }
    });
  });
};

module.exports['/pass'] = function (body, res) {
  jf.readFile(settings_file, function (err, obj) {
    settings = obj;
    if (!err) {
      if (settings.netid && settings.remember) {
        keychain.getPassword({
          account: settings.netid,
          service: 'Ezra'
        }, function (err, pass) {
          if (!err) {
            password = pass;

            res.send({
              user: settings.netid,
              password: password
            });
          }
        });
      }
    }
  });
}


module.exports['/information'] = function (body, res) {
  student
    .getInformation()
    .then(function (info) {
      res.send(info);
    });
};

module.exports['/menus'] = function (body, res) {
  rp('http://redapi-tious.rhcloud.com/dining/menu/ALL/ALL/LOCATIONS')
    .then(function (info) {
      res.send(JSON.parse(info));
    })
    .catch(function (err) {
      console.trace(err);
    });
};