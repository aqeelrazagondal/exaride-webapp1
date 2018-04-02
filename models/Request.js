var mongoose = require('mongoose');
var Region = require('./Region');

var Location = require('./Location');

// Define our schema
var RequestSchema   = new mongoose.Schema({
    
    //_userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null }, 
    regionOfRequest : { type: mongoose.Schema.Types.ObjectId, ref: 'Region' },
    pickupLocation:{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
    dropoffLocation:{ type: mongoose.Schema.Types.ObjectId, ref: 'Location'},
    pickupTime: Date,
    dropOffTime: Date,
    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Request', RequestSchema);