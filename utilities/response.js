/**
 * Created by Tauqeer on 16-09-2016.
 */
var mongoose = require('mongoose');


// Define our schema
var Response   = new mongoose.Schema({
    message:String,
    code:Number,
    data : Object
});

// Export the Mongoose model
module.exports = mongoose.model('Response', Response);