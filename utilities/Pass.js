var crypto = require('crypto');
var express = require('express');
var router = express.Router();
var mongoose= require('mongoose');
var bodyParser = require('body-parser');

var SaltLength = 9;

var Pass = function Constructor() {

};

Pass.prototype.createHash=function(password) {
  var salt = this.generateSalt(SaltLength);
  var hash = this.md5(password + salt);
  return salt + hash;
}

Pass.prototype.validateHash=function(hash, password) {
  var salt = hash.substr(0, SaltLength);
  var validHash = salt + this.md5(password + salt);
  return hash === validHash;
}

Pass.prototype.generateSalt=function(len) {
  var set = '0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQURSTUVWXYZ',
      setLen = set.length,
      salt = '';
  for (var i = 0; i < len; i++) {
    var p = Math.floor(Math.random() * setLen);
    salt += set[p];
  }
  return salt;
}

Pass.prototype.md5=function md5(string) {
  return crypto.createHash('md5').update(string).digest('hex');
}

/*module.exports = {
  'hash': createHash,
  'validate': validateHash
};*/

module.exports = Pass;