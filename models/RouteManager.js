var mongoose = require('mongoose');
var User = require('./User');

// Define our schema
var RouteManagerSchema   = new mongoose.Schema({
    
    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
    
    active: { type: Boolean, default: false },
   
}, {timestamps: true});
RouteManagerSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('RouteManager', RouteManagerSchema);