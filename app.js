'use strict';
/* global console, require, application, Window, WebView */

/**
 * Needed for zombie to work. This is on harmony, which isn't enabled on default
 * tint compile apparently.
 */
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

/////////////////////////////////// Response ///////////////////////////////////

/**
 * Sends a message to given namespace. 
 * @param {[type]} namespace [description]
 */
function Response (namespace, where) {
  this.namespace = namespace;
  this.where = where;
}

Response.prototype.send = function(body) {
  var msg = JSON.stringify({
    namespace : this.namespace,
    body : body
  });

  this.where.postMessage(msg);
};

//////////////////////////////////// Setup /////////////////////////////////////

var jf   = require('jsonfile'),
    rp   = require('request-promise'),
    open = require('open');

var server = require('./server');

// Includes Tint's API, and sets up the runtime bridge.
require('Common'); 

application.exitAfterWindowsClose = true;
application.name = 'Ezra';

/* The window */
var win                     = new Window(); // initially hidden.
    win.title               = 'Ezra';
    win.appearance          = 'dark';
    win.canBeFullscreen     = false;
    win.width               = 900;
    win.height              = 620;
    win.resizable           = false;

// Center window
var screens = require('Screens');
var active  = screens.active;
win.x       = (active.bounds.width / 2) - 450;
win.y       = (active.bounds.height / 2) - 310;

/* Loading progress */
// Requires a window, bg, and the bar itself
var progress_window                 = new Window();
    progress_window.title           = 'Loading';
    progress_window.appearance      = 'dark';
    progress_window.canBeFullscreen = false;
    progress_window.width           = 300;
    progress_window.height          = 100;
    progress_window.resizable       = false;
    progress_window.visible         = true;
    progress_window.x               = (active.bounds.width / 2) - 150;
    progress_window.y               = (active.bounds.height / 2) - 50;

var progress_bg                 = new Box();
    progress_bg.top             = 10;
    progress_bg.left            = 0;
    progress_bg.right           = 0;
    progress_bg.height          = 50;
    progress_bg.backgroundColor = '#2E2E2E';

var progress                     = new Box();
    progress.top                 = 11;
    progress.left                = 0;
    progress.width               = 0;
    progress.height              = 48;
    progress.borderColor         = '#787878';
    progress.backgroundColor     = '#787878';
    progress.animateOnSizeChange = true;

progress_window.appendChild(progress_bg);
progress_window.appendChild(progress);

/* The web view */
var webview = new WebView();
    webview.top = 0;
    webview.left = webview.right = webview.bottom = 0;
    webview.location = 'app://html/login.html';
win.appendChild(webview);

webview.addEventListener('message', function(msg) {
  var data = JSON.parse(msg);
  
  if (!data.namespace) {
    console.trace('Message has no namespace. Plz.');
    return;
  }
    
  if (!data.body) {
    console.trace('Message has no body. Plz.');
    return;
  }
  
  if (!server[data.namespace]) {
    console.trace('No action for namespace', data.namespace);
    return;
  }
  
  // Server has all namespace actions.
  server[data.namespace](data.body, new Response(data.namespace, webview));
});

// Fetch and send password when login loaded. Also autologin
// This displays the window once everything loads
webview.addEventListener('load', function() {

  // 20% done
  progress.width = 20 * 3;

  var url = webview.location;
  if (url.indexOf('login.html', url.length - 10) !== -1) {
    // Pass the progress bar and window to the server so it can update progress
    // bar and make the window visible
    var locals = {
      w:     win,
      p_bar: progress,
      p_win: progress_window,
      updt:  update_required
    }
    server['/pass'](locals, new Response('/pass', webview));
  }
});

// Setup toolbars, etc
var setup = require('./setup')(win, webview);
    setup.createToolbar();
    setup.createMenus();

//////////////////////////////////// Update ////////////////////////////////////

var update_required = false;

// Read remote package.json to see if out of date
var obj = require(__dirname + '/package.json');
var dialog_content = 'It looks like your version of Ezra is out of date. ' +
  'Update to fix errors and get awesome new features! You can update by ' +
  'downloading the new version from http://ajay-gandhi.github.io/Ezra-app';

rp('https://raw.githubusercontent.com/ajay-gandhi/Ezra-app/master/package.json')
  .then(function (body) {
    if (JSON.parse(body).version !== obj.version) {

      // Must update
      update_required            = new Dialog();
      update_required.icon       = 'caution';
      update_required.mainbutton = 'Take me there';
      update_required.auxbutton  = 'Okay';
      update_required.message    = dialog_content;
      update_required.title      = 'Update Required';

      update_required.addEventListener('click', function (which) {

        // Open the website
        if (which === 'main')
          open('http://ajay-gandhi.github.io/Ezra-app');

        process.exit(0);
      });
    }
  });
