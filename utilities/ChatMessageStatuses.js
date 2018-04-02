
// Define our schema

var ChatMessageStatuses = function Constructor() {
   
};

ChatMessageStatuses.prototype.returnChatMessageSent=function() {
  return 100;
} 

ChatMessageStatuses.prototype.returnChatMessageDelivered=function() {
  return 200;
} 

module.exports = ChatMessagesTypes;