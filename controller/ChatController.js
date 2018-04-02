var NotificationController= require('../controller/PushNotificationController.js');
var User = require('../models/User.js');
var db = require('../config/db');
var ConversationMessages = require('../models/ConversationMessages.js');
var Conversation = require('../models/Conversation.js');
var ConversationUser = require('../models/ConversationUser.js');
var logger = require('../config/lib/logger.js');
require('datejs');
var mongoose = require('mongoose');
//mongoose.Promise = global.Promise;
ObjectId = require('mongodb').ObjectID;
var multer  = require('multer')
var upload = multer({ dest: './public/images/profileImages' })


//mongoose.createConnection(db.url);

exports.userExists =function(phoneNo,callback){
	
	try{
    
    logger.info('UserExists Method Called');
     var query = { phone : phoneNo };
     User.findOne(query).exec(function(err, user){
        if (err){
            logger.error('Some Error while finding user' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (user){
                
                  logger.info('User Found with Phone Num. :' 
                  +phoneNo);
                
                console.log("user found with phone no "+phoneNo);
                callback (user);
            }
            else{
                
                 logger.info('User Not Found with Phone Num. :' 
                  +phoneNo);
                console.log("user not found with phone no "+phoneNo);
                callback( user);
                
            }
       }
     });
    
    logger.info(' Exit UserExists Method');
	}catch(err){
		  logger.info('An Exception Has occured in userExists method' + err);		  
	  }
}
   


exports.findConversation =function(conversationId,callback){
	
	try{
    
    logger.info('findConversation Method Called');
     var query = { _id : conversationId };
     Conversation.findOne(query).exec(function(err,conversation){
        if (err){
            logger.error('Some Error while finding conversation' + err );
            res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
            });
        }
        else{
            if (conversation){
                
                logger.info('conversation Found with Phone Num. :' +conversationId);
                callback (conversation);
            }
            else{
                
                logger.info('conversation Not Found with Phone Num. :' +conversationId);
                callback( conversation);
                
            }
       }
     });
    
    logger.info(' Exit findConversation Method');
	}catch(err){
		  logger.info('An Exception Has occured in findConversation method' + err);		  
	  }
}


exports.chkPreviousIndividualConversation=function(fromMobileNo,toMobileNo,callback){
	
    try{
         //Returns Conversation id if exists else undefined
		logger.info('ChatController.chkPreviousConversation called - toMobileNo : ' + toMobileNo + "- fromMobileNo :"  +fromMobileNo);
    	
		ConversationUser.aggregate([
          {
              $match:{$or: [{ _userMobile: toMobileNo }, { _userMobile: fromMobileNo }]}
          },
          {
              $group: {
				 _id:"$_conversationId",
				count: { $sum: 1 }				  
			  }                                    
          }
		],function (err, ConversationIdsList) {
			logger.info ('Inside function of model.aggregate');
		if (err){
			 logger.info('Error While getting aggregate of converation users'+err);  
		}	
		else if (ConversationIdsList){
				let promiseArr = [];
				var sendBackConversation;
				 
				function chkIndvidualConversation(conversation){
					 
					return new Promise((resolve,reject) => {
						logger.info(  ' checking conversation._id : '+conversation._id	);					
						 if (conversation.count===2){
								Conversation.findOne({_id:(conversation._id)})
								.exec(function(err, conversation){
													
										if (err){
										console.log ( 'An Error Occured before returning Promise' + err);
										reject(error);
										//resolve(1);
										}																	
										if (conversation){
											logger.info(  conversation._id	+ ' found ');	
											if (!conversation.isGroupConversation){
											conversation=conversation.toObject({getters: false});												
											logger.info( conversation._id + " - indivdual Conversation found")
											sendBackConversation=conversation._id;
											resolve(1);														
											}
											else {
											resolve(1);	
											}
												
										}
										else {
											logger.info(  conversation._id	+ ' is null  ');	
											resolve(1);
										}
										
									});
							}	
							else{
								//logger.info(  conversation._id	+ ' count != 2  ');
								resolve(1);
							} 
										   
						});
					}
					logger.info('Conversation List Size :' + ConversationIdsList.length );						 
					 ConversationIdsList.forEach(function(conversation) { 		
							 promiseArr.push(chkIndvidualConversation(conversation));        
					 });
					
					 Promise.all(promiseArr)
						 .then((result)=> {
								logger.info('Sending call back after Promise success, Conversation ID : ' + sendBackConversation );		
								callback(sendBackConversation);
								})
						 .catch(error => {
							 logger.error ('An Error Has Occured : ' + err); 
							 });
		} else {
			logger.info('Conversation List Not Found, Size :' + ConversationIdsList.length );
			callback(null);
		}
    logger.info(' Exit ChatController.chkPreviousConversation Method');					  
     });	 	   
   
	
	}catch(err){
		  logger.info('An Exception Has occured in findConversation method' + err);		  
	  }
	
}



