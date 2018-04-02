var mongoose = require('mongoose');
var User = require('./User');
//var Location = require('./Location');


// Define our schema
var ReviewSchema   = new mongoose.Schema({
    
    //_userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null }, 
    reviewBy : { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewFor:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    ratings:Number,
    comment:String
    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Review', ReviewSchema);