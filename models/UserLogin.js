var mongoose = require('mongoose');
var User = require('./User');

// Define our schema
var UserLoginSchema   = new mongoose.Schema({
    
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
    password: String,
    active: { type: Boolean, default: false },
   
}, {timestamps: true});
UserLoginSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('UserLogin', UserLoginSchema);