//Create User Groups
exports.createGroup=function(groupData,profilePhotoUrl,res){
    try {
	//var groupObj=JSON.parse(groupData);
	var groupName=groupData.groupName;
	var adminPhone=groupData.adminPhone;
	var obj=JSON.parse(groupData.groupMembersList);
	var conversationUsers=obj.values;

	var conversationId; 
	var newConversationUser;
	
	logger.info('In ChatController.createGroup \n Group Data : ' +groupName + adminPhone + conversationUsers  )
	// Creating New Conversation and Adding Conversation Users	
	if(conversationUsers!==undefined||conversationUsers!==null){
					var newconversation= new Conversation({
						conversationName:groupName,
						adminMobile:adminPhone,
						isGroupConversation:true,
						conversationImageUrl:profilePhotoUrl
					});
                     newconversation.save(function (err, conversation) {
                         if (err) {
							 logger.error('Error Occured while Saving new conversation :'+ err);
							res.jsonp({status:"failure",
							message:"An Error Occured while Creating Group",
							object:[]});
						 }
						if (conversation){
							conversationId=conversation._id;
							logger.info ('Creating Conversation Users against conversation id : '+conversation._id );
				let promiseArr = [];
				
				function createConversationUser(userMobile){	
					return new Promise((resolve,reject) => {
							logger.info ('Creating Conversation User for Phone No' +  userMobile );
							newConversationUser= new ConversationUser({                                          
							_conversationId: conversationId,
							_userMobile: userMobile       
							});
															
							newConversationUser.save(function (err, conversationUser) {
								 if (err){
									 logger.error('Error Occured while Saving new newConversationUser  :'+ err);
									 reject(err);
								 } 
								 if (conversationUser){
									 logger.info ('Conversation User Created for Phone No' +  userMobile );
								 resolve();
								 }
							});
					});
				}                                   
				 conversationUsers.forEach(function(userMobile) {              
						 promiseArr.push(createConversationUser(userMobile));        
				 });
				
				 Promise.all(promiseArr)
					 .then((result)=> res.jsonp({status:"success",
										message:"Group Created",
										object:conversation}))
					 .catch((err)=>res.send({status:"failure",
									   message:"Error Occured while creating Group" + err,
									  object:[]}));

						}
					//logger.info ('Sending room Id To client : ' + conversationId );					
                });
                   
}
	 
    logger.info(' Exit ChatController.createGroup Method');    
	}catch  (err){
		logger.info ('An Exception occured ChatController.createGroup ' + err);
	}
	
}



//Update Group Name

exports.updateGroupName = function(req,callback) {
	try{
 	
	var conversationId = req.body.conversationId;
    var conversationName=req.body.conversationName;
	console.log("In Controller updateGroupName Method");    
    logger.info('ChatController.updateGroupName called for user  :'  + conversationId  );
 
		Conversation.findOne({_id: conversationId})
								.exec(function(err, conversation){
													
										if (err){
										console.log ( 'An Error Occured before returning Promise' + err);
										callback();
										}																	
										if (conversation){
											
											conversation.conversationName=conversationName, 
											conversation.save(function (err, user){
												if(err){
														logger.error('Some Error while updating user' + err );
														 callback();
												}
												else{                            
															logger.info('Group Name updated With ConversationId ' + conversationId );
															callback(conversation);
												}
											});
																		
										}											
										else {
										//logger.info( );	
										callback();
										}
										
								});
 
    logger.info(' Exit ChatController.updateGroupName Method');
	}catch (err){
		logger.info('An Exception Has occured in updateGroupName method' + err);
	}
	
}

