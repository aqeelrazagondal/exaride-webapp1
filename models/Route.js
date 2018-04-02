var mongoose = require('mongoose');
var Location = require('./Location');

// Define our schema
var RouteSchema   = new mongoose.Schema({
    
    //_userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null },
   _beginLocation:{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' ,default:null },
   _endLocation:{ type: mongoose.Schema.Types.ObjectId, ref: 'Location' ,default:null },
    
   
}, {timestamps: true});
//RouteSchema.index({})
// Export the Mongoose model
module.exports = mongoose.model('Route', RouteSchema);