var mongoose = require('mongoose');

// Define our beer schema
var syncContactSchema   = new mongoose.Schema({
    
    syncContactNo:String,
    syncContactName:String,
    syncByContactNo:String,
    createdOnUTC:  { type: Date, default: Date.now },
    updatedOnUTC:  { type: Date, default: Date.now },
   
});


// Export the Mongoose model
module.exports = mongoose.model('SyncContact', syncContactSchema);
