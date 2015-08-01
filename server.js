'use strict';
/* global require, console, module */
var jf            = require('jsonfile'),
    StudentCenter = require('./studentcenter.js'),
    rp            = require('request-promise'),
    keychain      = require('xkeychain'),
    fs            = require('fs');

// Location of settings file in user's home dir
var settings_file = process.env[(process.platform == 'win32')
  ? 'USERPROFILE'
  : 'HOME']
  + '/.ezra-settings';

// Create file if it doesn't exist
fs.open(settings_file, 'a', function (err, fd) {
  fs.close(fd);
});

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

// Update url if login successful
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
      if (err)
        res.send(err);
      else
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
        console.log(err);
      } else {

        // Settings file updated, now update keychain
        if (body.remember === 'false') {
          // Delete the password
          keychain.deletePassword({
            account: netid,
            service: 'Ezra'
          }, function (err) {
            if (err) {
              console.log(err);
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
              console.log(err);
            } else {
              res.send(true);
            }
          });

        }
      }
    });
  });
};

// Serve password if saved. Also autologin
module.exports['/pass'] = function (body, res) {
  var win             = body.w,
      progress_bar    = body.p_bar,
      progress_window = body.p_win;

  jf.readFile(settings_file, function (err, obj) {
    // 40% done
    progress_bar.width = 40 * 3;

    settings = obj;
    if (!err) {
      if (settings.netid && settings.remember) {
        keychain.getPassword({
          account: settings.netid,
          service: 'Ezra'
        }, function (err, pass) {
          // 50% done
          progress_bar.width = 50 * 3;

          if (!err) {
            // Save locally
            password = pass;

            if (settings.autologin) {
              // If autologin, have to ensure zombie initialized
              // Then login

              // 55% done
              progress_bar.width = 55 * 3;
              student
                .init()
                .then(function (sc_new) {
                  // 80% done
                  progress_bar.width = 80 * 3;
                  console.log('Autologin ready');
                  return sc_new.login(settings.netid, password);
                })
                .then(function (sc_new) {
                  // Store the student's headless browser locally
                  student = sc_new;
                  // 90% done
                  progress_bar.width = 90 * 3;
                  res.where.location = 'app://html/index.html';
                  res.send(true);

                  // Only show window once login complete
                  res.where.addEventListener('load', function() {
                    // Hide progress window
                    progress_bar.width = 100 * 3;
                    progress_window.visible = false;

                    var url = res.where.location;
                    if (url.indexOf('index.html', url.length - 10) !== -1) {
                      win.visible = true;
                    }
                  });
                })
                .catch(function (err) {
                  console.error(err);
                  // The login failed
                  res.send(false);
                });

            } else {
              // No autologin, just send pw
              res.send({
                user: settings.netid,
                password: password
              });

              // Hide progress window
              progress_bar.width = 100 * 3;
              progress_window.visible = false;

              win.visible = true;
            }
          } else {
            console.log(err);
            // Everything done
            // Hide progress window
            progress_bar.width = 100 * 3;
            progress_window.visible = false;

            win.visible = true;
          }
        });

      } else {
        // Everything done
        // Hide progress window
        progress_bar.width = 100 * 3;
        progress_window.visible = false;

        win.visible = true;
      }
    } else {
      // Everything done
      // Hide progress window
      progress_bar.width = 100 * 3;
      progress_window.visible = false;

      win.visible = true;
    }
  });
};

// Serve student info
module.exports['/information'] = function (body, res) {
  student
    .getInformation()
    .then(function (info) {
      res.send(info);
    });
};

// Sends menu information
module.exports['/menus'] = function (body, res) {
  rp('http://redapi-tious.rhcloud.com/dining/menu/ALL/ALL/LOCATIONS')
    .then(function (info) {
      res.send(JSON.parse(info));
    })
    .catch(function (err) {
      console.trace(err);
    });
};