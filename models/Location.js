var mongoose = require('mongoose');

var LocationSchema = new mongoose.Schema({
    name: String,
    latitude: String,
    longitude: String
    // geo: {
    //     type: [Number],
    //     index: '2d'
    // }
}, { timestamps: true });


module.exports = mongoose.model('Location', LocationSchema);