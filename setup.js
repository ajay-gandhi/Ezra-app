'use strict';

/* Handles the auxiliary setup of the app, such as the toolbar and menus */

function Setup(w, view) {
  this.w = w;
  this.view = view;
}

/**
 * Creates and inserts toolbar buttons. Also adds click events for buttons.
 */
Setup.prototype.createToolbar = function () {
  var win = this.w;
  var webview = this.view;

  var schedule_button      = new Button();
    schedule_button.title  = 'My Schedule';
    schedule_button.width  = 100;
    schedule_button.height = 30;
    schedule_button.top    = -100;
    schedule_button.left   = 175;
    schedule_button.addEventListener('click', function () {
      webview.postMessage(JSON.stringify({
        namespace : '/navigation',
        body : 0
      }));
    });

  var info_button        = new Button();
      info_button.title  = 'My Information';
      info_button.width  = 100;
      info_button.height = 30;
      info_button.top    = -100;
      info_button.left   = 325;
      info_button.addEventListener('click', function () {
        webview.postMessage(JSON.stringify({
          namespace : '/navigation',
          body : 1
        }));
      });

  var dining_button        = new Button();
      dining_button.title  = 'Dining';
      dining_button.width  = 100;
      dining_button.height = 30;
      dining_button.top    = -100;
      dining_button.left   = 475;
      dining_button.addEventListener('click', function () {
        webview.postMessage(JSON.stringify({
          namespace : '/navigation',
          body : 2
        }));
      });

  var settings_button        = new Button();
      settings_button.title  = 'Settings';
      settings_button.width  = 100;
      settings_button.height = 30;
      settings_button.top    = -100;
      settings_button.left   = 625;
      settings_button.addEventListener('click', function () {
        webview.postMessage(JSON.stringify({
          namespace : '/navigation',
          body : 3
        }));
      });

  var buttonGroup = new ButtonGroup();
      buttonGroup.appendChild(schedule_button);
      buttonGroup.appendChild(info_button);
      buttonGroup.appendChild(dining_button);
      buttonGroup.appendChild(settings_button);
      buttonGroup.selected = 0;
      buttonGroup.center = '100%';
      buttonGroup.top = 2;

  // Move the buttons into place when index.html loaded
  webview.addEventListener('load', function() {
    var url = webview.location;
    if (url.indexOf('login.html', url.length - 10) === -1) {
      // Make space for toolbar
      webview.top = 32;
      // Show toolbar button group
      win.appendChild(buttonGroup);
    }
  });
}

/**
 * Creates the menus in the menu bar for the app. Mostly copied from the tests
 * for tint.
 */
Setup.prototype.createMenus = function() {
  var win = this.w;

  var ismac      = require('os').platform().toLowerCase() == 'darwin';
  var mainMenu   = new Menu();
  var appleMenu  = new MenuItem(application.name, '');
  var fileMenu   = new MenuItem('File', '');
  var editMenu   = new MenuItem('Edit', '');
  var windowMenu = new MenuItem('Window', '');
  var helpMenu   = new MenuItem('Help', '');

  if (ismac)
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
      if(ismac) process.exit(0);
    });
  appleMenu.submenu = appleSubmenu;

  var fileSubmenu = new Menu('File');
  fileSubmenu.appendChild(new MenuItem('Close', 'w', 'cmd'))
    .addEventListener('click', function() { process.exit(0); });
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
  editSubmenu.appendChild(new MenuItem('Select All', 'a'))
    .addEventListener('click', function() { application.selectAll(); });
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
}

module.exports = (function (w, win) {
  return new Setup(w, win);
})