//update  Group Photo
exports.updateGroupProfilePhoto=function(conversationId,profilePhotoUrl,callback){
		
	try{
	console.log("In Controller updateGroupProfilePhoto Method");
    
    logger.info('ChatController.updateGroupProfilePhoto called for converation  :'   + conversationId  );
     	Conversation.findOne({_id: conversationId})
								.exec(function(err, conversation){
													
										if (err){
										console.log ( 'An Error Occured before returning Promise' + err);
										callback();
										}																	
										if (conversation){
											
											conversation.conversationImageUrl=profilePhotoUrl, 
											conversation.save(function (err, user){
												if(err){
														logger.error('Some Error while updating user' + err );
														 callback();
												}
												else{                            
															logger.info('Group Profile Photo updated With conversationId' + conversationId );
															callback(conversation);
												}
											});
																		
										}											
										else {
										//logger.info( );	
										callback();
										}
										
									});

    logger.info(' Exit ChatController.updateGroupProfilePhoto Method');
	}catch (err){
		logger.info('An Exception Has occured in updateGroupProfilePhoto method' + err);
	}

}


// close Group

exports.closeGroup=function(req,res){
    try {
		logger.info('closeGroup Method Called ');
		var conversationId=req.body.conversationId;
		console.log ('Conversation id  : '+conversationId);
		
		var arrayOfMembers;		
		let promiseArr = [];
		var query;
		
		//Find Group Members
		 ConversationUser.find({'_conversationId': conversationId}, {_userMobile : true}, function(err, members) {
				if (err){
					logger.info(' Error Occured While Getting conversation Uses : ' + err);
				}				
				else{ 
					logger.info(members.length + ' members Found');
					arrayOfMembers=members;
					if(arrayOfMembers){ 					
					arrayOfMembers.forEach(function(number) {              
						console.log (number._userMobile);

						//sending closed group Notification to all group members
						query = { phone : number._userMobile };						
						User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
								logger.info('User Found For Phone No: ' + number._userMobile );
								var conversationObj ={
										
										conversationId:conversationId	
								}
								logger.info('Sending Notification of closed Group to player id ' + user.palyer_id );
								NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"closedGroup");
							}
							else {
							 logger.info('User not Found For Phone No: ' + number._userMobile );                 
							}                               
						});
							

						//Delete all Conversation Users of closed Group							
						ConversationUser.remove({  _conversationId:conversationId }, function (err) {
							  if (err){
								  logger.error('Error Occured while deleting group members :'+ err);
									
							  } 
							  else{
								  logger.info('Conversation user suuccessfully Removed' );
									
							  }
							  // removed!
							});	
					
					});
				}
				} 
				});
			res.jsonp({status:"success",
			message:"Group Closed Successfully",
			object:[]})

	}catch  (err){
		logger.info ('An Exception occured ChatController.removeGroupMember ' + err);
	}	
	
}

//Add group Members

