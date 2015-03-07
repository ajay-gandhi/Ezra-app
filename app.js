// Start a Nodejs server
var spawn  = require('child_process').spawn,
    server = spawn('node', ['server.js']);

// Log output from the server
server.stdout.on('data', function (chunk) {
  console.log('Server output: ', chunk.toString());
});

// Start the app itself
var app           = require('app'),
    BrowserWindow = require('browser-window'),
    ipc           = require('ipc'),
    request       = require('request');

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

  // load main page
  main_window.loadUrl('file://' + __dirname + '/html/login.html');

  // Make a request to the headless browser to init it
  // Give it 2 seconds to start up
  setTimeout(function () {
    request('http://127.0.0.1:3005/init', function (error, response, body) {
      if (body !== 'true') {
        console.error('Error initializing browser:');
        console.log(error);
      }
    });
  }, 2000);

  main_window.on('close', function () {
    server.kill('SIGTERM');
  });
});

// Events for closing, minimizing window
ipc.on('close-window-event', function(event, arg) {
  if (arg === 'true') {
    main_window.close();
  }
});

ipc.on('minimize-window-event', function(event, arg) {
  if (arg === 'true') {
    main_window.minimize();
  }
});

// Login was successful
ipc.on('login-successful', function (event, arg) {
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