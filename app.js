/*
 * This file acts as the controller between the server, which controls the
 * majority of backend functions, and the window.
 */

// Start a Nodejs server
var spawn  = require('child_process').spawn,
    server = spawn('node', ['server.js']);

// Log output from the server
server.stdout.on('data', function (chunk) {
  console.log('Server output: ', chunk.toString().trim());
});

// Start the app itself
var app           = require('app'),
    BrowserWindow = require('browser-window'),
    ipc           = require('ipc'),
    request       = require('request'),
    keychain      = require('xkeychain'),
    jf            = require('jsonfile');

// Main GUI window
var main_window = null;

// Quit when all windows closed
app.on('window-all-closed', function () {
  app.quit();
});

// Called when atom-shell inits everything
app.on('ready', function () {
  // Create window
  main_window = new BrowserWindow({
    width: 380,
    height: 320,
    resizable: true,
    frame: false,
    transparent: true
  });

  // Load main page
  main_window.loadUrl('file://' + __dirname + '/html/login.html');

  // Retrieve pw if it exists and send it
  main_window.webContents.on('did-finish-load', function() {
    jf.readFile(__dirname + '/settings.json', function(err, obj) {
      keychain.getPassword({ account: obj.netid, service: 'Ezra' }, function(err, pass) {
        if (err) {
          console.log(err);
        } else {
          if (pass !== ' ') {
            var creds = {
              netid: obj.netid,
              password: pass
            };
            main_window.webContents.send('creds', JSON.stringify(creds));
          }
        }
      });
    });
  });

  main_window.on('close', function () {
    server.kill('SIGTERM');
  });
});

/******************************************************************************/
/*************************** Events from the window ***************************/
/******************************************************************************/

// Closing, minimizing window
ipc.on('close-window', function (e, arg) {
  if (arg === 'true') {
    main_window.close();
  }
});

ipc.on('minimize-window', function (e, arg) {
  if (arg === 'true') {
    main_window.minimize();
  }
});

// Update settings
ipc.on('settings-update', function (e, arg) {
  args = JSON.parse(arg);
  request({
    uri: 'http://127.0.0.1:3005/update-settings',
    qs:  args
  }, function (error, response, body) {
    if (body !== 'true') {
      console.error('Error updating settings');
      console.log(error);
    }
  });
});

// Login was successful
ipc.on('login-successful', function (e, arg) {
  // Resize and center
  main_window.setSize(930, 630);

  // Find current position, subtract 1/2 new size
  var cur_pos = main_window.getPosition();
  var new_x = cur_pos[0] - 465 + 190;
  var new_y = cur_pos[1] - 315 + 170;
  main_window.setPosition(new_x, new_y);

  // Load new page
  main_window.loadUrl('file://' + __dirname + '/html/index.html');
});