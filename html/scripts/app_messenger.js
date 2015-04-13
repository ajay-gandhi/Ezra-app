'use strict';
/////////////////////////////////// LOGGING ////////////////////////////////////

/**
 * Tint doesn't (yet) support developer tools on OSX, so route all logs to a div
 * in the actual html document.
 */
if (typeof console  != 'undefined') {
  if (typeof console.log != 'undefined') {
    console.olog = console.log;
  } else {
    console.olog = function() {};
  }
}

/**
 * Redirects console logs to the #log div. Supports only one argument atm.
 */
console.log = function(message) {
  // var args = Array.prototype.slice.call(arguments);
  if ((typeof message) === 'function') {
    message = '[Cannot log function]';
  }
 
  console.olog(message);

  try {
    $('#log').append('<p>' + JSON.stringify(message) + '</p>');
  } catch (e) {
    $('#log').append('<p>' + JSON.stringify(e) + '</p>');
    $('#log').append('<p>' + message + '</p>');
  }
}

// All console functions log to #log
console.error = console.debug = console.info = console.log;



////////////////////////////////// MESSAGING ///////////////////////////////////

/**
 * Messenger handles node-webview communication using tint's message events.
 *    Adds support for sending serializable (JSON) objects to specific namespaces
 */
function Messenger () {

  var self = this;
  this.listeners = {};

  if (!window.postMessageToHost) {
    console.log('Not running on tint! Messages not supported');
    return;
  }

  window.addEventListener('message', handle_message.bind(this));
}

/**
 * Handles a message returned from the app. Ensures that the message conforms to
 *   a certain format before calling the appropriate handler.
 * @param {Object} message   The object returned from the app
 */
var handle_message = function(message) {
  try {
    var msg = JSON.parse(message.data);

    // Ensure returned message contains all necessary parts
    if (!msg.namespace) {
      console.log('No namespace damnit.');
      return;
    }

    if (!msg.hasOwnProperty('body')) {
      console.log('No body damnit.');
      return;
    }

    if (!this.listeners[msg.namespace]) {
      console.log('No listener for ' + msg.namespace);
      return;
    }

    // Call handler
    this.listeners[msg.namespace](msg.body);
  } catch (e) {
    console.log(e);
  }
}

/**
 * Registers a handler for a message recieved on namespace @param{namespace}
 * @param {string}   namespace   The namespace on which to expect a response
 * @param {function} handler     The function to call when a message is
 *   received on the given namespace
 */
Messenger.prototype.recieve = function(namespace, handler) {
  this.listeners[namespace] = handler;
};

/**
 * Sends a message to the app. The response for request(x, _) should be expected
 * with receive(x, _), for the same namespace string x. It's usage resembles
 * http in this app.
 * @param {string} namespace   The namespace on which to send the request
 * @param {Object} body        Parameters to send to the app
 */
Messenger.prototype.request = function(namespace, body) {
  if (body === null) body = {};

  // Format request
  var msg = JSON.stringify({
    namespace : namespace,
    body : body
  });

  if (!window.postMessageToHost) {
    console.log('Not running on tint! Messages not supported');
    return;
  }

  // Send request
  window.postMessageToHost(msg);
};

window.messenger = new Messenger();
