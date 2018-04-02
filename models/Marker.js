var mongoose = require('mongoose');
//var User = require('./User');


// Define our markers schema
var MarkerSchema   = new mongoose.Schema({
   
    title:String,
	description:{type:String,default:null },
	description_arb:{type:String,default:null },
	description_eng:{type:String,default:null },
	marker_photo_url:{type:String,default:null },
	radius:Number,
	loc: {
	type: [Number],  // [<longitude>, <latitude>]
	index: '2d'      // create the geospatial index
	},
	_categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'MarkerCategory' },
	sort_order:Number
	
}, {timestamps: true});


MarkerSchema.index({loc:1})
// Export the Mongoose model
module.exports = mongoose.model('Marker', MarkerSchema);
