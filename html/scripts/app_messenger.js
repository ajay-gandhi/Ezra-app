'use strict';
/* global $, console */

/////////////////////////////////// LOGGING. ///////////////////////////////////

/**
 * Tint doesn't (yet) support developer tools on OSX. We can just route all logs
 * to a div in the acutal html document.
 */

if (typeof console  != 'undefined') 
  if (typeof console.log != 'undefined')
    console.olog = console.log;
  else
    console.olog = function() {};

/**
 * Logs to the #log div. Note: at the moment supports only one argument.
 */
console.log = function(message) {
  // var args = Array.prototype.slice.call(arguments);
  if ((typeof message) === 'function') message = '[function yo]';
  console.olog(message);
  try {
    $('#log').append('<p>' + JSON.stringify(message) + '</p>');
  } catch (e) {
    $('#log').append('<p>' + JSON.stringify(e) + '</p>');
    $('#log').append('<p>' + message + '</p>');
  }
};

// All console functions log to #log
console.error = console.debug = console.info =  console.log;



////////////////////////////////// MESSAGING. //////////////////////////////////

/**
 * Messenger handles node-webview communication using tint's message events. It
 * adds support for messaging serializable (JSON) objects to specific namespaces
 */
function Messenger () {
  
  var self = this;
  this.listeners = {};

  if (!window.postMessageToHost) {
    console.log('!!! Not running on tint! Messages not supported');
    return;
  }

  window.addEventListener('message', handle_message.bind(this));
}

var handle_message = function(message) {
  try {
    console.log('-->' + message.data);
    console.log('listeners: ' + JSON.stringify(Object.keys(this.listeners)));

    var msg = JSON.parse(message.data);

    console.log(msg.namespace + ' -> ' + JSON.stringify(msg.body));

    
    if (!msg.namespace)
      { console.log('No namespace damnit.'); return; }
    
    if (!msg.hasOwnProperty('body'))
      { console.log('No body damnit.'); return; }
    
    if (!this.listeners[msg.namespace])
      { console.log('No listener for ' + msg.namespace); return; }

    this.listeners[msg.namespace](msg.body);
  } catch (e) {
    console.log(e)
  }
}

/**
 * Registers a callback for a message recieved on namespace @param{namespace}
 * @param  {function} fun     TODO: function arguments
 */
Messenger.prototype.recieve = function(namespace, funclol) {
  this.listeners[namespace] = funclol;
};

/**
 * Sends a message. Response for request(x, _) should be expected with
 * recieve(x, _), for the same namespace string x. It's kinda like http, at
 * least in the way we use it on this app.
 */
Messenger.prototype.request = function(namespace, body) {
  if (body === null) body = {};

  // console.log(namespace + ' <- ' + JSON.stringify(body));
  var msg = JSON.stringify({
    namespace : namespace,
    body : body
  });

  if (!window.postMessageToHost) {
    console.log('x nope');
    return;
  }

  window.postMessageToHost(msg);
};


window.coolio = new Messenger();