exports.addGroupMember=function(req,res){
    try {
		logger.info('addGroupMember Method Called');
		var conversationId=req.body.conversationId;
		var groupMembersList =req.body.groupMembersList;
		groupMembersList=JSON.parse(groupMembersList);
		console.log ('Conversation id  : '+conversationId);
		console.log ('groupMembersList : '+groupMembersList);
		
		
		var arrayOfNumbers;
		if (groupMembersList){
			arrayOfNumbers=groupMembersList.values;
			console.log ('arrayOfNumbers : '+ arrayOfNumbers);
		}
			
		var newConversationUser;
        var arrayToSend = [];
		let promiseArr = [];
  
    function addMember(num){
           
        return new Promise((resolve,reject) => {

				newConversationUser= new ConversationUser({                                          
								_conversationId: conversationId, 
								_userMobile: num  
								});
							
				newConversationUser.save(function (err, conversationUser) {
						if (err){
							logger.error('Error Occured while Saving new newConversationUser 1 :'+ err);
							reject(err);
						} 
						if (conversationUser){
							logger.info('Conversation user saved with phoneNo :' +num);
							arrayToSend.push(num);
							resolve();
						}
						else {
							logger.info('Null conversation user found:' +num);
							resolve();
						}
					});                                        
        });
    }                 

		var query = { _id : conversationId };
		Conversation.findOne(query).exec(function(err,conversation){
			if (err){
				logger.error('Some Error while finding conversation' + err );
				res.status(400).send({status:"failure",
									  message:err,
									  object:[]
				});
			}
			else
			if (conversation){ 
				logger.info('conversation Found with Phone Num. :' +conversationId);
				var conversationObj ={
										//fromPhoneNo:userMobileNumberFrom,	
										conversationId:conversation._id, 
										isGroupConversation:conversation.isGroupConversation,
										adminMobile:conversation.adminMobile,
										photoUrl:conversation.conversationImageUrl,
										conversationName:conversation.conversationName,
										createdAt:conversation.createdAt
										
										}
				// send notification of joining group
					var phoneNo;
					var query; 	
				  if (arrayOfNumbers){
					  //arrayOfNumbers=arrayOfNumbers.values;
					for (var i=0; i < arrayOfNumbers.length ; i++){
						 phoneNo=arrayOfNumbers[i];	
						//Sending Push Notiifcation To New Group Members								
						logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
						
						query = { phone : phoneNo };						
						User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
							logger.info('User Found For Phone No: ' + phoneNo );
							logger.info('Sending Notification to player id ' + user.palyer_id );
							NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupConversationRequest");
							}
							else {
							 logger.info('User not Found For Phone No: ' + phoneNo );                 
							}                               
						});
														
					}
								
				arrayOfNumbers.forEach(function(number) {              
					promiseArr.push(addMember(number));        
				 });
				
				 Promise.all(promiseArr)
					 .then((result)=> res.jsonp({status:"success",
									   message:"New Members added to Group",
									  object:arrayToSend}))
					 .catch((err)=>res.send({status:"failure",
									   message:"Error Occured while Adding new member",
									  object:[]}));
				  }
				  else {
					              
					logger.info('No member found to add in conversation : '+conversationId);
						res.jsonp({ status:"failure",
									message:"No members found to add",
									object:arrayToSend});
				  }
				}
			else{               
					logger.info('conversation with conversationId : ' +conversationId + ' is not created or deleted');
						res.jsonp({ status:"failure",
									message:"Converation Not found",
									object:arrayToSend});	 
				}
		   
		 });
    
	}catch  (err){
		logger.info ('An Exception occured ChatController.addGroupMember ' + err);
	}	
	
}





//Add group Members from ios Device
// Remove JSON.parse ()

