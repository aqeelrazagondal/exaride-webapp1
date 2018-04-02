var mongoose = require('mongoose');
var User = require('./User');
//var Location = require('./Location');


// Define our schema
var AlertTypeSchema   = new mongoose.Schema({
    
    //_userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null }, 
   _type:Number,
   title:String,
   descripton:String
    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('AlertType', AlertTypeSchema);