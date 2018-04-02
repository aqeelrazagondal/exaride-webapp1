var mongoose = require('mongoose');
var User = require('./User');
var Conversation = require('./Conversation');

// Define our schema
var ConversationUserSchema   = new mongoose.Schema({


    _conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    _userMobile: String,
    leaveConversation:{ type: Boolean, default: false },
  
    
} , {timestamps: true});
ConversationUserSchema.index({ _conversationId:1,_userMobile: 1,createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('ConversationUser', ConversationUserSchema);