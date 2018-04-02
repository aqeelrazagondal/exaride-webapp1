var mongoose = require('mongoose');
var User = require('./User');
var Location = require('./Location');
var Driver = require('./Driver');


// Define our schema
var TripSchema   = new mongoose.Schema({
    
    driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver'  }, 
    startTime: Date,
    endTime: Date,
    

    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Trip', TripSchema);