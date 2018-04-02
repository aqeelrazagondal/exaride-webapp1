var mongoose = require('mongoose');
var User = require('./User');
var AlertType = require('./AlertType');


// Define our schema
var AlertSchema   = new mongoose.Schema({
    
    //_userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' ,default:null }, 
   _type:{ type: mongoose.Schema.Types.ObjectId, ref: 'AlertType'  },
   sentBy:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
   sentTo:{ type: mongoose.Schema.Types.ObjectId, ref: 'User'  }, 

    
}, {timestamps: true});
//VehicleSchema.index({_userId})
// Export the Mongoose model
module.exports = mongoose.model('Alert', AlertSchema);