exports.addGroupMemberFromIOS=function(req,res){
    try {
		logger.info('addGroupMember Method Called');
		var conversationId=req.body.conversationId;
		var groupMembersList =req.body.groupMembersList;
		//groupMembersList=JSON.parse(groupMembersList);
		console.log ('Conversation id  : '+conversationId);
		console.log ('groupMembersList : '+groupMembersList);
		
		
		var arrayOfNumbers;
		if (groupMembersList){
			arrayOfNumbers=groupMembersList.values;
			console.log ('arrayOfNumbers : '+ arrayOfNumbers);
		}
			
		var newConversationUser;
        var arrayToSend = [];
		let promiseArr = [];
  
    function addMember(num){
           
        return new Promise((resolve,reject) => {

				newConversationUser= new ConversationUser({                                          
								_conversationId: conversationId, 
								_userMobile: num  
								});
							
				newConversationUser.save(function (err, conversationUser) {
						if (err){
							logger.error('Error Occured while Saving new newConversationUser 1 :'+ err);
							reject(err);
						} 
						if (conversationUser){
							logger.info('Conversation user saved with phoneNo :' +num);
							arrayToSend.push(num);
							resolve();
						}
						else {
							logger.info('Null conversation user found:' +num);
							resolve();
						}
					});                                        
        });
    }                 

		var query = { _id : conversationId };
		Conversation.findOne(query).exec(function(err,conversation){
			if (err){
				logger.error('Some Error while finding conversation' + err );
				res.status(400).send({status:"failure",
									  message:err,
									  object:[]
				});
			}
			else
			if (conversation){ 
				logger.info('conversation Found with Phone Num. :' +conversationId);
				var conversationObj ={
										//fromPhoneNo:userMobileNumberFrom,	
										conversationId:conversation._id, 
										isGroupConversation:conversation.isGroupConversation,
										adminMobile:conversation.adminMobile,
										photoUrl:conversation.conversationImageUrl,
										conversationName:conversation.conversationName,
										createdAt:conversation.createdAt
										
										}
				// send notification of joining group
					var phoneNo;
					var query; 	
				  if (arrayOfNumbers){
					  //arrayOfNumbers=arrayOfNumbers.values;
					for (var i=0; i < arrayOfNumbers.length ; i++){
						 phoneNo=arrayOfNumbers[i];	
						//Sending Push Notiifcation To New Group Members								
						logger.info('Sending Onesignal Notifcation of groupConversationRequest to '+  phoneNo  );
						
						query = { phone : phoneNo };						
						User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
							logger.info('User Found For Phone No: ' + phoneNo );
							logger.info('Sending Notification to player id ' + user.palyer_id );
							NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"groupConversationRequest");
							}
							else {
							 logger.info('User not Found For Phone No: ' + phoneNo );                 
							}                               
						});
														
					}
								
				arrayOfNumbers.forEach(function(number) {              
					promiseArr.push(addMember(number));        
				 });
				
				 Promise.all(promiseArr)
					 .then((result)=> res.jsonp({status:"success",
									   message:"New Members added to Group",
									  object:arrayToSend}))
					 .catch((err)=>res.send({status:"failure",
									   message:"Error Occured while Adding new member",
									  object:[]}));
				  }
				  else {
					              
					logger.info('No member found to add in conversation : '+conversationId);
						res.jsonp({ status:"failure",
									message:"No members found to add",
									object:arrayToSend});
				  }
				}
			else{               
					logger.info('conversation with conversationId : ' +conversationId + ' is not created or deleted');
						res.jsonp({ status:"failure",
									message:"Converation Not found",
									object:arrayToSend});	 
				}
		   
		 });
    
	}catch  (err){
		logger.info ('An Exception occured ChatController.addGroupMember ' + err);
	}	
	
}





//Delete group Members

exports.removeGroupMember=function(req,res){
    try {
		logger.info('removeGroupMember Method Called');
		console.log ('Conversation id  : '+req.body.conversationId);
		console.log ('groupMembersList : '+ req.body.groupMembersList);
		var conversationId=req.body.conversationId;
		var groupMembersList =req.body.groupMembersList;		
		groupMembersList=JSON.parse(groupMembersList);
		console.log ('groupMembersList  q222: '+groupMembersList);	
		
		var arrayOfNumbers;
		if (groupMembersList){
			arrayOfNumbers=groupMembersList.values;
			console.log ('arrayOfNumbers : '+ arrayOfNumbers);
		}
		let promiseArr = [];
		var phoneNo;
    function removeMember(num){
           
        return new Promise((resolve,reject) => {

						ConversationUser.remove({ _userMobile: num, _conversationId:conversationId }, function (err) {
							  if (err){
								  logger.error('Error Occured while Removing newConversationUser 1 :'+ err);
									reject(err);
							  } 
							  else{
								  logger.info('Conversation user with phoneNo ' +num + ' suuccessfully Removed' );
									resolve();
							  }
							  // removed!
							});	
			                                        
        });
    }                 

		if (arrayOfNumbers){		
			arrayOfNumbers.forEach(function(number) {
						//sending closed group Notification to group members

						logger.info('Group member to delet with PhoneNO : ' + number );
						query = { phone : number };						
						User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
								logger.info('User Found For Phone No: ' + number );
								var conversationObj ={										
										conversationId:conversationId	
								}
								logger.info('Sending Notification of closed Group to player id ' + user.palyer_id );
								NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"closedGroup");
							}
							else {
							 logger.info('User not Found For Phone No: ' + number );                 
							}                               
						});	

				//Promisify				
				promiseArr.push(removeMember(number));        
			});
		}
		 Promise.all(promiseArr)
			 .then((result)=> res.jsonp({status:"success",
							   message:"Members Removed from Group Successfully",
							  object:[]}))
			 .catch((err)=>res.send({status:"failure",
							   message:"Error Occured while Removing members from group",
							  object:[]}));
    
	}catch  (err){
		logger.info ('An Exception occured ChatController.removeGroupMember ' + err);
	}	
	
}



