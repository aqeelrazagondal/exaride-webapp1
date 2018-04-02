
// Define our schema

var PasscodeStatuses = function Constructor() {
   
};

PasscodeStatuses.prototype.returnNotSet=function() {
  return 100;
} 

PasscodeStatuses.prototype.returnPasscodeOn=function() {
  return 200;
} 

PasscodeStatuses.prototype.returnPasscodeOff=function() {
  return 300;
}
// Export the Mongoose model
module.exports = PasscodeStatuses;