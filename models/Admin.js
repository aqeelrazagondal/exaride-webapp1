// grab the things we need

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//mongoose.Promise = global.Promise;
// create a schema

var adminSchema = new Schema({

      user_name: { type: String, required: true, unique: true }, 
	password: String,
      phone: String,
      full_name: String,
      profile_photo_url:{type:String,default:null },
      email_address:String
    
}, {timestamps: true});

// the schema is useless so far
// we need to create a model using it
var Admin = mongoose.model('Admin', adminSchema);

// make this available to our users in our Node applications
module.exports = Admin;