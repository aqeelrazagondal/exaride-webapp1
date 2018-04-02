var mongoose = require('mongoose');

// Define our schema
var RegionSchema = new mongoose.Schema({

    name: String

}, { timestamps: true });
//RegionSchema.index({})
// Export the Mongoose model
module.exports = mongoose.model('Region', RegionSchema);