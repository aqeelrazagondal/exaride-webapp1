
// Define our schema

var ChatMessagesTypes = function Constructor() {
   
};

ChatMessagesTypes.prototype.returnSimpleChatMessage=function() {
  return 100;
} 

ChatMessagesTypes.prototype.returnRequestMessage=function() {
  return 200;
} 

ChatMessagesTypes.prototype.returnSendEther=function() {
  return 300;
}

ChatMessagesTypes.prototype.returnAttachment=function() {
  return 400;
}

module.exports = ChatMessagesTypes;