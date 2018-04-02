var mongoose = require('mongoose');
// var Routes = require('./Routes');
// var Driver = require('./Driver');
var Passenger = require('./passenger');
var User = require('./user');

var ShiftSchema = new mongoose.Schema({

    _userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null, required: true},
    // route: { type: mongoose.Schema.Types.ObjectId, ref: 'Routes', default: null },
    // passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'Passenger', default: null, required: true},
    starting_time: Date,
    ending_time: Date,
    shift_title: String,
    // vehicle: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' }
    vehicle: String

}, { timestamps: true });

module.exports = mongoose.model('Shift', ShiftSchema);