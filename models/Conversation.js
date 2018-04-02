var mongoose = require('mongoose');
var User = require('./User');


// Define our beer schema
var ConversationSchema   = new mongoose.Schema({
    _adminId : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    conversationName:String,
    adminMobile:String,
	conversationImageUrl:{type:String,default:null },
    deletedByUserMobile: String,
    isGroupConversation:{type:Boolean,default:false },
	//isClosed:{type:Boolean,default:false }
}, {timestamps: true});


ConversationSchema.index({_adminId:1,adminMobile:1})
// Export the Mongoose model
module.exports = mongoose.model('Conversation', ConversationSchema);
