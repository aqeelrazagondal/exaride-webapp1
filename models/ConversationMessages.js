var mongoose = require('mongoose');
var User = require('./User');
var Conversation = require('./Conversation');

// Define our schema
var ConversationMessagesSchema   = new mongoose.Schema({
    messageType: String,
    messageText: String,
    messageData:Object,
    _conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' },
    _messageToUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
    _messageFromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    _messageFromMobile: String,
    _messageToMobile: {type : String, default :null },
  //  createdOnUTC: { type: Date, default: Date.now },
   // updatedOnUTC: { type: Date, default: Date.now },
    userMessageFromDeliverStatus: { type: Boolean, default: false },
    deletedByUserMobile: String,
}, {timestamps: true});
ConversationMessagesSchema.index({_conversationId:1, _messageFromMobile: 1,_messageToMobile: 1,createdOnUTC:1})
// Export the Mongoose model
module.exports = mongoose.model('ConversationMessages', ConversationMessagesSchema);