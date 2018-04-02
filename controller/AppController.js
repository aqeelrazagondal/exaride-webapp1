var User = require('../models/User.js');
var Marker = require('../models/Marker.js');
var MarkerCategory = require('../models/MarkerCategory.js');
var Country = require('../models/Country.js');
var ConversationMessages = require('../models/ConversationMessages.js');
var Conversation = require('../models/Conversation.js');
var ConversationUser = require('../models/ConversationUser.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');

require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
//mongoose.createConnection(db.url);

//Get the default connection
//var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
//db.on('error', console.error.bind(console, 'MongoDB connection error:'));



exports.findAllUser=function(callback){
     
    try{
			User.find({}, function(err, users) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(users.length + ' Users Found');
				callback(users);
				//process.exit();
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in findAllUser method' + err);
	}
}



exports.findAllCountries=function(callback){
    
    try{
    Country.find({}, function(err, countries) {
    if (err){
         res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
                                });
    }
    
    else{ 
       // console.log(countries);
        callback(countries);
       // process.exit();
    } 
    });
		}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}


exports.findAllPhoneNo=function(callback){
     try{
			//query with mongoose
		   User.find({}, {'_id': 0, 'phone' :1}, { sort: { '_id': 1 } }, function(err,usersContactNumber) {
				if (err) {

				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				console.log(usersContactNumber);
				callback(usersContactNumber);
			   // process.exit();
			} 
			});
	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}

exports.userExists=function(phoneNo,callback){
	try{
			 var query = { phone : phoneNo };
			 User.findOne(query).exec(function(err, user){
				if (err){
					res.status(400).send({status:"failure",
										  message:err,
										  object:[]
					});
				}
				else{
					if (user){
					   logger.info("user found with phone no "+phoneNo);
						callback (user);
					}
					else{
						logger.info("user not found with phone no "+phoneNo);
						callback( user);
						
					}
			   }
			 });
	 	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}

exports.findAllPhoneNo=function(callback){
     try{
			//query with mongoose
		   User.find({}, {'_id': 0, 'phone' :1}, { sort: { '_id': 1 } }, function(err,usersContactNumber) {
				if (err) {

				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				console.log(usersContactNumber);
				callback(usersContactNumber);
			   // process.exit();
			} 
			});
	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}



exports.findAllMarkers=function(callback){
     
    try{
			Marker.find({}, function(err, markers) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(markers.length + ' Markers Found');
				callback(markers);
			
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in findAllMarkers method' + err);
	}
}

exports.findAllMarkerCategories=function(callback){
     
    try{
		MarkerCategory.find({}, function(err, markerCategory) {
			if (err){
				 res.status(400).send({status:"failure",
										  message:err,
										  object:[]
										});
			}
			
			else{ 
				logger.info(markerCategory.length + ' MarkerCategory Found');
				callback(markerCategory);
			
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in MarkerCategory method' + err);
	}
}
              