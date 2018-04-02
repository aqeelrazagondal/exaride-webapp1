var mongoose = require('mongoose');

var PassengerSchema = new mongoose.Schema({
    phone: { type: String, unique: true },
    full_name: String,
    profile_photo_url: { type: String, default: null },
    active: Boolean,
    email: String,
    address: String
}, { timestamps: true });

module.exports = mongoose.model('Passenger', PassengerSchema);