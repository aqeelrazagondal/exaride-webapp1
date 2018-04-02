
// Define our schema

var ConversationStatuses = function Constructor() {
   
};

ConversationStatuses.prototype.returnConversationRead=function() {
  return 100;
} 

ConversationStatuses.prototype.returnConversationUnRead=function() {
  return 200;
} 

module.exports = ConversationStatuses;