//Delete group Members for IOS device
// Remove JSON.parse ()

exports.removeGroupMemberFromIOS=function(req,res){
    try {
		logger.info('removeGroupMember Method Called');
		console.log ('Conversation id  : '+req.body.conversationId);
		console.log ('groupMembersList : '+ req.body.groupMembersList);
		var conversationId=req.body.conversationId;
		var groupMembersList =req.body.groupMembersList;		
		//groupMembersList=JSON.parse(groupMembersList);
		console.log ('groupMembersList  q222: '+groupMembersList);	
		
		var arrayOfNumbers;
		if (groupMembersList){
			arrayOfNumbers=groupMembersList.values;
			console.log ('arrayOfNumbers : '+ arrayOfNumbers);
		}
		let promiseArr = [];
		var phoneNo;
    function removeMember(num){
           
        return new Promise((resolve,reject) => {

						ConversationUser.remove({ _userMobile: num, _conversationId:conversationId }, function (err) {
							  if (err){
								  logger.error('Error Occured while Removing newConversationUser 1 :'+ err);
									reject(err);
							  } 
							  else{
								  logger.info('Conversation user with phoneNo ' +num + ' suuccessfully Removed' );
									resolve();
							  }
							  // removed!
							});	
			                                        
        });
    }                 

		if (arrayOfNumbers){		
			arrayOfNumbers.forEach(function(number) {
						//sending closed group Notification to group members

						logger.info('Group member to delet with PhoneNO : ' + number );
						query = { phone : number };						
						User.findOne(query).exec(function(err, user){
							if (err){
							 logger.error('Some Error occured while finding user' + err );
							 }
							if (user){
								logger.info('User Found For Phone No: ' + number );
								var conversationObj ={										
										conversationId:conversationId	
								}
								logger.info('Sending Notification of closed Group to player id ' + user.palyer_id );
								NotificationController.sendNotifcationToPlayerId(user.palyer_id,conversationObj,"closedGroup");
							}
							else {
							 logger.info('User not Found For Phone No: ' + number );                 
							}                               
						});	

				//Promisify				
				promiseArr.push(removeMember(number));        
			});
		}
		 Promise.all(promiseArr)
			 .then((result)=> res.jsonp({status:"success",
							   message:"Members Removed from Group Successfully",
							  object:[]}))
			 .catch((err)=>res.send({status:"failure",
							   message:"Error Occured while Removing members from group",
							  object:[]}));
    
	}catch  (err){
		logger.info ('An Exception occured ChatController.removeGroupMember ' + err);
	}	
	
}


// List of All Groups
exports.findAllGroups=function(callback){
	try{
     logger.info ('In ChatController.findAllGroups ' ); 
    //query with mongoose
   Conversation.find({'isGroupConversation': true}, function(err, groups) {
    if (err){
         res.status(400).send({status:"failure",
                                  message:err,
                                  object:[]
                                });
    }
    
    else{ 
        logger.info(groups.length + ' groups Found');
        callback(groups);
        
    } 
    });
	logger.info ('Exit ChatController.findAllGroups ' );
	}catch(err){
		  logger.info('An Exception Has occured in findAllGroups method' + err);		  
	  }
}

//List all of members of a group
exports.findConversationMembers=function(conversationId,callback){
	try{
		
		 logger.info ('In ChatController.findConversationMembers ' ); 
	 
	 //findConversation(conversationId , function (conversation){
		// if (conversation){
			 
							 //query with mongoose
			   ConversationUser.find({'_conversationId': conversationId}, function(err, members) {
				if (err){
					callback(null);
					logger.info(' Error Occured While Getting conversation Uses : ' + err);
				}
				
				else{ 
					logger.info(members.length + ' members Found');
					callback(members);
					
				} 
				});
		// }	 }); 
		
	}catch (err){
		logger.info('An Exception Has occured in findConversationMembers method' + err);
	}
    

}

														/*****************************/
	

            
