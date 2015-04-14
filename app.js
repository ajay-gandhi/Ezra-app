'use strict';
/* global console, require, application, Window, WebView */

// Needed for zombie to work. This is on harmony, which isn't enabled on default
// tint compile apparently.
if (typeof String.prototype.startsWith != 'function') {
  // see below for better implementation!
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

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


////////////////////////////////////////////////////////////////////////////////

var server = require('./server');

// Includes Tint's API, and sets up the runtime bridge.
require('Common'); 

application.exitAfterWindowsClose = true;
application.name = 'My Program';

/* The window */
var win = new Window(); // initially hidden.
win.title = 'Sha-boom';
win.appearance = 'dark';
win.canBeFullscreen = false;
win.width = 900;
win.height = 620;
win.animateOnSizeChange = true;
// win.resizable = false;

// Center window
var screens = require('Screens');
var active = screens.active;
win.x = (active.bounds.width / 2) - 450;
win.y = (active.bounds.height / 2) - 310;

/* The web view. */
var webview = new WebView();

webview.addEventListener('message', function(msg) {
  var data = JSON.parse(msg);
  
  if (!data.namespace)
    console.trace('Message has no namespace. Plz.');
  
  if (!data.body) 
    console.trace('Message has no body. Plz.');
  
  if (!server[data.namespace]) 
    console.trace('No action for namespace', data.namespace);
  
  // Server has all namespace actions.
  server[data.namespace](data.body, new Response(data.namespace, webview));
});

webview.top = 0;
webview.left = webview.right = webview.bottom = 0;
webview.location = 'app://html/login.html';
win.appendChild(webview);

var setup = require('./setup')(win, webview);
    setup.createToolbar();
    setup.createMenus();

win.visible = true;

