/**
 * This module control the encoding and decoding of data that is transferred
 * between the client and the server
 */

var encode = function (dec) {
  return new Buffer(str).toString('base64');
}
module.exports.encode = encode;

var decode = function (enc) {
  return new Buffer(enc).toString('ascii');
}
module.exports.decode = decode;