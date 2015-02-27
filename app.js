// Start a Nodejs server
var spawn  = require('child_process').spawn,
    server = spawn('node', ['server.js']);

// Start the app itself
var app           = require('app'),
    BrowserWindow = require('browser-window'),
    ipc           = require('ipc');

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
    resizable: false,
    frame: false,
    transparent: true
  });

  // load main page
  main_window.loadUrl('file://' + __dirname + '/html/login.html');

  main_window.on('close', function () {
    server.kill('SIGTERM');
  });
});

// Events for closing, minimizing window
ipc.on('close-window-event', function(event, arg) {
  if (arg == 'true') {
    main_window.close();
  }
});

ipc.on('minimize-window-event', function(event, arg) {
  if (arg == 'true') {
    main_window.minimize();
  }
});

// Login was successful
ipc.on('login-successful', function (event, arg) {
  // Resize and center
  main_window.setSize(800, 600);
  main_window.center();

  // Load new page
  main_window.loadUrl('file://' + __dirname + '/html/index.html');
});


