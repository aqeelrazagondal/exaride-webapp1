var AppController= require('../controller/AppController.js');
var ChatController = require('../controller/ChatController.js');
var NotificationController = require('../controller/PushNotificationController.js');
var User = require('../models/User.js');
var Marker = require('../models/Marker.js');
var MarkerCategory = require('../models/MarkerCategory.js');
var db = require('../config/db');
var logger = require('../config/lib/logger.js');
//require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise; 
var geolib = require('geolib');
var multer  = require('multer');

var upload = multer({ dest: './public/images/profileImages' })
//mongoose.createConnection(db.url);




var markerExists=function(id,callback){
    
    logger.info('markerExists Method Called');
     var query = { _id : id };
     Marker.findOne(query).exec(function(err, marker){
        if (err){
            logger.error('Some Error while finding Marker' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (marker){                
                logger.info('Marker Found with id :'+id);
                callback (marker);
            }
            else{                
                 logger.info('Marker Not Found with id :'+id);
                callback( marker);                
            }
       }
     });
    
    logger.info(' Exit MarkerExists Method');
	
}


function inRadiusNotification(phoneNo,userLoc,marker){
	logger.info ('marker.title : ' +marker.title ); 
	logger.info ('marker.loc : ' +marker.loc );
	logger.info ('userLoc  ' + '  latitude :'  + userLoc.latitude + ' longitude : ' +  userLoc.longitude  );
	
	var query;
	var distance = geolib.getDistance(
    userLoc,
    marker.loc
	);
	logger.info ('distance: ' + distance);
	
	//Check if distance is less then defined radius
	
	if (distance<marker.radius)
	{
		var markerObj ={
				
				title:marker.title,
				description:marker.description,
				marker_photo_url:marker.marker_photo_url,
				longitude:marker.loc[0],
				latitude:marker.loc[1],				
				radius:marker.radius
				
				
		}
		//inside Radius, Send Push Notification
		logger.info ('inside Radius, Send Push Notification');
		query = { phone :phoneNo };
		User.findOne(query).exec(function(err, user){
					if (err){
						  logger.error('Some Error occured while finding user' + err );												
					}
					if (user){												  
						logger.info('User Found For Phone No: ' + phoneNo );
						logger.info('Sending Notification to player id ' + user.palyer_id );
						logger.info('marker Object : latitude = ' + markerObj.latitude + "** longitude =" + markerObj.longitude + "** radius =" + markerObj.radius);
						//logger.info('Individual Conversation msg  before Push Notification:'  );		
						NotificationController.sendNotifcationToPlayerId(user.palyer_id,markerObj,"reachedMarker");
						//msg=null;
					}
					else {
						logger.info('User not Found For Phone No: ' + phoneNo);                 												  
					}                               
				});
		
	}
	
	
}
 
function getMarkersList(callback){
	
	   
    try{
			Marker.find({}, function(err, markers) {
			if (err){
				logger.info('An Error Occured While Finding Markers '  + err);
			}			
			else{ 
				//logger.info(markers.length + ' Marker Found');
				callback(markers);				
			} 
			});
		}catch (err){
		logger.info('An Exception Has occured in getMarkersList method' + err);
	}
}
 
exports.updateUserLocation=function(reqData,res){
	try{
			var phoneNo=reqData.phoneNo;
			var longitude=reqData.longitude;
			var latitude=reqData.latitude;
			var userLoc = new Object({latitude: latitude, longitude: longitude});
			
			//Check valid Location -180 to 180
			logger.info('LocationController.updateUserLocation called  :' 
						  + phoneNo+ '**'+ longitude +'**'+ latitude);
			
			//Check if user have reached in radius of any marker set by admin
			var markersList=getMarkersList(function (markers){
				if (markers){
					logger.info('Marker Length : ' + markers.length );
					for (var i=0 ; i < markers.length; i++)
					{
						inRadiusNotification(phoneNo,userLoc, markers[i]);
						
					}
				}
				else {
					logger.info('An Error Occured While Finding Markers '  );
				}
			});
			
			AppController.userExists(phoneNo, function(user){
				if (user){
					user.loc=[longitude,latitude];
					user.last_shared_loc_time=new Date ();
					user.save(function (err, user){
						if(err){
								logger.error('Some Error while updating user' + err );
								 
							}
						else{
							logger.info('User Location With Phone Num ' + phoneNo );
										  
							res.jsonp({status:"success",
							message:"Location Updated!",
							 object:[]}); 
							 }
							 
						  
					  });
						
					logger.info('location : '+user.loc );
				}
				else{
					res.jsonp({status:"failure",
					message:"Failed To update Location!",
					object:[]}); 
				}
				
			});
	}catch (err){
		logger.info('An Exception Has occured in updateUserLocation method' + err);
	}
}


                        
exports.getUserLocation=function(phoneNo,callback){
    
	try{
		logger.info('LocationController.getUserLocation called for  :' 
					  + phoneNo);
		AppController.userExists(phoneNo, function(user){
		if (user){
				callback(user.loc);                
				logger.info('location : '+user.loc );
			}
			else{
				callback();
				//res.jsonp({status:"failure",
			//    message:"Failed To Find User!",
			  //  object:[]}); 
			}
			
		});
	}catch (err){
		logger.info('An Exception Has occured in getUserLocation method' + err);
	}
}

exports.getGroupUserLocations=function(conversationId,res){
	try{
		var groupUsersList=[];
		logger.info ('In LocationController.getGroupUserLocations ');
		ChatController.findConversationMembers(conversationId, function(members){
		if (members){
				let promiseArr = [];
				var tempObject;
			
				function addUser(num){
				
					
					return new Promise((resolve,reject) => {
						   AppController.userExists(num , function(user){
									if (user){
										logger.info ('  :' +user.phone);
										tempObject=new Object({
											phone:user.phone,
											full_name: user.full_name,
											profile_photo_url:user.profile_photo_url
										});
										if ((user.loc)&&(user.share_location)){
											tempObject.longitude=user.loc[0];
											tempObject.latitude=user.loc[1];
										}else{
											logger.info ('Null locations for :' +user.phone);
											tempObject.longitude=null;
											tempObject.latitude=null;
										}
										groupUsersList.push(tempObject); 
										resolve();										
										}
										else{
										logger.info ('Error Finding User with Mobile No : ' + num);
										  reject();
										}									
										});

					});
				}                                   
				for (var i=0; i < members.length ; i++){
					 promiseArr.push(addUser(members[i]._userMobile));																			
					} 
			
				 Promise.all(promiseArr)
					 .then((result)=> res.jsonp({status:"success",
									   message:"Group Users Locations",
									  object:[{"groupUsersList":groupUsersList}]}))
					 .catch((err)=>res.send({status:"failure",
									   message:"Error Occured While finding locations",
									  object:[{"groupUsersList":[]}]}));
		}	else {
				res.jsonp({status:"failure",
				message:"Error Occured While finding locations!",
				object:[{"groupUsersList":[]}]});
								}
									
							});						
		}catch (err){
		logger.info('An Exception Has occured in getGruoupUserLocations method' + err);
	}
	
}

                         
exports.updateShareLocationFlag=function(reqData,res){
	try{
			var phoneNo=reqData.phoneNo;
			var shareLocationFlag=reqData.shareLocationFlag;						
			logger.info('LocationController.updateShareLocationFlag called  :' 
						  + phoneNo+ '**'+ shareLocationFlag );
		
			AppController.userExists(phoneNo, function(user){
				if (user){
					user.share_location=shareLocationFlag;
					user.share_loc_flag_time=new Date();
					user.save(function (err, user){
						if(err){
							logger.error('Some Error while updating user' + err );
								 
						}
						else{
							logger.info('User Share Location Flag updated With Phone Num ' +
							phoneNo +' at  :' + new Date());										  
							res.jsonp({ status:"success",
										message:"Share Location Flag Updated!",
										object:[]}); 
						}						  
					  });
						
					logger.info(phoneNo + 'location flag : '+user.share_location );
				}
				else{
					res.jsonp({status:"failure",
					message:"Failed To update Share Location Flag !",
					object:[]}); 
				}
				
			});
	}catch (err){
		logger.info('An Exception Has occured in updateShareLocationFlag method' + err);
	}
}

// Marker Methods

//add Marker           
exports.setMarker=function(reqData,res){
	try{
			
			var title=reqData.title;
			var description=reqData.description;
			var longitude=reqData.longitude;
			var latitude=reqData.latitude;
			var radius=reqData.radius;
			var categoryId=reqData.categoryId;
			var engDescription=reqData.engDescription;
			var arbDescription=reqData.arbDescription;
			var sortOrder=reqData.sortOrder;
			
			//photo
			//Check valid Location -180 to 180
			logger.info('LocationController.setMarker called  :' 
						  + title + '**'+ longitude +'**'+ latitude);
	
			var newmarker = new Marker({  
                    title: title,
                    description:description ,
					radius:radius,
					_categoryId:categoryId,
					description_arb:arbDescription,
					description_eng:engDescription,
					sort_order:sortOrder
             });
			 newmarker.loc=[longitude,latitude];
			 
			 newmarker.save(function (err, user) {
			if(err){
				logger.error('Some Error while saving marker' + err );
				res.jsonp({status:"failure",
				message:"Some Error while saving marker",
				object:[]}); 
			}
			else{
				logger.info('Marker Created : ' + title );
				res.jsonp({status:"success",
				message:"Marker Created",
				object:[]});
				 
			 }
		   
			 });
	}catch (err){
		logger.info('An Exception Has occured in updateUserLocation method' + err);
	}
}



//Update Marker

exports.updateMarker=function(reqData,res){
	try{
			var markerId=reqData._id;
			var title=reqData.title;
			var description=reqData.description;
			var longitude=reqData.longitude;
			var latitude=reqData.latitude;
			var radius=reqData.radius;
			var categoryId=reqData.categoryId;
			var engDescription=reqData.engDescription;
			var arbDescription=reqData.arbDescription;
			var sortOrder=reqData.sortOrder;	
			//Check valid Location -180 to 180
			logger.info('LocationController.updateMarker called  :' 
						  + title + '**'+ longitude +'**'+ latitude);
	
	 //find Marker by markerId	 

	 markerExists(markerId,function(marker){
        if (marker){            
			//update marker model
			if (title)
			marker.title=title;
			if (description)
			marker.description=description;
			//if (title)
			marker.marker_photo_url=null;
			if (radius)
			marker.radius=radius;	
			if (categoryId)
			marker._categoryId=categoryId;
			if (longitude&&latitude)
			marker.loc=[longitude,latitude];
			if (arbDescription)
			marker.description_arb=arbDescription;
			if (engDescription)
			marker.description_eng=engDescription; 
			if (sortOrder)
			marker.sort_order=sortOrder; 
			marker.save(function (err, marker){
				if(err){
					logger.error('Some Error while updating marker' + err );
					res.jsonp({status:"failure",
					message:"Error Occured while Updating Marker ",
						object:[]}); 	
				}
				else{
					logger.info('marker updated  '  );
									
					res.jsonp({status:"success",
					message:"Marker Updated!",
						object:marker}); 
				}
                     
                  
              });                          
        }
        else{
            logger.info('Marker Not Found to Update  ');
            res.jsonp({status:"failure",
                            message:"No Marker Found to Update!",
                            object:[]}); 
        }
            
    });

	}catch (err){
		logger.info('An Exception Has occured in updateMarker method' + err);
	}
}


//Delete Marker

exports.deleteMarker=function(markerId,res){
    try {
		
		logger.info('deleteMarker Method Called for id : '+markerId);		
		Marker.remove({ _id: markerId}, function (err) {
				if (err){
					logger.error('Error Occured while Removing  Marker :'+ err);
					res.jsonp({status:"failure",
                            message:"Error Occured while removing Marker",
                            object:[]}); 
				} 
				else{
					logger.info('Marker with id ' +markerId + ' successfully Removed' );
					res.jsonp({status:"success",
								message:"Marker successfully Removed!",
								object:[]}); 
				}
				// removed!
		});				                                        
        
	}catch  (err){
		logger.info ('An Exception occured LocController.deleteMarker ' + err);
	}	
	
}



// Marker Category  Method
				
//add Market Category
exports.addMarkerCategory=function(reqData,res){
	try{
			
			var title=reqData.title;						
			logger.info('LocationController.addMarkerCategory called  :'+ title );
	
			var newMarkerCategory = new MarkerCategory({  
                    title: title                    
             });
			 			 
			 newMarkerCategory.save(function (err, user) {
			if(err){
				logger.error('Some Error while saving MarkerCategory' + err );
				res.jsonp({status:"failure",
				message:"Some Error while saving MarkerCategory",
				object:[]}); 
			}
			else{
				logger.info('MarkerCategory Created : ' + title );
				res.jsonp({status:"success",
				message:"MarkerCategory Created",
				object:[]});
				 
			 }
		   
			 });
	}catch (err){
		logger.info('An Exception Has occured in addMarkerCategory method' + err);
	}
}



//Update Marker Category

exports.updateCategoryMarker=function(reqData,res){
	try{
			var markerCategoryId=reqData._id;
			var title=reqData.title;			
			logger.info('LocationController.updateCategoryMarker called  :' + title );						  
			var query = { _id : markerCategoryId };
			// find Marker category by categoryId	 
			MarkerCategory.findOne(query).exec(function(err, markerCategory){
				if (err){
					logger.error('Some Error while finding Marker Category' + err );
					res.status(400).send({status:"failure",
										message:err,
										object:[]
					});
				}
				else{
					if (markerCategory){
						if (title)
						markerCategory.title=title;
						markerCategory.save(function (err, markerCategory){
							if(err){
								logger.error('Some Error while updating markerCategory' + err );
								res.jsonp({status:"failure",
								message:"Error Occured while Updating markerCategory ",
									object:[]}); 	
							}
							else{
								logger.info('Marker Category updated  '  );												
								res.jsonp({status:"success",
								message:"Marker Category Updated!",
									object:markerCategory}); 
							}								 							  
						  });
					}
					else {
						logger.error('No  Such Category found to update ' + err );
						res.status(400).send({status:"failure",
											message:'No  Such Category found to update ' +err,
											object:[]
										});
					}
				}
			});
	}catch (err){
		logger.info('An Exception Has occured in updateCategoryMarker method' + err);
	}
}


//Delete Marker Category

exports.deleteMarkerCategory=function(categoryId,res){
    try {
		
		logger.info('deleteMarkerCategory Method Called for id : '+categoryId);		
		MarkerCategory.remove({ _id: categoryId}, function (err) {
				if (err){
					logger.error('Error Occured while Removing  Marker category :'+ err);
					res.jsonp({status:"failure",
                            message:"Error Occured while removing Marker category",
                            object:[]}); 
				}
				else{
					logger.info('Marker category with id ' +categoryId + ' successfully Removed' );
					res.jsonp({status:"success",
								message:"Marker category successfully Removed!",
								object:[]}); 
				}
				// removed!
		});				                                                
	}catch  (err){
		logger.info ('An Exception occured LocController.deleteCategoryMarker ' + err);
	}	
	
}

