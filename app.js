'use strict';
/* global console, require, application, Window, Menu, MenuItem, 
          MenuItemSeparator, process, WebView */

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
win.visible = true;
win.title = 'Some Title';
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

webview.left = webview.right = webview.top = webview.bottom = 0;
webview.location = 'app://html/login.html';
win.appendChild(webview);

/* The toolbar */
// var toolbar = new Toolbar();
// toolbar.appendChild(new Button())
// win.toolbar = toolbar;


/* The menu */
// I copied this from someplace. lol. I think the tests for tint acutally.

var ismac = require('os').platform().toLowerCase() == 'darwin';
var mainMenu   = new Menu();
var appleMenu  = new MenuItem(application.name, '');
var fileMenu   = new MenuItem('File', '');
var editMenu   = new MenuItem('Edit', '');
var windowMenu = new MenuItem('Window', '');
var helpMenu   = new MenuItem('Help', '');

/* @hidden */ if(ismac)
mainMenu.appendChild(appleMenu);
mainMenu.appendChild(fileMenu);
mainMenu.appendChild(editMenu);
mainMenu.appendChild(windowMenu);
mainMenu.appendChild(helpMenu);

var appleSubmenu = new Menu(application.name);
appleSubmenu.appendChild(new MenuItem('About '+application.name, ''))
  .addEventListener('click', function() {
    // Display about window
    var about_panel = new Panel();
        about_panel.visible = true;
        about_panel.title = 'About ' + application.name;
        about_panel.appearance = 'dark';
        about_panel.canBeFullscreen = false;
        about_panel.width = 300;
        about_panel.height = 400;
        about_panel.x = (active.bounds.width / 2) - 150;
        about_panel.y = (active.bounds.height / 2) - 200;

    // Actual content
    var about_webview = new WebView();
        about_webview.location = 'app://html/about.html';
        about_panel.appendChild(about_webview);
  });
appleSubmenu.appendChild(new MenuItemSeparator());
appleSubmenu.appendChild(new MenuItem('Hide '+application.name, 'h'))
  .addEventListener('click', function() { application.visible = false; });
appleSubmenu.appendChild(new MenuItem('Hide Others', ''))
  .addEventListener('click', function() { application.hideAllOtherApplications(); });
appleSubmenu.appendChild(new MenuItem('Show All', ''))
  .addEventListener('click', function() { application.unhideAllOtherApplications(); });
appleSubmenu.appendChild(new MenuItemSeparator());
appleSubmenu.appendChild(new MenuItem('Quit '+application.name, 'q'))
  .addEventListener('click', function() { 
    /* @hidden */ if(ismac) process.exit(0);
  });
appleMenu.submenu = appleSubmenu;

var fileSubmenu = new Menu('File');
fileSubmenu.appendChild(new MenuItem('Close', 'c', 'cmd'))
  .addEventListener('click', function() {
    /* @hidden */ if(!ismac) process.exit(0);
  });
fileMenu.submenu = fileSubmenu;

var editSubmenu = new Menu('Edit');
var undo = new MenuItem('Undo', 'u');
undo.addEventListener('click', function() { application.undo(); });
editSubmenu.appendChild(undo);
editSubmenu.appendChild(new MenuItem('Redo', 'r'))
  .addEventListener('click', function() { application.redo(); });
editSubmenu.appendChild(new MenuItemSeparator());
editSubmenu.appendChild(new MenuItem('Copy', 'c'))
  .addEventListener('click', function() { application.copy(); });
editSubmenu.appendChild(new MenuItem('Cut', 'x'))
  .addEventListener('click', function() { application.cut(); });
editSubmenu.appendChild(new MenuItem('Paste', 'p'))
  .addEventListener('click', function() { application.paste(); });
editMenu.submenu = editSubmenu;

var windowSubmenu = new Menu('Window');
windowSubmenu.appendChild(new MenuItem('Minimize', 'm'))
  .addEventListener('click', function() { win.state = 'minimized'; });
windowSubmenu.appendChild(new MenuItemSeparator());
windowSubmenu.appendChild(new MenuItem('Bring All to Front', ''))
  .addEventListener('click', function() { win.bringToFront(); });
windowSubmenu.appendChild(new MenuItemSeparator());
windowMenu.submenu = windowSubmenu;

var helpSubmenu = new Menu('Help');
helpSubmenu.appendChild(new MenuItem('Website', ''))
  .addEventListener('click', function() { console.log('Do something for website?!'); });
helpSubmenu.appendChild(new MenuItem('Online Documentation', ''))
  .addEventListener('click', function() { console.log('Do something for docs?!'); });
helpSubmenu.appendChild(new MenuItem('License', ''))
  .addEventListener('click', function() { console.log('Do something for license?!'); });
helpMenu.submenu = helpSubmenu;

win.menu = mainMenu;
