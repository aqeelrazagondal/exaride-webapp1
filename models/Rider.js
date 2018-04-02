var mongoose = require('mongoose');
var User = require('./User');

// Define our schema
var RiderSchema   = new mongoose.Schema({
    
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
  
    active: { type: Boolean, default: false },
   
}, {timestamps: true});
RiderSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Rider', RiderSchema);